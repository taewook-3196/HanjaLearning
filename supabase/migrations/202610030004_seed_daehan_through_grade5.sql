-- Task 3: 대한검정회 official assigned Hanja, grades 8 through 5.
-- Source: 대한검정회 "8급~사범 선정한자훈음표" (2026-07-29).
-- Official glyph forms are preserved. Meanings/readings are seeded separately after verification.

do $$
declare
  v_provider_id bigint;
  grade8_id bigint;
  grade7_id bigint;
  grade6_id bigint;
  pre5_id bigint;
  grade5_id bigint;
  chars text[];
  ch text;
  pos integer;
begin
  select id into v_provider_id from public.exam_providers where code = 'DAEHAN';
  if v_provider_id is null then/ raise exception 'DAEHAN provider is missing'; end if;

  select id into grade8_id from public.exam_grades where exam_grades.provider_id=v_provider_id and code='8';
  select id into grade7_id from public.exam_grades where exam_grades.provider_id=v_provider_id and code='7';
  select id into grade6_id from public.exam_grades where exam_grades.provider_id=v_provider_id and code='6';
  select id into pre5_id from public.exam_grades where exam_grades.provider_id=v_provider_id and code='PRE5';
  select id into grade5_id from public.exam_grades where exam_grades.provider_id=v_provider_id and code='5';

  chars := string_to_array('九 金 南 男 女 東 六 母 木 門 父 北 四 三 西 水 十 五 月 二 人 日 一 子 弟 七 土 八 兄 火',' ');
  for pos in 1..array_length(chars,1) loop
    ch := chars[pos];
    insert into public.hanja(character,content_status,source_note) values(ch,'SOURCE_VERIFIED','대한검정회 2026 선정한자훈음표')
      on conflict(character) do update set content_status='SOURCE_VERIFIED', source_note=excluded.source_note;
    insert into public.grade_hanja(grade_id,hanja_id,sequence_no,is_new_at_grade)
      select grade8_id,id,pos,true from public.hanja where character=ch on conflict do nothing;
  end loop;

  chars := string_to_array('江 口 內 年 大 目 白 山 上 小 手 外 右 入 足 左 中 靑 出 下',' ');
  for pos in 1..array_length(chars,1) loop
    ch := chars[pos];
    insert into public.hanja(character,content_status,source_note) values(ch,'SOURCE_VERIFIED','대한검정회 2026 선정한자훈음표')
      on conflict(character) do update set content_status='SOURCE_VERIFIED', source_note=excluded.source_note;
    insert into public.grade_hanja(grade_id,hanja_id,sequence_no,is_new_at_grade)
      select grade7_id,id,pos,true from public.hanja where character=ch on conflict do nothing;
  end loop;

  chars := string_to_array('犬 己 林 馬 名 百 生 石 先 姓 心 羊 魚 玉 牛 耳 地 千 天 川',' ');
  for pos in 1..array_length(chars,1) loop
    ch := chars[pos];
    insert into public.hanja(character,content_status,source_note) values(ch,'SOURCE_VERIFIED','대한검정회 2026 선정한자훈음표')
      on conflict(character) do update set content_status='SOURCE_VERIFIED', source_note=excluded.source_note;
    insert into public.grade_hanja(grade_id,hanja_id,sequence_no,is_new_at_grade)
      select grade6_id,id,pos,true from public.hanja where character=ch on conflict do nothing;
  end loop;

  chars := string_to_array('車 巾 古 工 今 同 力 立 末 文 方 本 夫 不 士 夕 世 少 食 央 王 位 衣 字 自 正 主 寸 向 休',' ');
  for pos in 1..array_length(chars,1) loop
    ch := chars[pos];
    insert into public.hanja(character,content_status,source_note) values(ch,'SOURCE_VERIFIED','대한검정회 2026 선정한자훈음표')
      on conflict(character) do update set content_status='SOURCE_VERIFIED', source_note=excluded.source_note;
    insert into public.grade_hanja(grade_id,hanja_id,sequence_no,is_new_at_grade)
      select pre5_id,id,pos,true from public.hanja where character=ch on conflict do nothing;
  end loop;

  chars := string_to_array('歌 家 各 間 强 開 去 見 京 計 高 功 空 共 科 光 敎 交 校 區 國 軍 近 急 旗 記 氣 農 多 短 答 當 對 代 道 刀 讀 冬 洞 頭 等 登 樂 來 老 理 里 利 萬 每 面 命 明 毛 無 聞 問 物 米 民 班 半 放 番 別 步 部 分 社 事 死 色 書 線 性 成 所 首 詩 時 示 市 植 神 身 信 新 室 安 夜 弱 語 言 永 英 午 用 友 原 遠 元 有 肉 育 銀 音 邑 意 作 長 場 才 田 電 前 全 朝 祖 晝 住 竹 重 直 草 村 秋 春 親 太 通 貝 便 平 夏 學 韓 漢 合 海 行 血 形 花 話 和 活 黃 會 孝 後',' ');
  for pos in 1..array_length(chars,1) loop
    ch := chars[pos];
    insert into public.hanja(character,content_status,source_note) values(ch,'SOURCE_VERIFIED','대한검정회 2026 선정한자훈음표')
      on conflict(character) do update set content_status='SOURCE_VERIFIED', source_note=excluded.source_note;
    insert into public.grade_hanja(grade_id,hanja_id,sequence_no,is_new_at_grade)
      select grade5_id,id,pos,true from public.hanja where character=ch on conflict do nothing;
  end loop;

  -- Add inherited mappings so selecting a grade returns its full cumulative set.
  insert into public.grade_hanja(grade_id,hanja_id,sequence_no,is_new_at_grade)
    select grade7_id,hanja_id,1000+sequence_no,false from public.grade_hanja where grade_id=grade8_id on conflict do nothing;
  insert into public.grade_hanja(grade_id,hanja_id,sequence_no,is_new_at_grade)
    select grade6_id,hanja_id,1000+sequence_no,false from public.grade_hanja where grade_id=grade7_id on conflict do nothing;
  insert into public.grade_hanja(grade_id,hanja_id,sequence_no,is_new_at_grade)
    select pre5_id,hanja_id,1000+sequence_no,false from public.grade_hanja where grade_id=grade6_id on conflict do nothing;
  insert into public.grade_hanja(grade_id,hanja_id,sequence_no,is_new_at_grade)
    select grade5_id,hanja_id,1000+sequence_no,false from public.grade_hanja where grade_id=pre5_id on conflict do nothing;

  if (select count(*) from public.grade_hanja where grade_id=grade8_id) <> 30 then raise exception '8급 count mismatch'; end if;
  if (select count(*) from public.grade_hanja where grade_id=grade7_id) <> 50 then raise exception '7급 count mismatch'; end if;
  if (select count(*) from public.grade_hanja where grade_id=grade6_id) <> 70 then raise exception '6급 count mismatch'; end if;
  if (select count(*) from public.grade_hanja where grade_id=pre5_id) <> 100 then raise exception '준5급 count mismatch'; end if;
  if (select count(*) from public.grade_hanja where grade_id=grade5_id) <> 250 then raise exception '5급 count mismatch'; end if;
end $$;
