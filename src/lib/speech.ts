export type SpeechVoicePreference="AUTO"|"DAD"|"WOMAN"|string;
export type KoreanVoiceOption={id:string;name:string;lang:string;isDefault:boolean};
const DAD_HINTS=["male","minsu","inho","jun","hyun","yong","doyun","seojun","민수","인호","준","현","용"];
const WOMAN_HINTS=["female","yuna","sora","sumi","kyuri","yuri","유나","소라","수미","유리"];
const DEVICE_PREFIX="DEVICE:";
function koreanVoices(){return window.speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith("ko"));}
function voiceId(v:SpeechSynthesisVoice){return DEVICE_PREFIX+encodeURIComponent(v.voiceURI||v.name);}
export function getKoreanVoiceOptions():KoreanVoiceOption[]{if(typeof window==="undefined"||!("speechSynthesis" in window))return[];return koreanVoices().map(v=>({id:voiceId(v),name:v.name,lang:v.lang,isDefault:v.default}));}
export function selectKoreanVoice(pref:SpeechVoicePreference){
 const voices=koreanVoices();if(!voices.length)return undefined;
 if(pref.startsWith(DEVICE_PREFIX)){const wanted=decodeURIComponent(pref.slice(DEVICE_PREFIX.length));return voices.find(v=>(v.voiceURI||v.name)===wanted)||voices.find(v=>v.default)||voices[0];}
 if(pref==="AUTO")return voices.find(v=>v.default)||voices[0];
 const hints=pref==="DAD"?DAD_HINTS:WOMAN_HINTS;
 return voices.find(v=>hints.some(h=>(v.name+" "+v.voiceURI).toLowerCase().includes(h)))||voices.find(v=>v.default)||voices[0];
}
export function watchKoreanVoices(onChange:(voices:KoreanVoiceOption[])=>void){
 if(typeof window==="undefined"||!("speechSynthesis" in window)){onChange([]);return()=>{};}
 const synth=window.speechSynthesis;const emit=()=>onChange(getKoreanVoiceOptions());emit();synth.addEventListener("voiceschanged",emit);const timer=window.setTimeout(emit,800);return()=>{window.clearTimeout(timer);synth.removeEventListener("voiceschanged",emit);};
}
export function speakKorean(text:string,pref:SpeechVoicePreference,onUnavailable?:()=>void){
 if(typeof window==="undefined"||!("speechSynthesis" in window)){onUnavailable?.();return}
 const synth=window.speechSynthesis;let spoken=false;const run=()=>{if(spoken)return;spoken=true;const u=new SpeechSynthesisUtterance(text);u.lang="ko-KR";u.rate=.85;const voice=selectKoreanVoice(pref);if(voice)u.voice=voice;synth.cancel();synth.speak(u);};
 if(synth.getVoices().length){run();return}const handler=()=>{synth.removeEventListener("voiceschanged",handler);run()};synth.addEventListener("voiceschanged",handler,{once:true});window.setTimeout(()=>{synth.removeEventListener("voiceschanged",handler);run()},800);
}
