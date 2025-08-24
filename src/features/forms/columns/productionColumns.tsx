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
      areaHarvested: row.activity.formData.area_harvested,
      avgBagWeightKg: row.activity.formData.avg_bag_weight_kg,
      bagsHarvested: row.activity.formData.bags_harvested
    }),
    header: 'Applied Area',
    cell: (info) => <UnitCell value={info.getValue()} unit="kg/ha" />,
    meta: { size: '2xs' }
  },
]
