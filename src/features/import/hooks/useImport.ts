import { Form, formsSchema } from "@/features/forms/schemas/forms";
import { datasetSchemas, FieldSchema, formSchemas } from "@/features/forms/schemas/import-schema";
import { useMutation } from "@tanstack/react-query";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import { Import } from "../services/Import";
import { ImportToasts } from "../toastMessages";
import { useToast } from "@/features/toast";
import * as z from "zod/v4"
import { parseNameParts } from "@/features/forms/utils";
import assert from "assert";

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
  const [parsedData, setParsedData] = useState<ImportRow[]>([]);
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

  const importFn = (data: ImportRow[]) => {
    if (!datasetType) return Promise.reject('No dataset selected');


    return importMutation.mutateAsync({ datasetType, data });
  };


  const parseSchema = (data: ImportRow[], schema: z.ZodObject<any>) => {
    const newIssues: ImportIssue[] = [];
    const parsedRows: any[] = [];

    data.forEach((row, idx) => {
      const validationResult = schema.safeParse(row);

      if (!validationResult.success) {
        validationResult.error.issues.forEach((issue) => {
          newIssues.push({
            value: row[issue.path[0] as string],
            row: idx,
            col: issue.path.join('.'),
            message: issue.message,
            level: 'error',
          });
        });
        return;
      }

      const baseData = validationResult.data;
      let collectedByValue = baseData.collected_by;

      if (baseData.collected_by !== 'N/A') {
        const { first, last, warning } = parseNameParts(baseData.collected_by as string);

        if (!first || !last) {

          newIssues.push({
            value: baseData.collected_by,
            row: idx,
            col: 'collected_by',
            message: warning || 'Invalid name format',
            level: 'error',
          });
          return; // Skip this row
        }

        if (warning) {
          newIssues.push({
            value: baseData.collected_by,
            row: idx,
            col: 'collected_by',
            message: warning,
            level: 'warning',
          });
        }

        collectedByValue = { original: baseData.collected_by, first, last };
      } else {
        collectedByValue = null;
      }

      parsedRows.push({
        ...baseData,
        collected_by: collectedByValue,
      });
    });

    setIssues(newIssues);
    setParsedData(parsedRows);


    console.log("raw =", data)
    console.log("issues rows =", newIssues)
    console.log("parsed rows =", parsedRows)
  };



  const validateFileCompatibility = (
    data: ImportRow[],
    datasetType: Form
  ): FileError => {

    const schema = formSchemas[datasetType];

    if (!schema) {
      return { message: "Unknown dataset type" };
    }

    const headers = data.length > 0 ? Object.keys(schema.shape) : [];
    if (headers.length === 0) {
      return { message: "The CSV file appears to be empty or has no headers." };
    }

    const missingFields = headers.filter(f => !headers.includes(f));

    if (missingFields.length > 0) {
      return {
        message: `The selected file is missing required columns for ${datasetType}.`,
        missingColumns: missingFields,
      };
    }

    return null;
  };

  // const validateRow = (row: ImportRow, rowIndex: number, schema: FieldSchema[]): ImportIssue[] => {
  //   const rowIssues: ImportIssue[] = [];
  //   schema.forEach(field => {
  //     const value = row[field.name] as string || '';
  //     if (field.required && !value.trim()) {
  //       rowIssues.push({
  //         row: rowIndex,
  //         col: field.name,
  //         message: 'Required field missing',
  //         level: 'error',
  //         value: value
  //       });
  //     }
  //     if (field.validate && value.trim()) {
  //       const result = field.validate(value, row);
  //       if (result) {
  //         const isWarning = result.startsWith('warning:');
  //         rowIssues.push({
  //           row: rowIndex,
  //           col: field.name,
  //           message: isWarning ? result.substring(8) : result,
  //           level: isWarning ? 'warning' : 'error',
  //           value: value
  //         });
  //       }
  //     }
  //   });
  //   return rowIssues;
  // };
  // const analyze = (data: ImportRow[], schema: FieldSchema[]) => {
  //   const newIssues: ImportIssue[] = [];
  //   data.forEach((row, idx) => {
  //     newIssues.push(...validateRow(row, idx, schema));
  //   });
  //   setIssues(newIssues);
  // };

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
        // analyze(data, datasetSchemas[datasetType]);

        if (formSchemas[datasetType] != null) {
          parseSchema(data, formSchemas[datasetType])
        } else {
          throw new Error("todo: schema not defined yet")
        }
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
    parsedData,
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
