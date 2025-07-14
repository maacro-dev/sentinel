import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table
} from "@/components/ui/table";
import { Field } from "@/lib/types";
import { fieldsQueryOptions } from "@/queries";
import { createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table";
import { IdCard, } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const Route = createFileRoute("/_manager/monitored_fields")({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(fieldsQueryOptions);
    return null;
  },
  head: () => ({
    meta: [{ title: "Monitored Fields | Humay" }],
  }),
  staticData: {
    routeFor: "data_manager",
    label: "Fields",
    icon: IdCard,
    group: "Overview",
    navItemOrder: 3,
  },
});

function RouteComponent() {
  const [globalFilter, setGlobalFilter] = useState<any>([])

  const { data: fields } = useSuspenseQuery(fieldsQueryOptions);
  const table = useReactTable({
    data: fields,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    onGlobalFilterChange: setGlobalFilter,
    state: {
      globalFilter,
    },
  })



  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Fields</h1>
      <Input className='mb-4' placeholder="Search mfid, farmer, or address" onChange={e => table.setGlobalFilter(e.target.value)} />
      <ScrollArea className="h-96 md:h-[32rem] rounded-md border table-fixed">
        <Table className="w-full table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id} className="text-muted-foreground text-xs">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}


const columnHelper = createColumnHelper<Field>();

const columns = [
  columnHelper.accessor('mfid', {
    cell: (info) => info.getValue(),
    header: () => 'MFID',
  }),
  columnHelper.accessor(r => r.farmer_first_name + ' ' + r.farmer_last_name, {
    id: 'farmer',
    cell: (info) => info.getValue(),
    header: () => 'Farmer',
  }),
  columnHelper.accessor('barangay', {
    cell: (info) => info.getValue(),
    header: () => 'Barangay',
  }),
  columnHelper.accessor('municipality', {
    cell: (info) => info.getValue(),
    header: () => 'Municipality',
  }),
  columnHelper.accessor('province', {
    cell: (info) => info.getValue(),
    header: () => 'Province',
  }),
]
