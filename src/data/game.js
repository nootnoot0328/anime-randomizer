// Generated from the running v0.6.4 app (all patch layers applied), then maintained by hand.
// v1.2: "Appearance" is split into Hair, Face, Outfit and Physique ("Body" merged into Physique).
// TRAIT_LABELS keeps the old names so saved history still reads correctly.
export const MODES = {
 "partner": [
  "Hair",
  "Face",
  "Outfit",
  "Physique",
  "Personality",
  "Intelligence",
  "Humour",
  "Romance",
  "Loyalty",
  "Cooking",
  "Wealth",
  "Occupation",
  "Power"
 ],
 "protagonist": [
  "Face",
  "Hair",
  "Physique",
  "Personality",
  "Intelligence",
  "Power",
  "Weapon",
  "Fighting Style",
  "Mentor",
  "Luck",
  "Outfit",
  "Special Ability"
 ],
 "villain": [
  "Hair",
  "Face",
  "Outfit",
  "Physique",
  "Personality",
  "Motive",
  "Intelligence",
  "Power",
  "Cruelty",
  "Charisma",
  "Weapon",
  "Army",
  "Final Form"
 ],
 "bestfriend": [
  "Personality",
  "Humour",
  "Reliability",
  "Intelligence",
  "Fighting Ability",
  "Social Skills",
  "Chaos Level",
  "Hobbies",
  "Loyalty",
  "Luck"
 ],
 "rival": [
  "Hair",
  "Face",
  "Outfit",
  "Physique",
  "Personality",
  "Intelligence",
  "Power",
  "Weapon",
  "Fighting Style",
  "Motive",
  "Charisma",
  "Luck",
  "Special Ability"
 ],
 "mentor": [
  "Hair",
  "Face",
  "Outfit",
  "Physique",
  "Personality",
  "Intelligence",
  "Power",
  "Weapon",
  "Fighting Style",
  "Reliability",
  "Social Skills",
  "Occupation",
  "Special Ability"
 ],
 "finalboss": [
  "Hair",
  "Face",
  "Outfit",
  "Physique",
  "Personality",
  "Motive",
  "Intelligence",
  "Power",
  "Cruelty",
  "Charisma",
  "Weapon",
  "Army",
  "Final Form"
 ],
 "isekai": [
  "Face",
  "Hair",
  "Physique",
  "Personality",
  "Intelligence",
  "Power",
  "Weapon",
  "Luck",
  "Outfit",
  "Special Ability",
  "Occupation"
 ],
 "adventureparty": [
  "Hair",
  "Face",
  "Outfit",
  "Physique",
  "Personality",
  "Intelligence",
  "Power",
  "Weapon",
  "Fighting Style",
  "Reliability",
  "Cooking",
  "Occupation",
  "Special Ability",
  "Loyalty",
  "Luck"
 ],
 "roommate": [
  "Hair",
  "Face",
  "Outfit",
  "Physique",
  "Personality",
  "Intelligence",
  "Humour",
  "Reliability",
  "Social Skills",
  "Chaos Level",
  "Hobbies",
  "Loyalty",
  "Cooking",
  "Wealth",
  "Occupation"
 ]
};

export const TRAIT_LABELS = {
 "Appearance": {
  "zh": "外形",
  "ja": "外見"
 },
 "Hair": {
  "zh": "发型",
  "ja": "髪型"
 },
 "Body": {
  "zh": "身材",
  "ja": "体型"
 },
 "Personality": {
  "zh": "性格",
  "ja": "性格"
 },
 "Intelligence": {
  "zh": "头脑",
  "ja": "知力"
 },
 "Humour": {
  "zh": "幽默感",
  "ja": "ユーモア"
 },
 "Romance": {
  "zh": "恋爱观",
  "ja": "恋愛観"
 },
 "Loyalty": {
  "zh": "忠诚度",
  "ja": "一途さ"
 },
 "Cooking": {
  "zh": "厨艺",
  "ja": "料理の腕"
 },
 "Wealth": {
  "zh": "财力",
  "ja": "財力"
 },
 "Occupation": {
  "zh": "职业",
  "ja": "職業"
 },
 "Power": {
  "zh": "能力",
  "ja": "能力"
 },
 "Face": {
  "zh": "长相",
  "ja": "顔立ち"
 },
 "Physique": {
  "zh": "体格",
  "ja": "体格"
 },
 "Weapon": {
  "zh": "武器",
  "ja": "武器"
 },
 "Fighting Style": {
  "zh": "战斗风格",
  "ja": "戦闘スタイル"
 },
 "Mentor": {
  "zh": "导师",
  "ja": "師匠"
 },
 "Luck": {
  "zh": "运气",
  "ja": "運"
 },
 "Outfit": {
  "zh": "服装",
  "ja": "衣装"
 },
 "Special Ability": {
  "zh": "特殊能力",
  "ja": "特殊能力"
 },
 "Motive": {
  "zh": "动机",
  "ja": "動機"
 },
 "Cruelty": {
  "zh": "残酷度",
  "ja": "残酷さ"
 },
 "Charisma": {
  "zh": "魅力",
  "ja": "カリスマ"
 },
 "Army": {
  "zh": "军团",
  "ja": "軍勢"
 },
 "Final Form": {
  "zh": "最终形态",
  "ja": "最終形態"
 },
 "Reliability": {
  "zh": "靠谱程度",
  "ja": "頼もしさ"
 },
 "Fighting Ability": {
  "zh": "战斗力",
  "ja": "戦闘力"
 },
 "Social Skills": {
  "zh": "社交力",
  "ja": "コミュ力"
 },
 "Chaos Level": {
  "zh": "搞事程度",
  "ja": "カオス度"
 },
 "Hobbies": {
  "zh": "兴趣",
  "ja": "趣味"
 }
};

export const PROMPT_SCENARIOS = {
 "partner": [
  {
   "en": "A quiet evening cooking together at home after a dangerous mission.",
   "zh": "危险任务结束后，两人在家一起做晚餐，享受安静的夜晚。",
   "ja": "危険な任務を終えた二人が、家で一緒に夕食を作る静かな夜。"
  },
  {
   "en": "A festival date beneath fireworks, with natural chemistry and small affectionate gestures.",
   "zh": "烟花下的祭典约会，用自然互动和细微动作表现两人的默契。",
   "ja": "花火の下での祭りデート。自然な相性とさりげない愛情を仕草で見せる。"
  },
  {
   "en": "A rainy-day café date where the pair quietly plan their future together.",
   "zh": "雨天咖啡馆约会，两人一边交谈，一边规划共同的未来。",
   "ja": "雨の日のカフェデート。二人で静かに将来について語り合う。"
  }
 ],
 "protagonist": [
  {
   "en": "The hero stands above a ruined city moments before the decisive battle.",
   "zh": "决战前夕，主角站在残破城市的高处俯瞰战场。",
   "ja": "決戦直前、主人公が廃墟となった街を見下ろしている。"
  },
  {
   "en": "At sunrise, the hero takes the first step of a vast new journey.",
   "zh": "旭日初升，主角踏出宏大旅程的第一步。",
   "ja": "朝日の中、主人公が壮大な旅への第一歩を踏み出す。"
  },
  {
   "en": "The hero protects civilians as their true power awakens for the first time.",
   "zh": "为保护平民，主角第一次觉醒真正的力量。",
   "ja": "人々を守るため、主人公の真の力が初めて覚醒する。"
  }
 ],
 "villain": [
  {
   "en": "The antagonist is revealed for the first time inside an ominous throne room.",
   "zh": "反派在阴森的王座大厅中首次正式登场。",
   "ja": "不穏な玉座の間で、敵役が初めてその姿を現す。"
  },
  {
   "en": "The villain addresses a conquered city from above while their plan enters its final stage.",
   "zh": "计划进入最终阶段，反派从高处向被征服的城市发表宣告。",
   "ja": "計画が最終段階に入り、悪役が征服した街へ高所から宣告する。"
  },
  {
   "en": "The villain calmly enters the final battlefield while everyone else recoils in fear.",
   "zh": "最终战场上，众人畏惧后退，反派却从容登场。",
   "ja": "最終決戦の場で、周囲が恐怖に退く中、悪役だけが静かに歩み出る。"
  }
 ],
 "bestfriend": [
  {
   "en": "A chaotic road trip or mission where the best friend keeps everyone laughing.",
   "zh": "一场混乱的旅程或任务中，挚友让所有人都笑了出来。",
   "ja": "大混乱の旅や任務の中で、親友が仲間を笑わせ続ける。"
  },
  {
   "en": "A late-night convenience-store stop after battle, sharing food and honest conversation.",
   "zh": "战斗后的深夜便利店，两人分享食物，也说出真心话。",
   "ja": "戦いの後の深夜のコンビニ。食べ物を分け合い、本音を語る。"
  },
  {
   "en": "The best friend arrives at the last second to perform a rescue—and cracks a joke.",
   "zh": "挚友在最后一刻赶来救场，还不忘开一句玩笑。",
   "ja": "親友が土壇場で救援に現れ、こんな時でも冗談を飛ばす。"
  }
 ],
 "rival": [
  {
   "en": "Two rivals face each other across an empty arena before their long-awaited duel.",
   "zh": "空旷竞技场中，两位宿敌终于迎来期待已久的决斗。",
   "ja": "誰もいない闘技場で、二人のライバルが待ち望んだ決闘を迎える。"
  },
  {
   "en": "The rivals form an uneasy alliance against a common enemy without lowering their guard.",
   "zh": "面对共同敌人，两位宿敌暂时联手，却始终没有放下戒心。",
   "ja": "共通の敵を前に、不信感を残したままライバル同士が共闘する。"
  },
  {
   "en": "At sunset, the rivals begin the final duel that will decide whose path was right.",
   "zh": "夕阳下，两位宿敌展开最终决斗，证明谁选择的道路才是正确的。",
   "ja": "夕暮れの中、どちらの信念が正しかったかを決める最後の決闘が始まる。"
  }
 ],
 "mentor": [
  {
   "en": "On a training ground, the mentor calmly corrects a student's failed technique.",
   "zh": "训练场上，导师冷静地纠正学生失败的招式。",
   "ja": "修練場で、師匠が弟子の失敗した技を冷静に直している。"
  },
  {
   "en": "The mentor steps in front of their students and stops an overwhelming attack.",
   "zh": "压倒性的攻击来临时，导师挡在学生面前将其拦下。",
   "ja": "圧倒的な攻撃を前に、師匠が弟子たちをかばって受け止める。"
  },
  {
   "en": "After a painful defeat, the mentor gives one quiet lesson that changes the student's path.",
   "zh": "惨败之后，导师用一句平静的教诲改变了学生未来的道路。",
   "ja": "痛い敗北の後、師匠の静かな教えが弟子の進む道を変える。"
  }
 ],
 "finalboss": [
  {
   "en": "The final boss descends into a collapsing arena in their completed transformation.",
   "zh": "竞技场正在崩塌，最终Boss以完整形态从天而降。",
   "ja": "崩壊する戦場へ、完全形態となったラスボスが降臨する。"
  },
  {
   "en": "Inside a vast throne room, an entire army kneels as the final boss rises.",
   "zh": "宏伟王座大厅中，整支军团跪下，最终Boss缓缓起身。",
   "ja": "巨大な玉座の間で、全軍がひざまずく中、ラスボスが立ち上がる。"
  },
  {
   "en": "Reality bends across a cosmic battlefield as the final boss reveals their true power.",
   "zh": "宇宙般的终极战场上，现实开始扭曲，最终Boss展露真正力量。",
   "ja": "宇宙的な最終戦場で現実が歪み、ラスボスが真の力を解放する。"
  }
 ],
 "isekai": [
  {
   "en": "The reincarnated character is summoned into a royal hall and receives an unexpected class.",
   "zh": "转生者被召唤到王宫大厅，并获得了出乎意料的职业。",
   "ja": "転生者が王宮へ召喚され、予想外の職業を授かる。"
  },
  {
   "en": "At a crowded adventurers' guild, the newcomer discovers what their unique ability can do.",
   "zh": "热闹的冒险者公会中，新人第一次发现自己独特能力的真正用途。",
   "ja": "賑わう冒険者ギルドで、新人が固有能力の本当の使い方に気づく。"
  },
  {
   "en": "Lost in an ancient forest ruin, the reincarnated character awakens their blessing.",
   "zh": "迷失在古老森林遗迹时，转生者觉醒了自己的祝福。",
   "ja": "古代の森の遺跡で迷う中、転生者の加護が覚醒する。"
  }
 ],
 "adventureparty": [
  {
   "en": "In a lively tavern, the party member helps plan a dangerous new quest.",
   "zh": "热闹酒馆里，这位队友协助众人规划一项危险的新任务。",
   "ja": "賑やかな酒場で、パーティーメンバーが危険な新クエストの作戦を練る。"
  },
  {
   "en": "Deep inside a dungeon, the party member reacts as a hidden trap is triggered.",
   "zh": "地牢深处，隐藏陷阱突然启动，队友立即作出应对。",
   "ja": "ダンジョンの奥で隠された罠が作動し、仲間が即座に対応する。"
  },
  {
   "en": "Around a campfire after battle, the party member reveals how they support the group.",
   "zh": "战斗后的篝火旁，队友展现自己如何支撑整个团队。",
   "ja": "戦いの後の焚き火を囲み、その仲間がパーティーを支える姿を見せる。"
  }
 ],
 "roommate": [
  {
   "en": "A chaotic weekday morning in a shared apartment reveals both roommates' habits.",
   "zh": "合租公寓里混乱的工作日早晨，室友的生活习惯暴露无遗。",
   "ja": "シェアハウスの慌ただしい平日の朝、ルームメイトの生活習慣が丸見えになる。"
  },
  {
   "en": "A disagreement over cooking and chores turns into affectionate domestic comedy.",
   "zh": "围绕做饭和家务的小争执，逐渐变成温馨的日常喜剧。",
   "ja": "料理と家事をめぐる口論が、どこか温かい日常コメディに変わる。"
  },
  {
   "en": "A relaxed movie or gaming night shows the roommate's quirks and compatibility.",
   "zh": "轻松的电影或游戏之夜，展现室友的怪癖与相处默契。",
   "ja": "映画やゲームを楽しむ夜に、ルームメイトの癖と相性が表れる。"
  }
 ]
};

export const CHARACTER_PHASES = {
 "jjk-maki-zenin": [
  {
   "key": "pre",
   "en": "Pre-awakening",
   "zh": "觉醒前",
   "ja": "覚醒前"
  },
  {
   "key": "awakened",
   "en": "Awakened — Heavenly Restriction",
   "zh": "完全觉醒·天与咒缚",
   "ja": "覚醒後・天与呪縛"
  }
 ],
 "jjk-satoru-gojo": [
  {
   "key": "student",
   "en": "Hidden Inventory — Awakened Student",
   "zh": "怀玉·玉折·觉醒学生时期",
   "ja": "懐玉・玉折編・覚醒後"
  },
  {
   "key": "adult",
   "en": "Adult Gojo",
   "zh": "成年五条悟",
   "ja": "成人期の五条悟"
  }
 ],
 "jjk-yuta-okkotsu": [
  {
   "key": "zero",
   "en": "Jujutsu Kaisen 0",
   "zh": "咒术回战 0 时期",
   "ja": "劇場版0期"
  },
  {
   "key": "sendai",
   "en": "Sendai / Later Yuta",
   "zh": "仙台结界时期",
   "ja": "仙台結界編"
  }
 ],
 "onepiece-monkey-d-luffy": [
  {
   "key": "prets",
   "en": "Pre-timeskip",
   "zh": "两年前",
   "ja": "2年前"
  },
  {
   "key": "gear5",
   "en": "Gear 5 / Nika",
   "zh": "五档·尼卡",
   "ja": "ギア5・ニカ"
  }
 ],
 "onepiece-roronoa-zoro": [
  {
   "key": "prets",
   "en": "Pre-timeskip",
   "zh": "两年前",
   "ja": "2年前"
  },
  {
   "key": "koh",
   "en": "King of Hell",
   "zh": "阎王三刀流",
   "ja": "閻王三刀流"
  }
 ],
 "onepiece-sanji": [
  {
   "key": "prets",
   "en": "Pre-timeskip",
   "zh": "两年前",
   "ja": "2年前"
  },
  {
   "key": "ifrit",
   "en": "Ifrit Jambe",
   "zh": "魔神风脚",
   "ja": "魔神風脚"
  }
 ],
 "naruto-naruto-uzumaki": [
  {
   "key": "shippuden",
   "en": "Shippuden",
   "zh": "疾风传时期",
   "ja": "疾風伝期"
  },
  {
   "key": "sixpaths",
   "en": "Six Paths Sage Mode",
   "zh": "六道仙人模式",
   "ja": "六道仙人モード"
  }
 ],
 "naruto-sasuke-uchiha": [
  {
   "key": "hebi",
   "en": "Early Shippuden / Hebi",
   "zh": "疾风传前期·蛇小队",
   "ja": "疾風伝前期・蛇"
  },
  {
   "key": "ems",
   "en": "Eternal Mangekyo Sharingan",
   "zh": "永恒万花筒写轮眼",
   "ja": "永遠の万華鏡写輪眼"
  },
  {
   "key": "rinnegan",
   "en": "Rinnegan / Six Paths",
   "zh": "轮回眼·六道之力",
   "ja": "輪廻眼・六道の力"
  }
 ],
 "naruto-madara-uchiha": [
  {
   "key": "alive",
   "en": "Living Madara",
   "zh": "生前斑",
   "ja": "生前のマダラ"
  },
  {
   "key": "edo",
   "en": "Edo Tensei / Rinnegan",
   "zh": "秽土转生·轮回眼",
   "ja": "穢土転生・輪廻眼"
  },
  {
   "key": "tenails",
   "en": "Ten-Tails Jinchuriki",
   "zh": "十尾人柱力",
   "ja": "十尾の人柱力"
  }
 ],
 "naruto-obito-uchiha": [
  {
   "key": "masked",
   "en": "Masked Obito",
   "zh": "面具男时期",
   "ja": "仮面の男期"
  },
  {
   "key": "tenails",
   "en": "Ten-Tails Jinchuriki",
   "zh": "十尾人柱力",
   "ja": "十尾の人柱力"
  }
 ],
 "bleach-ichigo-kurosaki": [
  {
   "key": "soulreaper",
   "en": "Soul Reaper",
   "zh": "死神时期",
   "ja": "死神代行期"
  },
  {
   "key": "dangai",
   "en": "Dangai / Final Getsuga",
   "zh": "断界·最后的月牙天冲",
   "ja": "断界・最後の月牙天衝"
  },
  {
   "key": "true",
   "en": "True Zanpakuto / TYBW",
   "zh": "真斩月·千年血战",
   "ja": "真の斬月・千年血戦篇"
  }
 ],
 "aot-eren-yeager": [
  {
   "key": "scout",
   "en": "Survey Corps",
   "zh": "调查兵团时期",
   "ja": "調査兵団期"
  },
  {
   "key": "war",
   "en": "War for Paradis",
   "zh": "帕拉迪岛战争时期",
   "ja": "パラディ島戦争期"
  },
  {
   "key": "founder",
   "en": "Founding Titan",
   "zh": "始祖巨人",
   "ja": "始祖の巨人"
  }
 ],
 "mha-izuku-midoriya": [
  {
   "key": "early",
   "en": "Early U.A.",
   "zh": "雄英前期",
   "ja": "雄英高校・前期"
  },
  {
   "key": "finalwar",
   "en": "Final War",
   "zh": "最终决战时期",
   "ja": "最終決戦期"
  }
 ],
 "mha-tomura-shigaraki": [
  {
   "key": "early",
   "en": "League of Villains",
   "zh": "敌联合时期",
   "ja": "敵連合期"
  },
  {
   "key": "awakened",
   "en": "Awakened / All For One",
   "zh": "觉醒后·与AFO融合",
   "ja": "覚醒後・AFO融合"
  }
 ],
 "dragonball-goku": [
  {
   "key": "base",
   "en": "Base Goku",
   "zh": "常态悟空",
   "ja": "通常状態の悟空"
  },
  {
   "key": "ssj",
   "en": "Super Saiyan era",
   "zh": "超级赛亚人时期",
   "ja": "超サイヤ人期"
  },
  {
   "key": "ui",
   "en": "Ultra Instinct",
   "zh": "自在极意功",
   "ja": "身勝手の極意"
  }
 ],
 "dragonball-vegeta": [
  {
   "key": "base",
   "en": "Base Vegeta",
   "zh": "常态贝吉塔",
   "ja": "通常状態のベジータ"
  },
  {
   "key": "ssj",
   "en": "Super Saiyan era",
   "zh": "超级赛亚人时期",
   "ja": "超サイヤ人期"
  },
  {
   "key": "blueevo",
   "en": "Super Saiyan Blue Evolution",
   "zh": "超级赛亚人蓝进化",
   "ja": "超サイヤ人ブルー進化"
  }
 ],
 "dragonball-gohan": [
  {
   "key": "child",
   "en": "Child Gohan",
   "zh": "幼年悟饭",
   "ja": "幼年期の悟飯"
  },
  {
   "key": "ssj2",
   "en": "Cell Games — Super Saiyan 2",
   "zh": "沙鲁游戏·超二",
   "ja": "セルゲーム・超サイヤ人2"
  },
  {
   "key": "beast",
   "en": "Gohan Beast",
   "zh": "野兽悟饭",
   "ja": "孫悟飯ビースト"
  }
 ],
 "dragonball-broly": [
  {
   "key": "base",
   "en": "Base / Wrathful",
   "zh": "常态·怒气形态",
   "ja": "通常・怒り形態"
  },
  {
   "key": "fullpower",
   "en": "Full Power Super Saiyan",
   "zh": "全功率超级赛亚人",
   "ja": "超サイヤ人フルパワー"
  }
 ],
 "sao-kirito": [
  {
   "key": "aincrad",
   "en": "Aincrad",
   "zh": "艾恩葛朗特时期",
   "ja": "アインクラッド編"
  },
  {
   "key": "alicization",
   "en": "Alicization",
   "zh": "爱丽丝篇",
   "ja": "アリシゼーション編"
  }
 ]
};

// Six roles per series; the last (":traitor") is dropped in Budget PK.
export const ROLE_SETS = {
 "onepiece": [
  "onepiece:captain",
  "onepiece:firstmate",
  "onepiece:tanker",
  "onepiece:doctor",
  "onepiece:strategist",
  "onepiece:traitor"
 ],
 "naruto": [
  "naruto:leader",
  "naruto:deputy",
  "naruto:tanker",
  "naruto:healer",
  "naruto:strategist",
  "naruto:traitor"
 ],
 "jjk": [
  "jjk:leader",
  "jjk:deputy",
  "jjk:tanker",
  "jjk:healer",
  "jjk:strategist",
  "jjk:traitor"
 ],
 "bleach": [
  "bleach:leader",
  "bleach:deputy",
  "bleach:tanker",
  "bleach:healer",
  "bleach:strategist",
  "bleach:traitor"
 ],
 "demonslayer": [
  "demonslayer:leader",
  "demonslayer:deputy",
  "demonslayer:tanker",
  "demonslayer:healer",
  "demonslayer:strategist",
  "demonslayer:traitor"
 ],
 "chainsawman": [
  "chainsawman:leader",
  "chainsawman:deputy",
  "chainsawman:tanker",
  "chainsawman:healer",
  "chainsawman:strategist",
  "chainsawman:traitor"
 ],
 "spyfamily": [
  "spyfamily:leader",
  "spyfamily:deputy",
  "spyfamily:tanker",
  "spyfamily:healer",
  "spyfamily:strategist",
  "spyfamily:traitor"
 ],
 "frieren": [
  "frieren:leader",
  "frieren:deputy",
  "frieren:tanker",
  "frieren:healer",
  "frieren:strategist",
  "frieren:traitor"
 ],
 "aot": [
  "aot:leader",
  "aot:deputy",
  "aot:tanker",
  "aot:healer",
  "aot:strategist",
  "aot:traitor"
 ],
 "mha": [
  "mha:leader",
  "mha:deputy",
  "mha:tanker",
  "mha:healer",
  "mha:strategist",
  "mha:traitor"
 ],
 "hunterxhunter": [
  "hunterxhunter:leader",
  "hunterxhunter:deputy",
  "hunterxhunter:tanker",
  "hunterxhunter:healer",
  "hunterxhunter:strategist",
  "hunterxhunter:traitor"
 ],
 "fma": [
  "fma:leader",
  "fma:deputy",
  "fma:tanker",
  "fma:healer",
  "fma:strategist",
  "fma:traitor"
 ],
 "blackclover": [
  "blackclover:leader",
  "blackclover:deputy",
  "blackclover:tanker",
  "blackclover:healer",
  "blackclover:strategist",
  "blackclover:traitor"
 ],
 "onepunchman": [
  "onepunchman:leader",
  "onepunchman:deputy",
  "onepunchman:tanker",
  "onepunchman:healer",
  "onepunchman:strategist",
  "onepunchman:traitor"
 ],
 "dragonball": [
  "dragonball:leader",
  "dragonball:deputy",
  "dragonball:tanker",
  "dragonball:healer",
  "dragonball:strategist",
  "dragonball:traitor"
 ],
 "sao": [
  "sao:leader",
  "sao:deputy",
  "sao:tanker",
  "sao:healer",
  "sao:strategist",
  "sao:traitor"
 ],
 "jojo": [
  "jojo:leader",
  "jojo:deputy",
  "jojo:tanker",
  "jojo:healer",
  "jojo:strategist",
  "jojo:traitor"
 ],
 "fairytail": [
  "fairytail:leader",
  "fairytail:deputy",
  "fairytail:tanker",
  "fairytail:healer",
  "fairytail:strategist",
  "fairytail:traitor"
 ],
 "sololeveling": [
  "sololeveling:leader",
  "sololeveling:deputy",
  "sololeveling:tanker",
  "sololeveling:healer",
  "sololeveling:strategist",
  "sololeveling:traitor"
 ],
 "mobpsycho": [
  "mobpsycho:leader",
  "mobpsycho:deputy",
  "mobpsycho:tanker",
  "mobpsycho:healer",
  "mobpsycho:strategist",
  "mobpsycho:traitor"
 ],
 "tokyoghoul": [
  "tokyoghoul:leader",
  "tokyoghoul:deputy",
  "tokyoghoul:tanker",
  "tokyoghoul:healer",
  "tokyoghoul:strategist",
  "tokyoghoul:traitor"
 ],
 "dandadan": [
  "dandadan:leader",
  "dandadan:deputy",
  "dandadan:tanker",
  "dandadan:healer",
  "dandadan:strategist",
  "dandadan:traitor"
 ],
 "kaijuno8": [
  "kaijuno8:leader",
  "kaijuno8:deputy",
  "kaijuno8:tanker",
  "kaijuno8:healer",
  "kaijuno8:strategist",
  "kaijuno8:traitor"
 ],
 "fireforce": [
  "fireforce:leader",
  "fireforce:deputy",
  "fireforce:tanker",
  "fireforce:healer",
  "fireforce:strategist",
  "fireforce:traitor"
 ],
 "sevendeadlysins": [
  "sevendeadlysins:leader",
  "sevendeadlysins:deputy",
  "sevendeadlysins:tanker",
  "sevendeadlysins:healer",
  "sevendeadlysins:strategist",
  "sevendeadlysins:traitor"
 ],
 "tensura": [
  "tensura:leader",
  "tensura:deputy",
  "tensura:tanker",
  "tensura:healer",
  "tensura:strategist",
  "tensura:traitor"
 ],
 "rezero": [
  "rezero:leader",
  "rezero:deputy",
  "rezero:tanker",
  "rezero:healer",
  "rezero:strategist",
  "rezero:traitor"
 ],
 "deathnote": [
  "deathnote:leader",
  "deathnote:deputy",
  "deathnote:tanker",
  "deathnote:healer",
  "deathnote:strategist",
  "deathnote:traitor"
 ],
 "codegeass": [
  "codegeass:leader",
  "codegeass:deputy",
  "codegeass:tanker",
  "codegeass:healer",
  "codegeass:strategist",
  "codegeass:traitor"
 ]
};

export const ROLE_LABELS = {
 "Captain": {
  "zh": "船长",
  "ja": "船長"
 },
 "First Mate": {
  "zh": "副船长",
  "ja": "副船長"
 },
 "Tanker": {
  "zh": "肉盾",
  "ja": "タンク役"
 },
 "Doctor": {
  "zh": "船医",
  "ja": "船医"
 },
 "Navigator": {
  "zh": "航海士",
  "ja": "航海士"
 },
 "Traitor": {
  "zh": "内鬼",
  "ja": "裏切り者"
 },
 "Hokage": {
  "zh": "火影",
  "ja": "火影"
 },
 "Right Hand": {
  "zh": "副手",
  "ja": "右腕"
 },
 "Medical Ninja": {
  "zh": "医疗忍者",
  "ja": "医療忍者"
 },
 "Intelligence Ninja": {
  "zh": "情报忍者",
  "ja": "情報担当忍者"
 },
 "Rogue Ninja": {
  "zh": "叛忍",
  "ja": "抜け忍"
 },
 "Grade 1 Leader": {
  "zh": "一级术师队长",
  "ja": "一級術師リーダー"
 },
 "Second-in-Command": {
  "zh": "副手",
  "ja": "副隊長"
 },
 "Frontliner": {
  "zh": "前锋",
  "ja": "前衛"
 },
 "Reverse Cursed Healer": {
  "zh": "反转术式治疗手",
  "ja": "反転術式の治療役"
 },
 "Strategist": {
  "zh": "军师",
  "ja": "参謀"
 },
 "Curse User": {
  "zh": "诅咒师",
  "ja": "呪詛師"
 },
 "Lieutenant": {
  "zh": "副队长",
  "ja": "副隊長"
 },
 "Healer": {
  "zh": "治疗手",
  "ja": "回復役"
 },
 "Tactician": {
  "zh": "战术家",
  "ja": "戦術家"
 },
 "Defector": {
  "zh": "叛逃者",
  "ja": "離反者"
 },
 "Hashira Leader": {
  "zh": "柱级队长",
  "ja": "柱リーダー"
 },
 "Second Blade": {
  "zh": "副剑士",
  "ja": "第二剣士"
 },
 "Medic": {
  "zh": "医疗手",
  "ja": "治療役"
 },
 "Scout": {
  "zh": "侦察",
  "ja": "斥候"
 },
 "Demon Traitor": {
  "zh": "倒戈之鬼",
  "ja": "寝返った鬼"
 },
 "Leader": {
  "zh": "领队",
  "ja": "リーダー"
 },
 "Co-Leader": {
  "zh": "副领队",
  "ja": "副リーダー"
 },
 "onepiece:captain": {
  "en": "Captain",
  "zh": "船长",
  "ja": "船長"
 },
 "onepiece:firstmate": {
  "en": "First Mate",
  "zh": "副船长",
  "ja": "副船長"
 },
 "onepiece:tanker": {
  "en": "Shield Fighter",
  "zh": "肉盾战斗员",
  "ja": "盾役"
 },
 "onepiece:doctor": {
  "en": "Ship Doctor",
  "zh": "船医",
  "ja": "船医"
 },
 "onepiece:strategist": {
  "en": "Navigator / Strategist",
  "zh": "航海士／军师",
  "ja": "航海士／軍師"
 },
 "onepiece:traitor": {
  "en": "Crew Traitor",
  "zh": "海贼团内鬼",
  "ja": "一味の裏切り者"
 },
 "naruto:leader": {
  "en": "Hokage",
  "zh": "火影",
  "ja": "火影"
 },
 "naruto:deputy": {
  "en": "Hokage's Right Hand",
  "zh": "火影辅佐",
  "ja": "火影補佐"
 },
 "naruto:tanker": {
  "en": "Defense Ninja",
  "zh": "防御忍者",
  "ja": "防御忍"
 },
 "naruto:healer": {
  "en": "Medical Ninja",
  "zh": "医疗忍者",
  "ja": "医療忍者"
 },
 "naruto:strategist": {
  "en": "Intelligence Ninja",
  "zh": "情报忍者",
  "ja": "情報忍者"
 },
 "naruto:traitor": {
  "en": "Rogue Ninja",
  "zh": "叛忍",
  "ja": "抜け忍"
 },
 "jjk:leader": {
  "en": "Grade 1 Sorcerer Leader",
  "zh": "一级术师队长",
  "ja": "一級術師隊長"
 },
 "jjk:deputy": {
  "en": "Second-in-Command",
  "zh": "副队长",
  "ja": "副隊長"
 },
 "jjk:tanker": {
  "en": "Frontline Sorcerer",
  "zh": "前线术师",
  "ja": "前衛術師"
 },
 "jjk:healer": {
  "en": "Reverse Cursed Technique Healer",
  "zh": "反转术式治疗手",
  "ja": "反転術式治療役"
 },
 "jjk:strategist": {
  "en": "Jujutsu Strategist",
  "zh": "咒术军师",
  "ja": "呪術参謀"
 },
 "jjk:traitor": {
  "en": "Curse User",
  "zh": "诅咒师",
  "ja": "呪詛師"
 },
 "bleach:leader": {
  "en": "Squad Captain",
  "zh": "队长",
  "ja": "隊長"
 },
 "bleach:deputy": {
  "en": "Lieutenant",
  "zh": "副队长",
  "ja": "副隊長"
 },
 "bleach:tanker": {
  "en": "Frontline Soul Reaper",
  "zh": "前线死神",
  "ja": "前衛死神"
 },
 "bleach:healer": {
  "en": "Squad 4 Healer",
  "zh": "四番队治疗手",
  "ja": "四番隊治療役"
 },
 "bleach:strategist": {
  "en": "Soul Society Tactician",
  "zh": "尸魂界军师",
  "ja": "尸魂界軍師"
 },
 "bleach:traitor": {
  "en": "Defector",
  "zh": "叛逃者",
  "ja": "離反者"
 },
 "demonslayer:leader": {
  "en": "Hashira Leader",
  "zh": "柱级队长",
  "ja": "柱頭"
 },
 "demonslayer:deputy": {
  "en": "Tsuguko / Second Blade",
  "zh": "继子／副剑士",
  "ja": "継子／第二剣士"
 },
 "demonslayer:tanker": {
  "en": "Defense Swordsman",
  "zh": "防御剑士",
  "ja": "防御剣士"
 },
 "demonslayer:healer": {
  "en": "Butterfly Mansion Medic",
  "zh": "蝶屋医疗手",
  "ja": "蝶屋敷治療役"
 },
 "demonslayer:strategist": {
  "en": "Kakushi Scout",
  "zh": "隐部侦察",
  "ja": "隠・斥候"
 },
 "demonslayer:traitor": {
  "en": "Demon Turncoat",
  "zh": "倒戈之鬼",
  "ja": "鬼側の裏切り者"
 },
 "chainsawman:leader": {
  "en": "Public Safety Captain",
  "zh": "公安队长",
  "ja": "公安隊長"
 },
 "chainsawman:deputy": {
  "en": "Senior Devil Hunter",
  "zh": "资深恶魔猎人",
  "ja": "上級デビルハンター"
 },
 "chainsawman:tanker": {
  "en": "Fiend Vanguard",
  "zh": "魔人前锋",
  "ja": "魔人前衛"
 },
 "chainsawman:healer": {
  "en": "Field Support",
  "zh": "现场支援",
  "ja": "現場支援"
 },
 "chainsawman:strategist": {
  "en": "Devil Intelligence Officer",
  "zh": "恶魔情报员",
  "ja": "悪魔情報官"
 },
 "chainsawman:traitor": {
  "en": "Contract Betrayer",
  "zh": "契约背叛者",
  "ja": "契約裏切り者"
 },
 "spyfamily:leader": {
  "en": "WISE Handler",
  "zh": "WISE 管理官",
  "ja": "WISE 管理官"
 },
 "spyfamily:deputy": {
  "en": "Lead Agent",
  "zh": "首席特工",
  "ja": "主任諜報員"
 },
 "spyfamily:tanker": {
  "en": "Close Protection",
  "zh": "近身护卫",
  "ja": "近接護衛"
 },
 "spyfamily:healer": {
  "en": "Field Support",
  "zh": "现场支援",
  "ja": "現場支援"
 },
 "spyfamily:strategist": {
  "en": "Intelligence Analyst",
  "zh": "情报分析员",
  "ja": "情報分析官"
 },
 "spyfamily:traitor": {
  "en": "Double Agent",
  "zh": "双面间谍",
  "ja": "二重スパイ"
 },
 "frieren:leader": {
  "en": "Hero Party Leader",
  "zh": "勇者队伍领队",
  "ja": "勇者一行の隊長"
 },
 "frieren:deputy": {
  "en": "Vanguard Warrior",
  "zh": "前卫战士",
  "ja": "前衛戦士"
 },
 "frieren:tanker": {
  "en": "Defensive Mage",
  "zh": "防御魔法使",
  "ja": "防御魔法使い"
 },
 "frieren:healer": {
  "en": "Priest",
  "zh": "僧侣",
  "ja": "僧侶"
 },
 "frieren:strategist": {
  "en": "Tactical Mage",
  "zh": "战术魔法使",
  "ja": "戦術魔法使い"
 },
 "frieren:traitor": {
  "en": "Party Betrayer",
  "zh": "队伍叛徒",
  "ja": "一行の裏切り者"
 },
 "aot:leader": {
  "en": "Survey Corps Commander",
  "zh": "调查兵团团长",
  "ja": "調査兵団団長"
 },
 "aot:deputy": {
  "en": "Squad Captain",
  "zh": "分队长",
  "ja": "分隊長"
 },
 "aot:tanker": {
  "en": "Armored Vanguard",
  "zh": "装甲前锋",
  "ja": "装甲前衛"
 },
 "aot:healer": {
  "en": "Combat Medic",
  "zh": "战地医疗兵",
  "ja": "戦闘衛生兵"
 },
 "aot:strategist": {
  "en": "Scout Strategist",
  "zh": "侦察军师",
  "ja": "偵察参謀"
 },
 "aot:traitor": {
  "en": "Turncoat",
  "zh": "倒戈者",
  "ja": "寝返り者"
 },
 "mha:leader": {
  "en": "Pro Hero Leader",
  "zh": "职业英雄队长",
  "ja": "プロヒーロー隊長"
 },
 "mha:deputy": {
  "en": "Sidekick",
  "zh": "副手英雄",
  "ja": "サイドキック"
 },
 "mha:tanker": {
  "en": "Defense Hero",
  "zh": "防御型英雄",
  "ja": "防御ヒーロー"
 },
 "mha:healer": {
  "en": "Rescue Hero",
  "zh": "救援型英雄",
  "ja": "救助ヒーロー"
 },
 "mha:strategist": {
  "en": "Tactical Hero",
  "zh": "战术型英雄",
  "ja": "戦術ヒーロー"
 },
 "mha:traitor": {
  "en": "Villain Informant",
  "zh": "敌方内应",
  "ja": "敵側の内通者"
 },
 "hunterxhunter:leader": {
  "en": "Hunter Leader",
  "zh": "猎人领队",
  "ja": "ハンター隊長"
 },
 "hunterxhunter:deputy": {
  "en": "Deputy Hunter",
  "zh": "副领队猎人",
  "ja": "副隊長ハンター"
 },
 "hunterxhunter:tanker": {
  "en": "Enhancer Vanguard",
  "zh": "强化系前锋",
  "ja": "強化系前衛"
 },
 "hunterxhunter:healer": {
  "en": "Support Hunter",
  "zh": "支援猎人",
  "ja": "支援ハンター"
 },
 "hunterxhunter:strategist": {
  "en": "Nen Strategist",
  "zh": "念能力军师",
  "ja": "念能力参謀"
 },
 "hunterxhunter:traitor": {
  "en": "Double-Crosser",
  "zh": "背叛者",
  "ja": "裏切り者"
 },
 "fma:leader": {
  "en": "Commanding Officer",
  "zh": "指挥官",
  "ja": "司令官"
 },
 "fma:deputy": {
  "en": "Adjutant",
  "zh": "副官",
  "ja": "副官"
 },
 "fma:tanker": {
  "en": "Heavy Combatant",
  "zh": "重装战斗员",
  "ja": "重戦闘員"
 },
 "fma:healer": {
  "en": "Medical Alchemist",
  "zh": "医疗炼金术师",
  "ja": "医療錬金術師"
 },
 "fma:strategist": {
  "en": "State Alchemist Strategist",
  "zh": "国家炼金术军师",
  "ja": "国家錬金術参謀"
 },
 "fma:traitor": {
  "en": "Homunculus Agent",
  "zh": "人造人内应",
  "ja": "ホムンクルスの内通者"
 },
 "blackclover:leader": {
  "en": "Magic Knight Captain",
  "zh": "魔法骑士团长",
  "ja": "魔法騎士団長"
 },
 "blackclover:deputy": {
  "en": "Vice-Captain",
  "zh": "副团长",
  "ja": "副団長"
 },
 "blackclover:tanker": {
  "en": "Defense Mage",
  "zh": "防御魔导士",
  "ja": "防御魔導士"
 },
 "blackclover:healer": {
  "en": "Healing Mage",
  "zh": "恢复魔导士",
  "ja": "回復魔導士"
 },
 "blackclover:strategist": {
  "en": "Arcane Strategist",
  "zh": "冥域军师",
  "ja": "冥域参謀"
 },
 "blackclover:traitor": {
  "en": "Devil Host Turncoat",
  "zh": "恶魔附身叛徒",
  "ja": "悪魔憑きの裏切り者"
 },
 "onepunchman:leader": {
  "en": "S-Class Leader",
  "zh": "S级英雄队长",
  "ja": "S級ヒーロー隊長"
 },
 "onepunchman:deputy": {
  "en": "Assault Hero",
  "zh": "突击英雄",
  "ja": "強襲ヒーロー"
 },
 "onepunchman:tanker": {
  "en": "Defense Hero",
  "zh": "防御英雄",
  "ja": "防御ヒーロー"
 },
 "onepunchman:healer": {
  "en": "Support Hero",
  "zh": "支援英雄",
  "ja": "支援ヒーロー"
 },
 "onepunchman:strategist": {
  "en": "Tactical Hero",
  "zh": "战术英雄",
  "ja": "戦術ヒーロー"
 },
 "onepunchman:traitor": {
  "en": "Monster Turncoat",
  "zh": "怪人内鬼",
  "ja": "怪人側の裏切り者"
 },
 "dragonball:leader": {
  "en": "Z Fighter Leader",
  "zh": "Z战士领队",
  "ja": "Z戦士隊長"
 },
 "dragonball:deputy": {
  "en": "Second Fighter",
  "zh": "副战士",
  "ja": "副戦士"
 },
 "dragonball:tanker": {
  "en": "Powerhouse",
  "zh": "力量担当",
  "ja": "剛力担当"
 },
 "dragonball:healer": {
  "en": "Senzu Support",
  "zh": "仙豆支援",
  "ja": "仙豆支援"
 },
 "dragonball:strategist": {
  "en": "Battle Tactician",
  "zh": "战斗军师",
  "ja": "戦闘参謀"
 },
 "dragonball:traitor": {
  "en": "Enemy Turncoat",
  "zh": "敌方倒戈者",
  "ja": "敵側の寝返り者"
 },
 "sao:leader": {
  "en": "Party Leader",
  "zh": "队伍领队",
  "ja": "パーティーリーダー"
 },
 "sao:deputy": {
  "en": "Sub-Leader",
  "zh": "副领队",
  "ja": "副隊長"
 },
 "sao:tanker": {
  "en": "Tank",
  "zh": "坦克",
  "ja": "タンク"
 },
 "sao:healer": {
  "en": "Healer",
  "zh": "治疗师",
  "ja": "回復役"
 },
 "sao:strategist": {
  "en": "Scout",
  "zh": "侦察员",
  "ja": "斥候"
 },
 "sao:traitor": {
  "en": "Red Player",
  "zh": "红名玩家",
  "ja": "レッドプレイヤー"
 },
 "jojo:leader": {
  "en": "Joestar Leader",
  "zh": "乔斯达领队",
  "ja": "ジョースター隊長"
 },
 "jojo:deputy": {
  "en": "Stand Partner",
  "zh": "替身搭档",
  "ja": "スタンド相棒"
 },
 "jojo:tanker": {
  "en": "Close-Range Stand User",
  "zh": "近距离替身使者",
  "ja": "近距離型スタンド使い"
 },
 "jojo:healer": {
  "en": "Support Stand User",
  "zh": "支援型替身使者",
  "ja": "支援型スタンド使い"
 },
 "jojo:strategist": {
  "en": "Stand Strategist",
  "zh": "替身军师",
  "ja": "スタンド参謀"
 },
 "jojo:traitor": {
  "en": "Enemy Stand User",
  "zh": "敌方替身使者",
  "ja": "敵側スタンド使い"
 },
 "fairytail:leader": {
  "en": "Guild Master",
  "zh": "公会会长",
  "ja": "ギルドマスター"
 },
 "fairytail:deputy": {
  "en": "S-Class Partner",
  "zh": "S级搭档",
  "ja": "S級魔導士の相棒"
 },
 "fairytail:tanker": {
  "en": "Frontline Mage",
  "zh": "前线魔导士",
  "ja": "前衛魔導士"
 },
 "fairytail:healer": {
  "en": "Healing Mage",
  "zh": "治愈魔导士",
  "ja": "治癒魔導士"
 },
 "fairytail:strategist": {
  "en": "Tactical Mage",
  "zh": "战术魔导士",
  "ja": "戦術魔導士"
 },
 "fairytail:traitor": {
  "en": "Dark Guild Defector",
  "zh": "黑暗公会叛徒",
  "ja": "闇ギルドの離反者"
 },
 "sololeveling:leader": {
  "en": "Guild Master",
  "zh": "公会会长",
  "ja": "ギルドマスター"
 },
 "sololeveling:deputy": {
  "en": "Vice Master",
  "zh": "副会长",
  "ja": "副マスター"
 },
 "sololeveling:tanker": {
  "en": "Tanker",
  "zh": "坦克",
  "ja": "タンク"
 },
 "sololeveling:healer": {
  "en": "Healer",
  "zh": "治疗师",
  "ja": "ヒーラー"
 },
 "sololeveling:strategist": {
  "en": "Ranger / Strategist",
  "zh": "远程／军师",
  "ja": "レンジャー／参謀"
 },
 "sololeveling:traitor": {
  "en": "Monarch's Agent",
  "zh": "君主内应",
  "ja": "君主の内通者"
 },
 "mobpsycho:leader": {
  "en": "Psychic Leader",
  "zh": "超能力者领队",
  "ja": "超能力者隊長"
 },
 "mobpsycho:deputy": {
  "en": "Partner",
  "zh": "搭档",
  "ja": "相棒"
 },
 "mobpsycho:tanker": {
  "en": "Barrier Specialist",
  "zh": "结界专家",
  "ja": "結界使い"
 },
 "mobpsycho:healer": {
  "en": "Support Esper",
  "zh": "支援型超能力者",
  "ja": "支援エスパー"
 },
 "mobpsycho:strategist": {
  "en": "Psychic Strategist",
  "zh": "超能力军师",
  "ja": "超能力参謀"
 },
 "mobpsycho:traitor": {
  "en": "Claw Defector",
  "zh": "爪组织叛徒",
  "ja": "爪の離反者"
 },
 "tokyoghoul:leader": {
  "en": "Ward Commander",
  "zh": "区队指挥官",
  "ja": "区隊指揮官"
 },
 "tokyoghoul:deputy": {
  "en": "Deputy Investigator",
  "zh": "副搜查官",
  "ja": "副捜査官"
 },
 "tokyoghoul:tanker": {
  "en": "Kakuja Vanguard",
  "zh": "赫者前锋",
  "ja": "赫者前衛"
 },
 "tokyoghoul:healer": {
  "en": "Field Medic",
  "zh": "现场医疗员",
  "ja": "現場衛生員"
 },
 "tokyoghoul:strategist": {
  "en": "Intelligence Officer",
  "zh": "情报官",
  "ja": "情報官"
 },
 "tokyoghoul:traitor": {
  "en": "Double Agent",
  "zh": "双面间谍",
  "ja": "二重スパイ"
 },
 "dandadan:leader": {
  "en": "Occult Leader",
  "zh": "灵异领队",
  "ja": "怪異対策隊長"
 },
 "dandadan:deputy": {
  "en": "Partner",
  "zh": "搭档",
  "ja": "相棒"
 },
 "dandadan:tanker": {
  "en": "Frontline Fighter",
  "zh": "前线战斗员",
  "ja": "前衛戦闘員"
 },
 "dandadan:healer": {
  "en": "Spiritual Support",
  "zh": "灵力支援",
  "ja": "霊力支援"
 },
 "dandadan:strategist": {
  "en": "Occult Strategist",
  "zh": "灵异军师",
  "ja": "怪異参謀"
 },
 "dandadan:traitor": {
  "en": "Possessed Traitor",
  "zh": "附身叛徒",
  "ja": "憑依された裏切り者"
 },
 "kaijuno8:leader": {
  "en": "Defense Force Captain",
  "zh": "防卫队长",
  "ja": "防衛隊長"
 },
 "kaijuno8:deputy": {
  "en": "Vice-Captain",
  "zh": "副队长",
  "ja": "副隊長"
 },
 "kaijuno8:tanker": {
  "en": "Numbers Vanguard",
  "zh": "识别怪兽兵器前锋",
  "ja": "識別怪獣兵器前衛"
 },
 "kaijuno8:healer": {
  "en": "Field Medic",
  "zh": "战地医疗员",
  "ja": "戦地衛生員"
 },
 "kaijuno8:strategist": {
  "en": "Operations Officer",
  "zh": "作战参谋",
  "ja": "作戦参謀"
 },
 "kaijuno8:traitor": {
  "en": "Kaiju Turncoat",
  "zh": "怪兽内鬼",
  "ja": "怪獣側の裏切り者"
 },
 "fireforce:leader": {
  "en": "Company Captain",
  "zh": "大队长",
  "ja": "大隊長"
 },
 "fireforce:deputy": {
  "en": "Lieutenant",
  "zh": "中队长",
  "ja": "中隊長"
 },
 "fireforce:tanker": {
  "en": "Frontline Fire Soldier",
  "zh": "前线消防官",
  "ja": "前衛消防官"
 },
 "fireforce:healer": {
  "en": "Sister / Medic",
  "zh": "修女／医疗手",
  "ja": "シスター／治療役"
 },
 "fireforce:strategist": {
  "en": "Science Officer",
  "zh": "科学官",
  "ja": "科学捜査官"
 },
 "fireforce:traitor": {
  "en": "White-Clad Defector",
  "zh": "白衣人叛徒",
  "ja": "白装束の離反者"
 },
 "sevendeadlysins:leader": {
  "en": "Sins Captain",
  "zh": "七大罪团长",
  "ja": "七つの大罪団長"
 },
 "sevendeadlysins:deputy": {
  "en": "Holy Knight Champion",
  "zh": "圣骑士精英",
  "ja": "聖騎士の精鋭"
 },
 "sevendeadlysins:tanker": {
  "en": "Giant Vanguard",
  "zh": "巨人族前锋",
  "ja": "巨人族の前衛"
 },
 "sevendeadlysins:healer": {
  "en": "Druid Healer",
  "zh": "德鲁伊治疗者",
  "ja": "ドルイドの治癒役"
 },
 "sevendeadlysins:strategist": {
  "en": "Grand Magician",
  "zh": "大魔术师",
  "ja": "大魔術士"
 },
 "sevendeadlysins:traitor": {
  "en": "Ten Commandments Spy",
  "zh": "十戒内应",
  "ja": "十戒の内通者"
 },
 "tensura:leader": {
  "en": "Demon Lord",
  "zh": "魔王",
  "ja": "魔王"
 },
 "tensura:deputy": {
  "en": "Samurai General",
  "zh": "侍大将",
  "ja": "侍大将"
 },
 "tensura:tanker": {
  "en": "Royal Guard",
  "zh": "近卫",
  "ja": "近衛"
 },
 "tensura:healer": {
  "en": "Shrine Maiden Healer",
  "zh": "巫女治疗师",
  "ja": "巫女の治癒役"
 },
 "tensura:strategist": {
  "en": "Chief Strategist",
  "zh": "军师",
  "ja": "軍師"
 },
 "tensura:traitor": {
  "en": "Rival Lord's Spy",
  "zh": "敌对魔王的间谍",
  "ja": "敵対魔王の間者"
 },
 "rezero:leader": {
  "en": "Royal Candidate",
  "zh": "王选候补者",
  "ja": "王選候補者"
 },
 "rezero:deputy": {
  "en": "Sworn Knight",
  "zh": "誓约骑士",
  "ja": "誓いの騎士"
 },
 "rezero:tanker": {
  "en": "Vanguard",
  "zh": "前锋",
  "ja": "前衛"
 },
 "rezero:healer": {
  "en": "Healer",
  "zh": "治疗术士",
  "ja": "治癒術師"
 },
 "rezero:strategist": {
  "en": "Strategist",
  "zh": "军师",
  "ja": "参謀"
 },
 "rezero:traitor": {
  "en": "Witch Cult Archbishop",
  "zh": "魔女教大罪司教",
  "ja": "魔女教大罪司教"
 },
 "deathnote:leader": {
  "en": "Task Force Chief",
  "zh": "搜查本部部长",
  "ja": "捜査本部長"
 },
 "deathnote:deputy": {
  "en": "Lead Detective",
  "zh": "首席侦探",
  "ja": "主任探偵"
 },
 "deathnote:tanker": {
  "en": "Bodyguard",
  "zh": "保镖",
  "ja": "ボディガード"
 },
 "deathnote:healer": {
  "en": "Field Support",
  "zh": "后方支援",
  "ja": "後方支援"
 },
 "deathnote:strategist": {
  "en": "Mastermind",
  "zh": "幕后军师",
  "ja": "黒幕の頭脳"
 },
 "deathnote:traitor": {
  "en": "Kira Sympathizer",
  "zh": "奇拉信徒",
  "ja": "キラ信者"
 },
 "codegeass:leader": {
  "en": "Commander",
  "zh": "总司令",
  "ja": "総司令"
 },
 "codegeass:deputy": {
  "en": "Knight of Zero",
  "zh": "零之骑士",
  "ja": "ゼロの騎士"
 },
 "codegeass:tanker": {
  "en": "Knightmare Ace",
  "zh": "王牌骑士机驾驶员",
  "ja": "ナイトメアのエース"
 },
 "codegeass:healer": {
  "en": "Field Engineer",
  "zh": "后勤技术员",
  "ja": "整備技術者"
 },
 "codegeass:strategist": {
  "en": "Tactician",
  "zh": "战术参谋",
  "ja": "戦術参謀"
 },
 "codegeass:traitor": {
  "en": "Double Agent",
  "zh": "双面间谍",
  "ja": "二重スパイ"
 }
};

// Budget PK prices are computed from the ratings (see characterPrice in core/roster.js).
// Pin a price here only when a rating can't capture it: { "series-name": 25, "series-name:formKey": 30 }.
export const PRICE_OVERRIDES = {};

export const BATTLEFIELDS = {
 "onepiece": {
  "en": "Marineford's shattered bay beneath storm clouds, with broken warships, frozen waves and the execution plaza behind the fighters.",
  "zh": "暴风云下破碎的马林梵多海湾，断裂军舰与冻结海浪环绕，处刑台位于战场后方。",
  "ja": "嵐雲に覆われた崩壊後のマリンフォード湾。砕けた軍艦と凍結した海面、その奥に処刑台がそびえる。"
 },
 "naruto": {
  "en": "The Valley of the End, with both colossal statues damaged by chakra shockwaves and the river splitting the battlefield.",
  "zh": "终结之谷，两尊巨大石像被查克拉冲击震裂，河流从战场中央穿过。",
  "ja": "終末の谷。二体の巨像はチャクラの衝撃で損傷し、中央を川が貫いている。"
 },
 "jjk": {
  "en": "Shibuya Crossing at midnight inside layered Cursed Technique curtains, with shattered signs and cursed energy flooding the streets.",
  "zh": "午夜的涩谷十字路口被多层帐覆盖，破碎招牌与咒力充斥街道。",
  "ja": "深夜の渋谷スクランブル交差点。幾重もの帳に覆われ、砕けた看板と呪力が街路を満たす。"
 },
 "bleach": {
  "en": "The Seireitei after an invasion, with damaged white walls, spirit-particle debris and the Sokyoku hill visible beyond.",
  "zh": "遭到入侵后的瀞灵廷，白墙残破、灵子碎屑飘散，远处可见双殛之丘。",
  "ja": "侵攻を受けた瀞霊廷。白壁は崩れ、霊子の瓦礫が舞い、遠方に双殛の丘が見える。"
 },
 "demonslayer": {
  "en": "The shifting Infinity Castle, where impossible rooms, stairways and biwa-controlled platforms form separate combat stages.",
  "zh": "不断变换的无限城，不可能的房间、阶梯与琵琶操控的平台组成多个独立战区。",
  "ja": "絶えず変形する無限城。あり得ない部屋と階段、琵琶で操られる足場が個別の戦場を作る。"
 },
 "chainsawman": {
  "en": "A devastated Tokyo government district after a devil attack, with overturned vehicles, emergency lights and immense devil scars.",
  "zh": "恶魔袭击后的东京政府区，车辆翻覆、警灯闪烁，巨大恶魔留下的痕迹横贯街区。",
  "ja": "悪魔襲撃後の東京官庁街。横転車両と非常灯、巨大な悪魔の爪痕が区画を横切る。"
 },
 "spyfamily": {
  "en": "A grand Ostania embassy complex during a covert crisis, with formal halls opening into a moonlit courtyard.",
  "zh": "秘密危机中的奥斯塔尼亚大使馆，庄严大厅连接着月光下的中庭。",
  "ja": "極秘危機下のオスタニア大使館。格式ある大広間が月明かりの中庭へ続く。"
 },
 "frieren": {
  "en": "Ancient elven ruins at dawn, covered in glowing spell circles, weathered statues and fields of blue flowers.",
  "zh": "黎明中的古代精灵遗迹，发光魔法阵、风化石像与蓝色花田遍布战场。",
  "ja": "夜明けの古代エルフ遺跡。発光する魔法陣、風化した石像、青い花畑が広がる。"
 },
 "aot": {
  "en": "Ruined Shiganshina between the inner wall and the breached gate, with rooftops, ODM anchor points and titan footprints.",
  "zh": "城墙与破损大门之间的希干希纳废墟，屋顶、立体机动锚点与巨人脚印遍布其中。",
  "ja": "内壁と破壊された門の間に広がるシガンシナ区跡。屋根、立体機動の固定点、巨人の足跡が残る。"
 },
 "mha": {
  "en": "Kamino Ward after evacuation, with collapsed hero billboards, rescue corridors and fire-lit city blocks.",
  "zh": "疏散后的神野区，英雄广告牌倒塌，救援通道与燃烧街区交错。",
  "ja": "避難後の神野区。崩れたヒーロー看板、救助通路、炎に照らされた街区が交差する。"
 },
 "hunterxhunter": {
  "en": "Heavens Arena's highest battle floor, expanded into a vast Nen-proof colosseum with shattered tiles and aura barriers.",
  "zh": "天空竞技场最高层被扩展成大型念能力斗技场，地砖破裂，念气屏障包围四周。",
  "ja": "天空闘技場の最上階。念能力対応の巨大闘技場へ拡張され、砕けた床とオーラ障壁が囲む。"
 },
 "fma": {
  "en": "Central Command's plaza during a nationwide transmutation event, with military stonework split by a glowing alchemy circle.",
  "zh": "全国炼成发动时的中央司令部广场，军事建筑被发光炼成阵割裂。",
  "ja": "国土錬成陣発動中の中央司令部広場。軍施設の石床を発光する錬成陣が切り裂く。"
 },
 "blackclover": {
  "en": "The Clover Kingdom capital beneath a torn magic barrier, with castle towers and floating grimoires surrounding the battlefield.",
  "zh": "魔法屏障破裂的四叶草王国王都，城堡高塔与漂浮魔导书环绕战场。",
  "ja": "魔法障壁が裂けたクローバー王国王都。城塔と浮遊する魔導書が戦場を囲む。"
 },
 "onepunchman": {
  "en": "The ruins of City Z beside the Monster Association crater, with abandoned towers and an enormous impact basin.",
  "zh": "怪人协会巨坑旁的Z市废墟，废弃高楼与巨大冲击坑构成战场。",
  "ja": "怪人協会の大穴に面したZ市跡。無人の高層建築と巨大な衝突孔が戦場となる。"
 },
 "dragonball": {
  "en": "A vast Dragon Ball rocky wasteland with mesas, impact craters and distant mountains under a sky distorted by ki.",
  "zh": "辽阔的龙珠式岩石荒原，台地、冲击坑与远山笼罩在被气扭曲的天空下。",
  "ja": "広大な岩山荒野。台地、衝突跡、遠い山々の上空が気によって歪んでいる。"
 },
 "sao": {
  "en": "A high Aincrad floor combining a floating castle courtyard, raid-gate ruins and the abyss visible beyond the edge.",
  "zh": "艾恩葛朗特高层，将浮空城庭院与攻略门遗迹连接，边缘外可见无底深渊。",
  "ja": "アインクラッド上層。浮遊城の中庭と攻略門跡がつながり、縁の先に深淵が見える。"
 },
 "jojo": {
  "en": "Cairo at night near DIO's mansion, with moonlit alleys, stopped clocks and Stand energy warping the streets.",
  "zh": "DIO宅邸附近的开罗夜街，月光巷道、停止的时钟与替身能量扭曲街景。",
  "ja": "DIOの館に近い夜のカイロ。月明かりの路地、止まった時計、スタンドの力で歪む街路。"
 },
 "fairytail": {
  "en": "Magnolia's guild plaza after a magical assault, with Fairy Tail's hall, canal bridges and spell circles overhead.",
  "zh": "魔法袭击后的马格诺利亚公会广场，妖精尾巴会馆、运河桥梁与空中魔法阵同场出现。",
  "ja": "魔法攻撃後のマグノリア・ギルド広場。妖精の尻尾の会館、運河橋、上空の魔法陣が並ぶ。"
 },
 "sololeveling": {
  "en": "A red-gate dungeon mixing an ice cavern and ruined temple, with shadow soldiers emerging from black portals.",
  "zh": "融合冰窟与残破神殿的红门副本，暗影士兵从黑色传送门中现身。",
  "ja": "氷洞と崩壊神殿が混ざるレッドゲート。黒い門から影の兵士が現れる。"
 },
 "mobpsycho": {
  "en": "Seasoning City under a psychic storm, with buildings levitating, roads folding upward and colorful aura rings in the sky.",
  "zh": "超能力风暴下的调味市，建筑悬浮、道路向上折叠，天空布满彩色灵能光环。",
  "ja": "超能力嵐に包まれた調味市。建物が浮遊し、道路が空へ折れ曲がり、色彩豊かなオーラが広がる。"
 },
 "tokyoghoul": {
  "en": "Tokyo's 20th Ward at night, with Anteiku's street, CCG searchlights and kagune marks across rain-soaked rooftops.",
  "zh": "雨夜的东京20区，安定区街道、CCG探照灯与赫子痕迹遍布屋顶。",
  "ja": "雨の東京20区。あんていく周辺、CCGの探照灯、濡れた屋根に残る赫子の痕跡。"
 },
 "dandadan": {
  "en": "A haunted school and torii-lined neighborhood fused by an alien dimension, with yokai mist and UFO light overhead.",
  "zh": "被外星维度融合的灵异学校与鸟居街区，妖怪雾气弥漫，头顶照下UFO光束。",
  "ja": "異星空間に融合した怪異学校と鳥居の街。妖怪の霧が漂い、上空からUFOの光が差す。"
 },
 "kaijuno8": {
  "en": "Tachikawa Base during a kaiju breach, with defense-force barricades, numbered weapons and a colossal kaiju silhouette.",
  "zh": "怪兽突破时的立川基地，防卫队路障、识别怪兽兵器与巨大怪兽剪影同场出现。",
  "ja": "怪獣侵入時の立川基地。防衛隊の障害物、識別怪獣兵器、巨大怪獣の影が並ぶ。"
 },
 "fireforce": {
  "en": "The Tokyo Empire's industrial district during an Adolla flare, with cathedral engines, rail lines and blue-black flames.",
  "zh": "安德拉爆发时的东京皇国工业区，教会式引擎、铁路与蓝黑火焰交织。",
  "ja": "アドラの炎が噴き出す東京皇国工業区。聖堂型機関、鉄路、青黒い炎が交錯する。"
 },
 "sevendeadlysins": {
  "en": "Camelot's ruined capital beneath a blood-red sky, with the Ten Commandments' dark pillars rising and the Boar Hat tavern toppled nearby.",
  "zh": "血红天空下崩毁的卡美洛王都，十戒的黑暗巨柱林立，豚之帽亭倒塌在一旁。",
  "ja": "血のように赤い空の下、崩壊したキャメロット王都。十戒の黒い柱がそびえ、豚の帽子亭が倒れている。"
 },
 "tensura": {
  "en": "The Tempest capital during a demon lord invasion, with goblin streets, layered magic barriers and the Forest of Jura beyond the walls.",
  "zh": "魔王入侵中的魔物之国坦派斯特首都，哥布林街道与多重魔法结界，城墙外是朱拉大森林。",
  "ja": "魔王の侵攻を受けるテンペストの首都。ゴブリンの街並みと幾重もの魔法結界、城壁の外にはジュラの大森林。"
 },
 "rezero": {
  "en": "The Roswaal mansion and its forest at night during a Witch Cult assault, with the Sanctuary's tomb glowing in the distance.",
  "zh": "魔女教夜袭中的罗兹瓦尔宅邸与周边森林，远处圣域的墓所散发微光。",
  "ja": "魔女教の夜襲を受けるロズワール邸と周囲の森。遠くに聖域の墓所が淡く光る。"
 },
 "deathnote": {
  "en": "The Kira task-force headquarters in Tokyo at night, with walls of surveillance screens, rain-slicked rooftops and the Yellow Box warehouse below.",
  "zh": "夜晚东京的奇拉搜查本部，满墙监控屏幕，雨湿的天台与下方的黄色仓库。",
  "ja": "夜の東京、キラ捜査本部。壁一面の監視モニター、雨に濡れた屋上、眼下にはYB倉庫。"
 },
 "codegeass": {
  "en": "The Tokyo Settlement during the Black Rebellion, with Knightmare Frames clashing in the streets, Ashford Academy nearby and Britannian airships overhead.",
  "zh": "黑色叛乱中的东京租界，骑士机在街头激战，阿什弗德学园就在附近，布里塔尼亚浮游舰掠过天际。",
  "ja": "ブラックリベリオン中のトウキョウ租界。街路でナイトメアフレームが激突し、アッシュフォード学園の上空をブリタニアの浮遊航空艦が飛ぶ。"
 }
};
