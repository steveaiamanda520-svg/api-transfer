'use client';
import {useEffect,useRef,useState} from 'react';
import {Code2,Copy,Check,X} from './ui-icons';
import {buildCodeExample,type ExampleLanguage,type ExampleProtocol} from '../lib/code-examples';
type Channel={enabled:boolean;models:string[];protocols?:string[];protocol?:string};
type Target={name?:string;key?:string};
export default function CodeExamples({target,channels,onClose}:{target:Target|null;channels:Channel[];onClose:()=>void}){
const dialog=useRef<HTMLDialogElement>(null);
const [language,setLanguage]=useState<ExampleLanguage>('curl'),[protocol,setProtocol]=useState<ExampleProtocol>('openai'),[base,setBase]=useState(''),[key,setKey]=useState(''),[model,setModel]=useState(''),[copied,setCopied]=useState(false),[copyError,setCopyError]=useState(false);
const actualProtocol=language==='claude'?'anthropic':protocol;
const models=[...new Set(channels.filter(c=>c.enabled&&(c.protocols||[c.protocol||'openai']).includes(actualProtocol)).flatMap(c=>c.models))];
const selected=models.includes(model)?model:models[0]||'';
useEffect(()=>{if(target){setBase(window.location.origin);setKey(target.key||'');setLanguage('curl');setProtocol('openai');setCopied(false);setCopyError(false);if(!dialog.current?.open)dialog.current?.showModal()}else{setKey('');dialog.current?.close()}},[target]);
const code=buildCodeExample({baseUrl:base,apiKey:key,model:selected||'YOUR_MODEL',protocol:actualProtocol,language});
async function copy(){try{await navigator.clipboard.writeText(code);setCopied(true);setCopyError(false)}catch{setCopyError(true)}}
return <dialog ref={dialog} className="code-examples-dialog" aria-labelledby="code-examples-title" onCancel={e=>{e.preventDefault();onClose()}}><div className="code-examples-heading"><Code2 size={26}/><div><h2 id="code-examples-title">API 调用示例</h2><p>{target?.name||'用户密钥'} · 复制即可接入你的应用</p></div><button type="button" aria-label="关闭代码示例" onClick={onClose}><X size={20}/></button></div>
<div className="code-language-tabs" role="group" aria-label="示例语言">{([['curl','cURL'],['python','Python'],['javascript','JavaScript'],['claude','Claude Code']] as const).map(([id,label])=><button key={id} type="button" aria-pressed={language===id} className={language===id?'selected':''} onClick={()=>{setLanguage(id);setCopied(false)}}>{label}</button>)}</div>
<div className="code-example-settings"><label>中转服务地址<input type="url" value={base} placeholder="http://localhost:8080" onChange={e=>{setBase(e.target.value);setCopied(false)}}/><small>填写域名根地址，不含 /v1 或 /anthropic。</small></label><label>用户 API Key<input type="password" autoComplete="off" value={key} placeholder="YOUR_API_KEY" onChange={e=>{setKey(e.target.value);setCopied(false)}}/><small>{target?.key?'已带入刚创建的密钥，仅保留在当前页面。':'历史密钥无法还原；可粘贴完整密钥，或复制后替换 YOUR_API_KEY。'}</small></label><label>调用格式<select value={actualProtocol} disabled={language==='claude'} onChange={e=>{setProtocol(e.target.value as ExampleProtocol);setCopied(false)}}><option value="openai">OpenAI Chat Completions</option><option value="anthropic">Anthropic Messages</option></select></label><label>模型<select value={selected} onChange={e=>{setModel(e.target.value);setCopied(false)}}>{models.length?models.map(m=><option key={m}>{m}</option>):<option value="">请先配置支持此协议的渠道</option>}</select></label></div>
{language==='claude'&&<p className="code-example-note">合并到用户配置：Windows 为 %USERPROFILE%\.claude\settings.json；macOS / Linux 为 ~/.claude/settings.json。保留原有其他设置，重启 Claude Code 后用 /status 查看连接。此配置使用 Anthropic 协议。</p>}
<div className="code-example-toolbar"><span>{language==='claude'?'settings.json':language==='javascript'?'example.mjs':language==='python'?'example.py':'终端 · Bash / macOS / Linux / Git Bash'}</span><button type="button" onClick={copy}>{copied?<Check size={16}/>:<Copy size={16}/>} {copied?'已复制':'复制代码'}</button></div><pre className="code-example-content" tabIndex={0}><code>{code}</code></pre>{copyError&&<p role="alert">复制失败，请选中上方代码手动复制。</p>}
<p className="code-example-note">示例地址指向中转站，使用用户密钥。若返回站点登录页面，请换成可从客户端访问的 API 域名或本地 http://localhost:8080；用户密钥不代替网站访问权限。</p></dialog>
}
