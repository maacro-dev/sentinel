import { capitalizeFirst } from "@/core/utils/string";
import { cn } from "@/core/utils/style";
import { cva, VariantProps } from "class-variance-authority";
import { ReactNode } from "react";


const statusVariants = cva(
  "rounded-sm text-[0.7rem] font-medium px-2 py-1 w-18 text-center",
  {
    variants: {
      variant: {
        approved: "bg-green-200 text-green-800",
        completed: "bg-green-200 text-green-800",
        pending: "bg-yellow-200 text-yellow-800",
        rejected: "bg-red-200 text-red-800",
        unknown: "bg-neutral-300",
        overdue: "bg-destructive text-white",
        warning: "bg-yellow-100 text-yellow-800",
      },
    },
    defaultVariants: {
      variant: "pending",
    },
  }
)

const normalizeStatus = (value?: string | null) => {
  if (value == null) return "—";
  if (value === "unknown") return "imported";
  return value;
};

interface VerificationStatusCellProps extends VariantProps<typeof statusVariants> {
  value: string | null | undefined;
}

export const VerificationStatusCell = ({ value, variant }: VerificationStatusCellProps) => {
  const v = normalizeStatus(value);

  return (
    <span className={cn(statusVariants({ variant }))}>
      {capitalizeFirst(v)}
    </span>
  );
}


interface CollectionStatusCellProps
  extends VariantProps<typeof statusVariants> {
  value?: string | null;
  children?: ReactNode;
}

export const CollectionStatusCell = ({ value, variant, children, }: CollectionStatusCellProps) => {

  const v = normalizeStatus(value);

  return (
    <div className="flex flex-col items-start gap-1">
      <span className={cn(statusVariants({ variant }))}>
        {children ?? capitalizeFirst(v)}
      </span>
    </div>
  );
};
