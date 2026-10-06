import type {CSSProperties} from "react";

type Props={avatarKey?:string|null;size?:number;className?:string;style?:CSSProperties};
const keys=["dad","mom","boy","girl","dog","cat","rabbit","bear","penguin","elephant","lion","fox"] as const;
export function ProfileAvatarArt({avatarKey="boy",size=48,className,style}:Props){
 const raw=avatarKey??"boy";
 const index=Math.max(0,keys.indexOf(raw as typeof keys[number]));
 const position=keys.length===1?0:(index/(keys.length-1))*100;
 return <span className={className} style={{...style,display:"inline-block",width:size,height:size,flex:"0 0 auto",borderRadius:"28%",backgroundImage:"url(/profile-avatars/avatar-sprite.webp)",backgroundRepeat:"no-repeat",backgroundSize:"1200% 100%",backgroundPosition:`${position}% 50%`}} role="img" aria-label="프로필 캐릭터"/>;
}
