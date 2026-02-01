
import { Button } from "@/core/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/core/components/ui/empty"
import { Import } from 'lucide-react'
import { useRef, useState } from "react"
import Papa from "papaparse"


export function DataImportPrompt() {
  const { preview, handleFiles } = useImport();

  if (preview.length > 0) {
    console.log(preview)
  }

  return (
    <Empty className="border border-muted-foreground/40 border-dashed max-h-96 w-3/5">
      <EmptyHeader>
        <EmptyMedia variant="icon"><Import /></EmptyMedia>
        <EmptyTitle>Import Data</EmptyTitle>
        <EmptyDescription className="text-sm max-w-[70ch]">
          Upload your CSV file to import data
        </EmptyDescription>
      </EmptyHeader>
      <ImportButton handleFiles={handleFiles} />
      <EmptyContent>
      </EmptyContent>
    </Empty>
  )
}

export function ImportButton({ handleFiles }: {
  handleFiles: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".csv,.xlsx,.xls"
        onChange={handleFiles}
      />

      <Button variant="outline" onClick={() => inputRef.current?.click()}>
        Upload Files
      </Button>
    </>
  )
}

export function useImport() {
  const [preview, setPreview] = useState<any[]>([]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name.toLowerCase();

    if (name.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        complete: (r) => setPreview(r.data),
      });
    } else {
      console.warn("Only CSV files are supported for now.");
    }
  };

  return { preview, handleFiles };
}
