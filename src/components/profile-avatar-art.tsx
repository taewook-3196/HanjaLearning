import type {CSSProperties} from "react";

type Props={avatarKey?:string|null;size?:number;className?:string;style?:CSSProperties};
const keys=["dad","mom","boy","girl","dog","cat","rabbit","bear","penguin","elephant","lion","fox"] as const;
export function ProfileAvatarArt({avatarKey="boy",size=48,className,style}:Props){
 const key=keys.includes((avatarKey??"boy") as typeof keys[number])?(avatarKey??"boy"):"boy";
 return <img className={className} style={{...style,width:size,height:size,objectFit:"cover",borderRadius:"28%"}} width={size} height={size} src={`/profile-avatars/${key}.webp`} alt="" aria-hidden="true"/>;
}
