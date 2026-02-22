import { FieldSchema } from "../schemas/import-schema";
import { field } from "../utils";

const nameRegex = /^[A-Za-z\s\-,.]+$/;

const tempMfidRegex = /^06(40|60|19|03|79)\d{2}\d{3}$/;


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
