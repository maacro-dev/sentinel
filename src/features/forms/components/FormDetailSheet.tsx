import { Button } from "@/core/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/core/components/ui/sheet"
import { FormDataEntry } from "../schemas/formData"
import { KVList, KVItem } from "@/core/components/KeyValue"
import { flatten } from "@/core/utils/object"
import { Sanitizer } from "@/core/utils/sanitizer"
import { formKeyMappings } from "../mappings"

interface FormDetailSheetProps {
  data: FormDataEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const FormDetailSheet = ({
  data,
  open,
  onOpenChange
}: FormDetailSheetProps) => {
  if (!data) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent forceMount>
        <SheetHeader>
          <SheetTitle>{Sanitizer.key(data.activity_type)}</SheetTitle>
          <SheetDescription>
            MFID - {Sanitizer.value(data.mfid)}
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <KVList itemsPerColumn={8}>
            {flatten(data, "form_data").map(([key, value]) => (
              <KVItem
                key={key}
                pair={{
                  key: Sanitizer.key(key, formKeyMappings),
                  value: Sanitizer.value(value),
                }}
              />
            ))}
          </KVList>
        </div>
        <SheetFooter>
          <Button type="submit">Verify</Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
