import type { GrowthStickerKind as Kind } from "@/lib/growth-stickers";
const stickerArtworkPosition:Record<Kind,number>={
 first:0,streak7:1,week:2,streak30:3,learn100:11,retry:5,recover5:6,recover20:7,
 master:13,write:9,learn50:10,learn250:11,stack:13,write50:9,streak14:3,streak3:1,
 write100:9,accuracy80:8,quiz50:10,review10:12,levelUp:13,nightOwl:14,daily20:15,weeklyChallenge:20
};
export function GrowthStickerArt({kind,locked=false}:{kind:Kind;locked?:boolean}){
 const index=stickerArtworkPosition[kind];
 const col=index%8,row=Math.floor(index/8);
 return <span className={locked?"growth-sticker-illustration locked":"growth-sticker-illustration"} role="img" aria-label={kind} style={{
  display:"inline-block",width:"100%",height:"100%",aspectRatio:"1 / 1",
  backgroundImage:"url('/sticker-sheet.webp')",backgroundRepeat:"no-repeat",
  backgroundSize:"800% 300%",backgroundPosition:`${col*100/7}% ${row*50}%`,
  borderRadius:"18%"
 }}/>;
}
