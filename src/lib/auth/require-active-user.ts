import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireActiveUser() {
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/login");
  const {data:account}=await supabase.from("account_status").select("status").eq("user_id",user.id).maybeSingle();
  if(!account || account.status!=="ACTIVE") redirect("/pending");
  return {supabase,user};
}
