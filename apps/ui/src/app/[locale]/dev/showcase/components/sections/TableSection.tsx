import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function TableSection() {
  return (
    <div className="flex flex-col gap-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Item A</TableCell>
            <TableCell>1</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Item B</TableCell>
            <TableCell>2</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Item C</TableCell>
            <TableCell>3</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
