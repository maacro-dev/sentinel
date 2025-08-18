import { VerificationStatusCell } from "@/core/components/cells/VerificationStatusCell";
import { ColumnDef } from "@tanstack/react-table";
import { FormDataEntry } from "../schemas/formData";
import { SemesterCell } from "@/core/components/cells/SemesterCell";
import { Sanitizer } from "@/core/utils/sanitizer";


export const defaultColumns: ColumnDef<FormDataEntry, any>[] = [
  {
    accessorKey: 'verification_status',
    header: 'Status',
    cell: (info) => <VerificationStatusCell value={info.getValue()} />,
    meta: { size: '3xs' }
  },
  { accessorKey: 'mfid', header: 'MFID', meta: { size: '2xs' } },
  { accessorKey: 'municipality', header: 'Municipality', meta: { size: 'xs' } },
  { accessorKey: 'barangay', header: 'Barangay', meta: { size: 'xs' } },
  { accessorKey: 'season_year', header: 'Year', meta: { size: '2xs' } },
  {
    accessorKey: 'semester',
    header: 'Semester',
    cell: (info) => <SemesterCell value={info.getValue()} />,
    meta: { size: '2xs' }
  },
  {
    accessorKey: 'synced_at',
    header: 'Synced At',
    cell: (info) => Sanitizer.value(info.getValue()),
    meta: { size: '3xs' }
  },
]
