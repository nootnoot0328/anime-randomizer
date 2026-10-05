#!/usr/bin/env python3
"""v1.3 roster expansion: 5 new series + headliners for existing series.

One row per character:
  (slug, English (AniList spelling), Japanese, Chinese, gender, power, lead, tank, heal, intel, price)
gender: "male" / "female" / None (unspecified). price: None = default $15.
Ratings follow src/data/attributes.js (0-10). Run once from the repo root:
  python3 scripts/roster-additions-v1.3.py
It is idempotent: characters/series that already exist are skipped.
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
M, F, N = "male", "female", None

NEW_SERIES = [
  {
    "id": "sevendeadlysins", "name_en": "The Seven Deadly Sins", "name_ja": "七つの大罪", "name_zh": "七大罪",
    "anilistSearch": ["Nanatsu no Taizai", "Nanatsu no Taizai: Imashime no Fukkatsu", "Nanatsu no Taizai: Kamigami no Gekirin", "Nanatsu no Taizai: Fundo no Shinpan"],
    "roles": [("leader", "Sins Captain", "七大罪团长", "七つの大罪団長"), ("deputy", "Holy Knight Champion", "圣骑士精英", "聖騎士の精鋭"),
              ("tanker", "Giant Vanguard", "巨人族前锋", "巨人族の前衛"), ("healer", "Druid Healer", "德鲁伊治疗者", "ドルイドの治癒役"),
              ("strategist", "Grand Magician", "大魔术师", "大魔術士"), ("traitor", "Ten Commandments Spy", "十戒内应", "十戒の内通者")],
    "battlefield": ("Camelot's ruined capital beneath a blood-red sky, with the Ten Commandments' dark pillars rising and the Boar Hat tavern toppled nearby.",
                    "血红天空下崩毁的卡美洛王都，十戒的黑暗巨柱林立，豚之帽亭倒塌在一旁。",
                    "血のように赤い空の下、崩壊したキャメロット王都。十戒の黒い柱がそびえ、豚の帽子亭が倒れている。"),
    "chars": [
      ("meliodas", "Meliodas", "メリオダス", "梅利奥达斯", M, 9.5, 9, 8, 0, 7, 30),
      ("elizabeth-liones", "Elizabeth Liones", "エリザベス・リオネス", "伊丽莎白·利奥涅斯", F, 5, 6, 3, 10, 5, None),
      ("hawk", "Hawk", "ホーク", "霍克", M, 2, 4, 6, 0, 3, 10),
      ("diane", "Diane", "ディアンヌ", "黛安", F, 8, 5, 9, 1, 4, None),
      ("ban", "Ban", "バン", "班", M, 8.5, 5, 10, 3, 5, 25),
      ("king", "King", "キング", "金", M, 8.5, 6, 6, 3, 6, None),
      ("gowther", "Gowther", "ゴウセル", "高瑟", M, 7.5, 4, 5, 3, 9, None),
      ("merlin", "Merlin", "マーリン", "梅林", F, 9, 7, 6, 6, 10, 25),
      ("escanor", "Escanor", "エスカノール", "埃斯卡诺", M, 9.5, 7, 8, 0, 4, 30),
      ("gilthunder", "Gilthunder", "ギルサンダー", "吉尔桑达", M, 7, 6, 5, 0, 5, None),
      ("howzer", "Howzer", "ハウザー", "豪泽", M, 6.5, 5, 5, 0, 4, None),
      ("griamore", "Griamore", "グリアモール", "格里亚莫尔", M, 6, 4, 9, 0, 3, None),
      ("hendrickson", "Hendrickson", "ヘンドリクセン", "亨德里克森", M, 7.5, 6, 6, 0, 7, None),
      ("dreyfus", "Dreyfus", "ドレファス", "德雷福斯", M, 7.5, 7, 6, 0, 5, None),
      ("zeldris", "Zeldris", "ゼルドリス", "赛尔德利斯", M, 9, 8, 8, 0, 7, 25),
      ("estarossa", "Estarossa", "エスタロッサ", "艾斯塔罗萨", M, 9, 6, 8, 0, 6, 25),
      ("derieri", "Derieri", "デリエリ", "德莉艾莉", F, 8, 4, 7, 0, 3, None),
      ("monspeet", "Monspeet", "モンスピート", "蒙斯皮特", M, 8, 5, 6, 0, 8, None),
      ("galand", "Galand", "ガラン", "加兰", M, 8, 4, 9, 0, 3, None),
      ("melascula", "Melascula", "メラスキュラ", "梅拉丝丘拉", F, 7.5, 4, 6, 0, 6, None),
      ("grayroad", "Grayroad", "グレイロード", "格雷罗德", N, 7.5, 3, 8, 0, 6, None),
      ("fraudrin", "Fraudrin", "フラウドリン", "弗劳德林", M, 8, 5, 7, 0, 7, None),
      ("gloxinia", "Gloxinia", "グロキシニア", "格洛克西尼亚", M, 8, 6, 6, 4, 6, None),
      ("drole", "Drole", "ドロール", "德罗尔", M, 8, 6, 9, 0, 5, None),
      ("chandler", "Chandler", "チャンドラー", "钱德勒", M, 8.5, 4, 7, 0, 7, None),
      ("cusack", "Cusack", "キューザック", "丘萨克", M, 8.5, 5, 6, 0, 7, None),
      ("arthur-pendragon", "Arthur Pendragon", "アーサー・ペンドラゴン", "亚瑟·潘德拉贡", M, 7.5, 8, 6, 0, 6, None),
      ("elaine", "Elaine", "エレイン", "伊莲", F, 5.5, 4, 4, 7, 5, None),
      ("jericho", "Jericho", "ジェリコ", "杰里科", F, 5.5, 4, 4, 0, 4, 10),
      ("ludociel", "Ludociel", "リュドシエル", "鲁德西艾尔", M, 9, 8, 7, 2, 7, 25),
      ("demon-king", "Demon King", "魔神王", "魔神王", M, 10, 9, 9, 0, 8, 30),
    ],
  },
  {
    "id": "tensura", "name_en": "That Time I Got Reincarnated as a Slime", "name_ja": "転生したらスライムだった件", "name_zh": "关于我转生变成史莱姆这档事",
    "anilistSearch": ["Tensei shitara Slime Datta Ken", "Tensei shitara Slime Datta Ken 2nd Season", "Tensei shitara Slime Datta Ken 3rd Season"],
    "roles": [("leader", "Demon Lord", "魔王", "魔王"), ("deputy", "Samurai General", "侍大将", "侍大将"),
              ("tanker", "Royal Guard", "近卫", "近衛"), ("healer", "Shrine Maiden Healer", "巫女治疗师", "巫女の治癒役"),
              ("strategist", "Chief Strategist", "军师", "軍師"), ("traitor", "Rival Lord's Spy", "敌对魔王的间谍", "敵対魔王の間者")],
    "battlefield": ("The Tempest capital during a demon lord invasion, with goblin streets, layered magic barriers and the Forest of Jura beyond the walls.",
                    "魔王入侵中的魔物之国坦派斯特首都，哥布林街道与多重魔法结界，城墙外是朱拉大森林。",
                    "魔王の侵攻を受けるテンペストの首都。ゴブリンの街並みと幾重もの魔法結界、城壁の外にはジュラの大森林。"),
    "chars": [
      ("rimuru-tempest", "Rimuru Tempest", "リムル＝テンペスト", "利姆露·坦派斯特", N, 10, 10, 9, 8, 10, 30),
      ("veldora-tempest", "Veldora Tempest", "ヴェルドラ＝テンペスト", "维鲁德拉·坦派斯特", M, 10, 5, 10, 0, 4, 30),
      ("milim-nava", "Milim Nava", "ミリム・ナーヴァ", "蜜莉姆·纳瓦", F, 10, 6, 9, 0, 5, 30),
      ("benimaru", "Benimaru", "ベニマル", "红丸", M, 8.5, 9, 7, 0, 8, None),
      ("shuna", "Shuna", "シュナ", "朱菜", F, 5.5, 5, 4, 9, 8, None),
      ("shion", "Shion", "シオン", "紫苑", F, 8, 4, 8, 0, 2, None),
      ("souei", "Souei", "ソウエイ", "苍影", M, 7.5, 5, 5, 0, 9, None),
      ("hakurou", "Hakurou", "ハクロウ", "白老", M, 8, 6, 6, 0, 8, None),
      ("gobta", "Gobta", "ゴブタ", "哥布达", M, 5, 4, 5, 0, 3, 10),
      ("ranga", "Ranga", "ランガ", "岚牙", M, 7.5, 4, 7, 0, 4, None),
      ("diablo", "Diablo", "ディアブロ", "迪亚布罗", M, 9.5, 7, 8, 2, 10, 25),
      ("shizue-izawa", "Shizue Izawa", "井沢静江", "井泽静江", F, 6.5, 5, 5, 0, 6, None),
      ("geld", "Geld", "ゲルド", "格鲁德", M, 8, 7, 10, 0, 5, None),
      ("gabiru", "Gabiru", "ガビル", "加比鲁", M, 6, 5, 6, 0, 3, None),
      ("treyni", "Treyni", "トレイニー", "特蕾妮", F, 6.5, 4, 5, 5, 6, None),
      ("kaijin", "Kaijin", "カイジン", "凯金", M, 3, 4, 4, 0, 6, 10),
      ("hinata-sakaguchi", "Hinata Sakaguchi", "坂口日向", "坂口日向", F, 8.5, 8, 6, 4, 9, None),
      ("clayman", "Clayman", "クレイマン", "克雷曼", M, 7, 6, 5, 0, 8, None),
      ("guy-crimson", "Guy Crimson", "ギィ・クリムゾン", "基·克里姆森", M, 10, 9, 9, 0, 9, 30),
      ("leon-cromwell", "Leon Cromwell", "レオン・クロムウェル", "雷昂·克伦威尔", M, 9, 7, 7, 0, 8, 25),
      ("ramiris", "Ramiris", "ラミリス", "拉米莉丝", F, 4, 4, 7, 2, 5, None),
      ("carrion", "Carrion", "カリオン", "卡利翁", M, 8, 7, 7, 0, 5, None),
      ("frey", "Frey", "フレイ", "芙蕾", F, 8, 6, 6, 0, 7, None),
      ("luminous-valentine", "Luminous Valentine", "ルミナス・バレンタイン", "露米纳斯·瓦伦丁", F, 9.5, 8, 8, 7, 8, 25),
      ("gazel-dwargo", "Gazel Dwargo", "ガゼル・ドワルゴ", "加泽尔·德瓦尔哥", M, 8, 9, 7, 0, 8, None),
      ("masayuki-honjou", "Masayuki Honjou", "本城正幸", "本城正幸", M, 3, 6, 6, 0, 3, 10),
      ("yuuki-kagurazaka", "Yuuki Kagurazaka", "神楽坂優樹", "神乐坂优树", M, 8, 7, 6, 0, 10, None),
      ("testarossa", "Testarossa", "テスタロッサ", "泰斯塔罗莎", F, 9, 6, 7, 0, 9, None),
      ("rigurd", "Rigurd", "リグルド", "利格鲁德", M, 3, 7, 5, 0, 5, 10),
    ],
  },
  {
    "id": "rezero", "name_en": "Re:Zero", "name_ja": "Re:ゼロから始める異世界生活", "name_zh": "Re:从零开始的异世界生活",
    "anilistSearch": ["Re:Zero kara Hajimeru Isekai Seikatsu", "Re:Zero kara Hajimeru Isekai Seikatsu 2nd Season", "Re:Zero kara Hajimeru Isekai Seikatsu 3rd Season"],
    "roles": [("leader", "Royal Candidate", "王选候补者", "王選候補者"), ("deputy", "Sworn Knight", "誓约骑士", "誓いの騎士"),
              ("tanker", "Vanguard", "前锋", "前衛"), ("healer", "Healer", "治疗术士", "治癒術師"),
              ("strategist", "Strategist", "军师", "参謀"), ("traitor", "Witch Cult Archbishop", "魔女教大罪司教", "魔女教大罪司教")],
    "battlefield": ("The Roswaal mansion and its forest at night during a Witch Cult assault, with the Sanctuary's tomb glowing in the distance.",
                    "魔女教夜袭中的罗兹瓦尔宅邸与周边森林，远处圣域的墓所散发微光。",
                    "魔女教の夜襲を受けるロズワール邸と周囲の森。遠くに聖域の墓所が淡く光る。"),
    "chars": [
      ("subaru-natsuki", "Subaru Natsuki", "ナツキ・スバル", "菜月昴", M, 2, 7, 4, 2, 9, 25),
      ("emilia", "Emilia", "エミリア", "爱蜜莉雅", F, 8, 7, 6, 7, 4, 25),
      ("rem", "Rem", "レム", "雷姆", F, 7, 4, 6, 6, 5, None),
      ("ram", "Ram", "ラム", "拉姆", F, 6.5, 5, 4, 2, 8, None),
      ("beatrice", "Beatrice", "ベアトリス", "碧翠丝", F, 7.5, 4, 7, 3, 9, None),
      ("puck", "Puck", "パック", "帕克", M, 9, 4, 7, 0, 6, 25),
      ("roswaal-l-mathers", "Roswaal L Mathers", "ロズワール・L・メイザース", "罗兹瓦尔·L·梅札斯", M, 9, 7, 6, 3, 10, 25),
      ("felt", "Felt", "フェルト", "菲鲁特", F, 4, 6, 3, 0, 5, 10),
      ("reinhard-van-astrea", "Reinhard van Astrea", "ラインハルト・ヴァン・アストレア", "莱因哈鲁特·范·阿斯特雷亚", M, 10, 7, 10, 1, 6, 30),
      ("crusch-karsten", "Crusch Karsten", "クルシュ・カルステン", "库珥修·卡尔斯腾", F, 7, 9, 5, 0, 7, None),
      ("felix-argyle", "Felix Argyle", "フェリックス・アーガイル", "菲利克斯·阿盖尔", M, 4, 3, 3, 10, 7, None),
      ("wilhelm-van-astrea", "Wilhelm van Astrea", "ヴィルヘルム・ヴァン・アストレア", "威尔海姆·范·阿斯特雷亚", M, 8, 6, 6, 0, 7, None),
      ("priscilla-barielle", "Priscilla Barielle", "プリシラ・バーリエル", "普莉希拉·巴利耶尔", F, 7.5, 9, 6, 0, 8, None),
      ("aldebaran", "Aldebaran", "アルデバラン", "阿尔德巴兰", M, 7.5, 4, 8, 0, 8, None),
      ("anastasia-hoshin", "Anastasia Hoshin", "アナスタシア・ホーシン", "安娜塔西亚·霍辛", F, 3, 8, 3, 0, 10, None),
      ("julius-juukulius", "Julius Juukulius", "ユリウス・ユークリウス", "尤里乌斯·尤克历乌斯", M, 8, 7, 6, 0, 6, None),
      ("otto-suwen", "Otto Suwen", "オットー・スーウェン", "奥托·苏文", M, 3, 4, 3, 0, 8, 10),
      ("garfiel-tinsel", "Garfiel Tinsel", "ガーフィール・ティンゼル", "加菲尔·汀泽尔", M, 7.5, 4, 8, 0, 3, None),
      ("petelgeuse-romanee-conti", "Petelgeuse Romanee-Conti", "ペテルギウス・ロマネコンティ", "培提尔其乌斯·罗曼尼康帝", M, 7, 6, 7, 0, 5, None),
      ("regulus-corneas", "Regulus Corneas", "レグルス・コルニアス", "雷古勒斯·柯尔尼亚斯", M, 9, 5, 10, 0, 4, 25),
      ("sirius-romanee-conti", "Sirius Romanee-Conti", "シリウス・ロマネコンティ", "西里乌斯·罗曼尼康帝", F, 7.5, 4, 6, 0, 4, None),
      ("capella-emerada-lugunica", "Capella Emerada Lugunica", "カペラ・エメラダ・ルグニカ", "卡佩拉·艾美拉达·露格尼卡", F, 8, 5, 9, 4, 6, None),
      ("echidna", "Echidna", "エキドナ", "艾姬多娜", F, 8.5, 6, 5, 3, 10, 25),
      ("elsa-granhiert", "Elsa Granhiert", "エルザ・グランヒルテ", "艾尔莎·格兰希尔特", F, 7.5, 3, 8, 0, 5, None),
      ("frederica-baumann", "Frederica Baumann", "フレデリカ・バウマン", "弗蕾德莉卡·鲍曼", F, 6, 4, 6, 0, 5, None),
      ("meili-portroute", "Meili Portroute", "メィリィ・ポートルート", "梅莉·波特鲁特", F, 5, 3, 4, 0, 6, None),
      ("petra-leyte", "Petra Leyte", "ペトラ・レイテ", "佩特拉·雷特", F, 0.5, 2, 1, 0, 3, 5),
      ("satella", "Satella", "サテラ", "莎缇拉", F, 10, 4, 10, 0, 3, 30),
    ],
  },
  {
    "id": "deathnote", "name_en": "Death Note", "name_ja": "DEATH NOTE", "name_zh": "死亡笔记",
    "anilistSearch": ["Death Note"],
    "roles": [("leader", "Task Force Chief", "搜查本部部长", "捜査本部長"), ("deputy", "Lead Detective", "首席侦探", "主任探偵"),
              ("tanker", "Bodyguard", "保镖", "ボディガード"), ("healer", "Field Support", "后方支援", "後方支援"),
              ("strategist", "Mastermind", "幕后军师", "黒幕の頭脳"), ("traitor", "Kira Sympathizer", "奇拉信徒", "キラ信者")],
    "battlefield": ("The Kira task-force headquarters in Tokyo at night, with walls of surveillance screens, rain-slicked rooftops and the Yellow Box warehouse below.",
                    "夜晚东京的奇拉搜查本部，满墙监控屏幕，雨湿的天台与下方的黄色仓库。",
                    "夜の東京、キラ捜査本部。壁一面の監視モニター、雨に濡れた屋上、眼下にはYB倉庫。"),
    "chars": [
      ("light-yagami", "Light Yagami", "夜神月", "夜神月", M, 6, 9, 3, 0, 10, 30),
      ("l-lawliet", "L Lawliet", "L", "L", M, 3, 8, 3, 0, 10, 30),
      ("misa-amane", "Misa Amane", "弥海砂", "弥海砂", F, 5, 3, 2, 0, 4, None),
      ("near", "Near", "ニア", "尼亚", M, 2, 8, 2, 0, 10, 25),
      ("mello", "Mello", "メロ", "梅洛", M, 4, 7, 3, 0, 9, 25),
      ("ryuk", "Ryuk", "リューク", "琉克", M, 7, 2, 9, 0, 5, 25),
      ("rem", "Rem", "レム", "雷姆", F, 7, 3, 8, 0, 6, None),
      ("soichiro-yagami", "Soichiro Yagami", "夜神総一郎", "夜神总一郎", M, 2.5, 8, 4, 0, 6, None),
      ("touta-matsuda", "Touta Matsuda", "松田桃太", "松田桃太", M, 2.5, 3, 3, 0, 4, 10),
      ("shuuichi-aizawa", "Shuuichi Aizawa", "相沢周市", "相泽周市", M, 2.5, 6, 4, 0, 6, None),
      ("kanzou-mogi", "Kanzou Mogi", "模木完造", "模木完造", M, 3, 4, 6, 0, 5, None),
      ("hideki-ide", "Hideki Ide", "伊出英基", "伊出英基", M, 2.5, 4, 4, 0, 5, None),
      ("hirokazu-ukita", "Hirokazu Ukita", "宇生田広数", "宇生田广数", M, 2.5, 3, 3, 0, 3, 10),
      ("watari", "Watari", "ワタリ", "渡", M, 3, 5, 3, 2, 8, None),
      ("naomi-misora", "Naomi Misora", "南空ナオミ", "南空直美", F, 4, 5, 3, 0, 9, None),
      ("raye-penber", "Raye Penber", "レイ・ペンバー", "雷·潘巴", M, 3, 4, 3, 0, 6, None),
      ("kiyomi-takada", "Kiyomi Takada", "高田清美", "高田清美", F, 3, 5, 2, 0, 7, None),
      ("teru-mikami", "Teru Mikami", "魅上照", "魅上照", M, 5, 5, 2, 0, 8, None),
      ("kyousuke-higuchi", "Kyousuke Higuchi", "火口卿介", "火口卿介", M, 5, 4, 2, 0, 4, None),
      ("sayu-yagami", "Sayu Yagami", "夜神粧裕", "夜神粧裕", F, 0.5, 2, 1, 0, 3, 5),
      ("halle-lidner", "Halle Lidner", "ハル・リドナー", "哈尔·利德纳", F, 4, 5, 4, 0, 7, None),
      ("stephen-gevanni", "Stephen Gevanni", "ステファン・ジェバンニ", "史蒂芬·杰凡尼", M, 3, 4, 3, 0, 8, None),
      ("anthony-rester", "Anthony Rester", "アンソニー・レスター", "安东尼·雷斯塔", M, 3.5, 6, 4, 0, 6, None),
      ("wedy", "Wedy", "ウエディ", "维迪", F, 3, 3, 2, 0, 8, None),
      ("aiber", "Aiber", "アイバー", "艾巴", M, 3, 4, 3, 0, 7, None),
      ("sidoh", "Sidoh", "シドウ", "希德", M, 6, 2, 8, 0, 2, None),
      ("matt", "Matt", "マット", "马特", M, 2.5, 2, 2, 0, 7, None),
      ("roger-ruvie", "Roger Ruvie", "ロジャー・ラヴィー", "罗杰·拉维", M, 1, 6, 1, 2, 5, None),
      ("rod-ross", "Rod Ross", "ロッド・ロス", "罗德·罗斯", M, 3, 6, 4, 0, 5, None),
    ],
  },
  {
    "id": "codegeass", "name_en": "Code Geass", "name_ja": "コードギアス 反逆のルルーシュ", "name_zh": "Code Geass 反叛的鲁路修",
    "anilistSearch": ["Code Geass: Hangyaku no Lelouch", "Code Geass: Hangyaku no Lelouch R2"],
    "roles": [("leader", "Commander", "总司令", "総司令"), ("deputy", "Knight of Zero", "零之骑士", "ゼロの騎士"),
              ("tanker", "Knightmare Ace", "王牌骑士机驾驶员", "ナイトメアのエース"), ("healer", "Field Engineer", "后勤技术员", "整備技術者"),
              ("strategist", "Tactician", "战术参谋", "戦術参謀"), ("traitor", "Double Agent", "双面间谍", "二重スパイ")],
    "battlefield": ("The Tokyo Settlement during the Black Rebellion, with Knightmare Frames clashing in the streets, Ashford Academy nearby and Britannian airships overhead.",
                    "黑色叛乱中的东京租界，骑士机在街头激战，阿什弗德学园就在附近，布里塔尼亚浮游舰掠过天际。",
                    "ブラックリベリオン中のトウキョウ租界。街路でナイトメアフレームが激突し、アッシュフォード学園の上空をブリタニアの浮遊航空艦が飛ぶ。"),
    "chars": [
      ("lelouch-lamperouge", "Lelouch Lamperouge", "ルルーシュ・ランペルージ", "鲁路修·兰佩路基", M, 5, 10, 2, 0, 10, 30),
      ("suzaku-kururugi", "Suzaku Kururugi", "枢木スザク", "枢木朱雀", M, 8.5, 6, 8, 0, 5, 30),
      ("cc", "C.C.", "C.C.", "C.C.", F, 4, 4, 10, 0, 7, 25),
      ("kallen-kouzuki", "Kallen Kouzuki", "紅月カレン", "红月卡莲", F, 8, 6, 7, 0, 5, 25),
      ("nunnally-lamperouge", "Nunnally Lamperouge", "ナナリー・ランペルージ", "娜娜莉·兰佩路基", F, 2, 7, 1, 0, 7, None),
      ("euphemia-li-britannia", "Euphemia li Britannia", "ユーフェミア・リ・ブリタニア", "尤菲米娅·李·布里塔尼亚", F, 1, 8, 1, 2, 4, None),
      ("cornelia-li-britannia", "Cornelia li Britannia", "コーネリア・リ・ブリタニア", "柯内莉亚·李·布里塔尼亚", F, 7.5, 9, 6, 0, 8, None),
      ("schneizel-el-britannia", "Schneizel el Britannia", "シュナイゼル・エル・ブリタニア", "修奈泽鲁·艾尔·布里塔尼亚", M, 5, 10, 3, 0, 10, 25),
      ("charles-zi-britannia", "Charles zi Britannia", "シャルル・ジ・ブリタニア", "查尔斯·基·布里塔尼亚", M, 6, 9, 9, 0, 8, 25),
      ("vv", "V.V.", "V.V.", "V.V.", M, 3, 5, 9, 0, 6, None),
      ("jeremiah-gottwald", "Jeremiah Gottwald", "ジェレミア・ゴットバルト", "杰雷米亚·哥德巴尔德", M, 8, 5, 8, 0, 4, None),
      ("lloyd-asplund", "Lloyd Asplund", "ロイド・アスプルンド", "罗伊德·阿斯普鲁德", M, 2, 4, 2, 3, 9, None),
      ("cecile-croomy", "Cecile Croomy", "セシル・クルーミー", "塞西尔·克鲁米", F, 2, 4, 2, 6, 7, None),
      ("rolo-lamperouge", "Rolo Lamperouge", "ロロ・ランペルージ", "罗洛·兰佩路基", M, 7, 3, 4, 0, 7, None),
      ("shirley-fenette", "Shirley Fenette", "シャーリー・フェネット", "夏莉·菲涅特", F, 1, 3, 1, 1, 3, 5),
      ("milly-ashford", "Milly Ashford", "ミレイ・アッシュフォード", "米蕾·阿什弗德", F, 1, 7, 1, 1, 6, 10),
      ("kaname-ougi", "Kaname Ougi", "扇要", "扇要", M, 3, 6, 4, 0, 4, None),
      ("kyoushirou-toudou", "Kyoushirou Toudou", "藤堂鏡志朗", "藤堂镜志朗", M, 7.5, 7, 6, 0, 8, None),
      ("kaguya-sumeragi", "Kaguya Sumeragi", "皇神楽耶", "皇神乐耶", F, 1, 7, 1, 0, 7, None),
      ("li-xingke", "Li Xingke", "黎星刻", "黎星刻", M, 8, 8, 6, 0, 8, None),
      ("bismarck-waldstein", "Bismarck Waldstein", "ビスマルク・ヴァルトシュタイン", "俾斯麦·瓦尔德施泰因", M, 8.5, 7, 7, 0, 7, None),
      ("gino-weinberg", "Gino Weinberg", "ジノ・ヴァインベルグ", "吉诺·魏因贝格", M, 7.5, 5, 6, 0, 5, None),
      ("anya-alstreim", "Anya Alstreim", "アーニャ・アールストレイム", "安妮娅·阿尔斯特莱姆", F, 7.5, 3, 6, 0, 5, None),
      ("diethard-ried", "Diethard Ried", "ディートハルト・リート", "迪特哈尔特·里德", M, 2, 5, 1, 0, 9, None),
      ("villetta-nu", "Villetta Nu", "ヴィレッタ・ヌゥ", "维莱塔·努", F, 6, 5, 5, 0, 5, None),
      ("rakshata-chawla", "Rakshata Chawla", "ラクシャータ・チャウラー", "拉克夏塔·查乌拉", F, 2, 5, 2, 5, 9, None),
      ("sayoko-shinozaki", "Sayoko Shinozaki", "篠崎咲世子", "筱崎咲世子", F, 6.5, 3, 5, 2, 6, None),
      ("clovis-la-britannia", "Clovis la Britannia", "クロヴィス・ラ・ブリタニア", "克洛维斯·拉·布里塔尼亚", M, 2, 6, 2, 0, 4, 10),
      ("marianne-vi-britannia", "Marianne vi Britannia", "マリアンヌ・ヴィ・ブリタニア", "玛丽安娜·维·布里塔尼亚", F, 7.5, 7, 5, 0, 7, None),
    ],
  },
]

# Headliners missing from existing series.
ADDITIONS = {
  "onepiece": [
    ("marshall-d-teach", "Marshall D. Teach", "マーシャル・D・ティーチ", "马歇尔·D·蒂奇", M, 9, 8, 8, 0, 7, 30),
    ("monkey-d-garp", "Monkey D. Garp", "モンキー・D・ガープ", "蒙奇·D·卡普", M, 9, 8, 8, 0, 5, 25),
    ("borsalino", "Borsalino", "ボルサリーノ", "波鲁萨利诺", M, 9, 6, 7, 0, 6, 25),
    ("monkey-d-dragon", "Monkey D. Dragon", "モンキー・D・ドラゴン", "蒙奇·D·龙", M, 9, 10, 7, 0, 8, 25),
    ("enel", "Enel", "エネル", "艾尼路", M, 8, 7, 6, 0, 5, None),
    ("rob-lucci", "Rob Lucci", "ロブ・ルッチ", "罗布·路奇", M, 8, 6, 7, 0, 6, None),
    ("smoker", "Smoker", "スモーカー", "斯摩格", M, 7, 7, 7, 0, 6, None),
    ("bartholomew-kuma", "Bartholomew Kuma", "バーソロミュー・くま", "巴索罗缪·大熊", M, 8.5, 6, 9, 3, 6, None),
    ("nefertari-vivi", "Nefertari Vivi", "ネフェルタリ・ビビ", "奈菲鲁塔利·薇薇", F, 3, 8, 2, 1, 6, 10),
  ],
  "naruto": [
    ("kaguya-ootsutsuki", "Kaguya Ootsutsuki", "大筒木カグヤ", "大筒木辉夜", F, 10, 7, 9, 0, 6, 30),
    ("kurama", "Kurama", "九喇嘛", "九喇嘛", M, 9.5, 5, 10, 4, 6, 25),
    ("hiruzen-sarutobi", "Hiruzen Sarutobi", "猿飛ヒルゼン", "猿飞日斩", M, 8, 9, 6, 0, 9, 25),
    ("kisame-hoshigaki", "Kisame Hoshigaki", "干柿鬼鮫", "干柿鬼鲛", M, 8, 5, 9, 0, 6, None),
    ("kakuzu", "Kakuzu", "角都", "角都", M, 7.5, 4, 9, 0, 6, None),
    ("hidan", "Hidan", "飛段", "飞段", M, 6.5, 3, 9, 0, 2, None),
    ("yamato", "Yamato", "ヤマト", "大和", M, 7, 6, 8, 1, 6, None),
    ("asuma-sarutobi", "Asuma Sarutobi", "猿飛アスマ", "猿飞阿斯玛", M, 6.5, 7, 5, 0, 6, None),
  ],
  "jjk": [
    ("kenjaku", "Kenjaku", "羂索", "羂索", M, 9, 9, 7, 0, 10, 25),
    ("hiromi-higuruma", "Hiromi Higuruma", "日車寛見", "日车宽见", M, 8, 6, 5, 0, 9, None),
    ("hana-kurusu", "Hana Kurusu", "来栖華", "来栖华", F, 7, 4, 5, 5, 4, None),
    ("noritoshi-kamo", "Noritoshi Kamo", "加茂憲紀", "加茂宪纪", M, 6, 6, 5, 2, 6, None),
    ("masamichi-yaga", "Masamichi Yaga", "夜蛾正道", "夜蛾正道", M, 6, 8, 5, 0, 6, None),
    ("takuma-ino", "Takuma Ino", "猪野琢真", "猪野琢真", M, 5.5, 4, 5, 0, 5, None),
    ("ui-ui", "Ui Ui", "憂憂", "忧忧", M, 5, 2, 3, 4, 6, None),
    ("momo-nishimiya", "Momo Nishimiya", "西宮桃", "西宫桃", F, 4.5, 3, 3, 0, 6, 10),
  ],
  "bleach": [
    ("ichibe-hyousube", "Ichibe Hyousube", "兵主部一兵衛", "兵主部一兵卫", M, 9.5, 9, 8, 0, 9, 25),
    ("isshin-kurosaki", "Isshin Kurosaki", "黒崎一心", "黑崎一心", M, 8.5, 7, 7, 2, 6, None),
    ("coyote-starrk", "Coyote Starrk", "コヨーテ・スターク", "郭约特·史塔克", M, 8.5, 5, 6, 0, 6, None),
    ("kaname-tousen", "Kaname Tousen", "東仙要", "东仙要", M, 7.5, 6, 6, 0, 7, None),
    ("yasutora-sado", "Yasutora Sado", "茶渡泰虎", "茶渡泰虎", M, 6.5, 4, 8, 0, 4, None),
    ("izuru-kira", "Izuru Kira", "吉良イヅル", "吉良伊鹤", M, 6, 5, 4, 5, 6, None),
    ("ikkaku-madarame", "Ikkaku Madarame", "斑目一角", "斑目一角", M, 6.5, 4, 6, 0, 3, None),
    ("yachiru-kusajishi", "Yachiru Kusajishi", "草鹿やちる", "草鹿八千流", F, 6, 3, 5, 0, 2, None),
    ("hanatarou-yamada", "Hanatarou Yamada", "山田花太郎", "山田花太郎", M, 2, 2, 3, 8, 4, 10),
  ],
  "demonslayer": [
    ("kagaya-ubuyashiki", "Kagaya Ubuyashiki", "産屋敷耀哉", "产屋敷耀哉", M, 0.5, 10, 1, 0, 9, None),
    ("sakonji-urokodaki", "Sakonji Urokodaki", "鱗滝左近次", "鳞泷左近次", M, 6.5, 6, 5, 1, 7, None),
    ("sabito", "Sabito", "錆兎", "锖兔", M, 6, 5, 5, 0, 5, None),
    ("makomo", "Makomo", "真菰", "真菰", F, 4.5, 3, 3, 0, 5, 10),
    ("nakime", "Nakime", "鳴女", "鸣女", F, 7, 3, 6, 0, 8, None),
    ("rui", "Rui", "累", "累", M, 7, 5, 7, 0, 5, None),
    ("enmu", "Enmu", "魘夢", "魇梦", M, 7, 4, 6, 0, 7, None),
    ("kaigaku", "Kaigaku", "獪岳", "狯岳", M, 7.5, 3, 6, 0, 4, None),
  ],
  "chainsawman": [
    ("darkness-devil", "Darkness Devil", "闇の悪魔", "暗之恶魔", N, 9.5, 4, 9, 0, 6, 30),
    ("gun-devil", "Gun Devil", "銃の悪魔", "枪之恶魔", N, 9, 3, 8, 0, 4, 25),
    ("fumiko-mifune", "Fumiko Mifune", "三船フミコ", "三船文子", F, 6, 4, 4, 0, 7, None),
    ("haruka-iseumi", "Haruka Iseumi", "伊勢海ハルカ", "伊势海遥", M, 5, 4, 4, 0, 4, None),
  ],
  "frieren": [
    ("macht", "Macht", "マハト", "马哈特", M, 9, 6, 7, 0, 8, 25),
    ("solitar", "Solitar", "ソリテール", "索莉泰尔", F, 8.5, 4, 6, 0, 8, None),
    ("qual", "Qual", "クヴァール", "库瓦尔", M, 8, 5, 5, 0, 7, None),
    ("linie", "Linie", "リーニエ", "莉尼耶", F, 7, 3, 5, 0, 5, None),
    ("draht", "Draht", "ドラート", "德拉特", M, 6.5, 3, 4, 0, 4, None),
    ("ehre", "Ehre", "エーレ", "艾蕾", F, 6, 4, 4, 0, 5, None),
  ],
  "aot": [
    ("grisha-yeager", "Grisha Yeager", "グリシャ・イェーガー", "格里沙·耶格尔", M, 7, 6, 6, 6, 7, None),
    ("uri-reiss", "Uri Reiss", "ウーリ・レイス", "乌利·雷斯", M, 8, 8, 6, 0, 6, None),
    ("dot-pixis", "Dot Pixis", "ドット・ピクシス", "多特·毕克西斯", M, 3, 9, 3, 0, 9, None),
    ("theo-magath", "Theo Magath", "テオ・マガト", "提奥·马加特", M, 4, 8, 4, 0, 8, None),
    ("mike-zacharias", "Mike Zacharias", "ミケ・ザカリアス", "米克·撒迦利亚斯", M, 6, 6, 5, 0, 6, None),
    ("rod-reiss", "Rod Reiss", "ロッド・レイス", "罗德·雷斯", M, 4, 6, 6, 0, 5, None),
    ("hannes", "Hannes", "ハンネス", "汉尼斯", M, 3, 5, 4, 0, 4, 10),
  ],
  "mha": [
    ("all-for-one", "All For One", "オール・フォー・ワン", "全为一", M, 9.5, 9, 8, 2, 10, 30),
    ("star-and-stripe", "Star and Stripe", "スターアンドストライプ", "星与纹", F, 9, 9, 7, 0, 7, 25),
    ("kai-chisaki", "Kai Chisaki", "治崎廻", "治崎回", M, 7.5, 7, 7, 8, 8, None),
    ("recovery-girl", "Recovery Girl", "リカバリーガール", "治愈女孩", F, 0.5, 6, 1, 10, 6, None),
    ("eri", "Eri", "エリ", "坏理", F, 2, 2, 2, 10, 3, None),
    ("lady-nagant", "Lady Nagant", "レディ・ナガン", "纳甘女士", F, 7, 4, 5, 0, 7, None),
    ("gran-torino", "Gran Torino", "グラントリノ", "格兰特里诺", M, 6.5, 6, 5, 0, 7, None),
  ],
  "hunterxhunter": [
    ("menthuthuyoupi", "Menthuthuyoupi", "モントゥトゥユピー", "尤匹", M, 9, 3, 9, 0, 2, 25),
    ("shaiapouf", "Shaiapouf", "シャウアプフ", "布夫", M, 8.5, 4, 6, 3, 9, None),
    ("razor", "Razor", "レイザー", "雷蛇", M, 8, 6, 7, 0, 6, None),
    ("uvogin", "Uvogin", "ウボォーギン", "窝金", M, 7.5, 4, 9, 0, 2, None),
    ("phinks-magcub", "Phinks Magcub", "フィンクス＝マグカブ", "芬克斯", M, 7.5, 3, 6, 0, 4, None),
    ("nobunaga-hazama", "Nobunaga Hazama", "ノブナガ＝ハザマ", "信长", M, 7, 4, 5, 0, 4, None),
  ],
  "fma": [
    ("tim-marcoh", "Tim Marcoh", "ティム・マルコー", "提姆·马尔寇", M, 3, 4, 3, 8, 8, None),
    ("grumman", "Grumman", "グラマン", "格鲁曼", M, 3, 8, 3, 0, 9, None),
    ("kain-fuery", "Kain Fuery", "ケイン・フュリー", "凯因·菲利", M, 2, 3, 2, 0, 6, 10),
    ("heymans-breda", "Heymans Breda", "ハイマンス・ブレダ", "海曼斯·布雷达", M, 3, 4, 3, 0, 7, None),
    ("vato-falman", "Vato Falman", "ヴァトー・ファルマン", "华托·法尔曼", M, 2.5, 3, 3, 0, 7, None),
  ],
  "blackclover": [
    ("lucius-zogratis", "Lucius Zogratis", "ルシウス・ゾグラティス", "卢修斯·佐格拉提斯", M, 10, 9, 8, 6, 10, 30),
    ("lumiere-silvamillion-clover", "Lumiere Silvamillion Clover", "ルミエル・シルヴァミリオン・クローバー", "鲁米艾尔·西尔瓦米利昂·克洛巴", M, 9, 9, 7, 3, 8, 25),
    ("dante-zogratis", "Dante Zogratis", "ダンテ・ゾグラティス", "但丁·佐格拉提斯", M, 8.5, 5, 9, 0, 5, None),
    ("vanica-zogratis", "Vanica Zogratis", "ヴァニカ・ゾグラティス", "瓦妮卡·佐格拉提斯", F, 8.5, 3, 7, 0, 3, None),
    ("zenon-zogratis", "Zenon Zogratis", "ゼノン・ゾグラティス", "泽农·佐格拉提斯", M, 8.5, 6, 7, 0, 6, None),
    ("patry", "Patry", "パトリ", "帕特里", M, 8, 7, 6, 2, 7, None),
  ],
  "onepunchman": [
    ("orochi", "Orochi", "オロチ", "大蛇", M, 9, 7, 9, 0, 3, 25),
    ("psykos", "Psykos", "サイコス", "赛克斯", F, 8.5, 7, 6, 0, 9, 25),
    ("elder-centipede", "Elder Centipede", "ムカデ長老", "蜈蚣长老", M, 8.5, 2, 9, 0, 2, None),
    ("gouketsu", "Gouketsu", "ゴウケツ", "豪杰", M, 8, 5, 8, 0, 3, None),
    ("suiryu", "Suiryu", "スイリュウ", "水龙", M, 7, 4, 6, 0, 4, None),
  ],
  "dragonball": [
    ("vegito", "Vegito", "ベジット", "贝吉特", M, 10, 6, 9, 0, 7, 30),
    ("gogeta", "Gogeta", "ゴジータ", "悟吉塔", M, 10, 6, 9, 0, 7, 30),
    ("gotenks", "Gotenks", "ゴテンクス", "悟天克斯", M, 9, 3, 6, 0, 2, 25),
    ("toppo", "Toppo", "トッポ", "托波", M, 9, 7, 8, 0, 5, None),
    ("android-16", "Android 16", "人造人間16号", "人造人16号", M, 7.5, 3, 8, 0, 5, None),
    ("tien-shinhan", "Tien Shinhan", "天津飯", "天津饭", M, 7, 5, 5, 0, 6, None),
    ("yamcha", "Yamcha", "ヤムチャ", "雅木茶", M, 5, 4, 4, 0, 4, 10),
    ("dende", "Dende", "デンデ", "丹迪", M, 1, 4, 2, 10, 5, 10),
  ],
  "sao": [
    ("cardinal", "Cardinal", "カーディナル", "卡迪纳尔", F, 7.5, 6, 5, 6, 10, None),
    ("selka-zuberg", "Selka Zuberg", "セルカ・ツーベルク", "赛尔卡·滋贝鲁克", F, 3, 3, 2, 7, 5, None),
    ("nobuyuki-sugou", "Nobuyuki Sugou", "須郷伸之", "须乡伸之", M, 4, 6, 4, 0, 7, None),
    ("death-gun", "Death Gun", "デス・ガン", "死枪", M, 5, 4, 3, 0, 7, None),
    ("kuradeel", "Kuradeel", "クラディール", "克拉帝尔", M, 4, 3, 4, 0, 3, 10),
  ],
  "jojo": [
    ("kars", "Kars", "カーズ", "卡兹", M, 9, 7, 9, 0, 8, 25),
    ("wamuu", "Wamuu", "ワムウ", "瓦姆乌", M, 8.5, 5, 8, 0, 6, None),
    ("esidisi", "Esidisi", "エシディシ", "艾西迪西", M, 8, 5, 8, 0, 6, None),
    ("vanilla-ice", "Vanilla Ice", "ヴァニラ・アイス", "香草冰", M, 8, 3, 7, 0, 3, None),
    ("muhammad-avdol", "Muhammad Avdol", "モハメド・アヴドゥル", "穆罕默德·阿布德尔", M, 6.5, 6, 5, 0, 7, None),
    ("hol-horse", "Hol Horse", "ホル・ホース", "荷尔·荷斯", M, 5, 3, 3, 0, 5, None),
    ("robert-e-o-speedwagon", "Robert E. O. Speedwagon", "ロバート・E・O・スピードワゴン", "罗伯特·E·O·史比特瓦根", M, 2, 7, 3, 2, 6, 10),
  ],
  "fairytail": [
    ("makarov-dreyar", "Makarov Dreyar", "マカロフ・ドレアー", "马卡洛夫·德雷亚尔", M, 8.5, 10, 8, 0, 7, 25),
    ("irene-belserion", "Irene Belserion", "アイリーン・ベルセリオン", "艾琳·贝尔塞利昂", F, 9.5, 7, 8, 0, 8, 25),
    ("august", "August", "オーガスト", "奥古斯特", M, 9.5, 7, 8, 0, 8, 25),
    ("larcade-dragneel", "Larcade Dragneel", "ラーケイド・ドラグニル", "拉凯德·德拉格尼尔", M, 9, 5, 7, 0, 6, None),
    ("brandish", "Brandish μ", "ブランディッシュ・μ", "布兰迪施·μ", F, 8.5, 4, 6, 0, 6, None),
    ("chelia-blendy", "Chelia Blendy", "シェリア・ブレンディ", "雪莉亚·布兰迪", F, 6.5, 3, 4, 9, 4, None),
  ],
  "sololeveling": [
    ("kamish", "Kamish", "カミッシュ", "卡米什", M, 9.5, 5, 9, 0, 5, 25),
    ("tusk", "Tusk", "タスク", "图斯克", M, 8, 5, 6, 0, 7, None),
    ("iron", "Iron", "アイアン", "艾恩", M, 7, 3, 9, 0, 2, None),
    ("kaisel", "Kaisel", "カイセル", "凯塞尔", M, 7.5, 3, 6, 0, 4, None),
    ("sung-jinah", "Sung Jinah", "ソン・ジナ", "成真雅", F, 0.5, 3, 1, 0, 4, 5),
  ],
  "tokyoghoul": [
    ("kichimura-washuu", "Kichimura Washuu", "和修吉時", "和修吉时", M, 8, 8, 6, 0, 9, 25),
    ("kuki-urie", "Kuki Urie", "瓜江久生", "瓜江久生", M, 7.5, 6, 6, 0, 7, None),
    ("hairu-ihei", "Hairu Ihei", "伊丙入", "伊丙入", F, 7, 3, 4, 0, 4, None),
    ("tooru-mutsuki", "Tooru Mutsuki", "六月透", "六月透", M, 6.5, 3, 5, 0, 5, None),
    ("saiko-yonebayashi", "Saiko Yonebayashi", "米林才子", "米林才子", F, 6, 3, 5, 0, 5, None),
    ("ginshi-shirazu", "Ginshi Shirazu", "不知吟士", "不知吟士", M, 6, 5, 5, 0, 3, None),
  ],
  "fireforce": [
    ("dragon", "Dragon", "ドラゴン", "龙", M, 9, 3, 8, 0, 3, 25),
    ("kurono", "Kurono", "黒野", "黑野", M, 7.5, 4, 6, 0, 6, None),
    ("rekka-hoshimiya", "Rekka Hoshimiya", "烈火星宮", "烈火星宫", M, 7, 5, 5, 0, 4, None),
    ("nataku-son", "Nataku Son", "ナタク孫", "孙哪吒", M, 7, 2, 5, 0, 2, None),
  ],
}

# --------------------------------------------------------------------------- apply
def load_js_object(src, name):
    m = re.search(rf"export const {name} = (\{{.*?\n\}});", src, re.S)
    if not m: sys.exit(f"cannot find {name}")
    return m, json.loads(m.group(1))

def main():
    roster_p = ROOT / "data/roster.json"
    roster = json.loads(roster_p.read_text())
    by_id = {s["id"]: s for s in roster}
    rows = []  # (series_id, row)
    added = 0

    def make_char(sid, r):
        slug, en, ja, zh, g = r[:5]
        c = {"id": f"{sid}-{slug}", "name_en": en, "name_ja": ja, "name_zh": zh}
        if g: c["gender"] = g
        return c

    for s in NEW_SERIES:
        if s["id"] in by_id: continue
        entry = {k: s[k] for k in ("id", "name_en", "name_ja", "name_zh", "anilistSearch")}
        entry["chars"] = [make_char(s["id"], r) for r in s["chars"]]
        roster.append(entry); by_id[s["id"]] = entry
        rows += [(s["id"], r) for r in s["chars"]]; added += len(s["chars"])
    for sid, chars in ADDITIONS.items():
        have = {c["id"] for c in by_id[sid]["chars"]}
        for r in chars:
            c = make_char(sid, r)
            if c["id"] in have: continue
            by_id[sid]["chars"].append(c); rows.append((sid, r)); added += 1
    roster_p.write_text(json.dumps(roster, ensure_ascii=False, indent=2) + "\n")

    game_p = ROOT / "src/data/game.js"
    src = game_p.read_text()
    for name, update in (("ROLE_SETS", None), ("ROLE_LABELS", None), ("BATTLEFIELDS", None), ("PRICE_TIERS", None)):
        m, obj = load_js_object(src, name)
        if name == "ROLE_SETS":
            for s in NEW_SERIES: obj.setdefault(s["id"], [f'{s["id"]}:{k}' for k, *_ in s["roles"]])
        elif name == "ROLE_LABELS":
            for s in NEW_SERIES:
                for k, en, zh, ja in s["roles"]: obj.setdefault(f'{s["id"]}:{k}', {"en": en, "zh": zh, "ja": ja})
        elif name == "BATTLEFIELDS":
            for s in NEW_SERIES:
                en, zh, ja = s["battlefield"]; obj.setdefault(s["id"], {"en": en, "zh": zh, "ja": ja})
        elif name == "PRICE_TIERS":
            for sid, r in rows:
                price = r[10]
                if price is None: continue
                cid = f"{sid}-{r[0]}"
                if cid not in obj[str(price)]: obj[str(price)].append(cid)
        src = src[:m.start(1)] + json.dumps(obj, ensure_ascii=False, indent=1) + src[m.end(1):]
    game_p.write_text(src)

    attr_p = ROOT / "src/data/attributes.js"
    a = attr_p.read_text()
    def line(r): return " ".join([r[0]] + [f"{x:g}" for x in r[5:10]])
    for sid in dict.fromkeys(s for s, _ in rows):
        new_lines = [line(r) for s, r in rows if s == sid]
        block = re.search(rf"\n{sid}: `\n(.*?)`,\n", a, re.S)
        if block:
            existing = {l.split()[0] for l in block.group(1).splitlines() if l.strip()}
            new_lines = [l for l in new_lines if l.split()[0] not in existing]
            if new_lines: a = a[:block.end(1)] + "\n".join(new_lines) + "\n" + a[block.end(1):]
        else:
            marker = "};\n\n// Per-form overrides"
            a = a.replace(marker, f"{sid}: `\n" + "\n".join(new_lines) + "\n`,\n" + marker, 1)
    attr_p.write_text(a)
    print(f"added {added} characters ({sum(len(s['chars']) for s in NEW_SERIES)} in {len(NEW_SERIES)} new series)")

if __name__ == "__main__":
    main()
