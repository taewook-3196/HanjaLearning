-- 대한검정회 2026 공식 선정한자표: 5급 이후 3급까지 누적 등급 매핑.
-- 신출 수: 준4급 150, 4급 200, 준3급 200, 3급 200.
-- 호환 한자(宅, 復, 暴 등)는 공식 표기 그대로 보존한다.

do $$
declare
  p bigint; g5 bigint; gp4 bigint; g4 bigint; gp3 bigint; g3 bigint;
  chars text[]; ch text; pos integer;
begin
  select id into p from public.exam_providers where code='DAEHAN';
  if p is null then raise exception 'DAEHAN provider is missing'; end if;
  select id into g5 from public.exam_grades where provider_id=p and code='5';
  select id into gp4 from public.exam_grades where provider_id=p and code='PRE4';
  select id into g4 from public.exam_grades where provider_id=p and code='4';
  select id into gp3 from public.exam_grades where provider_id=p and code='PRE3';
  select id into g3 from public.exam_grades where provider_id=p and code='3';

  chars:=string_to_array('加 可 角 感 客 格 決 結 輕 敬 界 苦 考 告 曲 公 果 過 球 郡 貴 根 級 吉 能 堂 待 德 圖 度 童 動 落 良 歷 例 禮 路 勞 綠 流 李 亡 買 賣 美 朴 反 發 法 兵 病 福 服 奉 冰 仕 思 史 使 算 相 席 雪 省 洗 消 速 孫 樹 數 宿 順 術 習 勝 始 式 臣 實 失 兒 愛 野 藥 陽 洋 漁 億 業 如 然 溫 要 勇 雲 運 園 院 油 由 飮 醫 以 因 任 者 昨 章 再 在 材 的 赤 典 戰 展 庭 定 題 第 族 卒 州 注 止 知 紙 集 參 窓 責 淸 體 初 充 特 表 品 風 必 河 幸 現 號 畫 化 訓 凶 黑',' ');
  for pos in 1..array_length(chars,1) loop ch:=chars[pos];
    insert into public.hanja(character,content_status,source_note) values(ch,'SOURCE_VERIFIED','대한검정회 2026 준4급 신출한자 표제훈음')
      on conflict(character) do update set content_status='SOURCE_VERIFIED',source_note=excluded.source_note;
    insert into public.grade_hanja(grade_id,hanja_id,sequence_no,is_new_at_grade)
      select gp4,id,pos,true from public.hanja where character=ch on conflict do nothing;
  end loop;

  chars:=string_to_array('價 甘 減 監 改 個 擧 健 件 建 競 景 季 固 故 骨 課 關 觀 廣 橋 具 救 求 舊 久 局 君 規 極 給 其 器 期 汽 技 基 念 團 端 壇 談 都 島 到 獨 朗 冷 兩 量 旅 練 領 令 料 類 陸 律 望 妹 牧 武 味 未 倍 變 報 富 婦 備 比 費 鼻 貧 寫 謝 師 査 産 賞 商 常 序 選 鮮 船 仙 善 說 星 聖 盛 聲 城 誠 勢 歲 束 送 授 守 視 試 是 識 氏 惡 眼 案 暗 約 養 餘 熱 葉 藝 屋 完 往 曜 浴 雨 雄 願 偉 爲 恩 義 移 姊 將 財 災 爭 低 貯 敵 傳 切 節 店 情 停 精 政 祭 調 助 鳥 早 操 存 終 種 坐 罪 週 增 志 至 支 進 眞 質 次 着 察 唱 處 鐵 最 祝 蟲 忠 致 齒 則 他 打 卓 炭 宅 統 退 波 板 敗 筆 寒 限 害 香 許 協 惠 好 湖 患 回 效',' ');
  for pos in 1..array_length(chars,1) loop ch:=chars[pos];
    insert into public.hanja(character,content_status,source_note) values(ch,'SOURCE_VERIFIED','대한검정회 2026 4급 신출한자 표제훈음')
      on conflict(character) do update set content_status='SOURCE_VERIFIED',source_note=excluded.source_note;
    insert into public.grade_hanja(grade_id,hanja_id,sequence_no,is_new_at_grade)
      select g4,id,pos,true from public.hanja where character=ch on conflict do nothing;
  end loop;

  chars:=string_to_array('街 假 佳 干 看 甲 降 講 康 更 巨 檢 儉 潔 警 慶 耕 境 經 庚 戒 溪 繼 癸 庫 谷 官 究 句 群 弓 權 歸 均 禁 及 起 暖 難 納 乃 怒 努 斷 丹 單 達 隊 徒 斗 豆 得 燈 略 連 烈 列 錄 論 倫 莫 滿 忘 妙 卯 戊 務 尾 密 飯 防 房 訪 背 拜 罰 伐 丙 寶 保 伏 復 否 佛 飛 悲 非 巳 絲 寺 舍 散 殺 狀 想 床 舌 細 稅 掃 笑 素 續 俗 松 收 愁 修 受 純 戌 拾 承 息 辛 申 若 與 逆 硏 煙 營 榮 誤 謠 容 遇 圓 員 危 遺 酉 乳 乙 陰 應 依 異 貳 益 引 印 寅 認 壹 壬 壯 適 專 絶 點 接 井 丁 除 制 製 兆 造 尊 宗 走 朱 衆 持 指 職 辰 創 冊 聽 請 丑 取 治 針 快 脫 探 討 破 判 片 布 暴 包 票 亥 解 鄕 虛 驗 賢 呼 戶 貨 候 吸 興 希',' ');
  for pos in 1..array_length(chars,1) loop ch:=chars[pos];
    insert into public.hanja(character,content_status,source_note) values(ch,'SOURCE_VERIFIED','대한검정회 2026 준3급 신출한자 표제훈음')
      on conflict(character) do update set content_status='SOURCE_VERIFIED',source_note=excluded.source_note;
    insert into public.grade_hanja(grade_id,hanja_id,sequence_no,is_new_at_grade)
      select gp3,id,pos,true from public.hanja where character=ch on conflict do nothing;
  end loop;

  chars:=string_to_array('脚 渴 敢 皆 居 乾 堅 鏡 驚 鷄 階 孤 穀 困 坤 窮 勸 卷 勤 幾 旣 但 段 卵 覽 浪 郞 涼 露 留 柳 晩 忙 麥 免 眠 勉 鳴 暮 墓 茂 舞 墨 勿 杯 凡 犯 逢 扶 浮 朋 秘 私 射 傷 霜 尙 喪 象 暑 惜 昔 設 損 誰 須 壽 雖 秀 淑 叔 崇 乘 施 深 甚 我 顔 巖 仰 哀 也 揚 讓 於 憶 嚴 余 汝 亦 域 硯 悅 炎 迎 烏 悟 吾 瓦 臥 曰 欲 憂 尤 又 于 宇 云 源 怨 威 猶 遊 柔 儒 幼 唯 吟 泣 矣 議 而 易 已 仁 忍 慈 腸 栽 哉 著 積 轉 錢 靜 貞 淨 頂 諸 帝 鐘 從 酒 宙 卽 曾 證 枝 之 只 智 盡 執 且 借 此 昌 菜 採 妻 尺 泉 淺 晴 招 推 追 就 吹 層 泰 痛 投 篇 閉 抱 楓 豊 皮 彼 疲 匹 何 賀 閑 恨 恒 刑 虎 乎 或 混 婚 紅 華 歡 皇 厚 胸 喜',' ');
  for pos in 1..array_length(chars,1) loop ch:=chars[pos];
    insert into public.hanja(character,content_status,source_note) values(ch,'SOURCE_VERIFIED','대한검정회 2026 3급 신출한자 표제훈음')
      on conflict(character) do update set content_status='SOURCE_VERIFIED',source_note=excluded.source_note;
    insert into public.grade_hanja(grade_id,hanja_id,sequence_no,is_new_at_grade)
      select g3,id,pos,true from public.hanja where character=ch on conflict do nothing;
  end loop;

  -- inherited cumulative mappings
  insert into public.grade_hanja(grade_id,hanja_id,sequence_no,is_new_at_grade)
    select gp4,hanja_id,1000+sequence_no,false from public.grade_hanja where grade_id=g5 on conflict do nothing;
  insert into public.grade_hanja(grade_id,hanja_id,sequence_no,is_new_at_grade)
    select g4,hanja_id,1000+sequence_no,false from public.grade_hanja where grade_id=gp4 on conflict do nothing;
  insert into public.grade_hanja(grade_id,hanja_id,sequence_no,is_new_at_grade)
    select gp3,hanja_id,1000+sequence_no,false from public.grade_hanja where grade_id=g4 on conflict do nothing;
  insert into public.grade_hanja(grade_id,hanja_id,sequence_no,is_new_at_grade)
    select g3,hanja_id,1000+sequence_no,false from public.grade_hanja where grade_id=gp3 on conflict do nothing;

  if (select count(*) from public.grade_hanja where grade_id=gp4 and is_new_at_grade)<>150 then raise exception 'PRE4 new count mismatch'; end if;
  if (select count(*) from public.grade_hanja where grade_id=g4 and is_new_at_grade)<>200 then raise exception '4 new count mismatch'; end if;
  if (select count(*) from public.grade_hanja where grade_id=gp3 and is_new_at_grade)<>200 then raise exception 'PRE3 new count mismatch'; end if;
  if (select count(*) from public.grade_hanja where grade_id=g3 and is_new_at_grade)<>200 then raise exception '3 new count mismatch'; end if;
  if (select count(*) from public.grade_hanja where grade_id=gp4)<>400 then raise exception 'PRE4 cumulative mismatch'; end if;
  if (select count(*) from public.grade_hanja where grade_id=g4)<>600 then raise exception '4 cumulative mismatch'; end if;
  if (select count(*) from public.grade_hanja where grade_id=gp3)<>800 then raise exception 'PRE3 cumulative mismatch'; end if;
  if (select count(*) from public.grade_hanja where grade_id=g3)<>1000 then raise exception '3 cumulative mismatch'; end if;
end $$;
