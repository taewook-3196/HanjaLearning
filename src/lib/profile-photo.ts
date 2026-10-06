export type CropOptions={zoom?:number;offsetX?:number;offsetY?:number};
export async function cropSquareImage(file:File,options:CropOptions={}):Promise<Blob>{
 const url=URL.createObjectURL(file);
 try{
  const image=await new Promise<HTMLImageElement>((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error("이미지를 읽을 수 없습니다."));img.src=url;});
  const zoom=Math.max(1,Math.min(3,options.zoom??1));
  const baseSide=Math.min(image.naturalWidth,image.naturalHeight);
  const side=baseSide/zoom;
  const maxX=(image.naturalWidth-side)/2,maxY=(image.naturalHeight-side)/2;
  const sx=Math.max(0,Math.min(image.naturalWidth-side,maxX+(options.offsetX??0)*maxX));
  const sy=Math.max(0,Math.min(image.naturalHeight-side,maxY+(options.offsetY??0)*maxY));
  const canvas=document.createElement("canvas");canvas.width=512;canvas.height=512;
  const ctx=canvas.getContext("2d");if(!ctx)throw new Error("이미지를 처리할 수 없습니다.");
  ctx.drawImage(image,sx,sy,side,side,0,0,512,512);
  return await new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("이미지를 저장할 수 없습니다.")),"image/webp",0.86));
 }finally{URL.revokeObjectURL(url);}
}
export function profileAvatarUrl(supabase:{storage:{from:(bucket:string)=>{getPublicUrl:(path:string)=>{data:{publicUrl:string}}}}},path:string|null|undefined){
 if(!path)return null;return supabase.storage.from("profile-avatars").getPublicUrl(path).data.publicUrl;
}