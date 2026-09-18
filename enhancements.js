"use strict";

// v0.5 post-release UX enhancements.
// Keeps gameplay state client-side only; no backend or API calls are introduced.

// ---- More natural Simplified Chinese / Japanese UI copy ----
Object.assign(I18N.zh,{
  heroTitle:"拼出一个不可能存在的动漫角色。",
  subtitle:"从不同角色身上抽取特质，看看最后会变成谁。",
  standard:"特质拼装",
  standardDesc:"每轮二选一，再决定要继承 TA 的哪项特质。",
  quick:"快速随机",
  quickDesc:"一键开抽，用轮盘逐项揭晓结果。",
  pk:"阵容对决",
  pkDesc:"两名玩家轮流选角、分配定位，最后看看哪队更强。",
  chooseSeries:"选择作品",
  chooseSeriesDesc:"可以混搭多个动漫作品。",
  chooseMode:"选择主题",
  selectTraits:"选择要随机的特质",
  gender:"角色性别",
  poolBehavior:"角色是否可重复",
  allowRepeats:"可重复抽到",
  discardChosen:"选过后不再出现",
  discardDesc:"角色一旦被选中并分配特质，本局后续不会再次出现。",
  needUniqueCharacters:"角色数量不够，无法使用不重复模式。",
  pkJudge:"让 AI 判断胜负",
  pkJudgeCopied:"AI 对战判断提示词已复制",
  pkJudgeTitle:"AI 对战判断提示词",
  customizerRemembered:"你的选择会自动记住，下次继续使用。"
});
Object.assign(I18N.ja,{
  heroTitle:"ありえないアニメキャラを作ろう。",
  subtitle:"いろんなキャラの特徴を引き継いで、最後にどんな人物になるか見てみよう。",
  standard:"特性ドラフト",
  standardDesc:"毎ラウンド2人から1人を選び、そのキャラから受け継ぐ特性を決めます。",
  quick:"クイックランダム",
  quickDesc:"ワンタップで抽選。ルーレットで特性を順番に公開します。",
  pk:"チーム対決",
  pkDesc:"2人で交互にキャラをドラフトして役割を決め、最後にどちらのチームが強いか比べます。",
  chooseSeries:"作品を選ぶ",
  chooseSeriesDesc:"複数作品を自由に組み合わせられます。",
  chooseMode:"テーマを選ぶ",
  selectTraits:"ランダム化する特性",
  gender:"キャラの性別",
  poolBehavior:"キャラの重複",
  allowRepeats:"重複あり",
  discardChosen:"一度選んだら除外",
  discardDesc:"特性に採用されたキャラは、そのゲーム中は再登場しません。",
  needUniqueCharacters:"重複なしにするにはキャラクター数が足りません。",
  pkJudge:"AIに勝敗を判定させる",
  pkJudgeCopied:"AI対戦判定プロンプトをコピーしました",
  pkJudgeTitle:"AI対戦判定プロンプト",
  customizerRemembered:"設定は自動保存され、次回もそのまま使えます。"
});
Object.assign(I18N.en,{
  pkJudge:"Copy AI battle judge prompt",
  pkJudgeCopied:"AI battle judge prompt copied",
  pkJudgeTitle:"AI Battle Judge Prompt",
  customizerRemembered:"Your customizer choices are remembered for next time."
});

Object.assign(TRAIT_LABELS,{
  Appearance:{zh:"外形",ja:"外見"},
  Hair:{zh:"发型",ja:"髪型"},
  Body:{zh:"身材",ja:"体型"},
  Personality:{zh:"性格",ja:"性格"},
  Intelligence:{zh:"头脑",ja:"知力"},
  Humour:{zh:"幽默感",ja:"ユーモア"},
  Romance:{zh:"恋爱观",ja:"恋愛観"},
  Loyalty:{zh:"忠诚度",ja:"一途さ"},
  Cooking:{zh:"厨艺",ja:"料理の腕"},
  Wealth:{zh:"财力",ja:"財力"},
  Occupation:{zh:"职业",ja:"職業"},
  Power:{zh:"能力",ja:"能力"},
  Face:{zh:"长相",ja:"顔立ち"},
  Physique:{zh:"体格",ja:"体格"},
  Reliability:{zh:"靠谱程度",ja:"頼もしさ"},
  "Social Skills":{zh:"社交力",ja:"コミュ力"},
  "Chaos Level":{zh:"搞事程度",ja:"カオス度"}
});

Object.assign(ROLE_LABELS,{
  "Tanker":{zh:"肉盾",ja:"タンク役"},
  "Right Hand":{zh:"副手",ja:"右腕"},
  "Intelligence Ninja":{zh:"情报忍者",ja:"情報担当忍者"},
  "Grade 1 Leader":{zh:"一级术师队长",ja:"一級術師リーダー"},
  "Frontliner":{zh:"前锋",ja:"前衛"},
  "Reverse Cursed Healer":{zh:"反转术式治疗手",ja:"反転術式の治療役"},
  "Curse User":{zh:"诅咒师",ja:"呪詛師"},
  "Healer":{zh:"治疗手",ja:"回復役"},
  "Hashira Leader":{zh:"柱级队长",ja:"柱リーダー"},
  "Second Blade":{zh:"副剑士",ja:"第二剣士"},
  "Medic":{zh:"医疗手",ja:"治療役"},
  "Demon Traitor":{zh:"倒戈之鬼",ja:"寝返った鬼"}
});

// ---- Remember Trait Draft / Quick customizer ----
const AF_CUSTOMIZER_KEY="af_customizer_v1";
let AF_CUSTOMIZER={traitsByMode:{}};
try{
  const saved=JSON.parse(localStorage.getItem(AF_CUSTOMIZER_KEY)||"null");
  if(saved&&typeof saved==="object")AF_CUSTOMIZER={traitsByMode:{},...saved};
}catch{}

function saveCustomizer(){
  AF_CUSTOMIZER.seriesIds=[...STATE.selectedSeries];
  AF_CUSTOMIZER.mode=STATE.selectedMode;
  AF_CUSTOMIZER.genderFilter=STATE.genderFilter;
  AF_CUSTOMIZER.poolMode=STATE.poolMode||"repeat";
  AF_CUSTOMIZER.traitsByMode=AF_CUSTOMIZER.traitsByMode||{};
  AF_CUSTOMIZER.traitsByMode[STATE.selectedMode]=[...STATE.selectedTraits];
  try{localStorage.setItem(AF_CUSTOMIZER_KEY,JSON.stringify(AF_CUSTOMIZER));}catch{}
}

(function restoreCustomizer(){
  if(Array.isArray(AF_CUSTOMIZER.seriesIds))STATE.selectedSeries=new Set(AF_CUSTOMIZER.seriesIds);
  if(AF_CUSTOMIZER.mode&&MODES[AF_CUSTOMIZER.mode])STATE.selectedMode=AF_CUSTOMIZER.mode;
  if(["all","male","female"].includes(AF_CUSTOMIZER.genderFilter))STATE.genderFilter=AF_CUSTOMIZER.genderFilter;
  if(["repeat","discard"].includes(AF_CUSTOMIZER.poolMode))STATE.poolMode=AF_CUSTOMIZER.poolMode;
  const traits=AF_CUSTOMIZER.traitsByMode?.[STATE.selectedMode];
  if(Array.isArray(traits))STATE.selectedTraits=new Set(traits.filter(x=>MODES[STATE.selectedMode].includes(x)));
})();

// Preserve the user's customizer instead of resetting it whenever setup is reopened.
openSetup=function(kind){
  STATE.setupKind=kind;
  const savedTraits=AF_CUSTOMIZER.traitsByMode?.[STATE.selectedMode];
  if(Array.isArray(savedTraits))STATE.selectedTraits=new Set(savedTraits.filter(x=>MODES[STATE.selectedMode].includes(x)));
  if(!STATE.selectedTraits.size&&!Array.isArray(savedTraits))STATE.selectedTraits=new Set(MODES[STATE.selectedMode]);
  setScreen("setup","home");
};

toggleSeries=function(id){
  STATE.selectedSeries.has(id)?STATE.selectedSeries.delete(id):STATE.selectedSeries.add(id);
  saveCustomizer();render();
};

selectMode=function(mode){
  if(!MODES[mode])return;
  AF_CUSTOMIZER.traitsByMode=AF_CUSTOMIZER.traitsByMode||{};
  AF_CUSTOMIZER.traitsByMode[STATE.selectedMode]=[...STATE.selectedTraits];
  STATE.selectedMode=mode;
  const saved=AF_CUSTOMIZER.traitsByMode[mode];
  STATE.selectedTraits=new Set(Array.isArray(saved)?saved.filter(x=>MODES[mode].includes(x)):MODES[mode]);
  saveCustomizer();render();
};

toggleTrait=function(tr){
  STATE.selectedTraits.has(tr)?STATE.selectedTraits.delete(tr):STATE.selectedTraits.add(tr);
  saveCustomizer();render();
};

setGenderFilter=function(g){
  STATE.genderFilter=["all","male","female"].includes(g)?g:"all";
  saveCustomizer();render();
};

const _afSetPoolMode=setPoolMode;
setPoolMode=function(mode){
  _afSetPoolMode(mode);
  saveCustomizer();
};

// ---- PK generative-AI judge prompt ----
function buildPKJudgePrompt(){
  const pk=STATE.pk;
  if(!pk)return"";
  function teamBlock(n){
    const p=pk[`p${n}`];
    const series=getSeries(p.seriesId);
    const rows=p.roles.map(role=>{
      const slot=p.team.find(x=>x.role===role);
      if(!slot)return `- ${role}: [empty]`;
      const c=slot.character;
      return `- ${role}: ${c.name_en||c.name} (${c.series_en||c.series||series?.name_en||"Unknown series"})`;
    });
    return `PLAYER ${n} — ${series?.name_en||series?.name||"Team"}\n${rows.join("\n")}`;
  }
  return `You are judging a fictional anime team battle between two drafted teams. Determine the most plausible winner using canonical character abilities and reasonable cross-series comparisons.\n\n${teamBlock(1)}\n\n${teamBlock(2)}\n\nJUDGING RULES\n- Use the characters' established canon abilities, combat experience, durability, speed, intelligence, teamwork potential, counters and role fit.\n- Treat each character as a cooperative member of their drafted team unless a core canon limitation would materially affect the battle.\n- Do not invent abilities, transformations or equipment they do not canonically possess.\n- For cross-series power systems, state any important assumptions instead of pretending the systems are perfectly equivalent.\n- Consider team synergy and matchup interactions, not only raw individual power.\n- If a role such as Healer, Strategist, Tanker or Traitor materially changes the matchup, explain how.\n- If a team is incomplete, account for the missing slots.\n- A draw is allowed only when the matchup is genuinely too close or impossible to resolve reasonably.\n\nReturn exactly this structure:\n\nWINNER: Player 1 / Player 2 / Draw\n\nCOMMENT:\n2–4 concise paragraphs explaining how the fight is likely to unfold and why. Mention important counters, teamwork and turning points.\n\nBIGGEST FACTOR:\nName the single most important factor that decides the matchup, then explain it in 1–2 sentences.\n\nCLOSEST THREAT:\nName the character or interaction on the losing side that came closest to changing the result.`;
}

async function copyPKJudgePrompt(){
  const prompt=buildPKJudgePrompt();
  if(!prompt)return;
  try{
    await navigator.clipboard.writeText(prompt);
    toast(t("pkJudgeCopied"));
  }catch{
    modal(`<div class="modal-head"><h2>${esc(t("pkJudgeTitle"))}</h2><button class="icon-btn" onclick="closeModal()">×</button></div><textarea>${esc(prompt)}</textarea>`);
  }
}

pkResult=function(){
  return `<div class="result-title"><div class="eyebrow">PK</div><div class="big">${esc(t("teamComplete"))}</div></div><div class="team-board">${pkTeam(1)}${pkTeam(2)}</div><div class="cta-row"><button class="primary" onclick="copyPKJudgePrompt()">${esc(t("pkJudge"))}</button><button class="secondary" onclick="openPKSetup()">${esc(t("playAgain"))}</button></div>`;
};
