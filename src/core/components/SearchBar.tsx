import { cn } from "@/core/utils/style";
import { SearchIcon } from "lucide-react";
import { Input } from "../../core/components/ui/input";

export function SearchBar({
  containerClassName,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      containerClassName={cn("w-72 h-8", containerClassName)}
      renderPrefix={(focused) => (
        <SearchIcon size={18} className={cn(
            "text-muted-foreground/50 transition-colors",
            focused && "text-muted-foreground",
          )}
        />
      )}
      {...props}
    />
  )
}
