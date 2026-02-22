import { CheckCircle } from 'lucide-react';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/core/components/ui/empty";
import { Button } from '@/core/components/ui/button';

interface DataSuccessProps {
  rowsImported: number;
  onImportAnother: () => void;
}

export function DataSuccess({ rowsImported, onImportAnother }: DataSuccessProps) {
  return (
    <div className='h-full flex flex-col justify-center items-center'>
      <div className="w-3/5">
        <Empty className="border-none max-h-[500px]">
          <EmptyHeader>
            <EmptyMedia variant="icon"><CheckCircle /></EmptyMedia>
            <EmptyTitle>Import Complete</EmptyTitle>
            <EmptyDescription className="">
              <div>
                <p className="text-sm text-muted-foreground">Rows Imported</p>
                <p className="text-lg font-semibold">{rowsImported}</p>
              </div>
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button className='w-full' onClick={onImportAnother} >
              Import another dataset
            </Button>
          </EmptyContent>
        </Empty>
        <div className="flex flex-col gap-3">
        </div>
      </div>
    </div>
  );
}
