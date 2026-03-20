import { PageContainer } from '@/core/components/layout'
import { NavButton } from '@/core/components/NavigationButton'
import { createCrumbLoader } from '@/core/utils/breadcrumb'
import { DataFinalConfirmation } from '@/features/import/components/DataFinalConfirmation'
import { DataPreview } from '@/features/import/components/DataPreview'
import { DatasetSelector } from '@/features/import/components/DatasetSelector'
import { DataSuccess } from '@/features/import/components/DataSuccess'
import { useImport } from '@/features/import/hooks/useImport'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
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

export const Route = createFileRoute('/_manager/_data/import')({
  loader: () => ({ breadcrumb: createCrumbLoader({ label: "Import" }) }),
  head: () => ({ meta: [{ title: "Import | Humay" }] }),
  component: RouteComponent,
})

type ImportStep = 'upload' | 'preview' | 'confirm' | 'success'

function RouteComponent() {
  const [cancelOpen, setCancelOpen] = useState(false)
  const [step, setStep] = useState<ImportStep>('upload')
  const queryClient = useQueryClient()

  const { datasetType, setDatasetType, rawData, isProcessing, parsedData, issues, fileError, fileName, handleFiles, reset, importFn, datasetSeasonId } = useImport();

  const confirmCancel = () => {
    setCancelOpen(false)
    setStep('upload')
    setDatasetType(null)
  }

  useEffect(() => {
    if (rawData.length && !isProcessing) {
      setStep('preview');
    }
  }, [rawData, isProcessing]);

  const doImport = async () => {
    try {
      await importFn(parsedData, fileName);
      setStep('success');

      if (datasetSeasonId) {
        useImportNotificationStore.getState().setNewlyImportedSeasonId(datasetSeasonId);
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
          <Button
            variant="outline"
            onClick={() => setCancelOpen(false)}
          >
            Keep Importing
          </Button>
          <Button
            variant="destructive"
            onClick={confirmCancel}
          >
            Yes, Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
