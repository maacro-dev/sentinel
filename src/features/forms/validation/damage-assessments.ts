import { z } from "zod/v4";
import { baseFields } from "./base";
import { strclean, strcleanOpt, zodNumberRange } from "../utils";

export const damage_assessments_schema = baseFields.extend({
  cause: z.string().transform(strclean),
  crop_stage: z.string().transform(strclean),
  soil_type: z.string().transform(strclean),
  severity: z.string().transform(strclean),
  affected_area_ha: zodNumberRange(0.01, 100),
  observed_pest: z.string().optional().transform(val => val === "" ? undefined : strcleanOpt(val)),
});
