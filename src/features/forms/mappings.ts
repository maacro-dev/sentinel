import { Form } from "./schemas/forms"


export const formKeyMappings: Record<string, string> = {
  'MFID': 'Monitoring Field ID',
  "est": "Estimated",
  "id": "ID",
  "ha": "(ha)"
}

export const ACTIVITY_TYPE: Record<Form, string> = {
  field_plannings: "field-data",
  crop_establishments: "cultural-management",
  fertilization_records: "nutrient-management",
  harvest_records: "production",
  damage_assessments: "damage-assessment",
  monitoring_visits: "monitoring-visit",
}
