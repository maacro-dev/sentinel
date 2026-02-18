import { Button } from "@/core/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/core/components/ui/empty";
import { Database } from 'lucide-react';
import { Form } from '@/features/forms/schemas/forms';
import { useRef } from 'react';

interface DatasetSelectorProps {
  onSelect: (type: Form) => void;
  onFileHandle: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const forms = [
  "field_plannings",
  "crop_establishments",
  "fertilization_records",
  "harvest_records",
  "damage_assessments",
  "monitoring_visits"
] as Form[];


interface DatasetSelectorProps {
  onSelect: (type: Form) => void;
  onFileHandle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string | null;
}

export function DatasetSelector({ onSelect, onFileHandle, error }: DatasetSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDatasetClick = (type: Form) => {
    onSelect(type);
    fileInputRef.current?.click();
  };

  return (
    <div className='h-full flex flex-col justify-center items-center'>
      <Empty className="border border-muted-foreground/40 border-dashed max-h-[500px] w-3/5">
        <EmptyHeader>
          <EmptyMedia variant="icon"><Database /></EmptyMedia>
          <EmptyTitle>Choose Dataset Type</EmptyTitle>
          <EmptyDescription className="text-sm max-w-[70ch]">
            Select the type of data you're importing, then pick a CSV file.
          </EmptyDescription>
        </EmptyHeader>
        <div className="grid grid-cols-2 gap-4">
          {forms.map(type => (
            <Button
              className="text-xs"
              key={type}
              variant="outline"
              onClick={() => handleDatasetClick(type)}
            >
              {type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </Button>
          ))}
        </div>

        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}

        <EmptyContent />
      </Empty>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".csv"
        onChange={onFileHandle}
      />
    </div>
  );
}
