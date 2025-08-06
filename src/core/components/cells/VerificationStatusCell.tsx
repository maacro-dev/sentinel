import { capitalizeFirst } from "@/core/utils/string";
import { cn } from "@/core/utils/style";
import { cva, VariantProps } from "class-variance-authority";


const statusVariants = cva(
  "rounded-sm text-[0.7rem] font-medium px-2 py-1",
  {
    variants: {
      variant: {
        verified: "bg-green-100 text-green-800",
        pending: "bg-yellow-100 text-yellow-800",
        rejected: "bg-red-100 text-red-800",
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
  return (
    <span className={cn(statusVariants({ variant }))}>
      {capitalizeFirst(value)}
    </span>
  );
}
