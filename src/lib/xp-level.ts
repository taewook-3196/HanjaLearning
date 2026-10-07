export function xpForLevel(level:number){
 const safe=Math.max(1,Math.floor(level));
 if(safe<=11)return 50*(safe-1)*(safe-1);
 return 5000+(safe-11)*1000;
}

export function levelFromXp(totalXp:number){
 const xp=Math.max(0,totalXp);
 if(xp<5000)return Math.floor(Math.sqrt(xp/50))+1;
 return 11+Math.floor((xp-5000)/1000);
}

export function levelProgress(totalXp:number){
 const level=levelFromXp(totalXp),start=xpForLevel(level),end=xpForLevel(level+1);
 return {level,start,end,progress:Math.max(0,Math.min(100,Math.round(((Math.max(0,totalXp)-start)/(end-start))*100)))};
}
