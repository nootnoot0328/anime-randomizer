"use strict";

// Significant character-era/version selector. Only characters with meaningful visual/power changes are listed.
const CHARACTER_PHASES={
  "jjk-maki-zenin":[
    {key:"pre",en:"Pre-awakening",zh:"觉醒前",ja:"覚醒前",portrait:"default"},
    {key:"awakened",en:"Awakened — Heavenly Restriction",zh:"完全觉醒·天与咒缚",ja:"覚醒後・天与呪縛"}
  ],
  "jjk-satoru-gojo":[
    {key:"student",en:"Hidden Inventory — Student",zh:"怀玉·玉折时期",ja:"懐玉・玉折編"},
    {key:"awakened",en:"Awakened / Adult",zh:"觉醒后·成年",ja:"覚醒後・成人期",portrait:"default"}
  ],
  "jjk-yuta-okkotsu":[
    {key:"zero",en:"Jujutsu Kaisen 0",zh:"咒术回战 0 时期",ja:"劇場版0期"},
    {key:"sendai",en:"Sendai / Later Yuta",zh:"仙台结界时期",ja:"仙台結界編",portrait:"default"}
  ],
  "onepiece-monkey-d-luffy":[
    {key:"prets",en:"Pre-timeskip",zh:"两年前",ja:"2年前",portrait:"default"},
    {key:"gear5",en:"Gear 5 / Nika",zh:"五档·尼卡",ja:"ギア5・ニカ"}
  ],
  "onepiece-roronoa-zoro":[
    {key:"prets",en:"Pre-timeskip",zh:"两年前",ja:"2年前",portrait:"default"},
    {key:"koh",en:"King of Hell",zh:"阎王三刀流",ja:"閻王三刀流"}
  ],
  "onepiece-sanji":[
    {key:"prets",en:"Pre-timeskip",zh:"两年前",ja:"2年前",portrait:"default"},
    {key:"ifrit",en:"Ifrit Jambe",zh:"魔神风脚",ja:"魔神風脚"}
  ],
  "naruto-naruto-uzumaki":[
    {key:"shippuden",en:"Shippuden",zh:"疾风传时期",ja:"疾風伝期",portrait:"default"},
    {key:"sixpaths",en:"Six Paths Sage Mode",zh:"六道仙人模式",ja:"六道仙人モード"}
  ],
  "naruto-sasuke-uchiha":[
    {key:"ems",en:"Eternal Mangekyo Sharingan",zh:"永恒万花筒写轮眼",ja:"永遠の万華鏡写輪眼"},
    {key:"rinnegan",en:"Rinnegan / Six Paths",zh:"轮回眼·六道之力",ja:"輪廻眼・六道の力"}
  ],
  "naruto-madara-uchiha":[
    {key:"alive",en:"Living Madara",zh:"生前斑",ja:"生前のマダラ"},
    {key:"tenails",en:"Ten-Tails Jinchuriki",zh:"十尾人柱力",ja:"十尾の人柱力"}
  ],
  "naruto-obito-uchiha":[
    {key:"masked",en:"Masked Obito",zh:"面具男时期",ja:"仮面の男期"},
    {key:"tenails",en:"Ten-Tails Jinchuriki",zh:"十尾人柱力",ja:"十尾の人柱力"}
  ],
  "bleach-ichigo-kurosaki":[
    {key:"soulreaper",en:"Soul Reaper",zh:"死神时期",ja:"死神代行期"},
    {key:"dangai",en:"Dangai / Final Getsuga",zh:"断界·最后的月牙天冲",ja:"断界・最後の月牙天衝"},
    {key:"true",en:"True Zanpakuto / TYBW",zh:"真斩月·千年血战",ja:"真の斬月・千年血戦篇"}
  ],
  "aot-eren-yeager":[
    {key:"scout",en:"Survey Corps",zh:"调查兵团时期",ja:"調査兵団期"},
    {key:"war",en:"War for Paradis",zh:"帕拉迪岛战争时期",ja:"パラディ島戦争期"},
    {key:"founder",en:"Founding Titan",zh:"始祖巨人",ja:"始祖の巨人"}
  ],
  "mha-izuku-midoriya":[
    {key:"early",en:"Early U.A.",zh:"雄英前期",ja:"雄英高校・前期"},
    {key:"finalwar",en:"Final War",zh:"最终决战时期",ja:"最終決戦期"}
  ],
  "mha-tomura-shigaraki":[
    {key:"early",en:"League of Villains",zh:"敌联合时期",ja:"敵連合期"},
    {key:"awakened",en:"Awakened / All For One",zh:"觉醒后·AFO融合",ja:"覚醒後・AFO融合"}
  ],
  "dragonball-goku":[
    {key:"ssj",en:"Super Saiyan era",zh:"超级赛亚人时期",ja:"超サイヤ人期"},
    {key:"ui",en:"Ultra Instinct",zh:"自在极意功",ja:"身勝手の極意"}
  ],
  "dragonball-vegeta":[
    {key:"ssj",en:"Super Saiyan era",zh:"超级赛亚人时期",ja:"超サイヤ人期"},
    {key:"blueevo",en:"Super Saiyan Blue Evolution",zh:"超级赛亚人蓝进化",ja:"超サイヤ人ブルー進化"}
  ],
  "dragonball-gohan":[
    {key:"ssj2",en:"Cell Games — Super Saiyan 2",zh:"沙鲁游戏·超二",ja:"セルゲーム・超サイヤ人2"},
    {key:"beast",en:"Gohan Beast",zh:"野兽悟饭",ja:"孫悟飯ビースト"}
  ],
  "dragonball-broly":[
    {key:"base",en:"Base / Wrathful",zh:"常态·怒气形态",ja:"通常・怒り形態"},
    {key:"fullpower",en:"Full Power Super Saiyan",zh:"全功率超级赛亚人",ja:"超サイヤ人フルパワー",portrait:"default"}
  ],
  "sao-kirito":[
    {key:"aincrad",en:"Aincrad",zh:"艾恩葛朗特时期",ja:"アインクラッド編",portrait:"default"},
    {key:"alicization",en:"Alicization",zh:"Alicization 时期",ja:"アリシゼーション編"}
  ]
};

Object.assign(I18N.en,{characterPhases:"Character versions",characterPhasesDesc:"Choose the era/form used when these characters appear.",phase:"Version"});
Object.assign(I18N.zh,{characterPhases:"角色时期",characterPhasesDesc:"这些角色登场时，会使用你选定的时期或形态。",phase:"时期 / 形态"});
Object.assign(I18N.ja,{characterPhases:"キャラの時期・形態",characterPhasesDesc:"対象キャラが登場するときの時期・形態を選べます。",phase:"時期・形態"});

const AF_PHASE_KEY="af_character_phases_v1";
let AF_PHASE_SELECTION={};
try{AF_PHASE_SELECTION=JSON.parse(localStorage.getItem(AF_PHASE_KEY)||"{}")||{};}catch{}
function savePhaseSelection(){try{localStorage.setItem(AF_PHASE_KEY,JSON.stringify(AF_PHASE_SELECTION));}catch{}}
function phaseOptionsFor(c){return CHARACTER_PHASES[c?.id]||null;}
function selectedPhaseFor(c){
  const opts=phaseOptionsFor(c);if(!opts?.length)return null;
  const key=AF_PHASE_SELECTION[c.id];
  return opts.find(x=>x.key===key)||opts[opts.length-1];
}
function setCharacterPhase(charId,key){
  const opts=CHARACTER_PHASES[charId];if(!opts?.some(x=>x.key===key))return;
  AF_PHASE_SELECTION[charId]=key;savePhaseSelection();render();
}
function withSelectedPhase(c){
  const ph=selectedPhaseFor(c);if(!ph)return c;
  const out={...c,phaseKey:ph.key,phase_en:ph.en,phase_zh:ph.zh,phase_ja:ph.ja,phasePortraitVerified:ph.portrait==="default"};
  out.name_en=`${c.name_en||c.name} — ${ph.en}`;
  if(c.name_zh)out.name_zh=`${c.name_zh} · ${ph.zh}`;
  if(c.name_ja)out.name_ja=`${c.name_ja}・${ph.ja}`;
  return out;
}

// A generic character portrait must not be presented as a different era/form.
// Until a phase has reviewed artwork, use the initials fallback instead.
const _phaseCharacterImageUrl=characterImageUrl;
characterImageUrl=function(c){if(c?.phaseKey&&!c.phasePortraitVerified)return null;return _phaseCharacterImageUrl(c);};

// Apply the chosen version everywhere pools are built, including PK.
const _phaseApplyGenderFilter=applyGenderFilter;
applyGenderFilter=function(chars){return _phaseApplyGenderFilter(chars).map(withSelectedPhase);};

function phaseSelectorBlock(seriesIds){
  const ids=new Set(seriesIds||[]);
  const chars=[...ids].flatMap(id=>getSeries(id)?.chars||[]).filter(c=>CHARACTER_PHASES[c.id]);
  if(!chars.length)return"";
  return `<details class="panel" style="margin-top:16px"><summary><strong>${esc(t("characterPhases"))}</strong></summary><p class="small">${esc(t("characterPhasesDesc"))}</p><div class="phase-select-list">${chars.map(c=>{const opts=CHARACTER_PHASES[c.id],selected=selectedPhaseFor(c);return `<div class="form-group"><label>${esc(displayName(c))}</label><select onchange="setCharacterPhase(${jsarg(c.id)},this.value)">${opts.map(o=>`<option value="${esc(o.key)}" ${o.key===selected.key?"selected":""}>${esc(STATE.lang==="zh"?o.zh:STATE.lang==="ja"?o.ja:o.en)}</option>`).join("")}</select></div>`;}).join("")}</div></details>`;
}

// Add phase controls to Trait Draft / Quick setup without replacing the existing customizer logic.
const _phaseSetup=setup;
setup=function(){
  let html=_phaseSetup();
  const block=phaseSelectorBlock(STATE.selectedSeries);
  if(!block)return html;
  const marker='<div class="section-head"><div><h2>'+esc(t("chooseMode"))+'</h2></div></div>';
  return html.includes(marker)?html.replace(marker,block+marker):html+block;
};

// PK uses one series per player, so expose the same selectors there too.
const _phasePKSetupView=pkSetupView;
pkSetupView=function(){
  let html=_phasePKSetupView();
  const ids=STATE.pkSetup.kind==="budget"?[STATE.pkSetup.pool]:[STATE.pkSetup.p1,STATE.pkSetup.p2];
  const block=phaseSelectorBlock(ids.filter(Boolean));
  return block?html+block:html;
};

// Keep history faithful to the selected version at the time the result was saved.
const _phaseSaveResult=saveResult;
saveResult=function(){
  if(!STATE.game)return;
  const sig=resultSignature(STATE.game.assignments);
  if(STATE.history.some(h=>h.signature===sig)){STATE.resultSaved=true;toast(t("resultSaved"));render();return;}
  STATE.history.unshift({id:uuid(),date:new Date().toISOString(),mode:STATE.selectedMode,signature:sig,assignments:STATE.game.assignments.map(a=>({trait:a.trait,charId:a.character.id,name:a.character.name_en||a.character.name,name_zh:a.character.name_zh||null,name_ja:a.character.name_ja||null,phaseKey:a.character.phaseKey||null,seriesId:a.character.seriesId||null,series:a.character.series_en||a.character.series||""}))});
  STATE.history=STATE.history.slice(0,50);localStorage.setItem("af_history",JSON.stringify(STATE.history));STATE.resultSaved=true;toast(t("saved"));render();
};

const _phaseHistoryView=historyView;
historyView=function(){
  if(!STATE.history.length)return _phaseHistoryView();
  return `<div class="section-head"><h2>${esc(t("history"))}</h2></div><div class="grid">${STATE.history.map(h=>`<div class="result-card"><div class="row between"><strong>${esc(t(h.mode))}</strong><span class="small">${esc(new Date(h.date).toLocaleString())}</span></div><div class="assignment-list" style="margin-top:10px">${h.assignments.map(a=>{let name=a.name;if(STATE.lang==="zh"&&a.name_zh)name=a.name_zh;if(STATE.lang==="ja"&&a.name_ja)name=a.name_ja;if(!a.phaseKey){const c=a.charId?getCharacter(a.charId):null;if(c)name=displayName(c);}return `<div class="assignment"><span class="key">${esc(traitLabel(a.trait))}</span><span class="val">${esc(name)}</span></div>`;}).join("")}</div></div>`).join("")}</div>`;
};
