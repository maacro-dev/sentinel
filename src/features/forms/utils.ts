import { FORM_LABELS } from "./config";


export function getFormLabel(value: string): string {
  return FORM_LABELS[value as keyof typeof FORM_LABELS] || value;
}
