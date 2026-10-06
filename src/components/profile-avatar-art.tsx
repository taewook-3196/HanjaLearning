import type {CSSProperties} from "react";

type Props={avatarKey?:string|null;size?:number;className?:string;style?:CSSProperties};
const keys=["dad","mom","boy","girl","dog","cat","rabbit","bear","penguin","elephant","lion","fox"] as const;

export function ProfileAvatarArt({avatarKey="boy",size=48,className,style}:Props){
 const raw=avatarKey??"boy";
 const found=keys.indexOf(raw as typeof keys[number]);
 const index=found>=0?found:2;
 return <span className={className} style={{...style,display:"inline-block",position:"relative",overflow:"hidden",width:size,height:size,flex:"0 0 auto",borderRadius:"28%"}} role="img" aria-label="프로필 캐릭터">
  <img src="/profile-avatars/avatar-sprite.webp" alt="" aria-hidden="true" width={size*12} height={size} style={{position:"absolute",left:-index*size,top:0,width:size*12,height:size,maxWidth:"none"}} />
 </span>;
}
