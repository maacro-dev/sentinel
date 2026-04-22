import { useFormEntry } from '@/features/forms/hooks/useFormData';
import { FormDataEntry, FormDataGroup, FormData } from '@/features/forms/schemas/formData';
import { KVList, KVItem } from '@/core/components/KeyValue';
import { Sanitizer } from '@/core/utils/sanitizer';
import { formKeyMappings } from '@/features/forms/mappings';
import { Button } from '@/core/components/ui/button';
import { Textarea } from '@/core/components/ui/textarea';
import { Label } from '@/core/components/ui/label';
import { Camera, Combine, Grid2x2, SquareCheckBig, User, ArrowLeft } from 'lucide-react';
import { useVerification } from '@/features/forms/hooks/useVerification';
import { FertilizerApplicationsList } from '@/features/forms/components/FertilizerApplicationList';
import { useEffect, useState } from 'react';

export interface FormDetailViewProps {
  formType: string;
  id: number;
  seasonId: number;
  onBack: () => void;
}

export function FormDetailView({ formType, id, seasonId, onBack }: FormDetailViewProps) {
  const { data, isLoading } = useFormEntry({ formType: formType as any, id, seasonId });
  const verifyMutation = useVerification(formType, id, seasonId);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (data?.activity.remarks) {
      setRemarks(data.activity.remarks);
    }
  }, [data]);

  const handleVerify = (status: 'approved' | 'rejected') => {
    if (!data) return;
    verifyMutation.mutate({
      id: data.activity.id,
      status,
      remarks: remarks.trim() || undefined,
    });
  };

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center">Loading form...</div>;
  }

  if (!data) {
    return <div className="flex-1 flex items-center justify-center">Form not found</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto -mx-6 px-6">
      <div className="space-y-4 py-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
          <ArrowLeft className="size-4 mr-1" />
          Back to seasons
        </Button>

        <div
          className={`w-full py-2 rounded-container px-3 border text-xs font-medium
            ${data.activity.verificationStatus === "approved" ? "bg-green-100 border-green-600 text-green-600" : ""}
            ${data.activity.verificationStatus === "rejected" ? "bg-red-100 border-red-600 text-red-600" : ""}
            ${data.activity.verificationStatus === "pending" ? "bg-amber-100 border-amber-600 text-amber-600" : ""}
          `}
        >
          This record is {data.activity.verificationStatus === "unknown" ? "imported" : data.activity.verificationStatus}.
        </div>

        <div className="flex flex-row gap-4">
          <DataGroup
            icon={<User className="size-4" />}
            title="Farmer & Collection"
            data={{
              ...data.collection,
              collectedBy: data.collection.collectedBy
                ? `${data.collection.collectedBy.first_name} ${data.collection.collectedBy.last_name}`
                : 'N/A',
              verifiedBy: data.collection.verifiedBy
                ? `${data.collection.verifiedBy.first_name} ${data.collection.verifiedBy.last_name}`
                : null,
            } as unknown as typeof data.collection}
          />
          <DataGroup icon={<Grid2x2 className="size-4" />} title="Field & Location" data={data.field} />
          <DataGroup icon={<Grid2x2 className="size-4" />} title="Season & Status" data={data.season} />
        </div>

        {/* Form Data */}
        <FormDataSection data={data.activity.formData} />

        {/* Images and Verification (only if not imported) */}
        {data.activity.verificationStatus !== "unknown" && (
          <>
            <ImagesSection images={data.activity.imageUrls} />
            <VerificationSection
              data={data}
              remarks={remarks}
              onRemarksChange={setRemarks}
              onVerify={handleVerify}
              isVerifying={verifyMutation.isPending}
            />
          </>
        )}
      </div>
    </div>
  );
}

function DataGroup({ data, title, icon }: { data: FormDataGroup; title: string; icon: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col gap-4 border rounded-container p-4">
      <div className="flex gap-2 items-center">
        {icon}
        <h1 className="text-sm">{title}</h1>
      </div>
      <KVList className="gap-2">
        {Object.entries(data).map(([key, value]) => (
          <KVItem
            variant="side"
            key={key}
            pair={{
              key: Sanitizer.key(key, formKeyMappings),
              value: Sanitizer.value(value),
            }}
          />
        ))}
      </KVList>
    </div>
  );
}

function FormDataSection({ data }: { data: FormData }) {
  const { applications, monitoring_visit, ...otherData } = data as any;

  return (
    <section className="p-4 flex flex-col gap-4 border rounded-container">
      <div className="flex gap-2 items-center">
        <Combine className="size-4" />
        <h1 className="text-sm">Form Data</h1>
      </div>
      <div>
        <KVList className="gap-2" itemsPerColumn={5} containerClassName="gap-8">
          {Object.entries(otherData).map(([key, value]) => (
            <KVItem key={key} pair={{ key: Sanitizer.key(key, formKeyMappings), value: Sanitizer.value(value) }} />
          ))}
        </KVList>
        {monitoring_visit && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex gap-2 mb-2 items-center">
              <Combine className="size-4" />
              <h1 className="text-sm">Monitoring Visit</h1>
            </div>
            <KVList className="gap-2">
              {Object.entries(monitoring_visit).map(([key, value]) => (
                <KVItem key={key} pair={{ key: Sanitizer.key(key, formKeyMappings), value: Sanitizer.value(value) }} />
              ))}
            </KVList>
          </div>
        )}
        {applications && <FertilizerApplicationsList applications={applications} />}
      </div>
    </section>
  );
}

function ImagesSection({ images }: { images?: string[] | null }) {
  if (!images?.length) {
    return (
      <section className="p-4 border rounded-container">
        <div className="flex gap-2 items-center">
          <Camera className="size-4" />
          <h1 className="text-sm">Field Images</h1>
        </div>
        <p className="text-xs text-muted-foreground mt-2">No images available</p>
      </section>
    );
  }

  const labels = ["Front View", "Right View", "Left View", "Back View", "Close up"];
  const slots = Array.from({ length: 5 }, (_, i) => ({
    url: i < images.length ? images[i] : null,
    label: labels[i],
  }));

  return (
    <section className="p-4 border rounded-container">
      <div className="flex gap-2 items-center mb-4">
        <Camera className="size-4" />
        <h1 className="text-sm">Field Images</h1>
      </div>
      <div className="grid grid-cols-5 gap-4">
        {slots.map(({ url, label }, idx) => (
          <div key={idx} className="flex flex-col gap-2 items-center">
            {url ? (
              <img src={url} alt={label} className="w-full aspect-square object-cover rounded-sm" crossOrigin="anonymous" />
            ) : (
              <div className="w-full aspect-square rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
                No image
              </div>
            )}
            <Label className="text-muted-foreground text-3xs">{label}</Label>
          </div>
        ))}
      </div>
    </section>
  );
}

function VerificationSection({ data, remarks, onRemarksChange, onVerify, isVerifying }: {
  data: FormDataEntry;
  remarks: string;
  onRemarksChange: (value: string) => void;
  onVerify: (status: 'approved' | 'rejected') => void;
  isVerifying: boolean;
}) {
  const isPending = data.activity.verificationStatus === 'pending';

  return (
    <section className="p-4 flex flex-col gap-4 border rounded-container">
      <div className="flex gap-2 items-center">
        <SquareCheckBig className="size-4" />
        <h1 className="text-sm">Verification</h1>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Remarks</p>
        {isPending ? (
          <Textarea
            className="resize-none min-h-24 text-xs"
            placeholder="Add any comments or observations..."
            value={remarks}
            onChange={(e) => onRemarksChange(e.target.value)}
            disabled={isVerifying}
          />
        ) : (
          <div className="p-3 bg-muted/10 rounded-md text-xs whitespace-pre-wrap">
            {data.activity.remarks || <span className="text-muted-foreground italic">No remarks provided</span>}
          </div>
        )}
      </div>

      {isPending && (
        <div className="flex gap-4">
          <Button size="sm" className="flex-1" onClick={() => onVerify('approved')} disabled={isVerifying}>
            {isVerifying ? 'Approving...' : 'Approve'}
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onVerify('rejected')} disabled={isVerifying}>
            {isVerifying ? 'Rejecting...' : 'Reject'}
          </Button>
        </div>
      )}
    </section>
  );
}
