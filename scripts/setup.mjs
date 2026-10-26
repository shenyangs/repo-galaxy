import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {root,supportedNode,browserEnvironment,browserStatus} from './local-tools.mjs';
function run(args,env=process.env){const result=spawnSync(process.execPath,args,{cwd:root,env,stdio:'inherit'});if(result.error||result.status!==0){console.error('安装失败：请检查网络、磁盘空间和上方错误，修复后重新运行 npm run setup。不会修改系统设置。');process.exit(result.status||1);}}
if(!supportedNode()){console.error('Node.js 版本不支持。请使用 Node.js 22.12+（22 系列）、24 系列或 26+ 后重试。');process.exit(1);}
if(!process.env.npm_execpath){console.error('请通过 npm run setup 启动安装。');process.exit(1);}
console.log('第 1 步：按锁文件安装项目依赖；缓存仅写入本项目 .npm-cache。');
run([process.env.npm_execpath,'ci','--cache',path.join(root,'.npm-cache')]);
const env=browserEnvironment();
if(process.argv.includes('--skip-browser'))console.log('已按参数跳过测试浏览器；网页演示仍可运行，e2e/demo 需要另行安装浏览器。');
else if(browserStatus(undefined,env).ready)console.log('第 2 步：已找到 Chromium 和录屏组件，跳过重复下载。');
else {console.log('第 2 步：安装 Chromium 和录屏组件到项目 .browser-cache。不会安装系统依赖或更改机器设置。');run([path.join(root,'node_modules','playwright','cli.js'),'install','chromium'],{...env,PLAYWRIGHT_BROWSERS_PATH:path.join(root,'.browser-cache')});}
console.log('安装完成。运行 npm run doctor 检查环境；运行 npm run dev，访问 http://127.0.0.1:4202。');
