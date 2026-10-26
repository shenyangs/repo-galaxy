import {useEffect,useMemo,useState} from 'react';
import {ReactFlow,useReactFlow,Background,Controls,MarkerType,Position,type Node,type Edge} from '@xyflow/react';
import dagre from 'dagre';
import {Search} from 'lucide-react';
import '@xyflow/react/dist/style.css';
type Module={id:string;path:string;bytes:number;imports:{specifier:string;target:string|null}[]};
type Graph={modules:Module[];edges:{id:string;source:string;target:string;specifier:string}[];name:string;source:string;branch:string;notice:string;truncated:boolean;cached?:boolean};
function FitCanvas(){
 const {fitView}=useReactFlow();
 useEffect(()=>{const el=document.querySelector('.graph-stage');if(!el)return;let timer:ReturnType<typeof setTimeout>;const observer=new ResizeObserver(()=>{clearTimeout(timer);timer=setTimeout(()=>void fitView({padding:.18,minZoom:window.innerWidth<700?.48:.15,maxZoom:1.1}),100);});observer.observe(el);return()=>{observer.disconnect();clearTimeout(timer);};},[fitView]);
 return null;
}
export default function App(){
 const [query,setQuery]=useState('');const [url,setUrl]=useState('https://github.com/sindresorhus/is');const [graph,setGraph]=useState<Graph|null>(null);const [selected,setSelected]=useState<string|null>(null);const [hover,setHover]=useState<string|null>(null);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const module=graph?.modules.find(m=>m.id===selected);const focus=hover??selected;
 const {nodes,edges}=useMemo(()=>{
  if(!graph)return {nodes:[],edges:[]};
  const layout=new dagre.graphlib.Graph();layout.setGraph({rankdir:'LR',ranksep:130,nodesep:85});layout.setDefaultEdgeLabel(()=>({}));
  graph.modules.forEach(m=>layout.setNode(m.id,{width:155,height:64}));graph.edges.forEach(e=>layout.setEdge(e.source,e.target));dagre.layout(layout);
  const neighbors=new Set([focus,...graph.edges.filter(e=>e.source===focus||e.target===focus).flatMap(e=>[e.source,e.target])]);
  const nodes:Node[]=graph.modules.map(m=>({id:m.id,width:155,height:64,position:{x:layout.node(m.id).x-77.5,y:layout.node(m.id).y-32},sourcePosition:Position.Right,targetPosition:Position.Left,data:{label:<div className="module-label"><span className="node-star"/><div><strong>{m.path.split('/').at(-1)}</strong><small>{m.imports.length} 个导入 · {m.bytes} B</small></div></div>},className:`module-node ${selected===m.id?'chosen':''} ${focus&&!neighbors.has(m.id)?'dimmed':''}`,domAttributes:{'aria-roledescription':'源码模块'},ariaRole:"button",ariaLabel:`模块 ${m.path}`}));
  const edges:Edge[]=graph.edges.map(e=>({...e,ariaLabel:`导入：${e.source} → ${e.target}`,animated:e.source===focus,markerEnd:{type:MarkerType.ArrowClosed,color:e.source===focus?'#b9f3ee':'#557b98'},style:{stroke:e.source===focus?'#b9f3ee':'#557b98',strokeWidth:e.source===focus?2:1,opacity:focus&&!([e.source,e.target].includes(focus))?.15:.75}}));
  return {nodes,edges};
 },[graph,focus,selected]);
 useEffect(()=>{void load(true);},[]);
 async function load(sample=false){setBusy(true);setError('');try{
 const res=await fetch(sample?'/api/sample':'/api/map',sample?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url})});const body=await res.json();if(!res.ok)throw new Error(body.error||'仓库解析失败，请稍后重试。');setGraph(body);setSelected(null);setHover(null);setQuery('');
 }catch(e){setError(e instanceof TypeError?'无法连接本地 API，请确认 npm run dev 已启动，或检查网络后重试。':(e as Error).message);}finally{setBusy(false);}}
 return <main className={module?'workspace inspecting':'workspace'}>
 <a href="#graph" className="skip-link">跳到星图</a>
 <header className="masthead"><a className="brand" href="/" aria-label="RepoGalaxy 首页"><span className="brand-mark">✳</span> repo<span>galaxy</span></a><span className="edition">源码地图 / 01</span></header>
 <div className="command-dock">
 <form className="searchbar" onSubmit={e=>{e.preventDefault();void load();}}><label htmlFor="repo-url">仓库</label><input id="repo-url" aria-label="GitHub 公开仓库地址" value={url} onChange={e=>setUrl(e.target.value)} spellCheck={false}/><button disabled={busy} type="submit">{busy?'读取中…':'生成星图'} <span aria-hidden="true">↗</span></button><button type="button" className="sample-button" disabled={busy} onClick={()=>void load(true)}>加载样例</button></form>
 {graph&&<div className="file-search"><Search size={15}/><input aria-label="查找文件" placeholder="查找文件…" value={query} onChange={e=>setQuery(e.target.value)}/><span>{graph.modules.length} 个文件</span>{query&&<div className="search-results">{graph.modules.filter(m=>m.path.toLowerCase().includes(query.toLowerCase())).map(m=><button key={m.id} onClick={()=>{setSelected(m.id);setQuery('');}}>{m.path}</button>)}{!graph.modules.some(m=>m.path.toLowerCase().includes(query.toLowerCase()))&&<p>没有匹配的文件</p>}</div>}</div>}
 </div>
 {error&&<div role="alert" className="error">{error}<div><button disabled={busy} onClick={()=>void load()}>重试仓库</button><button disabled={busy} onClick={()=>void load(true)}>改用本地样例</button></div></div>}
 <section id="graph" tabIndex={-1} className="graph-stage" aria-label="仓库导入关系图" aria-busy={busy} onKeyDownCapture={e=>{const node=(e.target as HTMLElement).closest<HTMLElement>('.react-flow__node');if(node?.dataset.id&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.stopPropagation();setSelected(node.dataset.id);}}}>
 {graph&&<ReactFlow key={graph.name} nodes={nodes} edges={edges} fitView fitViewOptions={{padding:.25}} minZoom={.15} maxZoom={2} onNodeClick={(_,n)=>setSelected(n.id)} onPaneClick={()=>setSelected(null)} onNodeMouseEnter={(_,n)=>setHover(n.id)} onNodeMouseLeave={()=>setHover(null)} nodesDraggable={false} nodesConnectable={false} deleteKeyCode={null} ariaLabelConfig={{'node.a11yDescription.default':'按 Enter 或空格查看模块详情。','node.a11yDescription.keyboardDisabled':'按 Enter 或空格查看模块详情。','edge.a11yDescription.default':'此连线对应源码中的相对导入。','controls.ariaLabel':'星图缩放控制','controls.zoomIn.ariaLabel':'放大','controls.zoomOut.ariaLabel':'缩小','controls.fitView.ariaLabel':'显示完整星图','handle.ariaLabel':'导入连接点'}} colorMode="dark"><FitCanvas/><Background color="#314664" gap={36} size={.7}/><Controls showInteractive={false}/></ReactFlow>}
 {(!graph||graph.modules.length===0)&&!busy&&<div className="empty-state" role="status"><h1>{graph?'没有可绘制的文件':'从一个仓库开始。'}</h1><p>{graph?'未找到可读取的 TS/JS 文件。请尝试其他仓库，或加载本地样例。':'输入公开 GitHub 地址，或加载本地源码样例。'}</p></div>}
 {busy&&<div className="loading-overlay" role="status"><div className="scan-line"/><p>正在读取文件并解析导入关系…</p></div>}
 </section>
 <section className="map-caption" aria-label="当前仓库"><span className="caption-kicker">正在浏览</span><h1>{graph?.name??'等待源码'}</h1><div className="source-badge">{graph?.source??'尚未加载'}</div><div className="counts"><span><b data-testid="file-count">{graph?.modules.length??0}</b> 模块</span><span><b data-testid="edge-count">{graph?.edges.length??0}</b> 导入连线</span></div>{!module&&<nav className="first-steps" aria-label="首次使用三步引导">无需 Key · 点击文件查看导入，再沿连线继续探索。</nav>}</section>
 {module&&<aside aria-label="模块详情"><div className="panel-top"><span>文件 / {String(graph!.modules.indexOf(module)+1).padStart(2,'0')}</span><button aria-label="关闭详情" onClick={()=>{const id=selected;setSelected(null);requestAnimationFrame(()=>{document.querySelector<HTMLElement>(`.react-flow__node[data-id="${id}"]`)?.focus();});}}>×</button></div><h2>{module.path.split('/').at(-1)}</h2><code className="file-path" aria-live="polite">{module.path}</code><div className="file-meta"><span>{module.bytes} 字节</span><span>{module.imports.length} 个导入</span></div><h3>从这里导入 <span>↓</span></h3><div className="imports">{module.imports.length?module.imports.map((i,n)=><button key={n} disabled={!i.target} onClick={()=>setSelected(i.target)}><span className="line-number">{String(n+1).padStart(2,'0')}</span><span><code>{i.specifier}</code><small>{i.target?'查看文件 ↗':'外部依赖 / 未解析'}</small></span></button>):<p className="muted">没有静态导入。</p>}</div><p className="panel-note">连线对应源码中的导入声明。点击空白处收起详情。</p></aside>}
 <footer><span className="gesture">拖动平移 · 滚轮缩放 · Tab 选择文件</span><details><summary>关于这张图</summary><div className="provenance"><h2>源码中的相对导入</h2><p>{graph?.notice??'读取 TS/JS 源码，不调用 AI 模型。'}</p>{graph&&<p>分支：{graph.branch} · {graph.cached?'缓存结果（5 分钟）':'已解析源码'}{graph.truncated?' · 受限源码子集':''}</p>}<p>最多读取 60 个文件。动态导入、require 和路径别名暂不解析；外部包保留为未解析导入。</p></div></details></footer>
 </main>;
}
