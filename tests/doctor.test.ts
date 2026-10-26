import {it,expect} from 'vitest';
import {diagnose,supportedNode,root} from '../scripts/local-tools.mjs';
import path from 'node:path';
it('正确判断支持的 Node 版本',()=>{expect(supportedNode('22.12.0')).toBe(true);expect(supportedNode('24.0.0')).toBe(true);expect(supportedNode('22.11.0')).toBe(false);expect(supportedNode('20.19.0')).toBe(false);expect(supportedNode('23.0.0')).toBe(false);});
it('缺依赖路径返回中文恢复步骤，不崩溃',async()=>{const result=await diagnose({modulesDir:path.join(root,'artifacts','missing-dependencies'),ports:[]});expect(result.ok).toBe(false);expect(result.messages.join('\n')).toContain('缺少项目依赖');expect(result.messages.join('\n')).toContain('npm ci --cache .npm-cache');expect(result.messages.join('\n')).toContain('无需任何 API Key');});
