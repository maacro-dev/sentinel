import { Form } from "@/features/forms/schemas/forms";
import { datasetSchemas, FieldSchema } from "@/features/forms/schemas/import-schema";
import { useMutation } from "@tanstack/react-query";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import { Import } from "../services/Import";
import { ImportToasts } from "../toastMessages";
import { useToast } from "@/features/toast";

export type ImportRow = Record<string, unknown>;

export type PreviewRow = ImportRow & {
  _originalIndex: number;
};

export type ImportIssue = {
  row: number;
  col: string;
  message: string;
  level?: 'error' | 'warning',
  value: any;
};

export type FileError = {
  message: string;
  missingColumns?: string[];
} | null;

export function useImport(initialDataset?: Form) {

  const { notifyLoading, notifySuccess, notifyError } = useToast()

  const [datasetType, setDatasetType] = useState<Form | null>(initialDataset || null);
  const [rawData, setRawData] = useState<ImportRow[]>([]);
  const [issues, setIssues] = useState<ImportIssue[]>([]);
  const [fileError, setFileError] = useState<FileError>(null);

  useEffect(() => {
    setFileError(null);
  }, [datasetType]);

  const importMutation = useMutation({
    mutationKey: ['import', datasetType] as const,
    mutationFn: ({ datasetType, data }: { datasetType: Form; data: ImportRow[] }) => {
      return Import.create(datasetType, data)
    },
    onMutate: () => notifyLoading(ImportToasts.creating),
    onSuccess: (d, _v, id) => notifySuccess({ id, message: ImportToasts.created.message, description: d.message || ImportToasts.created.description }),
    onError: (_d, _v, id) => notifyError({ id, ...ImportToasts.createFailed }),
  });

  const importFn = () => {
    if (!datasetType) return Promise.reject('No dataset selected');
    return importMutation.mutateAsync({ datasetType, data: rawData });
  };


  const validateFileCompatibility = (
    data: ImportRow[],
    datasetType: Form
  ): FileError => {
    const schema = datasetSchemas[datasetType];
    if (!schema) {
      return { message: "Unknown dataset type" };
    }

    const headers = data.length > 0 ? Object.keys(data[0]) : [];
    if (headers.length === 0) {
      return { message: "The CSV file appears to be empty or has no headers." };
    }

    const requiredFields = schema
      .filter(f => f.required ?? true)
      .map(f => f.name);

    const missingFields = requiredFields.filter(f => !headers.includes(f));

    if (missingFields.length > 0) {
      return {
        message: `The selected file is missing required columns for ${datasetType}.`,
        missingColumns: missingFields,
      };
    }

    return null;
  };

  const validateRow = (row: ImportRow, rowIndex: number, schema: FieldSchema[]): ImportIssue[] => {
    const rowIssues: ImportIssue[] = [];
    schema.forEach(field => {
      const value = row[field.name] as string || '';
      if (field.required && !value.trim()) {
        rowIssues.push({
          row: rowIndex,
          col: field.name,
          message: 'Required field missing',
          level: 'error',
          value: value
        });
      }
      if (field.validate && value.trim()) {
        const result = field.validate(value, row);
        if (result) {
          const isWarning = result.startsWith('warning:');
          rowIssues.push({
            row: rowIndex,
            col: field.name,
            message: isWarning ? result.substring(8) : result,
            level: isWarning ? 'warning' : 'error',
            value: value
          });
        }
      }
    });
    return rowIssues;
  };

  const analyze = (data: ImportRow[], schema: FieldSchema[]) => {
    const newIssues: ImportIssue[] = [];
    data.forEach((row, idx) => {
      newIssues.push(...validateRow(row, idx, schema));
    });
    setIssues(newIssues);
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !datasetType) return;

    Papa.parse(file, {
      header: true,
      complete: (r) => {
        const data = r.data as ImportRow[];

        const compatibilityError = validateFileCompatibility(data, datasetType);
        if (compatibilityError) {
          setFileError(compatibilityError);
          e.target.value = '';
          return;
        }

        setFileError(null);
        setRawData(data);
        analyze(data, datasetSchemas[datasetType]);
      },
    });
  };

  const reset = () => {
    setRawData([]);
    setIssues([]);
    setDatasetType(null);
    setFileError(null);
  };

  return {
    datasetType,
    setDatasetType,
    rawData,
    issues,
    fileError,
    handleFiles,
    reset,

    importFn: importFn,
    isImporting: importMutation.isPending,
    importError: importMutation.error,
    importSuccess: importMutation.isSuccess,
    importReset: importMutation.reset,
  };
}
