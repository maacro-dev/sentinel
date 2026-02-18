import { FORM_LABELS } from "./config";
import { FieldSchema } from "./schemas/import-schema";


export function getFormLabel(value: string): string {
  return FORM_LABELS[value as keyof typeof FORM_LABELS] || value;
}

export function field(schema: Omit<FieldSchema, 'required'> & { required?: boolean }): FieldSchema {
  return ({
    required: true,
    ...schema,
  });
}


