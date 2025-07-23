import { ToggleGroup, ToggleGroupItem } from "@/core/components/ui/toggle-group";
import { Role } from "../schemas";
import { CheckIcon } from "lucide-react";
import { cn } from "@/core/utils/style";
import { getRoleLabel } from "../utils";

interface RoleToggleGroupProps {
  value: Role;
  onChange: (value: Role) => void;
  options?: {
    data_collector?: boolean;
    data_manager?: boolean;
  };
}

export function RoleToggleGroup({
  value = "data_collector",
  onChange = () => { },
  options = { data_collector: true, data_manager: true },
}: RoleToggleGroupProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v: Role) => v && onChange(v)}
      className="gap-2 flex-1 w-full"
    >
      <RoleToggle
        role="data_collector"
        disabled={!options.data_collector}
        selected={value === "data_collector"}
      />
      <RoleToggle
        role="data_manager"
        disabled={!options.data_manager}
        selected={value === "data_manager"}
      />
    </ToggleGroup>
  );
}

export function RoleToggle({
  role,
  disabled,
  selected,
}: {
  role: Role;
  disabled: boolean;
  selected: boolean;
}) {
  return (
    <ToggleGroupItem
      value={role}
      variant="default"
      disabled={disabled}
      className={cn(
        "transition-all duration-300",
        "h-8 py-2 rounded-md border text-xs flex items-center gap-2",
        selected ? "px-3" : "px-2"
      )}
    >
      {selected && <CheckIcon className="w-4 h-4 transition-opacity" />}
      <span
          className={cn(selected ? "text-primary" : "text-muted-foreground"
        )}
      >{getRoleLabel(role)}</span>
    </ToggleGroupItem>

  );
}
