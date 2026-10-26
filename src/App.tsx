import {useMemo,useState} from 'react';
import {ReactFlow,Background,Controls,MarkerType,Position,type Node,type Edge} from '@xyflow/react';
import dagre from 'dagre';
import {ArrowUpRight,Orbit,Search,GitBranch,Box,ArrowRight,LoaderCircle,ExternalLink} from 'lucide-react';
import '@xyflow/react/dist/style.css';
type Module={id:string;path:string;bytes:number;imports:{specifier:string;target:string|null}[]};
type Graph={modules:Module[];edges:{id:string;source:string;target:string;specifier:string}[];name:string;source:string;branch:string;notice:string;truncated:boolean;cached?:boolean};
export default function App(){
 const [url,setUrl]=useState('https://github.com/owner/repository');const [graph,setGraph]=useState<Graph|null>(null);const [selected,setSelected]=useState<string|null>(null);const [hover,setHover]=useState<string|null>(null);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const module=graph?.modules.find(m=>m.id===selected);const focus=hover??selected;
 const {nodes,edges}=useMemo(()=>{
  if(!graph)return {nodes:[],edges:[]};
  const layout=new dagre.graphlib.Graph();layout.setGraph({rankdir:'LR',ranksep:100,nodesep:55});layout.setDefaultEdgeLabel(()=>({}));
  graph.modules.forEach(m=>layout.setNode(m.id,{width:175,height:64}));graph.edges.forEach(e=>layout.setEdge(e.source,e.target));dagre.layout(layout);
  const neighbors=new Set([focus,...graph.edges.filter(e=>e.source===focus||e.target===focus).flatMap(e=>[e.source,e.target])]);
  const nodes:Node[]=graph.modules.map(m=>({id:m.id,width:175,height:64,position:{x:layout.node(m.id).x-87.5,y:layout.node(m.id).y-32},sourcePosition:Position.Right,targetPosition:Position.Left,data:{label:<div className="module-label"><span className="node-star"/><div><strong>{m.path.split('/').at(-1)}</strong><small>{m.imports.length} imports · {m.bytes} B</small></div></div>},className:`module-node ${selected===m.id?'chosen':''} ${focus&&!neighbors.has(m.id)?'dimmed':''}`,ariaRole:"button",ariaLabel:`Module ${m.path}`}));
  const edges:Edge[]=graph.edges.map(e=>({...e,animated:e.source===focus,markerEnd:{type:MarkerType.ArrowClosed,color:e.source===focus?'#b8a0ff':'#53688d'},style:{stroke:e.source===focus?'#b8a0ff':'#53688d',strokeWidth:e.source===focus?2:1,opacity:focus&&!([e.source,e.target].includes(focus))?.15:.75}}));
  return {nodes,edges};
 },[graph,focus,selected]);
 async function load(sample=false){setBusy(true);setError('');try{
 const res=await fetch(sample?'/api/sample':'/api/map',sample?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url})});const body=await res.json();if(!res.ok)throw new Error(body.error||'Unable to map repository.');setGraph(body);setSelected(null);setHover(null);
 }catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <main>
 <header><a className="brand" href="/" aria-label="RepoGalaxy home"><Orbit size={27}/><span>repo<span className="brand-light">galaxy</span></span></a><div className="header-right"><span className="status-dot"/> SOURCE CODE, CONNECTED <span className="version">v0.1 / EXPLORER</span></div></header>
 <section className="intro"><div><div className="eyebrow">A NEW PERSPECTIVE ON YOUR CODEBASE</div><h1>A GitHub repo, <br/>as a <em>galaxy.</em></h1></div><p>Follow the imports. Find the connections.<br/>Explore the architecture hiding in your files.<span>STATIC SOURCE ANALYSIS · NO MODEL REQUIRED</span></p></section>
 <form className="searchbar" onSubmit={e=>{e.preventDefault();void load();}}><Search size={19}/><input aria-label="GitHub repository URL" value={url} onChange={e=>setUrl(e.target.value)} spellCheck={false}/><button disabled={busy} type="submit">{busy?<LoaderCircle className="spin" size={16}/>:<Orbit size={16}/>} {busy?'Mapping source…':'Map repository'}<ArrowUpRight size={16}/></button><button type="button" className="secondary" disabled={busy} onClick={()=>void load(true)}>Load sample <ArrowRight size={15}/></button></form>
 {error&&<div role="alert" className="error">{error}</div>}
 <section className="explorer"><div className="map-column"><div className="map-toolbar"><div><span className="tiny-dot"/>{graph?graph.name:'YOUR NEXT DISCOVERY'}</div><span className="source-badge">{graph?graph.source:'AWAITING SOURCE'}</span></div><div className="graph-stage" aria-label="Repository import graph">
 {graph?<ReactFlow key={graph.name} nodes={nodes} edges={edges} fitView fitViewOptions={{padding:.22}} minZoom={.15} maxZoom={2} onNodeClick={(_,n)=>setSelected(n.id)} onNodeMouseEnter={(_,n)=>setHover(n.id)} onNodeMouseLeave={()=>setHover(null)} nodesDraggable={false} colorMode="dark"><Background color="#33405c" gap={26} size={1}/><Controls showInteractive={false}/></ReactFlow>:<div className="empty-state"><div className="orbital"><Orbit size={78} strokeWidth={.7}/></div><h2>Every file has a place.</h2><p>Map a public repository or explore our included<br/>Observatory source fixture.</p><span>UP TO 60 MODULES · REAL IMPORT EDGES</span></div>}
 {busy&&<div className="loading-overlay"><LoaderCircle className="spin"/> Reading files & resolving imports…</div>}
 </div><div className="map-footer"><span><Box size={14}/> <b data-testid="file-count">{graph?.modules.length??0}</b> modules</span><span><GitBranch size={14}/><b data-testid="edge-count">{graph?.edges.length??0}</b> import edges</span><span className="gesture">Drag to pan · Scroll to zoom</span></div></div>
 <aside><div className="eyebrow">MODULE INSPECTOR <span>↗</span></div>{module?<><div className="file-icon"><Box size={24}/></div><h2>{module.path.split('/').at(-1)}</h2><code className="file-path">{module.path}</code><div className="file-meta"><span>{module.bytes} bytes</span><span>{module.imports.length} imports</span></div><h3>OBSERVED IMPORTS</h3><div className="imports">{module.imports.length?module.imports.map((i,n)=><button key={n} disabled={!i.target} onClick={()=>setSelected(i.target)}><code>{i.specifier}</code><small>{i.target?'Resolved module ↗':'External / unresolved'}</small></button>):<p className="muted">Leaf module. No static imports.</p>}</div></>:<div className="inspector-empty"><Box size={32} strokeWidth={1}/><h2>Go a little deeper.</h2><p>Select a star to inspect its exact path and source imports.</p><div className="hint"><span>01</span> Hover to trace connections<br/><span>02</span> Click to inspect a module<br/><span>03</span> Follow a resolved import</div></div>}
 <div className="provenance"><h3>TRUST THE CONNECTIONS</h3><p>{graph?.notice??'Every edge comes from a parsed import declaration. No inferred or invented dependencies.'}</p>{graph&&<small>Branch: {graph.branch}<br/>{graph.cached?'Cached · 5 minute TTL':'Parsed source'}{graph.truncated?' · LIMITED SUBSET':''}</small>}</div></aside></section>
 <footer><span><span className="legend-dot"/> Module <span className="legend-line"/> Observed relative import</span><span>2D CONSTELLATION / TYPESCRIPT + JAVASCRIPT <ExternalLink size={11}/></span></footer>
 </main>;
}
