"use strict";

// PK v2: compact one-screen draft, touch drag/drop, skip tokens and budget draft.

Object.assign(I18N.en,{
  randomPK:"Random PK",budgetPK:"$100 Budget PK",budgetPKDesc:"Share one roster and build a six-role team without spending over $100.",
  pkStyle:"Draft style",sharedRoster:"Shared roster",budget:"Budget",cost:"Cost",affordable:"Affordable",sold:"Drafted",
  dragHint:"Drag a card to an open role, or tap the card then the role.",dragHandle:"Drag",skipPair:"Skip pair",skipUsed:"Skip used",remainingBudget:"remaining",
  directMatchups:"Direct matchups",budgetRule:"Keep enough budget to fill every remaining role.",gallery:"Gallery"
});
Object.assign(I18N.zh,{
  randomPK:"随机阵容对决",budgetPK:"$100 预算对决",budgetPKDesc:"双方共用同一个角色池，以100元预算组建六人阵容。",
  pkStyle:"选角方式",sharedRoster:"共享角色池",budget:"预算",cost:"价格",affordable:"可购买",sold:"已被选走",
  dragHint:"把角色卡拖到空缺定位；也可以先点角色，再点定位。",dragHandle:"拖动",skipPair:"跳过本轮",skipUsed:"已使用跳过",remainingBudget:"剩余",
  directMatchups:"对应单挑",budgetRule:"必须预留足够预算填满所有剩余定位。",gallery:"角色图库"
});
Object.assign(I18N.ja,{
  randomPK:"ランダム対決",budgetPK:"$100 予算対決",budgetPKDesc:"1つの共有キャラプールから、100ドル以内で6つの役割を編成します。",
  pkStyle:"ドラフト方式",sharedRoster:"共有キャラプール",budget:"予算",cost:"価格",affordable:"獲得可能",sold:"ドラフト済み",
  dragHint:"キャラカードを空き役職へドラッグ。カードをタップしてから役職を選んでもOK。",dragHandle:"ドラッグ",skipPair:"候補をスキップ",skipUsed:"スキップ使用済み",remainingBudget:"残り",
  directMatchups:"一対一の組み合わせ",budgetRule:"残りの全役職を埋められる予算を確保してください。",gallery:"キャラ図鑑"
});

const AF_ROLE_BLUEPRINTS={
  onepiece:[["captain","Captain","船长","船長"],["firstmate","First Mate","副船长","副船長"],["tanker","Shield Fighter","肉盾战斗员","盾役"],["doctor","Ship Doctor","船医","船医"],["strategist","Navigator / Strategist","航海士／军师","航海士／軍師"],["traitor","Crew Traitor","海贼团内鬼","一味の裏切り者"]],
  naruto:[["leader","Hokage","火影","火影"],["deputy","Hokage's Right Hand","火影辅佐","火影補佐"],["tanker","Defense Ninja","防御忍者","防御忍"],["healer","Medical Ninja","医疗忍者","医療忍者"],["strategist","Intelligence Ninja","情报忍者","情報忍者"],["traitor","Rogue Ninja","叛忍","抜け忍"]],
  jjk:[["leader","Grade 1 Sorcerer Leader","一级术师队长","一級術師隊長"],["deputy","Second-in-Command","副队长","副隊長"],["tanker","Frontline Sorcerer","前线术师","前衛術師"],["healer","Reverse Cursed Technique Healer","反转术式治疗手","反転術式治療役"],["strategist","Jujutsu Strategist","咒术军师","呪術参謀"],["traitor","Curse User","诅咒师","呪詛師"]],
  bleach:[["leader","Squad Captain","队长","隊長"],["deputy","Lieutenant","副队长","副隊長"],["tanker","Frontline Soul Reaper","前线死神","前衛死神"],["healer","Squad 4 Healer","四番队治疗手","四番隊治療役"],["strategist","Soul Society Tactician","尸魂界军师","尸魂界軍師"],["traitor","Defector","叛逃者","離反者"]],
  demonslayer:[["leader","Hashira Leader","柱级队长","柱頭"],["deputy","Tsuguko / Second Blade","继子／副剑士","継子／第二剣士"],["tanker","Defense Swordsman","防御剑士","防御剣士"],["healer","Butterfly Mansion Medic","蝶屋医疗手","蝶屋敷治療役"],["strategist","Kakushi Scout","隐部侦察","隠・斥候"],["traitor","Demon Turncoat","倒戈之鬼","鬼側の裏切り者"]],
  chainsawman:[["leader","Public Safety Captain","公安队长","公安隊長"],["deputy","Senior Devil Hunter","资深恶魔猎人","上級デビルハンター"],["tanker","Fiend Vanguard","魔人前锋","魔人前衛"],["healer","Field Support","现场支援","現場支援"],["strategist","Devil Intelligence Officer","恶魔情报员","悪魔情報官"],["traitor","Contract Betrayer","契约背叛者","契約裏切り者"]],
  spyfamily:[["leader","WISE Handler","WISE 管理官","WISE 管理官"],["deputy","Lead Agent","首席特工","主任諜報員"],["tanker","Close Protection","近身护卫","近接護衛"],["healer","Field Support","现场支援","現場支援"],["strategist","Intelligence Analyst","情报分析员","情報分析官"],["traitor","Double Agent","双面间谍","二重スパイ"]],
  frieren:[["leader","Hero Party Leader","勇者队伍领队","勇者一行の隊長"],["deputy","Vanguard Warrior","前卫战士","前衛戦士"],["tanker","Defensive Mage","防御魔法使","防御魔法使い"],["healer","Priest","僧侣","僧侶"],["strategist","Tactical Mage","战术魔法使","戦術魔法使い"],["traitor","Party Betrayer","队伍叛徒","一行の裏切り者"]],
  aot:[["leader","Survey Corps Commander","调查兵团团长","調査兵団団長"],["deputy","Squad Captain","分队长","分隊長"],["tanker","Armored Vanguard","装甲前锋","装甲前衛"],["healer","Combat Medic","战地医疗兵","戦闘衛生兵"],["strategist","Scout Strategist","侦察军师","偵察参謀"],["traitor","Turncoat","倒戈者","寝返り者"]],
  mha:[["leader","Pro Hero Leader","职业英雄队长","プロヒーロー隊長"],["deputy","Sidekick","副手英雄","サイドキック"],["tanker","Defense Hero","防御型英雄","防御ヒーロー"],["healer","Rescue Hero","救援型英雄","救助ヒーロー"],["strategist","Tactical Hero","战术型英雄","戦術ヒーロー"],["traitor","Villain Informant","敌方内应","敵側の内通者"]],
  hunterxhunter:[["leader","Hunter Leader","猎人领队","ハンター隊長"],["deputy","Deputy Hunter","副领队猎人","副隊長ハンター"],["tanker","Enhancer Vanguard","强化系前锋","強化系前衛"],["healer","Support Hunter","支援猎人","支援ハンター"],["strategist","Nen Strategist","念能力军师","念能力参謀"],["traitor","Double-Crosser","背叛者","裏切り者"]],
  fma:[["leader","Commanding Officer","指挥官","司令官"],["deputy","Adjutant","副官","副官"],["tanker","Heavy Combatant","重装战斗员","重戦闘員"],["healer","Medical Alchemist","医疗炼金术师","医療錬金術師"],["strategist","State Alchemist Strategist","国家炼金术军师","国家錬金術参謀"],["traitor","Homunculus Agent","人造人内应","ホムンクルスの内通者"]],
  blackclover:[["leader","Magic Knight Captain","魔法骑士团长","魔法騎士団長"],["deputy","Vice-Captain","副团长","副団長"],["tanker","Defense Mage","防御魔导士","防御魔導士"],["healer","Healing Mage","恢复魔导士","回復魔導士"],["strategist","Arcane Strategist","冥域军师","冥域参謀"],["traitor","Devil Host Turncoat","恶魔附身叛徒","悪魔憑きの裏切り者"]],
  onepunchman:[["leader","S-Class Leader","S级英雄队长","S級ヒーロー隊長"],["deputy","Assault Hero","突击英雄","強襲ヒーロー"],["tanker","Defense Hero","防御英雄","防御ヒーロー"],["healer","Support Hero","支援英雄","支援ヒーロー"],["strategist","Tactical Hero","战术英雄","戦術ヒーロー"],["traitor","Monster Turncoat","怪人内鬼","怪人側の裏切り者"]],
  dragonball:[["leader","Z Fighter Leader","Z战士领队","Z戦士隊長"],["deputy","Second Fighter","副战士","副戦士"],["tanker","Powerhouse","力量担当","剛力担当"],["healer","Senzu Support","仙豆支援","仙豆支援"],["strategist","Battle Tactician","战斗军师","戦闘参謀"],["traitor","Enemy Turncoat","敌方倒戈者","敵側の寝返り者"]],
  sao:[["leader","Party Leader","队伍领队","パーティーリーダー"],["deputy","Sub-Leader","副领队","副隊長"],["tanker","Tank","坦克","タンク"],["healer","Healer","治疗师","回復役"],["strategist","Scout","侦察员","斥候"],["traitor","Red Player","红名玩家","レッドプレイヤー"]],
  jojo:[["leader","Joestar Leader","乔斯达领队","ジョースター隊長"],["deputy","Stand Partner","替身搭档","スタンド相棒"],["tanker","Close-Range Stand User","近距离替身使者","近距離型スタンド使い"],["healer","Support Stand User","支援型替身使者","支援型スタンド使い"],["strategist","Stand Strategist","替身军师","スタンド参謀"],["traitor","Enemy Stand User","敌方替身使者","敵側スタンド使い"]],
  fairytail:[["leader","Guild Master","公会会长","ギルドマスター"],["deputy","S-Class Partner","S级搭档","S級魔導士の相棒"],["tanker","Frontline Mage","前线魔导士","前衛魔導士"],["healer","Healing Mage","治愈魔导士","治癒魔導士"],["strategist","Tactical Mage","战术魔导士","戦術魔導士"],["traitor","Dark Guild Defector","黑暗公会叛徒","闇ギルドの離反者"]],
  sololeveling:[["leader","Guild Master","公会会长","ギルドマスター"],["deputy","Vice Master","副会长","副マスター"],["tanker","Tanker","坦克","タンク"],["healer","Healer","治疗师","ヒーラー"],["strategist","Ranger / Strategist","远程／军师","レンジャー／参謀"],["traitor","Monarch's Agent","君主内应","君主の内通者"]],
  mobpsycho:[["leader","Psychic Leader","超能力者领队","超能力者隊長"],["deputy","Partner","搭档","相棒"],["tanker","Barrier Specialist","结界专家","結界使い"],["healer","Support Esper","支援型超能力者","支援エスパー"],["strategist","Psychic Strategist","超能力军师","超能力参謀"],["traitor","Claw Defector","爪组织叛徒","爪の離反者"]],
  tokyoghoul:[["leader","Ward Commander","区队指挥官","区隊指揮官"],["deputy","Deputy Investigator","副搜查官","副捜査官"],["tanker","Kakuja Vanguard","赫者前锋","赫者前衛"],["healer","Field Medic","现场医疗员","現場衛生員"],["strategist","Intelligence Officer","情报官","情報官"],["traitor","Double Agent","双面间谍","二重スパイ"]],
  dandadan:[["leader","Occult Leader","灵异领队","怪異対策隊長"],["deputy","Partner","搭档","相棒"],["tanker","Frontline Fighter","前线战斗员","前衛戦闘員"],["healer","Spiritual Support","灵力支援","霊力支援"],["strategist","Occult Strategist","灵异军师","怪異参謀"],["traitor","Possessed Traitor","附身叛徒","憑依された裏切り者"]],
  kaijuno8:[["leader","Defense Force Captain","防卫队长","防衛隊長"],["deputy","Vice-Captain","副队长","副隊長"],["tanker","Numbers Vanguard","识别怪兽兵器前锋","識別怪獣兵器前衛"],["healer","Field Medic","战地医疗员","戦地衛生員"],["strategist","Operations Officer","作战参谋","作戦参謀"],["traitor","Kaiju Turncoat","怪兽内鬼","怪獣側の裏切り者"]],
  fireforce:[["leader","Company Captain","大队长","大隊長"],["deputy","Lieutenant","中队长","中隊長"],["tanker","Frontline Fire Soldier","前线消防官","前衛消防官"],["healer","Sister / Medic","修女／医疗手","シスター／治療役"],["strategist","Science Officer","科学官","科学捜査官"],["traitor","White-Clad Defector","白衣人叛徒","白装束の離反者"]]
};

for(const [seriesId,roles] of Object.entries(AF_ROLE_BLUEPRINTS)){
  ROLE_SETS[seriesId]=roles.map(r=>`${seriesId}:${r[0]}`);
  roles.forEach(r=>{ROLE_LABELS[`${seriesId}:${r[0]}`]={en:r[1],zh:r[2],ja:r[3]};});
}
const _afBaseRoleLabel=roleLabel;
roleLabel=function(key){const item=ROLE_LABELS[key];if(!item)return _afBaseRoleLabel(key);return item[langKey()]||item.en||key;};

const AF_PRICE_TIERS={
  30:new Set(["onepiece-monkey-d-luffy","onepiece-kaido","onepiece-edward-newgate","onepiece-shanks","naruto-naruto-uzumaki","naruto-sasuke-uchiha","naruto-madara-uchiha","naruto-hashirama-senju","jjk-satoru-gojo","jjk-ryomen-sukuna","bleach-ichigo-kurosaki","bleach-sosuke-aizen","bleach-yhwach","bleach-genryusai-shigekuni-yamamoto","demonslayer-yoriichi-tsugikuni","demonslayer-kokushibo","aot-eren-yeager","mha-all-might","mha-tomura-shigaraki","hunterxhunter-meruem","hunterxhunter-isaac-netero","fma-father","onepunchman-saitama","onepunchman-garou","onepunchman-blast","dragonball-goku","dragonball-vegeta","dragonball-jiren","dragonball-broly","jojo-giorno-giovanna","jojo-enrico-pucci","fairytail-acnologia","sololeveling-sung-jinwoo","sololeveling-antares","sololeveling-ashborn","mobpsycho-shigeo-kageyama","kaijuno8-kafka-hibino","kaijuno8-kaiju-no-9","fireforce-shinra-kusakabe","fireforce-benimaru-shinmon"]),
  25:new Set(["onepiece-roronoa-zoro","onepiece-charlotte-linlin","onepiece-sakazuki","onepiece-dracule-mihawk","naruto-minato-namikaze","naruto-obito-uchiha","jjk-yuta-okkotsu","jjk-yuki-tsukumo","bleach-kenpachi-zaraki","bleach-shunsui-kyoraku","demonslayer-muzan-kibutsuji","demonslayer-gyomei-himejima","chainsawman-makima","chainsawman-pochita","frieren-frieren","frieren-serie","aot-levi-ackerman","mha-endeavor","mha-izuku-midoriya","hunterxhunter-gon-freecss","hunterxhunter-chrollo-lucilfer","blackclover-asta","blackclover-yuno","onepunchman-tatsumaki","onepunchman-lord-boros","dragonball-gohan","dragonball-frieza","dragonball-beerus","sao-kirito","sao-administrator","jojo-jotaro-kujo","jojo-dio-brando","fairytail-natsu-dragneel","fairytail-zeref-dragneel","sololeveling-thomas-andre","tokyoghoul-ken-kaneki","dandadan-momo-ayase","dandadan-ken-takakura","kaijuno8-gen-narumi","fireforce-sho-kusakabe"]),
  10:new Set(["onepiece-usopp","onepiece-nami","spyfamily-anya-forger","spyfamily-becky-blackbell","frieren-heiter","aot-sasha-blouse","hunterxhunter-leorio-paradinight","hunterxhunter-komugi","fma-winry-rockbell","onepunchman-mumen-rider","dragonball-bulma","sao-yui","jojo-iggy","fairytail-happy","sololeveling-yoo-jinho","mobpsycho-arataka-reigen","dandadan-chiquitita"]),
  5:new Set(["spyfamily-bond-forger","chainsawman-kobeni-higashiyama","aot-marcel-galliard","dragonball-master-roshi","dandadan-taro","dandadan-hana"])
};
function characterPrice(c){for(const [price,ids] of Object.entries(AF_PRICE_TIERS))if(ids.has(c.id))return Number(price);return 15;}

function updatePKSetup(which,value){STATE.pkSetup[which]=value;render();}
function openPKSetup(kind="random"){
  const list=STATE.builtin.filter(s=>s.chars?.length);
  const first=list[0]?.id||null,second=list[1]?.id||first;
  STATE.pkSetup={kind,p1:STATE.pkSetup?.p1||first,p2:STATE.pkSetup?.p2||second,pool:STATE.pkSetup?.pool||first};
  setScreen("pksetup","home");
}

function pkSetupView(){
  const eligible=STATE.builtin.filter(s=>s.chars?.length);if(!eligible.length)return `<div class="panel empty">${esc(t("notEnough"))}</div>`;
  const kind=STATE.pkSetup.kind||"random";
  const opts=selected=>eligible.map(s=>`<option value="${esc(s.id)}" ${s.id===selected?"selected":""}>${esc(displaySeries(s))} (${esc(String(applyGenderFilter(s.chars).length))})</option>`).join("");
  const style=`<div class="chips"><button class="chip${kind==="random"?" selected":""}" onclick="openPKSetup('random')">${esc(t("randomPK"))}</button><button class="chip${kind==="budget"?" selected":""}" onclick="openPKSetup('budget')">${esc(t("budgetPK"))}</button></div>`;
  if(kind==="budget"){
    const pool=getSeries(STATE.pkSetup.pool)||eligible[0];STATE.pkSetup.pool=pool.id;const chars=applyGenderFilter(pool.chars),ok=chars.length>=12;
    return `<div class="section-head"><div><h2>${esc(t("budgetPK"))}</h2><p>${esc(t("budgetPKDesc"))}</p></div></div>${style}<div class="panel" style="margin-top:16px"><div class="form-group"><label>${esc(t("sharedRoster"))}</label><select onchange="updatePKSetup('pool',this.value)">${opts(pool.id)}</select><div class="requirement ${ok?"good":"bad"}">${esc(t("sharedPool"))}: ${chars.length} ${esc(t("available"))} / 12 ${esc(t("required"))}</div></div></div><div class="cta-row"><button class="primary" onclick="startBudgetPK()" ${ok?"":"disabled"}>${esc(t("beginPK"))}</button></div>`;
  }
  if(!getSeries(STATE.pkSetup.p1))STATE.pkSetup.p1=eligible[0].id;if(!getSeries(STATE.pkSetup.p2))STATE.pkSetup.p2=eligible[Math.min(1,eligible.length-1)].id;
  const s1=getSeries(STATE.pkSetup.p1),s2=getSeries(STATE.pkSetup.p2),p1=applyGenderFilter(s1.chars),p2=applyGenderFilter(s2.chars),shared=s1.id===s2.id,req=L.pkRequirement(p1,p2,6,6,shared);
  return `<div class="section-head"><div><h2>${esc(t("pkSetup"))}</h2><p>${esc(t("pkDesc"))}</p></div></div>${style}<div class="grid" style="margin-top:16px"><div class="panel"><h3>${esc(t("player1"))}</h3><div class="form-group"><label>${esc(t("series"))}</label><select onchange="updatePKSetup('p1',this.value)">${opts(s1.id)}</select></div></div><div class="panel"><h3>${esc(t("player2"))}</h3><div class="form-group"><label>${esc(t("series"))}</label><select onchange="updatePKSetup('p2',this.value)">${opts(s2.id)}</select></div></div></div><div class="requirement ${req.ok?"good":"bad"}">${esc(shared?`${t("sharedPool")}: ${req.availableShared} / ${req.requiredShared}`:`${t("player1")}: ${req.availableP1}/6 · ${t("player2")}: ${req.availableP2}/6`)}</div><div class="cta-row"><button class="primary" onclick="startPK()" ${req.ok?"":"disabled"}>${esc(t("beginPK"))}</button></div>`;
}
const _afPKV2SetupView=pkSetupView;
pkSetupView=function(){const html=_afPKV2SetupView();const ids=STATE.pkSetup.kind==="budget"?[STATE.pkSetup.pool]:[STATE.pkSetup.p1,STATE.pkSetup.p2];const block=typeof phaseSelectorBlock==="function"?phaseSelectorBlock(ids.filter(Boolean)):"";return block?html+block:html;};

function startPK(){
  const p1=STATE.pkSetup.p1,p2=STATE.pkSetup.p2,s1=getSeries(p1),s2=getSeries(p2);if(!s1||!s2)return;
  const pool1=applyGenderFilter(s1.chars),pool2=applyGenderFilter(s2.chars),shared=p1===p2,req=L.pkRequirement(pool1,pool2,6,6,shared);if(!req.ok)return;
  STATE.pk={kind:"random",p1:{seriesId:p1,roles:roleSet(p1),team:[]},p2:{seriesId:p2,roles:roleSet(p2),team:[]},turn:1,shared,used:new Set(),pair:[],revealing:false,revealTimer:null,selectedIndex:null,skips:{1:1,2:1},ended:false};
  setScreen("pk","pksetup");rollPKPair();
}
function startBudgetPK(){
  const id=STATE.pkSetup.pool,s=getSeries(id),pool=applyGenderFilter(s?.chars||[]);if(!s||pool.length<12)return;
  STATE.pk={kind:"budget",p1:{seriesId:id,roles:roleSet(id),team:[],budget:100},p2:{seriesId:id,roles:roleSet(id),team:[],budget:100},turn:1,shared:true,used:new Set(),selectedIndex:null,ended:false};
  setScreen("pk","pksetup");
}

function pkPool(player){const pk=STATE.pk,p=pk[`p${player}`];return applyGenderFilter(getSeries(p.seriesId)?.chars||[]).filter(c=>!pk.used.has(c.id));}
function rollPKPair(){
  const pk=STATE.pk;if(!pk||pk.kind!=="random")return;const pool=pkPool(pk.turn);if(pk.revealTimer)clearInterval(pk.revealTimer);
  if(pool.length<=1){pk.pair=[...pool];pk.revealing=false;render();return;}pk.revealing=true;pk.selectedIndex=null;let ticks=0;
  pk.revealTimer=setInterval(()=>{if(STATE.screen!=="pk"||STATE.pk!==pk){clearInterval(pk.revealTimer);return;}pk.pair=L.shuffle(pool).slice(0,2);ticks++;render();if(ticks>=10){clearInterval(pk.revealTimer);pk.revealTimer=null;pk.pair=L.shuffle(pool).slice(0,2);pk.revealing=false;render();}},70);
}
function skipPKPair(){const pk=STATE.pk;if(!pk||pk.kind!=="random"||pk.revealing||!pk.skips[pk.turn])return;const skipped=new Set((pk.pair||[]).map(c=>c.id)),fresh=pkPool(pk.turn).filter(c=>!skipped.has(c.id));pk.skips[pk.turn]=0;pk.pair=[];pk.selectedIndex=null;if(fresh.length>=2){pk.revealing=true;let ticks=0;pk.revealTimer=setInterval(()=>{pk.pair=L.shuffle(fresh).slice(0,2);ticks++;render();if(ticks>=10){clearInterval(pk.revealTimer);pk.revealTimer=null;pk.revealing=false;render();}},70);}else{render();rollPKPair();}}

function pkTeam(n){
  const pk=STATE.pk,p=pk[`p${n}`],s=getSeries(p.seriesId),active=pk.turn===n&&!pk.ended&&!pkComplete();
  const money=pk.kind==="budget"?`<span class="pk-money">$${p.budget}</span>`:"";
  return `<section class="pk-team${active?" active":""}"><header><h3>${esc(t(`player${n}`))}</h3><span>${esc(displaySeries(s))}</span>${money}</header><div class="pk-role-grid">${p.roles.map(role=>{const hit=p.team.find(x=>x.role===role),open=active&&!hit;if(!hit)return `<button class="pk-role-slot empty${open?" droppable":""}" data-player="${n}" data-role="${esc(role)}" onclick="assignSelectedPKRole(${n},${jsarg(role)})"><span>${esc(roleLabel(role))}</span><strong>＋</strong></button>`;const c=hit.character,url=characterImageUrl(c),name=displayName(c);return `<div class="pk-role-slot filled" data-player="${n}" data-role="${esc(role)}"><div class="pk-role-avatar">${url?`<img src="${esc(url)}" alt="${esc(name)}" referrerpolicy="no-referrer">`:`<b>${esc(initials(name))}</b>`}</div><span>${esc(roleLabel(role))}</span><strong>${esc(name)}</strong>${pk.kind==="budget"?`<small>$${hit.price}</small>`:""}</div>`;}).join("")}</div></section>`;
}

function pkCandidateCard(c,i,{compact=false,disabled=false}={}){
  const url=characterImageUrl(c),name=displayName(c),selected=STATE.pk?.selectedIndex===i,price=characterPrice(c),budget=STATE.pk?.kind==="budget";
  const dragStart=budget?"":`onpointerdown="beginPKDrag(${i},event)"`;
  const handle=budget?`<span class="pk-drag-handle" aria-label="${esc(t("dragHandle"))}" onpointerdown="beginPKDrag(${i},event)">⠿</span>`:"";
  return `<button class="pk-candidate${compact?" compact":""}${selected?" selected":""}${disabled?" disabled":""}" data-index="${i}" ${disabled?"disabled":""} ${dragStart} onclick="selectPKCandidate(${i})">${handle}${url?`<img src="${esc(url)}" alt="${esc(name)}" referrerpolicy="no-referrer">`:`<div class="pk-candidate-fallback">${esc(initials(name))}</div>`}<div><strong title="${esc(name)}">${esc(name)}</strong>${budget?`<span class="price">$${price}</span>`:""}</div></button>`;
}
function selectPKCandidate(i){const pk=STATE.pk;if(!pk||pk.revealing)return;pk.selectedIndex=pk.selectedIndex===i?null:i;render();}
function selectedPKCharacter(){const pk=STATE.pk;if(!pk||pk.selectedIndex===null)return null;if(pk.kind==="random")return pk.pair[pk.selectedIndex]||null;return budgetPool()[pk.selectedIndex]||null;}
function budgetPool(){return pkPool(STATE.pk?.turn||1);}
function budgetCanBuy(c){const pk=STATE.pk,p=pk[`p${pk.turn}`],remaining=p.roles.length-p.team.length;return L.canAffordBudgetPick(p.budget,characterPrice(c),remaining);}

function assignSelectedPKRole(player,role){const pk=STATE.pk;if(!pk||player!==pk.turn)return;const c=selectedPKCharacter();if(!c)return;if(pk.kind==="budget"&&!budgetCanBuy(c))return toast(t("budgetRule"));assignPKCharacter(role,c);}
function assignPKCharacter(role,c){
  const pk=STATE.pk,p=pk[`p${pk.turn}`];if(!p.roles.includes(role)||p.team.some(x=>x.role===role)||pk.used.has(c.id))return;
  const price=pk.kind==="budget"?characterPrice(c):0;if(pk.kind==="budget"&&!budgetCanBuy(c))return;
  p.team.push({role,character:c,price});if(pk.kind==="budget")p.budget-=price;pk.used.add(c.id);pk.selectedIndex=null;
  const other=pk.turn===1?2:1;if(pk[`p${other}`].team.length<pk[`p${other}`].roles.length)pk.turn=other;
  render();requestAnimationFrame(()=>document.querySelector(`[data-player="${player}"][data-role="${CSS.escape(role)}"]`)?.classList.add("just-filled"));
  if(pk.kind==="random"&&!pkComplete())rollPKPair();
}
function pkComplete(){const pk=STATE.pk;return pk.p1.team.length>=pk.p1.roles.length&&pk.p2.team.length>=pk.p2.roles.length;}

function pkView(){const pk=STATE.pk;if(!pk)return home();if(pkComplete()||pk.ended)return pkResult();return pk.kind==="budget"?budgetPKView():randomPKView();}
function randomPKView(){const pk=STATE.pk,pair=pk.pair||[];return `<div class="pk-arena"><div class="pk-teams">${pkTeam(1)}${pkTeam(2)}</div><div class="pk-turnbar"><div><b>${esc(t(`player${pk.turn}`))}</b><span>${esc(t("dragHint"))}</span></div><button class="ghost pk-skip" onclick="skipPKPair()" ${pk.revealing||!pk.skips[pk.turn]?"disabled":""}>${esc(pk.skips[pk.turn]?t("skipPair"):t("skipUsed"))} ↻</button></div><div class="pk-random-tray${pk.revealing?" revealing":""}">${pair.length?pair.map((c,i)=>pkCandidateCard(c,i,{compact:true,disabled:pk.revealing})).join(`<div class="pk-vs">VS</div>`):`<div class="panel empty">${esc(t("emptyPool"))}</div>`}</div></div>`;}
function budgetPKView(){const pk=STATE.pk,p=pk[`p${pk.turn}`],pool=budgetPool();return `<div class="pk-arena"><div class="pk-teams">${pkTeam(1)}${pkTeam(2)}</div><div class="pk-turnbar"><div><b>${esc(t(`player${pk.turn}`))} · $${p.budget} ${esc(t("remainingBudget"))}</b><span>${esc(t("dragHint"))}</span></div></div><div class="pk-budget-tray">${pool.map((c,i)=>pkCandidateCard(c,i,{compact:true,disabled:!budgetCanBuy(c)})).join("")}</div></div>`;}

let AF_PK_DRAG=null,AF_PK_SUPPRESS_CLICK=0;
const _afSelectPKCandidate=selectPKCandidate;
selectPKCandidate=function(i){if(Date.now()<AF_PK_SUPPRESS_CLICK)return;_afSelectPKCandidate(i);};
function beginPKDrag(i,event){
  const pk=STATE.pk;if(!pk||pk.revealing||event.button>0)return;event.stopPropagation();const source=event.currentTarget.closest(".pk-candidate"),startX=event.clientX,startY=event.clientY;let moved=false,ghost=null;
  function move(e){if(Math.hypot(e.clientX-startX,e.clientY-startY)<7&&!moved)return;moved=true;e.preventDefault();if(!ghost){ghost=source.cloneNode(true);ghost.className="pk-drag-ghost";document.body.appendChild(ghost);}ghost.style.transform=`translate(${e.clientX+12}px,${e.clientY+12}px)`;document.querySelectorAll(".pk-role-slot.drag-over").forEach(x=>x.classList.remove("drag-over"));document.elementFromPoint(e.clientX,e.clientY)?.closest(`.pk-role-slot.droppable[data-player="${pk.turn}"]`)?.classList.add("drag-over");}
  function end(e){window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",end);window.removeEventListener("pointercancel",end);ghost?.remove();document.querySelectorAll(".pk-role-slot.drag-over").forEach(x=>x.classList.remove("drag-over"));AF_PK_SUPPRESS_CLICK=Date.now()+350;pk.selectedIndex=i;if(moved){const slot=document.elementFromPoint(e.clientX,e.clientY)?.closest(`.pk-role-slot.droppable[data-player="${pk.turn}"]`);if(slot){assignSelectedPKRole(pk.turn,slot.dataset.role);return;}}render();}
  window.addEventListener("pointermove",move,{passive:false});window.addEventListener("pointerup",end,{once:true});window.addEventListener("pointercancel",end,{once:true});AF_PK_DRAG={i};
}
function endPKEarly(){if(!STATE.pk)return;STATE.pk.ended=true;render();}

pkResult=function(){return `<div class="result-title"><div class="eyebrow">PK</div><div class="big">${esc(t("teamComplete"))}</div></div><div class="team-board">${pkTeam(1)}${pkTeam(2)}</div><div class="cta-row"><button class="primary" onclick="copyPKJudgePrompt()">${esc(t("pkJudge"))}</button><button class="secondary" onclick="copyPKBattleImagePrompt()">${esc(t("pkBattleImage"))}</button><button class="secondary" onclick="openPKSetup(${jsarg(STATE.pk?.kind||"random")})">${esc(t("playAgain"))}</button></div>`;};

const AF_PK_BATTLEFIELDS={
  onepiece:{en:"Marineford's shattered bay beneath storm clouds, with broken warships, frozen waves and the execution plaza behind the fighters.",zh:"暴风云下破碎的马林梵多海湾，断裂军舰与冻结海浪环绕，处刑台位于战场后方。",ja:"嵐雲に覆われた崩壊後のマリンフォード湾。砕けた軍艦と凍結した海面、その奥に処刑台がそびえる。"},
  naruto:{en:"The Valley of the End, with both colossal statues damaged by chakra shockwaves and the river splitting the battlefield.",zh:"终结之谷，两尊巨大石像被查克拉冲击震裂，河流从战场中央穿过。",ja:"終末の谷。二体の巨像はチャクラの衝撃で損傷し、中央を川が貫いている。"},
  jjk:{en:"Shibuya Crossing at midnight inside layered Cursed Technique curtains, with shattered signs and cursed energy flooding the streets.",zh:"午夜的涩谷十字路口被多层帐覆盖，破碎招牌与咒力充斥街道。",ja:"深夜の渋谷スクランブル交差点。幾重もの帳に覆われ、砕けた看板と呪力が街路を満たす。"},
  bleach:{en:"The Seireitei after an invasion, with damaged white walls, spirit-particle debris and the Sokyoku hill visible beyond.",zh:"遭到入侵后的瀞灵廷，白墙残破、灵子碎屑飘散，远处可见双殛之丘。",ja:"侵攻を受けた瀞霊廷。白壁は崩れ、霊子の瓦礫が舞い、遠方に双殛の丘が見える。"},
  demonslayer:{en:"The shifting Infinity Castle, where impossible rooms, stairways and biwa-controlled platforms form separate combat stages.",zh:"不断变换的无限城，不可能的房间、阶梯与琵琶操控的平台组成多个独立战区。",ja:"絶えず変形する無限城。あり得ない部屋と階段、琵琶で操られる足場が個別の戦場を作る。"},
  chainsawman:{en:"A devastated Tokyo government district after a devil attack, with overturned vehicles, emergency lights and immense devil scars.",zh:"恶魔袭击后的东京政府区，车辆翻覆、警灯闪烁，巨大恶魔留下的痕迹横贯街区。",ja:"悪魔襲撃後の東京官庁街。横転車両と非常灯、巨大な悪魔の爪痕が区画を横切る。"},
  spyfamily:{en:"A grand Ostania embassy complex during a covert crisis, with formal halls opening into a moonlit courtyard.",zh:"秘密危机中的奥斯塔尼亚大使馆，庄严大厅连接着月光下的中庭。",ja:"極秘危機下のオスタニア大使館。格式ある大広間が月明かりの中庭へ続く。"},
  frieren:{en:"Ancient elven ruins at dawn, covered in glowing spell circles, weathered statues and fields of blue flowers.",zh:"黎明中的古代精灵遗迹，发光魔法阵、风化石像与蓝色花田遍布战场。",ja:"夜明けの古代エルフ遺跡。発光する魔法陣、風化した石像、青い花畑が広がる。"},
  aot:{en:"Ruined Shiganshina between the inner wall and the breached gate, with rooftops, ODM anchor points and titan footprints.",zh:"城墙与破损大门之间的希干希纳废墟，屋顶、立体机动锚点与巨人脚印遍布其中。",ja:"内壁と破壊された門の間に広がるシガンシナ区跡。屋根、立体機動の固定点、巨人の足跡が残る。"},
  mha:{en:"Kamino Ward after evacuation, with collapsed hero billboards, rescue corridors and fire-lit city blocks.",zh:"疏散后的神野区，英雄广告牌倒塌，救援通道与燃烧街区交错。",ja:"避難後の神野区。崩れたヒーロー看板、救助通路、炎に照らされた街区が交差する。"},
  hunterxhunter:{en:"Heavens Arena's highest battle floor, expanded into a vast Nen-proof colosseum with shattered tiles and aura barriers.",zh:"天空竞技场最高层被扩展成大型念能力斗技场，地砖破裂，念气屏障包围四周。",ja:"天空闘技場の最上階。念能力対応の巨大闘技場へ拡張され、砕けた床とオーラ障壁が囲む。"},
  fma:{en:"Central Command's plaza during a nationwide transmutation event, with military stonework split by a glowing alchemy circle.",zh:"全国炼成发动时的中央司令部广场，军事建筑被发光炼成阵割裂。",ja:"国土錬成陣発動中の中央司令部広場。軍施設の石床を発光する錬成陣が切り裂く。"},
  blackclover:{en:"The Clover Kingdom capital beneath a torn magic barrier, with castle towers and floating grimoires surrounding the battlefield.",zh:"魔法屏障破裂的四叶草王国王都，城堡高塔与漂浮魔导书环绕战场。",ja:"魔法障壁が裂けたクローバー王国王都。城塔と浮遊する魔導書が戦場を囲む。"},
  onepunchman:{en:"The ruins of City Z beside the Monster Association crater, with abandoned towers and an enormous impact basin.",zh:"怪人协会巨坑旁的Z市废墟，废弃高楼与巨大冲击坑构成战场。",ja:"怪人協会の大穴に面したZ市跡。無人の高層建築と巨大な衝突孔が戦場となる。"},
  dragonball:{en:"A vast Dragon Ball rocky wasteland with mesas, impact craters and distant mountains under a sky distorted by ki.",zh:"辽阔的龙珠式岩石荒原，台地、冲击坑与远山笼罩在被气扭曲的天空下。",ja:"広大な岩山荒野。台地、衝突跡、遠い山々の上空が気によって歪んでいる。"},
  sao:{en:"A high Aincrad floor combining a floating castle courtyard, raid-gate ruins and the abyss visible beyond the edge.",zh:"艾恩葛朗特高层，将浮空城庭院与攻略门遗迹连接，边缘外可见无底深渊。",ja:"アインクラッド上層。浮遊城の中庭と攻略門跡がつながり、縁の先に深淵が見える。"},
  jojo:{en:"Cairo at night near DIO's mansion, with moonlit alleys, stopped clocks and Stand energy warping the streets.",zh:"DIO宅邸附近的开罗夜街，月光巷道、停止的时钟与替身能量扭曲街景。",ja:"DIOの館に近い夜のカイロ。月明かりの路地、止まった時計、スタンドの力で歪む街路。"},
  fairytail:{en:"Magnolia's guild plaza after a magical assault, with Fairy Tail's hall, canal bridges and spell circles overhead.",zh:"魔法袭击后的马格诺利亚公会广场，妖精尾巴会馆、运河桥梁与空中魔法阵同场出现。",ja:"魔法攻撃後のマグノリア・ギルド広場。妖精の尻尾の会館、運河橋、上空の魔法陣が並ぶ。"},
  sololeveling:{en:"A red-gate dungeon mixing an ice cavern and ruined temple, with shadow soldiers emerging from black portals.",zh:"融合冰窟与残破神殿的红门副本，暗影士兵从黑色传送门中现身。",ja:"氷洞と崩壊神殿が混ざるレッドゲート。黒い門から影の兵士が現れる。"},
  mobpsycho:{en:"Seasoning City under a psychic storm, with buildings levitating, roads folding upward and colorful aura rings in the sky.",zh:"超能力风暴下的调味市，建筑悬浮、道路向上折叠，天空布满彩色灵能光环。",ja:"超能力嵐に包まれた調味市。建物が浮遊し、道路が空へ折れ曲がり、色彩豊かなオーラが広がる。"},
  tokyoghoul:{en:"Tokyo's 20th Ward at night, with Anteiku's street, CCG searchlights and kagune marks across rain-soaked rooftops.",zh:"雨夜的东京20区，安定区街道、CCG探照灯与赫子痕迹遍布屋顶。",ja:"雨の東京20区。あんていく周辺、CCGの探照灯、濡れた屋根に残る赫子の痕跡。"},
  dandadan:{en:"A haunted school and torii-lined neighborhood fused by an alien dimension, with yokai mist and UFO light overhead.",zh:"被外星维度融合的灵异学校与鸟居街区，妖怪雾气弥漫，头顶照下UFO光束。",ja:"異星空間に融合した怪異学校と鳥居の街。妖怪の霧が漂い、上空からUFOの光が差す。"},
  kaijuno8:{en:"Tachikawa Base during a kaiju breach, with defense-force barricades, numbered weapons and a colossal kaiju silhouette.",zh:"怪兽突破时的立川基地，防卫队路障、识别怪兽兵器与巨大怪兽剪影同场出现。",ja:"怪獣侵入時の立川基地。防衛隊の障害物、識別怪獣兵器、巨大怪獣の影が並ぶ。"},
  fireforce:{en:"The Tokyo Empire's industrial district during an Adolla flare, with cathedral engines, rail lines and blue-black flames.",zh:"安德拉爆发时的东京皇国工业区，教会式引擎、铁路与蓝黑火焰交织。",ja:"アドラの炎が噴き出す東京皇国工業区。聖堂型機関、鉄路、青黒い炎が交錯する。"}
};

pkBattleScenario=function(){
  const pk=STATE.pk;if(!pk)return AF_PK_BATTLEFIELDS.onepiece;const ids=[pk.p1.seriesId,pk.p2.seriesId].filter(Boolean);
  if(!pk.battlefieldSeriesId||!ids.includes(pk.battlefieldSeriesId))pk.battlefieldSeriesId=ids.length>1&&ids[0]!==ids[1]?ids[Math.floor(Math.random()*2)]:ids[0];
  return AF_PK_BATTLEFIELDS[pk.battlefieldSeriesId]||AF_PK_BATTLEFIELDS.onepiece;
};
function pkDirectMatchupText(){
  const pk=STATE.pk,lines=[];for(let i=0;i<5;i++){const a=pk.p1.team.find(x=>x.role===pk.p1.roles[i]),b=pk.p2.team.find(x=>x.role===pk.p2.roles[i]);if(a&&b)lines.push(`${promptCharacterName(a.character)} vs ${promptCharacterName(b.character)}`);}
  const t1=pk.p1.team.find(x=>x.role===pk.p1.roles[5]),t2=pk.p2.team.find(x=>x.role===pk.p2.roles[5]);
  const heading=STATE.lang==="zh"?"五组对应单挑":STATE.lang==="ja"?"5組の一対一対決":"FIVE DIRECT DUELS";
  const betrayal=STATE.lang==="zh"?`背叛行动：${t1?promptCharacterName(t1.character):"玩家1内鬼"}转身攻击玩家1原队友；${t2?promptCharacterName(t2.character):"玩家2内鬼"}转身攻击玩家2原队友。`:STATE.lang==="ja"?`裏切り：${t1?promptCharacterName(t1.character):"プレイヤー1の裏切り枠"}はプレイヤー1の元仲間を攻撃し、${t2?promptCharacterName(t2.character):"プレイヤー2の裏切り枠"}はプレイヤー2の元仲間を攻撃する。`:`BETRAYALS: ${t1?promptCharacterName(t1.character):"Player 1's traitor"} turns against Player 1's former teammates; ${t2?promptCharacterName(t2.character):"Player 2's traitor"} turns against Player 2's former teammates.`;
  return `${heading}:\n${lines.map((x,i)=>`${i+1}. ${x}`).join("\n")}\n${betrayal}`;
}

const _afPKImagePrompt=buildPKBattleImagePrompt;
buildPKBattleImagePrompt=function(){
  let base=_afPKImagePrompt();const matchups=pkDirectMatchupText();
  if(STATE.lang==="zh")return base.replace("\n\n构图：","\n\n"+matchups+"\n\n战斗编排规则：前五组必须分别进行清晰的一对一交战，每位角色只锁定自己的对应对手，不要形成混乱群殴。两名内鬼不与对方内鬼决斗，而是各自转身攻击自己原本所属的队伍。\n\n构图：").replace("内鬼位必须通过可读但不过度剧透的动作，表现正在准备背叛自己被分配的队伍。","内鬼位已经完成倒戈，明确面向自己原队伍发动攻击。");
  if(STATE.lang==="ja")return base.replace("\n\n構図：","\n\n"+matchups+"\n\n戦闘配置ルール：最初の5組は明確な一対一で戦い、各キャラは指定された相手だけを攻撃する。乱戦にしない。2人の裏切り枠は互いに戦わず、それぞれ自分が所属していたチームへ攻撃を向ける。\n\n構図：").replace("裏切り枠は、ドラフトされた自チームへの裏切りを準備していることが読み取れる、ただし露骨すぎない動きを見せる。","裏切り枠はすでに寝返っており、元の自チームへ明確に攻撃を向ける。");
  return base.replace("\n\nCOMPOSITION:","\n\n"+matchups+"\n\nFIGHT CHOREOGRAPHY: the first five matchups are five separate, readable one-on-one fights. Every loyal fighter attacks only their listed opponent; do not turn them into a chaotic group melee. The two traitors do not fight each other—they turn inward and attack their own former drafted teams.\n\nCOMPOSITION:").replace("Show each betrayal-role character subtly but clearly preparing to turn against their own drafted team.","Show each betrayal-role character actively attacking their own former drafted team.");
};

const _afPKJudgePrompt=buildPKJudgePrompt;
buildPKJudgePrompt=function(){let base=_afPKJudgePrompt(),rules=pkDirectMatchupText();if(STATE.lang==="zh")return base.replace("\n\n回答要短",`\n\n${rules}\n分析时先比较这五组对应单挑，再评估两名内鬼对各自原队伍造成的破坏。\n\n回答要短`);if(STATE.lang==="ja")return base.replace("\n\n短く、",`\n\n${rules}\n判定では5組の一対一を先に比較し、その後に各裏切り枠が元チームへ与える損害を評価する。\n\n短く、`);return base.replace("\n\nKeep the answer short",`\n\n${rules}\nEvaluate the five direct duels first, then the damage each traitor causes to their own former team.\n\nKeep the answer short`);};
