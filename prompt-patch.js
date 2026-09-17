"use strict";

// v0.5 prompt UX patch: follow the selected app language and keep PK verdicts concise.

function promptCharacterName(c){
  if(!c)return"";
  if(STATE.lang==="zh")return c.name_zh||c.name_en||c.name||"";
  if(STATE.lang==="ja")return c.name_ja||c.name_en||c.name||"";
  return c.name_en||c.name||"";
}
function promptSeriesName(c){
  if(!c)return"";
  if(STATE.lang==="zh")return c.series_zh||c.series_en||c.series||"";
  if(STATE.lang==="ja")return c.series_ja||c.series_en||c.series||"";
  return c.series_en||c.series||"";
}

buildPrompt=function(){
  const assignments=STATE.game?.assignments||[];
  if(STATE.lang==="zh"){
    const lines=assignments.map(a=>`${traitLabel(a.trait)}：${promptCharacterName(a.character)}（${promptSeriesName(a.character)||"自定义角色包"}）`).join("\n");
    return `请根据以下混合角色特质，设计一个完整、统一的原创动漫角色。\n\n重要要求：\n- 必须是一个自然融合后的新角色，不要做成拼贴。\n- 保留各参考角色最鲜明的视觉和性格特征，但整体要像同一个人。\n- 如果角色名称中包含时期、形态或版本，请严格采用该时期/形态。\n\n角色特质\n${lines}\n\n构图：横向 3:2。\n左侧：完整角色设定图，全身站姿，清楚展示脸、发型、体型、服装、配饰和武器；可附一个小头像。\n右侧：同一个角色处于自然或电影感场景中，用行动表现性格、幽默感、恋爱观、头脑、职业、厨艺或能力等非视觉特质。\n\n一致性：左右两侧必须明确是同一个人，脸、发型、眼睛、服装、比例与配饰保持一致。\n\n风格：高品质现代动漫插画、精致角色设定、自然人体、富有表现力的动作、电影感光影。\n\n不要加入作品 Logo、水印、UI 或多余文字。`;
  }
  if(STATE.lang==="ja"){
    const lines=assignments.map(a=>`${traitLabel(a.trait)}：${promptCharacterName(a.character)}（${promptSeriesName(a.character)||"カスタムパック"}）`).join("\n");
    return `以下のキャラクター要素を自然に融合し、ひとりの完成されたオリジナルアニメキャラクターとしてデザインしてください。\n\n重要：\n- コラージュではなく、すべての要素がひとりの人物として自然にまとまるようにする。\n- 各参考キャラクターの特徴は活かしつつ、最終的には新しいキャラクターとして成立させる。\n- 名前に時期・形態・バージョンが含まれている場合は、その時期・形態を厳密に反映する。\n\nキャラクター要素\n${lines}\n\n構図：横長 3:2。\n左側：全身のキャラクター設定画。顔、髪型、体格、衣装、アクセサリー、武器が分かるニュートラルな立ち姿。小さな顔アップを添えてもよい。\n右側：同じキャラクターが自然な日常またはシネマティックな場面にいる様子。性格、ユーモア、恋愛観、知力、職業、料理、能力などの非視覚的な特性を行動で表現する。\n\n一貫性：左右で顔、髪、目、衣装、体格、アクセサリーを統一し、必ず同一人物に見えるようにする。\n\n画風：高品質な現代アニメイラスト、洗練されたキャラクターデザイン、自然な人体、表情豊かな演技、映画的なライティング。\n\n作品ロゴ、透かし、UI、不必要な文字は入れない。`;
  }
  const lines=assignments.map(a=>`${a.trait}: ${promptCharacterName(a.character)} (${promptSeriesName(a.character)||"Custom Pack"})`).join("\n");
  return `Create a polished anime character showcase based on the mixed traits below.\n\nIMPORTANT:\n- Create one coherent original character, not a collage.\n- Blend the strongest visual and behavioral qualities naturally into one believable person.\n- If a character name includes an era, form, or version, use that exact version.\n\nCHARACTER TRAITS\n${lines}\n\nCOMPOSITION: wide 3:2 landscape.\nLEFT: full-body character sheet in a neutral standing pose, clearly showing face, hair, physique, clothing, accessories and weapon; an optional small headshot is fine.\nRIGHT: the same character in a natural or cinematic scene that demonstrates non-visual traits such as personality, humour, romance, intelligence, occupation, cooking or power.\n\nCONSISTENCY: both sides must clearly be the same person with matching face, hair, eyes, clothing, proportions and accessories.\n\nSTYLE: premium modern anime illustration, polished character design, natural anatomy, expressive acting and cinematic lighting.\n\nDo not include franchise logos, watermarks, UI, or unnecessary text.`;
};

buildPKJudgePrompt=function(){
  const pk=STATE.pk;if(!pk)return"";
  function block(n){
    const p=pk[`p${n}`],series=getSeries(p.seriesId);
    const label=STATE.lang==="zh"?`玩家${n}`:STATE.lang==="ja"?`プレイヤー${n}`:`PLAYER ${n}`;
    const rows=p.roles.map(role=>{
      const slot=p.team.find(x=>x.role===role);
      if(!slot)return `- ${roleLabel(role)}: ${STATE.lang==="zh"?"空缺":STATE.lang==="ja"?"空き":"[empty]"}`;
      const c=slot.character;return `- ${roleLabel(role)}: ${promptCharacterName(c)} (${promptSeriesName(c)||displaySeries(series)})`;
    });
    return `${label} — ${displaySeries(series)}\n${rows.join("\n")}`;
  }
  if(STATE.lang==="zh")return `判断以下两支动漫队伍的对战结果。以角色正史能力、当前所选时期/形态、速度、耐久、头脑、克制关系、定位和团队配合为依据。跨作品能力体系请做合理等效，不要虚构能力。\n\n${block(1)}\n\n${block(2)}\n\n回答要短，只按以下格式：\n结果：玩家1胜 / 玩家2胜 / 平局\n差距：碾压 / 明显优势 / 中等优势 / 接近 / 极其接近 / 势均力敌\n理由：2～4句，说明胜负关键。\n最大因素：1句。\n\n如果是平局，差距写“势均力敌”。`;
  if(STATE.lang==="ja")return `以下の2チームの対戦結果を判定してください。正史の能力、選択中の時期・形態、速度、耐久、知力、相性、役割、チーム連携を基準にしてください。作品をまたぐ能力体系は合理的に比較し、存在しない能力は追加しないでください。\n\n${block(1)}\n\n${block(2)}\n\n短く、次の形式だけで回答：\n結果：プレイヤー1勝 / プレイヤー2勝 / 引き分け\n差：圧勝 / 明確な優勢 / 中程度の優勢 / 接戦 / 紙一重 / 五分\n理由：2〜4文で勝敗の要点を説明。\n最大要因：1文。\n\n引き分けの場合は「差：五分」とする。`;
  return `Judge the battle between these two anime teams using canon abilities, the selected era/form, speed, durability, intelligence, counters, role fit and team synergy. Make reasonable cross-series assumptions and do not invent abilities.\n\n${block(1)}\n\n${block(2)}\n\nKeep the answer short and use exactly this format:\nRESULT: Player 1 wins / Player 2 wins / Draw\nMARGIN: Overwhelming / Clear / Moderate / Close / Razor-thin / Even\nWHY: 2–4 short sentences explaining the key matchup.\nBIGGEST FACTOR: 1 sentence.\n\nFor a draw, use MARGIN: Even.`;
};
