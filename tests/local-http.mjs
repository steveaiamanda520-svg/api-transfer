import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {randomBytes} from 'node:crypto';
import assert from 'node:assert/strict';
const dir=mkdtempSync(join(tmpdir(),'modelport-http-'));const password=randomBytes(24).toString('hex');
const child=spawn(process.execPath,['--import',resolve('tests/fake-upstream.mjs'),'local/server.mjs'],{cwd:process.env.MODELPORT_TEST_ROOT||process.cwd(),env:{...process.env,PORT:'8080',ADMIN_PASSWORD:password,DATA_DIR:dir},stdio:['ignore','pipe','pipe']});
try{await new Promise((resolve,reject)=>{child.stdout.on('data',b=>{if(String(b).includes('ModelPort:'))resolve()});child.on('exit',c=>reject(Error('Server exited '+c)));child.on('error',reject);setTimeout(()=>reject(Error('Startup timeout')),15000).unref()});
const base='http://localhost:8080';let r=await fetch(base+'/',{redirect:'manual'});assert.equal(r.status,303);assert.equal(r.headers.get('location'),'/login');
assert.equal((await fetch(base+'/balance')).status,200);r=await fetch(base+'/api/state',{headers:{'oai-authenticated-user-id':'forged'}});assert.equal(r.status,401);
assert.equal((await fetch(base+'/login',{method:'POST',headers:{Origin:'http://evil.test'},body:'password='+password})).status,403);
r=await fetch(base+'/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({password}),redirect:'manual'});assert.equal(r.status,303);const cookie=r.headers.get('set-cookie').split(';')[0];assert.match(r.headers.get('set-cookie'),/HttpOnly/);
async function admin(path,body){const r=await fetch(base+'/api/'+path,{method:body?'POST':'GET',headers:{Cookie:cookie,Origin:base,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});assert.equal(r.status,200);return r.json()}
await admin('channel',{name:'MiniMax',url:'https://api.minimax.cn/v1',models:['MiniMax-M3.1-Flash'],apiKey:'fixture-official-key'});
const {key}=await admin('keys',{name:'local tester',plan:'starter',balance:10});
for(const stream of [false,true])for(const protocol of ['openai','anthropic']){const response=await fetch(base+(protocol==='openai'?'/v1/chat/completions':'/v1/messages'),{method:'POST',headers:{'Content-Type':'application/json',...(protocol==='openai'?{Authorization:'Bearer '+key}:{'x-api-key':key,'anthropic-version':'2023-06-01'})},body:JSON.stringify({model:'MiniMax-M3.1-Flash',max_tokens:64,stream,messages:[{role:'user',content:'hello'}]})});assert.equal(response.status,200);assert.match(await response.text(),stream?/message_stop|DONE/:/fixture reply/)}
r=await fetch(base+'/api/balance',{headers:{Authorization:'Bearer '+key}});const b=await r.json();assert.equal(b.requests,4);assert.equal(b.tokens,60);assert.equal(b.balance,10);assert.equal(b.subscriptions[0].provider,'MiniMax');assert.equal((await admin('state')).channels.length,1);
console.log('PASS localhost:8080 HTTP: admin login, public balance page, forged identity rejected, CSRF, one MiniMax subscription, dual protocol + SSE, shared accounting (mock official responses)');
}finally{child.kill('SIGTERM');await new Promise(r=>child.once('exit',r));rmSync(dir,{recursive:true,force:true})}
