import { CoreMetadataType } from "@/features/forms/schemas/forms";

export const PREREQUISITE_ORDER: CoreMetadataType[] = [
  "field-data",
  "cultural-management",
  "nutrient-management",
  "production",
];

export const CORE_GROUPS: CoreMetadataType[][] = [
  ['field-data'],
  ['cultural-management'],
  ['nutrient-management', 'production'],
];
