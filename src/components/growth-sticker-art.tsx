import type { GrowthStickerKind as Kind } from "@/lib/growth-stickers";
const stickerArtworkPosition:Record<Kind,number>={
 first:0,streak7:1,week:11,streak30:2,learn100:6,retry:21,recover5:21,recover20:21,
 master:5,write:19,learn50:18,learn250:20,stack:18,write50:19,streak14:1,streak3:1,
 write100:19,accuracy80:6,quiz50:7,review10:8,levelUp:4,nightOwl:9,daily20:10,weeklyChallenge:11
};
export function GrowthStickerArt({kind,locked=false}:{kind:Kind;locked?:boolean}){
 const index=stickerArtworkPosition[kind];
 const col=index%6,row=Math.floor(index/6);
 return <span className={locked?"growth-sticker-illustration locked":"growth-sticker-illustration"} role="img" aria-label={kind} style={{
  display:"inline-block",width:"100%",height:"100%",aspectRatio:"1 / 1",
  backgroundImage:"url('/hanja_sticker_24_new.webp')",backgroundRepeat:"no-repeat",
  backgroundSize:"600% 400%",backgroundPosition:`${col*20}% ${row*100/3}%`,
  borderRadius:"50%"
 }}/>;
}
