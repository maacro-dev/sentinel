import { cropEstablishmentsValidation } from "../validation/crop-establishments";
import { damageAssessmentsValidation } from "../validation/damage-assessments";
import { fertilizationRecordsValidation } from "../validation/fertilization-records";
import { field_plannings_schema, fieldPlanningsValidation } from "../validation/field-plannings";
import { harvestRecordsValidation } from "../validation/harvest-records";
import { monitoringVisitsValidation } from "../validation/monitoring-visits";
import { Form } from "./forms";
import * as z from "zod/v4";

export interface FieldSchema {
  name: string;
  required?: boolean
  validate?: (value: string, row: any) => string | null;
}


export const formSchemas: Record<Form, z.ZodObject<any> | null> = {
  field_plannings: field_plannings_schema,
  crop_establishments: null,
  fertilization_records: null,
  harvest_records: null,
  monitoring_visits: null,
  damage_assessments: null,

}

export const datasetSchemas: Record<Form, FieldSchema[]> = {
  field_plannings: fieldPlanningsValidation,
  crop_establishments: cropEstablishmentsValidation,

  // to review
  fertilization_records: fertilizationRecordsValidation,

  harvest_records: harvestRecordsValidation,
  monitoring_visits: monitoringVisitsValidation,
  damage_assessments: damageAssessmentsValidation,
};
