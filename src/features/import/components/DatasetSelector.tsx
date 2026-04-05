import { Button } from "@/core/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/core/components/ui/empty";
import { Database } from 'lucide-react';
import { Form } from '@/features/forms/schemas/forms';
import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/core/components/ui/dialog"
import { FileError } from "../types";

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
] as Form[];


interface DatasetSelectorProps {
  onSelect: (type: Form) => void;
  onFileHandle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileError?: FileError | null;
}

export function DatasetSelector({ onSelect, onFileHandle, fileError }: DatasetSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorOpen, setErrorOpen] = useState(false)

  useEffect(() => {
    if (fileError) setErrorOpen(true)
  }, [fileError])

  const handleDatasetClick = (type: Form) => {
    onSelect(type);
    fileInputRef.current?.click();
  };

  return (
    <>
      <div className='h-full flex flex-col justify-center items-center'>
        <Empty className="border border-muted-foreground/40 border-dashed max-h-125 w-3/5">
          <EmptyHeader>
            <EmptyMedia variant="icon"><Database /></EmptyMedia>
            <EmptyTitle>Choose Dataset Type</EmptyTitle>
            <EmptyDescription className="text-sm max-w-[70ch]">
              Select the type of data you're importing, then pick a CSV file.
            </EmptyDescription>
          </EmptyHeader>
          <div className="flex flex-wrap justify-center w-120 gap-4 decoration-humay-bg">
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

      <Dialog open={errorOpen} onOpenChange={setErrorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Error</DialogTitle>
            <DialogDescription className="mt-1.5">
              <p>{fileError?.message}</p>
              <ul className="ml-6 list-disc [&>li]:mt-2">
                {fileError?.missingColumns?.map(col => (
                  <li>{col}</li>
                ))}
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setErrorOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
