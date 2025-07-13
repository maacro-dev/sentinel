import { getSupabase } from "@/app/supabase";
import { formSubmissionSchema } from "@/lib/schemas/analytics";
import { FormSubmissionStat, Result } from "@/lib/types";
import { validateResponse } from "@/utils";

export async function getFormSubmissionCount(): Promise<Result<FormSubmissionStat>> {

  const supabase = await getSupabase();
  const query = supabase
    .schema("analytics")
    .from("form_submission_comparison")
    .select("*")
    .single();

  const { data, error } = await query;

  return validateResponse({
    data: data,
    schema: formSubmissionSchema,
    error: error,
    fallbackMsg: "Failed to load form submission count",
  });
}
