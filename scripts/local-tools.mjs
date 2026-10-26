import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export function supportedNode(version=process.versions.node){const [major,minor]=version.split('.').map(Number);return major===22?minor>=12:major===24||major>=26;}
export function browserEnvironment(env=process.env){return {...env,PLAYWRIGHT_BROWSERS_PATH:env.PLAYWRIGHT_BROWSERS_PATH||path.join(root,'.browser-cache')};}
export function browserStatus(modulesDir=path.join(root,'node_modules'),env=browserEnvironment()){
 try{
  const require=createRequire(import.meta.url);
  process.env.PLAYWRIGHT_BROWSERS_PATH=env.PLAYWRIGHT_BROWSERS_PATH;
  const {chromium}=require(path.join(modulesDir,'playwright'));
  const executable=env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||chromium.executablePath();
  const registry=JSON.parse(fs.readFileSync(path.join(modulesDir,'playwright-core','browsers.json'),'utf8'));
  const revision=registry.browsers.find(b=>b.name==='ffmpeg').revision;
  const ffmpegDir=path.join(env.PLAYWRIGHT_BROWSERS_PATH,`ffmpeg-${revision}`);
  const ffmpegReady=fs.existsSync(ffmpegDir)&&fs.readdirSync(ffmpegDir).some(n=>n.startsWith('ffmpeg-')||n==='ffmpeg.exe');
  return {ready:fs.existsSync(executable)&&ffmpegReady,executable,ffmpegReady};
 }catch{return {ready:false,executable:null,ffmpegReady:false};}
}
export async function portAvailable(port){return new Promise(resolve=>{const server=net.createServer();server.once('error',()=>resolve(false));server.listen(port,'127.0.0.1',()=>server.close(()=>resolve(true)));});}
export async function diagnose({modulesDir=path.join(root,'node_modules'),ports=[4202,5202],version=process.versions.node,env=browserEnvironment()}={}){
 const messages=[];let ok=true;const report=(passed,message)=>{if(!passed)ok=false;messages.push(`${passed?'通过':'需处理'}：${message}`);};
 report(supportedNode(version),`Node.js ${version}；要求 22.12+（22 系列）、24 系列或 26+，建议使用受支持的 LTS 版本。`);
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
 const missing=Object.keys({...manifest.dependencies,...manifest.devDependencies}).filter(name=>!fs.existsSync(path.join(modulesDir,name,'package.json')));
 report(missing.length===0,missing.length?`缺少项目依赖：${missing.join('、')}。请运行 npm ci --cache .npm-cache 或 npm run setup。`:'项目依赖已找到。');
 if(!missing.length){const browser=browserStatus(modulesDir,env);report(browser.ready,browser.ready?'Chromium 与录屏组件已找到。':'缺少测试浏览器或录屏组件。请运行 npm run setup；仅使用网页演示不需要 Playwright 浏览器。');}
 else messages.push('跳过：先安装依赖，再检查测试浏览器。');
 for(const port of ports){const free=await portAvailable(port);report(free,free?`127.0.0.1:${port} 端口可用。`:`127.0.0.1:${port} 已被占用或无法绑定。若项目正在运行，这是预期状态；验收前请在对应终端按 Ctrl+C 停止服务。不要直接结束不明进程。`);}
 messages.push('说明：无需任何 API Key；加载本地源码样例即可演示。');
 messages.push(ok?'诊断完成。运行 npm run dev，打开 http://127.0.0.1:4202。':'诊断发现待处理项；按上方提示修复后重试 npm run doctor。');
 return {ok,messages};
}
