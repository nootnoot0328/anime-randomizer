import { PROMPT_SCENARIOS, BATTLEFIELDS as AF_PK_BATTLEFIELDS } from "../data/game.js";
import { t, traitLabel, roleLabel, displaySeries, promptCharacterName, promptSeriesName } from "./i18n.js";
import { getSeries } from "./roster.js";
import { refereeFormat } from "../ai/format.js";

// AUTO-LIFTED from v0.6.4 source (prompt-patch.js + pk-v2.js), then parameterised by

// language and match so they don't read global state. tests/prompts.test.mjs checks

// every builder against prompts captured from the running v0.6.4 app.

/** Budget and Auction PK use five roles with no traitor. */
const noTraitor=pk=>pk.kind==="budget"||pk.kind==="auction";

function fusionBase(assignments,l){
  if(l==="zh"){
    const lines=assignments.map(a=>`${traitLabel(a.trait,l)}：${promptCharacterName(a.character,l)}（${promptSeriesName(a.character,l)||"未知作品"}）`).join("\n");
    return `请根据以下混合角色特质，设计一个完整、统一的原创动漫角色。\n\n重要要求：\n- 必须是一个自然融合后的新角色，不要做成拼贴。\n- 保留各参考角色最鲜明的视觉和性格特征，但整体要像同一个人。\n- 如果角色名称中包含时期、形态或版本，请严格采用该时期/形态。\n\n角色特质\n${lines}\n\n构图：横向 3:2。\n左侧：完整角色设定图，全身站姿，清楚展示脸、发型、体型、服装、配饰和武器；可附一个小头像。\n右侧：同一个角色处于自然或电影感场景中，用行动表现性格、幽默感、恋爱观、头脑、职业、厨艺或能力等非视觉特质。\n\n一致性：左右两侧必须明确是同一个人，脸、发型、眼睛、服装、比例与配饰保持一致。\n\n风格：高品质现代动漫插画、精致角色设定、自然人体、富有表现力的动作、电影感光影。\n\n不要加入作品 Logo、水印、UI 或多余文字。`;
  }
  if(l==="ja"){
    const lines=assignments.map(a=>`${traitLabel(a.trait,l)}：${promptCharacterName(a.character,l)}（${promptSeriesName(a.character,l)||"不明な作品"}）`).join("\n");
    return `以下のキャラクター要素を自然に融合し、ひとりの完成されたオリジナルアニメキャラクターとしてデザインしてください。\n\n重要：\n- コラージュではなく、すべての要素がひとりの人物として自然にまとまるようにする。\n- 各参考キャラクターの特徴は活かしつつ、最終的には新しいキャラクターとして成立させる。\n- 名前に時期・形態・バージョンが含まれている場合は、その時期・形態を厳密に反映する。\n\nキャラクター要素\n${lines}\n\n構図：横長 3:2。\n左側：全身のキャラクター設定画。顔、髪型、体格、衣装、アクセサリー、武器が分かるニュートラルな立ち姿。小さな顔アップを添えてもよい。\n右側：同じキャラクターが自然な日常またはシネマティックな場面にいる様子。性格、ユーモア、恋愛観、知力、職業、料理、能力などの非視覚的な特性を行動で表現する。\n\n一貫性：左右で顔、髪、目、衣装、体格、アクセサリーを統一し、必ず同一人物に見えるようにする。\n\n画風：高品質な現代アニメイラスト、洗練されたキャラクターデザイン、自然な人体、表情豊かな演技、映画的なライティング。\n\n作品ロゴ、透かし、UI、不必要な文字は入れない。`;
  }
  const lines=assignments.map(a=>`${a.trait}: ${promptCharacterName(a.character,l)} (${promptSeriesName(a.character,l)||"Unknown series"})`).join("\n");
  return `Create a polished anime character showcase based on the mixed traits below.\n\nIMPORTANT:\n- Create one coherent original character, not a collage.\n- Blend the strongest visual and behavioral qualities naturally into one believable person.\n- If a character name includes an era, form, or version, use that exact version.\n\nCHARACTER TRAITS\n${lines}\n\nCOMPOSITION: wide 3:2 landscape.\nLEFT: full-body character sheet in a neutral standing pose, clearly showing face, hair, physique, clothing, accessories and weapon; an optional small headshot is fine.\nRIGHT: the same character in a natural or cinematic scene that demonstrates non-visual traits such as personality, humour, romance, intelligence, occupation, cooking or power.\n\nCONSISTENCY: both sides must clearly be the same person with matching face, hair, eyes, clothing, proportions and accessories.\n\nSTYLE: premium modern anime illustration, polished character design, natural anatomy, expressive acting and cinematic lighting.\n\nDo not include franchise logos, watermarks, UI, or unnecessary text.`;
}

/** Image prompt for a finished fusion. `scenario` is the index of the saved PROMPT_SCENARIOS pick. */
export function buildFusionPrompt(assignments,mode,scenario,l){
  const base=fusionBase(assignments,l);
  const options=PROMPT_SCENARIOS[mode]||PROMPT_SCENARIOS.protagonist;
  const label=t(mode,{},l);
  const scene=options[scenario]||options[0];
  if(l==="zh"){
    const direction="主题："+label+"\n随机场景："+scene.zh+"\n请把这个场景作为右侧画面的主要行动、环境和情绪方向。";
    return base.replace("\n\n角色特质\n","\n\n"+direction+"\n\n角色特质\n");
  }
  if(l==="ja"){
    const direction="テーマ："+label+"\nランダムシーン："+scene.ja+"\nこのシーンを右側の主要なアクション、舞台、雰囲気として描いてください。";
    return base.replace("\n\nキャラクター要素\n","\n\n"+direction+"\n\nキャラクター要素\n");
  }
  const direction="THEME: "+label+"\nRANDOM SCENARIO: "+scene.en+"\nUse this scenario as the main action, setting and emotional direction on the right side.";
  return base.replace("\n\nCHARACTER TRAITS\n","\n\n"+direction+"\n\nCHARACTER TRAITS\n");
}

function pkImageTeamBlock(pk,n,l){
  const p=pk["p"+n];
  const series=getSeries(p.seriesId);
  const heading=l==="zh"?"队伍"+n:l==="ja"?"チーム"+n:"TEAM "+n;
  const rows=p.roles.map(role=>{
    const slot=p.team.find(x=>x.role===role);
    if(!slot)return"- "+roleLabel(role,l)+": "+(l==="zh"?"空缺":l==="ja"?"空き":"[empty]");
    const c=slot.character;
    return"- "+roleLabel(role,l)+": "+promptCharacterName(c,l)+" ("+(promptSeriesName(c,l)||displaySeries(series,l))+")";
  });
  return heading+" — "+displaySeries(series,l)+"\n"+rows.join("\n");
}

function pkImageBase(pk,l){
  const scene=pkBattleScenario(pk);
  const teams=pkImageTeamBlock(pk,1,l)+"\n\n"+pkImageTeamBlock(pk,2,l);
  const budget=noTraitor(pk);
  if(l==="zh")return"创作一幅高品质、电影感的动漫全明星团队大战插画。\n\n战斗舞台："+scene.zh+"\n\n"+teams+"\n\n构图：横向16:9，两队从画面两侧正面交锋。队长位于视觉中心，前锋与肉盾在前景，治疗与策略角色处于受保护位置。"+(budget?"":"内鬼位必须通过可读但不过度剧透的动作，表现正在准备背叛自己被分配的队伍。")+"\n\n重要：每位列出的角色恰好出现一次；严格采用角色名称中指定的时期或形态；保留可辨认的正史外观、服装、武器、体型与能力效果；不要融合角色、不要重复人物、不要添加名单外角色。\n\n风格：顶级现代动漫电影海报，动态镜头，清晰战斗层次，强烈光影与能力碰撞，同时确保所有角色都能辨认。\n\n不要加入文字、Logo、水印、UI、边框或角色姓名标签。";
  if(l==="ja")return"高品質で映画的な、アニメ・オールスターチームバトルの一枚絵を制作してください。\n\n戦闘舞台："+scene.ja+"\n\n"+teams+"\n\n構図：横長16:9。両チームが左右から正面衝突する。リーダーは視線の中心、前衛とタンクは手前、回復役と戦略役は守られた位置に配置する。"+(budget?"":"裏切り枠は、ドラフトされた自チームへの裏切りを準備していることが読み取れる、ただし露骨すぎない動きを見せる。")+"\n\n重要：リストの全キャラを一人ずつ、必ず一度だけ登場させる。名前に指定された時期・形態を厳密に使用し、原作で判別できる顔、衣装、武器、体格、能力演出を保つ。キャラ同士を融合しない、重複させない、リスト外の人物を追加しない。\n\n画風：最高品質の現代アニメ映画ポスター、ダイナミックなカメラ、読みやすい戦闘レイヤー、強いライティングと能力の衝突。全員を識別できるようにする。\n\n文字、ロゴ、透かし、UI、枠、キャラ名ラベルは入れない。";
  return"Create a premium cinematic anime all-star team battle illustration.\n\nBATTLEFIELD: "+scene.en+"\n\n"+teams+"\n\nCOMPOSITION: wide 16:9. The teams collide from opposite sides. Place leaders at the visual center, frontliners and tankers in the foreground, and healers or strategists in protected positions. "+(budget?"":"Show each betrayal-role character subtly but clearly preparing to turn against their own drafted team.")+"\n\nIMPORTANT: show every listed character exactly once. Use the exact era or form stated in the character name. Preserve recognizable canon faces, outfits, weapons, physiques and power effects. Do not fuse characters, duplicate anyone, or add unlisted fighters.\n\nSTYLE: premium modern anime movie poster, dynamic camera, readable battle layers, dramatic lighting and colliding power effects while keeping every fighter identifiable.\n\nDo not include text, franchise logos, watermarks, UI, borders or character-name labels.";
}

/** The battlefield is one of the two teams' home series, picked once per match and stored on it. */
export function pkBattleScenario(pk){
  if(!pk)return AF_PK_BATTLEFIELDS.onepiece;const ids=[pk.p1.seriesId,pk.p2.seriesId].filter(Boolean);
  if(!pk.battlefieldSeriesId||!ids.includes(pk.battlefieldSeriesId))pk.battlefieldSeriesId=ids.length>1&&ids[0]!==ids[1]?ids[Math.floor(Math.random()*2)]:ids[0];
  return AF_PK_BATTLEFIELDS[pk.battlefieldSeriesId]||AF_PK_BATTLEFIELDS.onepiece;
}

function pkDirectMatchupText(pk,l){
  const lines=[];for(let i=0;i<Math.min(5,pk.p1.roles.length,pk.p2.roles.length);i++){const a=pk.p1.team.find(x=>x.role===pk.p1.roles[i]),b=pk.p2.team.find(x=>x.role===pk.p2.roles[i]);if(a&&b)lines.push(`${roleLabel(pk.p1.roles[i],l)}: ${promptCharacterName(a.character,l)} vs ${promptCharacterName(b.character,l)}`);}
  const heading=l==="zh"?"对应定位交锋":l==="ja"?"役割別の対決":"ROLE MATCHUPS";
  if(noTraitor(pk))return `${heading}:\n${lines.length?lines.map((x,i)=>`${i+1}. ${x}`).join("\n"):(l==="zh"?"没有完整的对应定位。":l==="ja"?"両側が埋まった対応役割はありません。":"No role is filled on both sides.")}`;
  const t1=pk.p1.team.find(x=>x.role===pk.p1.roles[5]),t2=pk.p2.team.find(x=>x.role===pk.p2.roles[5]);
  const betrayal=l==="zh"?`背叛行动：${t1?promptCharacterName(t1.character,l):"玩家1内鬼"}转身攻击玩家1原队友；${t2?promptCharacterName(t2.character,l):"玩家2内鬼"}转身攻击玩家2原队友。`:l==="ja"?`裏切り：${t1?promptCharacterName(t1.character,l):"プレイヤー1の裏切り枠"}はプレイヤー1の元仲間を攻撃し、${t2?promptCharacterName(t2.character,l):"プレイヤー2の裏切り枠"}はプレイヤー2の元仲間を攻撃する。`:`BETRAYALS: ${t1?promptCharacterName(t1.character,l):"Player 1's traitor"} turns against Player 1's former teammates; ${t2?promptCharacterName(t2.character,l):"Player 2's traitor"} turns against Player 2's former teammates.`;
  return `${heading}:\n${lines.map((x,i)=>`${i+1}. ${x}`).join("\n")}\n${betrayal}`;
}
function pkJudgeTeamBlock(pk,n,l){
  const p=pk[`p${n}`],series=getSeries(p.seriesId),label=l==="zh"?`玩家${n}`:l==="ja"?`プレイヤー${n}`:`PLAYER ${n}`;
  const rows=p.roles.map(role=>{const slot=p.team.find(x=>x.role===role);if(!slot)return `- ${roleLabel(role,l)}: ${l==="zh"?"空缺":l==="ja"?"空き":"[empty]"}`;const c=slot.character;return `- ${roleLabel(role,l)}: ${promptCharacterName(c,l)} (${promptSeriesName(c,l)||displaySeries(series,l)})`;});
  return `${label} — ${displaySeries(series,l)}\n${rows.join("\n")}`;
}
function pkJudgeMatchupRows(pk,l){
  const lines=[];for(let i=0;i<Math.min(5,pk.p1.roles.length,pk.p2.roles.length);i++){const a=pk.p1.team.find(x=>x.role===pk.p1.roles[i]),b=pk.p2.team.find(x=>x.role===pk.p2.roles[i]),left=a?promptCharacterName(a.character,l):(l==="zh"?"空缺":l==="ja"?"空き":"[empty]"),right=b?promptCharacterName(b.character,l):(l==="zh"?"空缺":l==="ja"?"空き":"[empty]");lines.push(`${i+1}. ${roleLabel(pk.p1.roles[i],l)} vs ${roleLabel(pk.p2.roles[i],l)}: ${left} vs ${right}`);}return lines.join("\n");
}
function pkJudgeBetrayalText(pk,l){
  if(noTraitor(pk))return"";const a=pk.p1.team.find(x=>/:traitor$/.test(x.role)),b=pk.p2.team.find(x=>/:traitor$/.test(x.role)),an=a?promptCharacterName(a.character,l):(l==="zh"?"玩家1内鬼位":l==="ja"?"プレイヤー1の裏切り枠":"Player 1's betrayal slot"),bn=b?promptCharacterName(b.character,l):(l==="zh"?"玩家2内鬼位":l==="ja"?"プレイヤー2の裏切り枠":"Player 2's betrayal slot");
  if(l==="zh")return `本局背叛规则：${an}必须在合理的关键时刻背叛玩家1；${bn}必须以符合正史性格和能力的方式背叛玩家2。比较两人分别对原队伍造成的实际破坏。`;
  if(l==="ja")return `この対戦の裏切りルール：${an}は合理的な決定的瞬間にプレイヤー1を、${bn}は原作の性格と能力に沿った方法でプレイヤー2を必ず裏切る。両者が元チームへ与える実害を比較すること。`;
  return `MATCH-SPECIFIC BETRAYAL RULE: ${an} must betray Player 1 at a plausible decisive moment; ${bn} must betray Player 2 in a canon-plausible way. Compare the actual damage each causes to their original team.`;
}

export function buildPKBattleImagePrompt(pk,l){
  if(!pk)return"";
  let base=pkImageBase(pk,l);const matchups=pkDirectMatchupText(pk,l);
  if(noTraitor(pk)){
    if(l==="zh")return base.replace("\n\n构图：","\n\n"+matchups+"\n\n战斗编排规则：已配对的相同定位分别交战，并以各自定位行动；空缺定位不添加任何角色。\n\n构图：");
    if(l==="ja")return base.replace("\n\n構図：","\n\n"+matchups+"\n\n戦闘配置ルール：両側が埋まった同じ役割同士を対峙させ、各自の役割に沿って行動させる。空き役割には人物を追加しない。\n\n構図：");
    return base.replace("\n\nCOMPOSITION:","\n\n"+matchups+"\n\nFIGHT CHOREOGRAPHY: pair filled matching roles against each other and show each fighter performing that tactical role. Do not add fighters for empty roles.\n\nCOMPOSITION:");
  }
  if(l==="zh")return base.replace("\n\n构图：","\n\n"+matchups+"\n\n战斗编排规则：前五组必须分别进行清晰的一对一交战，每位角色只锁定自己的对应对手，不要形成混乱群殴。两名内鬼不与对方内鬼决斗，而是各自转身攻击自己原本所属的队伍。\n\n构图：").replace("内鬼位必须通过可读但不过度剧透的动作，表现正在准备背叛自己被分配的队伍。","内鬼位已经完成倒戈，明确面向自己原队伍发动攻击。");
  if(l==="ja")return base.replace("\n\n構図：","\n\n"+matchups+"\n\n戦闘配置ルール：最初の5組は明確な一対一で戦い、各キャラは指定された相手だけを攻撃する。乱戦にしない。2人の裏切り枠は互いに戦わず、それぞれ自分が所属していたチームへ攻撃を向ける。\n\n構図：").replace("裏切り枠は、ドラフトされた自チームへの裏切りを準備していることが読み取れる、ただし露骨すぎない動きを見せる。","裏切り枠はすでに寝返っており、元の自チームへ明確に攻撃を向ける。");
  return base.replace("\n\nCOMPOSITION:","\n\n"+matchups+"\n\nFIGHT CHOREOGRAPHY: the first five matchups are five separate, readable one-on-one fights. Every loyal fighter attacks only their listed opponent; do not turn them into a chaotic group melee. The two traitors do not fight each other—they turn inward and attack their own former drafted teams.\n\nCOMPOSITION:").replace("Show each betrayal-role character subtly but clearly preparing to turn against their own drafted team.","Show each betrayal-role character actively attacking their own former drafted team.");
}

/** Judge prompt. format "text" = the copy-paste prompt (identical to v0.6.4); "json" = the in-app referee. */
export function buildPKJudgePrompt(pk,l,format="text"){
  if(!pk)return"";const scene=pkBattleScenario(pk),battle=scene[l]||scene.en,teams=`${pkJudgeTeamBlock(pk,1,l)}\n\n${pkJudgeTeamBlock(pk,2,l)}`,matchups=pkJudgeMatchupRows(pk,l),betrayal=pkJudgeBetrayalText(pk,l),hasBetrayal=!noTraitor(pk);
  const tail=format==="json"?refereeFormat(pk,l):JUDGE_TEXT_FORMAT[l]||JUDGE_TEXT_FORMAT.en;
  if(l==="zh")return `判断以下两支动漫队伍的对战结果。以角色正史能力、当前所选时期／形态、速度、耐久、头脑、克制关系、定位和团队配合为依据。跨作品能力体系请做合理等效，不要虚构能力、变身、装备或战绩。\n\n战斗场景：\n${battle}\n\n除非场景明确说明，否则把它视为中立的电影感战场。场地可以影响移动、站位、射程与战术，但不得自动给予任何作品或角色主场优势。\n\n定位规则：\n定位是战术职责，不是装饰标签。\n\n* 领袖／船长／火影：评估指挥、决策、建立胜利条件及在压力下维持队伍运作的能力。\n* 副手／副船长／副队长：评估支援领袖、领袖失去战力后的接替能力，以及增援劣势对局的能力。\n* 前锋／肉盾／盾役：评估保护队友、耐久、拦截、吸引火力、区域封锁及阻止敌人接近脆弱成员的能力。\n* 治疗／船医／救援：评估实际治疗、救援、再生、撤离、减伤及维持队友战斗的能力。几乎没有治疗或救援能力的强者，只能获得有限的定位分。\n* 军师／航海士／情报位：评估战场意识、计划、情报搜集、临场适应、克制选择、协调及利用弱点的能力。${hasBetrayal?"\n* 内鬼／叛忍／叛徒／诅咒师／鬼方叛徒：这是强制背叛定位，不是忠诚的第六人。角色必须在合理的关键时刻背叛原队；正史性格和能力只决定拒绝支援、误导、破坏、突袭或倒戈的方式。其伤害计入原队伍。":""}\n\n定位履行与纯战力：\n纯战力重要，但只是判断的一部分。强者仍可能压制对局，但定位不合必须产生真实战术代价。不得因为一队单体强者较多就直接判胜，也不得仅因弱队定位更整齐就强行让其获胜。判断双方能否以实际能力履行定位并建立现实胜利路径。\n\n形态规则：\n严格使用名单中指定的时期、变身或版本，不得自动升级到最强形态。未指定时，采用最具代表性的正史战斗版本，并排除临时、非常规强化。\n\n跨作品规则：\n不同能量体系在战斗正常进行所需范围内可互相感知与作用。根据实际战绩和限制比较耐久、速度、精神效果、再生、结界等机制；没有正史依据时，不得假定某体系自动无效化另一体系。互动不确定时采用最保守的合理解释。\n\n战斗评估顺序：\n1. 逐一评价每组定位对局，说明谁更能履行职责及造成的战术后果。\n2. 找出硬克制与关键互动，例如属性克制、速度差、再生、封印、空间能力、精神操控、战场控制或无视耐久。\n3. 评价团队配合，包括组合技、救援、站位、沟通、弱者保护与增援。\n4. 推演战局进程；角色取得优势后可在符合正史逻辑时支援队友，不必永远锁定单挑。${hasBetrayal?"\n5. 应用背叛效果，比较两名内鬼对各自原队伍阵型、资源与胜利条件的破坏。":""}\n${hasBetrayal?"6":"5"}. 评价残局：双方必须完成什么才能获胜，以及是否有现实方法击败或无力化剩余敌人。\n\n重要：不得用单挑胜场数量决定总胜负。少赢几组单挑的队伍仍可能凭治疗、控制、配合、克制或增援获胜；若对方没有实际手段应对，单个压倒性强者也可能成为决定因素。\n\n空缺定位：空缺同时造成人数劣势和功能缺失，但不自动判负；判断其余成员能否补偿。\n\n一致性规则：选择最可能重复出现的结果，而不是最戏剧化的可能。罕见的理论胜法不得压过更稳定的结果。只有双方都没有更稳定的胜利路径时才判平局。\n\n队伍：\n${teams}\n\n定位对局：\n${matchups}\n\n${betrayal?betrayal+"\n\n":""}${tail}`;
  if(l==="ja")return `以下の2つのアニメチームの戦いを、原作能力、選択された時期・形態、速度、耐久力、知性、相性、役割適性、チーム連携から判定してください。存在しない能力、変身、装備、実績を作らないでください。\n\n戦場：\n${battle}\n\n明記されない限り中立のシネマティックな戦場として扱う。地形は移動、配置、射程、戦術に影響してよいが、作品やキャラへ自動的なホーム優位を与えない。\n\n役割ルール：\n役割は装飾ではなく戦術上の責任である。\n\n* リーダー／船長／火影：指揮、判断、勝利条件の構築、圧力下でチームを機能させる力。\n* 副官／副船長／副隊長：リーダー支援、代行、劣勢対面への増援。\n* 前衛／タンク／盾役：護衛、耐久、迎撃、敵の注意と進路の制御、脆弱な味方への接近阻止。\n* 回復／医師／救助：実際の治療、救出、再生、退避、被害軽減、継戦支援。回復・救助能力に乏しい強者は、この役割では限定的に評価する。\n* 参謀／航海士／情報役：状況把握、計画、情報収集、適応、対策選択、連携、弱点利用。${hasBetrayal?"\n* 裏切り者／抜け忍／離反者／呪詛師／鬼側の裏切り者：忠実な6人目ではなく、必ず発動する裏切り役。合理的な決定的瞬間に元チームを裏切り、原作の性格と能力で支援拒否、誤誘導、妨害、奇襲、寝返りの方法を決める。被害は元チームへ計上する。":""}\n\n役割遂行と戦闘力：\n戦闘力は重要だが一要素にすぎない。圧倒的な強者でも役割不適合には実際の戦術的代償を与える。強者の人数だけで勝敗を決めず、弱い側を役割の整い方だけで勝たせない。実能力で役割を遂行し、現実的な勝利条件を作れるか判断する。\n\n選択形態：\n名簿の時期・変身・バージョンを厳守し、最強形態へ自動更新しない。指定がない場合は代表的な原作戦闘版を使い、一時的・非標準の強化を除く。\n\n作品間ルール：\n戦闘成立に必要な範囲で超常エネルギー同士は知覚・干渉できるものとする。耐久、速度、精神効果、再生、障壁などを描写済みの実績と制限で比較し、根拠なく一方の体系が他方を無効化すると仮定しない。不確かな相互作用は保守的で合理的に解釈する。\n\n評価順序：\n1. 全役割対面を個別に評価し、役割遂行の優劣と戦術的結果を説明する。\n2. 属性相性、速度差、再生、封印、空間能力、精神操作、戦場制御、耐久無視などの強い対策を特定する。\n3. 組み合わせ、救助、配置、意思疎通、弱者保護、増援を含む連携を評価する。\n4. 戦闘の推移を評価し、優位を得た者は原作的に妥当なら他の対面を援護できる。${hasBetrayal?"\n5. 裏切りが元チームの陣形、資源、勝利条件へ与える損害を比較する。":""}\n${hasBetrayal?"6":"5"}. 終盤で各チームが何を達成すべきか、残存戦力を倒す・無力化する現実的手段があるか判定する。\n\n重要：1対1の勝数だけで勝者を決めない。回復、制圧、連携、相性、増援で逆転は可能であり、相手に対処法がなければ一人の圧倒的戦力が決定打にもなる。\n\n空き役割：人数と機能の両方を失うが自動敗北ではない。残りのキャラが補えるか判断する。\n\n一貫性：劇的な可能性ではなく、最も再現性の高い結果を選ぶ。稀な理論上の勝ち筋より安定した展開を優先し、どちらにも安定した優位がない場合のみ引き分けとする。\n\nチーム：\n${teams}\n\n役割別対面：\n${matchups}\n\n${betrayal?betrayal+"\n\n":""}${tail}`;
  return `Judge the battle between these two anime teams using canon abilities, the selected era/form, speed, durability, intelligence, counters, role fit and team synergy. Make reasonable cross-series assumptions and do not invent abilities, transformations, equipment or feats.\n\nBATTLE SCENE:\n${battle}\n\nTreat the setting as a neutral cinematic arena unless the scenario explicitly states otherwise. The battlefield may affect movement, positioning, range and tactics, but must not automatically grant either franchise or character a home-field advantage.\n\nROLE RULES:\nRoles are tactical responsibilities, not decorative labels.\n\n* Leader / Captain / Hokage:\n    Evaluate command ability, decision-making, ability to establish the team’s win condition, and capacity to keep the team functioning under pressure.\n* Deputy / First Mate / Second-in-Command:\n    Evaluate support for the leader, ability to take over if the leader is incapacitated, and ability to reinforce losing matchups.\n* Frontline / Tank / Shield:\n    Evaluate protection of teammates, durability, interception, aggro control, area denial and ability to prevent enemies from reaching vulnerable members.\n* Healer / Doctor / Rescue:\n    Evaluate actual healing, rescue, regeneration, evacuation, damage mitigation and ability to keep teammates fighting.\n    A powerful fighter with little or no healing/rescue ability should receive limited credit for this role.\n* Strategist / Navigator / Intelligence:\n    Evaluate battlefield awareness, planning, information gathering, adaptation, counter selection, coordination and exploitation of enemy weaknesses.${hasBetrayal?"\n* Traitor / Rogue / Defector / Curse User / Demon Traitor:\n    This is a mandatory betrayal role, not a loyal sixth fighter.\n    The character must betray their own drafted team at a plausible decisive moment.\n    Canon personality and abilities determine how they betray: withholding support, misinformation, sabotage, surprise attack, defection or another canon-plausible action.\n    Count the damage they cause against their original team.":""}\n\nROLE EXECUTION VS RAW POWER:\nRaw power matters, but it is only one part of the judgment.\n\nA much stronger character may still dominate their matchup, but poor role fit must create a real tactical cost.\n\nDo not award a team victory merely because it contains more individually powerful characters.\n\nLikewise, do not force a weaker team to win purely because its roles are cleaner.\n\nDetermine whether each team’s actual abilities allow it to execute its roles and create a realistic path to victory.\n\nSELECTED FORM RULE:\nAlways use the exact selected era, transformation or version shown in the roster.\n\nDo not automatically upgrade characters to their strongest known version.\n\nIf no era/form is specified, use the most representative canon combat version appropriate to the character, excluding temporary non-standard power-ups unless necessary.\n\nCROSS-SERIES RULE:\nWhen different power systems interact, use reasonable functional equivalence.\n\nExamples:\n\n* supernatural energy systems can generally perceive and interact with one another when necessary for the fight to function;\n* durability, speed, mind effects, regeneration, barriers and similar mechanics should be compared through demonstrated feats and limitations;\n* do not assume one power system automatically nullifies another without canon evidence.\n\nIf an interaction is uncertain, choose the most conservative reasonable interpretation rather than inventing a perfect counter.\n\nBATTLE EVALUATION ORDER:\n\n1. Evaluate every listed role matchup individually.\n    Do not merely declare who is stronger. Explain who performs the assigned role better and what tactical consequence follows.\n2. Identify hard counters and major matchup interactions.\n    Examples include elemental counters, speed gaps, regeneration, sealing, spatial abilities, mind manipulation, battlefield control or abilities that bypass durability.\n3. Evaluate team synergy.\n    Consider combinations, rescue potential, positioning, communication, protection of weaker members and whether one fighter can reinforce another matchup.\n4. Evaluate battle progression.\n    Characters do not remain permanently locked into isolated 1v1 fights.\n    After gaining an advantage or defeating an opponent, a character may assist teammates if canonically plausible.${hasBetrayal?"\n5. Apply betrayal effects if betrayal roles exist.\n    Compare how much each traitor damages their original team’s formation, resources and win condition.":""}\n${hasBetrayal?"6":"5"}. Evaluate the endgame.\n    Determine what each team must realistically accomplish to win and whether it has a practical method to defeat or incapacitate the opposing remaining fighters.\n\nIMPORTANT:\nDo NOT determine the winner by simply counting how many 1v1 matchups each team wins.\n\nThe final result must come from the full team battle.\n\nA team may lose more direct matchups but still win through healing, battlefield control, tactical combinations, counters or reinforcement.\n\nLikewise, one overwhelmingly dominant fighter may become decisive if the opposing team has no practical answer once that fighter is free to assist other matchups.\n\nEMPTY OR MISSING ROLES:\nAn empty role creates both a numerical disadvantage and the loss of that role’s tactical function.\n\nIt is a disadvantage, but not an automatic loss.\n\nJudge whether the remaining characters can compensate.\n\nCONSISTENCY RULE:\nPrefer the most plausible repeatable outcome rather than the most dramatic possibility.\n\nRare hypothetical win conditions should not outweigh outcomes that would occur more consistently.\n\nIf one team would plausibly win most encounters, choose that team even if the opponent has a narrow upset route.\n\nOnly declare a draw when neither side has a reasonably more consistent path to victory.\n\nTEAMS:\n\n${teams}\n\nROLE MATCHUPS:\n${matchups}\n\n${betrayal?betrayal+"\n\n":""}${tail}`;
}

/** The short answer format used by the copy-paste judge prompt (unchanged from v0.6.4). */
export const JUDGE_TEXT_FORMAT={
  zh:`回答必须简短，并严格使用以下格式：\n\n结果：玩家1胜 / 玩家2胜 / 平局\n差距：碾压 / 明显优势 / 中等优势 / 接近 / 极其接近 / 势均力敌\n理由：2～4句，说明决定战斗的定位、克制、增援互动和团队配合。\n最大因素：1句指出最关键的决定因素。\n\n差距说明：\n* 碾压：败方几乎没有现实胜法。\n* 明显优势：胜方拥有多个可靠优势，并赢下大多数合理战局。\n* 中等优势：胜方有实质优势，但败方仍有可信胜法。\n* 接近：双方都有现实胜机，但一方的路径更稳定。\n* 极其接近：高度依赖对局，一个小互动、失误或克制即可决定结果。\n* 势均力敌：仅用于真正的平局。\n\n平局时必须写：\n差距：势均力敌`,
  ja:`短く、必ず次の形式だけで回答：\n\n結果：プレイヤー1勝 / プレイヤー2勝 / 引き分け\n差：圧勝 / 明確な優勢 / 中程度の優勢 / 接戦 / 紙一重 / 五分\n理由：2〜4文で、勝敗を決めた役割、相性、増援、連携を説明。\n最大要因：最も決定的な要因を1文。\n\n差の目安：\n* 圧勝：敗者に現実的な勝ち筋がほぼない。\n* 明確な優勢：勝者に複数の安定した優位があり、多くの展開で勝つ。\n* 中程度の優勢：明確な優位はあるが、敗者にも信頼できる勝ち筋がある。\n* 接戦：双方に現実的な勝機があるが、一方がより安定している。\n* 紙一重：小さな相互作用、ミス、相性で決まる。\n* 五分：真の引き分けだけに使う。\n\n引き分けの場合：\n差：五分`,
  en:`Keep the answer short and use exactly this format:\n\nRESULT: Player 1 wins / Player 2 wins / Draw\nMARGIN: Overwhelming / Clear / Moderate / Close / Razor-thin / Even\nWHY: 2–4 short sentences explaining which roles, counters, reinforcement interactions and team synergies decide the battle.\nBIGGEST FACTOR: 1 sentence identifying the single most decisive factor.\n\nMARGIN GUIDE:\n\n* Overwhelming: Losing team has almost no realistic path to victory.\n* Clear: Winning team has multiple reliable advantages and wins most plausible battle progressions.\n* Moderate: Winning team has a meaningful advantage, but the losing team has credible routes to victory.\n* Close: Both teams can realistically win, but one side has the more consistent path.\n* Razor-thin: Extremely matchup-dependent; a small interaction, mistake or counter likely decides it.\n* Even: Only use for a genuine draw.\n\nFor a draw, use:\nMARGIN: Even`
};
