import { getSupabase } from "@/app/supabase";
import { barangayYieldTopBottomSchema } from "@/lib/schemas/analytics";
import { BarangayYieldTopBottomRanked, Result } from "@/lib/types";
import { validateResponse } from "@/utils";


export async function getBarangayYieldTopBottom(): Promise<Result<BarangayYieldTopBottomRanked>> {

  const supabase = await getSupabase()
  const query = supabase
    .schema('analytics')
    .from('barangay_yields_top_bottom')
    .select('*')

  const { data, error } = await query

  if (error) {
    throw error;
  }

  return validateResponse({
    data: data,
    schema: barangayYieldTopBottomSchema,
    error: error,
    fallbackMsg: "Failed to load barangay yield top bottom"
  })
}
