import { Form } from "@/features/forms/schemas/forms";
import { formSchemas } from "@/features/forms/schemas/import-schema";
import { useMutation } from "@tanstack/react-query";
import Papa from "papaparse";
import { useEffect, useMemo, useState } from "react";
import { Import } from "../services/Import";
import { ImportToasts } from "../toastMessages";
import { useToast } from "@/features/toast";
import { getActivityType } from "@/features/forms/utils";
import { useAllBarangaysWithLocation } from "@/features/mfid/hooks/useLgu";
import { useSeasons } from "@/features/fields/hooks/useSeasons";
import { findSeasonId } from "@/features/fields/util";
import { useCheckDuplicates } from "@/features/mfid/hooks/useCheckDuplicates";
import { ImportRow, ImportIssue, FileError, ValidationContext } from "../types";
import { validateFileCompatibility, validateRow } from "../util/validate";

export function useImport(initialDataset?: Form) {
  const { notifyLoading, notifySuccess, notifyError } = useToast();

  const [datasetType, setDatasetType] = useState<Form | null>(initialDataset || null);
  const [rawData, setRawData] = useState<ImportRow[]>([]);
  const [parsedData, setParsedData] = useState<ImportRow[]>([]);
  const [issues, setIssues] = useState<ImportIssue[]>([]);
  const [fileError, setFileError] = useState<FileError>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: locations = [], isLoading: locationsLoading } = useAllBarangaysWithLocation();
  const { data: seasons = [], isLoading: seasonsLoading } = useSeasons();

  const rowsForDuplicateCheck = useMemo(() => {
    if (!rawData.length || !seasons.length || !datasetType) return [];
    return rawData
      .map((row) => {
        const dateField = row.collected_at as string;
        const seasonId = findSeasonId(dateField, seasons);
        return seasonId ? { mfid: row.mfid as string, season_id: seasonId } : null;
      })
      .filter(Boolean) as Array<{ mfid: string; season_id: number }>;
  }, [rawData, seasons, datasetType]);

  const { data: duplicateMap = new Map(), isLoading: duplicatesLoading } = useCheckDuplicates(
    getActivityType(datasetType!!),
    rowsForDuplicateCheck
  );

  const isContextLoading = locationsLoading || seasonsLoading || duplicatesLoading;

  useEffect(() => {
    setParsedData([]);
    setIssues([]);
    setFileError(null);
  }, [datasetType]);

  useEffect(() => {
    if (!isContextLoading && rawData.length && datasetType) {
      const schema = formSchemas[datasetType];
      if (schema) {
        const context: ValidationContext = { locations, seasons, duplicateMap, schema };
        const { parsed, issues: newIssues } = parseAllRows(rawData, context);
        setParsedData(parsed);
        setIssues(newIssues);
      }
      setIsProcessing(false);
    }
  }, [rawData, locations, seasons, duplicateMap, datasetType, isContextLoading]);

  const datasetSeasonId = useMemo(() => {
    if (!parsedData.length) return null;
    return parsedData[0].season_id ?? null;
  }, [parsedData]);

  const importMutation = useMutation({
    mutationKey: ["import", datasetType] as const,
    mutationFn: ({ datasetType, data, fileName }: { datasetType: Form; data: ImportRow[]; fileName: string }) => Import.create(datasetType, data, fileName),
    onMutate: () => notifyLoading(ImportToasts.creating),
    onSuccess: (response, _variables, toastId) =>
      notifySuccess({
        id: toastId,
        message: ImportToasts.created.message,
        description: response.message || ImportToasts.created.description,
      }),
    onError: (_error, _variables, toastId) =>
      notifyError({ id: toastId, ...ImportToasts.createFailed }),
  });

  const transformFertilizationRecords = (rows: ImportRow[]): ImportRow[] => {
    return rows.map((row, idx) => {
      const fertilizer_applications = [];
      let i = 1;
      while (row[`brand_${i}`] !== undefined) {
        const app = {
          fertilizer_type: row[`fertilizer_type_${i}`],
          brand: row[`brand_${i}`],
          nitrogen_content_pct: row[`nitrogen_content_pct_${i}`],
          phosphorus_content_pct: row[`phosphorus_content_pct_${i}`],
          potassium_content_pct: row[`potassium_content_pct_${i}`],
          amount_applied: row[`amount_applied_${i}`],
          amount_unit: row[`amount_unit_${i}`],
          crop_stage_on_application: row[`crop_stage_on_application_${i}`],
        };
        // only push if at least one field has a non‑empty value
        // since we validated initially if a field in fertilizer_applications has a non-empty value
        const hasData = Object.values(app).some(v => v != null && v !== '');
        if (hasData) {
          fertilizer_applications.push(app);
        }
        i++;
      }

      if (fertilizer_applications.length === 0) {
        console.warn(`Row ${idx} has no fertilizer applications. Row data:`, row);
      }

      const {
        province,
        municity,
        barangay,
        mfid,
        first_name,
        last_name,
        applied_area_sqm,
        collected_at,
        collected_by,
      } = row;

      const transformed = {
        province,
        municity,
        barangay,
        mfid,
        first_name,
        last_name,
        applied_area_sqm,
        collected_at,
        collected_by,
        fertilizer_applications,
      };

      if (!('fertilizer_applications' in transformed)) {
        console.error('fertilizer_applications missing in transformed row', transformed);
      }

      return transformed;
    });
  };

  const importFn = (data: ImportRow[], fileName: string) => {
    if (!datasetType) return Promise.reject("No dataset selected");

    let dataToSend = data;
    if (datasetType === 'fertilization_records') {
      dataToSend = transformFertilizationRecords(data);
      console.log('Single row to send example', JSON.stringify(dataToSend[0], null, 2));
    }

    return importMutation.mutateAsync({ datasetType, data: dataToSend, fileName });
  };


  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !datasetType) return;

    Papa.parse(file, {
      header: true,
      complete: (result) => {
        const data = result.data as ImportRow[];
        console.log("raw data =", data);

        const compatibilityError = validateFileCompatibility(data, datasetType);
        if (compatibilityError) {
          setFileError(compatibilityError);
          e.target.value = "";
          return;
        }


        setFileError(null);
        setFileName(file.name);
        setRawData(data);
        setIsProcessing(true);
      },
    });
  };

  const reset = () => {
    setRawData([]);
    setParsedData([]);
    setIssues([]);
    setDatasetType(null);
    setFileError(null);
    setFileName("");
    setIsProcessing(false);
    importMutation.reset();
  };

  return {
    datasetType,
    setDatasetType,
    rawData,
    parsedData,
    datasetSeasonId,
    issues,
    fileError,
    fileName,
    handleFiles,
    isProcessing,
    reset,

    importFn,
    isImporting: importMutation.isPending,
    importError: importMutation.error,
    importSuccess: importMutation.isSuccess,
    importReset: importMutation.reset,
  };
}



function parseAllRows(
  rows: ImportRow[],
  context: ValidationContext
): { parsed: ImportRow[]; issues: ImportIssue[] } {

  console.log("Trying to parse rows =", rows)

  const issues: ImportIssue[] = [];
  const parsed: ImportRow[] = [];
  const seenKeys = new Set<string>();
  const seasonSet = new Set<number>();

  const seasonDetails: Map<number, Array<{ index: number; mfid: string; collected_at: string; seasonId: number }>> = new Map();

  rows.forEach((row, index) => {

    const result = validateRow(row, index, context);

    if (result.parsed) {
      const seasonId = result.parsed.season_id;
      const mfid = result.parsed.mfid as string;
      const collected_at = result.parsed.collected_at as string;

      if (typeof seasonId === "number") {
        seasonSet.add(seasonId);
        // Store details for logging
        if (!seasonDetails.has(seasonId)) {
          seasonDetails.set(seasonId, []);
        }
        seasonDetails.get(seasonId)!.push({
          index,
          mfid,
          collected_at,
          seasonId,
        });
      }

      const key = `${mfid}|${seasonId}`;
      if (seenKeys.has(key)) {
        issues.push({
          row: index,
          col: "duplicate",
          message: "This MFID and season combination appears more than once in the file.",
          level: "error",
          value: `${mfid} in season ${seasonId}`,
        });

        return;
      }
      seenKeys.add(key);
    }

    if (result.issues.length > 0) {
      issues.push(...result.issues);

      if (result.issues.some((i) => i.level === "error")) {
        return;
      }
    }

    if (result.parsed) parsed.push(result.parsed);
  });

  if (seasonSet.size > 1) {
    console.warn("Multiple seasons detected in the import file:");
    seasonDetails.forEach((details, seasonId) => {
      console.group(`Season ${seasonId}:`);
      details.forEach(d => {
        console.log(`  Row ${d.index}: MFID=${d.mfid}, collected_at=${d.collected_at}`);
      });
      console.groupEnd();
    });
    issues.push({
      row: -1,
      col: "season_id",
      message: "All rows in the dataset must belong to the same season.",
      level: "error",
      value: Array.from(seasonSet).join(", "),
    });
    return { parsed: [], issues };
  }

  return { parsed, issues };
}




