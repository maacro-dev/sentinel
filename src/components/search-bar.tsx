import { cn } from "@/lib/utils";
import { SearchIcon } from "lucide-react";
import { Input } from "./ui/input";


export function SearchBar() {
  return (<Input
    placeholder="Search"
    className="w-72"
    renderPrefix={(focused) => (
      <SearchIcon size={22} className={cn(
        "text-muted-foreground/50 transition-colors", 
        focused && "text-primary"
      )} 
      />
    )}
  />)
}