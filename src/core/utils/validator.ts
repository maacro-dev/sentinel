import * as z from "zod/v4";

export type ValidatorFn<TOutput> = (v: unknown) => TOutput;
export class Validator {
  public static create<TOutput>(schema: z.ZodType<TOutput>): ValidatorFn<TOutput> {
    return (v: unknown): TOutput => {
      const result = schema.safeParse(v);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }
      return result.data;
    }
  }
}
