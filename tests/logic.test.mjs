import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const {validatePack,compareVersions,pkRequirement,shuffle,normalizeName,matchScore}=require('../logic.js');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const tiny='data:image/png;base64,iVBORw0KGgo=';

test('validatePack valid pack passes',()=>assert.equal(validatePack({name:'Test',chars:[{name:'A',gender:'male',image:tiny}]}).ok,true));
test('validatePack rejects stored-XSS image payload',()=>assert.equal(validatePack({name:'Test',chars:[{name:'A',image:'x" onerror="alert(1)'}]}).ok,false));
test('validatePack rejects oversized name',()=>assert.equal(validatePack({name:'x'.repeat(81),chars:[]}).ok,false));
test('validatePack rejects wrong types',()=>assert.equal(validatePack({name:'x',chars:'no'}).ok,false));
test('validatePack rejects non-image data URL',()=>assert.equal(validatePack({name:'x',chars:[{name:'A',image:'data:text/html;base64,PGgxPg=='}]}).ok,false));

test('compareVersions equal/greater/lesser/malformed',()=>{assert.equal(compareVersions('0.5.1','0.5.1'),0);assert.equal(compareVersions('0.5.2','0.5.1'),1);assert.equal(compareVersions('0.4.9','0.5.1'),-1);assert.equal(compareVersions('wat','0.5.1'),null);});

test('pkRequirement separate boundary and below',()=>{assert.equal(pkRequirement(6,6,6,6,false).ok,true);assert.equal(pkRequirement(5,6,6,6,false).ok,false);});
test('pkRequirement shared boundary and below',()=>{const a=Array.from({length:12},(_,i)=>({id:String(i)}));assert.equal(pkRequirement(a,a,6,6,true).ok,true);assert.equal(pkRequirement(a.slice(0,11),a.slice(0,11),6,6,true).ok,false);});

test('shuffle returns permutation without mutating input',()=>{const a=[1,2,3,4,5],copy=[...a],b=shuffle(a,()=>0.1);assert.deepEqual(a,copy);assert.deepEqual([...b].sort(),copy);});

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
  for(const id of ['aot-hange-zoe','hunterxhunter-neferpitou','fma-envy','jojo-foo-fighters'])assert.equal(chars[id].gender,undefined);
});

test('version consistency is 0.5.2',()=>{
  const version=JSON.parse(fs.readFileSync(path.join(root,'version.json'),'utf8')).version;
  const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const m=app.match(/const VERSION = "([^"]+)"/);assert.ok(m);assert.equal(version,'0.5.2');assert.equal(m[1],'0.5.2');
  for(const asset of ['styles.css','logic.js','app.js'])assert.match(html,new RegExp(asset.replace('.','\\.')+'\\?v=0\\.5\\.2'));
});
