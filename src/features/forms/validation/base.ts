import { FieldSchema } from "../schemas/import-schema";

export const baseFieldsValidation: FieldSchema[] = [

    // province, municity, barangay
    // - should query database to validate
    // - there could be cases where there are small differences on letters, spelling

    // mfid
    // - should cross-check with the mfid in the database
    // - if found, check if there is already an entry of that season
    // - if not found, warn the user and prompt the user that there are mfids that are not created, and if to automatically create them
    // - ...more edge cases to come

    { name: 'first_name', validate: (v) => !v ? null : /^[A-Za-z\s\-]+$/.test(v) ? null : 'Only letters, spaces, hyphens allowed' },
    { name: 'last_name', validate: (v) => !v ? null : /^[A-Za-z\s\-]+$/.test(v) ? null : 'Only letters, spaces, hyphens allowed' },

    // current format is "{full name} {id}"
    // we can check for only the full name in the database
    // if user (data-collector) is not found, warn the user (to be determined)
    { name: 'collected_by' },

    { name: 'collected_at' },
]
