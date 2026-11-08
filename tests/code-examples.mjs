import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import ts from 'typescript';
const js=ts.transpileModule(readFileSync(new URL('../lib/code-examples.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {buildCodeExample}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const seen=[];const server=createServer(async(req,res)=>{try{let raw='';for await(const chunk of req)raw+=chunk;const b=JSON.parse(raw);assert.equal(req.headers.authorization,'Bearer test-user-key');assert.equal(b.model,'MiniMax-M2.7');assert.equal(b.stream,false);assert.equal(b.max_tokens,1024);const anthropic=req.url==='/v1/messages';assert.ok(anthropic||req.url==='/v1/chat/completions');if(anthropic)assert.equal(req.headers['anthropic-version'],'2023-06-01');seen.push(req.url);res.setHeader('Content-Type','application/json');res.end(JSON.stringify(anthropic?{content:[{type:'text',text:'OK'}]}:{choices:[{message:{content:'OK'}}]}))}catch(e){res.writeHead(400);res.end(e.message)}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const baseUrl='http://127.0.0.1:'+server.address().port;
const run=(cmd,args,input)=>new Promise((resolve,reject)=>{const p=spawn(cmd,args);let out='',err='';p.stdout.on('data',x=>out+=x);p.stderr.on('data',x=>err+=x);p.on('error',reject);p.on('close',status=>status?reject(new Error(cmd+': '+err)):resolve(out));p.stdin.end(input)});
try{for(const protocol of ['openai','anthropic'])for(const language of ['curl','python','javascript']){const code=buildCodeExample({baseUrl:baseUrl+'/',apiKey:'test-user-key',model:'MiniMax-M2.7',protocol,language});const output=language==='curl'?await run('bash',['-c',code]):language==='python'?await run('python',['-c',code]):await run('node',['--input-type=module'],code);assert.ok(output.includes('OK'),output)}
const settings=JSON.parse(buildCodeExample({baseUrl,apiKey:'test-user-key',model:'MiniMax-M2.7',protocol:'openai',language:'claude'}));assert.equal(settings.env.ANTHROPIC_BASE_URL,baseUrl);assert.equal(settings.env.ANTHROPIC_AUTH_TOKEN,'test-user-key');assert.equal(settings.env.ANTHROPIC_DEFAULT_HAIKU_MODEL,'MiniMax-M2.7');assert.equal(seen.length,6);
assert.ok(buildCodeExample({baseUrl,apiKey:'',model:'MiniMax-M2.7',protocol:'openai',language:'curl'}).includes('YOUR_API_KEY'));
console.log('PASS: executed generated cURL, Python and JavaScript for both protocols; Claude Code JSON and placeholder handling');
}finally{server.close()}
