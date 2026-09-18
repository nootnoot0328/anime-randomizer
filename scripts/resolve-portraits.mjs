import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const {matchScore}=require('../logic.js');
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(__dirname,'..');
const roster=JSON.parse(await fs.readFile(path.join(root,'data/roster.json'),'utf8'));
const overrides=JSON.parse(await fs.readFile(path.join(root,'data/portrait-overrides.json'),'utf8'));
let existing={series:{},chars:{}};
try{existing=JSON.parse(await fs.readFile(path.join(root,'data/portraits.json'),'utf8'));}catch{}
let lastRequest=0;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function gql(query,variables,attempt=0){
  const wait=Math.max(0,1000-(Date.now()-lastRequest));if(wait)await sleep(wait);lastRequest=Date.now();
  const r=await fetch('https://graphql.anilist.co',{method:'POST',headers:{'content-type':'application/json','accept':'application/json'},body:JSON.stringify({query,variables})});
  if(r.status===429||r.status>=500){
    if(attempt>=5)throw new Error(`AniList HTTP ${r.status} after retries`);
    const retry=Number(r.headers.get('retry-after')||0)*1000||Math.min(30000,2000*(2**attempt));
    await sleep(retry);return gql(query,variables,attempt+1);
  }
  if(!r.ok)throw new Error(`AniList HTTP ${r.status}`);
  const data=await r.json();if(data.errors?.length)throw new Error(data.errors.map(x=>x.message).join('; '));return data.data;
}
async function resolveMedia(search){
  const q=`query($search:String!){Media(search:$search,type:ANIME){id title{romaji english native}}}`;
  return (await gql(q,{search}))?.Media||null;
}
async function fetchMediaCharacters(mediaId){
  const q=`query($id:Int!,$page:Int!){Media(id:$id,type:ANIME){characters(page:$page,perPage:50,sort:[ROLE,RELEVANCE,ID]){pageInfo{hasNextPage} nodes{id name{full native alternative} image{large medium}}}}}`;
  const out=[];for(let page=1;page<=4;page++){const d=await gql(q,{id:mediaId,page});const c=d?.Media?.characters;if(!c)break;out.push(...(c.nodes||[]));if(!c.pageInfo?.hasNextPage)break;}return out;
}
async function fetchCharacter(id){
  const q=`query($id:Int!){Character(id:$id){id name{full native alternative} image{large medium}}}`;
  return (await gql(q,{id}))?.Character||null;
}
async function searchCharacter(search){
  const q=`query($search:String!){Character(search:$search){id name{full native alternative} image{large medium} media(page:1,perPage:50){nodes{id type}}}}`;
  return (await gql(q,{search}))?.Character||null;
}
function altMatchScore(c,node){
  let best=matchScore(c,node);
  for(const alt of node?.name?.alternative||[])best=Math.max(best,matchScore(c,{name:{full:alt,native:node?.name?.native||''}}));
  return best;
}
function belongsToSeries(node,mediaIds){
  return (node?.media?.nodes||[]).some(m=>m?.type==='ANIME'&&mediaIds.includes(m.id));
}
async function fallbackCharacter(c,mediaIds){
  const searches=[c.name_en,c.name_ja].filter((x,i,a)=>x&&a.indexOf(x)===i);
  let best=null;
  for(const search of searches){
    try{
      const hit=await searchCharacter(search);if(!hit)continue;
      const score=altMatchScore(c,hit);
      if((score>=70&&(belongsToSeries(hit,mediaIds)||score===100))&&(hit.image?.large||hit.image?.medium)){
        if(!best||score>best.score)best={n:hit,score,source:'global'};
      }
    }catch(e){console.error(`global ${c.id} (${search}): ${e.message}`);}
  }
  return best;
}
const output={generatedAt:new Date().toISOString(),series:{},chars:{}};
const unmatched=[],low=[];
for(const series of roster){
  const mediaIds=[],candidateMap=new Map();
  const needsCandidates=series.chars.some(c=>{
    const ov=overrides[c.id];
    return !ov?.skip&&!ov?.url&&!ov?.anilistCharacterId&&!existing.chars?.[c.id];
  });
  if(needsCandidates){
    for(const title of series.anilistSearch||[series.name_en]){
      try{const media=await resolveMedia(title);if(!media)continue;if(!mediaIds.includes(media.id))mediaIds.push(media.id);for(const c of await fetchMediaCharacters(media.id))candidateMap.set(c.id,c);}catch(e){console.error(`[${series.id}] ${title}: ${e.message}`);}
    }
  }else{
    mediaIds.push(...(existing.series?.[series.id]?.mediaIds||[]));
  }
  output.series[series.id]={mediaIds};
  const candidates=[...candidateMap.values()];
  for(const c of series.chars){
    const ov=overrides[c.id];
    if(ov?.skip)continue;
    if(ov?.url){output.chars[c.id]={anilistId:ov.anilistCharacterId??null,url:ov.url,score:100,source:'override'};continue;}
    if(ov?.anilistCharacterId){
      try{const hit=candidateMap.get(ov.anilistCharacterId)||await fetchCharacter(ov.anilistCharacterId);if(hit?.image?.large||hit?.image?.medium){output.chars[c.id]={anilistId:hit.id,url:hit.image.large||hit.image.medium,score:100,source:'override'};continue;}}catch(e){console.error(`override ${c.id}: ${e.message}`);}
    }
    if(existing.chars?.[c.id]){output.chars[c.id]=existing.chars[c.id];continue;}
    const ranked=candidates.map(n=>({n,score:altMatchScore(c,n),source:'series'})).sort((a,b)=>b.score-a.score);let best=ranked[0];
    if(!best||best.score<55||!(best.n.image?.large||best.n.image?.medium)){const fb=await fallbackCharacter(c,mediaIds);if(fb)best=fb;}
    if(!best||best.score<55||!(best.n.image?.large||best.n.image?.medium)){unmatched.push(`${c.id} (${c.name_en})`);continue;}
    output.chars[c.id]={anilistId:best.n.id,url:best.n.image.large||best.n.image.medium,score:Number(best.score.toFixed(2)),source:best.source};
    if(best.score<70)low.push(`${c.id} (${c.name_en}) -> ${best.n.name.full} [${best.score.toFixed(1)}]`);
  }
}
await fs.writeFile(path.join(root,'data/portraits.json'),JSON.stringify(output,null,2)+'\n','utf8');
const report=[`# Portrait resolver report`,``,`Generated: ${output.generatedAt}`,``,`Resolved: ${Object.keys(output.chars).length}`,`Unmatched: ${unmatched.length}`,`Low-score (<70): ${low.length}`,``,`## Unmatched`,...(unmatched.length?unmatched.map(x=>`- ${x}`):['- None']),``,`## Low-score matches`,...(low.length?low.map(x=>`- ${x}`):['- None'])].join('\n');
console.log(report);
