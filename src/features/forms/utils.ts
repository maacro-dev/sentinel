import { FORM_LABELS } from "./config";
import { ACTIVITY_TYPE } from "./mappings";
import { Form } from "./schemas/forms";
import { FieldSchema } from "./schemas/import-schema";
import * as z from "zod/v4"

export function getActivityType(form: Form): string {
  return ACTIVITY_TYPE[form]
}

export function getFormLabel(value: string): string {
  return FORM_LABELS[value as keyof typeof FORM_LABELS] || value;
}

export function field(schema: Omit<FieldSchema, 'required'> & { required?: boolean }): FieldSchema {
  return ({
    required: true,
    ...schema,
  });
}


export const zodNumberRange = (min: number, max: number) =>
  z.string().refine((val) => !isNaN(parseFloat(val)), "Must be a number")
    .check(({ value, issues }) => {
      const num = parseFloat(value);
      if (num < min) {
        issues.push({ code: "custom", input: num, message: `Must be at least ${min}` });
      } else if (num > max) {
        issues.push({ code: "custom", input: num, params: { level: 'warning' as const }, message: `Exceeds ${max}` });
      }
    });


export const strclean = (val: string) => val.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim()
export const strcleanOpt = (val?: string) =>
  val?.replace(/[\r\n]+/g, " ")
     .replace(/\s+/g, " ")
     .trim() ?? ""

export const parseNameParts = (name: string): { first?: string; last?: string; warning?: string } => {
  const cleaned = name.trim();
  if (!cleaned || cleaned === 'N/A') {
    return {};
  }

  let parts = cleaned.split(/\s+/);
  if (parts.length > 1 && /^\d+$/.test(parts[parts.length - 1])) {
    parts = parts.slice(0, -1);
  }

  if (parts.length < 2) {
    return { warning: 'Name must include at least first and last name' };
  }

  const first = parts[0];
  const last = parts[parts.length - 1];

  let warning: string | undefined;
  if (parts.length > 3) {
    const middleOrExtras = parts.slice(1, -1).join(' ');
    warning = `Name has extra word(s) (${middleOrExtras}). Please verify last name is correct.`;
  }

  return { first, last, warning };
};
