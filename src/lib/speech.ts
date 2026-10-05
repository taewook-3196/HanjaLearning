export type SpeechVoicePreference="DAD"|"WOMAN"|"AUTO";
const DAD_HINTS=["male","minsu","inho","jun","hyun","yong","doyun","seojun","민수","인호","준","현","용"];
const WOMAN_HINTS=["female","yuna","sora","sumi","kyuri","yuri","유나","소라","수미","유리"];

function koreanVoices(){
 return window.speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith("ko"));
}

export function selectKoreanVoice(pref:SpeechVoicePreference){
 const voices=koreanVoices();
 if(!voices.length)return undefined;
 if(pref==="AUTO")return voices.find(v=>v.default)||voices[0];
 const hints=pref==="DAD"?DAD_HINTS:WOMAN_HINTS;
 // Voice names are platform/browser specific and often contain no gender metadata.
 // Prefer the requested voice when recognizable, but never make speech depend on it.
 return voices.find(v=>hints.some(h=>(v.name+" "+v.voiceURI).toLowerCase().includes(h)))
   || voices.find(v=>v.default)
   || voices[0];
}

export function speakKorean(text:string,pref:SpeechVoicePreference,onUnavailable?:()=>void){
 if(typeof window==="undefined"||!("speechSynthesis" in window)){onUnavailable?.();return}
 const synth=window.speechSynthesis;
 let spoken=false;
 const run=()=>{
  if(spoken)return;
  spoken=true;
  const u=new SpeechSynthesisUtterance(text);
  u.lang="ko-KR";
  u.rate=.85;
  const voice=selectKoreanVoice(pref);
  if(voice)u.voice=voice;
  // When a browser exposes no voice list (seen on some Android/iOS versions),
  // leaving voice unset lets the OS choose its ko-KR/default TTS voice.
  synth.cancel();
  synth.speak(u);
 };
 if(synth.getVoices().length){run();return}
 const handler=()=>{synth.removeEventListener("voiceschanged",handler);run()};
 synth.addEventListener("voiceschanged",handler,{once:true});
 window.setTimeout(()=>{synth.removeEventListener("voiceschanged",handler);run()},800);
}
