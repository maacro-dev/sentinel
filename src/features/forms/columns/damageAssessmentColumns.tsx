import { ColumnDef } from "@tanstack/react-table";
import { FormDataEntry } from "../schemas/formData";
import { Sanitizer } from "@/core/utils/sanitizer";
import { defaultColumns } from "./defaults";

export const damageAssessmentColumns: ColumnDef<FormDataEntry, any>[] = [
  ...defaultColumns,
  {
    accessorKey: 'form_data.cause',
    header: 'Cause',
    cell: (info) => Sanitizer.key(info.getValue()),
    meta: { size: '2xs' }
  },
]
