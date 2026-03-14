import { formSchemas } from "@/features/forms/schemas/import-schema";
import { Form } from "@/features/forms/schemas/forms";
import { FileError, ImportIssue, ImportRow, ValidationContext } from "../types";
import { findSeasonId } from "@/features/fields/util";
import { SeasonRow } from "@/features/fields/schemas/seasons";
import { findBestLocationMatch } from "@/features/mfid/hooks/useLgu";
import { parseNameParts } from "@/features/forms/utils";

export function validateFileCompatibility(data: ImportRow[], datasetType: Form): FileError {
  const schema = formSchemas[datasetType];
  if (!schema) return { message: "Unknown dataset type" };

  const headers = data.length > 0 ? Object.keys(data[0]) : [];
  if (headers.length === 0) return { message: "The CSV file appears to be empty or has no headers." };

  let requiredFields: string[];
  if (datasetType === 'fertilization_records') {
    // think about excess fields in the future...

    requiredFields = [
      'province',
      'municity',
      'barangay',
      'mfid',
      'first_name',
      'last_name',
      'applied_area_sqm',
      'collected_at',
      'collected_by',
      'fertilizer_type_1',
      'brand_1',
      'nitrogen_content_pct_1',
      'phosphorus_content_pct_1',
      'potassium_content_pct_1',
      'amount_applied_1',
      'amount_unit_1',
      'crop_stage_on_application_1'
    ];
  } else {
    requiredFields = Object.keys(schema.shape);
  }

  const missingFields = requiredFields.filter((field) => !headers.includes(field));
  if (missingFields.length > 0) {
    return {
      message: `The selected file is missing required columns for ${datasetType}.`,
      missingColumns: missingFields,
    };
  }
  return null;
}


export function validateRow(
  row: ImportRow,
  rowIndex: number,
  context: ValidationContext
): { parsed?: ImportRow; issues: ImportIssue[] } {

  const issues: ImportIssue[] = [];

  // schema validation
  const schemaResult = context.schema.safeParse(row);
  if (!schemaResult.success) {
    schemaResult.error.issues.forEach((issue) => {
      issues.push({
        value: row[issue.path[0] as string],
        row: rowIndex,
        col: issue.path.join("."),
        message: issue.message,
        level: "error",
      });
    });
    return { issues };
  }
  const baseData = schemaResult.data;

  // season validation
  const dateForSeason = baseData.collected_at as string;
  if (!dateForSeason) {
    issues.push({
      value: null,
      row: rowIndex,
      col: "season",
      message: "Missing date for season determination",
      level: "error",
    });
    return { issues };
  }
  const seasonId = findSeasonId(dateForSeason, context.seasons as SeasonRow[]);
  if (!seasonId) {
    issues.push({
      value: dateForSeason,
      row: rowIndex,
      col: "season",
      message: "Date does not fall within any defined season",
      level: "error",
    });
    return { issues };
  }

  // duplicate check
  const mfid = baseData.mfid as string;
  const duplicateKey = `${mfid}|${seasonId}`;
  if (context.duplicateMap.get(duplicateKey)) {
    issues.push({
      value: `${mfid} in season ${seasonId}`,
      row: rowIndex,
      col: "duplicate",
      message: "An activity of this type already exists for this MFID and season",
      level: "error",
    });
    return { issues };
  }

  const locationMatch = findBestLocationMatch(
    baseData.province as string,
    baseData.municity as string,
    baseData.barangay as string,
    context.locations
  );
  if (!locationMatch) {
    issues.push({
      value: `${baseData.province}, ${baseData.municity}, ${baseData.barangay}`,
      row: rowIndex,
      col: "location",
      message: "No matching province/municipality/barangay found",
      level: "error",
    });
    return { issues };
  }

  // add warnings for fuzzy-matched fields
  if (!locationMatch.matchedFields.province) {
    issues.push({
      value: baseData.province,
      row: rowIndex,
      col: "province",
      message: `Matched to "${locationMatch.province}"`,
      level: "warning",
    });
  }
  if (!locationMatch.matchedFields.municity) {
    issues.push({
      value: baseData.municity,
      row: rowIndex,
      col: "municity",
      message: `Matched to "${locationMatch.municity}"`,
      level: "warning",
    });
  }
  if (!locationMatch.matchedFields.barangay) {
    issues.push({
      value: baseData.barangay,
      row: rowIndex,
      col: "barangay",
      message: `Matched to "${locationMatch.barangay}"`,
      level: "warning",
    });
  }

  // name parsing for collected_by
  let collectedByValue = baseData.collected_by;
  if (baseData.collected_by !== "N/A") {
    const { first, last, warning } = parseNameParts(baseData.collected_by as string);
    if (!first || !last) {
      issues.push({
        value: baseData.collected_by,
        row: rowIndex,
        col: "collected_by",
        message: warning || "Invalid name format",
        level: "error",
      });
      return { issues };
    }
    if (warning) {
      issues.push({
        value: baseData.collected_by,
        row: rowIndex,
        col: "collected_by",
        message: warning,
        level: "warning",
      });
    }
    collectedByValue = { original: baseData.collected_by, first, last };
  } else {
    collectedByValue = null;
  }

  // build final parsed row
  const parsedRow = {
    ...baseData,
    province: locationMatch.province,
    municity: locationMatch.municity,
    barangay: locationMatch.barangay,
    barangay_id: locationMatch.id,
    collected_by: collectedByValue,
    season_id: seasonId,
  };

  console.log(`Row ${rowIndex}: date='${dateForSeason}' → seasonId=${seasonId}`);

  return { parsed: parsedRow, issues };
}
