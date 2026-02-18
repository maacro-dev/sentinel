import { Form } from "@/features/forms/schemas/forms";
import { datasetSchemas, FieldSchema } from "@/features/forms/schemas/import-schema";
import Papa from "papaparse";
import { useEffect, useState } from "react";

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

export function useImport(initialDataset?: Form) {
  const [datasetType, setDatasetType] = useState<Form | null>(initialDataset || null);
  const [rawData, setRawData] = useState<ImportRow[]>([]);
  const [issues, setIssues] = useState<ImportIssue[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    setFileError(null);
  }, [datasetType]);

  const validateFileCompatibility = (data: ImportRow[], datasetType: Form): string | null => {
    const schema = datasetSchemas[datasetType];
    if (!schema) return "Unknown dataset type";

    const headers = data.length > 0 ? Object.keys(data[0]) : [];
    if (headers.length === 0) return "The CSV file appears to be empty or has no headers.";

    const requiredFields = schema
      .filter(f => f.required ?? true)
      .map(f => f.name);

    const missingFields = requiredFields.filter(f => !headers.includes(f));

    if (missingFields.length > 0) {
      return `The selected file is missing required columns for ${datasetType}: ${missingFields.join(', ')}.
      Please ensure you have selected the correct dataset type.`;
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
  };
}
