import { cropEstablishmentsValidation } from "../validation/crop-establishments";
import { damageAssessmentsValidation } from "../validation/damage-assessments";
import { fertilizationRecordsValidation } from "../validation/fertilization-records";
import { fieldPlanningsValidation } from "../validation/field-plannings";
import { harvestRecordsValidation } from "../validation/harvest-records";
import { monitoringVisitsValidation } from "../validation/monitoring-visits";
import { Form } from "./forms";

export interface FieldSchema {
  name: string;
  required?: boolean
  validate?: (value: string, row: any) => string | null;
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
