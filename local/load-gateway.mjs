import ts from 'typescript';
import {readFileSync} from 'node:fs';
export async function loadGateway(env){const js=ts.transpileModule(readFileSync(new URL('../lib/gateway.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;return (await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'))).createGateway(env)}
