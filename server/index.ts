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
 async function walk(dir:string){for(const entry of await fs.readdir(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())await walk(full);else files.push({path:path.relative(root,full).split(path.sep).join('/'),source:await fs.readFile(full,'utf8')});}}
 await walk(root);res.json({...buildGraph(files),name:'Observatory / 示例小仓库',source:'本地源码样例（FIXTURE）',branch:'随项目附带源码',truncated:false,notice:'每次请求均解析项目附带源码，不调用 AI 模型，不生成虚构连线。'});
}catch(e){next(e);}});
let active=0;
app.post('/api/map',async(req,res)=>{try{parseRepository(req.body?.url);}catch(e){res.status(400).json({error:(e as Error).message});return;}
 if(active>=1){res.status(429).json({error:'已有仓库正在解析，请稍后重试。'});return;}active++;
 try{res.json(await mapRepository(req.body.url));}catch(e){res.status((e as any).status??502).json({error:/[\u4e00-\u9fff]/.test((e as Error).message)?(e as Error).message:'GitHub 数据读取失败或超时，请稍后重试，或加载本地样例。'});}finally{active--;}});
app.use((err:any,_req:express.Request,res:express.Response,_next:express.NextFunction)=>res.status(err.status??500).json({error:err.type==='entity.too.large'?'请求内容过大，请仅提交仓库地址。':'无法读取源码数据，请检查服务终端提示后重试。'}));
app.listen(5202,'127.0.0.1',()=>console.log('[RepoGalaxy] API 已就绪：http://127.0.0.1:5202/api/health；网页入口：http://127.0.0.1:4202（等待 Vite 就绪）')).on('error',(error:NodeJS.ErrnoException)=>{console.error(error.code==='EADDRINUSE'?'[RepoGalaxy] API 端口 5202 已被占用。请停止已有服务后重试，或运行 npm run doctor。':'[RepoGalaxy] API 启动失败，请运行 npm run doctor 检查环境。');process.exit(1);});
