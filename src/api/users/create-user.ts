import { ROLE_IDS } from "@/app/config";
import { supabase } from "@/app/supabase";
import {UserCreate} from "@/lib/types";

export async function createUser({
  first_name,
  last_name,
  email,
  role,
  date_of_birth,
}: UserCreate) {

  // [hack]
  const { data: currentSession } = await supabase.auth.getSession() 

  const { data, error } = await supabase.auth.signUp({
    email,
    password: "123456", // TODO: randomize password
  });

  if (error || !data) {
    throw new Error(`Failed to sign up auth.user: ${error?.message}`);
  }

  const { user } = data;

  const { error: userError } = await supabase
    .from("users")
    .insert({
      auth_id: user?.id,
      first_name: first_name,
      last_name: last_name,
      role_id: ROLE_IDS[role],
      date_of_birth,
    });

  if (userError) {
    throw new Error(`Failed to create public.user: ${userError.message}`);
  }

  // [hack]
  supabase.auth.setSession(currentSession.session!)
}