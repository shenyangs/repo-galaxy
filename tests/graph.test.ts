import {describe,it,expect} from 'vitest';
import {buildGraph,parseRepository} from '../server/graph';
describe('source import resolution',()=>{
 it('creates exactly one observed edge and no missing target edge',()=>{const g=buildGraph([{path:'a.ts',source:"import {b} from './b'; import './missing';"},{path:'b.ts',source:'export const b=1'}]);expect(g.edges).toEqual([{id:'a.ts:0',source:'a.ts',target:'b.ts',specifier:'./b'}]);expect(g.modules[0].imports[1].target).toBeNull();});
 it('resolves index and JS-to-TS imports but never packages or comments',()=>{const g=buildGraph([{path:'src/a.ts',source:"// import './fake'\nimport 'react'; export {x} from './lib'; import './other.js';"},{path:'src/lib/index.ts',source:'export const x=1'},{path:'src/other.ts',source:''}]);expect(g.edges.map(e=>e.target)).toEqual(['src/lib/index.ts','src/other.ts']);});
 it('rejects non-GitHub, private URL tricks and extra paths',()=>{for(const url of ['http://github.com/a/b','https://evil.test/a/b','https://github.com@evil.test/a/b','https://github.com/a/b/tree/main','file:///etc/passwd','https://github.com/a/..'])expect(()=>parseRepository(url)).toThrow();expect(parseRepository('https://github.com/vercel/next.js')).toEqual({owner:'vercel',repo:'next.js'});});
});
