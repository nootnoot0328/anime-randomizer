"use strict";

// v0.5 gameplay hotfix: optional repeat/discard behavior for Trait Draft and Quick Randomizer.
I18N.en.poolBehavior="Character reuse";
I18N.en.allowRepeats="Allow repeats";
I18N.en.discardChosen="Discard once chosen";
I18N.en.discardDesc="Chosen characters are removed from the pool for the rest of this game.";
I18N.en.needUniqueCharacters="Not enough unique characters for discard mode.";
I18N.zh.poolBehavior="角色重复规则";
I18N.zh.allowRepeats="允许重复";
I18N.zh.discardChosen="选中后移出角色池";
I18N.zh.discardDesc="角色一旦被选中，本局后续不会再次出现。";
I18N.zh.needUniqueCharacters="角色数量不足，无法使用不重复模式。";
I18N.ja.poolBehavior="キャラの再利用";
I18N.ja.allowRepeats="重複を許可";
I18N.ja.discardChosen="選択後に除外";
I18N.ja.discardDesc="選んだキャラはこのゲーム中、以後プールから除外されます。";
I18N.ja.needUniqueCharacters="重複なしモードに必要な人数が足りません。";

if(!STATE.poolMode) STATE.poolMode="repeat";

function setPoolMode(mode){
  STATE.poolMode=mode==="discard"?"discard":"repeat";
  render();
}

setup=function(){
  const series=allSeries(),excluded=excludedUnknownCount();
  return `<div class="section-head"><div><h2>${esc(t("chooseSeries"))}</h2><p>${esc(t("chooseSeriesDesc"))}</p></div></div><div class="series-list">${series.map(s=>`<button class="series-card${STATE.selectedSeries.has(s.id)?" selected":""}" onclick="toggleSeries(${jsarg(s.id)})"><div class="check">${STATE.selectedSeries.has(s.id)?"✓":""}</div><strong>${esc(displaySeries(s))}</strong><div class="count">${esc(String(applyGenderFilter(s.chars).length))} ${esc(t("characters"))}</div></button>`).join("")}</div>
<div class="section-head"><div><h2>${esc(t("gender"))}</h2><p>${esc(t("pool"))}: ${esc(String(selectedPool().length))}</p>${excluded?`<p class="small">${esc(t("genderExcluded",{n:excluded}))}</p>`:""}</div></div><div class="chips">${[["all","all"],["male","maleOnly"],["female","femaleOnly"]].map(([v,k])=>`<button class="chip${STATE.genderFilter===v?" selected":""}" onclick="setGenderFilter(${jsarg(v)})">${esc(t(k))}</button>`).join("")}</div>
<div class="section-head"><div><h2>${esc(t("poolBehavior"))}</h2>${STATE.poolMode==="discard"?`<p class="small">${esc(t("discardDesc"))}</p>`:""}</div></div><div class="chips"><button class="chip${STATE.poolMode==="repeat"?" selected":""}" onclick="setPoolMode('repeat')">${esc(t("allowRepeats"))}</button><button class="chip${STATE.poolMode==="discard"?" selected":""}" onclick="setPoolMode('discard')">${esc(t("discardChosen"))}</button></div>
<div class="section-head"><div><h2>${esc(t("chooseMode"))}</h2></div></div><div class="chips">${Object.keys(MODES).map(m=>`<button class="chip${STATE.selectedMode===m?" selected":""}" onclick="selectMode(${jsarg(m)})">${esc(t(m))}</button>`).join("")}</div>
<div class="section-head"><div><h2>${esc(t("selectTraits"))}</h2><p>${esc(String(STATE.selectedTraits.size))} ${esc(t("selected"))}</p></div></div><div class="chips">${MODES[STATE.selectedMode].map(tr=>`<button class="chip${STATE.selectedTraits.has(tr)?" selected":""}" onclick="toggleTrait(${jsarg(tr)})">${esc(traitLabel(tr))}</button>`).join("")}</div><div class="cta-row"><button class="primary" onclick="${STATE.setupKind==="quick"?"startQuick()":"startDraft()"}">${esc(STATE.setupKind==="quick"?t("quickStart"):t("start"))}</button></div>`;
};

startDraft=function(){
  const pool=selectedPool();
  if(!STATE.selectedSeries.size)return toast(t("needSeries"));
  if(!STATE.selectedTraits.size)return toast(t("needTrait"));
  if(pool.length<2)return toast(t("needCharacters"));
  // Trait Draft always presents two choices, so discard mode needs one spare character.
  if(STATE.poolMode==="discard"&&pool.length<STATE.selectedTraits.size+1)return toast(t("needUniqueCharacters"));
  STATE.game={kind:"standard",pool:[...pool],poolMode:STATE.poolMode,remaining:[...STATE.selectedTraits],assignments:[],skips:3,left:null,right:null,tempLeft:null,tempRight:null,revealing:false,selected:null,revealTimer:null};
  STATE.resultSaved=false;setScreen("draft","setup");rollDraftPair();
};

assignTrait=function(tr){
  const g=STATE.game;if(!g)return;
  const chosen=g.selected;
  g.assignments.push({trait:tr,character:chosen});
  g.remaining=g.remaining.filter(x=>x!==tr);
  if(g.poolMode==="discard"&&chosen)g.pool=g.pool.filter(c=>c.id!==chosen.id);
  g.selected=null;closeModal();render();if(g.remaining.length)rollDraftPair();
};

startQuick=function(){
  const pool=selectedPool();
  if(!STATE.selectedSeries.size)return toast(t("needSeries"));
  if(!STATE.selectedTraits.size)return toast(t("needTrait"));
  if(!pool.length)return toast(t("needCharacters"));
  if(STATE.poolMode==="discard"&&pool.length<STATE.selectedTraits.size)return toast(t("needUniqueCharacters"));
  cancelAnimations();setScreen("quickreveal","setup");
  const runId=++STATE.quickRunId;
  STATE.quickReveal={pool:[...pool],available:[...pool],poolMode:STATE.poolMode,traits:[...STATE.selectedTraits],index:0,current:null,currentDisplay:null,assignments:[]};
  STATE.resultSaved=false;render();runQuickReveal(runId);
};

runQuickReveal=async function(runId){
  for(let i=0;i<STATE.quickReveal.traits.length;i++){
    if(runId!==STATE.quickRunId||!STATE.quickReveal)return;
    const q=STATE.quickReveal;
    q.index=i;q.current=q.traits[i];
    const source=q.poolMode==="discard"?q.available:q.pool;
    if(!source.length)return;
    for(let ticks=0;ticks<10;ticks++){
      await sleep(80);
      if(runId!==STATE.quickRunId||!STATE.quickReveal)return;
      STATE.quickReveal.currentDisplay=pick(source);render();
    }
    await sleep(120);
    if(runId!==STATE.quickRunId||!STATE.quickReveal)return;
    const finalChar=pick(source);
    STATE.quickReveal.currentDisplay=finalChar;
    STATE.quickReveal.assignments.push({trait:STATE.quickReveal.current,character:finalChar});
    if(STATE.quickReveal.poolMode==="discard")STATE.quickReveal.available=STATE.quickReveal.available.filter(c=>c.id!==finalChar.id);
    render();await sleep(300);
    if(runId!==STATE.quickRunId)return;
  }
  if(runId!==STATE.quickRunId||!STATE.quickReveal)return;
  const assignments=STATE.quickReveal.assignments,pool=STATE.quickReveal.pool,poolMode=STATE.quickReveal.poolMode;
  STATE.game={kind:"quick",pool,poolMode,remaining:[],assignments,skips:0};
  STATE.quickReveal=null;setScreen("result","setup");
};
