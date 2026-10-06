export const PROFILE_AVATARS=[
 {key:"dad",emoji:"👨",label:"아빠"},{key:"mom",emoji:"👩",label:"엄마"},{key:"boy",emoji:"👦",label:"남자아이"},{key:"girl",emoji:"👧",label:"여자아이"},
 {key:"dog",emoji:"🐶",label:"강아지"},{key:"cat",emoji:"🐱",label:"고양이"},{key:"rabbit",emoji:"🐰",label:"토끼"},{key:"bear",emoji:"🐻",label:"곰"},
 {key:"panda",emoji:"🐼",label:"판다"},{key:"fox",emoji:"🦊",label:"여우"},{key:"penguin",emoji:"🐧",label:"펭귄"},{key:"dino",emoji:"🦖",label:"공룡"}
] as const;
export function avatarEmoji(key:string|null|undefined){return PROFILE_AVATARS.find(x=>x.key===key)?.emoji??"👦";}
