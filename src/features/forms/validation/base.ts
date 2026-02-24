import { toIso } from "@/core/utils/date";
import { FieldSchema } from "../schemas/import-schema";
import { field, strclean } from "../utils";
import * as z from "zod/v4"

const nameRegex = /^[A-Za-z\s\-,.]+$/;

const tempMfidRegex = /^60(04|06|19|30|45|79)\d{2}\d{3}$/;

// todo: validate using Lgu service

export const baseFields = z.object({
  province: z.string().transform(strclean),

  municity: z.string().transform(strclean),

  barangay: z.string()
    .transform(str => strclean(str)
      .replace(/\bSto\./gi, "Santo")
      .replace(/\bSta\./gi, "Santa")
      // .replace(/\b\p{L}[\p{L}\p{M}']*(?:-\p{L}[\p{L}\p{M}']*)*/gu, word =>
      //   word[0].toUpperCase() + word.slice(1).toLowerCase()
      // )
      // .replace(/\bBitoon\.?\b/gi, "Bito-on")
      // .replace(/mambiranan pequiño/gi, "Mambiranan Pequeño")
      // .replace(/cubay-napultan/gi, "Cubay-Napultan")
      // .replace(/intongcan/gi, "Intungcan")
      // .replace(/\bIii\b/g, "III")
      // .replace(/\bIi\b/g, "II")
    ),

  mfid: z.string().regex(/^60(04|06|19|30|45|79)\d{2}\d{3}$/, 'Not a valid Monitoring Field ID'),

  first_name: z.string().regex(/^[A-Za-z\s\-,.]+$/, 'Only letters, spaces, hyphens, commas, periods allowed'),

  last_name: z.string().regex(/^[A-Za-z\s\-,.]+$/, 'Only letters, spaces, hyphens, commas, periods allowed'),

  collected_by: z.string().transform(strclean),

  collected_at: z.string().transform(strclean).transform(toIso),
})



export const baseFieldsValidation: FieldSchema[] = [

  // province, municity, barangay
  // - should query database to validate
  // - there could be cases where there are small differences on letters, spelling
  field({ name: "province" }),
  field({ name: "municity" }),
  field({ name: "barangay" }),

  // mfid
  // - should cross-check with the mfid in the database
  // - if found, check if there is already an entry of that season
  // - if not found, warn the user and prompt the user that there are mfids that are not created, and if to automatically create them
  // - ...more edge cases to come
  field({
    name: 'mfid',
    validate: (v) => !v ? null : tempMfidRegex.test(v) ? null : 'Not a valid Monitoring Field ID '
  }),

  {
    name: 'first_name',
    validate: (v) => !v ? null : nameRegex.test(v) ? null : 'Only letters, spaces, hyphens, commas, periods allowed'
  },
  {
    name: 'last_name',
    validate: (v) => !v ? null : nameRegex.test(v) ? null : 'Only letters, spaces, hyphens, commas, periods allowed'
  },

  // current format is "{full name} {id}"
  // we can check for only the full name in the database
  // if user (data-collector) is not found, warn the user (to be determined)
  { name: 'collected_by' },

  { name: 'collected_at' },
]
