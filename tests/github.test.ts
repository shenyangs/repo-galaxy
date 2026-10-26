import {afterEach,describe,it,expect,vi} from 'vitest';
import {mapRepository} from '../server/github';
afterEach(()=>vi.unstubAllGlobals());
describe('bounded GitHub fetching',()=>{
 it('uses default branch, caps files and concurrency, parses source and caches',async()=>{
  let active=0,maximum=0,blobs=0;
  const fetcher=vi.fn(async(url:string)=>{
   if(url.endsWith('/repos/test/capped'))return Response.json({default_branch:'trunk'});
   if(url.includes('/git/trees/')){expect(url).toContain('/trunk?recursive=1');return Response.json({sha:'tree',tree:Array.from({length:75},(_,i)=>({type:'blob',path:`file${i}.ts`,size:20,sha:`sha${i}`}))});}
   active++;maximum=Math.max(maximum,active);blobs++;await new Promise(r=>setTimeout(r,2));active--;
   return Response.json({encoding:'base64',content:Buffer.from('export const x = 1;\n').toString('base64')});
  });vi.stubGlobal('fetch',fetcher);
  const result=await mapRepository('https://github.com/test/capped');expect(result.modules).toHaveLength(60);expect(result.truncated).toBe(true);expect(blobs).toBe(60);expect(maximum).toBeLessThanOrEqual(4);expect(result.edges).toHaveLength(0);
  const count=fetcher.mock.calls.length;expect((await mapRepository('https://github.com/test/capped')).cached).toBe(true);expect(fetcher).toHaveBeenCalledTimes(count);
 });
 it('reports rate limits explicitly',async()=>{vi.stubGlobal('fetch',vi.fn(async()=>new Response('',{status:403})));await expect(mapRepository('https://github.com/test/limited')).rejects.toThrow('rate limit');});
 it('skips sources beyond file and total byte caps',async()=>{
  let blobs=0;vi.stubGlobal('fetch',vi.fn(async(url:string)=>{
   if(url.endsWith('/repos/test/bytes'))return Response.json({default_branch:'main'});
   if(url.includes('/git/trees/'))return Response.json({sha:'tree',tree:[{type:'blob',path:'huge.ts',size:100001,sha:'huge'},...Array.from({length:15},(_,i)=>({type:'blob',path:`f${i}.ts`,size:100000,sha:`${i}`}))]});
   blobs++;return Response.json({encoding:'base64',content:Buffer.from(' '.repeat(100000)).toString('base64')});
  }));const graph=await mapRepository('https://github.com/test/bytes');expect(graph.modules).toHaveLength(10);expect(blobs).toBe(10);expect(graph.truncated).toBe(true);
 });
});
