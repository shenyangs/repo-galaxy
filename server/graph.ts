import ts from 'typescript';
import path from 'node:path';
export type SourceFile = {path:string; source:string};
export function buildGraph(files: SourceFile[]) {
  const paths = new Set(files.map(f=>f.path));
  const modules = files.map(file=> {
    const parsed = ts.createSourceFile(file.path,file.source,ts.ScriptTarget.Latest,true);
    const imports: {specifier:string;target:string|null}[]=[];
    parsed.forEachChild(node=> {
      if (!(ts.isImportDeclaration(node)||ts.isExportDeclaration(node)) || !node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier)) return;
      const specifier=node.moduleSpecifier.text;
      let target:string|null=null;
      if(specifier.startsWith('.')) {
        const base=path.posix.normalize(path.posix.join(path.posix.dirname(file.path),specifier));
        const stem=base.replace(/\.(jsx?|mjs|cjs)$/,'');
        const candidates=[base,...['.ts','.tsx','.js','.jsx','.mts','.cts','.mjs','.cjs'].map(ext=>base+ext),...['.ts','.tsx','.js','.jsx'].map(ext=>base+'/index'+ext),...(stem!==base?['.ts','.tsx','.mts','.cts'].map(ext=>stem+ext):[])];
        target=candidates.find(p=>paths.has(p))??null;
      }
      imports.push({specifier,target});
    });
    return {id:file.path,path:file.path,bytes:Buffer.byteLength(file.source),imports};
  });
  const edges=modules.flatMap(m=>m.imports.filter(i=>i.target).map((i,n)=>({id:`${m.id}:${n}`,source:m.id,target:i.target!,specifier:i.specifier})));
  return {modules,edges};
}
export function parseRepository(input: unknown) {
  if(typeof input!=='string'||input.length>250) throw new Error('请输入公开 GitHub 仓库地址。');
  const match=/^https:\/\/github\.com\/([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))\/([A-Za-z0-9_.-]{1,100})\/?$/.exec(input.trim());
  if(!match||['.','..'].includes(match[2])) throw new Error('请使用 https://github.com/owner/repository 格式，不要添加分支或其他路径。');
  return {owner:match[1],repo:match[2].replace(/\.git$/,'')};
}
