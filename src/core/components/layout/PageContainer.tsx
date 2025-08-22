import { cn } from "@/core/utils/style";
import { Motion } from "../Motion";

export const PageContainer = ({ className, children, ...rest}: React.ComponentProps<"div">) => {
  return (
    <Motion id="page-container" className={cn("flex flex-col gap-4 p-4 min-h-0 min-w-0 overflow-auto", className)} {...rest}>
      {children}
    </Motion>
  );
}
