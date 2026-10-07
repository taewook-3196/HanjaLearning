"use server";
import { redirect } from "next/navigation";
import { requireActiveUser } from "@/lib/auth/require-active-user";

export async function celebrateGrowthSticker(formData:FormData){
 const key=String(formData.get("stickerKey")??"");
 if(!["first","stack","write","retry","master","week"].includes(key)) redirect("/stats");
 const {supabase,user}=await requireActiveUser();
 await supabase.from("user_growth_stickers").update({celebrated_at:new Date().toISOString()}).eq("user_id",user.id).eq("sticker_key",key).is("celebrated_at",null);
 redirect("/stats");
}
