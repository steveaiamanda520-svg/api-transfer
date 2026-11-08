import assert from 'node:assert/strict';
import {loadGateway} from '../local/load-gateway.mjs';
import {openStorage} from '../local/storage.mjs';
const store=openStorage(':memory:');const gateway=await loadGateway({DB:store.DB,VAULT_KEY:'0123456789abcdef0123456789abcdef'});
async function call(path,body,token,admin=false){const r=await gateway.GET(new Request('http://localhost:8080'+path,{method:body?'POST':'GET',headers:{Origin:'http://localhost:8080','Content-Type':'application/json',...(admin?{'oai-authenticated-user-id':'admin'}:{}),...(token?(path.endsWith('/messages')?{'x-api-key':token}:{Authorization:'Bearer '+token}):{})},body:body?JSON.stringify(body):undefined}));return r}
const plan={id:'mini',name:'MiniMax',price:29,type:'requests',limit:4,hours:5,tokenLimit:1000000,rate:2};await call('/api/plan',plan,null,true);
// One subscription, one upstream key, no protocol selection.
assert.equal((await call('/api/channel',{name:'MiniMax 订阅',url:'https://api.minimax.cn/v1',apiKey:'one-official-key',models:['MiniMax-M3.1-Flash']},null,true)).status,200);
const state=await (await call('/api/state',null,null,true)).json();assert.equal(state.channels.length,1);assert.deepEqual(state.channels[0].protocols,['openai','anthropic']);
const token=(await (await call('/api/keys',{name:'same user',balance:10,plan:'mini'},null,true)).json()).key;
const seen=[];globalThis.fetch=async(url,options)=>{seen.push(url);assert.equal(options.headers.Authorization,'Bearer one-official-key');const b=JSON.parse(options.body),anthropic=url.includes('/anthropic/');if(b.stream){const text=anthropic?'event: message_start\ndata: {"type":"message_start","message":{"usage":{"input_tokens":10}}}\n\nevent: message_delta\ndata: {"type":"message_delta","usage":{"output_tokens":5}}\n\nevent: message_stop\ndata: {"type":"message_stop"}\n\n':'data: {"choices":[],"usage":{"total_tokens":15}}\n\ndata: [DONE]\n\n';return new Response(text,{headers:{'Content-Type':'text/event-stream'}})}return Response.json(anthropic?{type:'message',content:[{type:'text',text:'ok'}],usage:{input_tokens:10,output_tokens:5}}:{choices:[{message:{role:'assistant',content:'ok'}}],usage:{total_tokens:15}})};
for(const stream of [false,true])for(const path of ['/v1/chat/completions','/v1/messages']){const r=await call(path,{model:'MiniMax-M3.1-Flash',max_tokens:64,messages:[{role:'user',content:'hi'}],stream},token);assert.equal(r.status,200);await r.text()}
assert.deepEqual([...new Set(seen)],['https://api.minimax.cn/v1/chat/completions','https://api.minimax.cn/anthropic/v1/messages']);
const a=await (await call('/api/balance',null,token)).json();assert.equal(a.requests,4);assert.equal(a.tokens,60);assert.ok(Math.abs(a.balance-9.99988)<1e-8);
for(const path of ['/v1/chat/completions','/v1/messages'])assert.equal((await call(path,{model:'MiniMax-M3.1-Flash',max_tokens:64,messages:[{role:'user',content:'hi'}]},token)).status,429);
console.log('PASS: one MiniMax subscription + one official key + one user key, automatic dual routing, both SSE formats, shared balance/tokens, shared request cap');store.close();
