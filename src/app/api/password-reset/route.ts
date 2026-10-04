import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function hash(value:string){return createHash("sha256").update(value).digest("hex");}

export async function POST(request:Request){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceRole=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!publishable||!serviceRole)return NextResponse.json({error:"복구 기능이 아직 설정되지 않았습니다."},{status:503});
  let body:{loginId?:string;code?:string;password?:string};
  try{body=await request.json();}catch{return NextResponse.json({error:"잘못된 요청입니다."},{status:400});}
  const loginId=(body.loginId??"").trim().toLowerCase();
  const code=(body.code??"").trim();
  const password=body.password??"";
  if(!/^[a-z0-9][a-z0-9_-]{2,19}$/.test(loginId)||code.length<6||password.length<8)
    return NextResponse.json({error:"아이디, 복구 코드, 새 비밀번호를 확인해 주세요."},{status:400});

  const publicClient=createClient(url,publishable,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:userId,error:consumeError}=await publicClient.rpc("consume_password_reset",{login_name:loginId,token_digest:hash(code)});
  if(consumeError||!userId)return NextResponse.json({error:"복구 코드가 올바르지 않거나 만료되었습니다."},{status:400});

  const admin=createClient(url,serviceRole,{auth:{persistSession:false,autoRefreshToken:false}});
  const {error:updateError}=await admin.auth.admin.updateUserById(userId,{password});
  if(updateError)return NextResponse.json({error:"비밀번호를 변경하지 못했습니다. 운영자에게 새 복구 코드를 요청해 주세요."},{status:500});
  return NextResponse.json({ok:true});
}
