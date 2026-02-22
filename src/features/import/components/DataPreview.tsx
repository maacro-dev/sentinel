import { AlertCircle, CheckCircle2, CheckCircle } from 'lucide-react';
import { ImportRow, ImportIssue, PreviewRow } from '../hooks/useImport';
import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table';
import ProgressCircle from '@/core/components/ProgressCircle';
import { plural } from '@/core/utils/string';
import { Button } from '@/core/components/ui/button';
import { Checkbox } from '@/core/components/ui/checkbox';
import { Label } from '@/core/components/ui/label';

interface DataPreviewProps {
  data: ImportRow[];
  issues: ImportIssue[];
  onCancel: () => void;
  onContinueAnyway: () => void;
}

export function DataPreview({ data, issues, onCancel, onContinueAnyway }: DataPreviewProps) {
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);
  const [filterColumn, setFilterColumn] = useState<string | null>(null);

  const errorIssues = issues.filter(i => i.level === 'error');

  const errorRowsSet = new Set(errorIssues.map(i => i.row));
  const errorRowsCount = errorRowsSet.size;
  const hasErrors = errorRowsCount > 0

  const filteredData = useMemo<PreviewRow[]>(() => {
    return data
      .map((row, idx) => ({ ...row, _originalIndex: idx }))
      .filter((row) => {
        if (showOnlyErrors && !errorRowsSet.has(row._originalIndex)) return false;
        if (
          filterColumn &&
          !issues.some(
            i =>
              i.row === row._originalIndex &&
              i.col === filterColumn &&
              i.level === 'error'
          )
        )
          return false;
        return true;
      });
  }, [data, showOnlyErrors, filterColumn, errorRowsSet, issues]);


  return (
    <div className='h-full flex flex-col justify-center items-center'>
      <div className="w-full lg:max-w-3/5">
        <h1 className="text-lg font-bold text-foreground">Review Your Data</h1>
        <p className="text-sm text-muted-foreground mb-4">Check the preview below and fix any issues before importing</p>
        <div className="flex flex-col gap-4">
          <DataQualityWidget
            issues={issues}
            totalRows={data.length}
            filterColumn={filterColumn}
            onFilterColumn={setFilterColumn}
            showOnlyErrors={showOnlyErrors}
            onShowOnlyErrorsChange={(e) => setShowOnlyErrors(e === true)}
          />
          <DataPreviewTable data={filteredData} issues={issues} totalRows={data.length} />
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
  onFilterColumn: (col: string | null) => void;
  showOnlyErrors: boolean,
  onShowOnlyErrorsChange: (value: boolean) => void
}

function DataQualityWidget({ issues, totalRows, filterColumn, onFilterColumn, showOnlyErrors, onShowOnlyErrorsChange }: DataQualityWidgetProps) {
  const errorIssues = issues.filter(i => i.level === 'error');
  const totalErrors = errorIssues.length;

  const errorRowsCount = new Set(errorIssues.map(i => i.row)).size;
  const hasErrors = errorRowsCount > 0
  const cleanRowsCount = totalRows - errorRowsCount;
  const cleanPercentage = totalRows > 0 ? Math.round((cleanRowsCount / totalRows) * 100) : 100;

  const issuesByColumn = useMemo(() => {
    const map = new Map<string, { col: string; messages: Map<string, number> }>();
    errorIssues.forEach(issue => {
      if (!map.has(issue.col)) {
        map.set(issue.col, { col: issue.col, messages: new Map() });
      }
      const colData = map.get(issue.col)!;
      const count = colData.messages.get(issue.message) || 0;
      colData.messages.set(issue.message, count + 1);
    });
    return Array.from(map.values()).map(({ col, messages }) => ({
      col,
      messages: Array.from(messages.entries()).map(([msg, cnt]) => ({ msg, cnt })),
    }));
  }, [errorIssues]);

  const topColumns = useMemo(() => {
    return issuesByColumn
      .map(c => ({
        col: c.col,
        total: c.messages.reduce((sum, m) => sum + m.cnt, 0),
        messages: c.messages,
      }))
      .sort((a, b) => b.total - a.total);
  }, [issuesByColumn]);

  return (
    <div className="bg-white border rounded-container p-4 h-fit max-h-56 lg:max-h-64 overflow-y-auto">
      <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-3">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        Data Quality
      </h3>

      <div className="flex items-center justify-center mb-2">
        <ProgressCircle percentage={cleanPercentage} size={60} textClassName='text-xs font-medium' />
      </div>

      <div className="text-xs text-center text-muted-foreground mb-4">
        {cleanRowsCount} of {totalRows} rows error‑free
      </div>

      <div className="flex w-full justify-between mb-2">
        <div className="flex items-center gap-2">
          {hasErrors ? (
            <>
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-medium">
                {plural(errorRowsCount, 'row')} contain {plural(totalErrors, 'error')}
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
          <div className="flex gap-2">
            <Checkbox
              className='hover:cursor-pointer'
              id="errors-checkbox"
              name="errors-checkbox"
              checked={showOnlyErrors}
              onCheckedChange={e => onShowOnlyErrorsChange(e === true)}
            />
            <Label htmlFor="errors-checkbox" className='font-normal text-xs hover:underline hover:cursor-pointer'>Show only errors</Label>
          </div>
        )}
      </div>

      {topColumns.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Issues
          </h4>
          {topColumns.map(({ col, total, messages }) => (
            <div key={col} className="">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => onFilterColumn(filterColumn === col ? null : col)}
                  className={`text-xs font-medium hover:underline ${filterColumn === col ? 'text-red-600' : 'text-foreground'
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
                    {/* <span>{cnt}</span> */}
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
}

function DataPreviewTable({ data, issues, totalRows }: DataPreviewTableProps) {
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
        return (
          <span className={hasError ? 'bg-red-200/60 font-medium text-red-600 px-2 py-0.5 rounded' : ''}>
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
              const rowHasError = issues.some(i => i.row === rowIdx && i.level === 'error');
              return (
                <TableRow
                  key={row.id}
                  className={`border-b border-border transition-colors ${rowHasError ? 'bg-red-100/50 hover:bg-red-100/50' : 'hover:bg-background'
                    }`}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className={`text-3xs px-4 py-3 whitespace-nowrap ${rowHasError ? 'text-red-500' : ''}`}>
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
