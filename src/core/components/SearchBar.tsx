import { cn } from "@/core/utils/style";
import { SearchIcon } from "lucide-react";
import { Input } from "../../core/components/ui/input";

export function SearchBar({
  containerClassName,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      containerClassName={cn("w-72", containerClassName)}
      renderPrefix={(focused) => (
        <SearchIcon size={22} className={cn(
            "text-muted-foreground/50 transition-colors",
            focused && "text-primary",
          )}
        />
      )}
      {...props}
    />
  )
}
