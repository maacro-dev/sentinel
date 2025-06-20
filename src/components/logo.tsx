import { Leaf } from "lucide-react";

function HumayLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-green-600 text-white flex aspect-square size-8 items-center justify-center rounded-lg">
        <Leaf className="size-4" />
      </div>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">Humay</span>
        <span className="truncate text-xs">Sentinel</span>
      </div>
    </div>
  );
}

export default HumayLogo;
