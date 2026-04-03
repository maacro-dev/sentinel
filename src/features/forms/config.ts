import { ActivityType, Form } from "./schemas/forms";

export const FORM_LABELS: Record<Form, string> = {
  field_plannings: "Field Data",
  crop_establishments: "Cultural Management",
  fertilization_records: "Nutrient Management",
  harvest_records: "Production",
  monitoring_visits: "Monitoring Visit",
  damage_assessments: "Damage Assessment",
}

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  "field-data": "Field Data",
  "cultural-management": "Cultural Management",
  "nutrient-management": "Nutrient Management",
  production: "Production",
  "damage-assessment": "Damage Assessment",
  "monitoring-visit": "Monitoring Visit"
}

