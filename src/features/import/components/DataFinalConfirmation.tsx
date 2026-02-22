
import React from 'react';
import { Lock, AlertTriangle } from 'lucide-react';
import { ImportRow, ImportIssue } from '../hooks/useImport';
import { Button } from '@/core/components/ui/button';
import { Field } from '@/core/components/ui/field';
import { Checkbox } from '@/core/components/ui/checkbox';
import { Label } from '@/core/components/ui/label';

interface DataFinalConfirmationProps {
  data: ImportRow[];
  issues: ImportIssue[];
  onImport: (cleanedData: ImportRow[]) => void;
  onCancel: () => void;
}

export function DataFinalConfirmation({ data, issues, onImport, onCancel }: DataFinalConfirmationProps) {
  const errorRows = React.useMemo(
    () => new Set(issues.filter(i => i.level === 'error').map(i => i.row)),
    [issues]
  );

  const cleanedData = React.useMemo(
    () => data.filter((_, idx) => !errorRows.has(idx)),
    [data, errorRows]
  );

  const keptWarnings = React.useMemo(
    () => issues.filter(i => i.level === 'warning' && !errorRows.has(i.row)),
    [issues, errorRows]
  );

  const [understood, setUnderstood] = React.useState(false);

  const totalRows = data.length;
  const importRows = cleanedData.length;
  const skippedRows = errorRows.size;
  const warningCount = keptWarnings.length;

  return (
    <div className='h-full flex flex-col justify-center items-center'>
      <div className="w-3/5">
        <h1 className="text-lg font-bold text-foreground">Confirm import</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Review the summary below. Rows with errors will be skipped automatically.
        </p>
        <div className="bg-white rounded-container p-4 border border-border mb-4 w-full">
          <div className="space-y-4">
            <div className="flex justify-between pb-2 border-b">
              <span className="text-sm text-muted-foreground">Total rows</span>
              <span className="font-semibold">{totalRows}</span>
            </div>
            <div className="flex justify-between pb-2 border-b">
              <span className="text-sm text-muted-foreground">
                Rows to Import
              </span>
              <span className="font-semibold text-emerald-700">{importRows}</span>
            </div>
            {skippedRows > 0 && (
              <div className="flex justify-between pb-2 border-b">
                <span className="text-sm text-muted-foreground">
                  Rows with errors (skipped)
                </span>
                <span className="font-semibold text-red-600">{skippedRows}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Warnings
              </span>
              <span className="font-semibold text-amber-600">{warningCount}</span>
            </div>
          </div>
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-container px-4 py-3 text-sm text-blue-800 flex items-center gap-3">
            <Lock className="size-4 text-blue-600" />
            <span>After import, the data is not editable.</span>
          </div>
        </div>
        <div className="bg-white rounded-container p-4 border border-border mb-6">
          <Field orientation="horizontal">
            <Checkbox
              className='hover:cursor-pointer'
              id="understood-checkbox"
              name="understood-checkbox"
              checked={understood}
              onCheckedChange={e => setUnderstood(e === true)}
            />
            <Label htmlFor="understood-checkbox" className='font-normal hover:underline hover:cursor-pointer'>
              I understand the dataset will be read‑only after import
            </Label>
          </Field>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            className='w-full'
            onClick={() => onImport(cleanedData)}
            disabled={!understood}
          >
            Import {importRows} {importRows === 1 ? 'row' : 'rows'}
          </Button>
          <Button
            className='w-full'
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
