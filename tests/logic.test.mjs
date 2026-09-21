import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const {compareVersions,pkRequirement,shuffle,canAffordBudgetPick,normalizeName,matchScore}=require('../logic.js');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');

test('compareVersions equal/greater/lesser/malformed',()=>{assert.equal(compareVersions('0.5.1','0.5.1'),0);assert.equal(compareVersions('0.5.2','0.5.1'),1);assert.equal(compareVersions('0.4.9','0.5.1'),-1);assert.equal(compareVersions('wat','0.5.1'),null);});

test('pkRequirement separate boundary and below',()=>{assert.equal(pkRequirement(6,6,6,6,false).ok,true);assert.equal(pkRequirement(5,6,6,6,false).ok,false);});
test('pkRequirement shared boundary and below',()=>{const a=Array.from({length:12},(_,i)=>({id:String(i)}));assert.equal(pkRequirement(a,a,6,6,true).ok,true);assert.equal(pkRequirement(a.slice(0,11),a.slice(0,11),6,6,true).ok,false);});

test('shuffle returns permutation without mutating input',()=>{const a=[1,2,3,4,5],copy=[...a],b=shuffle(a,()=>0.1);assert.deepEqual(a,copy);assert.deepEqual([...b].sort(),copy);});

test('budget picks may use all remaining funds',()=>{
  assert.equal(canAffordBudgetPick(100,30,6),true);
  assert.equal(canAffordBudgetPick(29,30,5),false);
  assert.equal(canAffordBudgetPick(30,30,5),true);
  assert.equal(canAffordBudgetPick(5,5,1),true);
});

test('normalizeName and matchScore matching behavior',()=>{
  assert.equal(normalizeName('  SÁNJI!! '),'sanji');
  assert.equal(matchScore({name_en:'Sanji',name_ja:'サンジ'},{name:{full:'Sanji',native:'サンジ'}}),100);
  assert.equal(matchScore({name_en:'Something',name_ja:'サンジ'},{name:{full:'Other',native:'サンジ'}}),100);
  assert.ok(matchScore({name_en:'Sanji'},{name:{full:'Sanji Vinsmoke',native:''}})>=55);
  assert.ok(matchScore({name_en:'Monkey D. Luffy'},{name:{full:'Monkey D. Garp',native:''}})<55);
});

test('every built-in series has at least 25 characters and unique IDs',()=>{
  const roster=JSON.parse(fs.readFileSync(path.join(root,'data/roster.json'),'utf8'));
  const ids=roster.flatMap(series=>series.chars.map(character=>character.id));
  for(const series of roster)assert.ok(series.chars.length>=25,`${series.id} has only ${series.chars.length} characters`);
  assert.equal(new Set(ids).size,ids.length);
});

test('every character has matching English, Chinese and Japanese name fields',()=>{
  const roster=JSON.parse(fs.readFileSync(path.join(root,'data/roster.json'),'utf8'));
  for(const series of roster)for(const character of series.chars){
    for(const key of ['name_en','name_zh','name_ja'])assert.ok(character[key]?.trim(),`${character.id} is missing ${key}`);
  }
});

test('every series has six localized PK roles and a dedicated battlefield',()=>{
  const roster=JSON.parse(fs.readFileSync(path.join(root,'data/roster.json'),'utf8'));
  const source=fs.readFileSync(path.join(root,'pk-v2.js'),'utf8');
  const roles=Function(`return (${source.match(/const AF_ROLE_BLUEPRINTS=(\{[\s\S]*?\n\});/)[1]})`)();
  const fields=Function(`return (${source.match(/const AF_PK_BATTLEFIELDS=(\{[\s\S]*?\n\});/)[1]})`)();
  for(const series of roster){
    assert.equal(roles[series.id]?.length,6,`${series.id} needs six PK roles`);
    for(const role of roles[series.id])assert.ok(role.length===4&&role.every(value=>String(value).trim()),`${series.id} has an incomplete role translation`);
    assert.ok(fields[series.id]&&['en','zh','ja'].every(lang=>fields[series.id][lang]?.trim()),`${series.id} needs a localized battlefield`);
  }
});

test('mobile PK keeps budget scrolling separate from dragging',()=>{
  const script=fs.readFileSync(path.join(root,'pk-v2.js'),'utf8');
  const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
  assert.match(script,/class="pk-drag-handle"/);
  assert.match(script,/const dragStart=budget\?""/);
  assert.match(css,/\.pk-budget-tray \.pk-candidate\{[^}]*touch-action:pan-x/);
  assert.match(css,/\.pk-drag-ghost img/);
  assert.match(css,/\.pk-role-grid\{[^}]*repeat\(2,minmax\(0,1fr\)\)[^}]*repeat\(3,minmax\(0,1fr\)\)/);
});

test('PK ignores the Trait Draft gender filter but keeps selected character phases',()=>{
  const script=fs.readFileSync(path.join(root,'pk-v2.js'),'utf8');
  assert.doesNotMatch(script,/applyGenderFilter\(/);
  assert.match(script,/function pkCharacters\(chars\).*applyCharacterPhases/);
  assert.match(script,/function pkPool\(player\).*pkCharacters/);
});

test('only manually verified form portraits can enter character pools',()=>{
  const script=fs.readFileSync(path.join(root,'phases.js'),'utf8');
  const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'data/form-portraits.json'),'utf8'));
  const phases=Function(`return (${script.match(/const CHARACTER_PHASES=(\{[\s\S]*?\n\});/)[1]})`)();
  const expected=Object.entries(phases).flatMap(([id,forms])=>forms.map(form=>`${id}::${form.key}`)).sort();
  assert.deepEqual(Object.keys(manifest.variants).sort(),expected);
  for(const [key,record] of Object.entries(manifest.variants))if(record.verified){
    assert.ok(record.source==='default'||record.url,`${key} needs a reviewed source`);
  }
  const reused={};for(const [key,record] of Object.entries(manifest.variants))if(record.verified&&record.source==='default')reused[key.split('::')[0]]=(reused[key.split('::')[0]]||0)+1;
  for(const [id,count] of Object.entries(reused))assert.equal(count,1,`${id} reuses its base portrait for multiple forms`);
  for(const [key,record] of Object.entries(manifest.variants)){
    assert.equal(record.verified,true,`${key} should have reviewed artwork`);
    if(record.url){
      assert.match(record.sourcePage,/^https:\/\//,`${key} needs an audit source page`);
      if(record.url.startsWith('assets/form-portraits/')){
        assert.ok(fs.existsSync(path.join(root,record.url)),`${key} needs its cached portrait`);
        assert.match(record.remoteUrl,/^https:\/\//,`${key} needs its original remote URL`);
      }else assert.match(record.url,/^https:\/\//);
    }
  }
  assert.match(script,/filter\(x=>x\.phasePortraitVerified\)/);
  assert.match(app,/fetch\("data\/form-portraits\.json/);
  assert.match(script,/libraryView=function\(\)\{return phasePortraitFallbackBlock\(\)/);
});

test('$100 PK supports five roles, one sale, and incomplete teams',()=>{
  const script=fs.readFileSync(path.join(root,'pk-v2.js'),'utf8');
  const prompts=fs.readFileSync(path.join(root,'prompt-patch.js'),'utf8');
  assert.match(script,/function budgetRoleSet\(seriesId\).*filter\(role=>!\/:traitor\$\/.test\(role\)\)\.slice\(0,5\)/);
  assert.match(script,/sellUsed:false,finished:false/);
  assert.match(script,/function budgetCanBuy\(c\).*characterPrice\(c\)<=p\.budget/);
  assert.match(script,/function sellBudgetCharacter[\s\S]*p\.budget\+=sold\.price[\s\S]*p\.sellUsed=true/);
  assert.match(script,/function finishBudgetTeam[\s\S]*p\.finished=true/);
  assert.match(script,/if\(budgetPlayerDone\(pk\.p1\)&&budgetPlayerDone\(pk\.p2\)\)pk\.ended=true/);
  assert.match(prompts,/Roles are tactical responsibilities/);
  assert.match(script,/const pk=STATE\.pk;if\(pk\.kind==="budget"\)return""/);
});

test('PK judge prompt uses the full role-first battle framework',()=>{
  const script=fs.readFileSync(path.join(root,'pk-v2.js'),'utf8');
  for(const section of ['BATTLE SCENE:','ROLE RULES:','ROLE EXECUTION VS RAW POWER:','SELECTED FORM RULE:','CROSS-SERIES RULE:','BATTLE EVALUATION ORDER:','EMPTY OR MISSING ROLES:','CONSISTENCY RULE:','ROLE MATCHUPS:','MARGIN GUIDE:'])assert.ok(script.includes(section),`missing ${section}`);
  assert.ok(script.includes('do not invent abilities, transformations, equipment or feats'));
  assert.ok(script.includes('Do NOT determine the winner by simply counting how many 1v1 matchups each team wins'));
  assert.ok(script.includes('WHY: 2–4 short sentences explaining which roles, counters, reinforcement interactions and team synergies decide the battle.'));
  assert.match(script,/function pkJudgeTeamBlock\(n\)/);
  assert.match(script,/function pkJudgeMatchupRows\(\)/);
  assert.match(script,/function pkJudgeBetrayalText\(\)/);
  assert.match(script,/hasBetrayal=pk\.kind!=="budget"/);
  for(const localized of ['战斗评估顺序','一致性规则','評価順序','一貫性'])assert.ok(script.includes(localized));
});

test('PK supports local and computer opponents in both draft styles',()=>{
  const script=fs.readFileSync(path.join(root,'pk-v2.js'),'utf8');
  assert.match(script,/localPlayers:"Local 2 Players",vsComputer:"VS Computer"/);
  assert.match(script,/opponent:STATE\.pkSetup\.opponent\|\|"local"/);
  assert.match(script,/difficulty:STATE\.pkSetup\.difficulty\|\|"strategic"/);
  assert.match(script,/function isCPUTurn\(\)/);
  assert.match(script,/function scheduleCPUTurn\(delay=650\)/);
  assert.match(script,/function cpuTakeTurn\(\)/);
  assert.match(script,/Math\.max\(\.\.\.pair\.map\(characterPrice\)\)<=10/);
  assert.match(script,/p\.budget-characterPrice\(c\)>=remaining\*minPrice/);
  assert.match(script,/cpu\|\|!budgetCanBuy\(c\)/);
  for(const label of ['对战电脑','电脑正在选择','コンピューター戦','コンピューターが選択中'])assert.ok(script.includes(label));
});

test('character forms are sibling variants and selecting one hides the other form',()=>{
  const phases=fs.readFileSync(path.join(root,'phases.js'),'utf8');
  const patch=fs.readFileSync(path.join(root,'patch.js'),'utf8');
  assert.match(phases,/const approved=opts\.map\(ph=>withCharacterPhase\(c,ph\)\)\.filter\(x=>x\.phasePortraitVerified\)/);
  assert.match(phases,/const variantKey=`\$\{c\.id\}::\$\{ph\.key\}`/);
  assert.match(phases,/function characterIdentityCount/);
  assert.match(patch,/c\.id!==chosen\.id\|\|c\.phaseKey===chosen\.phaseKey/);
  assert.match(patch,/c\.id!==finalChar\.id\|\|c\.phaseKey===finalChar\.phaseKey/);
});

test('reviewed portrait and gender corrections stay intact',()=>{
  const roster=JSON.parse(fs.readFileSync(path.join(root,'data/roster.json'),'utf8'));
  const overrides=JSON.parse(fs.readFileSync(path.join(root,'data/portrait-overrides.json'),'utf8'));
  const chars=Object.fromEntries(roster.flatMap(series=>series.chars.map(character=>[character.id,character])));
  assert.equal(overrides['chainsawman-yoru'].anilistCharacterId,282872);
  assert.equal(overrides['chainsawman-santa-claus'].anilistCharacterId,174268);
  assert.equal(overrides['tokyoghoul-eto-yoshimura'].anilistCharacterId,90231);
  assert.equal(overrides['naruto-nagato'].skip,true);
  assert.equal(overrides['dragonball-kid-trunks'].skip,true);
  assert.equal(chars['onepiece-yamato'].gender,'male');
  assert.equal(chars['kaijuno8-jura-igarashi'].gender,'female');
  assert.equal(chars['fma-father'].name_ja,'お父様');
  assert.equal(chars['fma-father'].name_zh,'父亲大人');
  for(const id of ['jjk-kirara-hoshi','aot-hange-zoe','hunterxhunter-neferpitou','fma-envy','jojo-foo-fighters'])assert.equal(chars[id].gender,undefined);
});

test('version consistency is 0.6.4',()=>{
  const version=JSON.parse(fs.readFileSync(path.join(root,'version.json'),'utf8')).version;
  const packageVersion=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version;
  const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const m=app.match(/const VERSION = "([^"]+)"/);assert.ok(m);assert.equal(version,'0.6.4');assert.equal(packageVersion,version);assert.equal(m[1],version);
  for(const asset of ['styles.css','logic.js','app.js'])assert.match(html,new RegExp(asset.replace('.','\\.')+'\\?v=0\\.6\\.4'));
});
