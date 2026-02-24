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
  const [fileName, setFileName] = useState<string>('');

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

  const importMutation = useMutation({
    mutationKey: ["import", datasetType] as const,
    mutationFn: ({ datasetType, data, fileName }: { datasetType: Form; data: ImportRow[], fileName: string }) =>
      Import.create(datasetType, data, fileName),
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

  const importFn = (data: ImportRow[], fileName: string) => {
    if (!datasetType) return Promise.reject("No dataset selected");
    return importMutation.mutateAsync({ datasetType, data, fileName });
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !datasetType) return;

    Papa.parse(file, {
      header: true,
      complete: (result) => {
        const data = result.data as ImportRow[];
        const compatibilityError = validateFileCompatibility(data, datasetType);
        if (compatibilityError) {
          setFileError(compatibilityError);
          e.target.value = "";
          return;
        }
        setFileError(null);
        setFileName(file.name)
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
    setFileName('');
    setIsProcessing(false);
    importMutation.reset();
  };

  return {
    datasetType,
    setDatasetType,
    rawData,
    parsedData,
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
  const issues: ImportIssue[] = [];
  const parsed: ImportRow[] = [];

  rows.forEach((row, index) => {
    const result = validateRow(row, index, context);

    if (result.issues.length > 0) {
      issues.push(...result.issues);
      if (result.issues.some((i) => i.level === "error")) {
        return;
      }
    }
    if (result.parsed) parsed.push(result.parsed);
  });

  return { parsed, issues };
}
