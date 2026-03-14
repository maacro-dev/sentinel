
// refactor this shit


import * as z from "zod/v4"
import { strclean, strcleanOpt, zodNumberRange } from "../utils";
import { baseFields } from "./base";

// export const fertilizer_application_schema = z.object({
//   // commented out for now
//   // fertilizer_type: z.string(),
//   brand: z.string(),
//   nitrogen_content_pct: zodNumberRange(0, 100),
//   phosphorus_content_pct: zodNumberRange(0, 100),
//   potassium_content_pct: zodNumberRange(0, 100),
//   amount_applied: z.number().positive(),
//   amount_unit: z.string(),
//   crop_stage_on_application: z.string(),
// });

// export const fertilization_records_schema = baseFields.extend({
//   applied_area_sqm: zodNumberRange(0.01, 100000),
//   fertilizer_applications: z.array(fertilizer_application_schema).min(1),
// });

// export type FertilizationRecord = z.infer<typeof fertilization_records_schema>;

const MAX_APPS = 3;

const flatShape: any = {
  ...baseFields.shape,
  applied_area_sqm: zodNumberRange(0.01, 100000),
};

for (let i = 1; i <= MAX_APPS; i++) {

  flatShape[`brand_${i}`] = z.string().transform(strclean);

  flatShape[`fertilizer_type_${i}`] = z.string().transform(strclean);

  flatShape[`nitrogen_content_pct_${i}`] = zodNumberRange(0, 100);

  flatShape[`phosphorus_content_pct_${i}`] = zodNumberRange(0, 100);

  flatShape[`potassium_content_pct_${i}`] = zodNumberRange(0, 100);

  flatShape[`amount_applied_${i}`] = z.string().transform(strclean);

  flatShape[`amount_unit_${i}`] = z.string().transform(strclean);

  flatShape[`crop_stage_on_application_${i}`] = z.string().transform(strclean);

  // For i > 1, make fields optional
  if (i > 1) {
    flatShape[`brand_${i}`] = z.string()
      .transform(val => val === "N/A" ? undefined : val)
      .transform(strcleanOpt);

    flatShape[`fertilizer_type_${i}`] = z.string()
      .transform(val => val === "N/A" ? undefined : val)
      .transform(strcleanOpt);

    flatShape[`nitrogen_content_pct_${i}`] = z.string().optional()
      .transform(val => val === "N/A" ? undefined : val)
      .refine(val => val === undefined || !isNaN(parseFloat(val)), "Must be a number")
      .transform(val => val === undefined ? undefined : Number(val));

    flatShape[`phosphorus_content_pct_${i}`] = z.string().optional()
      .transform(val => val === "N/A" ? undefined : val)
      .refine(val => val === undefined || !isNaN(parseFloat(val)), "Must be a number")
      .transform(val => val === undefined ? undefined : Number(val));

    flatShape[`potassium_content_pct_${i}`] = z.string().optional()
      .transform(val => val === "N/A" ? undefined : val)
      .refine(val => val === undefined || !isNaN(parseFloat(val)), "Must be a number")
      .transform(val => val === undefined ? undefined : Number(val));

    flatShape[`amount_applied_${i}`] = z.string().optional()
      .transform(val => val === "N/A" ? undefined : val)
      .refine(val => val === undefined || !isNaN(parseFloat(val)), "Must be a number")
      .transform(val => val === undefined ? undefined : Number(val));

    flatShape[`amount_unit_${i}`] = z.string().optional()
      .transform(val => val === "N/A" ? undefined : val)
      .transform(strcleanOpt);

    flatShape[`crop_stage_on_application_${i}`] = z.string().optional()
      .transform(val => val === "N/A" ? undefined : val)
      .transform(strcleanOpt);
  }
}

export const fertilization_records_schema = z.object(flatShape).superRefine((data, ctx) => {
  for (let i = 2; i <= MAX_APPS; i++) {
    const fields = [
      `fertilizer_type_${i}`,
      `brand_${i}`,
      `nitrogen_content_pct_${i}`,
      `phosphorus_content_pct_${i}`,
      `potassium_content_pct_${i}`,
      `amount_applied_${i}`,
      `amount_unit_${i}`,
      `crop_stage_on_application_${i}`
    ];
    const anyPresent = fields.some(f => data[f as keyof typeof data] != null && data[f as keyof typeof data] !== '');
    if (anyPresent) {
      fields.forEach(f => {
        const val = data[f as keyof typeof data];
        console.log(`Field ${f}: value =`, val);
        if (val == null || val === '') {
          console.log(`  → adding issue for ${f}`);
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [f],
            message: `All fields for application ${i} must be filled when any field is provided.`
          });
        }
      });
    }
  }
});
