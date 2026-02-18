
import React from 'react';
import { AlertCircle, Download, CheckCircle } from 'lucide-react';
import { ImportRow, ImportIssue } from '../hooks/useImport';

interface DataGuidedFixProps {
  data: ImportRow[];
  issues: ImportIssue[];
  onApplyFix: () => void;
  onSkip?: () => void;
}

export function DataGuidedFix({ data, issues, onApplyFix, onSkip }: DataGuidedFixProps) {
  const [selectedFix, setSelectedFix] = React.useState('auto');
  const sample = data.filter((_, i) => issues.some(iss => iss.row === i)).slice(0, 5);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">Fix Data Issues</h1>
        <p className="text-muted-foreground mb-4">Issue 1 of {issues.length}</p>
        <div className="h-1 w-12 bg-primary rounded-full mb-8"></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="font-semibold text-lg">Invalid Email Addresses</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {issues.length} email addresses are invalid.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900">Example Correct Values</h4>
              <p className="text-sm text-blue-800">alice@example.com, bob@example.co.uk</p>
            </div>
          </div>

          <div className="bg-white rounded-xl overflow-hidden border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="p-4 text-left">Email</th>
                </tr>
              </thead>
              <tbody>
                {sample.map((row, idx) => (
                  <tr key={idx} className="border-b border-border bg-red-50">
                    <td className="p-4 font-mono text-red-700">{row.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="bg-secondary p-3 text-xs">Showing {sample.length} of {issues.length} rows</div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-border">
            <h3 className="font-semibold text-lg mb-4">Fix Options</h3>
            <div className="space-y-3 mb-6">
              <label className="flex items-start gap-3 p-4 border-2 border-primary rounded-lg bg-primary/5">
                <input type="radio" name="fix" value="auto" checked={selectedFix === 'auto'} onChange={e => setSelectedFix(e.target.value)} className="mt-1" />
                <div>
                  <h4 className="font-semibold">Auto Fix</h4>
                  <p className="text-xs text-muted-foreground">Add .com to incomplete emails</p>
                </div>
              </label>
              <label className="flex items-start gap-3 p-4 border-2 border-border rounded-lg">
                <input type="radio" name="fix" value="download" onChange={e => setSelectedFix(e.target.value)} className="mt-1" />
                <div>
                  <h4 className="font-semibold flex items-center gap-2"><Download className="w-4 h-4" /> Download & Fix Manually</h4>
                </div>
              </label>
            </div>
            <div className="space-y-2">
              <button onClick={onApplyFix} className="w-full px-4 py-3 bg-accent text-accent-foreground rounded-lg flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" /> Apply Fix
              </button>
              {onSkip && <button onClick={onSkip} className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg">Skip For Now</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
