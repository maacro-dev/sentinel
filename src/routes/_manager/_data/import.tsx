import { PageContainer } from '@/core/components/layout'
import { NavButton } from '@/core/components/NavigationButton'
import { createCrumbLoader } from '@/core/utils/breadcrumb'
import { DataFinalConfirmation } from '@/features/import/components/DataFinalConfirmation'
import { DataGuidedFix } from '@/features/import/components/DataGuidedFix'
import { DataPreview } from '@/features/import/components/DataPreview'
import { DatasetSelector } from '@/features/import/components/DatasetSelector'
import { DataSuccess } from '@/features/import/components/DataSuccess'
import { useImport } from '@/features/import/hooks/useImport'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/_manager/_data/import')({
  loader: () => ({ breadcrumb: createCrumbLoader({ label: "Import" }) }),
  head: () => ({ meta: [{ title: "Import | Humay" }] }),
  component: RouteComponent,
})

type ImportStep = 'upload' | 'preview' | 'fix' | 'confirm' | 'success'

function RouteComponent() {
  const { datasetType, setDatasetType, rawData, issues, fileError, handleFiles, reset } = useImport();
  const [step, setStep] = useState<ImportStep>('upload')

  useEffect(() => {
    if (rawData.length) setStep('preview')
  }, [rawData])

  const applyFix = () => setStep('confirm')
  const doImport = () => setStep('success')
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
          error={fileError}
        />
      )}
      {step === 'preview' && (
        <>
          <NavButton
            label='Back'
            direction='back'
            onClick={() => {
              setStep('upload')
              setDatasetType(null)
            }}
          />
          <DataPreview
            data={rawData}
            issues={issues}
            onContinueAnyway={() => setStep('confirm')}
            onReviewFixes={() => setStep('fix')}
          />
        </>
      )}
      {step === 'fix' && (
        <DataGuidedFix
          data={rawData}
          issues={issues.filter(i => i.level === 'error')}
          onApplyFix={applyFix}
          onSkip={() => setStep('confirm')}
        />
      )}
      {step === 'confirm' && (
        <DataFinalConfirmation
          data={rawData}
          issues={issues}
          onImport={doImport}
          onGoBack={() => setStep('preview')}
        />
      )}
      {step === 'success' && (
        <DataSuccess
          data={rawData}
          issues={issues}
          onViewDashboard={() => alert('Navigate to dashboard')}
          onExploreData={() => alert('Navigate to data explorer')}
          onImportAnother={handleNewImport}
        />
      )}
    </PageContainer>
  )
}
