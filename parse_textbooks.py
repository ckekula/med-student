"""
Parse medical textbook PDFs into structured, hierarchical JSON with extracted images.

Uses LlamaParse (Agentic Plus-equivalent tier) to recover chapter -> section ->
subsection -> paragraph structure and extracts embedded figures to disk.

Setup:
    pip install llama-cloud-services
    export LLAMA_CLOUD_API_KEY="llx-..."

Usage:
    python parse_textbooks.py --input ./pdfs --output ./output

Output layout:
    output/
      <book_name>/
        structure.json   # chapter/section/paragraph/image metadata
        images/           # extracted figures referenced by structure.json
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import re
import sys
import time
from pathlib import Path
from typing import Any

from llama_cloud_services import LlamaParse

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("textbook_parser")

MAX_RETRIES = 3
RETRY_BACKOFF_SECONDS = 5

# Heading level 1 => chapter, level 2 => section, level 3+ => subsection.
CHAPTER_HEADING_LEVEL = 1
SECTION_HEADING_LEVEL = 2


def build_parser(api_key: str) -> LlamaParse:
    """Configure the LlamaParse client for maximum-fidelity structured parsing."""
    return LlamaParse(
        api_key=api_key,
        result_type="json",
        parse_mode="parse_document_with_agent",  # Agentic Plus-equivalent tier
        take_screenshot=False,
        num_workers=1,
        verbose=True,
    )


def parse_with_retry(parser: LlamaParse, pdf_path: Path) -> dict[str, Any]:
    """Parse a single PDF, retrying transient failures with backoff."""
    last_exc: Exception | None = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logger.info("Parsing %s (attempt %d/%d)", pdf_path.name, attempt, MAX_RETRIES)
            result = parser.get_json_result(str(pdf_path))
            return result[0]
        except Exception as exc:  # noqa: BLE001 - broad by design, we retry any transient failure
            last_exc = exc
            logger.warning("Attempt %d failed for %s: %s", attempt, pdf_path.name, exc)
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_BACKOFF_SECONDS * attempt)
    raise RuntimeError(f"Failed to parse {pdf_path} after {MAX_RETRIES} attempts") from last_exc


def save_images(parser: LlamaParse, json_result: dict[str, Any], images_dir: Path) -> dict[str, str]:
    """Download every image referenced in the parse result to `images_dir`.

    Returns a mapping of image name -> relative file path so the hierarchy
    builder can attach the correct image file to the correct section.
    """
    images_dir.mkdir(parents=True, exist_ok=True)
    image_nodes = parser.get_images([json_result], download_path=str(images_dir))

    name_to_path: dict[str, str] = {}
    for node in image_nodes:
        name = node.get("name") or node.get("image_name")
        if not name:
            continue
        name_to_path[name] = (images_dir / name).as_posix()

    logger.info("Saved %d image(s) to %s", len(name_to_path), images_dir)
    return name_to_path


def split_paragraphs(text: str) -> list[str]:
    """Split a text block into paragraphs on blank lines."""
    if not text:
        return []
    raw_paragraphs = re.split(r"\n\s*\n", text.strip())
    return [p.strip().replace("\n", " ") for p in raw_paragraphs if p.strip()]


def _new_section(title: str, level: int) -> dict[str, Any]:
    return {"title": title, "level": level, "paragraphs": [], "images": [], "subsections": []}


def _new_subsection(title: str, level: int) -> dict[str, Any]:
    return {"title": title, "level": level, "paragraphs": [], "images": []}


def build_hierarchy(json_result: dict[str, Any], image_paths: dict[str, str]) -> list[dict[str, Any]]:
    """Walk the flat list of page items (headings, text, images) and
    reconstruct a chapter -> section -> subsection -> paragraph tree.
    """
    chapters: list[dict[str, Any]] = []
    current_chapter: dict[str, Any] | None = None
    current_section: dict[str, Any] | None = None
    current_subsection: dict[str, Any] | None = None

    def ensure_chapter() -> dict[str, Any]:
        nonlocal current_chapter
        if current_chapter is None:
            current_chapter = {"title": "Untitled chapter", "sections": []}
            chapters.append(current_chapter)
        return current_chapter

    def ensure_section() -> dict[str, Any]:
        nonlocal current_section
        chapter = ensure_chapter()
        if current_section is None:
            current_section = _new_section("Untitled section", SECTION_HEADING_LEVEL)
            chapter["sections"].append(current_section)
        return current_section

    def current_text_target() -> dict[str, Any]:
        return current_subsection if current_subsection is not None else ensure_section()

    for page in json_result.get("pages", []):
        page_number = page.get("page")

        for item in page.get("items", []):
            item_type = item.get("type")

            if item_type == "heading":
                level = item.get("level", 1)
                title = (item.get("value") or item.get("md", "")).lstrip("# ").strip()

                if level <= CHAPTER_HEADING_LEVEL:
                    current_chapter = {"title": title, "sections": []}
                    chapters.append(current_chapter)
                    current_section = None
                    current_subsection = None
                elif level == SECTION_HEADING_LEVEL:
                    chapter = ensure_chapter()
                    current_section = _new_section(title, level)
                    chapter["sections"].append(current_section)
                    current_subsection = None
                else:
                    section = ensure_section()
                    current_subsection = _new_subsection(title, level)
                    section["subsections"].append(current_subsection)

            elif item_type == "text":
                text = item.get("value") or item.get("md", "")
                target = current_text_target()
                for paragraph_text in split_paragraphs(text):
                    target["paragraphs"].append({"text": paragraph_text, "page": page_number})

            elif item_type == "image":
                name = item.get("name")
                target = current_text_target()
                target["images"].append(
                    {
                        "name": name,
                        "path": image_paths.get(name) if name else None,
                        "page": page_number,
                        "caption": item.get("caption"),
                    }
                )

        # Some parse configurations report images at the page level instead
        # of (or in addition to) inline "image" items. Merge without duplicating.
        for img in page.get("images") or []:
            name = img.get("name")
            target = current_text_target()
            if any(existing["name"] == name for existing in target["images"]):
                continue
            target["images"].append(
                {
                    "name": name,
                    "path": image_paths.get(name) if name else None,
                    "page": page_number,
                    "caption": None,
                }
            )

    return chapters


def process_pdf(parser: LlamaParse, pdf_path: Path, output_root: Path) -> None:
    book_name = pdf_path.stem
    book_output_dir = output_root / book_name
    images_dir = book_output_dir / "images"

    json_result = parse_with_retry(parser, pdf_path)

    book_output_dir.mkdir(parents=True, exist_ok=True)
    raw_path = book_output_dir / "raw_result.json"
    with raw_path.open("w", encoding="utf-8") as f:
        json.dump(json_result, f, indent=2, ensure_ascii=False)
    logger.info("Wrote raw parse result to %s", raw_path)

    image_paths = save_images(parser, json_result, images_dir)
    chapters = build_hierarchy(json_result, image_paths)

    output = {
        "book": book_name,
        "source_file": pdf_path.name,
        "chapters": chapters,
    }

    book_output_dir.mkdir(parents=True, exist_ok=True)
    structure_path = book_output_dir / "structure.json"
    with structure_path.open("w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    logger.info("Wrote structured output to %s", structure_path)


def main() -> None:
    arg_parser = argparse.ArgumentParser(description="Parse medical textbook PDFs into structured JSON.")
    arg_parser.add_argument("--input", required=True, type=Path, help="Directory containing input PDFs")
    arg_parser.add_argument("--output", required=True, type=Path, help="Directory to write output into")
    args = arg_parser.parse_args()

    api_key = os.environ.get("LLAMA_CLOUD_API_KEY")
    if not api_key:
        logger.error("LLAMA_CLOUD_API_KEY environment variable is not set.")
        sys.exit(1)

    if not args.input.is_dir():
        logger.error("Input directory does not exist: %s", args.input)
        sys.exit(1)

    pdf_files = sorted(args.input.glob("*.pdf"))
    if not pdf_files:
        logger.error("No PDF files found in %s", args.input)
        sys.exit(1)

    args.output.mkdir(parents=True, exist_ok=True)
    llama_parser = build_parser(api_key)

    failures: list[str] = []
    for pdf_path in pdf_files:
        try:
            process_pdf(llama_parser, pdf_path, args.output)
        except Exception as exc:  # noqa: BLE001 - log and continue with remaining books
            logger.error("Failed to process %s: %s", pdf_path.name, exc)
            failures.append(pdf_path.name)

    if failures:
        logger.error("Completed with %d failure(s): %s", len(failures), ", ".join(failures))
        sys.exit(1)

    logger.info("All %d document(s) processed successfully.", len(pdf_files))


if __name__ == "__main__":
    main()