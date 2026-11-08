'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {Sparkles,Check,X} from './ui-icons';
export const themeChoices=[
{id:'midnight',name:'午夜薄荷',description:'深蓝夜色 · 清透薄荷',mode:'深色',bg:'#0b1220',surface:'#152235',accent:'#5ee0b7',text:'#f1f6fd'},
{id:'graphite',name:'曜石灰',description:'纯粹石墨 · 冷静银白',mode:'深色',bg:'#101112',surface:'#202225',accent:'#d3dde9',text:'#f4f5f7'},
{id:'ocean',name:'深海蓝',description:'海军深蓝 · 冰川蓝光',mode:'深色',bg:'#071422',surface:'#10283e',accent:'#71c4ff',text:'#eef7ff'},
{id:'forest',name:'松林绿',description:'深邃松绿 · 清新玉色',mode:'深色',bg:'#091914',surface:'#142f25',accent:'#91dfaa',text:'#f0f8f1'},
{id:'plum',name:'星云紫',description:'暮色紫灰 · 柔和鸢尾',mode:'深色',bg:'#171021',surface:'#2a203b',accent:'#c6abff',text:'#f7f0ff'},
{id:'ember',name:'赤陶红',description:'酒红夜幕 · 温暖珊瑚',mode:'深色',bg:'#201112',surface:'#362022',accent:'#ffb19a',text:'#fff2ed'},
{id:'porcelain',name:'云雾白',description:'冷白留白 · 翡翠点缀',mode:'浅色',bg:'#eef3f7',surface:'#ffffff',accent:'#086c59',text:'#162a39'},
{id:'sand',name:'暖砂金',description:'温润米白 · 琥珀暖金',mode:'浅色',bg:'#f5efe5',surface:'#fffcf5',accent:'#80551b',text:'#382c20'},
] as const;
export default function ThemeSwitcher(){const [open,setOpen]=useState(false),[selected,setSelected]=useState('midnight');const dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement>(null);const group=useId();
useEffect(()=>{const sync=()=>setSelected((window as any).ModelPortTheme?.get()||'midnight');sync();document.addEventListener('modelport:theme-change',sync);return()=>document.removeEventListener('modelport:theme-change',sync)},[]);
useEffect(()=>{const el=dialog.current;if(!el)return;if(open&&!el.open)el.showModal();else if(!open&&el.open){el.close();trigger.current?.focus()}},[open]);
function choose(id:string){(window as any).ModelPortTheme?.set(id);setSelected(id)}
const name=selected==='system'?'跟随系统':themeChoices.find(t=>t.id===selected)?.name||'午夜薄荷';
return <><button ref={trigger} className="theme-trigger" type="button" aria-label="更换主题" title={'当前主题：'+name} aria-haspopup="dialog" aria-expanded={open} onClick={()=>setOpen(true)}><Sparkles size={18}/><span>更换主题</span><i/></button><dialog ref={dialog} className="theme-modal" aria-labelledby={group+'-title'} onCancel={e=>{e.preventDefault();setOpen(false)}}><div className="theme-modal-header"><div><span className="theme-kicker">MAKE IT YOURS</span><h2 id={group+'-title'}>选择你的主题</h2><p>即时预览，找到最舒服的工作配色。</p></div><button aria-label="关闭主题设置" type="button" onClick={()=>setOpen(false)}><X size={20}/></button></div><fieldset className="theme-grid"><legend className="sr-only">界面主题</legend>{themeChoices.map(t=><label key={t.id} className={'theme-choice '+(selected===t.id?'is-selected':'')} style={{'--sample-bg':t.bg,'--sample-surface':t.surface,'--sample-accent':t.accent,'--sample-text':t.text} as React.CSSProperties}><input type="radio" name={group} value={t.id} checked={selected===t.id} onChange={()=>choose(t.id)}/><span className="theme-sample"><span className="sample-sidebar"><i/><i/><i/></span><span className="sample-main"><i/><span><i/><i/><i/></span><b/></span><span className="sample-mode">{t.mode}</span></span><span className="theme-choice-text"><b>{t.name}</b><small>{t.description}</small>{selected===t.id&&<Check size={15}/>}</span></label>)}</fieldset><label className="theme-system"><input type="radio" name={group} value="system" checked={selected==='system'} onChange={()=>choose('system')}/><span><b>跟随系统</b><small>自动使用午夜薄荷或云雾白</small></span><span className="system-palette"><i/><i/></span></label><div className="theme-modal-footer"><small>已自动保存到当前浏览器</small><button type="button" className="primary" onClick={()=>setOpen(false)}>完成 <Check size={15}/></button></div></dialog></>}
