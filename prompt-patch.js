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


// Scenario themes: each completed fusion keeps one randomly chosen prompt situation.
Object.assign(I18N.en,{
  chooseMode:"Choose Scenario",partner:"Anime Partner",protagonist:"Protagonist",villain:"Villain",bestfriend:"Best Friend",
  rival:"Rival",mentor:"Mentor",finalboss:"Final Boss",isekai:"Isekai Reincarnation",adventureparty:"Adventure Party Member",roommate:"Roommate"
});
Object.assign(I18N.zh,{
  chooseMode:"选择情境",partner:"动漫伴侣",protagonist:"主角",villain:"反派",bestfriend:"挚友",
  rival:"宿敌",mentor:"导师",finalboss:"最终Boss",isekai:"异世界转生",adventureparty:"冒险队友",roommate:"室友"
});
Object.assign(I18N.ja,{
  chooseMode:"シナリオを選択",partner:"アニメパートナー",protagonist:"主人公",villain:"悪役",bestfriend:"親友",
  rival:"ライバル",mentor:"師匠",finalboss:"ラスボス",isekai:"異世界転生",adventureparty:"冒険パーティー",roommate:"ルームメイト"
});

Object.assign(MODES,{
  rival:["Appearance","Personality","Intelligence","Power","Weapon","Fighting Style","Motive","Charisma","Luck","Special Ability"],
  mentor:["Appearance","Personality","Intelligence","Power","Weapon","Fighting Style","Reliability","Social Skills","Occupation","Special Ability"],
  finalboss:["Appearance","Personality","Motive","Intelligence","Power","Cruelty","Charisma","Weapon","Army","Final Form"],
  isekai:["Face","Hair","Physique","Personality","Intelligence","Power","Weapon","Luck","Outfit","Special Ability","Occupation"],
  adventureparty:["Appearance","Personality","Intelligence","Power","Weapon","Fighting Style","Reliability","Cooking","Occupation","Special Ability","Loyalty","Luck"],
  roommate:["Appearance","Personality","Intelligence","Humour","Reliability","Social Skills","Chaos Level","Hobbies","Loyalty","Cooking","Wealth","Occupation"]
});

const PROMPT_SCENARIOS={
  partner:[
    {en:"A quiet evening cooking together at home after a dangerous mission.",zh:"危险任务结束后，两人在家一起做晚餐，享受安静的夜晚。",ja:"危険な任務を終えた二人が、家で一緒に夕食を作る静かな夜。"},
    {en:"A festival date beneath fireworks, with natural chemistry and small affectionate gestures.",zh:"烟花下的祭典约会，用自然互动和细微动作表现两人的默契。",ja:"花火の下での祭りデート。自然な相性とさりげない愛情を仕草で見せる。"},
    {en:"A rainy-day café date where the pair quietly plan their future together.",zh:"雨天咖啡馆约会，两人一边交谈，一边规划共同的未来。",ja:"雨の日のカフェデート。二人で静かに将来について語り合う。"}
  ],
  protagonist:[
    {en:"The hero stands above a ruined city moments before the decisive battle.",zh:"决战前夕，主角站在残破城市的高处俯瞰战场。",ja:"決戦直前、主人公が廃墟となった街を見下ろしている。"},
    {en:"At sunrise, the hero takes the first step of a vast new journey.",zh:"旭日初升，主角踏出宏大旅程的第一步。",ja:"朝日の中、主人公が壮大な旅への第一歩を踏み出す。"},
    {en:"The hero protects civilians as their true power awakens for the first time.",zh:"为保护平民，主角第一次觉醒真正的力量。",ja:"人々を守るため、主人公の真の力が初めて覚醒する。"}
  ],
  villain:[
    {en:"The antagonist is revealed for the first time inside an ominous throne room.",zh:"反派在阴森的王座大厅中首次正式登场。",ja:"不穏な玉座の間で、敵役が初めてその姿を現す。"},
    {en:"The villain addresses a conquered city from above while their plan enters its final stage.",zh:"计划进入最终阶段，反派从高处向被征服的城市发表宣告。",ja:"計画が最終段階に入り、悪役が征服した街へ高所から宣告する。"},
    {en:"The villain calmly enters the final battlefield while everyone else recoils in fear.",zh:"最终战场上，众人畏惧后退，反派却从容登场。",ja:"最終決戦の場で、周囲が恐怖に退く中、悪役だけが静かに歩み出る。"}
  ],
  bestfriend:[
    {en:"A chaotic road trip or mission where the best friend keeps everyone laughing.",zh:"一场混乱的旅程或任务中，挚友让所有人都笑了出来。",ja:"大混乱の旅や任務の中で、親友が仲間を笑わせ続ける。"},
    {en:"A late-night convenience-store stop after battle, sharing food and honest conversation.",zh:"战斗后的深夜便利店，两人分享食物，也说出真心话。",ja:"戦いの後の深夜のコンビニ。食べ物を分け合い、本音を語る。"},
    {en:"The best friend arrives at the last second to perform a rescue—and cracks a joke.",zh:"挚友在最后一刻赶来救场，还不忘开一句玩笑。",ja:"親友が土壇場で救援に現れ、こんな時でも冗談を飛ばす。"}
  ],
  rival:[
    {en:"Two rivals face each other across an empty arena before their long-awaited duel.",zh:"空旷竞技场中，两位宿敌终于迎来期待已久的决斗。",ja:"誰もいない闘技場で、二人のライバルが待ち望んだ決闘を迎える。"},
    {en:"The rivals form an uneasy alliance against a common enemy without lowering their guard.",zh:"面对共同敌人，两位宿敌暂时联手，却始终没有放下戒心。",ja:"共通の敵を前に、不信感を残したままライバル同士が共闘する。"},
    {en:"At sunset, the rivals begin the final duel that will decide whose path was right.",zh:"夕阳下，两位宿敌展开最终决斗，证明谁选择的道路才是正确的。",ja:"夕暮れの中、どちらの信念が正しかったかを決める最後の決闘が始まる。"}
  ],
  mentor:[
    {en:"On a training ground, the mentor calmly corrects a student's failed technique.",zh:"训练场上，导师冷静地纠正学生失败的招式。",ja:"修練場で、師匠が弟子の失敗した技を冷静に直している。"},
    {en:"The mentor steps in front of their students and stops an overwhelming attack.",zh:"压倒性的攻击来临时，导师挡在学生面前将其拦下。",ja:"圧倒的な攻撃を前に、師匠が弟子たちをかばって受け止める。"},
    {en:"After a painful defeat, the mentor gives one quiet lesson that changes the student's path.",zh:"惨败之后，导师用一句平静的教诲改变了学生未来的道路。",ja:"痛い敗北の後、師匠の静かな教えが弟子の進む道を変える。"}
  ],
  finalboss:[
    {en:"The final boss descends into a collapsing arena in their completed transformation.",zh:"竞技场正在崩塌，最终Boss以完整形态从天而降。",ja:"崩壊する戦場へ、完全形態となったラスボスが降臨する。"},
    {en:"Inside a vast throne room, an entire army kneels as the final boss rises.",zh:"宏伟王座大厅中，整支军团跪下，最终Boss缓缓起身。",ja:"巨大な玉座の間で、全軍がひざまずく中、ラスボスが立ち上がる。"},
    {en:"Reality bends across a cosmic battlefield as the final boss reveals their true power.",zh:"宇宙般的终极战场上，现实开始扭曲，最终Boss展露真正力量。",ja:"宇宙的な最終戦場で現実が歪み、ラスボスが真の力を解放する。"}
  ],
  isekai:[
    {en:"The reincarnated character is summoned into a royal hall and receives an unexpected class.",zh:"转生者被召唤到王宫大厅，并获得了出乎意料的职业。",ja:"転生者が王宮へ召喚され、予想外の職業を授かる。"},
    {en:"At a crowded adventurers' guild, the newcomer discovers what their unique ability can do.",zh:"热闹的冒险者公会中，新人第一次发现自己独特能力的真正用途。",ja:"賑わう冒険者ギルドで、新人が固有能力の本当の使い方に気づく。"},
    {en:"Lost in an ancient forest ruin, the reincarnated character awakens their blessing.",zh:"迷失在古老森林遗迹时，转生者觉醒了自己的祝福。",ja:"古代の森の遺跡で迷う中、転生者の加護が覚醒する。"}
  ],
  adventureparty:[
    {en:"In a lively tavern, the party member helps plan a dangerous new quest.",zh:"热闹酒馆里，这位队友协助众人规划一项危险的新任务。",ja:"賑やかな酒場で、パーティーメンバーが危険な新クエストの作戦を練る。"},
    {en:"Deep inside a dungeon, the party member reacts as a hidden trap is triggered.",zh:"地牢深处，隐藏陷阱突然启动，队友立即作出应对。",ja:"ダンジョンの奥で隠された罠が作動し、仲間が即座に対応する。"},
    {en:"Around a campfire after battle, the party member reveals how they support the group.",zh:"战斗后的篝火旁，队友展现自己如何支撑整个团队。",ja:"戦いの後の焚き火を囲み、その仲間がパーティーを支える姿を見せる。"}
  ],
  roommate:[
    {en:"A chaotic weekday morning in a shared apartment reveals both roommates' habits.",zh:"合租公寓里混乱的工作日早晨，室友的生活习惯暴露无遗。",ja:"シェアハウスの慌ただしい平日の朝、ルームメイトの生活習慣が丸見えになる。"},
    {en:"A disagreement over cooking and chores turns into affectionate domestic comedy.",zh:"围绕做饭和家务的小争执，逐渐变成温馨的日常喜剧。",ja:"料理と家事をめぐる口論が、どこか温かい日常コメディに変わる。"},
    {en:"A relaxed movie or gaming night shows the roommate's quirks and compatibility.",zh:"轻松的电影或游戏之夜，展现室友的怪癖与相处默契。",ja:"映画やゲームを楽しむ夜に、ルームメイトの癖と相性が表れる。"}
  ]
};

function promptScenarioForCurrentGame(){
  const mode=STATE.selectedMode;
  const options=PROMPT_SCENARIOS[mode]||PROMPT_SCENARIOS.protagonist;
  const game=STATE.game;
  if(!game)return{mode,scenario:options[Math.floor(Math.random()*options.length)]};
  if(game.promptTheme!==mode||!Number.isInteger(game.promptScenario)||!options[game.promptScenario]){
    game.promptTheme=mode;
    game.promptScenario=Math.floor(Math.random()*options.length);
  }
  return{mode,scenario:options[game.promptScenario]};
}

const _scenarioBuildPrompt=buildPrompt;
buildPrompt=function(){
  const base=_scenarioBuildPrompt();
  const selected=promptScenarioForCurrentGame();
  const label=t(selected.mode);
  const scene=selected.scenario;
  if(STATE.lang==="zh"){
    const direction="主题："+label+"\n随机场景："+scene.zh+"\n请把这个场景作为右侧画面的主要行动、环境和情绪方向。";
    return base.replace("\n\n角色特质\n","\n\n"+direction+"\n\n角色特质\n");
  }
  if(STATE.lang==="ja"){
    const direction="テーマ："+label+"\nランダムシーン："+scene.ja+"\nこのシーンを右側の主要なアクション、舞台、雰囲気として描いてください。";
    return base.replace("\n\nキャラクター要素\n","\n\n"+direction+"\n\nキャラクター要素\n");
  }
  const direction="THEME: "+label+"\nRANDOM SCENARIO: "+scene.en+"\nUse this scenario as the main action, setting and emotional direction on the right side.";
  return base.replace("\n\nCHARACTER TRAITS\n","\n\n"+direction+"\n\nCHARACTER TRAITS\n");
};

const PK_BATTLE_SCENARIOS=[
  {en:"A ruined neon megacity under a storm, with both teams converging in the central avenue.",zh:"暴风雨笼罩的霓虹废墟都市，两队在中央大道正面交锋。",ja:"嵐に包まれたネオン廃墟都市。両チームが中央大通りで激突する。"},
  {en:"A colossal tournament arena packed with spectators from many anime worlds.",zh:"汇聚多个动漫世界观众的超大型竞技场，全明星队伍正式开战。",ja:"さまざまなアニメ世界の観客で埋まる巨大闘技場。オールスターチームが激突する。"},
  {en:"A shattered floating battlefield above the clouds, linked by broken stone platforms.",zh:"云层上方的破碎浮空战场，各区域由断裂石台连接。",ja:"雲海の上に浮かぶ崩壊した戦場。砕けた石の足場が各区域をつないでいる。"}
];

function pkBattleScenario(){
  const pk=STATE.pk;
  if(!pk)return PK_BATTLE_SCENARIOS[0];
  if(!Number.isInteger(pk.promptScenario)||!PK_BATTLE_SCENARIOS[pk.promptScenario]){
    pk.promptScenario=Math.floor(Math.random()*PK_BATTLE_SCENARIOS.length);
  }
  return PK_BATTLE_SCENARIOS[pk.promptScenario];
}

const _scenarioBuildPKJudgePrompt=buildPKJudgePrompt;
buildPKJudgePrompt=function(){
  let base=_scenarioBuildPKJudgePrompt();
  if(!base)return base;
  const scene=pkBattleScenario();
  if(STATE.lang==="zh"){
    const setup="全明星战斗场景："+scene.zh+"\n场景只负责提供电影感舞台，不得让任何作品自动获得主场优势。\n\n内鬼规则：内鬼、叛忍、叛徒、诅咒师或鬼方叛徒不是忠诚的第六位队员。请根据正史性格和能力，判断其最合理的背叛时机，例如保留支援、误导、破坏或倒戈。即使没有改变胜负，也必须比较两队内鬼位对己方造成的影响。\n\n";
    base=base.replace("不要虚构能力。\n\n","不要虚构能力。\n\n"+setup);
    return base.replace("理由：2～4句，说明胜负关键。","理由：2～4句，说明胜负关键；其中至少一句必须比较两队内鬼位的影响。");
  }
  if(STATE.lang==="ja"){
    const setup="オールスターバトルの舞台："+scene.ja+"\n舞台は演出のための中立フィールドとし、特定作品に自動的なホームアドバンテージを与えないでください。\n\n裏切り枠のルール：裏切り者、抜け忍、離反者、呪詛師、鬼側の裏切り者は、忠実な6人目ではなくチーム内部のリスクです。原作の性格と能力に沿って、支援拒否、誤誘導、妨害、寝返りなど最も自然なタイミングを判定してください。勝敗が変わらなくても、両チームの裏切り枠が味方へ与える影響を必ず比較してください。\n\n";
    base=base.replace("存在しない能力は追加しないでください。\n\n","存在しない能力は追加しないでください。\n\n"+setup);
    return base.replace("理由：2〜4文で勝敗の要点を説明。","理由：2〜4文で勝敗の要点を説明し、少なくとも1文で両チームの裏切り枠の影響を比較する。");
  }
  const setup="ALL-STAR BATTLE SCENE: "+scene.en+"\nTreat the setting as a neutral cinematic arena; it must not grant either franchise an automatic home-field advantage.\n\nTRAITOR RULE: A Traitor, Rogue Ninja, Defector, Curse User or Demon Traitor is an internal liability, not a normal loyal sixth fighter. Using canon personality and abilities, judge a plausible moment to withhold support, misdirect, sabotage or defect. Compare how both teams' betrayal slots hurt their own side even when neither changes the winner.\n\n";
  base=base.replace("do not invent abilities.\n\n","do not invent abilities.\n\n"+setup);
  return base.replace("WHY: 2–4 short sentences explaining the key matchup.","WHY: 2–4 short sentences explaining the key matchup. At least one sentence must compare the impact of both teams' betrayal slots.");
};
