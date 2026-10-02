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

test('version is consistent and every module is in the import map',()=>{
  const version=JSON.parse(fs.readFileSync(path.join(root,'version.json'),'utf8')).version;
  const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version;
  const state=fs.readFileSync(path.join(root,'src/core/state.js'),'utf8').match(/export const VERSION = "([^"]+)"/)[1];
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.equal(pkg,version);assert.equal(state,version);
  for(const asset of ['styles.css','logic.js','src/main.js'])assert.ok(html.includes(`${asset}?v=${version}`),`${asset} carries ?v=${version}`);
  const map=JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports;
  const modules=[];(function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);e.isDirectory()?walk(p):p.endsWith('.js')&&modules.push('./'+path.relative(root,p).split(path.sep).join('/'));}})(path.join(root,'src'));
  for(const m of modules)assert.equal(map[m],`${m}?v=${version}`,`import map entry for ${m} (run node scripts/set-version.mjs)`);
});
