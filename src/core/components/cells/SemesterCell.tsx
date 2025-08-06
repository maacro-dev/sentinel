import { capitalizeFirst } from "@/core/utils/string";

export const SemesterCell = ({ value }: { value: string }) => {
  return (
    <span>{capitalizeFirst(value)}</span>
  );
}
