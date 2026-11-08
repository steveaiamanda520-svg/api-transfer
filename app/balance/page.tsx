'use client';
import {useState} from 'react';
import ThemeSwitcher from '../theme-switcher';
import {AudioLines,ArrowRight,ShieldCheck,ProviderIcon} from '../ui-icons';

function Subscription({item}:{item:any}){
  const request=item.type==='requests';
  const used=request?item.usedRequests:item.usedTokens;
  const total=request?item.limit:item.tokenLimit;
  const exhausted=used>=total;
  return <section className="balance-subscription">
    <div className="balance-subscription-title"><ProviderIcon name={item.provider} size={30}/><div><small>{item.provider}</small><b>{item.name}</b></div><span className={'tag '+(exhausted?'red':'green')}>{exhausted?'已用尽':'可用'}</span></div>
    <div className="balance-row"><span>绑定渠道</span><b>{item.channelName}</b></div>
    <div className="balance-row"><span>计量方式</span><b>{request?'调用次数':'Token 用量'}</b></div>
    <div className="balance-row"><span>{request?'本窗口剩余次数':'剩余 Token'}</span><b>{Math.max(0,total-used).toLocaleString()} / {total.toLocaleString()}{request?' 次':''}</b></div>
    <div className="quota-bar"><i style={{width:Math.min(100,used/total*100)+'%'}}/></div>
    <div className="balance-row"><span>{request?'窗口已调用':'已用 Token'}</span><b>{used.toLocaleString()}</b></div>
    {request&&<div className="balance-row"><span>窗口重置</span><b>{item.resetAt?new Date(item.resetAt).toLocaleString('zh-CN'):'首次调用开始计时'}</b></div>}
    {exhausted&&<div className="balance-error">{request?'本窗口调用次数已达到上限，请等待重置或联系管理员升级订阅。':'该供应商 Token 额度已用尽，请联系管理员升级订阅。'}</div>}
  </section>
}

export default function Balance(){
  const [key,setKey]=useState(''),[data,setData]=useState<any>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  async function check(e:any){e.preventDefault();setBusy(true);setError('');setData(null);try{const r=await fetch('/api/balance',{headers:{Authorization:'Bearer '+key.trim()}});const d:any=await r.json();if(!r.ok)throw Error(d.error?.message||'查询失败');setData(d)}catch(e:any){setError(e.message)}finally{setBusy(false)}}
  return <div className="balance-shell"><div className="balance-theme"><ThemeSwitcher/></div><div className="brand"><span className="brand-icon"><AudioLines size={26}/></span>ModelPort</div><section className="balance-card balance-card-wide"><h1>查询你的 API 额度</h1><p>输入 API Key，按供应商查看剩余次数或 Token。<br/>无需注册，密钥即凭证。</p><form onSubmit={check}><label>API Key<input autoComplete="off" type="password" placeholder="sk-mp-…" value={key} onChange={e=>setKey(e.target.value)} required/></label><button disabled={busy} className="primary full">{busy?'正在查询…':'查询额度'}<ArrowRight size={16}/></button></form>{error&&<div className="balance-error">{error}</div>}{data&&<div className="balance-result"><div className="balance-account"><div><small>账户</small><b>{data.name}</b></div><div><small>密钥状态</small><b>{data.active?'正常使用':'已停用'}</b></div><div><small>通用余额</small><b>¥ {data.balance.toFixed(4)}</b></div></div><h2 className="balance-list-title">供应商订阅 <span>{data.subscriptions?.length||0} 个</span></h2>{data.subscriptions?.length?data.subscriptions.map((item:any)=><Subscription key={item.id} item={item}/>):<div className="balance-error">当前 API Key 尚未分配供应商订阅，请联系管理员。</div>}</div>}<div className="balance-caption"><ShieldCheck size={13}/>密钥仅用于本次验证，不在浏览器保存。</div></section><div className="balance-foot">POWERED BY MODELPORT</div></div>
}
