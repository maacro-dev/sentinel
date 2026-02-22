import { PageContainer } from '@/core/components/layout'
import { NavButton } from '@/core/components/NavigationButton'
import { createCrumbLoader } from '@/core/utils/breadcrumb'
import { DataFinalConfirmation } from '@/features/import/components/DataFinalConfirmation'
import { DataPreview } from '@/features/import/components/DataPreview'
import { DatasetSelector } from '@/features/import/components/DatasetSelector'
import { DataSuccess } from '@/features/import/components/DataSuccess'
import { useImport } from '@/features/import/hooks/useImport'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/core/components/ui/dialog"
import { Button } from "@/core/components/ui/button"

export const Route = createFileRoute('/_manager/_data/import')({
  loader: () => ({ breadcrumb: createCrumbLoader({ label: "Import" }) }),
  head: () => ({ meta: [{ title: "Import | Humay" }] }),
  component: RouteComponent,
})

type ImportStep = 'upload' | 'preview' | 'confirm' | 'success'

function RouteComponent() {
  const { datasetType, setDatasetType, rawData, issues, fileError, handleFiles, reset, importFn } = useImport();
  const [step, setStep] = useState<ImportStep>('upload')

  const [cancelOpen, setCancelOpen] = useState(false)

  const confirmCancel = () => {
    setCancelOpen(false)
    setStep('upload')
    setDatasetType(null)
  }

  const { cleanedData, cleanedIssues } = useMemo(() => {
    const errorRows = new Set(
      issues
        .filter(i => i.level === 'error')
        .map(i => i.row)
    );
    const cleaned = rawData.filter((_, idx) => !errorRows.has(idx));
    const cleanedWarnings = issues.filter(
      i => i.level === 'warning' && !errorRows.has(i.row)
    );
    return { cleanedData: cleaned, cleanedIssues: cleanedWarnings };
  }, [rawData, issues]);

  useEffect(() => {
    if (rawData.length) setStep('preview')
  }, [rawData])


  const doImport = async () => {
    try {
      await importFn();
      setStep('success');
    } catch (err) {

    }
  };

  const handleNewImport = () => {
    reset()
    setStep('upload')
  }

  return (
    <PageContainer>
      {step === 'upload' && (
        <DatasetSelector
          onSelect={setDatasetType}
          onFileHandle={handleFiles}
          fileError={fileError}
        />
      )}
      {step === 'preview' && (
        <DataPreview
          data={rawData}
          issues={issues}
          onContinueAnyway={() => setStep('confirm')}
          onCancel={() => setCancelOpen(true)}
        />
      )}
      {step === 'confirm' && (
        <>
          <NavButton
            label='Back'
            direction={"back"}
            onClick={() => {
              setStep("preview")
            }}
          />
          <DataFinalConfirmation
            data={rawData}
            issues={issues}
            onImport={doImport}
            onCancel={() => setCancelOpen(true)}
          />
        </>
      )}

      {step === 'success' && (
        <DataSuccess
          rowsImported={cleanedData.length}
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
