type Kind="first"|"stack"|"write"|"retry"|"master"|"week";
export function GrowthStickerArt({kind,locked=false}:{kind:Kind;locked?:boolean}){
 const common={stroke:"#334155",strokeWidth:4,strokeLinecap:"round" as const,strokeLinejoin:"round" as const};
 return <svg viewBox="0 0 96 96" aria-hidden="true" className={locked?"locked":undefined}>
  <circle cx="48" cy="48" r="43" fill={locked?"#EEF1F5":"#FFF9E8"}/>
  {kind==="first"?<><path d="M48 71V44" {...common}/><path d="M48 49C29 48 25 34 27 24c14 0 25 7 27 20" fill="#83C96F" {...common}/><path d="M49 48c18-1 24-13 22-23-13 0-23 6-26 18" fill="#67B77A" {...common}/><path d="M31 73h34" {...common}/></>:
  kind==="stack"?<><rect x="23" y="55" width="51" height="13" rx="4" fill="#74B8F4" {...common}/><rect x="28" y="40" width="45" height="13" rx="4" fill="#FFD66B" {...common}/><rect x="21" y="25" width="48" height="13" rx="4" fill="#F59A9A" {...common}/><path d="M33 31h23M38 46h22M31 61h27" {...common}/></>:
  kind==="write"?<><path d="M29 68l7-21 28-28c4-4 12 4 8 8L44 55l-15 13Z" fill="#FFD66B" {...common}/><path d="m36 47 8 8M28 72c11 1 25 1 40-3" {...common}/><path d="M60 24l9 9" {...common}/></>:
  kind==="retry"?<><path d="M28 45c2-14 13-23 27-23 10 0 18 4 24 12" fill="none" {...common}/><path d="m77 22 3 13-13 1" fill="none" {...common}/><path d="M68 54c-3 13-13 20-26 20-10 0-18-4-23-11" fill="none" {...common}/><path d="m20 76-2-13 13-1" fill="none" {...common}/><path d="m40 48 6 6 13-15" fill="none" stroke="#63B57A" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/></>:
  kind==="master"?<><circle cx="48" cy="48" r="26" fill="#DDEEFF" {...common}/><circle cx="48" cy="48" r="15" fill="#FFF" {...common}/><circle cx="48" cy="48" r="5" fill="#F08C78"/><path d="m65 31 12-12m-1 0 1 12m0-12H65" {...common}/></>:
  <><rect x="22" y="26" width="52" height="48" rx="9" fill="#FFF" {...common}/><path d="M22 40h52M34 20v12M62 20v12" {...common}/>{[0,1,2,3,4].map((x)=><circle key={x} cx={31+x*9} cy={53+(x%2)*10} r="4" fill="#68B77B"/>)}</>}
  {locked?<><rect x="36" y="47" width="24" height="20" rx="5" fill="#AAB2BE"/><path d="M41 47v-6a7 7 0 0 1 14 0v6" fill="none" stroke="#AAB2BE" strokeWidth="5"/></>:<path d="m76 13 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="#FFD24D"/>}
 </svg>;
}