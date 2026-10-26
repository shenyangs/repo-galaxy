import path from 'node:path';
import {diagnose} from './local-tools.mjs';
const override=process.argv.find(a=>a.startsWith('--dependencies-dir='));
const result=await diagnose(override?{modulesDir:path.resolve(override.split('=').slice(1).join('='))}:{});
console.log(result.messages.join('\n'));
process.exitCode=result.ok?0:1;
