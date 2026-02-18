
import React from 'react';
import { CheckCircle, Lock, AlertTriangle } from 'lucide-react';
import { ImportRow, ImportIssue } from '../hooks/useImport';

interface DataFinalConfirmationProps {
  data: ImportRow[];
  issues: ImportIssue[];
  onImport: () => void;
  onGoBack: () => void;
}

export function DataFinalConfirmation({ data, issues, onImport, onGoBack }: DataFinalConfirmationProps) {
  const [understood, setUnderstood] = React.useState(false);
  const warnings = issues.length;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">Final Confirmation</h1>
        <div className="bg-white rounded-xl p-8 border border-border mb-8">
          <h3 className="font-semibold text-lg mb-6 flex items-center gap-2"><CheckCircle className="w-6 h-6 text-emerald-600" /> Import Summary</h3>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between pb-4 border-b"><span>Total Rows</span><span className="font-semibold">{data.length}</span></div>
            <div className="flex justify-between pb-4 border-b"><span>Columns</span><span className="font-semibold">{Object.keys(data[0] || {}).length}</span></div>
            <div className="flex justify-between"><span>Remaining Warnings</span><span className="font-semibold text-amber-600">{warnings}</span></div>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2"><Lock className="w-5 h-5" /> After Import</h4>
            <p className="text-sm text-blue-800">Dataset becomes read‑only to keep reports accurate.</p>
          </div>
        </div>
        {warnings > 0 && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-amber-900 mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Remaining Warnings ({warnings})</h3>
            <p className="text-sm text-amber-800">These won't prevent import but may affect analysis.</p>
          </div>
        )}
        <div className="bg-white rounded-xl p-6 border border-border mb-8">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={understood} onChange={e => setUnderstood(e.target.checked)} className="mt-1 w-5 h-5" />
            <span className="text-foreground font-medium">I understand this dataset becomes read‑only after import</span>
          </label>
        </div>
        <div className="flex gap-4 justify-center">
          <button onClick={onImport} disabled={!understood} className="px-8 py-3 bg-accent text-accent-foreground rounded-lg disabled:opacity-50">Import Data</button>
          <button onClick={onGoBack} className="px-8 py-3 bg-secondary text-secondary-foreground rounded-lg">Go Back</button>
        </div>
      </div>
    </div>
  );
}
