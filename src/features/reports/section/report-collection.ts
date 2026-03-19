import { Sanitizer } from "@/core/utils/sanitizer";
import { ReportBuilder } from "../builder";
import { addKeyValueTable } from "../utils";
import { FormCountSummary } from "@/features/analytics/schemas/summary/formCount";

const statusDisplayLabels: Record<string, string> = {
  approved: "Approved",
  rejected: "Rejected",
  pending: "Pending",
  unknown: "Imported"
};

export function dataCollectionReport(
  builder: ReportBuilder,
  progressData: any,
  countData: FormCountSummary | null
) {
  if (progressData) {
    const progressStats = progressData.data ?? [];
    if (progressStats.length) {
      addKeyValueTable(builder, 'Form Progress', progressStats.map((s: any) => [
        Sanitizer.key(s.label ?? s.name),
        `${s.current_value ?? s.value ?? 0}${s.unit ? ` ${s.unit}` : ''}`,
      ]));
    }
  }

  if (countData) {
    const forms = countData.data;
    const statuses = ['approved', 'rejected', 'pending', 'unknown'] as const;

    const headers = ['Form Type', ...statuses.map(s => statusDisplayLabels[s])];
    const rows: (string | number)[][] = [];

    for (const [form, counts] of Object.entries(forms)) {
      const row: (string | number)[] = [Sanitizer.key(form)];
      for (const status of statuses) {
        row.push(counts[status]);
      }
      rows.push(row);
    }

    builder.addTable(headers, rows, 'Form Counts by Status', [30, 17.5, 17.5, 17.5, 17.5]);
  }
}
