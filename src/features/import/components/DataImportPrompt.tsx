
/**
 *
 * currently unused
 */

import { Button } from "@/core/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/core/components/ui/empty";
import { Import } from 'lucide-react';
import { useRef } from "react";

interface DataImportPromptProps {
  onFileHandle: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function DataImportPrompt({ onFileHandle }: DataImportPromptProps) {
  return (
    <div className='h-full flex flex-col justify-center items-center'>
      <Empty className="border border-muted-foreground/40 border-dashed max-h-[500px] w-3/5">
        <EmptyHeader>
          <EmptyMedia variant="icon"><Import /></EmptyMedia>
          <EmptyTitle>Import Data</EmptyTitle>
          <EmptyDescription className="text-sm max-w-[70ch]">
            Upload your CSV file to import data
          </EmptyDescription>
        </EmptyHeader>
        <ImportButton handleFiles={onFileHandle} />
        <EmptyContent />
      </Empty>
    </div>
  );
}

function ImportButton({ handleFiles }: { handleFiles: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input ref={inputRef} type="file" className="hidden" accept=".csv" onChange={handleFiles} />
      <Button variant="outline" onClick={() => inputRef.current?.click()}>Upload Files</Button>
    </>
  );
}
