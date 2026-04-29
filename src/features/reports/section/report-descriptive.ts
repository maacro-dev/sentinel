import { DescriptiveAnalyticsData } from "@/features/analytics/types";
import { ReportBuilder } from "../builder";
import { safeNumber, addKeyValueTable } from "../utils";
import { ProvinceYieldNode } from "@/features/analytics/schemas/yieldByProvince";

export function descriptiveReport(
  builder: ReportBuilder,
  data: DescriptiveAnalyticsData | null,
  hierarchicalYields?: ProvinceYieldNode[] | null
) {
  if (hierarchicalYields && hierarchicalYields.length > 0) {
    const provinceRows = hierarchicalYields.map((p) => [
      p.province ?? '-',
      p.avg_yield_t_per_ha.toFixed(2),
    ]);
    builder.addTable(
      ['Province', 'Avg Yield (t/ha)'],
      provinceRows,
      'Province Yields'
    );
  }


  if (data?.cropMethodSummary) {
    const method = data.cropMethodSummary;
    addKeyValueTable(builder, 'Crop Establishment Method', [
      ['Direct-seeded', `${safeNumber(method.direct_seeded_count)} fields`],
      ['Transplanted', `${safeNumber(method.transplanted_count)} fields`],
      ['Percent Difference', `${safeNumber(method.percent_difference)} %`],
    ]);
  }

  if (data?.riceVarietySummary) {
    const variety = data.riceVarietySummary;
    addKeyValueTable(builder, 'Rice Variety Distribution', [
      ['NSIC', `${safeNumber(variety.nsic_count)} fields`],
      ['PSB', `${safeNumber(variety.psb_count)} fields`],
      ['Others', `${safeNumber(variety.other_count)} fields`],
      ['Dominant', variety.dominant ?? '-'],
    ]);
  }
}
