import Logo from "@/assets/logo.svg?react";

function HumayLogo({ hideLabel = false }: { hideLabel?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {/* <div className="bg-green-600 text-white flex aspect-square size-8 items-center justify-center rounded-lg"> */}
      <Logo className="rounded-lg aspect-square size-12" />
      {/* </div> */}
      {!hideLabel && (
        <div className="flex flex-col mt-1">
          <span className="truncate text-base font-medium leading-tight">Humay</span>
          <span className="truncate text-[0.7rem] text-muted-foreground/60">Sentinel</span>
        </div>
      )}
    </div>
  );
}

export default HumayLogo;
