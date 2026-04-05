import { PageContainer } from '@/core/components/layout'
import { NavButton } from '@/core/components/NavigationButton'
import { createCrumbLoader } from '@/core/utils/breadcrumb'
import { DataFinalConfirmation } from '@/features/import/components/DataFinalConfirmation'
import { DataPreview } from '@/features/import/components/DataPreview'
import { DatasetSelector } from '@/features/import/components/DatasetSelector'
import { DataSuccess } from '@/features/import/components/DataSuccess'
import { useImport } from '@/features/import/hooks/useImport'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/core/components/ui/dialog"
import { Button } from "@/core/components/ui/button"
import { Spinner } from '@/core/components/ui/spinner'
import { useQueryClient } from '@tanstack/react-query'
import { useImportNotificationStore } from '@/features/import/store/useImportNotificationStore'
import { getActivityTypeFromForm } from '@/features/forms/schemas/forms'

export const Route = createFileRoute('/_manager/_data/import')({
  loader: () => ({ breadcrumb: createCrumbLoader({ label: "Import" }) }),
  head: () => ({ meta: [{ title: "Import | Humay" }] }),
  component: RouteComponent,
})

type ImportStep = 'upload' | 'preview' | 'confirm' | 'success'

function RouteComponent() {
  const [cancelOpen, setCancelOpen] = useState(false)
  const [step, setStep] = useState<ImportStep>('upload')

  const [noValidRowsDialogOpen, setNoValidRowsDialogOpen] = useState(false);

  const queryClient = useQueryClient()

  const { datasetType, setDatasetType, rawData, isProcessing, parsedData, issues, fileError, fileName, handleFiles, reset, importFn, datasetSeasonId } = useImport();

  const confirmCancel = () => {
    setCancelOpen(false)
    setStep('upload')
    setDatasetType(null)
    reset();
  }

  const allRowsAreDuplicates = useMemo(() => {
    return parsedData.length === 0;
  }, [parsedData]);

  useEffect(() => {
    if (rawData.length && !isProcessing) {
      if (allRowsAreDuplicates) {
        setNoValidRowsDialogOpen(true);
      } else {
        setStep('preview');
      }
    }
  }, [rawData, isProcessing, allRowsAreDuplicates]);

  const errorSummary = useMemo(() => {
    if (!issues.length) return null;
    const errorCounts = new Map<string, number>();
    issues.forEach(issue => {
      if (issue.level === 'error') {
        const key = `${issue.col}: ${issue.message}`;
        errorCounts.set(key, (errorCounts.get(key) || 0) + 1);
      }
    });
    return Array.from(errorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([msg, count]) => ({ msg, count }));
  }, [issues]);

  const allRowsAreInvalid = useMemo(() => parsedData.length === 0, [parsedData]);

  useEffect(() => {
    if (rawData.length && !isProcessing) {
      if (allRowsAreInvalid) {
        setNoValidRowsDialogOpen(true);
      } else {
        setStep('preview');
      }
    }
  }, [rawData, isProcessing, allRowsAreInvalid]);

  const handleNoValidRowsDialogClose = () => {
    setNoValidRowsDialogOpen(false);
    reset();
    setStep('upload');
  };

  const doImport = async () => {
    try {
      await importFn(parsedData, fileName);
      setStep('success');

      if (datasetSeasonId) {
        const formType = getActivityTypeFromForm(datasetType);
        useImportNotificationStore.getState().setImported(datasetSeasonId, formType);
      }

      queryClient.invalidateQueries({ queryKey: ['form-data'], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ['form-summary'], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ['data-collection-trend'], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ['form-count-summary'], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ['descriptive-analytics-data'], refetchType: "all" });

      queryClient.invalidateQueries({ queryKey: ['yield-analytics'], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ['yield-by-method'], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ['yield-by-variety'], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ['damage-by-location'], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ['damage-by-cause'], refetchType: "all" });

      queryClient.invalidateQueries({ queryKey: ['seasons-with-data'], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ['current-season'], refetchType: "all" });

      localStorage.removeItem('notifications_read');
      queryClient.refetchQueries({ queryKey: ['notifications'] });

    } catch (err) {
      console.error("error importing", fileName, "-", err)
    }
  };

  const handleNewImport = () => {
    reset()
    setStep('upload')
  }

  return (
    <PageContainer>
      {step === 'upload' && (
        <>
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Spinner className="size-10" />
              <p className="text-muted-foreground text-sm">Processing your data...</p>
            </div>
          ) : (
            <DatasetSelector
              onSelect={setDatasetType}
              onFileHandle={handleFiles}
              fileError={fileError}
            />
          )}
        </>
      )}
      {step === 'preview' && datasetType && (
        <DataPreview
          datasetType={datasetType}
          data={rawData}
          issues={issues}
          onContinueAnyway={() => setStep('confirm')}
          onCancel={() => setCancelOpen(true)}
        />
      )}
      {step === 'confirm' && datasetType && (
        <>
          <NavButton
            label='Back'
            direction={"back"}
            onClick={() => {
              setStep("preview")
            }}
          />
          <DataFinalConfirmation
            datasetType={datasetType}
            data={rawData}
            issues={issues}
            onImport={doImport}
            onCancel={() => setCancelOpen(true)}
          />
        </>
      )}

      {step === 'success' && (
        <DataSuccess
          rowsImported={parsedData.length}
          onImportAnother={handleNewImport}
        />
      )}

      <ImportCancelDialog cancelOpen={cancelOpen} setCancelOpen={setCancelOpen} confirmCancel={confirmCancel} />
      <NoValidRowsDialog
        open={noValidRowsDialogOpen}
        onClose={handleNoValidRowsDialogClose}
        errorSummary={errorSummary}
        totalRows={rawData.length}
      />
    </PageContainer>
  )
}

interface ImportCancelDialogProps {
  cancelOpen: boolean,
  setCancelOpen: (value: boolean) => void,
  confirmCancel: () => void
}

function ImportCancelDialog({ cancelOpen, setCancelOpen, confirmCancel }: ImportCancelDialogProps) {
  return (
    <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel import?</DialogTitle>
          <DialogDescription>
            Your uploaded data and progress will be lost. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setCancelOpen(false)}>Keep Importing</Button>
          <Button variant="destructive" onClick={confirmCancel}>Yes, Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


interface NoValidRowsDialogProps {
  open: boolean;
  onClose: () => void;
  errorSummary: Array<{ msg: string; count: number }> | null;
  totalRows: number;
}

function NoValidRowsDialog({ open, onClose, errorSummary, totalRows }: NoValidRowsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>No Valid Rows Found</DialogTitle>
          <DialogDescription>
            None of the {totalRows} row(s) in your file passed validation. Please review the errors below and correct your data.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <h4 className="text-sm font-semibold mb-2">Common errors:</h4>
          {errorSummary && errorSummary.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              {errorSummary.map(({ msg, count }, i) => (
                <li key={i}>
                  {msg} <span className="text-xs">({count} row{count !== 1 ? 's' : ''})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No specific error details available.</p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
