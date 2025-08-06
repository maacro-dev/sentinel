import { UnitCell } from "@/core/components/cells/UnitCell";
import { ColumnDef } from "@tanstack/react-table";
import { FormDataEntry } from "../schemas/formData";
import { Calc } from "@/features/fields/services/Calc";
import { defaultColumns } from "./defaults";

export const productionColumns: ColumnDef<FormDataEntry, any>[] = [
  ...defaultColumns,
  {
    id: 'yield',
    accessorFn: (row) => Calc.yield({
      areaHarvested: row.form_data.area_harvested,
      avgBagWeightKg: row.form_data.avg_bag_weight_kg,
      bagsHarvested: row.form_data.bags_harvested
    }),
    header: 'Applied Area',
    cell: (info) => <UnitCell value={info.getValue()} unit="kg/ha" />,
    meta: { size: '2xs' }
  },
]
