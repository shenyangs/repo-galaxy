import {buildGraph,parseRepository,type SourceFile} from './graph';
class GitHubError extends Error { constructor(message:string,public status=502){super(message);} }
async function json(url:string,cap=8_000_000):Promise<any> {
  const parsed=new URL(url);
  if(parsed.protocol!=='https:'||parsed.hostname!=='api.github.com') throw new Error('Host not allowed');
  const response=await fetch(url,{headers:{Accept:'application/vnd.github+json','User-Agent':'RepoGalaxy-MVP'},signal:AbortSignal.timeout(12_000),redirect:'error'});
  if(!response.ok) throw new GitHubError(response.status===403||response.status===429?'GitHub rate limit or access restriction. Try later or load the example fixture.':response.status===404?'Public repository not found.':'GitHub request failed.',response.status===404?404:response.status===403||response.status===429?429:502);
  const reader=response.body!.getReader();let length=0;const chunks:Uint8Array[]=[];
  while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>cap){await reader.cancel();throw new Error('GitHub response exceeds safety limit.');}chunks.push(value);}
  return JSON.parse(Buffer.concat(chunks).toString());
}
const cache=new Map<string,{expires:number;value:any}>();
export async function mapRepository(input:unknown){
 const {owner,repo}=parseRepository(input);const key=`${owner}/${repo}`;
 const cached=cache.get(key);if(cached&&cached.expires>Date.now())return {...cached.value,cached:true};
 const metadata=await json(`https://api.github.com/repos/${key}`);
 const tree=await json(`https://api.github.com/repos/${key}/git/trees/${encodeURIComponent(metadata.default_branch)}?recursive=1`);
 let budget=0; const candidates=tree.tree.filter((entry:any)=>entry.type==='blob'&&/\.(?:[cm]?[jt]s|[jt]sx)$/.test(entry.path));
 const entries=candidates.filter((entry:any)=>Number.isInteger(entry.size)&&entry.size<=100_000);
 const selected=entries.filter((entry:any)=>{if(budget+entry.size>1_000_000)return false;budget+=entry.size;return true;}).slice(0,60);
 const files:SourceFile[]=[];let cursor=0;
 await Promise.all(Array.from({length:Math.min(4,selected.length)},async()=>{while(cursor<selected.length){const entry=selected[cursor++];const blob=await json(`https://api.github.com/repos/${key}/git/blobs/${entry.sha}`,150_000);if(blob.encoding!=='base64')throw new Error('Unsupported source encoding');const content=Buffer.from(blob.content,'base64');if(content.length>100_000||content.length!==entry.size)throw new Error('Source size mismatch');files.push({path:entry.path,source:content.toString('utf8')});}}));
 files.sort((a,b)=>a.path.localeCompare(b.path));
 const value={...buildGraph(files),name:key,source:'GITHUB LIVE',branch:metadata.default_branch,treeSha:tree.sha,cached:false,truncated:Boolean(tree.truncated)||selected.length<candidates.length,notice:'Static relative imports only. External packages and targets outside the fetched subset are unresolved.',fetchedAt:new Date().toISOString()};
 if(cache.size>=20)cache.delete(cache.keys().next().value!);cache.set(key,{expires:Date.now()+300_000,value});return value;
}
