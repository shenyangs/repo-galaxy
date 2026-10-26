import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildGraph,parseRepository,type SourceFile} from './graph';
import {mapRepository} from './github';
const app=express();app.use(express.json({limit:'2kb'}));
app.get('/api/health',(_req,res)=>res.json({ok:true,project:'repo-galaxy'}));
app.get('/api/sample',async(_req,res,next)=>{try{
 const root=fileURLToPath(new URL('../fixtures/observatory/',import.meta.url));
 const files:SourceFile[]=[];
 async function walk(dir:string){for(const entry of await fs.readdir(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())await walk(full);else files.push({path:path.relative(root,full),source:await fs.readFile(full,'utf8')});}}
 await walk(root);res.json({...buildGraph(files),name:'observatory / mini-repo',source:'EXAMPLE FIXTURE',branch:'included source',truncated:false,notice:'Parsed from included source files on every request. No model inference or synthetic edges.'});
}catch(e){next(e);}});
let active=0;
app.post('/api/map',async(req,res)=>{try{parseRepository(req.body?.url);}catch(e){res.status(400).json({error:(e as Error).message});return;}
 if(active>=1){res.status(429).json({error:'A mapping is already running. Please try again shortly.'});return;}active++;
 try{res.json(await mapRepository(req.body.url));}catch(e){res.status((e as any).status??502).json({error:(e as Error).message});}finally{active--;}});
app.use((err:any,_req:express.Request,res:express.Response,_next:express.NextFunction)=>res.status(err.status??500).json({error:err.type==='entity.too.large'?'Request too large.':'Unable to load source data.'}));
app.listen(5202,'127.0.0.1',()=>console.log('[repo-galaxy] api ready on 5202'));
