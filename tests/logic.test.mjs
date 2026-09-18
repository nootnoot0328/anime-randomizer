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

test('budget picks reserve the minimum cost for every remaining slot',()=>{
  assert.equal(canAffordBudgetPick(100,30,6),true);
  assert.equal(canAffordBudgetPick(29,10,5),false);
  assert.equal(canAffordBudgetPick(30,10,5),true);
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

test('Gallery exposes a persistent strict-or-fallback form portrait toggle',()=>{
  const script=fs.readFileSync(path.join(root,'phases.js'),'utf8');
  assert.match(script,/AF_PHASE_PORTRAIT_KEY/);
  assert.match(script,/function setPhasePortraitFallback/);
  assert.match(script,/portraitFallback/);
  assert.match(script,/portraitStrict/);
  assert.match(script,/libraryView=function\(\)\{return phasePortraitFallbackBlock\(\)/);
});

test('character forms are sibling variants and selecting one hides the other form',()=>{
  const phases=fs.readFileSync(path.join(root,'phases.js'),'utf8');
  const patch=fs.readFileSync(path.join(root,'patch.js'),'utf8');
  assert.match(phases,/function characterPhaseVariants\(c\).*opts\.map\(ph=>withCharacterPhase\(c,ph\)\)/);
  assert.match(phases,/out\.variantKey=`\$\{c\.id\}::\$\{ph\.key\}`/);
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
  for(const id of ['jjk-kirara-hoshi','aot-hange-zoe','hunterxhunter-neferpitou','fma-envy','jojo-foo-fighters'])assert.equal(chars[id].gender,undefined);
});

test('version consistency is 0.6.0',()=>{
  const version=JSON.parse(fs.readFileSync(path.join(root,'version.json'),'utf8')).version;
  const packageVersion=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version;
  const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const m=app.match(/const VERSION = "([^"]+)"/);assert.ok(m);assert.equal(version,'0.6.0');assert.equal(packageVersion,version);assert.equal(m[1],version);
  for(const asset of ['styles.css','logic.js','app.js'])assert.match(html,new RegExp(asset.replace('.','\\.')+'\\?v=0\\.6\\.0'));
});
