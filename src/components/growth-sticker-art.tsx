import type { GrowthStickerKind as Kind } from "@/lib/growth-stickers";
import { growthStickerRules } from "@/lib/growth-stickers";
const stickerNames = Object.fromEntries(growthStickerRules({learned:0,writtenCount:0,recovered:0,mastered:0,days:0,streak:0}).map(s=>[s.kind,s.name])) as Record<Kind,string>;
// Each earned sticker has its own artwork tile (six columns, four rows).
const stickerArtworkPosition:Record<Kind,number>={
 first:0,streak7:1,streak30:2,streak14:3,levelUp:4,master:5,
 accuracy80:6,quiz50:7,review10:8,nightOwl:9,daily20:10,weeklyChallenge:11,
 learn100:12,retry:13,learn250:14,recover5:15,recover20:16,stack:17,
 learn50:18,write50:19,write100:20,write:21,week:22,streak3:23
};
export function GrowthStickerArt({kind,locked=false,showCaption=false}:{kind:Kind;locked?:boolean;showCaption?:boolean}){
 const index=stickerArtworkPosition[kind];
 const col=index%6,row=Math.floor(index/6);
 const illustration=<span className={locked?"growth-sticker-illustration locked":"growth-sticker-illustration"} role="img" aria-label={kind} style={{
  display:"inline-block",width:"100%",height:"100%",aspectRatio:"1 / 1",
  backgroundImage:"url('/hanja_sticker_24_new.webp')",backgroundRepeat:"no-repeat",
  backgroundSize:"600% 400%",backgroundPosition:`${col*20}% ${row*100/3}%`,
  borderRadius:"8%"
 }}/>;
 return showCaption?<span className="growth-sticker-with-caption">{illustration}<span className="growth-sticker-caption">{stickerNames[kind]}</span></span>:illustration;
}
