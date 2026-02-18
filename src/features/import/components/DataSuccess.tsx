import { CheckCircle, BarChart3, Zap, Plus, ExternalLink, AlertTriangle } from 'lucide-react';
import { ImportRow, ImportIssue } from '../hooks/useImport';

interface DataSuccessProps {
  data: ImportRow[];
  issues: ImportIssue[];
  onViewDashboard: () => void;
  onExploreData: () => void;
  onImportAnother: () => void;
}

export function DataSuccess({ data, issues, onViewDashboard, onExploreData, onImportAnother }: DataSuccessProps) {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-linear-to-br from-emerald-50 to-blue-50 rounded-xl border-2 border-emerald-200 p-12 text-center">
          <CheckCircle className="w-24 h-24 text-emerald-600 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-emerald-900 mb-3">Import Complete!</h1>
          <div className="grid grid-cols-2 gap-4 bg-white rounded-lg p-6 mt-6">
            <div><p className="text-sm text-muted-foreground">Rows Imported</p><p className="text-lg font-semibold">{data.length}</p></div>
            <div><p className="text-sm text-muted-foreground">Status</p><p className="text-lg font-semibold text-emerald-600">Ready</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-8 my-8">
          <h2 className="font-semibold text-xl mb-6">What's Next?</h2>
          <div className="space-y-4">
            <button onClick={onViewDashboard} className="w-full text-left border-2 border-primary rounded-lg p-6 flex items-center gap-4">
              <BarChart3 className="w-6 h-6 text-primary" /> <span className="flex-1 font-semibold">View Dashboard</span> <ExternalLink className="w-5 h-5" />
            </button>
            <button onClick={onExploreData} className="w-full text-left border-2 border-accent rounded-lg p-6 flex items-center gap-4">
              <Zap className="w-6 h-6 text-accent" /> <span className="flex-1 font-semibold">Explore Data</span> <ExternalLink className="w-5 h-5" />
            </button>
            <button onClick={onImportAnother} className="w-full text-left border-2 border-secondary rounded-lg p-6 flex items-center gap-4">
              <Plus className="w-6 h-6" /> <span className="flex-1 font-semibold">Import Another</span> <ExternalLink className="w-5 h-5" />
            </button>
          </div>
        </div>
        {issues.length > 0 && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
            <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> {issues.length} warnings remain</h3>
          </div>
        )}
      </div>
    </div>
  );
}
