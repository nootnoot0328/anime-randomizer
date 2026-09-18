"use strict";

const VERSION = "0.5.2";
const L = window.AnimeFusionLogic;

const I18N = {
  en:{
    home:"Home",packs:"Packs",history:"History",settings:"Settings",loading:"Loading Anime Fusion…",loadFailed:"Could not load app data.",
    heroTitle:"Build someone impossible.",subtitle:"Build impossible anime characters, one bad decision at a time.",
    standard:"Trait Draft",standardDesc:"Choose between two characters, then decide which trait to inherit.",
    quick:"Quick Randomizer",quickDesc:"One tap. Every trait is revealed by roulette.",pk:"PK Team Draft",pkDesc:"Two players draft non-repeatable characters into team roles.",
    chooseSeries:"Choose Series",chooseSeriesDesc:"Mix as many series or private packs as you like.",chooseMode:"Choose Game",start:"Start Draft",quickStart:"Randomize All",
    partner:"Anime Partner",protagonist:"Protagonist",villain:"Villain",bestfriend:"Best Friend",selectTraits:"Choose Traits",selected:"selected",chooseOne:"Choose one",remaining:"Remaining Traits",
    skip:"Skip",skipsLeft:"skips left",takeFrom:"What do you want from",complete:"Character Complete",copyPrompt:"Copy Image Prompt",playAgain:"Play Again",saveHistory:"Save Result",saved:"Saved",noHistory:"No completed games yet.",
    privatePacks:"Private Character Packs",newPack:"New Pack",importPack:"Import Pack",export:"Export",delete:"Delete",addImages:"Add Images",edit:"Edit",packName:"Pack Name",characters:"characters",characterNames:"Character names (one per line)",applyNames:"Apply Names in Order",addPack:"Create Pack",
    language:"Language",close:"Close",pkSetup:"PK Setup",player1:"Player 1",player2:"Player 2",series:"Series",beginPK:"Begin PK",turn:"Turn",pickCharacter:"Pick a character",assignRole:"Assign a role",teamComplete:"PK Complete",endMatch:"End match",
    noPacks:"No private packs yet.",localOnly:"Stored only in this browser on this device.",importInfo:"Images are stored locally in your browser using IndexedDB.",done:"Done",cancel:"Cancel",imagePrompt:"Image Generator Prompt",traits:"Traits",allSeries:"All selected series",needSeries:"Choose at least one series.",needTrait:"Choose at least one trait.",needCharacters:"This selection needs at least 2 characters.",
    roster:"Roster",rename:"Rename",remove:"Remove",gender:"Gender Filter",all:"All",maleOnly:"Male only",femaleOnly:"Female only",unspecified:"Unspecified",male:"Male",female:"Female",genderExcluded:"{n} characters without gender excluded",
    imageLibrary:"Character Library",saveOffline:"Save portraits for offline",savingOffline:"Saving portraits",savedLocal:"saved locally",usingRemote:"using remote URL",failed:"failed",resetOffline:"Reset offline portraits",browseCharacters:"Browse Characters",noImage:"No image",
    storageNote:"Built-in portraits come from the generated portrait manifest. Offline saving is optional. Private pack images remain on this device.",
    version:"Version",currentVersion:"Current version",latestVersion:"Latest version",checkingVersion:"Checking…",updateAvailable:"Update available",upToDate:"Up to date",unknown:"Unknown",refreshApp:"Refresh app",status:"Status",
    quickReveal:"Quick Reveal",revealing:"Revealing",pool:"Pool",required:"required",available:"available",sharedPool:"Shared pool",notEnough:"Not enough characters remaining.",
    imported:"Imported",invalidPack:"Invalid pack file",imageCacheCleared:"Offline portraits cleared",storageError:"Storage error",deletePackConfirm:"Delete this pack?",filesSkipped:"{n} files skipped (50-file limit).",packCreated:"Pack created",exported:"Exported",copyDone:"Prompt copied",
    backupTitle:"Back up your packs",backupText:"Safari may clear website data. Export your packs regularly so your images are safe.",dismiss:"Dismiss",storageUsage:"Storage usage",persistentStorage:"Persistent storage",requested:"Requested",notSupported:"Not supported",
    importRejected:"Import rejected: invalid pack data.",selectGender:"Gender",offlineReady:"Offline",remoteReady:"Remote",none:"None",resultSaved:"Result already saved",setupRequirement:"{available} available / {required} required",
    settingsAniListNote:"Portrait URLs are resolved at build time with AniList. The app does not call AniList while you play.",
    emptyPool:"No characters are left in the pool.",refreshImages:"Refresh image view"
  },
  zh:{
    home:"主页",packs:"角色包",history:"记录",settings:"设置",loading:"正在载入 Anime Fusion…",loadFailed:"无法载入应用数据。",
    heroTitle:"创造一个不可能存在的角色。",subtitle:"把动漫角色的不同特质拼成一个全新的角色。",
    standard:"特质选择",standardDesc:"每轮二选一，再决定继承这个角色的哪项特质。",quick:"一键随机",quickDesc:"一键开始，用轮盘逐项揭晓特质。",pk:"PK组队",pkDesc:"两位玩家轮流从不重复角色池中选人并分配职位。",
    chooseSeries:"选择动漫系列",chooseSeriesDesc:"可同时混合多个系列或私人角色包。",chooseMode:"选择玩法",start:"开始",quickStart:"一键随机",partner:"动漫伴侣",protagonist:"主角",villain:"反派",bestfriend:"挚友",selectTraits:"选择特质",selected:"已选择",chooseOne:"二选一",remaining:"剩余特质",
    skip:"跳过",skipsLeft:"次跳过机会",takeFrom:"你想从TA身上继承什么",complete:"角色完成",copyPrompt:"复制生图提示词",playAgain:"再来一局",saveHistory:"保存结果",saved:"已保存",noHistory:"还没有完成的游戏。",
    privatePacks:"私人角色包",newPack:"新建角色包",importPack:"导入角色包",export:"导出",delete:"删除",addImages:"添加图片",edit:"编辑",packName:"角色包名称",characters:"个角色",characterNames:"角色名字（每行一个）",applyNames:"按顺序套用名字",addPack:"建立角色包",
    language:"语言",close:"关闭",pkSetup:"PK设置",player1:"玩家1",player2:"玩家2",series:"系列",beginPK:"开始PK",turn:"回合",pickCharacter:"选择角色",assignRole:"分配职位",teamComplete:"PK完成",endMatch:"结束对局",
    noPacks:"还没有私人角色包。",localOnly:"数据只保存在此设备的浏览器中。",importInfo:"图片会使用 IndexedDB 保存在浏览器本地。",done:"完成",cancel:"取消",imagePrompt:"生图提示词",traits:"特质",allSeries:"所有已选系列",needSeries:"请至少选择一个系列。",needTrait:"请至少选择一个特质。",needCharacters:"当前选择至少需要2个角色。",
    roster:"角色列表",rename:"改名",remove:"移除",gender:"性别筛选",all:"全部",maleOnly:"仅男性",femaleOnly:"仅女性",unspecified:"未指定",male:"男性",female:"女性",genderExcluded:"已排除 {n} 个未指定性别的角色",
    imageLibrary:"角色图库",saveOffline:"保存肖像供离线使用",savingOffline:"正在保存肖像",savedLocal:"已保存到本地",usingRemote:"使用远程图片",failed:"失败",resetOffline:"清除离线肖像",browseCharacters:"浏览角色",noImage:"无图片",
    storageNote:"内置角色肖像来自预先生成的肖像清单。离线保存是可选的。私人角色包图片只保留在此设备。",
    version:"版本",currentVersion:"当前版本",latestVersion:"最新版本",checkingVersion:"检查中…",updateAvailable:"有新版本可用",upToDate:"已是最新版本",unknown:"未知",refreshApp:"刷新应用",status:"状态",
    quickReveal:"快速揭晓",revealing:"揭晓中",pool:"角色池",required:"需要",available:"可用",sharedPool:"共享角色池",notEnough:"剩余角色不足。",
    imported:"导入完成",invalidPack:"角色包文件无效",imageCacheCleared:"离线肖像已清除",storageError:"存储错误",deletePackConfirm:"确定删除这个角色包吗？",filesSkipped:"因50张上限跳过了 {n} 个文件。",packCreated:"角色包已建立",exported:"已导出",copyDone:"提示词已复制",
    backupTitle:"备份你的角色包",backupText:"Safari 可能会清除网站数据。请定期导出角色包，避免图片丢失。",dismiss:"关闭提醒",storageUsage:"存储用量",persistentStorage:"持久存储",requested:"已请求",notSupported:"不支持",
    importRejected:"导入被拒绝：角色包数据无效。",selectGender:"性别",offlineReady:"离线",remoteReady:"远程",none:"无",resultSaved:"该结果已经保存",setupRequirement:"可用 {available} / 需要 {required}",
    settingsAniListNote:"角色肖像网址在构建阶段通过 AniList 解析。游戏运行时不会调用 AniList。",emptyPool:"角色池已经没有角色。",refreshImages:"刷新图片显示"
  },
  ja:{
    home:"ホーム",packs:"パック",history:"履歴",settings:"設定",loading:"Anime Fusion を読み込み中…",loadFailed:"アプリデータを読み込めませんでした。",
    heroTitle:"ありえないキャラクターを作ろう。",subtitle:"アニメキャラの特徴を組み合わせて、新しいキャラクターを作ろう。",
    standard:"特性ドラフト",standardDesc:"2人から1人を選び、どの特性を受け継ぐか決めます。",quick:"一括ランダム",quickDesc:"ワンタップで開始し、ルーレットで特性を順番に公開します。",pk:"PKチームドラフト",pkDesc:"2人で交互に重複なしのキャラを選び、役割を割り当てます。",
    chooseSeries:"シリーズを選択",chooseSeriesDesc:"複数シリーズやプライベートパックを混ぜられます。",chooseMode:"ゲームを選択",start:"ドラフト開始",quickStart:"一括ランダム",partner:"アニメパートナー",protagonist:"主人公",villain:"悪役",bestfriend:"親友",selectTraits:"特性を選択",selected:"選択中",chooseOne:"1人を選ぶ",remaining:"残りの特性",
    skip:"スキップ",skipsLeft:"回残り",takeFrom:"このキャラから何を受け継ぐ？",complete:"キャラクター完成",copyPrompt:"画像プロンプトをコピー",playAgain:"もう一度",saveHistory:"結果を保存",saved:"保存済み",noHistory:"まだ完成したゲームはありません。",
    privatePacks:"プライベートキャラパック",newPack:"新規パック",importPack:"パックをインポート",export:"エクスポート",delete:"削除",addImages:"画像追加",edit:"編集",packName:"パック名",characters:"キャラ",characterNames:"キャラ名（1行に1人）",applyNames:"順番に名前を適用",addPack:"パック作成",
    language:"言語",close:"閉じる",pkSetup:"PK設定",player1:"プレイヤー1",player2:"プレイヤー2",series:"シリーズ",beginPK:"PK開始",turn:"ターン",pickCharacter:"キャラを選択",assignRole:"役割を割り当て",teamComplete:"PK完了",endMatch:"対戦終了",
    noPacks:"プライベートパックはまだありません。",localOnly:"このブラウザ、この端末だけに保存されます。",importInfo:"画像は IndexedDB を使ってブラウザ内に保存されます。",done:"完了",cancel:"キャンセル",imagePrompt:"画像生成プロンプト",traits:"特性",allSeries:"選択中の全シリーズ",needSeries:"シリーズを1つ以上選んでください。",needTrait:"特性を1つ以上選んでください。",needCharacters:"2人以上のキャラクターが必要です。",
    roster:"キャラ一覧",rename:"名前変更",remove:"削除",gender:"性別フィルター",all:"すべて",maleOnly:"男性のみ",femaleOnly:"女性のみ",unspecified:"未指定",male:"男性",female:"女性",genderExcluded:"性別未指定の {n} 人を除外しました",
    imageLibrary:"キャラクターライブラリ",saveOffline:"画像をオフライン保存",savingOffline:"画像を保存中",savedLocal:"ローカル保存",usingRemote:"リモート画像を使用",failed:"失敗",resetOffline:"オフライン画像をリセット",browseCharacters:"キャラクターを見る",noImage:"画像なし",
    storageNote:"内蔵ポートレートは生成済みの画像マニフェストから読み込みます。オフライン保存は任意です。プライベートパック画像はこの端末だけに保存されます。",
    version:"バージョン",currentVersion:"現在のバージョン",latestVersion:"最新バージョン",checkingVersion:"確認中…",updateAvailable:"更新があります",upToDate:"最新です",unknown:"不明",refreshApp:"アプリを更新",status:"状態",
    quickReveal:"クイック公開",revealing:"公開中",pool:"プール",required:"必要",available:"利用可能",sharedPool:"共有プール",notEnough:"残りのキャラクターが足りません。",
    imported:"インポート完了",invalidPack:"無効なパックファイル",imageCacheCleared:"オフライン画像を削除しました",storageError:"ストレージエラー",deletePackConfirm:"このパックを削除しますか？",filesSkipped:"50ファイル上限のため {n} 件をスキップしました。",packCreated:"パックを作成しました",exported:"エクスポートしました",copyDone:"プロンプトをコピーしました",
    backupTitle:"パックをバックアップ",backupText:"Safari はサイトデータを削除することがあります。画像を守るため、定期的にパックをエクスポートしてください。",dismiss:"閉じる",storageUsage:"ストレージ使用量",persistentStorage:"永続ストレージ",requested:"要求済み",notSupported:"未対応",
    importRejected:"インポート拒否：パックデータが無効です。",selectGender:"性別",offlineReady:"オフライン",remoteReady:"リモート",none:"なし",resultSaved:"この結果は保存済みです",setupRequirement:"利用可能 {available} / 必要 {required}",
    settingsAniListNote:"キャラクター画像URLはビルド時に AniList から解決します。プレイ中に AniList API は呼び出しません。",emptyPool:"キャラクタープールが空です。",refreshImages:"画像表示を更新"
  }
};

const TRAIT_LABELS={
  Appearance:{zh:"外貌",ja:"外見"},Hair:{zh:"发型",ja:"髪"},Body:{zh:"身材",ja:"体格"},Personality:{zh:"性格",ja:"性格"},Intelligence:{zh:"智力",ja:"知性"},Humour:{zh:"幽默",ja:"ユーモア"},Romance:{zh:"恋爱方式",ja:"恋愛スタイル"},Loyalty:{zh:"忠诚",ja:"忠誠心"},Cooking:{zh:"厨艺",ja:"料理"},Wealth:{zh:"财富",ja:"財力"},Occupation:{zh:"职业",ja:"職業"},Power:{zh:"能力",ja:"能力"},
  Face:{zh:"脸",ja:"顔"},Physique:{zh:"体型",ja:"体格"},Weapon:{zh:"武器",ja:"武器"},"Fighting Style":{zh:"战斗风格",ja:"戦闘スタイル"},Mentor:{zh:"导师",ja:"師匠"},Luck:{zh:"运气",ja:"運"},Outfit:{zh:"服装",ja:"衣装"},"Special Ability":{zh:"特殊能力",ja:"特殊能力"},
  Motive:{zh:"动机",ja:"動機"},Cruelty:{zh:"残酷度",ja:"残酷さ"},Charisma:{zh:"魅力",ja:"カリスマ"},Army:{zh:"军团",ja:"軍勢"},"Final Form":{zh:"最终形态",ja:"最終形態"},Reliability:{zh:"可靠度",ja:"信頼性"},"Fighting Ability":{zh:"战斗力",ja:"戦闘力"},"Social Skills":{zh:"社交能力",ja:"社交力"},"Chaos Level":{zh:"混乱指数",ja:"カオス度"},Hobbies:{zh:"兴趣",ja:"趣味"}
};
const MODES={
  partner:["Appearance","Hair","Body","Personality","Intelligence","Humour","Romance","Loyalty","Cooking","Wealth","Occupation","Power"],
  protagonist:["Face","Hair","Physique","Personality","Intelligence","Power","Weapon","Fighting Style","Mentor","Luck","Outfit","Special Ability"],
  villain:["Appearance","Personality","Motive","Intelligence","Power","Cruelty","Charisma","Weapon","Army","Final Form"],
  bestfriend:["Personality","Humour","Reliability","Intelligence","Fighting Ability","Social Skills","Chaos Level","Hobbies","Loyalty","Luck"]
};
const ROLE_SETS={
  onepiece:["Captain","First Mate","Tanker","Doctor","Navigator","Traitor"],
  naruto:["Hokage","Right Hand","Tanker","Medical Ninja","Intelligence Ninja","Rogue Ninja"],
  jjk:["Grade 1 Leader","Second-in-Command","Frontliner","Reverse Cursed Healer","Strategist","Curse User"],
  bleach:["Captain","Lieutenant","Frontliner","Healer","Tactician","Defector"],
  demonslayer:["Hashira Leader","Second Blade","Tanker","Medic","Scout","Demon Traitor"]
};
const ROLE_LABELS={
  "Captain":{zh:"船长",ja:"船長"},"First Mate":{zh:"副船长",ja:"副船長"},"Tanker":{zh:"坦克",ja:"タンク"},"Doctor":{zh:"船医",ja:"船医"},"Navigator":{zh:"航海士",ja:"航海士"},"Traitor":{zh:"内鬼",ja:"裏切り者"},
  "Hokage":{zh:"火影",ja:"火影"},"Right Hand":{zh:"左右手",ja:"右腕"},"Medical Ninja":{zh:"医疗忍者",ja:"医療忍者"},"Intelligence Ninja":{zh:"情报忍者",ja:"情報忍者"},"Rogue Ninja":{zh:"叛忍",ja:"抜け忍"},
  "Grade 1 Leader":{zh:"一级领队",ja:"一級リーダー"},"Second-in-Command":{zh:"副手",ja:"副隊長"},"Frontliner":{zh:"前排",ja:"前衛"},"Reverse Cursed Healer":{zh:"反转术式治疗",ja:"反転術式ヒーラー"},"Strategist":{zh:"军师",ja:"参謀"},"Curse User":{zh:"诅咒师",ja:"呪詛師"},
  "Lieutenant":{zh:"副队长",ja:"副隊長"},"Healer":{zh:"治疗",ja:"ヒーラー"},"Tactician":{zh:"战术家",ja:"戦術家"},"Defector":{zh:"叛逃者",ja:"離反者"},
  "Hashira Leader":{zh:"柱领队",ja:"柱リーダー"},"Second Blade":{zh:"副剑士",ja:"副剣士"},"Medic":{zh:"医疗",ja:"衛生役"},"Scout":{zh:"侦察",ja:"斥候"},"Demon Traitor":{zh:"鬼方内鬼",ja:"鬼側の裏切り者"},
  "Leader":{zh:"领队",ja:"リーダー"},"Co-Leader":{zh:"副领队",ja:"副リーダー"}
};

const STATE={
  lang:localStorage.getItem("af_lang")||"en",screen:"home",back:null,builtin:[],portraits:{generatedAt:null,series:{},chars:{}},packs:[],history:[],selectedSeries:new Set(),selectedMode:"partner",selectedTraits:new Set(MODES.partner),genderFilter:"all",setupKind:"standard",game:null,pk:null,pkSetup:{p1:null,p2:null},quickReveal:null,quickRunId:0,editPackId:null,librarySeriesId:null,resultSaved:false,versionInfo:{current:VERSION,latest:null,status:"unknown"},storageInfo:null,ready:false
};
const OBJECT_URLS=new Map();
const IMAGE_URL_PENDING=new Set();
let DB_PROMISE=null;

function t(k,vars={}){let s=(I18N[STATE.lang]||I18N.en)[k]||k;for(const [a,b] of Object.entries(vars))s=s.replaceAll(`{${a}}`,String(b));return s;}
function esc(s=""){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}
function jsarg(s){return esc(JSON.stringify(String(s)));}
function langKey(){return STATE.lang==="ja"?"ja":STATE.lang==="zh"?"zh":"en";}
function traitLabel(key){const k=langKey();return k==="en"?key:(TRAIT_LABELS[key]?.[k]||key);}
function roleLabel(key){const k=langKey();return k==="en"?key:(ROLE_LABELS[key]?.[k]||key);}
function displayName(c){if(!c)return"";const k=langKey();return c[`name_${k}`]||c.name||c.name_en||"";}
function secondaryName(c){if(!c)return"";return langKey()==="en"?(c.name_ja||c.name_zh||""):(c.name_en||c.name||"");}
function displaySeries(s){if(!s)return"";const k=langKey();return s[`name_${k}`]||s.name||s.name_en||s.series||"";}
function initials(name){if(typeof name!=="string"||!name.trim())return"?";return name.trim().split(/\s+/).slice(0,2).map(x=>x[0]||"").join("").toUpperCase()||"?";}
function uuid(){return crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`;}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function toast(msg){const el=document.getElementById("toast");if(!el)return;el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),1900);}
function modal(html){document.getElementById("modalRoot").innerHTML=`<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><div class="modal">${html}</div></div>`;}
function closeModal(){document.getElementById("modalRoot").innerHTML="";}
function i18nStatic(){document.querySelectorAll("[data-i18n]").forEach(el=>el.textContent=t(el.dataset.i18n));document.getElementById("homeBtn")?.setAttribute("aria-label",t("home"));document.getElementById("settingsBtn")?.setAttribute("aria-label",t("settings"));}
function roleSet(seriesId){return ROLE_SETS[seriesId]||["Leader","Co-Leader","Tanker","Healer","Strategist","Traitor"];}
function allSeries(){return [...STATE.builtin,...STATE.packs];}
function getSeries(id){return allSeries().find(s=>s.id===id);}
function allCharacters(){return allSeries().flatMap(s=>s.chars||[]);}
function getCharacter(id){return allCharacters().find(c=>c.id===id);}
function applyGenderFilter(chars){if(STATE.genderFilter==="male")return chars.filter(c=>c.gender==="male");if(STATE.genderFilter==="female")return chars.filter(c=>c.gender==="female");return chars;}
function selectedPool(ids=STATE.selectedSeries){return applyGenderFilter([...ids].flatMap(id=>getSeries(id)?.chars||[]));}
function excludedUnknownCount(ids=STATE.selectedSeries){if(STATE.genderFilter==="all")return 0;return [...ids].flatMap(id=>getSeries(id)?.chars||[]).filter(c=>!c.gender).length;}

function cancelAnimations(){
  if(STATE.game?.revealTimer){clearInterval(STATE.game.revealTimer);STATE.game.revealTimer=null;}
  if(STATE.pk?.revealTimer){clearInterval(STATE.pk.revealTimer);STATE.pk.revealTimer=null;}
  STATE.quickRunId++;
}
function setScreen(s,back=null){
  const changed=STATE.screen!==s;
  if(changed)cancelAnimations();
  if(changed&&STATE.screen==="quickreveal"&&s!=="quickreveal")STATE.quickReveal=null;
  STATE.back=back;STATE.screen=s;render();
  if(changed)window.scrollTo({top:0,behavior:"auto"});
}

function openDB(){
  if(DB_PROMISE)return DB_PROMISE;
  DB_PROMISE=new Promise((resolve,reject)=>{
    const req=indexedDB.open("AnimeFusionDB",2);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains("state"))db.createObjectStore("state");
      if(!db.objectStoreNames.contains("images"))db.createObjectStore("images");
      try{localStorage.setItem("af_idb_v2_upgrade","1");}catch{}
    };
    req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
  });
  return DB_PROMISE;
}
async function stateGet(key){const db=await openDB();return new Promise((res,rej)=>{const tx=db.transaction("state","readonly"),q=tx.objectStore("state").get(key);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error);});}
async function statePut(key,val){const db=await openDB();return new Promise((res,rej)=>{const tx=db.transaction("state","readwrite");tx.objectStore("state").put(val,key);tx.oncomplete=res;tx.onerror=()=>rej(tx.error);});}
async function stateDelete(key){const db=await openDB();return new Promise((res,rej)=>{const tx=db.transaction("state","readwrite");tx.objectStore("state").delete(key);tx.oncomplete=res;tx.onerror=()=>rej(tx.error);});}
async function imageGet(key){const db=await openDB();return new Promise((res,rej)=>{const tx=db.transaction("images","readonly"),q=tx.objectStore("images").get(key);q.onsuccess=()=>res(q.result||null);q.onerror=()=>rej(q.error);});}
async function imagePut(key,blob){const db=await openDB();return new Promise((res,rej)=>{const tx=db.transaction("images","readwrite");tx.objectStore("images").put(blob,key);tx.oncomplete=res;tx.onerror=()=>rej(tx.error);});}
async function imageDelete(key){const db=await openDB();return new Promise((res,rej)=>{const tx=db.transaction("images","readwrite");tx.objectStore("images").delete(key);tx.oncomplete=res;tx.onerror=()=>rej(tx.error);});}
async function imageKeys(){const db=await openDB();return new Promise((res,rej)=>{const tx=db.transaction("images","readonly"),q=tx.objectStore("images").getAllKeys();q.onsuccess=()=>res(q.result||[]);q.onerror=()=>rej(q.error);});}
function dataUrlToBlob(dataUrl){const [head,b64]=dataUrl.split(",");const mime=(head.match(/^data:([^;]+)/)||[])[1]||"application/octet-stream";const bin=atob(b64);const u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);return new Blob([u8],{type:mime});}
function blobToDataUrl(blob){return new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.onerror=rej;fr.readAsDataURL(blob);});}
async function migrateStorageV2(){
  if(!localStorage.getItem("af_v050_cleanup_done")){
    localStorage.removeItem("af_image_cache");
    localStorage.setItem("af_v050_cleanup_done","1");
  }
  let packs=(await stateGet("packs"))||[];let changed=false;
  for(const p of packs){for(const c of (p.chars||[])){if(typeof c.image==="string"&&c.image.startsWith("data:image/")&&!c.imageKey){try{const key=`pack:${c.id||uuid()}`;await imagePut(key,dataUrlToBlob(c.image));c.imageKey=key;delete c.image;changed=true;}catch(e){console.warn("Pack image migration kept legacy data URL",e);}}}}
  if(changed){try{await statePut("packs",packs);}catch(e){console.warn("Could not persist v2 pack migration; legacy records remain available for retry.",e);}}
  try{const old=await stateGet("builtinImageData");if(old!==undefined){await stateDelete("builtinImageData");console.info("Discarded v0.4.1 builtinImageData cache; v0.5 uses stable character IDs.");}}catch(e){console.warn("Could not discard old builtin image cache",e);}
  localStorage.removeItem("af_idb_v2_upgrade");return packs;
}
async function requestPersistentStorage(){if(localStorage.getItem("af_persist_requested"))return;localStorage.setItem("af_persist_requested","1");if(navigator.storage?.persist)try{await navigator.storage.persist();}catch{}}
async function refreshStorageEstimate(){if(!navigator.storage?.estimate){STATE.storageInfo=null;return;}try{STATE.storageInfo=await navigator.storage.estimate();}catch{STATE.storageInfo=null;}}

function revokeImageUrl(key){const url=OBJECT_URLS.get(key);if(url){URL.revokeObjectURL(url);OBJECT_URLS.delete(key);}}
async function ensureObjectUrl(key){if(!key||OBJECT_URLS.has(key)||IMAGE_URL_PENDING.has(key))return;IMAGE_URL_PENDING.add(key);try{const b=await imageGet(key);if(b){OBJECT_URLS.set(key,URL.createObjectURL(b));render();}}catch(e){console.warn(e);}finally{IMAGE_URL_PENDING.delete(key);}}
function characterImageUrl(c){
  if(!c)return null;
  const key=c.imageKey||(c.seriesId&&STATE.portraits.chars?.[c.id]?.url?`builtin:${c.id}`:null);
  if(key&&OBJECT_URLS.has(key))return OBJECT_URLS.get(key);
  if(key)ensureObjectUrl(key);
  if(c.image&&typeof c.image==="string")return c.image; // legacy-only until migration succeeds
  return STATE.portraits.chars?.[c.id]?.url||null;
}
async function deleteImageKey(key){if(!key)return;revokeImageUrl(key);await imageDelete(key);}
async function resetBuiltinPortraits(){const keys=(await imageKeys()).filter(k=>String(k).startsWith("builtin:"));for(const k of keys){await deleteImageKey(k);}toast(t("imageCacheCleared"));render();}

async function decodeAndDownscale(source){
  let bmp=null,width=0,height=0;
  try{bmp=await createImageBitmap(source);width=bmp.width;height=bmp.height;}catch{
    const url=URL.createObjectURL(source);try{const img=await new Promise((res,rej)=>{const x=new Image();x.onload=()=>res(x);x.onerror=rej;x.src=url;});width=img.naturalWidth;height=img.naturalHeight;bmp=img;}finally{URL.revokeObjectURL(url);}
  }
  const maxEdge=512,scale=Math.min(1,maxEdge/Math.max(width,height));let w=Math.max(1,Math.round(width*scale)),h=Math.max(1,Math.round(height*scale));
  const canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;canvas.getContext("2d",{alpha:false}).drawImage(bmp,0,0,w,h);if(bmp.close)bmp.close();
  async function enc(type,q){return new Promise(r=>canvas.toBlob(r,type,q));}
  let blob=await enc("image/webp",.85);if(!blob||blob.type!=="image/webp")blob=await enc("image/jpeg",.85);
  let q=.78;
  while(blob&&blob.size>150000&&q>=.42){blob=await enc(blob.type==="image/webp"?"image/webp":"image/jpeg",q);q-=.09;}
  while(blob&&blob.size>150000&&Math.max(canvas.width,canvas.height)>320){const old=document.createElement("canvas");old.width=canvas.width;old.height=canvas.height;old.getContext("2d").drawImage(canvas,0,0);canvas.width=Math.max(1,Math.round(canvas.width*.82));canvas.height=Math.max(1,Math.round(canvas.height*.82));canvas.getContext("2d").drawImage(old,0,0,canvas.width,canvas.height);blob=await enc(blob.type==="image/webp"?"image/webp":"image/jpeg",.68);}
  q=.6;while(blob&&blob.size>150000&&q>=.18){blob=await enc(blob.type==="image/webp"?"image/webp":"image/jpeg",q);q-=.08;}
  while(blob&&blob.size>150000&&Math.max(canvas.width,canvas.height)>128){const old=document.createElement("canvas");old.width=canvas.width;old.height=canvas.height;old.getContext("2d").drawImage(canvas,0,0);canvas.width=Math.max(1,Math.round(canvas.width*.78));canvas.height=Math.max(1,Math.round(canvas.height*.78));canvas.getContext("2d").drawImage(old,0,0,canvas.width,canvas.height);blob=await enc(blob.type==="image/webp"?"image/webp":"image/jpeg",.45);}
  if(!blob)throw new Error("encode failed");return blob;
}

async function loadBootData(){
  document.getElementById("screen").innerHTML=`<div class="loading-state"><div><div class="loading-spinner"></div><p>${esc(t("loading"))}</p></div></div>`;
  try{
    const [rr,pr]=await Promise.all([fetch("data/roster.json?v=0.5.1",{cache:"no-store"}),fetch("data/portraits.json?v=0.5.1",{cache:"no-store"})]);
    if(!rr.ok||!pr.ok)throw new Error("data fetch failed");const roster=await rr.json();STATE.portraits=await pr.json();
    STATE.builtin=roster.map(s=>({...s,name:s.name_en,chars:(s.chars||[]).map(c=>({...c,name:c.name_en,series:s.name_en,series_en:s.name_en,series_ja:s.name_ja,series_zh:s.name_zh,seriesId:s.id}))}));
    await openDB();STATE.packs=await migrateStorageV2();
    STATE.packs=STATE.packs.map(normalizePackForRuntime);STATE.history=JSON.parse(localStorage.getItem("af_history")||"[]");
    const first=STATE.builtin[0]?.id||null;STATE.pkSetup={p1:first,p2:STATE.builtin[1]?.id||first};
    await refreshStorageEstimate();STATE.ready=true;await checkVersion();render();
  }catch(e){console.error(e);document.getElementById("screen").innerHTML=`<div class="panel empty">${esc(t("loadFailed"))}</div>`;}
}
function normalizePackForRuntime(p){return {...p,name_en:p.name,chars:(p.chars||[]).map(c=>({...c,name_en:c.name,series:p.name,series_en:p.name,seriesId:p.id}))};}
async function persistPacks(){try{await statePut("packs",STATE.packs.map(p=>({...p,chars:p.chars.map(c=>{const x={...c};delete x.series;delete x.series_en;delete x.seriesId;delete x.name_en;return x;})})));}catch(e){console.error(e);toast(t("storageError"));}}

function imageTag(c,cls="character-image"){
  const url=characterImageUrl(c),name=displayName(c);return url?`<img class="${esc(cls)}" src="${esc(url)}" alt="${esc(name)}" referrerpolicy="no-referrer">`:`<div class="character-fallback"><span>${esc(initials(name))}</span><span class="no-image">${esc(t("noImage"))}</span></div>`;
}
function charCard(c,side,disabled=false){const sub=secondaryName(c);return `<button class="character-card${disabled?" disabled":""}" ${disabled?"disabled":""} onclick="${disabled?"void(0)":`chooseCharacter(${jsarg(side)})`}">${imageTag(c)}<div class="character-meta"><strong>${esc(displayName(c))}</strong><span>${esc(displaySeries(c))}${sub?` · ${esc(sub)}`:""}</span></div></button>`;}
function pkCharCard(c,i,disabled=false){const url=characterImageUrl(c),name=displayName(c),sub=secondaryName(c);return `<button class="character-card${disabled?" disabled":""}" ${disabled?"disabled":""} onclick="${disabled?"void(0)":`pickPK(${Number(i)})`}">${url?`<img class="character-image" src="${esc(url)}" alt="${esc(name)}" referrerpolicy="no-referrer">`:`<div class="character-fallback"><span>${esc(initials(name))}</span><span class="no-image">${esc(t("noImage"))}</span></div>`}<div class="character-meta"><strong>${esc(name)}</strong><span>${esc(displaySeries(c))}${sub?` · ${esc(sub)}`:""}</span></div></button>`;}

function home(){return `<section class="hero"><div class="eyebrow">ANIME FUSION</div><h1>${esc(t("heroTitle"))}</h1><p>${esc(t("subtitle"))}</p></section><div class="grid three">
<button class="mode-card" style="--glow:#a78bfa" onclick="openSetup('standard')"><div class="mode-icon">◈</div><strong>${esc(t("standard"))}</strong><small>${esc(t("standardDesc"))}</small></button>
<button class="mode-card" style="--glow:#60a5fa" onclick="openSetup('quick')"><div class="mode-icon">⚡</div><strong>${esc(t("quick"))}</strong><small>${esc(t("quickDesc"))}</small></button>
<button class="mode-card" style="--glow:#fb7185" onclick="openPKSetup()"><div class="mode-icon">⚔</div><strong>${esc(t("pk"))}</strong><small>${esc(t("pkDesc"))}</small></button></div>
<div class="section-head"><div><h2>${esc(t("imageLibrary"))}</h2><p>${esc(t("storageNote"))}</p></div><button class="secondary" onclick="setScreen('library','home')">${esc(t("browseCharacters"))} →</button></div>
<div class="section-head"><div><h2>${esc(t("privatePacks"))}</h2><p>${esc(t("localOnly"))}</p></div><button class="secondary" onclick="setScreen('packs','home')">${esc(t("packs"))} →</button></div>${packPreview()}`;}
function packPreview(){return STATE.packs.length?`<div class="grid">${STATE.packs.slice(0,4).map(packCard).join("")}</div>`:`<div class="panel empty">${esc(t("noPacks"))}</div>`;}

function openSetup(kind){STATE.setupKind=kind;STATE.selectedTraits=new Set(MODES[STATE.selectedMode]);setScreen("setup","home");}
function toggleSeries(id){STATE.selectedSeries.has(id)?STATE.selectedSeries.delete(id):STATE.selectedSeries.add(id);render();}
function selectMode(m){STATE.selectedMode=m;STATE.selectedTraits=new Set(MODES[m]);render();}
function toggleTrait(tr){STATE.selectedTraits.has(tr)?STATE.selectedTraits.delete(tr):STATE.selectedTraits.add(tr);render();}
function setGenderFilter(g){STATE.genderFilter=g;render();}
function setup(){
  const series=allSeries(),excluded=excludedUnknownCount();
  return `<div class="section-head"><div><h2>${esc(t("chooseSeries"))}</h2><p>${esc(t("chooseSeriesDesc"))}</p></div></div><div class="series-list">${series.map(s=>`<button class="series-card${STATE.selectedSeries.has(s.id)?" selected":""}" onclick="toggleSeries(${jsarg(s.id)})"><div class="check">${STATE.selectedSeries.has(s.id)?"✓":""}</div><strong>${esc(displaySeries(s))}</strong><div class="count">${esc(String(applyGenderFilter(s.chars).length))} ${esc(t("characters"))}</div></button>`).join("")}</div>
<div class="section-head"><div><h2>${esc(t("gender"))}</h2><p>${esc(t("pool"))}: ${esc(String(selectedPool().length))}</p>${excluded?`<p class="small">${esc(t("genderExcluded",{n:excluded}))}</p>`:""}</div></div><div class="chips">${[["all","all"],["male","maleOnly"],["female","femaleOnly"]].map(([v,k])=>`<button class="chip${STATE.genderFilter===v?" selected":""}" onclick="setGenderFilter(${jsarg(v)})">${esc(t(k))}</button>`).join("")}</div>
<div class="section-head"><div><h2>${esc(t("chooseMode"))}</h2></div></div><div class="chips">${Object.keys(MODES).map(m=>`<button class="chip${STATE.selectedMode===m?" selected":""}" onclick="selectMode(${jsarg(m)})">${esc(t(m))}</button>`).join("")}</div>
<div class="section-head"><div><h2>${esc(t("selectTraits"))}</h2><p>${esc(String(STATE.selectedTraits.size))} ${esc(t("selected"))}</p></div></div><div class="chips">${MODES[STATE.selectedMode].map(tr=>`<button class="chip${STATE.selectedTraits.has(tr)?" selected":""}" onclick="toggleTrait(${jsarg(tr)})">${esc(traitLabel(tr))}</button>`).join("")}</div><div class="cta-row"><button class="primary" onclick="${STATE.setupKind==="quick"?"startQuick()":"startDraft()"}">${esc(STATE.setupKind==="quick"?t("quickStart"):t("start"))}</button></div>`;
}

function startDraft(){const pool=selectedPool();if(!STATE.selectedSeries.size)return toast(t("needSeries"));if(!STATE.selectedTraits.size)return toast(t("needTrait"));if(pool.length<2)return toast(t("needCharacters"));STATE.game={kind:"standard",pool,remaining:[...STATE.selectedTraits],assignments:[],skips:3,left:null,right:null,tempLeft:null,tempRight:null,revealing:false,selected:null,revealTimer:null};STATE.resultSaved=false;setScreen("draft","setup");rollDraftPair();}
function drawPair(){const g=STATE.game;g.left=pick(g.pool);do{g.right=pick(g.pool);}while(g.pool.length>1&&g.right.id===g.left.id);}
function rollDraftPair(){const g=STATE.game;if(!g)return;g.revealing=true;let ticks=0;if(g.revealTimer)clearInterval(g.revealTimer);g.revealTimer=setInterval(()=>{if(STATE.screen!=="draft"||STATE.game!==g){clearInterval(g.revealTimer);return;}g.tempLeft=pick(g.pool);do{g.tempRight=pick(g.pool);}while(g.pool.length>1&&g.tempRight.id===g.tempLeft.id);ticks++;render();if(ticks>=12){clearInterval(g.revealTimer);g.revealTimer=null;drawPair();g.tempLeft=g.left;g.tempRight=g.right;g.revealing=false;render();}},85);}
function draft(){const g=STATE.game;if(!g)return home();const completed=g.assignments.length,total=completed+g.remaining.length;if(!g.remaining.length)return result();const left=g.revealing?(g.tempLeft||g.left):g.left,right=g.revealing?(g.tempRight||g.right):g.right;return `<div class="progress-wrap"><div class="progress-top"><span>${esc(`${completed} / ${total}`)}</span><span>${esc(`${g.skips} ${t("skipsLeft")}`)}</span></div><div class="progress"><div style="width:${esc(String(total?completed/total*100:0))}%"></div></div></div><div class="section-head"><div><div class="eyebrow">${esc(t(STATE.selectedMode))}</div><h2>${esc(g.revealing?t("revealing"):t("chooseOne"))}</h2></div><button class="ghost" onclick="skipRound()" ${g.revealing?"disabled":""}>${esc(t("skip"))} ↻</button></div><div class="duel">${left?charCard(left,"left",g.revealing):""}<div class="vs">${g.revealing?"⋯":"VS"}</div>${right?charCard(right,"right",g.revealing):""}</div><div class="section-head"><div><h3>${esc(t("remaining"))}</h3></div></div><div class="chips">${g.remaining.map(x=>`<span class="chip">${esc(traitLabel(x))}</span>`).join("")}</div>`;}
function chooseCharacter(side){if(!STATE.game||STATE.game.revealing)return;STATE.game.selected=STATE.game[side];openTraitModal();}
function skipRound(){if(!STATE.game||STATE.game.skips<=0||STATE.game.revealing)return;STATE.game.skips--;rollDraftPair();}
function openTraitModal(){const c=STATE.game?.selected;if(!c)return;modal(`<div class="modal-head"><div><div class="eyebrow">${esc(displaySeries(c))}</div><h2>${esc(`${t("takeFrom")} ${displayName(c)}?`)}</h2></div><button class="icon-btn" onclick="closeModal()">×</button></div><div class="trait-grid">${STATE.game.remaining.map(tr=>`<button class="trait-btn" onclick="assignTrait(${jsarg(tr)})">${esc(traitLabel(tr))}</button>`).join("")}</div>`);}
function assignTrait(tr){const g=STATE.game;if(!g)return;g.assignments.push({trait:tr,character:g.selected});g.remaining=g.remaining.filter(x=>x!==tr);g.selected=null;closeModal();render();if(g.remaining.length)rollDraftPair();}

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function startQuick(){const pool=selectedPool();if(!STATE.selectedSeries.size)return toast(t("needSeries"));if(!STATE.selectedTraits.size)return toast(t("needTrait"));if(!pool.length)return toast(t("needCharacters"));cancelAnimations();setScreen("quickreveal","setup");const runId=++STATE.quickRunId;STATE.quickReveal={pool,traits:[...STATE.selectedTraits],index:0,current:null,currentDisplay:null,assignments:[]};STATE.resultSaved=false;render();runQuickReveal(runId);}
async function runQuickReveal(runId){for(let i=0;i<STATE.quickReveal.traits.length;i++){if(runId!==STATE.quickRunId)return;STATE.quickReveal.index=i;STATE.quickReveal.current=STATE.quickReveal.traits[i];for(let ticks=0;ticks<10;ticks++){await sleep(80);if(runId!==STATE.quickRunId||!STATE.quickReveal)return;STATE.quickReveal.currentDisplay=pick(STATE.quickReveal.pool);render();}await sleep(120);if(runId!==STATE.quickRunId||!STATE.quickReveal)return;const finalChar=pick(STATE.quickReveal.pool);STATE.quickReveal.currentDisplay=finalChar;STATE.quickReveal.assignments.push({trait:STATE.quickReveal.current,character:finalChar});render();await sleep(300);if(runId!==STATE.quickRunId)return;}if(runId!==STATE.quickRunId||!STATE.quickReveal)return;const assignments=STATE.quickReveal.assignments;const pool=STATE.quickReveal.pool;STATE.game={kind:"quick",pool,remaining:[],assignments,skips:0};STATE.quickReveal=null;setScreen("result","setup");}
function quickRevealView(){const q=STATE.quickReveal;if(!q)return home();return `<div class="result-card"><div class="result-title"><div class="eyebrow">${esc(t("quickReveal"))}</div><div class="big">${esc(t("revealing"))}</div></div><div class="quick-burst">⚡</div><div class="assignment-list">${q.traits.map((tr,idx)=>{const done=q.assignments.find(a=>a.trait===tr),active=idx===q.index;return `<div class="assignment${active?" active-reveal":""}"><span class="key">${esc(traitLabel(tr))}</span><span class="val">${esc(done?displayName(done.character):(active&&q.currentDisplay?displayName(q.currentDisplay):"…"))}</span></div>`;}).join("")}</div></div>`;}

function resultSignature(assigns){return assigns.map(a=>`${a.trait}:${a.character.id}`).join("|");}
function isResultSaved(){const sig=resultSignature(STATE.game?.assignments||[]);return STATE.history.some(h=>h.signature===sig);}
function result(){const g=STATE.game;if(!g)return home();const saved=STATE.resultSaved||isResultSaved();return `<div class="result-card"><div class="result-title"><div class="eyebrow">${esc(t(STATE.selectedMode))}</div><div class="big">${esc(t("complete"))}</div></div>${g.kind==="quick"?`<div class="quick-burst">⚡</div>`:""}<div class="assignment-list">${g.assignments.map(a=>`<div class="assignment"><span class="key">${esc(traitLabel(a.trait))}</span><span class="val">${esc(displayName(a.character))}</span></div>`).join("")}</div><div class="cta-row"><button class="primary" onclick="copyPrompt()">${esc(t("copyPrompt"))}</button>${saved?`<div class="saved-pill">✓ ${esc(t("saved"))}</div>`:`<button class="secondary" onclick="saveResult()">${esc(t("saveHistory"))}</button>`}<button class="ghost" onclick="setScreen('home')">${esc(t("playAgain"))}</button></div></div>`;}
function buildPrompt(){const lines=STATE.game.assignments.map(a=>`${a.trait}: ${a.character.name_en||a.character.name} (${a.character.series_en||a.character.series||"Custom Pack"})`).join("\n");return `Create a polished anime character showcase based on the following mixed character traits.\n\nIMPORTANT:\n- Create one coherent original character.\n- Blend all selected traits naturally into one believable anime character.\n- Do not make the result look like a collage.\n- Preserve the strongest visual and behavioral qualities of the chosen inspirations.\n- The final character should feel like a new anime protagonist or supporting character.\n\nCHARACTER TRAITS\n${lines}\n\nCOMPOSITION:\nCreate a wide 3:2 landscape showcase.\n\nLEFT SIDE — CHARACTER SHEET\n- full-body neutral standing pose\n- clear hairstyle, face, body, clothing, accessories and weapon\n- optional smaller headshot\n- clean character-design presentation\n\nRIGHT SIDE — CHARACTER IN ACTION\nInvent a natural everyday or cinematic scene that visibly demonstrates several non-visual traits at once, such as personality, humour, romance, intelligence, occupation, cooking ability or power.\n\nVISUAL CONSISTENCY:\nThe character on both sides must clearly be the same person with the same face, hair, eyes, clothing, proportions and accessories.\n\nSTYLE:\nmodern premium anime illustration, polished key visual, expressive acting, cinematic lighting, natural anatomy, sophisticated color palette.\n\nDo not include logos, franchise titles, watermarks or UI text inside the artwork.`;}
async function copyPrompt(){const p=buildPrompt();try{await navigator.clipboard.writeText(p);toast(t("copyDone"));}catch{modal(`<div class="modal-head"><h2>${esc(t("imagePrompt"))}</h2><button class="icon-btn" onclick="closeModal()">×</button></div><textarea>${esc(p)}</textarea>`);}}
function saveResult(){if(!STATE.game)return;const sig=resultSignature(STATE.game.assignments);if(STATE.history.some(h=>h.signature===sig)){STATE.resultSaved=true;toast(t("resultSaved"));render();return;}STATE.history.unshift({id:uuid(),date:new Date().toISOString(),mode:STATE.selectedMode,signature:sig,assignments:STATE.game.assignments.map(a=>({trait:a.trait,charId:a.character.id,name:a.character.name_en||a.character.name,seriesId:a.character.seriesId||null,series:a.character.series_en||a.character.series||""}))});STATE.history=STATE.history.slice(0,50);localStorage.setItem("af_history",JSON.stringify(STATE.history));STATE.resultSaved=true;toast(t("saved"));render();}
function historyView(){if(!STATE.history.length)return `<div class="section-head"><h2>${esc(t("history"))}</h2></div><div class="panel empty">${esc(t("noHistory"))}</div>`;return `<div class="section-head"><h2>${esc(t("history"))}</h2></div><div class="grid">${STATE.history.map(h=>`<div class="result-card"><div class="row between"><strong>${esc(t(h.mode))}</strong><span class="small">${esc(new Date(h.date).toLocaleString())}</span></div><div class="assignment-list" style="margin-top:10px">${h.assignments.map(a=>{const c=a.charId?getCharacter(a.charId):null;return `<div class="assignment"><span class="key">${esc(traitLabel(a.trait))}</span><span class="val">${esc(c?displayName(c):a.name)}</span></div>`;}).join("")}</div></div>`).join("")}</div>`;}

function updatePKSetup(which,value){STATE.pkSetup[which]=value;render();}
function openPKSetup(){if(!STATE.pkSetup.p1){const first=allSeries()[0]?.id||null;STATE.pkSetup={p1:first,p2:allSeries()[1]?.id||first};}setScreen("pksetup","home");}
function pkSetupView(){const eligible=allSeries().filter(s=>s.chars?.length);if(!eligible.length)return `<div class="panel empty">${esc(t("notEnough"))}</div>`;if(!getSeries(STATE.pkSetup.p1))STATE.pkSetup.p1=eligible[0].id;if(!getSeries(STATE.pkSetup.p2))STATE.pkSetup.p2=eligible[Math.min(1,eligible.length-1)].id;const s1=getSeries(STATE.pkSetup.p1),s2=getSeries(STATE.pkSetup.p2),p1=applyGenderFilter(s1.chars),p2=applyGenderFilter(s2.chars),r1=roleSet(s1.id),r2=roleSet(s2.id),shared=s1.id===s2.id,req=L.pkRequirement(p1,p2,r1.length,r2.length,shared);const opts=(selected)=>eligible.map(s=>`<option value="${esc(s.id)}" ${s.id===selected?"selected":""}>${esc(displaySeries(s))} (${esc(String(applyGenderFilter(s.chars).length))})</option>`).join("");const reqText=shared?`${t("sharedPool")}: ${req.availableShared} ${t("available")} / ${req.requiredShared} ${t("required")}`:null;return `<div class="section-head"><div><h2>${esc(t("pkSetup"))}</h2><p>${esc(t("pkDesc"))}</p></div></div><div class="section-head"><div><h3>${esc(t("gender"))}</h3></div></div><div class="chips">${[["all","all"],["male","maleOnly"],["female","femaleOnly"]].map(([v,k])=>`<button class="chip${STATE.genderFilter===v?" selected":""}" onclick="setGenderFilter(${jsarg(v)})">${esc(t(k))}</button>`).join("")}</div><div class="grid" style="margin-top:16px"><div class="panel"><h3>${esc(t("player1"))}</h3><div class="form-group"><label>${esc(t("series"))}</label><select onchange="updatePKSetup('p1',this.value)">${opts(STATE.pkSetup.p1)}</select><div class="requirement ${req.ok?"good":"bad"}">${esc(shared?reqText:t("setupRequirement",{available:req.availableP1,required:req.requiredP1}))}</div></div></div><div class="panel"><h3>${esc(t("player2"))}</h3><div class="form-group"><label>${esc(t("series"))}</label><select onchange="updatePKSetup('p2',this.value)">${opts(STATE.pkSetup.p2)}</select><div class="requirement ${req.ok?"good":"bad"}">${esc(shared?reqText:t("setupRequirement",{available:req.availableP2,required:req.requiredP2}))}</div></div></div></div><div class="cta-row"><button class="primary" onclick="startPK()" ${req.ok?"":"disabled"}>${esc(t("beginPK"))}</button></div>`;}
function startPK(){const p1=STATE.pkSetup.p1,p2=STATE.pkSetup.p2,s1=getSeries(p1),s2=getSeries(p2);if(!s1||!s2)return;const pool1=applyGenderFilter(s1.chars),pool2=applyGenderFilter(s2.chars),roles1=roleSet(p1),roles2=roleSet(p2),shared=p1===p2,req=L.pkRequirement(pool1,pool2,roles1.length,roles2.length,shared);if(!req.ok)return;STATE.pk={p1:{seriesId:p1,roles:roles1,team:[]},p2:{seriesId:p2,roles:roles2,team:[]},turn:1,shared,used:new Set(),pair:[],revealing:false,revealTimer:null,selected:null,ended:false};setScreen("pk","pksetup");rollPKPair();}
function pkPool(player){const pk=STATE.pk,ids=pk.shared?[pk.p1.seriesId]:[player===1?pk.p1.seriesId:pk.p2.seriesId];return applyGenderFilter(ids.flatMap(id=>getSeries(id)?.chars||[])).filter(c=>!pk.used.has(c.id));}
function rollPKPair(){const pk=STATE.pk;if(!pk)return;const pool=pkPool(pk.turn);if(pk.revealTimer)clearInterval(pk.revealTimer);if(pool.length<=1){pk.pair=[...pool];pk.revealing=false;render();return;}pk.revealing=true;let ticks=0;pk.revealTimer=setInterval(()=>{if(STATE.screen!=="pk"||STATE.pk!==pk){clearInterval(pk.revealTimer);return;}pk.pair=L.shuffle(pool).slice(0,2);ticks++;render();if(ticks>=12){clearInterval(pk.revealTimer);pk.revealTimer=null;pk.pair=L.shuffle(pool).slice(0,2);pk.revealing=false;render();}},85);}
function pkTeam(n){
  const p=STATE.pk[`p${n}`],s=getSeries(p.seriesId);
  return `<div class="team${STATE.pk.turn===n&&!STATE.pk.ended?" active":""}"><div class="row between"><h3>${esc(t(`player${n}`))}</h3><span class="badge">${esc(displaySeries(s))}</span></div>${p.roles.map(role=>{
    const hit=p.team.find(x=>x.role===role);
    if(!hit)return `<div class="role-line role-line-empty"><div class="role-thumb role-thumb-empty">—</div><div class="role-copy"><span>${esc(roleLabel(role))}</span><strong>—</strong></div></div>`;
    const c=hit.character,url=characterImageUrl(c),name=displayName(c);
    const thumb=url?`<img class="role-thumb" src="${esc(url)}" alt="${esc(name)}" referrerpolicy="no-referrer">`:`<div class="role-thumb role-thumb-fallback">${esc(initials(name))}</div>`;
    return `<div class="role-line">${thumb}<div class="role-copy"><span>${esc(roleLabel(role))}</span><strong>${esc(name)}</strong></div></div>`;
  }).join("")}</div>`;
}
function pkView(){const pk=STATE.pk;if(!pk)return home();const allDone=pk.p1.team.length>=pk.p1.roles.length&&pk.p2.team.length>=pk.p2.roles.length;if(allDone||pk.ended)return pkResult();const pair=pk.pair||[],empty=pair.length===0;return `<div class="team-board">${pkTeam(1)}${pkTeam(2)}</div><div class="section-head"><div><div class="eyebrow">${esc(`${t(`player${pk.turn}`)} · ${t("turn")}`)}</div><h2>${esc(pk.revealing?t("revealing"):t("pickCharacter"))}</h2></div></div>${pair.length===2?`<div class="duel">${pkCharCard(pair[0],0,pk.revealing)}<div class="vs">${pk.revealing?"⋯":"VS"}</div>${pkCharCard(pair[1],1,pk.revealing)}</div>`:pair.length===1?`<div class="single-duel">${pkCharCard(pair[0],0,false)}</div>`:`<div class="panel empty"><p>${esc(t("emptyPool"))}</p><button class="danger" onclick="endPKEarly()">${esc(t("endMatch"))}</button></div>`}`;}
function pickPK(i){const pk=STATE.pk;if(!pk||pk.revealing||!pk.pair[i])return;pk.selected=pk.pair[i];const p=pk[`p${pk.turn}`],open=p.roles.filter(r=>!p.team.some(x=>x.role===r));modal(`<div class="modal-head"><div><div class="eyebrow">${esc(displayName(pk.selected))}</div><h2>${esc(t("assignRole"))}</h2></div><button class="icon-btn" onclick="closeModal()">×</button></div><div class="trait-grid">${open.map(r=>`<button class="trait-btn" onclick="assignPKRole(${jsarg(r)})">${esc(roleLabel(r))}</button>`).join("")}</div>`);}
function assignPKRole(role){const pk=STATE.pk,c=pk.selected,p=pk[`p${pk.turn}`];p.team.push({role,character:c});pk.used.add(c.id);closeModal();const other=pk.turn===1?2:1,op=pk[`p${other}`];if(op.team.length<op.roles.length)pk.turn=other;render();rollPKPair();}
function endPKEarly(){if(!STATE.pk)return;STATE.pk.ended=true;render();}
function pkResult(){return `<div class="result-title"><div class="eyebrow">PK</div><div class="big">${esc(t("teamComplete"))}</div></div><div class="team-board">${pkTeam(1)}${pkTeam(2)}</div><div class="cta-row"><button class="primary" onclick="openPKSetup()">${esc(t("playAgain"))}</button></div>`;}

function shouldShowBackupBanner(){if(!STATE.packs.length)return false;const last=Number(localStorage.getItem("af_last_export")||0),dismissed=Number(localStorage.getItem("af_backup_dismissed")||0),now=Date.now();if(dismissed&&now-dismissed<24*3600*1000)return false;return !last||now-last>14*24*3600*1000;}
function dismissBackup(){localStorage.setItem("af_backup_dismissed",String(Date.now()));render();}
function backupBanner(){return shouldShowBackupBanner()?`<div class="backup-banner"><div><strong>${esc(t("backupTitle"))}</strong><p>${esc(t("backupText"))}</p></div><button class="banner-x" aria-label="${esc(t("dismiss"))}" onclick="dismissBackup()">×</button></div>`:"";}
function packsView(){return `${backupBanner()}<div class="section-head"><div><h2>${esc(t("privatePacks"))}</h2><p>${esc(t("localOnly"))}</p></div><div class="row"><button class="secondary" onclick="document.getElementById('packImporter').click()">${esc(t("importPack"))}</button><button class="primary" onclick="newPackModal()">${esc(t("newPack"))}</button></div></div>${STATE.packs.length?`<div class="grid">${STATE.packs.map(packCard).join("")}</div>`:`<div class="panel empty">${esc(t("noPacks"))}</div>`}`;}
function packCard(p){return `<div class="pack-card"><div class="row between"><strong>${esc(p.name)}</strong><span class="badge">${esc(`${p.chars.length} ${t("characters")}`)}</span></div><div class="pack-thumb-grid">${p.chars.slice(0,4).map(c=>{const u=characterImageUrl(c);return `<div class="pack-thumb">${u?`<img src="${esc(u)}" alt="${esc(displayName(c))}">`:""}</div>`;}).join("")}${Array(Math.max(0,4-Math.min(4,p.chars.length))).fill('<div class="pack-thumb"></div>').join("")}</div><div class="row wrap"><button class="secondary" onclick="editPack(${jsarg(p.id)})">${esc(t("edit"))}</button><button class="ghost" onclick="exportPack(${jsarg(p.id)})">${esc(t("export"))}</button><button class="danger" onclick="deletePack(${jsarg(p.id)})">${esc(t("delete"))}</button></div></div>`;}
function newPackModal(){modal(`<div class="modal-head"><h2>${esc(t("newPack"))}</h2><button class="icon-btn" onclick="closeModal()">×</button></div><div class="form-group"><label>${esc(t("packName"))}</label><input id="newPackName" type="text" maxlength="80"></div><button class="primary" onclick="createPack()">${esc(t("addPack"))}</button>`);}
async function createPack(){const name=document.getElementById("newPackName")?.value.trim();if(!name)return;await requestPersistentStorage();const p=normalizePackForRuntime({id:`pack-${uuid()}`,name:name.slice(0,80),chars:[]});STATE.packs.push(p);await persistPacks();closeModal();toast(t("packCreated"));editPack(p.id);}
function editPack(id){STATE.editPackId=id;setScreen("packedit","packs");}
function packEdit(){const p=STATE.packs.find(x=>x.id===STATE.editPackId);if(!p)return home();return `<div class="section-head"><div><div class="eyebrow">${esc(t("privatePacks"))}</div><h2>${esc(p.name)}</h2><p>${esc(t("importInfo"))}</p></div><button class="primary" onclick="document.getElementById('imagePicker').click()">${esc(t("addImages"))}</button></div><div class="panel"><div class="form-group"><label>${esc(t("packName"))}</label><input id="packRename" value="${esc(p.name)}" maxlength="80" onchange="renamePack(${jsarg(p.id)},this.value)"></div><div class="form-group"><label>${esc(t("characterNames"))}</label><textarea id="bulkNames"></textarea></div><button class="secondary" onclick="applyNames(${jsarg(p.id)})">${esc(t("applyNames"))}</button></div><div class="section-head"><h3>${esc(t("roster"))}</h3></div>${p.chars.length?`<div class="grid">${p.chars.map(c=>{const u=characterImageUrl(c);return `<div class="pack-card"><div class="pack-thumb" style="aspect-ratio:16/11">${u?`<img src="${esc(u)}" alt="${esc(displayName(c))}">`:""}</div><div class="form-group"><input type="text" maxlength="80" value="${esc(c.name)}" onchange="renameCharacter(${jsarg(p.id)},${jsarg(c.id)},this.value)"></div><div class="form-group"><label>${esc(t("selectGender"))}</label><select class="gender-select" onchange="setCharacterGender(${jsarg(p.id)},${jsarg(c.id)},this.value)"><option value="" ${!c.gender?"selected":""}>${esc(t("unspecified"))}</option><option value="male" ${c.gender==="male"?"selected":""}>${esc(t("male"))}</option><option value="female" ${c.gender==="female"?"selected":""}>${esc(t("female"))}</option></select></div><button class="danger" onclick="removeCharacter(${jsarg(p.id)},${jsarg(c.id)})">${esc(t("remove"))}</button></div>`;}).join("")}</div>`:`<div class="panel empty">${esc(t("addImages"))}</div>`}`;}
async function handleImages(files){const p=STATE.packs.find(x=>x.id===STATE.editPackId);if(!p)return;const all=[...files],chosen=all.slice(0,50);if(all.length>50)toast(t("filesSkipped",{n:all.length-50}));for(const f of chosen){try{const blob=await decodeAndDownscale(f),id=`c-${uuid()}`,key=`pack:${id}`;await imagePut(key,blob);p.chars.push({id,name:f.name.replace(/\.[^.]+$/," ").replace(/[_-]+/g," ").trim().slice(0,80)||`Character ${p.chars.length+1}`,gender:undefined,imageKey:key,series:p.name,series_en:p.name,seriesId:p.id,name_en:""});}catch(e){console.error(e);toast(t("storageError"));}}await persistPacks();render();}
async function renamePack(id,name){const p=STATE.packs.find(x=>x.id===id);if(!p)return;p.name=(name||p.name).slice(0,80);p.name_en=p.name;p.chars.forEach(c=>{c.series=p.name;c.series_en=p.name;});await persistPacks();render();}
async function renameCharacter(pid,cid,name){const p=STATE.packs.find(x=>x.id===pid),c=p?.chars.find(x=>x.id===cid);if(!c)return;c.name=(name||c.name).slice(0,80);c.name_en=c.name;await persistPacks();}
async function setCharacterGender(pid,cid,g){const p=STATE.packs.find(x=>x.id===pid),c=p?.chars.find(x=>x.id===cid);if(!c)return;c.gender=["male","female"].includes(g)?g:undefined;await persistPacks();}
async function removeCharacter(pid,cid){const p=STATE.packs.find(x=>x.id===pid),c=p?.chars.find(x=>x.id===cid);if(!p||!c)return;await deleteImageKey(c.imageKey);p.chars=p.chars.filter(x=>x.id!==cid);await persistPacks();render();}
async function applyNames(pid){const p=STATE.packs.find(x=>x.id===pid);if(!p)return;const names=document.getElementById("bulkNames")?.value.split(/\n/).map(x=>x.trim()).filter(Boolean)||[];names.forEach((n,i)=>{if(p.chars[i]){p.chars[i].name=n.slice(0,80);p.chars[i].name_en=p.chars[i].name;}});await persistPacks();render();}
async function deletePack(id){if(!confirm(t("deletePackConfirm")))return;const p=STATE.packs.find(x=>x.id===id);if(!p)return;for(const c of p.chars)await deleteImageKey(c.imageKey);STATE.packs=STATE.packs.filter(x=>x.id!==id);await persistPacks();render();}
async function exportPack(id){const p=STATE.packs.find(x=>x.id===id);if(!p)return;const chars=[];for(const c of p.chars){let blob=c.imageKey?await imageGet(c.imageKey):null;if(!blob&&c.image)blob=dataUrlToBlob(c.image);if(!blob)continue;chars.push({name:c.name,gender:c.gender,image:await blobToDataUrl(blob)});}const payload={format:"animefusion-pack-v1",pack:{name:p.name,chars}};const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`${p.name.replace(/[^\w.-]+/g,"_")||"pack"}.fusionpack`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);localStorage.setItem("af_last_export",String(Date.now()));toast(t("exported"));render();}
async function importPackFile(file){let createdKeys=[];try{const data=JSON.parse(await file.text()),pack=data?.pack||data,check=L.validatePack(pack);if(!check.ok)throw new Error(check.errors.join(", "));await requestPersistentStorage();const pid=`pack-${uuid()}`,chars=[];for(const src of pack.chars){const id=`c-${uuid()}`,key=`pack:${id}`,raw=dataUrlToBlob(src.image),blob=await decodeAndDownscale(raw);await imagePut(key,blob);createdKeys.push(key);chars.push({id,name:src.name,gender:src.gender,imageKey:key,series:pack.name,series_en:pack.name,seriesId:pid,name_en:src.name});}STATE.packs.push(normalizePackForRuntime({id:pid,name:pack.name,chars}));await persistPacks();toast(t("imported"));setScreen("packs","home");}catch(e){console.warn(e);for(const k of createdKeys)try{await deleteImageKey(k);}catch{}toast(t("importRejected"));}}

function libraryView(){const rows=STATE.builtin.map(s=>{const chars=applyGenderFilter(s.chars),remote=chars.filter(c=>STATE.portraits.chars?.[c.id]?.url).length;return `<button class="library-series-card" onclick="openSeriesLibrary(${jsarg(s.id)})"><div><strong>${esc(displaySeries(s))}</strong><div class="small">${esc(`${chars.length} ${t("characters")}`)}</div></div><div class="library-ready"><span>${esc(`${remote}/${chars.length}`)}</span><small>${esc(t("remoteReady"))}</small></div><span class="library-arrow">›</span></button>`;}).join("");return `<div class="library-head"><div><h2>${esc(t("imageLibrary"))}</h2><p>${esc(t("storageNote"))}</p></div><button class="danger compact-danger" onclick="resetBuiltinPortraits()">${esc(t("resetOffline"))}</button></div><div class="library-series-list">${rows}</div>`;}
function openSeriesLibrary(id){STATE.librarySeriesId=id;setScreen("serieslibrary","library");}
function seriesLibraryView(){const s=getSeries(STATE.librarySeriesId);if(!s)return home();const chars=applyGenderFilter(s.chars);return `<div class="library-head"><div><div class="eyebrow">${esc(displaySeries(s))}</div><h2>${esc(t("roster"))}</h2><p>${esc(`${chars.length} ${t("characters")}`)}</p></div><button class="primary library-init-btn" onclick="saveSeriesOffline(${jsarg(s.id)})">${esc(t("saveOffline"))}</button></div><div class="character-browser">${chars.map(c=>{const u=characterImageUrl(c);return `<div class="mini-character-card">${u?`<img src="${esc(u)}" alt="${esc(displayName(c))}" referrerpolicy="no-referrer">`:`<div class="mini-fallback"><span>${esc(initials(displayName(c)))}</span><span class="no-image">${esc(t("noImage"))}</span></div>`}<div class="mini-meta"><strong>${esc(displayName(c))}</strong><span>${esc(secondaryName(c)||(c.gender?t(c.gender):t("unspecified")))}</span></div></div>`;}).join("")}</div>`;}
function openOfflineModal(){const series=STATE.builtin.map(s=>`<label class="init-row"><input type="checkbox" class="offline-series" value="${esc(s.id)}" checked><span>${esc(displaySeries(s))}</span><span class="small">${esc(String(s.chars.length))}</span></label>`).join("");modal(`<div class="modal-head"><div><h2>${esc(t("saveOffline"))}</h2><p>${esc(t("storageNote"))}</p></div><button class="icon-btn" onclick="closeModal()">×</button></div><div class="init-list">${series}</div><div id="offlineProgress" style="display:none"><div class="progress-wrap"><div class="progress-top"><span id="offlineStatus">${esc(t("savingOffline"))}</span><span id="offlineCount"></span></div><div class="progress"><div id="offlineBar" style="width:0%"></div></div></div><div class="offline-stats"><div class="offline-stat"><strong id="offlineSaved">0</strong><span>${esc(t("savedLocal"))}</span></div><div class="offline-stat"><strong id="offlineRemote">0</strong><span>${esc(t("usingRemote"))}</span></div><div class="offline-stat"><strong id="offlineFailed">0</strong><span>${esc(t("failed"))}</span></div></div></div><div class="cta-row"><button class="primary" onclick="saveSelectedOffline()">${esc(t("saveOffline"))}</button></div>`);}
async function savePortraitsOffline(chars,progress){let saved=0,remote=0,failed=0,done=0;for(const c of chars){const p=STATE.portraits.chars?.[c.id],url=p?.url,key=`builtin:${c.id}`;try{if(!url){failed++;}else if(await imageGet(key)){saved++;}else{try{const r=await fetch(url,{mode:"cors",cache:"force-cache"});if(!r.ok)throw new Error(String(r.status));const blob=await r.blob();await imagePut(key,blob);revokeImageUrl(key);saved++;}catch{remote++;}}}catch{failed++;}done++;if(progress)progress({saved,remote,failed,done,total:chars.length});}return{saved,remote,failed};}
async function saveSeriesOffline(id){const s=getSeries(id);if(!s)return;const r=await savePortraitsOffline(s.chars);toast(`${r.saved} ${t("savedLocal")} · ${r.remote} ${t("usingRemote")} · ${r.failed} ${t("failed")}`);render();}
async function saveSelectedOffline(){const ids=[...document.querySelectorAll(".offline-series:checked")].map(x=>x.value),chars=ids.flatMap(id=>getSeries(id)?.chars||[]),wrap=document.getElementById("offlineProgress");if(wrap)wrap.style.display="block";await savePortraitsOffline(chars,s=>{document.getElementById("offlineSaved").textContent=String(s.saved);document.getElementById("offlineRemote").textContent=String(s.remote);document.getElementById("offlineFailed").textContent=String(s.failed);document.getElementById("offlineCount").textContent=`${s.done}/${s.total}`;document.getElementById("offlineBar").style.width=`${s.total?s.done/s.total*100:100}%`;});closeModal();render();}

async function checkVersion(){STATE.versionInfo={current:VERSION,latest:null,status:"unknown"};try{const r=await fetch(`version.json?ts=${Date.now()}`,{cache:"no-store"});if(!r.ok)throw new Error();const d=await r.json(),cmp=L.compareVersions(d.version,VERSION);STATE.versionInfo.latest=d.version||null;STATE.versionInfo.status=cmp===1?"update":cmp===0?"ok":"unknown";}catch{STATE.versionInfo.status="unknown";}updateVersionBox();}
function versionStatusText(){return STATE.versionInfo.status==="update"?t("updateAvailable"):STATE.versionInfo.status==="ok"?t("upToDate"):t("unknown");}
function updateVersionBox(){const box=document.getElementById("versionState");if(!box)return;box.innerHTML=`<div class="row between"><span>${esc(t("currentVersion"))}</span><strong>${esc(VERSION)}</strong></div><div class="row between"><span>${esc(t("latestVersion"))}</span><strong>${esc(STATE.versionInfo.latest||"—")}</strong></div><div class="row between"><span>${esc(t("status"))}</span><strong>${esc(versionStatusText())}</strong></div>${STATE.versionInfo.status==="update"?`<div class="cta-row"><button class="primary" onclick="refreshAppVersion()">${esc(t("refreshApp"))}</button></div>`:""}`;}
function refreshAppVersion(){if(!STATE.versionInfo.latest)return;location.replace(`${location.pathname}?v=${encodeURIComponent(STATE.versionInfo.latest)}`);}
async function settings(){await refreshStorageEstimate();const usage=STATE.storageInfo?.usage||0,quota=STATE.storageInfo?.quota||0,pct=quota?Math.min(100,usage/quota*100):0;modal(`<div class="modal-head"><h2>${esc(t("settings"))}</h2><button class="icon-btn" onclick="closeModal()">×</button></div><label>${esc(t("language"))}</label><div class="lang-list"><button class="lang-btn${STATE.lang==="en"?" selected":""}" onclick="setLang('en')">English</button><button class="lang-btn${STATE.lang==="zh"?" selected":""}" onclick="setLang('zh')">简体中文</button><button class="lang-btn${STATE.lang==="ja"?" selected":""}" onclick="setLang('ja')">日本語</button></div><div class="panel" style="margin-top:16px"><div class="row between"><strong>${esc(t("version"))}</strong><span class="badge">v${esc(VERSION)}</span></div><div id="versionState" style="margin-top:10px"></div></div><div class="panel" style="margin-top:16px"><strong>${esc(t("storageUsage"))}</strong>${STATE.storageInfo?`<div class="small">${esc(`${(usage/1048576).toFixed(1)} MB / ${(quota/1048576).toFixed(1)} MB`)}</div><div class="storage-meter"><div class="progress"><div style="width:${esc(String(pct))}%"></div></div></div>`:`<div class="small">${esc(t("unknown"))}</div>`}</div><div class="panel" style="margin-top:16px"><div class="small">${esc(t("settingsAniListNote"))}</div><div class="cta-row"><button class="secondary" onclick="openOfflineModal()">${esc(t("saveOffline"))}</button><button class="ghost" onclick="resetBuiltinPortraits()">${esc(t("resetOffline"))}</button></div></div>`);updateVersionBox();checkVersion();}
function setLang(l){STATE.lang=l;localStorage.setItem("af_lang",l);closeModal();render();}

function render(){if(!STATE.ready)return;const map={home,setup,draft,result,quickreveal:quickRevealView,packs:packsView,packedit:packEdit,history:historyView,pksetup:pkSetupView,pk:pkView,library:libraryView,serieslibrary:seriesLibraryView};document.getElementById("screen").innerHTML=(map[STATE.screen]||home)();document.getElementById("homeBtn").classList.toggle("hidden",STATE.screen==="home");document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.nav===STATE.screen||(STATE.screen==="packedit"&&b.dataset.nav==="packs")||(["library","serieslibrary"].includes(STATE.screen)&&b.dataset.nav==="home")));i18nStatic();}

document.getElementById("settingsBtn").onclick=()=>settings();
document.getElementById("homeBtn").onclick=()=>{cancelAnimations();setScreen(STATE.back||"home");};
document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>{cancelAnimations();setScreen(b.dataset.nav,"home");});
document.getElementById("imagePicker").addEventListener("change",e=>{handleImages(e.target.files);e.target.value="";});
document.getElementById("packImporter").addEventListener("change",e=>{if(e.target.files[0])importPackFile(e.target.files[0]);e.target.value="";});
window.addEventListener("beforeunload",()=>{OBJECT_URLS.forEach(u=>URL.revokeObjectURL(u));});

loadBootData();
