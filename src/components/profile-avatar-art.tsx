import type {CSSProperties} from "react";

type Props={avatarKey?:string|null;size?:number;className?:string;style?:CSSProperties};
const keys=["dad","mom","boy","girl","dog","cat","rabbit","bear","penguin","elephant","lion","fox"] as const;

export function ProfileAvatarArt({avatarKey="boy",size=48,className,style}:Props){
 const raw=avatarKey??"boy";
 const key=keys.includes(raw as typeof keys[number])?raw:"boy";
 return <img className={className} src={`/profile-avatars/${key}.webp?v=20261007`} width={size} height={size} alt="프로필 캐릭터" style={{...style,display:"block",width:size,height:size,objectFit:"cover",borderRadius:"28%",flex:"0 0 auto"}} />;
}
