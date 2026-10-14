import type { GrowthStickerKind as Kind } from "@/lib/growth-stickers";
const stickerArtworkPosition:Record<Kind,number>={
 first:0,streak7:1,week:2,streak30:3,learn100:4,retry:5,recover5:6,recover20:7,
 master:8,write:9,learn50:10,learn250:11,stack:12,write50:13,streak14:14,streak3:15,
 write100:16
};
export function GrowthStickerArt({kind,locked=false}:{kind:Kind;locked?:boolean}){
 const common={stroke:"#334155",strokeWidth:4,strokeLinecap:"round" as const,strokeLinejoin:"round" as const};
 const index=stickerArtworkPosition[kind];
 const col=index%8,row=Math.floor(index/8);
 return <span className={locked?"growth-sticker-illustration locked":"growth-sticker-illustration"} role="img" aria-label={kind} style={{
  display:"inline-block",width:"100%",height:"100%",aspectRatio:"1 / 1",
  backgroundImage:"url('/stickers/sticker-sheet.webp')",backgroundRepeat:"no-repeat",
  backgroundSize:"800% 300%",backgroundPosition:`${col*100/7}% ${row*50}%`,
  borderRadius:"18%"
 }}/>;
}
