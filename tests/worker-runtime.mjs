import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const require=createRequire(import.meta.resolve('wrangler'));
const {Miniflare,createFetchMock}=require('miniflare');
const mock=createFetchMock();mock.disableNetConnect();
for(const path of ['/anthropic/v1/messages','/v1/chat/completions'])mock.get('https://api.minimaxi.com').intercept({path,method:'POST'}).reply(200,JSON.stringify(path.includes('anthropic')?{content:[{type:'text',text:'OK'}],usage:{input_tokens:2,output_tokens:1}}:{choices:[{message:{content:'OK'}}],usage:{total_tokens:3}}),{headers:{'content-type':'application/json'}}).persist();
const source=ts.transpileModule(readFileSync(new URL('../lib/gateway.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const mf=new Miniflare({modules:true,script:source+`\nexport default {async fetch(req,env){if(new URL(req.url).pathname==='/runtime-check'){try{new Request('https://api.minimaxi.com',{redirect:'error'});return Response.json({rejected:false})}catch(e){return Response.json({rejected:true,message:e.message})}}return createGateway(env).GET(req)}}`,compatibilityDate:'2026-05-15',d1Databases:['DB'],bindings:{VAULT_KEY:'0123456789abcdef0123456789abcdef'},fetchMock:mock});
try{
const db=await mf.getD1Database('DB');for(const sql of readFileSync(new URL('../drizzle/0000_steep_maelstrom.sql',import.meta.url),'utf8').replace(/--[^\n]*/g,'').split(';').filter(x=>x.trim()))await db.prepare(sql).run();
const check=await(await mf.dispatchFetch('http://localhost/runtime-check')).json();assert.equal(check.rejected,true);console.log('REPRODUCED in workerd:',check.message);
async function call(path,body){return mf.dispatchFetch('http://localhost/api/'+path,{method:body?'POST':'GET',headers:{'oai-authenticated-user-id':'test-admin',Origin:'http://localhost','Content-Type':'application/json'},body:body?JSON.stringify(body):undefined})}
assert.equal((await call('channel',{name:'MiniMax',url:'https://api.minimaxi.com/anthropic',apiKey:'runtime-test-key',models:['MiniMax-M2.7']})).status,200);
const state=await(await call('state')).json();
for(const protocol of ['openai','anthropic']){const r=await call('channel-test',{channelId:state.channels[0].id,model:'MiniMax-M2.7',protocol,max_tokens:64,messages:[{role:'user',content:'ping'}]});const d=await r.json();assert.equal(r.status,200,JSON.stringify(d));assert.equal(d.reply,'OK')}
const key=(await(await call('keys',{name:'runtime user',balance:10,plan:'starter'})).json()).key;
for(const path of ['/v1/chat/completions','/v1/messages']){const r=await mf.dispatchFetch('http://localhost'+path,{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({model:'MiniMax-M2.7',max_tokens:64,messages:[{role:'user',content:'ping'}]})});assert.equal(r.status,200,await r.text())}
console.log('PASS: actual Cloudflare workerd runtime, encrypted channel, OpenAI + Anthropic diagnostics and customer forwarding');
}finally{await mf.dispose()}
