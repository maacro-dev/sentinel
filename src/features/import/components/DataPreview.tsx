import { AlertCircle, CheckCircle2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table';
import { plural } from '@/core/utils/string';
import { Button } from '@/core/components/ui/button';
import { Checkbox } from '@/core/components/ui/checkbox';
import { Label } from '@/core/components/ui/label';
import { Form } from '@/features/forms/schemas/forms';
import { getFormLabel } from '@/features/forms/utils';
import { ImportRow, ImportIssue, PreviewRow } from '../types';

interface DataPreviewProps {
  datasetType: Form,
  data: ImportRow[];
  issues: ImportIssue[];
  onCancel: () => void;
  onContinueAnyway: () => void;
  seasonLabel?: string;
}

export function DataPreview({ datasetType, data, issues, onCancel, onContinueAnyway, seasonLabel }: DataPreviewProps) {
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);
  const [showOnlyWarnings, setShowOnlyWarnings] = useState(false);
  const [filterColumn, setFilterColumn] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<'error' | 'warning' | null>(null);

  const errorIssues = issues.filter(i => i.level === 'error');
  const warningIssues = issues.filter(i => i.level === 'warning');
  const errorRowsSet = new Set(errorIssues.map(i => i.row));
  const warningRowsSet = new Set(warningIssues.map(i => i.row));

  const errorRowsCount = errorRowsSet.size;
  const hasErrors = errorRowsCount > 0;

  const filteredData = useMemo<PreviewRow[]>(() => {
    return data
      .map((row, idx) => ({ ...row, _originalIndex: idx }))
      .filter((row) => {
        const rowIdx = row._originalIndex;
        const hasError = errorRowsSet.has(rowIdx);
        const hasWarning = warningRowsSet.has(rowIdx);

        if (showOnlyErrors && showOnlyWarnings) {
          if (!hasError && !hasWarning) return false;
        } else if (showOnlyErrors) {
          if (!hasError) return false;
        } else if (showOnlyWarnings) {
          if (!hasWarning) return false;
        }

        if (filterColumn && filterLevel) {
          const hasIssueInColumn = issues.some(i => i.row === rowIdx && i.col === filterColumn && i.level === filterLevel);
          if (!hasIssueInColumn) return false;
        }

        return true;
      });
  }, [data, showOnlyErrors, showOnlyWarnings, filterColumn, filterLevel, errorRowsSet, warningRowsSet, issues]);

  const handleFilterChange = (column: string | null, level?: 'error' | 'warning' | null) => {
    setFilterColumn(column);
    setFilterLevel(level ?? null);
  };

  return (
    <div className='h-full flex flex-col justify-center items-center'>
      <div className="w-full lg:max-w-3/5">
        <h1 className="text-lg font-bold text-foreground">Review Your Data ({getFormLabel(datasetType)} - {seasonLabel})</h1>
        <p className="text-sm text-muted-foreground mb-4">Check the preview below and fix any issues before importing</p>
        <div className="flex flex-col gap-4">
          <DataQualityWidget
            issues={issues}
            totalRows={data.length}
            filterColumn={filterColumn}
            filterLevel={filterLevel}
            onFilterChange={handleFilterChange}
            showOnlyErrors={showOnlyErrors}
            onShowOnlyErrorsChange={setShowOnlyErrors}
            showOnlyWarnings={showOnlyWarnings}
            onShowOnlyWarningsChange={setShowOnlyWarnings}
          />
          <DataPreviewTable
            data={filteredData}
            issues={issues}
            totalRows={data.length}
            errorRowsSet={errorRowsSet}
            warningRowsSet={warningRowsSet}
          />
        </div>
        <div className="flex flex-col gap-3 justify-start mt-6 ">
          <Button className="w-full" onClick={onContinueAnyway}>
            {hasErrors ? "Continue Anyway" : "Continue"}
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

interface DataQualityWidgetProps {
  issues: ImportIssue[];
  totalRows: number;
  filterColumn: string | null;
  filterLevel: 'error' | 'warning' | null;
  onFilterChange: (column: string | null, level?: 'error' | 'warning' | null) => void;
  showOnlyErrors: boolean;
  onShowOnlyErrorsChange: (value: boolean) => void;
  showOnlyWarnings: boolean;
  onShowOnlyWarningsChange: (value: boolean) => void;
}

function DataQualityWidget({
  issues,
  totalRows,
  filterColumn,
  filterLevel,
  onFilterChange,
  showOnlyErrors,
  onShowOnlyErrorsChange,
  showOnlyWarnings,
  onShowOnlyWarningsChange,
}: DataQualityWidgetProps) {
  const errorIssues = issues.filter(i => i.level === 'error');
  const warningIssues = issues.filter(i => i.level === 'warning');

  const totalErrors = errorIssues.length;
  const totalWarnings = warningIssues.length;

  const errorRowsCount = new Set(errorIssues.map(i => i.row)).size;
  const warningRowsCount = new Set(warningIssues.map(i => i.row)).size;

  const hasErrors = errorRowsCount > 0;
  const hasWarnings = warningRowsCount > 0;

  const cleanRowsCount = totalRows - errorRowsCount; // rows without errors (may still have warnings)
  const cleanPercentage = totalRows > 0 ? Math.round((cleanRowsCount / totalRows) * 100) : 100;

  const issuesByColumn = useMemo(() => {
    const errorMap = new Map<string, { col: string; messages: Map<string, number> }>();
    errorIssues.forEach(issue => {
      if (!errorMap.has(issue.col)) {
        errorMap.set(issue.col, { col: issue.col, messages: new Map() });
      }
      const colData = errorMap.get(issue.col)!;
      const count = colData.messages.get(issue.message) || 0;
      colData.messages.set(issue.message, count + 1);
    });

    const warningMap = new Map<string, { col: string; messages: Map<string, number> }>();
    warningIssues.forEach(issue => {
      if (!warningMap.has(issue.col)) {
        warningMap.set(issue.col, { col: issue.col, messages: new Map() });
      }
      const colData = warningMap.get(issue.col)!;
      const count = colData.messages.get(issue.message) || 0;
      colData.messages.set(issue.message, count + 1);
    });

    return {
      errors: Array.from(errorMap.values()).map(({ col, messages }) => ({
        col,
        messages: Array.from(messages.entries()).map(([msg, cnt]) => ({ msg, cnt })),
      })),
      warnings: Array.from(warningMap.values()).map(({ col, messages }) => ({
        col,
        messages: Array.from(messages.entries()).map(([msg, cnt]) => ({ msg, cnt })),
      })),
    };
  }, [errorIssues, warningIssues]);

  console.log(issuesByColumn)

  const topErrorColumns = useMemo(() => {
    return issuesByColumn.errors
      .map(c => ({
        col: c.col,
        total: c.messages.reduce((sum, m) => sum + m.cnt, 0),
        messages: c.messages,
      }))
      .sort((a, b) => b.total - a.total);
  }, [issuesByColumn.errors]);

  const topWarningColumns = useMemo(() => {
    return issuesByColumn.warnings
      .map(c => ({
        col: c.col,
        total: c.messages.reduce((sum, m) => sum + m.cnt, 0),
        messages: c.messages,
      }))
      .sort((a, b) => b.total - a.total);
  }, [issuesByColumn.warnings]);

  return (
    <div className="bg-white border rounded-container p-4 h-fit max-h-56 lg:max-h-64 overflow-y-auto">
      <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-3">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        Data Quality
      </h3>

      {/* <div className="flex items-center justify-center mb-2">
        <ProgressCircle percentage={cleanPercentage} size={60} textClassName='text-xs font-medium' />
      </div> */}

      {/* <div className="text-xs text-center text-muted-foreground mb-4">
        {cleanRowsCount} of {totalRows} rows error‑free
      </div> */}

      <div className={`flex flex-col w-full justify-between gap-2 ${hasErrors || hasWarnings ? 'mb-4' : ''}`}>
        <div className="flex items-center gap-2">
          {hasErrors || hasWarnings ? (
            <>
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-medium">
                {plural(errorRowsCount, 'row')} contain {plural(totalErrors, 'error')}
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-medium">
                {plural(warningRowsCount, 'row')} have {plural(totalWarnings, 'warning')}
              </span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">
                Your data looks good!
              </span>
            </>
          )}
        </div>
        {hasErrors && (
          <div className="flex gap-2 mt-1">
            <Checkbox
              className='hover:cursor-pointer'
              id="errors-checkbox"
              checked={showOnlyErrors}
              onCheckedChange={e => onShowOnlyErrorsChange(e === true)}
            />
            <Label htmlFor="errors-checkbox" className='font-normal text-xs hover:underline hover:cursor-pointer'>
              Show only errors
            </Label>
          </div>
        )}

        {hasWarnings && (
          <div className="flex gap-2">
            <Checkbox
              className='hover:cursor-pointer'
              id="warnings-checkbox"
              checked={showOnlyWarnings}
              onCheckedChange={e => onShowOnlyWarningsChange(e === true)}
            />
            <Label htmlFor="warnings-checkbox" className='font-normal text-xs hover:underline hover:cursor-pointer'>
              Show only warnings
            </Label>
          </div>
        )}
      </div>

      {/* Error issues list */}
      {topErrorColumns.length > 0 && (
        <div className="space-y-1 mb-6">
          <h4 className="text-2xs font-medium uppercase flex items-center gap-1 text-red-600">
            <AlertCircle className="w-3 h-3 " /> Errors
          </h4>
          {topErrorColumns.map(({ col, total, messages }) => (
            <div key={col} className="">
              <div className="flex items-center justify-between">
                <button
                  onClick={() =>
                    onFilterChange(
                      filterColumn === col && filterLevel === 'error' ? null : col,
                      'error'
                    )
                  }
                  className={`text-xs font-medium hover:underline ${filterColumn === col && filterLevel === 'error'
                    ? 'text-red-600'
                    : 'text-foreground'
                    }`}
                >
                  {col.replace(/_/g, ' ')}
                </button>
                <span className="text-muted-foreground">{total}</span>
              </div>
              <div className="space-y-1 pl-1.5">
                {messages.slice(0, 2).map(({ msg, cnt }) => (
                  <div key={msg} className="flex items-center justify-between text-2xs text-muted-foreground">
                    <span className="" title={msg}>
                      {msg}
                    </span>
                  </div>
                ))}
                {messages.length > 2 && (
                  <div className="text-[10px] text-muted-foreground italic">
                    +{messages.length - 2} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {topWarningColumns.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-2xs font-medium uppercase flex items-center gap-1 text-amber-600">
            <AlertTriangle className="w-3 h-3 " /> Warnings
          </h4>
          {topWarningColumns.map(({ col, total, messages }) => (
            <div key={col} className="">
              <div className="flex items-center justify-between">
                <button
                  onClick={() =>
                    onFilterChange(
                      filterColumn === col && filterLevel === 'warning' ? null : col,
                      'warning'
                    )
                  }
                  className={`text-xs font-medium hover:underline ${filterColumn === col && filterLevel === 'warning'
                    ? 'text-amber-600'
                    : 'text-foreground'
                    }`}
                >
                  {col.replace(/_/g, ' ')}
                </button>
                <span className="text-muted-foreground">{total}</span>
              </div>
              <div className="space-y-1 pl-1.5">
                {messages.slice(0, 2).map(({ msg, cnt }) => (
                  <div key={msg} className="flex items-center justify-between text-2xs text-muted-foreground">
                    <span className="" title={msg}>
                      {msg}
                    </span>
                  </div>
                ))}
                {messages.length > 2 && (
                  <div className="text-[10px] text-muted-foreground italic">
                    +{messages.length - 2} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface DataPreviewTableProps {
  data: PreviewRow[];
  issues: ImportIssue[];
  totalRows: number;
  errorRowsSet: Set<number>;
  warningRowsSet: Set<number>;
}

function DataPreviewTable({ data, issues, totalRows, errorRowsSet, warningRowsSet }: DataPreviewTableProps) {
  const columns = useMemo<ColumnDef<PreviewRow>[]>(() => {
    if (data.length === 0) return [];

    const keys = Object.keys(data[0]).filter(key => key !== '_originalIndex');

    return keys.map((key) => ({
      accessorKey: key,
      header: () => <span className="text-3xs font-normal">{key.replace(/_/g, ' ')}</span>,
      cell: ({ row, getValue }) => {
        const value = getValue() as string;
        const rowIdx = row.original._originalIndex ?? row.index;
        const hasError = issues.some(i => i.row === rowIdx && i.col === key && i.level === 'error');
        const hasWarning = !hasError && issues.some(i => i.row === rowIdx && i.col === key && i.level === 'warning');
        let bgColor = '';
        if (hasError) {
          bgColor = 'bg-red-200/60 font-medium text-red-600 px-2 py-0.5 rounded';
        } else if (hasWarning) {
          bgColor = 'bg-amber-100/60 font-medium text-amber-700 px-2 py-0.5 rounded';
        }
        return (
          <span className={bgColor}>
            {value || '(empty)'}
          </span>
        );
      },
    }));
  }, [data, issues]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (data.length === 0) {
    return (
      <div className="w-full lg:col-span-2 rounded-lg border p-8 text-center text-muted-foreground">
        No rows to display.
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 rounded-lg border overflow-hidden">
      <div className="overflow-x-auto overflow-y-auto min-h-40 max-h-40 lg:min-h-64 lg:max-h-64">
        <Table className="w-full text-sm">
          <TableHeader className="sticky top-0 bg-secondary z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className="border-b border-border">
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id} className="text-3xs font-normal text-left pl-4 py-2 whitespace-nowrap">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map(row => {
              const rowIdx = (row.original as any)._originalIndex ?? row.index;
              const rowHasError = errorRowsSet.has(rowIdx);
              const rowHasWarning = !rowHasError && warningRowsSet.has(rowIdx);
              let rowBg = '';
              if (rowHasError) {
                rowBg = 'bg-red-100/50 hover:bg-red-100/50';
              } else if (rowHasWarning) {
                rowBg = 'bg-amber-50/80 hover:bg-amber-50/80';
              }
              return (
                <TableRow
                  key={row.id}
                  className={`border-b border-border transition-colors ${rowBg} hover:bg-background`}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className={`text-3xs px-4 py-3 whitespace-nowrap ${rowHasError ? 'text-red-500' : rowHasWarning ? 'text-amber-700' : ''}`}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="bg-secondary py-2 text-2xs flex justify-center items-center text-muted-foreground text-center">
        Showing {data.length} of {totalRows} rows
      </div>
    </div>
  );
}
