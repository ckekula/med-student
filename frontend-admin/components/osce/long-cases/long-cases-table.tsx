import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { LongCase } from "@/types/osce/longCase";
import { LongCaseRow } from "./long-case-row";

export function LongCasesTable({ longCases }: { longCases: LongCase[] }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Specialty</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {longCases.map((longCase) => (
            <LongCaseRow key={longCase.id} longCase={longCase} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
