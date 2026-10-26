import {it,expect} from 'vitest';
import {diagnose,supportedNode,root} from '../scripts/local-tools.mjs';
import path from 'node:path';
it.each([['22.11.0',false],['22.12.0',true],['22.99.0',true],['23.0.0',false],['23.99.0',false],['24.0.0',true],['24.99.0',true],['25.0.0',false],['25.99.0',false],['26.0.0',true],['27.0.0',true],['20.19.0',false]])('Node %s 的支持状态为 %s',(version,expected)=>{expect(supportedNode(version)).toBe(expected);});
it('缺依赖路径返回中文恢复步骤，不崩溃',async()=>{const result=await diagnose({modulesDir:path.join(root,'artifacts','missing-dependencies'),ports:[]});expect(result.ok).toBe(false);expect(result.messages.join('\n')).toContain('缺少项目依赖');expect(result.messages.join('\n')).toContain('npm ci --cache .npm-cache');expect(result.messages.join('\n')).toContain('无需任何 API Key');});
