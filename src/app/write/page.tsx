"use client";
import Link from "next/link";
import { useRef,useState } from "react";
export default function WritingPage(){
 const canvas=useRef<HTMLCanvasElement>(null);const drawing=useRef(false);const [strokes,setStrokes]=useState(0);
 const point=(e:React.PointerEvent<HTMLCanvasElement>)=>{const c=canvas.current;if(!c)return null;const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*c.width/r.width,y:(e.clientY-r.top)*c.height/r.height}};
 const start=(e:React.PointerEvent<HTMLCanvasElement>)=>{const c=canvas.current,p=point(e);if(!c||!p)return;drawing.current=true;c.setPointerCapture(e.pointerId);const x=c.getContext("2d");if(!x)return;x.beginPath();x.moveTo(p.x,p.y)};
 const move=(e:React.PointerEvent<HTMLCanvasElement>)=>{if(!drawing.current)return;const c=canvas.current,p=point(e);if(!c||!p)return;const x=c.getContext("2d");if(!x)return;x.lineWidth=12;x.lineCap="round";x.lineJoin="round";x.strokeStyle="#263238";x.lineTo(p.x,p.y);x.stroke()};
 const end=()=>{if(drawing.current){drawing.current=false;setStrokes(v=>v+1)}};
 const clear=()=>{const c=canvas.current;if(!c)return;c.getContext("2d")?.clearRect(0,0,c.width,c.height);setStrokes(0)};
 return <main className="app-shell"><section className="hero-card"><p className="eyebrow">손으로 익히기</p><h1>한자 쓰기 연습</h1><p className="subtitle">손가락이나 펜으로 자유롭게 써 보세요.</p></section><section className="study-card"><div className="writing-guide" aria-hidden="true"><span>永</span></div><canvas ref={canvas} className="writing-canvas" width="600" height="600" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}/><div className="writing-actions"><span>{strokes}획 그렸어요</span><button type="button" onClick={clear}>다시 쓰기</button></div><p className="subtitle">지금은 자유 쓰기 연습 단계예요. 자동 채점은 하지 않아요.</p></section><Link className="settings-link" href="/">홈으로</Link></main>;
}