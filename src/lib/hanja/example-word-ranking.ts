const LESS_PREFERRED_EXAMPLE_WORDS=new Set(["금일","동계","춘계","하계","조식","견공","우육","경성","동리","패류"]);

type ExampleWordRef={word:string};

export function rankExampleWordMaps<T extends {word_id:number},W extends ExampleWordRef>(
 maps:T[],
 wordById:Map<number,W>
):T[]{
 return [...maps].sort((a,b)=>
  Number(LESS_PREFERRED_EXAMPLE_WORDS.has(wordById.get(a.word_id)?.word??""))-
  Number(LESS_PREFERRED_EXAMPLE_WORDS.has(wordById.get(b.word_id)?.word??""))
 );
}
