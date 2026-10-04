export type SpeechVoicePreference="DAD"|"WOMAN"|"AUTO";
const DAD_HINTS=["male","minsu","inho","jun","hyun","yong","doyun","seojun","민수","인호","준","현","용"];
const WOMAN_HINTS=["female","yuna","sora","sumi","kyuri","yuri","유나","소라","수미","유리"];
function koreanVoices(){return window.speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith("ko"));}
export function selectKoreanVoice(pref:SpeechVoicePreference){
 const voices=koreanVoices();if(pref==="AUTO")return voices.find(v=>v.default)||voices[0];
 const hints=pref==="DAD"?DAD_HINTS:WOMAN_HINTS;
 return voices.find(v=>hints.some(h=>(v.name+" "+v.voiceURI).toLowerCase().includes(h)));
}
export function speakKorean(text:string,pref:SpeechVoicePreference,onUnavailable?:()=>void){
 if(typeof window==="undefined"||!("speechSynthesis" in window))return;
 const synth=window.speechSynthesis;
 const run=()=>{const u=new SpeechSynthesisUtterance(text);u.lang="ko-KR";u.rate=.85;const voice=selectKoreanVoice(pref);if(pref!=="AUTO"&&!voice){onUnavailable?.();return}if(voice)u.voice=voice;synth.cancel();synth.speak(u);};
 if(synth.getVoices().length){run();return}
 const handler=()=>{synth.removeEventListener("voiceschanged",handler);run()};synth.addEventListener("voiceschanged",handler);window.setTimeout(()=>{synth.removeEventListener("voiceschanged",handler);run()},1000);
}