
import React, { useMemo } from 'react';
import { AlertCircle, Download, CheckCircle } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { ImportRow, ImportIssue } from '../types';

interface DataGuidedFixProps {
  data: ImportRow[];
  issues: ImportIssue[];
  onApplyFix: () => void;
  onSkip?: () => void;
}

const MAX_SAMPLE_ROWS = 10;

export function DataGuidedFix({ data, issues, onApplyFix, onSkip }: DataGuidedFixProps) {
  const [selectedFix, setSelectedFix] = React.useState('auto');

  // Compute sets and aggregates
  const errorRowsSet = useMemo(() => new Set(issues.map(i => i.row)), [issues]);

  const issuesByColumn = useMemo(() => {
    const map = new Map<string, { count: number; messages: Map<string, number> }>();
    issues.forEach(issue => {
      if (!map.has(issue.col)) {
        map.set(issue.col, { count: 0, messages: new Map() });
      }
      const colData = map.get(issue.col)!;
      colData.count++;
      const msgCount = colData.messages.get(issue.message) || 0;
      colData.messages.set(issue.message, msgCount + 1);
    });
    return map;
  }, [issues]);

  const errorColumns = useMemo(() => {
    return Array.from(issuesByColumn.entries())
      .map(([col, { count, messages }]) => ({
        col,
        count,
        messages: Array.from(messages.entries()).map(([msg, cnt]) => ({ msg, cnt })),
      }))
      .sort((a, b) => b.count - a.count);
  }, [issuesByColumn]);

  // Sample error rows (with original index)
  const sampleErrorRows = useMemo(() => {
    const errorRows = Array.from(errorRowsSet)
      .map(idx => ({ ...data[idx], _originalIndex: idx }))
      .slice(0, MAX_SAMPLE_ROWS);
    return errorRows;
  }, [data, errorRowsSet]);

  // Determine which columns to show in the table (only those with errors)
  const tableColumns = useMemo(() => {
    if (sampleErrorRows.length === 0) return [];

    // Always include a row number column
    const cols: ColumnDef<any>[] = [
      {
        id: 'rowNumber',
        header: 'Row',
        cell: ({ row }) => <span>{(row.original as any)._originalIndex + 1}</span>,
      },
    ];

    // Add columns that have errors
    errorColumns.forEach(({ col }) => {
      cols.push({
        accessorKey: col,
        header: () => <span className="capitalize">{col.replace(/_/g, ' ')}</span>,
        cell: ({ row, getValue }) => {
          const value = getValue() as string;
          const rowIdx = (row.original as any)._originalIndex;
          const hasError = issues.some(i => i.row === rowIdx && i.col === col);
          return (
            <span className={hasError ? 'bg-red-100 font-medium text-red-900 px-1 py-0.5 rounded' : ''}>
              {value || '(empty)'}
            </span>
          );
        },
      });
    });

    return cols;
  }, [sampleErrorRows, errorColumns, issues]);

  const table = useReactTable({
    data: sampleErrorRows,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">Fix Data Issues</h1>
        <p className="text-muted-foreground mb-4">
          {issues.length} error{issues.length !== 1 ? 's' : ''} in {errorRowsSet.size} row{errorRowsSet.size !== 1 ? 's' : ''}
        </p>
        <div className="h-1 w-12 bg-primary rounded-full mb-8"></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel: column summaries */}
          <div className="bg-white rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="font-semibold text-lg">Columns with errors</h3>
            </div>
            <div className="space-y-4">
              {errorColumns.map(({ col, count, messages }) => (
                <div key={col} className="text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium capitalize">{col.replace(/_/g, ' ')}</span>
                    <span className="text-muted-foreground text-xs">{count} error{count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="space-y-1 pl-2">
                    {messages.slice(0, 2).map(({ msg, cnt }) => (
                      <div key={msg} className="flex justify-between text-xs text-muted-foreground">
                        <span className="truncate max-w-45" title={msg}>
                          {msg.length > 30 ? msg.slice(0, 30) + '…' : msg}
                        </span>
                        <span>{cnt}</span>
                      </div>
                    ))}
                    {messages.length > 2 && (
                      <div className="text-xs text-muted-foreground italic">
                        +{messages.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {errorColumns.length === 0 && (
                <p className="text-sm text-muted-foreground">No error columns to display.</p>
              )}
            </div>
          </div>

          {/* Middle panel: table of sample errored rows */}
          <div className="bg-white rounded-xl overflow-hidden border border-border lg:col-span-1">
            {sampleErrorRows.length > 0 ? (
              <>
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary sticky top-0">
                      {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map(header => (
                            <th key={header.id} className="p-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {table.getRowModel().rows.map(row => (
                        <tr key={row.id} className="border-b border-border">
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id} className="p-3 text-xs">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-secondary p-3 text-xs text-muted-foreground text-center">
                  Showing {sampleErrorRows.length} of {errorRowsSet.size} rows with errors
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-muted-foreground">No error rows to display</div>
            )}
          </div>

          {/* Right panel: fix options (unchanged) */}
          <div className="bg-white rounded-xl p-6 border border-border">
            <h3 className="font-semibold text-lg mb-4">Fix Options</h3>
            <div className="space-y-3 mb-6">
              <label className="flex items-start gap-3 p-4 border-2 border-primary rounded-lg bg-primary/5">
                <input
                  type="radio"
                  name="fix"
                  value="auto"
                  checked={selectedFix === 'auto'}
                  onChange={e => setSelectedFix(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <h4 className="font-semibold">Auto Fix</h4>
                  <p className="text-xs text-muted-foreground">Mark errors as resolved (rows will be skipped during import)</p>
                </div>
              </label>
              <label className="flex items-start gap-3 p-4 border-2 border-border rounded-lg">
                <input
                  type="radio"
                  name="fix"
                  value="download"
                  onChange={e => setSelectedFix(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    <Download className="w-4 h-4" /> Download & Fix Manually
                  </h4>
                  <p className="text-xs text-muted-foreground">Export errored rows to CSV, edit, and re-upload</p>
                </div>
              </label>
            </div>
            <div className="space-y-2">
              <button
                onClick={onApplyFix}
                className="w-full px-4 py-3 bg-accent text-accent-foreground rounded-lg flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" /> Apply Fix
              </button>
              {onSkip && (
                <button
                  onClick={onSkip}
                  className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg"
                >
                  Skip For Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
