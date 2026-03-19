import { DescriptiveAnalyticsData } from "@/features/analytics/types";
import { ReportBuilder } from "../builder";
import { safeNumber, addKeyValueTable } from "../utils";

export function descriptiveReport(builder: ReportBuilder, data: DescriptiveAnalyticsData) {
  if (data?.provinceYields?.length) {
    builder.addTable(['Province', 'Avg Yield (t/ha)'],
      data.provinceYields.map((p: any) => [p.province ?? '-', safeNumber(p.avg_yield_t_per_ha)]),
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
