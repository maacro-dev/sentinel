import { MapPin } from "lucide-react";


export function AddressCell({ value }: { value: string }) {
  const [barangay, municipality, province] = value.split(", ");

  return (
    <div className="flex flex-col gap-1">
      <span className="font-semibold inline-flex items-center">
        <MapPin className="size-3 mr-0.5" />
        {barangay}
      </span>
      <span className="text-muted-foreground/75 text-[0.7rem]">
        {municipality + ", " + province}
      </span>
    </div>
  );
}
