// Character ratings used by the computer opponent (and shown in the Gallery).
//
//   slug  power  lead  tank  heal  intel        each 0–10, decimals allowed
//
//   power  combat strength. A rough cross-series scale (10 = universe-level), but the
//          computer only ever compares characters WITHIN one series, so the order inside
//          a series is what matters.
//   lead   command, charisma, decision-making
//   tank   durability, regeneration, protecting others, holding a line
//   heal   real healing / rescue / sustain for teammates (not just self-regeneration)
//   intel  strategy, information gathering, tactics
//
// These are judgement calls, made to match how the AI referee scores roles (role
// execution first, raw power second). Edit freely: one line per character. FORMS
// overrides individual values for a character's verified eras/forms.

export const ATTRIBUTES = {
onepiece: `
monkey-d-luffy 9 9 8 0 4
roronoa-zoro 8.5 5 8 0 3
nami 3 4 2 1 8
sanji 8 5 6 2 5
nico-robin 6 4 3 2 9
tony-tony-chopper 5 2 5 10 6
usopp 3 3 1 1 6
franky 6 4 7 1 6
brook 6 3 5 2 4
jinbe 7.5 7 8 2 6
portgas-d-ace 7.5 7 6 0 4
sabo 8 8 6 0 6
trafalgar-law 8 8 4 8 9
boa-hancock 7.5 7 5 0 4
shanks 9.5 10 7 0 7
yamato 8.5 6 7 0 4
eustass-kid 8 7 6 0 3
buggy 3 6 5 0 5
crocodile 7 7 7 0 8
donquixote-doflamingo 8 8 5 3 9
charlotte-katakuri 8.5 7 7 0 7
marco 8.5 8 9 9 6
perona 4 3 3 0 5
vinsmoke-reiju 6 4 5 6 5
carrot 5.5 4 3 0 3
koala 5 5 4 1 6
dracule-mihawk 9 6 7 0 6
edward-newgate 9.5 10 9 0 6
kaido 9.5 8 10 0 4
charlotte-linlin 9.5 8 10 0 3
kuzan 8.5 6 7 0 6
sakazuki 9 8 8 0 6
bartolomeo 6 4 9 2 3
kozuki-oden 9 9 7 0 5
marshall-d-teach 9 8 8 0 7
monkey-d-garp 9 8 8 0 5
borsalino 9 6 7 0 6
monkey-d-dragon 9 10 7 0 8
enel 8 7 6 0 5
rob-lucci 8 6 7 0 6
smoker 7 7 7 0 6
bartholomew-kuma 8.5 6 9 3 6
nefertari-vivi 3 8 2 1 6
`,
naruto: `
naruto-uzumaki 8.5 9 8 5 5
sasuke-uchiha 9 5 5 0 7
sakura-haruno 6 4 6 9 6
kakashi-hatake 7.5 8 5 0 9
hinata-hyuga 5 3 4 2 6
itachi-uchiha 8.5 6 5 1 10
madara-uchiha 9.5 9 8 1 8
minato-namikaze 8.5 9 5 0 9
tsunade 7.5 9 8 10 6
jiraiya 7.5 7 5 1 8
gaara 7.5 8 9 1 6
shikamaru-nara 5 7 2 0 10
ino-yamanaka 4 4 2 5 8
temari 5.5 5 3 0 6
neji-hyuga 6 4 6 0 6
rock-lee 6 3 5 0 3
might-guy 8 6 6 0 5
orochimaru 8 7 7 3 9
killer-b 8 6 8 2 4
konan 7 5 5 0 6
pain 8.5 8 6 5 8
obito-uchiha 9 6 8 0 8
kushina-uzumaki 7 6 7 2 5
sai 5 3 2 0 7
sarada-uchiha 5 6 3 0 5
boruto-uzumaki 6.5 5 4 0 6
hashirama-senju 9.5 10 9 9 7
tobirama-senju 8.5 8 5 1 10
kabuto-yakushi 8 5 7 9 9
deidara 7 4 3 0 5
sasori 6.5 4 5 0 7
nagato 8.5 8 5 4 8
kaguya-ootsutsuki 10 7 9 0 6
kurama 9.5 5 10 4 6
hiruzen-sarutobi 8 9 6 0 9
kisame-hoshigaki 8 5 9 0 6
kakuzu 7.5 4 9 0 6
hidan 6.5 3 9 0 2
yamato 7 6 8 1 6
asuma-sarutobi 6.5 7 5 0 6
`,
jjk: `
satoru-gojo 9.5 8 10 2 8
yuji-itadori 7 5 8 2 4
megumi-fushiguro 6.5 5 4 0 8
nobara-kugisaki 5 4 3 0 5
ryomen-sukuna 10 7 9 3 9
kento-nanami 7 7 6 0 8
yuta-okkotsu 8.5 6 7 9 6
maki-zenin 8 5 7 0 5
suguru-geto 8.5 9 6 0 8
aoi-todo 7.5 6 7 0 9
toji-fushiguro 8.5 3 7 0 8
choso 7 6 6 2 5
mai-zenin 3 2 2 0 4
kasumi-miwa 3 2 3 0 2
utahime-iori 4 6 2 3 6
mei-mei 6.5 5 4 0 7
panda 5 3 8 0 3
toge-inumaki 5.5 3 2 0 4
mahito 8 5 8 0 7
jogo 8 4 5 0 4
shoko-ieiri 1 4 1 10 7
kirara-hoshi 4 3 4 0 5
kinji-hakari 8 6 9 0 5
yuki-tsukumo 9 7 7 0 8
naoya-zenin 6.5 4 4 0 5
kokichi-muta 5 3 5 0 8
uraume 7.5 4 5 0 6
riko-amanai 0.5 2 1 0 2
kenjaku 9 9 7 0 10
hiromi-higuruma 8 6 5 0 9
hana-kurusu 7 4 5 5 4
noritoshi-kamo 6 6 5 2 6
masamichi-yaga 6 8 5 0 6
takuma-ino 5.5 4 5 0 5
ui-ui 5 2 3 4 6
momo-nishimiya 4.5 3 3 0 6
`,
bleach: `
ichigo-kurosaki 9 7 8 1 4
rukia-kuchiki 7 6 5 4 6
byakuya-kuchiki 8 8 6 0 7
renji-abarai 7 6 7 0 4
sosuke-aizen 10 9 10 2 10
toshiro-hitsugaya 8 8 6 1 7
yoruichi-shihouin 8 7 5 1 7
kisuke-urahara 8.5 7 6 6 10
orihime-inoue 3 2 7 10 3
kenpachi-zaraki 9 5 9 0 1
grimmjow-jaegerjaquez 7.5 5 6 0 3
ulquiorra-cifer 8.5 5 8 0 7
rangiku-matsumoto 6 5 4 0 4
soi-fon 7 7 4 0 6
retsu-unohana 9 8 8 10 8
mayuri-kurotsuchi 8 6 8 6 10
shunsui-kyoraku 9 9 6 0 9
jushiro-ukitake 8 8 5 1 7
nelliel-tu-odelschwanck 7.5 5 6 7 4
tier-harribel 8 7 6 0 6
gin-ichimaru 8 5 4 0 8
nnoitra-gilga 7.5 4 8 0 3
shinji-hirako 8 8 5 0 7
uryu-ishida 7.5 5 4 3 8
genryusai-shigekuni-yamamoto 9.5 10 8 0 8
yhwach 10 10 9 3 9
jugram-haschwalth 8.5 7 8 1 8
bambietta-basterbine 6.5 4 4 0 3
askin-nakk-le-vaar 8 5 9 0 8
senjumaru-shutara 8.5 7 6 2 9
ichibe-hyousube 9.5 9 8 0 9
isshin-kurosaki 8.5 7 7 2 6
coyote-starrk 8.5 5 6 0 6
kaname-tousen 7.5 6 6 0 7
yasutora-sado 6.5 4 8 0 4
izuru-kira 6 5 4 5 6
ikkaku-madarame 6.5 4 6 0 3
yachiru-kusajishi 6 3 5 0 2
hanatarou-yamada 2 2 3 8 4
`,
demonslayer: `
tanjiro-kamado 7 7 6 0 6
nezuko-kamado 6.5 3 8 4 2
zenitsu-agatsuma 6 2 3 0 3
inosuke-hashibira 6 3 6 0 3
giyu-tomioka 8 6 6 0 6
shinobu-kocho 6 6 3 7 9
kyojuro-rengoku 8 9 7 0 6
tengen-uzui 8 8 7 1 9
mitsuri-kanroji 7.5 5 6 0 4
muichiro-tokito 8 5 5 0 7
sanemi-shinazugawa 8 6 8 0 5
muzan-kibutsuji 9.5 9 10 2 8
kanao-tsuyuri 6.5 3 4 2 7
genya-shinazugawa 6 3 7 0 4
gyomei-himejima 9 8 9 0 7
obanai-iguro 7.5 5 5 0 6
kanae-kocho 7 6 4 4 6
aoi-kanzaki 1 3 1 8 5
daki 7 4 7 0 3
gyutaro 8 5 8 0 6
akaza 8.5 5 9 0 6
doma 9 6 9 0 7
kokushibo 9.5 7 9 0 7
hantengu 8 4 9 0 6
gyokko 7 3 6 0 4
tamayo 3 5 5 9 10
yushiro 4 3 5 3 7
kagaya-ubuyashiki 0.5 10 1 0 9
sakonji-urokodaki 6.5 6 5 1 7
sabito 6 5 5 0 5
makomo 4.5 3 3 0 5
nakime 7 3 6 0 8
rui 7 5 7 0 5
enmu 7 4 6 0 7
kaigaku 7.5 3 6 0 4
`,
chainsawman: `
denji 7 3 9 0 2
power 6 2 7 2 1
makima 9.5 9 10 0 10
aki-hayakawa 6 6 4 0 6
kobeni-higashiyama 4 1 3 0 3
himeno 4 6 2 0 6
reze 8 4 8 0 7
angel-devil 5 2 5 0 4
kishibe 7.5 8 6 0 9
quanxi 8 7 5 0 6
beam 5 2 5 0 2
asa-mitaka 4 3 3 0 5
yoru 8.5 6 7 0 6
fami 7 5 7 1 8
nayuta 8 6 6 0 7
katana-man 6 3 7 0 3
hirofumi-yoshida 6 4 5 0 8
santa-claus 8 6 8 0 8
akane-sawatari 5 5 3 0 6
barem-bridge 6 4 7 0 4
pochita 10 5 10 0 3
violence-fiend 6.5 3 6 0 3
princi 6 4 5 3 6
cosmo 6 2 4 0 2
long 6 3 5 0 3
darkness-devil 9.5 4 9 0 6
gun-devil 9 3 8 0 4
fumiko-mifune 6 4 4 0 7
haruka-iseumi 5 4 4 0 4
`,
spyfamily: `
loid-forger 6 7 4 3 10
yor-forger 7.5 3 6 0 3
anya-forger 1 2 1 0 8
damian-desmond 0.5 5 1 0 4
becky-blackbell 0.5 3 1 0 3
fiona-frost 5.5 4 4 0 8
yuri-briar 5 5 6 0 5
franky-franklin 1 2 1 1 8
sylvia-sherwood 3 9 3 0 9
henry-henderson 2 6 3 0 5
melinda-desmond 1 4 1 0 6
bond-forger 3 1 4 0 6
donovan-desmond 1 8 1 0 9
emile-elman 0.5 1 1 0 2
ewen-egeburg 0.5 1 1 0 2
camilla 1 2 1 0 3
sharon 0.5 2 1 0 3
dominic 1 2 1 0 3
martha-marriott 3 5 3 1 5
bill-watkins 2 2 5 0 2
george-glooman 0.5 2 1 0 2
murdoch-swan 1 4 1 0 3
shopkeeper 4 7 3 0 8
matthew-mcmahon 5 5 4 0 6
wheeler 5 5 4 0 8
`,
frieren: `
frieren 9 6 5 1 9
fern 7.5 3 4 0 6
stark 7 3 8 0 3
himmel 8 10 6 0 6
heiter 6 5 5 10 7
eisen 8 5 10 0 5
serie 10 9 7 1 10
flamme 8.5 8 5 0 9
ubel 7.5 2 4 0 5
land 6.5 3 5 0 7
denken 7 7 5 0 8
methode 6.5 5 5 5 7
wirbel 7 7 5 0 7
laufen 5 3 3 0 4
kanne 5 3 3 0 4
lawine 5 3 4 0 4
aura 8.5 7 6 0 7
lernen 8 6 5 0 7
richter 6.5 5 6 0 6
edel 4 3 3 0 7
sense 7 6 5 0 7
genau 7 6 5 0 6
kraft 7.5 5 8 4 7
sein 5.5 5 5 9 6
lugner 7.5 5 5 0 6
macht 9 6 7 0 8
solitar 8.5 4 6 0 8
qual 8 5 5 0 7
linie 7 3 5 0 5
draht 6.5 3 4 0 4
ehre 6 4 4 0 5
`,
aot: `
eren-yeager 9 7 8 0 5
mikasa-ackerman 7.5 4 5 0 5
armin-arlert 6 6 5 0 10
levi-ackerman 8 8 5 1 7
erwin-smith 5 10 3 0 10
hange-zoe 5 8 3 2 9
jean-kirstein 5 8 4 0 6
connie-springer 4 3 3 0 3
sasha-blouse 4 3 3 0 4
reiner-braun 8 6 10 0 5
annie-leonhart 7.5 3 7 0 6
historia-reiss 2 9 2 1 5
zeke-yeager 8.5 8 6 0 9
pieck-finger 6.5 5 6 2 9
porco-galliard 7.5 4 6 0 4
ymir 7 3 6 0 5
gabi-braun 4 4 3 0 5
falco-grice 5 3 5 0 4
bertholdt-hoover 8.5 3 7 0 4
marcel-galliard 6.5 6 5 0 5
kenny-ackerman 7 6 5 0 7
petra-ral 4 4 3 0 4
floch-forster 4 6 3 0 5
onyankopon 2 4 2 1 6
yelena 4 6 3 0 7
grisha-yeager 7 6 6 6 7
uri-reiss 8 8 6 0 6
dot-pixis 3 9 3 0 9
theo-magath 4 8 4 0 8
mike-zacharias 6 6 5 0 6
rod-reiss 4 6 6 0 5
hannes 3 5 4 0 4
`,
mha: `
izuku-midoriya 8.5 8 6 0 8
katsuki-bakugo 8 6 6 0 8
shoto-todoroki 8 6 6 0 6
ochaco-uraraka 5 5 3 4 5
tenya-iida 6 7 4 3 5
tsuyu-asui 5 4 3 3 6
momo-yaoyorozu 5.5 7 5 3 9
eijiro-kirishima 6.5 5 9 0 3
denki-kaminari 5.5 3 3 0 2
kyoka-jiro 5 3 3 0 7
fumikage-tokoyami 6.5 4 5 0 5
shota-aizawa 6.5 7 4 0 8
all-might 9 10 8 0 6
endeavor 8.5 8 7 0 7
hawks 8 7 5 4 9
mirko 7.5 5 6 0 4
tomura-shigaraki 9 8 8 1 7
dabi 8 5 5 0 6
himiko-toga 5 3 4 0 5
nejire-hado 6.5 4 4 0 4
mirio-togata 7.5 6 9 1 7
tamaki-amajiki 7 3 6 0 5
mina-ashido 5 4 3 0 3
hitoshi-shinso 5 3 3 0 7
twice 6.5 3 4 0 4
stain 6.5 6 5 0 6
all-for-one 9.5 9 8 2 10
star-and-stripe 9 9 7 0 7
kai-chisaki 7.5 7 7 8 8
recovery-girl 0.5 6 1 10 6
eri 2 2 2 10 3
lady-nagant 7 4 5 0 7
gran-torino 6.5 6 5 0 7
`,
hunterxhunter: `
gon-freecss 7.5 5 6 0 3
killua-zoldyck 7.5 5 6 0 8
kurapika 7.5 6 5 7 9
leorio-paradinight 4 4 4 6 5
hisoka-morow 8 3 7 1 8
chrollo-lucilfer 8.5 10 6 2 10
biscuit-krueger 7.5 6 6 6 8
kite 7 7 5 0 7
isaac-netero 9 9 7 0 8
meruem 10 9 9 2 10
neferpitou 9 4 6 9 6
machi-komacine 6.5 4 5 8 7
illumi-zoldyck 8 5 6 0 8
feitan-portor 7.5 3 5 0 5
shizuku-murasaki 6.5 2 4 0 3
palm-siberia 6.5 3 5 0 7
ging-freecss 8.5 7 6 1 10
silva-zoldyck 8.5 8 7 0 8
zeno-zoldyck 8.5 7 7 0 8
alluka-zoldyck 8 2 4 10 3
knuckle-bine 6.5 4 6 0 5
shoot-mcmahon 6.5 4 5 0 5
morel-mackernasey 7 7 6 0 8
pakunoda 5 4 4 0 8
komugi 0.5 2 2 0 9
menthuthuyoupi 9 3 9 0 2
shaiapouf 8.5 4 6 3 9
razor 8 6 7 0 6
uvogin 7.5 4 9 0 2
phinks-magcub 7.5 3 6 0 4
nobunaga-hazama 7 4 5 0 4
`,
fma: `
edward-elric 7.5 7 5 1 9
alphonse-elric 7 4 9 2 7
roy-mustang 8.5 9 5 1 9
riza-hawkeye 5 5 3 1 8
winry-rockbell 1 3 1 5 6
maes-hughes 4 6 3 0 10
alex-louis-armstrong 7.5 6 9 0 4
olivier-mira-armstrong 7 10 5 0 8
ling-yao 7 8 6 0 6
lan-fan 5 3 4 0 5
scar 8 6 6 1 7
greed 8 8 10 0 6
lust 7.5 4 8 0 6
envy 7 3 8 0 7
izumi-curtis 7.5 6 5 1 7
van-hohenheim 9 7 9 4 10
king-bradley 8.5 9 5 0 9
pride 8.5 6 7 0 9
sloth 8 1 9 0 1
gluttony 6.5 1 7 0 1
may-chang 6 4 4 9 7
solf-j-kimblee 7.5 4 5 0 8
father 10 9 10 2 10
buccaneer 6 5 7 0 4
jean-havoc 4 4 3 0 5
tim-marcoh 3 4 3 8 8
grumman 3 8 3 0 9
kain-fuery 2 3 2 0 6
heymans-breda 3 4 3 0 7
vato-falman 2.5 3 3 0 7
`,
blackclover: `
asta 8.5 7 7 0 3
yuno 8.5 6 6 0 6
noelle-silva 7.5 5 6 1 4
yami-sukehiro 8.5 9 7 0 6
mereoleona-vermillion 8.5 8 8 0 4
fuegoleon-vermillion 8 9 7 0 6
luck-voltia 7 3 4 0 4
magna-swing 6 4 5 0 3
vanessa-enoteca 6.5 4 5 6 6
finral-roulacase 5 3 3 5 5
charmy-pappitson 6.5 2 6 7 2
nacht-faust 8.5 7 6 0 9
julius-novachrono 9 9 7 1 9
charlotte-roselei 8 8 7 2 6
secre-swallowtail 5.5 3 4 7 8
mimosa-vermillion 5 3 4 9 6
liebe 8 4 7 0 3
zora-ideale 6.5 4 5 0 9
gauche-adlai 6 2 6 0 5
grey 5 2 4 2 5
gordon-agrippa 6 3 6 2 5
henry-legolant 6 3 9 2 4
rill-boismortier 7.5 6 5 0 7
dorothy-unsworth 8 6 6 0 8
william-vangeance 8 8 7 6 8
lucius-zogratis 10 9 8 6 10
lumiere-silvamillion-clover 9 9 7 3 8
dante-zogratis 8.5 5 9 0 5
vanica-zogratis 8.5 3 7 0 3
zenon-zogratis 8.5 6 7 0 6
patry 8 7 6 2 7
`,
onepunchman: `
saitama 10 4 10 0 3
genos 7 4 7 0 6
tatsumaki 9 5 8 4 6
fubuki 6.5 8 5 2 6
bang 8.5 7 6 0 8
king 0.5 5 1 0 8
atomic-samurai 8 7 6 0 6
speed-o-sound-sonic 6.5 3 4 0 5
mumen-rider 1 5 4 3 3
garou 9.5 4 9 0 8
metal-bat 7 5 8 0 3
child-emperor 5 5 6 4 10
puri-puri-prisoner 6.5 3 8 0 2
zombieman 5 4 10 0 6
blast 9.5 8 8 2 9
metal-knight 7.5 6 8 1 9
drive-knight 7 4 6 0 7
flashy-flash 8 4 5 0 6
sweet-mask 7 5 7 0 4
watchdog-man 7.5 3 7 0 5
tanktop-master 6 6 6 0 3
pig-god 6.5 2 9 2 2
superalloy-darkshine 7.5 3 10 0 2
lord-boros 9.5 7 9 0 5
carnage-kabuto 7 2 8 0 2
orochi 9 7 9 0 3
psykos 8.5 7 6 0 9
elder-centipede 8.5 2 9 0 2
gouketsu 8 5 8 0 3
suiryu 7 4 6 0 4
`,
dragonball: `
goku 10 7 8 0 5
vegeta 9.5 7 8 0 6
bulma 0.5 6 1 3 10
gohan 9 5 7 0 8
piccolo 8 7 8 1 9
trunks 8.5 5 6 0 6
future-trunks 8.5 7 6 0 7
android-18 7.5 4 7 0 5
android-17 8.5 6 8 0 7
frieza 9.5 9 8 0 8
beerus 10 7 9 0 6
whis 10 6 10 8 10
chi-chi 2 5 2 2 3
videl 4 4 3 0 4
broly 9.5 2 9 0 1
krillin 6 5 4 0 7
master-roshi 6.5 6 5 1 8
majin-buu 9 3 10 9 2
cell 9 6 10 0 8
goten 6.5 2 5 0 3
kid-trunks 6.5 3 5 0 4
jiren 10 6 9 0 6
hit 9 4 6 0 8
goku-black 9.5 7 8 1 8
zamasu 8.5 7 10 6 8
kefla 9 4 7 0 3
vegito 10 6 9 0 7
gogeta 10 6 9 0 7
gotenks 9 3 6 0 2
toppo 9 7 8 0 5
android-16 7.5 3 8 0 5
tien-shinhan 7 5 5 0 6
yamcha 5 4 4 0 4
dende 1 4 2 10 5
`,
sao: `
kirito 8 7 6 0 7
asuna 7 8 5 6 7
sinon 6.5 4 3 0 7
leafa 6 3 4 3 4
alice-zuberg 8 7 7 3 7
eugeo 7 5 5 1 5
yuuki-konno 7.5 6 5 0 5
klein 4.5 6 5 0 4
agil 4.5 5 7 0 5
silica 3 2 2 5 3
lisbeth 3.5 3 4 1 5
administrator 9.5 8 8 5 10
akihiko-kayaba 8.5 8 10 1 10
yui 1 2 1 2 9
sachi 2 2 2 0 2
bercouli-synthesis-one 8.5 9 7 1 8
fanatio-synthesis-two 7.5 7 6 0 6
tiese-shtolienen 4 3 3 0 4
ronie-arabel 4 3 3 0 4
eiji 6 4 5 0 5
argo 3 3 2 0 10
gabriel-miller 8.5 7 8 0 8
vassago-casals 6.5 5 5 0 6
sheyta-synthesis-twelve 7.5 4 5 0 5
iskahn 7 8 6 0 4
cardinal 7.5 6 5 6 10
selka-zuberg 3 3 2 7 5
nobuyuki-sugou 4 6 4 0 7
death-gun 5 4 3 0 7
kuradeel 4 3 4 0 3
`,
jojo: `
jonathan-joestar 6 7 7 4 5
joseph-joestar 6.5 6 5 3 10
jotaro-kujo 8 7 7 0 8
josuke-higashikata 7 5 6 10 6
giorno-giovanna 9 9 6 8 8
jolyne-cujoh 7 6 6 3 6
dio-brando 9 8 9 0 8
caesar-anthonio-zeppeli 5.5 5 5 3 5
lisa-lisa 6 7 5 3 7
noriaki-kakyoin 6 4 3 0 8
jean-pierre-polnareff 6.5 4 5 0 4
iggy 5 1 6 0 6
okuyasu-nijimura 6.5 3 5 0 2
koichi-hirose 5 4 4 0 6
rohan-kishibe 6 4 3 2 9
bruno-bucciarati 7 9 6 4 8
guido-mista 6 4 4 0 6
trish-una 4 3 5 0 4
diavolo 9 8 6 0 8
weather-report 8 4 6 0 6
enrico-pucci 9 8 6 0 9
narciso-anasui 6.5 3 5 2 6
ermes-costello 6 4 5 0 5
foo-fighters 5.5 3 6 6 7
yoshikage-kira 7.5 5 6 0 9
kars 9 7 9 0 8
wamuu 8.5 5 8 0 6
esidisi 8 5 8 0 6
vanilla-ice 8 3 7 0 3
muhammad-avdol 6.5 6 5 0 7
hol-horse 5 3 3 0 5
robert-e-o-speedwagon 2 7 3 2 6
`,
fairytail: `
natsu-dragneel 8.5 7 7 0 3
lucy-heartfilia 6 5 4 2 7
gray-fullbuster 7.5 5 6 0 5
erza-scarlet 8.5 9 8 0 7
wendy-marvell 6 3 3 10 5
happy 1 2 2 3 4
jellal-fernandes 8.5 8 6 0 8
gajeel-redfox 8 5 9 0 4
levy-mcgarden 4 4 3 2 10
laxus-dreyar 8.5 7 7 0 5
mirajane-strauss 8 6 6 1 5
cana-alberona 5.5 5 4 0 7
juvia-lockser 7 4 8 2 4
zeref-dragneel 9.5 8 9 0 10
acnologia 10 4 10 0 5
mavis-vermillion 8.5 10 6 3 10
sting-eucliffe 7.5 7 6 0 5
rogue-cheney 7.5 5 6 0 6
elfman-strauss 6.5 4 8 0 2
lisanna-strauss 5 3 4 0 4
freed-justine 7 5 6 0 8
gildarts-clive 9 7 7 0 6
ultear-milkovich 8 6 6 4 8
minerva-orland 7.5 7 6 0 7
kagura-mikazuchi 7.5 6 6 0 5
makarov-dreyar 8.5 10 8 0 7
irene-belserion 9.5 7 8 0 8
august 9.5 7 8 0 8
larcade-dragneel 9 5 7 0 6
brandish 8.5 4 6 0 6
chelia-blendy 6.5 3 4 9 4
`,
sololeveling: `
sung-jinwoo 10 9 8 3 8
cha-hae-in 7.5 6 5 0 6
yoo-jinho 2 5 3 0 5
go-gunhee 8 10 6 0 8
baek-yoonho 7 8 7 0 7
choi-jong-in 7.5 8 4 0 7
woo-jinchul 6 6 5 0 8
thomas-andre 9 8 10 0 5
liu-zhigang 8.5 7 6 0 6
igris 8 8 7 0 6
beru 8.5 5 8 8 6
bellion 9 8 8 0 7
sung-il-hwan 8.5 6 7 0 7
esil-radiru 6.5 6 5 0 6
antares 10 9 9 0 8
ashborn 10 9 9 2 9
park-heejin 4 3 3 5 4
lee-joohee 3 3 2 8 5
song-chiyul 5 5 5 0 5
kang-taeshik 5.5 4 4 0 6
hwang-dongsoo 8 5 7 0 4
hwang-dongsuk 5 5 4 0 4
kim-chul 5.5 4 7 0 3
lim-taegyu 6.5 5 4 0 6
ma-dongwook 6.5 6 5 0 5
kamish 9.5 5 9 0 5
tusk 8 5 6 0 7
iron 7 3 9 0 2
kaisel 7.5 3 6 0 4
sung-jinah 0.5 3 1 0 4
`,
mobpsycho: `
shigeo-kageyama 9.5 4 8 3 4
arataka-reigen 1.5 8 2 2 10
ritsu-kageyama 6.5 4 5 0 7
teruki-hanazawa 7 6 7 0 6
dimple 5 3 4 0 6
tome-kurata 0.5 3 1 0 4
katsuya-serizawa 8.5 4 8 0 3
sho-suzuki 7.5 5 6 0 6
toichiro-suzuki 9.5 9 8 0 8
tsubomi-takane 0.5 2 1 0 3
ichi-mezato 0.5 3 1 0 6
musashi-goda 0.5 4 5 0 2
koyama 5 4 5 0 4
mogami-keiji 9 5 7 0 8
tenga-onigawara 0.5 5 6 0 2
emi 0.5 3 1 0 4
shinji-kamuro 5 6 4 0 7
mameta-inukawa 0.5 2 1 0 2
haruto-kijibayashi 4 3 4 0 3
shirihiko-saruta 4 3 4 0 3
ryo-shimazaki 8 4 5 0 8
toshiki-minegishi 7 3 7 3 4
yusuke-sakurai 5 3 4 0 4
matsuo 7 4 5 0 6
ishiguro 5 3 4 0 4
`,
tokyoghoul: `
ken-kaneki 9 8 9 1 6
touka-kirishima 7 6 5 0 5
hideyoshi-nagachika 1 5 2 0 10
nishiki-nishio 6 4 6 0 6
hinami-fueguchi 6 3 5 0 7
juuzou-suzuya 8 6 6 0 6
kishou-arima 9.5 8 7 0 9
eto-yoshimura 9 8 8 0 10
rize-kamishiro 7.5 3 8 0 4
koutarou-amon 7 6 7 0 5
akira-mado 6 7 4 0 9
shuu-tsukiyama 7 5 6 0 5
ayato-kirishima 7 5 5 0 5
noro 8 3 10 0 3
uta 7.5 5 6 0 7
renji-yomo 7.5 6 6 0 6
yoshimura 9 8 8 0 8
tatara 8.5 7 7 0 7
yakumo-oomori 7.5 4 7 0 3
kureo-mado 7 5 5 0 8
seidou-takizawa 7.5 3 8 0 3
kurona-yasuhisa 6.5 3 6 0 4
nashiro-yasuhisa 6.5 3 6 0 4
karren-von-rosewald 6.5 5 5 0 5
nimura-furuta 8 6 6 0 9
kichimura-washuu 8 8 6 0 9
kuki-urie 7.5 6 6 0 7
hairu-ihei 7 3 4 0 4
tooru-mutsuki 6.5 3 5 0 5
saiko-yonebayashi 6 3 5 0 5
ginshi-shirazu 6 5 5 0 3
`,
dandadan: `
momo-ayase 7 6 6 2 6
ken-takakura 7.5 5 7 0 4
aira-shiratori 6.5 3 6 4 4
jin-enjoji 6.5 4 5 0 5
seiko-ayase 7 7 5 5 8
turbo-granny 7 4 5 0 5
evil-eye 8 3 6 0 3
vamola 7.5 3 7 3 4
kinta-sakata 3 4 6 0 5
rin-sawaki 6 5 4 0 6
unji-zuma 6.5 4 5 0 5
count-saint-germain 7 7 6 4 9
acrobatic-silky 6.5 3 5 0 3
serpo-alien 6 5 5 0 6
flatwoods-monster 6.5 3 6 0 4
mr-mantis-shrimp 6.5 3 7 0 3
chiquitita 8 3 9 0 3
taro 2 2 6 0 2
hana 2 2 3 0 2
rokuro-serpo 5 5 5 0 6
ludris 5 3 4 0 4
naki-kito 5 4 4 0 5
banga 7.5 5 6 0 6
payase 5 3 3 0 3
kashimoto 6 4 5 0 5
`,
kaijuno8: `
kafka-hibino 9 5 9 1 6
mina-ashiro 8.5 9 8 0 6
reno-ichikawa 6.5 4 5 0 5
kikoru-shinomiya 7.5 7 6 0 6
soshiro-hoshina 8 7 6 0 8
isao-shinomiya 8.5 9 7 0 8
gen-narumi 8.5 6 6 0 9
iharu-furuhashi 5 3 4 0 4
haruichi-izumo 5.5 5 4 0 6
aoi-kaguragi 5.5 3 6 0 4
kaiju-no-9 9.5 7 9 2 10
hikari-shinomiya 8 7 6 0 7
rin-shinonome 5 3 4 0 4
akari-minase 5 3 4 0 4
eiji-hasegawa 5 7 5 0 7
keiji-itami 5 5 4 0 5
tae-nakanoshima 5 4 4 0 5
hakua-igarashi 5 3 4 0 4
ryo-ikaruga 5 3 4 0 4
soichiro-hoshina 7.5 6 6 0 6
jugo-ogata 5 4 4 0 5
jura-igarashi 5 3 4 0 4
kaiju-no-10 8 3 8 0 4
kaiju-no-11 7 3 7 0 5
kaiju-no-12 7 3 7 0 5
`,
fireforce: `
shinra-kusakabe 9 6 6 1 4
arthur-boyle 8.5 4 6 0 1
maki-oze 6 4 7 0 4
tamaki-kotatsu 5 2 4 0 3
iris 1 3 1 6 5
akitaru-obi 5 9 8 0 5
takehisa-hinawa 6 6 4 0 9
benimaru-shinmon 9 9 7 0 5
joker 8 5 5 0 9
leonard-burns 8.5 8 7 0 7
sho-kusakabe 8.5 4 5 0 5
haumea 8 5 4 0 8
charon 8 3 9 0 3
inca-kasugatani 6 3 4 0 6
hibana 6 6 4 4 8
viktor-licht 1 3 1 3 10
vulcan-joseph 4 4 5 2 9
lisa-isaribi 6.5 3 5 0 4
yu 4 2 3 0 3
giovanni 7.5 5 6 0 7
arrow 6.5 3 4 0 5
assault 6 3 6 0 3
ogun-montgomery 6.5 4 5 0 4
karim-flam 7 6 5 2 6
konro-sagamiya 7 6 5 0 5
dragon 9 3 8 0 3
kurono 7.5 4 6 0 6
rekka-hoshimiya 7 5 5 0 4
nataku-son 7 2 5 0 2
`,
sevendeadlysins: `
meliodas 9.5 9 8 0 7
elizabeth-liones 5 6 3 10 5
hawk 2 4 6 0 3
diane 8 5 9 1 4
ban 8.5 5 10 3 5
king 8.5 6 6 3 6
gowther 7.5 4 5 3 9
merlin 9 7 6 6 10
escanor 9.5 7 8 0 4
gilthunder 7 6 5 0 5
howzer 6.5 5 5 0 4
griamore 6 4 9 0 3
hendrickson 7.5 6 6 0 7
dreyfus 7.5 7 6 0 5
zeldris 9 8 8 0 7
estarossa 9 6 8 0 6
derieri 8 4 7 0 3
monspeet 8 5 6 0 8
galand 8 4 9 0 3
melascula 7.5 4 6 0 6
grayroad 7.5 3 8 0 6
fraudrin 8 5 7 0 7
gloxinia 8 6 6 4 6
drole 8 6 9 0 5
chandler 8.5 4 7 0 7
cusack 8.5 5 6 0 7
arthur-pendragon 7.5 8 6 0 6
elaine 5.5 4 4 7 5
jericho 5.5 4 4 0 4
ludociel 9 8 7 2 7
demon-king 10 9 9 0 8
`,
tensura: `
rimuru-tempest 10 10 9 8 10
veldora-tempest 10 5 10 0 4
milim-nava 10 6 9 0 5
benimaru 8.5 9 7 0 8
shuna 5.5 5 4 9 8
shion 8 4 8 0 2
souei 7.5 5 5 0 9
hakurou 8 6 6 0 8
gobta 5 4 5 0 3
ranga 7.5 4 7 0 4
diablo 9.5 7 8 2 10
shizue-izawa 6.5 5 5 0 6
geld 8 7 10 0 5
gabiru 6 5 6 0 3
treyni 6.5 4 5 5 6
kaijin 3 4 4 0 6
hinata-sakaguchi 8.5 8 6 4 9
clayman 7 6 5 0 8
guy-crimson 10 9 9 0 9
leon-cromwell 9 7 7 0 8
ramiris 4 4 7 2 5
carrion 8 7 7 0 5
frey 8 6 6 0 7
luminous-valentine 9.5 8 8 7 8
gazel-dwargo 8 9 7 0 8
masayuki-honjou 3 6 6 0 3
yuuki-kagurazaka 8 7 6 0 10
testarossa 9 6 7 0 9
rigurd 3 7 5 0 5
`,
rezero: `
subaru-natsuki 2 7 4 2 9
emilia 8 7 6 7 4
rem 7 4 6 6 5
ram 6.5 5 4 2 8
beatrice 7.5 4 7 3 9
puck 9 4 7 0 6
roswaal-l-mathers 9 7 6 3 10
felt 4 6 3 0 5
reinhard-van-astrea 10 7 10 1 6
crusch-karsten 7 9 5 0 7
felix-argyle 4 3 3 10 7
wilhelm-van-astrea 8 6 6 0 7
priscilla-barielle 7.5 9 6 0 8
aldebaran 7.5 4 8 0 8
anastasia-hoshin 3 8 3 0 10
julius-juukulius 8 7 6 0 6
otto-suwen 3 4 3 0 8
garfiel-tinsel 7.5 4 8 0 3
petelgeuse-romanee-conti 7 6 7 0 5
regulus-corneas 9 5 10 0 4
sirius-romanee-conti 7.5 4 6 0 4
capella-emerada-lugunica 8 5 9 4 6
echidna 8.5 6 5 3 10
elsa-granhiert 7.5 3 8 0 5
frederica-baumann 6 4 6 0 5
meili-portroute 5 3 4 0 6
petra-leyte 0.5 2 1 0 3
satella 10 4 10 0 3
`,
deathnote: `
light-yagami 6 9 3 0 10
l-lawliet 3 8 3 0 10
misa-amane 5 3 2 0 4
near 2 8 2 0 10
mello 4 7 3 0 9
ryuk 7 2 9 0 5
rem 7 3 8 0 6
soichiro-yagami 2.5 8 4 0 6
touta-matsuda 2.5 3 3 0 4
shuuichi-aizawa 2.5 6 4 0 6
kanzou-mogi 3 4 6 0 5
hideki-ide 2.5 4 4 0 5
hirokazu-ukita 2.5 3 3 0 3
watari 3 5 3 2 8
naomi-misora 4 5 3 0 9
raye-penber 3 4 3 0 6
kiyomi-takada 3 5 2 0 7
teru-mikami 5 5 2 0 8
kyousuke-higuchi 5 4 2 0 4
sayu-yagami 0.5 2 1 0 3
halle-lidner 4 5 4 0 7
stephen-gevanni 3 4 3 0 8
anthony-rester 3.5 6 4 0 6
wedy 3 3 2 0 8
aiber 3 4 3 0 7
sidoh 6 2 8 0 2
matt 2.5 2 2 0 7
roger-ruvie 1 6 1 2 5
rod-ross 3 6 4 0 5
`,
codegeass: `
lelouch-lamperouge 5 10 2 0 10
suzaku-kururugi 8.5 6 8 0 5
cc 4 4 10 0 7
kallen-kouzuki 8 6 7 0 5
nunnally-lamperouge 2 7 1 0 7
euphemia-li-britannia 1 8 1 2 4
cornelia-li-britannia 7.5 9 6 0 8
schneizel-el-britannia 5 10 3 0 10
charles-zi-britannia 6 9 9 0 8
vv 3 5 9 0 6
jeremiah-gottwald 8 5 8 0 4
lloyd-asplund 2 4 2 3 9
cecile-croomy 2 4 2 6 7
rolo-lamperouge 7 3 4 0 7
shirley-fenette 1 3 1 1 3
milly-ashford 1 7 1 1 6
kaname-ougi 3 6 4 0 4
kyoushirou-toudou 7.5 7 6 0 8
kaguya-sumeragi 1 7 1 0 7
li-xingke 8 8 6 0 8
bismarck-waldstein 8.5 7 7 0 7
gino-weinberg 7.5 5 6 0 5
anya-alstreim 7.5 3 6 0 5
diethard-ried 2 5 1 0 9
villetta-nu 6 5 5 0 5
rakshata-chawla 2 5 2 5 9
sayoko-shinozaki 6.5 3 5 2 6
clovis-la-britannia 2 6 2 0 4
marianne-vi-britannia 7.5 7 5 0 7
`,
};

// Per-form overrides for characters with verified eras/forms (see CHARACTER_PHASES).
export const FORMS = {
  "onepiece-monkey-d-luffy": { prets: { power: 6 }, gear5: { power: 9.5 } },
  "onepiece-roronoa-zoro": { prets: { power: 6 }, koh: { power: 8.5 } },
  "onepiece-sanji": { prets: { power: 5.5 }, ifrit: { power: 8 } },
  "naruto-naruto-uzumaki": { shippuden: { power: 7, heal: 2 }, sixpaths: { power: 9.5, heal: 6 } },
  "naruto-sasuke-uchiha": { hebi: { power: 6.5 }, ems: { power: 8 }, rinnegan: { power: 9.5 } },
  "naruto-madara-uchiha": { alive: { power: 8.5 }, edo: { power: 9 }, tenails: { power: 10 } },
  "naruto-obito-uchiha": { masked: { power: 8 }, tenails: { power: 9.5 } },
  "jjk-maki-zenin": { pre: { power: 5.5, tank: 5 }, awakened: { power: 8.5, tank: 7 } },
  "jjk-satoru-gojo": { student: { power: 8.5, lead: 6 }, adult: { power: 9.5 } },
  "jjk-yuta-okkotsu": { zero: { power: 7.5, heal: 7 }, sendai: { power: 8.5, heal: 9 } },
  "bleach-ichigo-kurosaki": { soulreaper: { power: 7 }, dangai: { power: 9.5 }, true: { power: 9 } },
  "aot-eren-yeager": { scout: { power: 6.5, tank: 6 }, war: { power: 8, lead: 8 }, founder: { power: 10, tank: 9 } },
  "mha-izuku-midoriya": { early: { power: 5.5, lead: 5 }, finalwar: { power: 9 } },
  "mha-tomura-shigaraki": { early: { power: 6.5, tank: 4 }, awakened: { power: 9.5, tank: 9 } },
  "dragonball-goku": { base: { power: 8 }, ssj: { power: 9 }, ui: { power: 10 } },
  "dragonball-vegeta": { base: { power: 7.5 }, ssj: { power: 9 }, blueevo: { power: 9.5 } },
  "dragonball-gohan": { child: { power: 5, lead: 2 }, ssj2: { power: 8.5 }, beast: { power: 9.5 } },
  "dragonball-broly": { base: { power: 9 }, fullpower: { power: 10 } },
  "sao-kirito": { aincrad: { power: 6.5 }, alicization: { power: 9 } },
};

export const STATS = ["power", "lead", "tank", "heal", "intel"];

/** Parse the tables above into { "<series>-<slug>": {power, lead, tank, heal, intel} }. */
export function parseAttributes(table = ATTRIBUTES) {
  const out = {};
  for (const [series, text] of Object.entries(table)) {
    for (const raw of text.split("\n")) {
      const line = raw.replace(/#.*/, "").trim(); if (!line) continue;
      const [slug, ...nums] = line.split(/\s+/);
      if (nums.length !== STATS.length) throw new Error(`attributes: ${series}/${slug} needs ${STATS.length} numbers`);
      out[`${series}-${slug}`] = Object.fromEntries(STATS.map((k, i) => [k, Number(nums[i])]));
    }
  }
  return out;
}
