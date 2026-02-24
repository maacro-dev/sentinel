import { crop_establishments_schema } from "../validation/crop-establishments";
import { field_plannings_schema } from "../validation/field-plannings";
import { harvest_records_schema } from "../validation/harvest-records";
import { Form } from "./forms";
import * as z from "zod/v4";

export interface FieldSchema {
  name: string;
  required?: boolean
  validate?: (value: string, row: any) => string | null;
}


export const formSchemas: Record<Form, z.ZodObject<any> | null> = {
  field_plannings: field_plannings_schema,
  crop_establishments: crop_establishments_schema,
  fertilization_records: null,
  harvest_records: harvest_records_schema,
  monitoring_visits: null,
  damage_assessments: null,

}
