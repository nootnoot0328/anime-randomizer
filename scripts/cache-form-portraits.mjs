import fs from "node:fs/promises";
import path from "node:path";

const manifestPath=path.resolve("data/form-portraits.json");
const outputDir=path.resolve("assets/form-portraits");
const manifest=JSON.parse(await fs.readFile(manifestPath,"utf8"));
await fs.mkdir(outputDir,{recursive:true});

function imageType(bytes,contentType=""){
  if(bytes[0]===0x89&&bytes[1]===0x50&&bytes[2]===0x4e&&bytes[3]===0x47)return"png";
  if(bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)return"jpg";
  if(String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&String.fromCharCode(...bytes.slice(8,12))==="WEBP")return"webp";
  if(String.fromCharCode(...bytes.slice(0,3))==="GIF")return"gif";
  if(contentType.includes("png"))return"png";if(contentType.includes("jpeg")||contentType.includes("jpg"))return"jpg";if(contentType.includes("webp"))return"webp";if(contentType.includes("gif"))return"gif";
  return null;
}
async function download(record,key){
  const attempts=[
    {"user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128 Safari/537.36",accept:"image/avif,image/webp,image/apng,image/*,*/*;q=0.8",...(record.sourcePage?{referer:record.sourcePage}:{})},
    {"user-agent":"Mozilla/5.0 AnimeFusion/0.6.1",accept:"image/*,*/*;q=0.8"}
  ];
  let lastError="download failed";
  for(const headers of attempts){
    try{
      const response=await fetch(record.url,{headers,redirect:"follow"});
      if(!response.ok){lastError=`HTTP ${response.status}`;continue;}
      const bytes=new Uint8Array(await response.arrayBuffer());
      if(bytes.length<1024)throw new Error(`response too small (${bytes.length} bytes)`);
      if(bytes.length>12*1024*1024)throw new Error(`image exceeds 12 MB (${bytes.length} bytes)`);
      const ext=imageType(bytes,response.headers.get("content-type")||"");
      if(!ext)throw new Error("response is not a supported image");
      return{bytes,ext};
    }catch(error){lastError=error.message;}
  }
  throw new Error(`${key}: ${lastError}`);
}

let cached=0;
for(const [key,record] of Object.entries(manifest.variants)){
  if(!record.verified||record.source==="default")continue;
  if(record.url?.startsWith("assets/form-portraits/")){
    await fs.access(path.resolve(record.url));
    continue;
  }
  if(!/^https:\/\//.test(record.url||""))throw new Error(`${key}: missing HTTPS source image`);
  const {bytes,ext}=await download(record,key);
  const filename=`${key.replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,"")}.${ext}`;
  const relative=`assets/form-portraits/${filename}`;
  await fs.writeFile(path.resolve(relative),bytes);
  record.remoteUrl=record.url;
  record.url=relative;
  cached++;
  console.log(`${key} -> ${relative} (${bytes.length} bytes)`);
}

manifest.cachedAt=new Date().toISOString();
manifest.policy="Only manually verified variants may enter character pools. Dedicated form artwork is stored locally; source=default reuses the audited base AniList portrait.";
await fs.writeFile(manifestPath,`${JSON.stringify(manifest,null,2)}\n`);
console.log(`Cached ${cached} form portraits.`);
