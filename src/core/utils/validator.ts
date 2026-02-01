import * as z from "zod/v4";

export type ValidatorFn<TOutput> = (v: unknown) => TOutput;

export class Validator {
  static create<TOutput>(schema: z.ZodType<TOutput>, id: string = "unknown"): ValidatorFn<TOutput> {
    return (v: unknown): TOutput => {
      const result = schema.safeParse(v);
      if (!result.success) {
        console.error(`[${id}] - Validation failed`, {
          id,
          error: result.error,
          input: v,
        });
        throw new Error(`[${id}] ${z.prettifyError(result.error)}`);
      }
      return result.data;
    };
  }
}
