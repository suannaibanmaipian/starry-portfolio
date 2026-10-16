const fs=require('node:fs'); const path=require('node:path');
const {chromium}=require('C:/Users/cy155/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=(process.argv[2]||'http://127.0.0.1:4173').replace(/\/$/,'');
const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/portfolio-v1.json'),'utf8').replace(/^\uFEFF/,''));
const eq=(a,b)=>require('node:util').isDeepStrictEqual(a,b);const assert=(ok,s)=>{if(!ok)throw Error(s);console.log('PASS '+s)};
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
 const c=await b.newContext({viewport:{width:1440,height:1000}});const p=await c.newPage();await p.goto(base); 
 const load=async data=>{await p.evaluate(v=>localStorage.setItem('cy-portfolio-v1',JSON.stringify(v)),data);await p.reload();return p.evaluate(()=>JSON.parse(localStorage.getItem('cy-portfolio-v1')))};
 let migrated=await load(fixture);assert(migrated.projects.every(x=>x.url.startsWith('https://')&&x.sourceUrl.startsWith('https://github.com/')),'legacy default receives demo and source URLs');
 for(const key of ['profile','skills','posts','settings'])assert(eq(migrated[key],fixture[key]),'migration preserves '+key);
 const edited=structuredClone(fixture);edited.projects[0].title='My customized project';edited.projects[0].url='https://example.com/custom';let x=await load(edited);assert(x.projects[0].title===edited.projects[0].title&&x.projects[0].url===edited.projects[0].url&&!x.projects[0].sourceUrl,'custom project preserved');
 const removed=structuredClone(fixture);removed.projects=removed.projects.filter(x=>x.id!=='todo');x=await load(removed);assert(x.projects.length===1&&!x.projects.some(v=>v.id==='todo'),'deleted project never resurrects');
 migrated.projects[0].url='';migrated.projects[0].sourceUrl='';x=await load(migrated);assert(x.projects[0].url===''&&x.projects[0].sourceUrl==='','cleared links stay empty after migration');
 await p.evaluate(()=>localStorage.removeItem('cy-portfolio-v1'));await p.reload();await p.goto(base+'/admin/login');await p.getByLabel('账号',{exact:true}).fill('admin');await p.getByLabel('密码',{exact:true}).fill('Starry2026!');await p.getByRole('button',{name:'进入管理后台'}).click();await p.waitForURL('**/admin');await p.goto(base+'/admin/projects');await p.getByRole('button',{name:'编辑ImageGrab',exact:true}).click();
 const source=p.getByLabel('源码地址');assert(await source.inputValue()==='https://github.com/suannaibanmaipian/image-grab-plugin','admin exposes source field');await source.fill('javascript:alert(1)');await p.getByRole('button',{name:'保存项目'}).click();assert(await source.count()===1,'unsafe protocol rejected by form');assert(!await p.evaluate(()=>localStorage.getItem('cy-portfolio-v1')),'invalid URL not persisted');
 const out=path.join(__dirname,'../deliverables',base.startsWith('https:')?'site-online':'site-local');fs.mkdirSync(out,{recursive:true});
 for(const [id,demo,repo,file] of [['todo','https://suannaibanmaipian.github.io/todo/','https://github.com/suannaibanmaipian/todo','08-todo-links'],['imagegrab','https://suannaibanmaipian.github.io/image-grab-plugin/docs/','https://github.com/suannaibanmaipian/image-grab-plugin','06-project-detail']]){await p.goto(base+'/projects/'+id);for(const url of [demo,repo]){const a=p.locator('a[href="'+url+'"]');assert(await a.count()===1,'detail link '+url);assert(await a.getAttribute('target')==='_blank'&&(await a.getAttribute('rel')).includes('noopener'),'safe external link '+id)}await p.screenshot({path:path.join(out,file+'-'+(base.startsWith('https:')?'online':'local')+'.png'),fullPage:true})}
 console.log('VERIFIED '+base);
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});

