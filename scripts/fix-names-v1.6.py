# v1.6 name fixes. Idempotent: run from the repo root, rewrites data/roster.json.
# ZH: Simplified Chinese for every character whose Chinese name was missing (English copied),
#     Japanese kana, or Japanese character forms. Official mainland translations where known;
#     names marked "# translit" are phonetic transliterations (no widely used official name found).
# JA: typo fixes (wrong kanji/kana, missing dots, stray spaces).
import json, re, pathlib

ZH = {
# One Piece
"onepiece-dracule-mihawk": "乔拉可尔·米霍克", "onepiece-edward-newgate": "爱德华·纽盖特", "onepiece-kaido": "凯多",
"onepiece-charlotte-linlin": "夏洛特·玲玲", "onepiece-kuzan": "库赞", "onepiece-sakazuki": "萨卡斯基",
"onepiece-bartolomeo": "巴托洛米奥", "onepiece-kozuki-oden": "光月御田",
# Naruto
"naruto-jiraiya": "自来也", "naruto-orochimaru": "大蛇丸", "naruto-konan": "小南", "naruto-hashirama-senju": "千手柱间",
"naruto-tobirama-senju": "千手扉间", "naruto-kabuto-yakushi": "药师兜", "naruto-deidara": "迪达拉", "naruto-sasori": "蝎",
"naruto-nagato": "长门", "naruto-kurama": "九喇嘛", "naruto-kakuzu": "角都",
# Jujutsu Kaisen
"jjk-satoru-gojo": "五条悟", "jjk-yuji-itadori": "虎杖悠仁", "jjk-kento-nanami": "七海建人", "jjk-mei-mei": "冥冥",
"jjk-mahito": "真人", "jjk-jogo": "漏瑚", "jjk-shoko-ieiri": "家入硝子", "jjk-kinji-hakari": "秤金次",
"jjk-yuki-tsukumo": "九十九由基", "jjk-naoya-zenin": "禅院直哉", "jjk-kokichi-muta": "与幸吉", "jjk-uraume": "里梅",
"jjk-riko-amanai": "天内理子", "jjk-kenjaku": "羂索", "jjk-masamichi-yaga": "夜蛾正道", "jjk-takuma-ino": "猪野琢真",
# Bleach
"bleach-byakuya-kuchiki": "朽木白哉", "bleach-renji-abarai": "阿散井恋次", "bleach-kisuke-urahara": "浦原喜助",
"bleach-rangiku-matsumoto": "松本乱菊", "bleach-jushiro-ukitake": "浮竹十四郎", "bleach-shinji-hirako": "平子真子",
"bleach-genryusai-shigekuni-yamamoto": "山本元柳斋重国", "bleach-yhwach": "友哈巴赫", "bleach-jugram-haschwalth": "尤格拉姆·哈斯沃德",
"bleach-bambietta-basterbine": "班比埃塔·巴斯特拜因", "bleach-askin-nakk-le-vaar": "阿斯金·纳克尔瓦尔", "bleach-senjumaru-shutara": "修多罗千手丸",
"bleach-yasutora-sado": "茶渡泰虎", "bleach-ikkaku-madarame": "斑目一角", "bleach-hanatarou-yamada": "山田花太郎",
# Demon Slayer
"demonslayer-zenitsu-agatsuma": "我妻善逸", "demonslayer-inosuke-hashibira": "嘴平伊之助", "demonslayer-mitsuri-kanroji": "甘露寺蜜璃",
"demonslayer-genya-shinazugawa": "不死川玄弥", "demonslayer-gyutaro": "妓夫太郎", "demonslayer-doma": "童磨", "demonslayer-kokushibo": "黑死牟",
"demonslayer-hantengu": "半天狗", "demonslayer-gyokko": "玉壶", "demonslayer-tamayo": "珠世", "demonslayer-yushiro": "愈史郎",
"demonslayer-makomo": "真菰", "demonslayer-rui": "累",
# Chainsaw Man
"chainsawman-hirofumi-yoshida": "吉田弘文", "chainsawman-santa-claus": "圣诞老人", "chainsawman-akane-sawatari": "泽渡茜",
"chainsawman-barem-bridge": "巴勒姆·布里奇", "chainsawman-pochita": "波奇塔", "chainsawman-violence-fiend": "暴力魔人",
"chainsawman-princi": "普林希", "chainsawman-cosmo": "柯斯莫", "chainsawman-long": "龙",
# SPY x FAMILY
"spyfamily-donovan-desmond": "多诺万·德斯蒙德", "spyfamily-emile-elman": "埃米尔·埃尔曼", "spyfamily-ewen-egeburg": "尤恩·埃杰伯格",
"spyfamily-camilla": "卡米拉", "spyfamily-sharon": "莎伦", "spyfamily-dominic": "多米尼克", "spyfamily-martha-marriott": "玛莎·马里奥特",
"spyfamily-bill-watkins": "比尔·沃特金斯", "spyfamily-george-glooman": "乔治·格鲁曼", "spyfamily-murdoch-swan": "默多克·斯旺",
"spyfamily-shopkeeper": "花园店长", "spyfamily-matthew-mcmahon": "马修·麦克马洪", "spyfamily-wheeler": "温斯顿·惠勒",
# Frieren
"frieren-aura": "阿乌拉", "frieren-lernen": "莱尔宁",  # translit
"frieren-richter": "里希特", "frieren-edel": "艾德尔", "frieren-sense": "森泽",  # translit
"frieren-genau": "格纳乌",  # translit
"frieren-kraft": "克拉夫特", "frieren-sein": "赞恩", "frieren-lugner": "留古纳",  # translit
# Attack on Titan
"aot-bertholdt-hoover": "贝尔托特·胡佛", "aot-marcel-galliard": "马塞尔·加利亚德", "aot-kenny-ackerman": "肯尼·阿克曼",
"aot-petra-ral": "佩特拉·拉尔", "aot-floch-forster": "弗洛克·福斯特", "aot-onyankopon": "欧良寇朋", "aot-yelena": "叶莲娜",
# My Hero Academia
"mha-tsuyu-asui": "蛙吹梅雨", "mha-momo-yaoyorozu": "八百万百", "mha-dabi": "荼毘", "mha-himiko-toga": "渡我被身子",
"mha-mirio-togata": "通形百万", "mha-tamaki-amajiki": "天喰环", "mha-mina-ashido": "芦户三奈", "mha-hitoshi-shinso": "心操人使",
"mha-twice": "二倍", "mha-stain": "斯坦因",
# Hunter x Hunter
"hunterxhunter-ging-freecss": "金·富力士", "hunterxhunter-silva-zoldyck": "席巴·揍敌客", "hunterxhunter-zeno-zoldyck": "桀诺·揍敌客",
"hunterxhunter-alluka-zoldyck": "亚路嘉·揍敌客", "hunterxhunter-knuckle-bine": "拿酷鲁·拜因", "hunterxhunter-shoot-mcmahon": "修特·麦克马洪",
"hunterxhunter-morel-mackernasey": "莫老·马克那希", "hunterxhunter-pakunoda": "派克诺妲", "hunterxhunter-komugi": "小麦",
# Fullmetal Alchemist: Brotherhood
"fma-king-bradley": "金·布拉德雷", "fma-pride": "傲慢", "fma-sloth": "懒惰", "fma-gluttony": "暴食", "fma-may-chang": "梅·张",
"fma-solf-j-kimblee": "索尔夫·J·金布利", "fma-buccaneer": "巴卡尼亚", "fma-jean-havoc": "让·哈伯克",
# Black Clover
"blackclover-liebe": "利贝", "blackclover-zora-ideale": "佐拉·伊迪亚雷", "blackclover-gauche-adlai": "戈修·阿德莱", "blackclover-grey": "格蕾",
"blackclover-gordon-agrippa": "戈登·阿格里帕", "blackclover-henry-legolant": "亨利·雷格兰特", "blackclover-rill-boismortier": "里尔·博瓦莫蒂埃",
"blackclover-dorothy-unsworth": "多萝西·安斯沃斯", "blackclover-william-vangeance": "威廉·凡杰斯",
# One-Punch Man
"onepunchman-child-emperor": "童帝", "onepunchman-blast": "爆破", "onepunchman-metal-knight": "金属骑士", "onepunchman-drive-knight": "驱动骑士",
"onepunchman-flashy-flash": "闪光弗莱士", "onepunchman-sweet-mask": "甜心假面", "onepunchman-watchdog-man": "看门狗侠",
"onepunchman-tanktop-master": "背心尊者", "onepunchman-pig-god": "猪神", "onepunchman-superalloy-darkshine": "超合金黑光",
"onepunchman-lord-boros": "波罗斯", "onepunchman-carnage-kabuto": "阿修罗独角仙",
# Dragon Ball
"dragonball-cell": "沙鲁", "dragonball-goten": "孙悟天", "dragonball-kid-trunks": "幼年特兰克斯", "dragonball-jiren": "吉连",
"dragonball-hit": "希特", "dragonball-goku-black": "黑悟空", "dragonball-zamasu": "扎马斯", "dragonball-kefla": "克菲拉",
# Sword Art Online
"sao-akihiko-kayaba": "茅场晶彦", "sao-yui": "结衣", "sao-sachi": "幸", "sao-bercouli-synthesis-one": "贝尔库利",
"sao-fanatio-synthesis-two": "法娜提欧", "sao-tiese-shtolienen": "缇洁·修特利尼恩", "sao-ronie-arabel": "罗妮耶·阿拉贝尔",
"sao-eiji": "英二", "sao-argo": "阿尔戈", "sao-gabriel-miller": "加百列·米勒", "sao-vassago-casals": "瓦沙克·卡萨尔斯",
"sao-sheyta-synthesis-twelve": "榭塔", "sao-iskahn": "伊斯坎",
# JoJo
"jojo-jonathan-joestar": "乔纳森·乔斯达", "jojo-joseph-joestar": "乔瑟夫·乔斯达", "jojo-jotaro-kujo": "空条承太郎",
"jojo-josuke-higashikata": "东方仗助", "jojo-giorno-giovanna": "乔鲁诺·乔巴拿", "jojo-jolyne-cujoh": "空条徐伦", "jojo-dio-brando": "迪奥·布兰度",
"jojo-caesar-anthonio-zeppeli": "西撒·安东尼奥·齐贝林", "jojo-lisa-lisa": "丽莎丽莎", "jojo-noriaki-kakyoin": "花京院典明",
"jojo-jean-pierre-polnareff": "让·皮埃尔·波鲁纳雷夫", "jojo-iggy": "伊奇", "jojo-okuyasu-nijimura": "虹村亿泰", "jojo-koichi-hirose": "广濑康一",
"jojo-rohan-kishibe": "岸边露伴", "jojo-bruno-bucciarati": "布鲁诺·布加拉提", "jojo-guido-mista": "盖多·米斯达", "jojo-trish-una": "特里休·乌纳",
"jojo-diavolo": "迪亚波罗", "jojo-weather-report": "气象预报", "jojo-enrico-pucci": "恩里克·普奇", "jojo-narciso-anasui": "纳尔西索·安纳苏",
"jojo-ermes-costello": "艾梅斯·科斯特洛", "jojo-foo-fighters": "F·F", "jojo-yoshikage-kira": "吉良吉影",
# Fairy Tail
"fairytail-natsu-dragneel": "纳兹·多拉格尼尔", "fairytail-lucy-heartfilia": "露西·哈特菲利亚", "fairytail-gray-fullbuster": "格雷·佛布斯塔",
"fairytail-erza-scarlet": "艾尔莎·史卡雷特", "fairytail-wendy-marvell": "温蒂·马维尔", "fairytail-happy": "哈比",
"fairytail-jellal-fernandes": "杰拉尔·费尔南德斯", "fairytail-gajeel-redfox": "加吉尔·雷德福克斯", "fairytail-levy-mcgarden": "蕾比·麦克加登",
"fairytail-laxus-dreyar": "拉克萨斯·德雷亚", "fairytail-mirajane-strauss": "米拉珍·斯特劳斯", "fairytail-cana-alberona": "卡娜·阿尔佩罗那",
"fairytail-juvia-lockser": "朱比亚·洛克萨", "fairytail-zeref-dragneel": "杰雷夫·多拉格尼尔", "fairytail-acnologia": "阿克诺洛基亚",
"fairytail-mavis-vermillion": "梅比斯·巴密里欧", "fairytail-sting-eucliffe": "斯汀·尤克里夫", "fairytail-rogue-cheney": "罗格·切尼",
"fairytail-elfman-strauss": "艾尔夫曼·斯特劳斯", "fairytail-lisanna-strauss": "丽莎娜·斯特劳斯", "fairytail-freed-justine": "弗利特·贾斯汀",
"fairytail-gildarts-clive": "基尔达兹·克莱夫", "fairytail-ultear-milkovich": "乌尔蒂亚·米尔科维奇", "fairytail-minerva-orland": "密涅瓦·奥兰多",
"fairytail-kagura-mikazuchi": "神乐·三日月",
# Solo Leveling (official Chinese hanja-based names)
"sololeveling-sung-jinwoo": "成振宇", "sololeveling-cha-hae-in": "车海印", "sololeveling-yoo-jinho": "刘镇浩", "sololeveling-go-gunhee": "高建熙",
"sololeveling-baek-yoonho": "白允浩", "sololeveling-choi-jong-in": "崔钟仁", "sololeveling-woo-jinchul": "禹镇哲", "sololeveling-thomas-andre": "托马斯·安德烈",
"sololeveling-liu-zhigang": "刘志刚", "sololeveling-igris": "伊格里斯", "sololeveling-beru": "贝尔", "sololeveling-bellion": "贝利昂",
"sololeveling-sung-il-hwan": "成一焕", "sololeveling-esil-radiru": "埃希尔·拉迪鲁", "sololeveling-antares": "安塔雷斯", "sololeveling-ashborn": "艾什伯恩",
"sololeveling-park-heejin": "朴熙真", "sololeveling-lee-joohee": "李珠熙", "sololeveling-song-chiyul": "宋治烈", "sololeveling-kang-taeshik": "姜泰植",
"sololeveling-hwang-dongsoo": "黄东洙", "sololeveling-hwang-dongsuk": "黄东锡", "sololeveling-kim-chul": "金哲", "sololeveling-lim-taegyu": "林泰圭",
"sololeveling-ma-dongwook": "马东旭",
# Mob Psycho 100
"mobpsycho-shigeo-kageyama": "影山茂夫", "mobpsycho-arataka-reigen": "灵幻新隆", "mobpsycho-ritsu-kageyama": "影山律",
"mobpsycho-teruki-hanazawa": "花泽辉气", "mobpsycho-dimple": "酒窝", "mobpsycho-tome-kurata": "暗田留", "mobpsycho-katsuya-serizawa": "芹泽克也",
"mobpsycho-sho-suzuki": "铃木将", "mobpsycho-toichiro-suzuki": "铃木统一郎", "mobpsycho-tsubomi-takane": "高岭蕾", "mobpsycho-ichi-mezato": "米里一",
"mobpsycho-musashi-goda": "乡田武藏", "mobpsycho-koyama": "夸山惠", "mobpsycho-mogami-keiji": "最上启示", "mobpsycho-tenga-onigawara": "鬼瓦天牙",
"mobpsycho-emi": "艾米", "mobpsycho-shinji-kamuro": "神室真司", "mobpsycho-mameta-inukawa": "犬川豆太", "mobpsycho-haruto-kijibayashi": "稚子林春人",
"mobpsycho-shirihiko-saruta": "猿田尻彦", "mobpsycho-ryo-shimazaki": "岛崎亮", "mobpsycho-toshiki-minegishi": "峰岸棯树",
"mobpsycho-yusuke-sakurai": "樱威游介", "mobpsycho-matsuo": "魔津尾", "mobpsycho-ishiguro": "遗志黑",
# Tokyo Ghoul
"tokyoghoul-ken-kaneki": "金木研", "tokyoghoul-touka-kirishima": "雾岛董香", "tokyoghoul-hideyoshi-nagachika": "永近英良",
"tokyoghoul-nishiki-nishio": "西尾锦", "tokyoghoul-hinami-fueguchi": "笛口雏实", "tokyoghoul-juuzou-suzuya": "铃屋什造",
"tokyoghoul-kishou-arima": "有马贵将", "tokyoghoul-eto-yoshimura": "芳村爱特", "tokyoghoul-rize-kamishiro": "神代利世",
"tokyoghoul-koutarou-amon": "亚门钢太朗", "tokyoghoul-akira-mado": "真户晓", "tokyoghoul-shuu-tsukiyama": "月山习",
"tokyoghoul-ayato-kirishima": "雾岛绚都", "tokyoghoul-noro": "野吕", "tokyoghoul-uta": "乌塔", "tokyoghoul-renji-yomo": "四方莲示",
"tokyoghoul-yoshimura": "芳村", "tokyoghoul-tatara": "多多良", "tokyoghoul-yakumo-oomori": "大守八云", "tokyoghoul-kureo-mado": "真户吴绪",
"tokyoghoul-seidou-takizawa": "泷泽政道", "tokyoghoul-kurona-yasuhisa": "安久黑奈", "tokyoghoul-nashiro-yasuhisa": "安久奈白",
"tokyoghoul-karren-von-rosewald": "卡莲·冯·罗泽瓦尔特", "tokyoghoul-nimura-furuta": "旧多二福", "tokyoghoul-kuki-urie": "瓜江久生",
"tokyoghoul-hairu-ihei": "伊丙入", "tokyoghoul-tooru-mutsuki": "六月透", "tokyoghoul-saiko-yonebayashi": "米林才子", "tokyoghoul-ginshi-shirazu": "不知吟士",
# Dandadan
"dandadan-momo-ayase": "绫濑桃", "dandadan-ken-takakura": "高仓健", "dandadan-aira-shiratori": "白鸟爱罗", "dandadan-jin-enjoji": "圆城寺仁",
"dandadan-seiko-ayase": "绫濑星子", "dandadan-turbo-granny": "涡轮婆婆", "dandadan-evil-eye": "邪视", "dandadan-vamola": "巴莫拉",
"dandadan-kinta-sakata": "坂田金太", "dandadan-rin-sawaki": "佐胁凛", "dandadan-unji-zuma": "头间云儿", "dandadan-count-saint-germain": "圣日耳曼伯爵",
"dandadan-acrobatic-silky": "杂技丝滑", "dandadan-serpo-alien": "赛尔波星人", "dandadan-flatwoods-monster": "弗拉特伍兹怪物",
"dandadan-mr-mantis-shrimp": "螳螂虾先生", "dandadan-chiquitita": "奇奇蒂塔", "dandadan-taro": "太郎", "dandadan-hana": "花",
"dandadan-rokuro-serpo": "赛尔波六郎", "dandadan-ludris": "鲁德里斯", "dandadan-naki-kito": "鬼头奈希",  # translit
"dandadan-banga": "班加", "dandadan-payase": "帕亚瑟", "dandadan-kashimoto": "卡西莫托",  # translit
# Kaiju No. 8
"kaijuno8-kafka-hibino": "日比野卡夫卡", "kaijuno8-mina-ashiro": "亚白米娜", "kaijuno8-reno-ichikawa": "市川蕾诺",
"kaijuno8-kikoru-shinomiya": "四之宫琪克露", "kaijuno8-soshiro-hoshina": "保科宗四郎", "kaijuno8-isao-shinomiya": "四之宫功",
"kaijuno8-gen-narumi": "鸣海弦", "kaijuno8-iharu-furuhashi": "古桥伊春", "kaijuno8-haruichi-izumo": "出云春一",  # translit
"kaijuno8-aoi-kaguragi": "神乐木葵", "kaijuno8-kaiju-no-9": "怪兽9号", "kaijuno8-hikari-shinomiya": "四之宫光",
"kaijuno8-rin-shinonome": "东云凛", "kaijuno8-akari-minase": "水无濑明里", "kaijuno8-eiji-hasegawa": "长谷川英二", "kaijuno8-keiji-itami": "伊丹启司",
"kaijuno8-tae-nakanoshima": "中之岛妙", "kaijuno8-hakua-igarashi": "五十岚白亚", "kaijuno8-ryo-ikaruga": "斑鸠亮",
"kaijuno8-soichiro-hoshina": "保科宗一郎", "kaijuno8-jugo-ogata": "绪方十吾", "kaijuno8-jura-igarashi": "五十岚朱拉",  # translit
"kaijuno8-kaiju-no-10": "怪兽10号", "kaijuno8-kaiju-no-11": "怪兽11号", "kaijuno8-kaiju-no-12": "怪兽12号",
# Fire Force
"fireforce-shinra-kusakabe": "日下部森罗", "fireforce-arthur-boyle": "亚瑟·博伊尔", "fireforce-maki-oze": "尾濑茉希", "fireforce-tamaki-kotatsu": "环古达",
"fireforce-iris": "爱丽丝", "fireforce-akitaru-obi": "秋樽樱备", "fireforce-takehisa-hinawa": "武久火绳", "fireforce-benimaru-shinmon": "新门红丸",
"fireforce-joker": "小丑", "fireforce-leonard-burns": "莱昂纳德·伯恩斯", "fireforce-sho-kusakabe": "日下部象", "fireforce-haumea": "哈乌美娅",
"fireforce-charon": "卡戎", "fireforce-inca-kasugatani": "春日谷因果", "fireforce-hibana": "公主火华", "fireforce-viktor-licht": "维克托·利希特",
"fireforce-vulcan-joseph": "瓦尔肯·约瑟夫", "fireforce-lisa-isaribi": "莉萨·渔边", "fireforce-yu": "优", "fireforce-giovanni": "乔瓦尼",
"fireforce-arrow": "艾萝", "fireforce-assault": "阿萨尔特", "fireforce-ogun-montgomery": "欧根·蒙哥马利", "fireforce-karim-flam": "卡里姆·弗拉姆",
"fireforce-konro-sagamiya": "相模屋绀炉",
# Others
"sevendeadlysins-demon-king": "魔神王", "tensura-hinata-sakaguchi": "坂口日向", "tensura-masayuki-honjou": "本城正幸",
"deathnote-light-yagami": "夜神月", "deathnote-misa-amane": "弥海砂", "deathnote-touta-matsuda": "松田桃太", "deathnote-kanzou-mogi": "模木完造",
"deathnote-hideki-ide": "伊出英基", "deathnote-kiyomi-takada": "高田清美", "deathnote-teru-mikami": "魅上照", "deathnote-kyousuke-higuchi": "火口卿介",
"deathnote-sayu-yagami": "夜神妆裕", "codegeass-kaname-ougi": "扇要", "codegeass-li-xingke": "黎星刻",
}

JA = {
"onepiece-edward-newgate": "エドワード・ニューゲート",  # was the kanji 二, not katakana ニ
"fairytail-erza-scarlet": "エルザ・スカーレット", "fairytail-wendy-marvell": "ウェンディ・マーベル",
"fairytail-gajeel-redfox": "ガジル・レッドフォックス", "fairytail-levy-mcgarden": "レビィ・マクガーデン",
"spyfamily-emile-elman": "エミール・エルマン", "chainsawman-santa-claus": "サンタクロース",
"tokyoghoul-nashiro-yasuhisa": "安久奈白", "dandadan-jin-enjoji": "円城寺仁", "kaijuno8-hakua-igarashi": "五十嵐ハクア",
"dandadan-rokuro-serpo": "セルポ6郎",
}

GENDER = {"chainsawman-santa-claus": "male"}  # shown as the bearded old man; the reveal is a twist

# Characters whose name is the same in every language (Latin initials are their official name)
SAME_EVERYWHERE = {"codegeass-cc", "codegeass-vv"}

def main():
    p = pathlib.Path("data/roster.json"); roster = json.loads(p.read_text(encoding="utf-8"))
    ids = {c["id"] for s in roster for c in s["chars"]}
    unknown = (set(ZH) | set(JA)) - ids
    assert not unknown, f"unknown ids: {sorted(unknown)}"
    changed = 0
    for s in roster:
        for c in s["chars"]:
            for key, table in (("name_zh", ZH), ("name_ja", JA)):
                new = table.get(c["id"])
                if new and c.get(key) != new: c[key] = new; changed += 1
            if c["id"] in GENDER and c.get("gender") != GENDER[c["id"]]: c["gender"] = GENDER[c["id"]]; changed += 1
            for key in ("name_en", "name_zh", "name_ja"):  # stray spaces
                if c.get(key) and c[key] != c[key].strip(): c[key] = c[key].strip(); changed += 1
    p.write_text(json.dumps(roster, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("changed", changed)

if __name__ == "__main__":
    main()
