export const PROFILE_AVATARS=[
 {key:"dad",src:"/profile-avatars/dad.svg",label:"아빠"},{key:"mom",src:"/profile-avatars/mom.svg",label:"엄마"},{key:"boy",src:"/profile-avatars/boy.svg",label:"남자아이"},{key:"girl",src:"/profile-avatars/girl.svg",label:"여자아이"},
 {key:"dog",src:"/profile-avatars/dog.svg",label:"강아지"},{key:"cat",src:"/profile-avatars/cat.svg",label:"고양이"},{key:"rabbit",src:"/profile-avatars/rabbit.svg",label:"토끼"},{key:"bear",src:"/profile-avatars/bear.svg",label:"곰"},
 {key:"penguin",src:"/profile-avatars/penguin.svg",label:"펭귄"},{key:"elephant",src:"/profile-avatars/elephant.svg",label:"코끼리"},{key:"lion",src:"/profile-avatars/lion.svg",label:"사자"},{key:"fox",src:"/profile-avatars/fox.svg",label:"여우"}
] as const;
export function avatarSrc(key:string|null|undefined){return PROFILE_AVATARS.find(x=>x.key===key)?.src??"/profile-avatars/boy.svg";}
export function avatarEmoji(key:string|null|undefined){return avatarSrc(key);}
