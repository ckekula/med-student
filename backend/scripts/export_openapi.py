"""Exports the FastAPI app's OpenAPI schema to a JSON file for frontend codegen.

Run from inside the backend container, so the import uses the same code and
.env as what's actually deployed:

    docker compose exec backend python scripts/export_openapi.py

Or locally from anywhere, provided your .env is present in the backend/
project root (pydantic-settings' required fields, e.g. POSTGRES_PASSWORD,
must resolve or the import below fails before it gets near OpenAPI):

    python backend/scripts/export_openapi.py

Writes openapi.json next to this script's parent (the project root). Re-run
it, then re-run the frontend's `npm run api:types`, any time a request or
response model or enum changes.
"""

import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

# `python scripts/export_openapi.py` only puts this script's own directory on
# sys.path, not the project root next to it — so without this, `app` isn't
# importable regardless of your current directory when you run it.
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Import your FastAPI() instance. Adjust this line if `app` isn't created in
# app/main.py — e.g. `from app.asgi import api as app`.
try:
    from app.main import app
except ImportError as exc:
    sys.exit(
        "Could not import `app` from app.main.\n"
        "Edit the import at the top of this script to point at wherever "
        "FastAPI() is actually instantiated in your project.\n"
        f"Original error: {exc}"
    )

OUTPUT_PATH = PROJECT_ROOT / "openapi.json"


def main() -> None:
    schema = app.openapi()
    OUTPUT_PATH.write_text(json.dumps(schema, indent=2))
    schema_count = len(schema.get("components", {}).get("schemas", {}))
    print(f"Wrote {OUTPUT_PATH} ({schema_count} schemas).")


if __name__ == "__main__":
    main()
