import { useSyncExternalStore } from 'react';
import { z } from 'zod';
import type { PortfolioData, Project } from '../types';
import legacyProjects from './legacy-projects.json';
const text=z.string().max(10000);
const url=z.string().max(500).refine(v=>!v||/^https?:\/\//i.test(v),'请输入完整的 http 或 https 地址');
export const profileSchema=z.object({name:z.string().trim().min(1).max(40),role:z.string().trim().min(1).max(80),bio:text,about:text,email:z.string().refine(v=>!v||z.string().email().safeParse(v).success,'邮箱格式不正确'),github:url,location:z.string().max(80)});
export const skillSchema=z.object({id:z.string(),name:z.string().trim().min(1).max(60),category:z.string().trim().min(1).max(40),level:z.coerce.number().min(0).max(100)});
export const projectSchema=z.object({id:z.string(),title:z.string().trim().min(1).max(100),summary:z.string().max(300),category:z.string().max(60),tags:z.string().max(200),description:text,url,sourceUrl:url.default(''),featured:z.boolean()});
export const postSchema=z.object({id:z.string(),title:z.string().trim().min(1).max(100),excerpt:z.string().max(300),content:text,date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),published:z.boolean()});
export const settingsSchema=z.object({siteTitle:z.string().trim().min(1).max(60),siteDescription:z.string().max(300)});
const schema=z.object({profile:profileSchema,skills:z.array(skillSchema).max(100),projects:z.array(projectSchema).max(100),posts:z.array(postSchema).max(100),settings:settingsSchema,migrations:z.array(z.string()).optional()});
export const initialData:PortfolioData={"profile":{"name":"CY","role":"学生开发者 · 持续探索中","bio":"把好奇心写进代码，把想法做成可以使用的作品。","about":"你好，我是 CY。这是我的个人作品集与学习手记。\n\n我正在学习前端开发、AI 辅助编程与产品实践，喜欢在一个个小项目中理解技术，也重视界面背后的真实体验。\n\n这里的个人资料为可编辑示例，后续会持续补充真实经历与作品。","email":"","github":"","location":"位置待补充"},"skills":[{"id":"s1","name":"HTML / CSS","category":"界面构建","level":78},{"id":"s2","name":"JavaScript","category":"编程语言","level":70},{"id":"s3","name":"React / TypeScript","category":"前端开发","level":65},{"id":"s4","name":"Git / AI 编程","category":"开发工具","level":72}],"projects":[{"id":"imagegrab","title":"ImageGrab","summary":"从浏览器页面发现图片，让素材收集更轻松。","category":"浏览器扩展","tags":"Chrome Extension,JavaScript,Manifest V3","description":"# 图片收集，从一步开始\n\nImageGrab 是实训中的 Chrome 图片提取插件项目。支持提取页面图片、集中预览、筛选与批量下载。\n\n## 项目关注点\n\n- 将分散的页面图片集中展示\n- 提供筛选与批量下载操作\n- 使用 Manifest V3 构建扩展\n\n项目提供在线官网与公开源码，可通过下方入口了解详情。","url":"https://suannaibanmaipian.github.io/image-grab-plugin/docs/","featured":true,"sourceUrl":"https://github.com/suannaibanmaipian/image-grab-plugin"},{"id":"todo","title":"A little Todo","summary":"一个轻量的待办清单，把注意力留给今天要做的事。","category":"Web 应用","tags":"HTML,CSS,JavaScript,localStorage","description":"# 让日常更有条理\n\n原生 HTML、CSS、JavaScript 实现的单页待办应用。\n\n## 已实现功能\n\n- 新增与删除待办\n- 切换完成状态\n- 未完成事项计数\n- 使用 localStorage 保存数据\n\n这是一个从基础交互出发的练习项目，可在线体验并查看公开源码。","url":"https://suannaibanmaipian.github.io/todo/","featured":true,"sourceUrl":"https://github.com/suannaibanmaipian/todo"}],"posts":[{"id":"first-note","title":"从一个小项目开始","excerpt":"关于学习、实践，以及把想法真正做出来的第一步。","date":"2026-10-16","published":true,"content":"# 从一个小项目开始\n\n这是一篇示例学习笔记。学习开发时，我尝试把知识放回具体的问题里：一个按钮的反馈、一次数据保存、一段更清晰的代码。\n\n## 先让它工作，再让它更好\n\n拆小任务，完成最短的闭环，然后逐步打磨体验。\n\n```ts\nconst nextStep = \"把想法变成可运行的作品\";\nconsole.log(nextStep);\n```\n\n> 记录不是终点，它让下一次探索有迹可循。"}],"settings":{"siteTitle":"星间手记","siteDescription":"一个学生开发者的作品与思考。"},"migrations":["project-links-v1"]};
const KEY='cy-portfolio-v1';
const LINK_MIGRATION='project-links-v1';
function migrateProjectLinks(data:PortfolioData):PortfolioData {
  if(data.migrations?.includes(LINK_MIGRATION))return data;
  const projects=data.projects.map(project=>{
    const legacy=legacyProjects.find(old=>old.id===project.id);
    // Match the complete old record; never patch an edited or deleted project.
    if(!legacy||project.sourceUrl||!Object.entries(legacy).every(([key,value])=>project[key as keyof Project]===value))return project;
    const updated=initialData.projects.find(p=>p.id===project.id)!;
    return {...project,url:updated.url,sourceUrl:updated.sourceUrl,description:updated.description};
  });
  return {...data,projects,migrations:[...(data.migrations||[]),LINK_MIGRATION]};
}
let storageWarning='';
function read():PortfolioData {try {const raw=localStorage.getItem(KEY);if(!raw)return structuredClone(initialData);const parsed=schema.safeParse(JSON.parse(raw));if(parsed.success){const migrated=migrateProjectLinks(parsed.data);if(migrated!==parsed.data){try{localStorage.setItem(KEY,JSON.stringify(migrated));}catch{storageWarning='项目链接已在当前页面更新，但浏览器未能保存数据升级；请检查本地存储。';}}return migrated;}storageWarning='本地数据格式异常，已显示默认内容；保存会替换异常数据。';}catch{storageWarning='无法读取本地数据，已显示默认内容。';}return structuredClone(initialData);}
let current=read();const listeners=new Set<()=>void>();
function emit(){listeners.forEach(fn=>fn());}
window.addEventListener('storage',e=>{if(e.key===KEY||e.key===null){current=read();emit();}});
export const api={get:()=>current,warning:()=>storageWarning,save:(data:PortfolioData)=>{const checked=schema.parse(data);try{localStorage.setItem(KEY,JSON.stringify(checked));}catch{throw new Error('保存失败：浏览器存储不可用或空间不足，请检查后重试。');}current=checked;storageWarning='';emit();}};
export function usePortfolio(){return useSyncExternalStore(fn=>{listeners.add(fn);return()=>{listeners.delete(fn);};},()=>current);}
const SESSION='cy-portfolio-session';
export const auth={isLoggedIn:()=>{try {const value=JSON.parse(sessionStorage.getItem(SESSION)||'null');return !!value&&value.expires>Date.now();}catch{return false;}},login:async(user:string,password:string)=>{const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(password));const hash=Array.from(new Uint8Array(bytes)).map(b=>b.toString(16).padStart(2,'0')).join('');if(user!=='admin'||hash!=='8d39515f78e8852f253fe33f23a052d35983d8381574376def9cd9599ee0e4bd')throw new Error('账号或密码不正确');sessionStorage.setItem(SESSION,JSON.stringify({expires:Date.now()+8*60*60*1000}));},logout:()=>sessionStorage.removeItem(SESSION)};
