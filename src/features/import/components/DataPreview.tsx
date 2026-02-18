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

interface DataPreviewProps {
  data: ImportRow[];
  issues: ImportIssue[];
  onReviewFixes: () => void;
  onContinueAnyway: () => void;
}

export function DataPreview({ data, issues, onReviewFixes, onContinueAnyway }: DataPreviewProps) {
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);
  const [filterColumn, setFilterColumn] = useState<string | null>(null);

  const errorIssues = issues.filter(i => i.level === 'error');
  const errorRowsSet = new Set(errorIssues.map(i => i.row));
  const errorRowsCount = errorRowsSet.size;
  const hasErrors = errorRowsCount > 0
  const totalErrors = errorIssues.length;

  const errorColumns = useMemo(() => {
    const colCount: Record<string, number> = {};
    errorIssues.forEach(i => {
      colCount[i.col] = (colCount[i.col] || 0) + 1;
    });
    return Object.entries(colCount).map(([col, count]) => ({ col, count }));
  }, [errorIssues]);

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


  console.log(filteredData)

  return (
    <div className="max-w-7xl">
      <h1 className="text-lg font-bold text-foreground">Review Your Data</h1>
      <p className="text-sm text-muted-foreground mb-4">Check the preview below and fix any issues before importing</p>

      <div className="bg-white border rounded-lg p-4 mb-4 space-y-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            {hasErrors ? (
              <>
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium">
                  {plural(errorRowsCount, 'row')} contain {plural(totalErrors, 'error')}
                </span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">
                  Your data looks good!
                </span>
              </>
            )}
          </div>

          {hasErrors && (
            <label className="ml-auto flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={showOnlyErrors}
                onChange={e => setShowOnlyErrors(e.target.checked)}
                className="rounded"
              />
              <span>Show only errors</span>
            </label>
          )}
        </div>

        {errorColumns.length > 0 && (
          <div className="flex flex-wrap flex-col gap-2 pt-2 border-t">
            <div className="flex gap-4">
              <span className="text-xs text-muted-foreground">Issues by column</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {errorColumns.map(({ col, count }) => (
                <button
                  key={col}
                  onClick={() => setFilterColumn(filterColumn === col ? null : col)}
                  className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${filterColumn === col
                    ? 'bg-red-100 border-red-300 text-red-800 font-medium'
                    : 'bg-secondary border-border hover:bg-secondary/80'
                    }`}
                  title={`${col} (${count} error${count !== 1 ? 's' : ''})`}
                >
                  <span className="max-w-[100px] truncate inline-block align-middle">
                    {col.replace(/_/g, ' ')}
                  </span>
                  <span className="ml-1 text-[10px] opacity-80">({count})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DataPreviewTable data={filteredData} issues={issues} totalRows={data.length} />
        <DataQualityWidget
          issues={issues}
          totalRows={data.length}
          filterColumn={filterColumn}
          onFilterColumn={setFilterColumn}
        />
      </div>

      <div className="flex gap-4 justify-center mt-8">
        <button onClick={onReviewFixes} className="px-8 py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90">
          Review Fixes
        </button>
        <button onClick={onContinueAnyway} className="px-8 py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/80">
          Continue Anyway
        </button>
      </div>
    </div>
  );
}

interface DataQualityWidgetProps {
  issues: ImportIssue[];
  totalRows: number;
  filterColumn: string | null;
  onFilterColumn: (col: string | null) => void;
}

function DataQualityWidget({ issues, totalRows, filterColumn, onFilterColumn }: DataQualityWidgetProps) {
  const errorIssues = issues.filter(i => i.level === 'error');
  const errorRowsCount = new Set(errorIssues.map(i => i.row)).size;
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
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
  }, [issuesByColumn]);

  return (
    <div className="bg-white border rounded-lg p-4 h-fit max-h-[500px] overflow-y-auto">
      <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        Data Quality
      </h3>

      <div className="flex items-center justify-center mb-4">
        <ProgressCircle percentage={cleanPercentage} />
      </div>

      <div className="text-xs text-center text-muted-foreground mb-4">
        {cleanRowsCount} of {totalRows} rows error‑free
      </div>

      {topColumns.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Issues
          </h4>
          {topColumns.map(({ col, total, messages }) => (
            <div key={col} className="text-xs">
              <div className="flex items-center justify-between mb-1">
                <button
                  onClick={() => onFilterColumn(filterColumn === col ? null : col)}
                  className={`font-medium hover:underline ${filterColumn === col ? 'text-red-600' : 'text-foreground'
                    }`}
                >
                  {col.replace(/_/g, ' ')}
                </button>
                <span className="text-muted-foreground">{total}</span>
              </div>
              <div className="space-y-1 pl-1.5">
                {messages.slice(0, 2).map(({ msg, cnt }) => (
                  <div key={msg} className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="" title={msg}>
                      {msg}
                      {/* {msg.length > 20 ? msg.slice(0, 20) + '…' : msg} */}
                    </span>
                    <span>{cnt}</span>
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
    return Object.keys(data[0]).map((key) => ({
      accessorKey: key,
      header: () => <span className="text-3xs font-normal">{key.replace(/_/g, ' ')}</span>,
      cell: ({ row, getValue }) => {
        const value = getValue() as string;
        const rowIdx = row.original._originalIndex ?? row.index;
        const hasError = issues.some(i => i.row === rowIdx && i.col === key && i.level === 'error');
        return (
          <span className={hasError ? 'bg-red-100 font-medium text-red-900 px-1 py-0.5 rounded' : ''}>
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
      <div className="overflow-x-auto min-h-96 max-h-96 overflow-y-auto">
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
                    <TableCell key={cell.id} className="text-3xs px-4 py-3 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="bg-secondary py-2 text-xs text-muted-foreground text-center">
        Showing {data.length} of {totalRows} rows
      </div>
    </div>
  );
}
