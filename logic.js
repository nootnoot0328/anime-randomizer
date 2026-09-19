(function(root){
  "use strict";
  function parseVersion(v){
    if(typeof v!=="string") return null;
    const m=v.match(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z.-]+))?$/);
    if(!m) return null;
    return {major:+m[1],minor:+m[2],patch:+m[3],pre:m[4]||null};
  }
  function compareVersions(a,b){
    const A=parseVersion(a),B=parseVersion(b); if(!A||!B) return null;
    for(const k of ["major","minor","patch"]){if(A[k]>B[k])return 1;if(A[k]<B[k])return -1;}
    if(A.pre===B.pre)return 0; if(A.pre===null)return 1; if(B.pre===null)return -1;
    return A.pre.localeCompare(B.pre,undefined,{numeric:true})>0?1:A.pre===B.pre?0:-1;
  }
  function countPool(pool){return Array.isArray(pool)?pool.length:Number.isFinite(pool)?pool:0;}
  function pkRequirement(p1Pool,p2Pool,rolesP1,rolesP2,shared){
    const r1=Number(rolesP1)||0,r2=Number(rolesP2)||0;
    if(shared){
      let availableShared;
      if(Array.isArray(p1Pool)||Array.isArray(p2Pool)){
        const all=[...(Array.isArray(p1Pool)?p1Pool:[]),...(Array.isArray(p2Pool)?p2Pool:[])];
        const seen=new Set(); all.forEach((x,i)=>seen.add(x&&typeof x==="object"?(x.id??`obj-${i}`):String(x)));
        availableShared=seen.size;
      }else availableShared=countPool(p1Pool)+countPool(p2Pool);
      const requiredShared=r1+r2;
      return {ok:availableShared>=requiredShared,shared:true,availableShared,requiredShared,availableP1:availableShared,availableP2:availableShared,requiredP1:r1,requiredP2:r2};
    }
    const a1=countPool(p1Pool),a2=countPool(p2Pool);
    return {ok:a1>=r1&&a2>=r2,shared:false,availableP1:a1,availableP2:a2,requiredP1:r1,requiredP2:r2,availableShared:null,requiredShared:null};
  }
  function shuffle(input,rng=Math.random){
    const a=[...input];
    for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
    return a;
  }
  function canAffordBudgetPick(budget,price){
    const [cash,cost]=[budget,price].map(Number);
    return Number.isFinite(cash)&&Number.isFinite(cost)&&cost>=0&&cost<=cash;
  }
  function normalizeName(s){
    return String(s??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/g," ").trim();
  }
  function nameTokens(s){return normalizeName(s).split(/\s+/).filter(Boolean).sort();}
  function matchScore(c,node){
    const full=node?.name?.full??node?.name_en??node?.name??"";
    const native=node?.name?.native??node?.name_ja??"";
    const enA=nameTokens(c?.name_en??c?.name??"").join(" "),enB=nameTokens(full).join(" ");
    const jaA=normalizeName(c?.name_ja??""),jaB=normalizeName(native);
    if(enA&&enA===enB)return 100; if(jaA&&jaB&&jaA===jaB)return 100;
    const A=new Set(nameTokens(c?.name_en??c?.name??"")),B=new Set(nameTokens(full));
    if(!A.size||!B.size)return 0;
    let inter=0;A.forEach(x=>{if(B.has(x))inter++;});
    const union=new Set([...A,...B]).size;
    let score=(inter/union)*70;
    const aa=normalizeName(c?.name_en??c?.name??""),bb=normalizeName(full);
    if(aa&&bb&&(aa.includes(bb)||bb.includes(aa)))score+=30;
    return Math.max(0,Math.min(100,score));
  }
  const api={compareVersions,pkRequirement,shuffle,canAffordBudgetPick,normalizeName,nameTokens,matchScore};
  root.AnimeFusionLogic=api;
  if(typeof module!=="undefined") module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
