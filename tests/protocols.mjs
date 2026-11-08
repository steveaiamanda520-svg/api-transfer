import assert from 'node:assert/strict';
import {loadGateway} from '../local/load-gateway.mjs';
import {openStorage} from '../local/storage.mjs';
const store=openStorage(':memory:');const gateway=await loadGateway({DB:store.DB,VAULT_KEY:'0123456789abcdef0123456789abcdef'});
async function call(path,body,token,admin=false){return gateway.GET(new Request('http://localhost:8080'+path,{method:body?'POST':'GET',headers:{Origin:'http://localhost:8080','Content-Type':'application/json',...(admin?{'oai-authenticated-user-id':'owner'}:{}),...(token?(path.endsWith('/messages')?{'x-api-key':token,'anthropic-version':'2023-06-01'}:{Authorization:'Bearer '+token}):{})},body:body?JSON.stringify(body):undefined}))}
const channels=[
  {id:'openai-channel',name:'OpenAI',url:'https://api.openai.com/v1',apiKey:'official-openai',models:['openai-test']},
  {id:'anthropic-channel',name:'Anthropic',url:'https://api.anthropic.com/v1',apiKey:'official-anthropic',models:['anthropic-test']}
];
for(const channel of channels)assert.equal((await call('/api/channel',channel,null,true)).status,200);
const plans=[
  {id:'openai-plan',name:'OpenAI Token',channelId:'openai-channel',limit:1,hours:5,tokenLimit:10000000,price:1,rate:2},
  {id:'anthropic-plan',name:'Anthropic Token',channelId:'anthropic-channel',limit:1,hours:5,tokenLimit:10000000,price:1,rate:2}
];
for(const plan of plans)assert.equal((await call('/api/plan',plan,null,true)).status,200);
const token=(await (await call('/api/keys',{name:'user',plans:plans.map(x=>x.id),balance:10},null,true)).json()).key;
let protocol='openai',stream=false;
globalThis.fetch=async(url,opts)=>{const p=JSON.parse(opts.body);assert.equal(url,'https://api.'+(protocol==='openai'?'openai.com/v1/chat/completions':'anthropic.com/v1/messages'));assert.deepEqual(p.tools,protocol==='openai'?[{type:'function',function:{name:'weather',parameters:{type:'object'}}}]:[{name:'weather',input_schema:{type:'object'}}]);if(protocol==='anthropic'){assert.equal(opts.headers['x-api-key'],'official-anthropic');assert.equal(p.system,'be helpful')}else assert.equal(opts.headers.Authorization,'Bearer official-openai');
if(!stream)return Response.json(protocol==='openai'?{choices:[{message:{role:'assistant',content:'ok'}}],usage:{total_tokens:23}}:{type:'message',role:'assistant',content:[{type:'text',text:'ok'}],usage:{input_tokens:20,output_tokens:7,cache_read_input_tokens:3}});
const data=protocol==='openai'?'data: {"choices":[{"delta":{"content":"hi"}}]}\n\ndata: {"choices":[],"usage":{"total_tokens":33}}\n\ndata: [DONE]\n\n':'event: message_start\ndata: {"type":"message_start","message":{"usage":{"input_tokens":20,"output_tokens":1,"cache_read_input_tokens":3}}}\n\nevent: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"hi"}}\n\nevent: message_delta\ndata: {"type":"message_delta","usage":{"output_tokens":7}}\n\nevent: message_stop\ndata: {"type":"message_stop"}\n\n';
const bytes=new TextEncoder().encode(data);let i=0;return new Response(new ReadableStream({pull(c){if(i>=bytes.length){c.close();return}c.enqueue(bytes.slice(i,i+13));i+=13}}),{headers:{'Content-Type':'text/event-stream'}})};
const request=()=>({model:protocol+'-test',max_tokens:100,stream,messages:[{role:'user',content:[{type:'text',text:'hi'}]}],...(protocol==='anthropic'?{system:'be helpful'}:{}),tools:protocol==='openai'?[{type:'function',function:{name:'weather',parameters:{type:'object'}}}]:[{name:'weather',input_schema:{type:'object'}}]});
for(const p of ['openai','anthropic']){protocol=p;for(const s of [false,true]){stream=s;const r=await call(p==='openai'?'/v1/chat/completions':'/v1/messages',request(),token);assert.equal(r.status,200);if(s)assert.match(await r.text(),/hi/);else assert.ok(await r.json())}}
const balance=await(await call('/api/balance',null,token)).json();assert.equal(balance.tokens,116);assert.equal(balance.subscriptions.length,2);assert.equal(balance.subscriptions.find(x=>x.provider==='OpenAI').usedTokens,56);assert.equal(balance.subscriptions.find(x=>x.provider==='Anthropic').usedTokens,60);assert.ok(Math.abs(balance.balance-(10-116*2/1e6))<1e-8);
const openaiOnly=(await(await call('/api/keys',{name:'one provider',plans:['openai-plan'],balance:10},null,true)).json()).key;protocol='anthropic';stream=false;assert.equal((await call('/v1/messages',request(),openaiOnly)).status,403);
assert.equal((await call('/v1/models',null,openaiOnly)).status,200);const models=await(await call('/v1/models',null,openaiOnly)).json();assert.deepEqual(models.data.map(x=>x.id),['openai-test']);
protocol='openai';stream=false;const sample=request(),reserve=new TextEncoder().encode(JSON.stringify({...sample,max_tokens:undefined,max_completion_tokens:undefined})).length+sample.max_tokens;const limited={...plans[0],id:'limited-plan',tokenLimit:reserve};await call('/api/plan',limited,null,true);const k2=(await(await call('/api/keys',{name:'concurrent',plans:['limited-plan'],balance:10},null,true)).json()).key;const results=await Promise.all(Array.from({length:10},()=>call('/v1/chat/completions',request(),k2)));assert.equal(results.filter(r=>r.status===200).length,1);assert.equal(results.filter(r=>r.status===402).length,9);
console.log('PASS: multi-provider subscriptions, separate token usage, OpenAI + Anthropic passthrough, SSE settlement, model filtering, missing subscription rejection, concurrent token cap');store.close();

