import * as z from 'zod/v4'

export const mfidSchema = z.preprocess(
  (mfid) => (mfid === undefined ? undefined : `${mfid}`),
  z.optional(z.string())
)
