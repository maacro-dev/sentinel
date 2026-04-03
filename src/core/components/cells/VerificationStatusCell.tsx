import { capitalizeFirst } from "@/core/utils/string";
import { cn } from "@/core/utils/style";
import { cva, VariantProps } from "class-variance-authority";


const statusVariants = cva(
  "rounded-sm text-[0.7rem] font-medium px-2 py-1 w-16 text-center",
  {
    variants: {
      variant: {
        approved: "bg-green-200 text-green-800",
        pending: "bg-yellow-200 text-yellow-800",
        rejected: "bg-red-200 text-red-800",
        unknown: "bg-neutral-300"
      },
    },
    defaultVariants: {
      variant: "pending",
    },
  }
)

interface VerificationStatusCellProps extends VariantProps<typeof statusVariants> {
  value: string;
}

export const VerificationStatusCell = ({ value, variant }: VerificationStatusCellProps) => {
  const v = value === "unknown" ? "imported" : value

  return (
    <span className={cn(statusVariants({ variant }))}>
      {capitalizeFirst(v)}
    </span>
  );
}
