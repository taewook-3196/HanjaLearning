alter table public.hanja_words add column if not exists hanja_form text;

update public.hanja_words set hanja_form=case id
 when 966 then '考慮' when 999 then '宿泊' when 1172 then '忍耐' when 1194 then '智慧'
 when 1295 then '忘却' when 1310 then '保護' when 1322 then '狀態' when 1323 then '想像'
 when 1344 then '硏磨' when 1354 then '危險' when 1387 then '針具' when 1392 then '破壞'
 when 1397 then '包含' when 1404 then '候補' else hanja_form end
where id in (966,999,1172,1194,1295,1310,1322,1323,1344,1354,1387,1392,1397,1404);
