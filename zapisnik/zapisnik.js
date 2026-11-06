const CFG=window.ZAPISNIK_CFG,SUB={id:'zadani',type:CFG.type,name:CFG.title};
const KEY='zapisnik-lokalni-'+CFG.id,DEVKEY='skolni-zapisnik-zarizeni';
const uid=()=>Math.random().toString(36).slice(2,10);
const newLink=n=>({id:uid(),label:n?'Odkaz '+n:'',url:'',tasks:[]});
const openTasks=new Set();
const openIds=new Set();
let focusId=null;

/* ---------- ID zařízení ---------- */
function devId(){
  let id=null;
  try{id=localStorage.getItem(DEVKEY);}catch(e){}
  if(!id||!/^ZAP-[A-Z0-9]{6}$/.test(id)){
    const a=new Uint8Array(6);
    (window.crypto||{getRandomValues:x=>x.map(()=>Math.random()*256)}).getRandomValues(a);
    id='ZAP-'+Array.from(a,b=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b%32]).join('');
    try{localStorage.setItem(DEVKEY,id);}catch(e){}
  }
  return id;
}
const myId=devId();
const allowed=Array.isArray(window.POVOLENA_ZARIZENI)?window.POVOLENA_ZARIZENI:[];
const canEdit=allowed.some(x=>String(x).trim().toUpperCase()===myId);

/* ---------- data ---------- */
/* starý textový formát odpovědí -> úlohy (nadpis bez odsazení, otázka odsazená, odpověď odsazená víc) */
function parseAnswer(txt){
  const tasks=[];let tk=null,it=null;
  String(txt||'').split(/\r?\n/).forEach(raw=>{
    if(!raw.trim())return;
    const ind=raw.match(/^\s*/)[0].replace(/\t/g,'   ').length,s=raw.trim();
    if(ind===0||!tk){
      let title=s,note='';const i=s.indexOf(' - "');
      if(i>0){title=s.slice(0,i);note=s.slice(i+3).replace(/^"|"$/g,'');}
      tk={id:uid(),title:title,note:note,items:[]};tasks.push(tk);it=null;
    }else if(ind<6||!it){it={id:uid(),q:s,a:''};tk.items.push(it);}
    else it.a=it.a?it.a+'\n'+s:s;
  });
  return tasks;
}
function norm(x){
  x=x&&typeof x==='object'?JSON.parse(JSON.stringify(x)):{};
  const l=Array.isArray(x.zadani)?x.zadani:Array.isArray(x[CFG.legacy])?x[CFG.legacy]:[];
  if(CFG.type==='links')l.forEach(t=>(t.links||[]).forEach(r=>{if(!Array.isArray(r.tasks))r.tasks=parseAnswer(r.answer);delete r.answer;}));
  return {zadani:l};
}
const FILE=norm(window.ZAPISNIK_DATA);
function loadLocal(){try{const r=localStorage.getItem(KEY);if(r)return norm(JSON.parse(r));}catch(e){}return null;}
let S=canEdit?(loadLocal()||norm(FILE)):norm(FILE);
const strip=o=>JSON.stringify(Object.assign({},o,{cur:''}));
const dirty=()=>strip(S)!==strip(FILE);

function setStat(t,warn){const e=document.getElementById('stat');e.textContent=t;e.className=warn?'warn':'';}
function updateStat(){
  if(!canEdit)return setStat('Režim jen pro čtení');
  dirty()?setStat('● Změny zatím nejsou v '+CFG.file+' – stáhni ho a nahraj do složky',true):setStat('✓ Shodné se souborem '+CFG.file);
}
function save(quiet){
  if(!canEdit)return;
  try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}
  if(!quiet)updateStat();
}
function exportData(){
  const txt='// Obsah předmětu '+CFG.title+'. Nahraď tímto souborem '+CFG.file+' ve složce stránky.\nwindow.ZAPISNIK_DATA = '+JSON.stringify(S,null,2)+';\n';
  const a=h('a',{href:URL.createObjectURL(new Blob([txt],{type:'text/javascript'})),download:CFG.file});
  document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),1500);
}

/* ---------- pomocné ---------- */
function h(t,a={},...c){
  const e=document.createElement(t);
  for(const k in a){
    const v=a[k];
    if(k==='class')e.className=v;
    else if(k.startsWith('on'))e.addEventListener(k.slice(2),v);
    else if(v===true)e.setAttribute(k,'');
    else if(v!==false&&v!=null)e.setAttribute(k,v);
  }
  for(const x of c.flat())if(x!=null)e.append(x.nodeType?x:document.createTextNode(x));
  return e;
}
function bind(el,o,k){el.addEventListener('input',()=>{o[k]=el.value;save();});return el;}
function inp(o,k,ph,cls){return bind(h('input',{class:cls||'',value:o[k]||'',placeholder:ph,type:'text',autocomplete:'off',spellcheck:'false'}),o,k);}
function field(label,el){return h('label',{class:'f'},h('span',{},label),el);}
function fixUrl(u){u=(u||'').trim();if(!u)return '';return /^https?:\/\//i.test(u)?u:'https://'+u;}
function delBtn(fn,txt){
  txt=txt||'Smazat';
  const b=h('button',{class:'btn dng',type:'button'},txt);
  let t;
  b.addEventListener('click',()=>{
    if(b.dataset.arm){clearTimeout(t);fn();return;}
    b.dataset.arm='1';b.textContent='Opravdu?';
    t=setTimeout(()=>{delete b.dataset.arm;b.textContent=txt;},3000);
  });
  return b;
}
async function copy(txt,el){
  let ok=false;
  try{await navigator.clipboard.writeText(txt);ok=true;}
  catch(e){
    const ta=h('textarea',{style:'position:fixed;opacity:0'},txt);
    document.body.append(ta);ta.select();
    try{ok=document.execCommand('copy');}catch(e2){}
    ta.remove();
  }
  const o=el.dataset.o||el.textContent;el.dataset.o=o;
  el.textContent=ok?'Zkopírováno ✓':'Nepodařilo se';
  setTimeout(()=>{el.textContent=o;},1500);
}

/* ---------- režim úprav ---------- */
const cnt=r=>{let n=0,a=0;(r.tasks||[]).forEach(k=>k.items.forEach(i=>{n++;if((i.a||'').trim())a++;}));return [a,n];};
function edItem(k,it,n,redraw){
  const ans=bind(h('textarea',{class:'av1',rows:1,spellcheck:'false',placeholder:'Odpověď / flag'},it.a||''),it,'a');
  const cb=h('button',{class:'btn',type:'button',onclick:()=>copy(ans.value.trim(),cb)},'Kopírovat');
  const nt=bind(h('textarea',{rows:2,placeholder:'Pokyn nad touto otázkou'},it.note||''),it,'note');
  const nw=h('div',{class:'inw'},nt);
  const add=h('button',{class:'btn sm',type:'button',onclick:()=>{nw.style.display='block';add.style.display='none';nt.focus();}},'+ Pokyn nad otázku');
  const sync=()=>{const has=!!(it.note||'').trim();nw.style.display=has?'block':'none';add.style.display=has?'none':'inline-flex';};
  nt.addEventListener('blur',sync);sync();
  const st=bind(h('textarea',{rows:3,placeholder:'Postup, jak se dostat k řešení…'},it.sol||''),it,'sol');
  const sw=h('div',{class:'inw sol'},st);
  const sadd=h('button',{class:'btn sm sadd',type:'button',onclick:()=>{sw.style.display='block';sadd.style.display='none';st.focus();}},'+ Postup řešení');
  const ssync=()=>{const has=!!(it.sol||'').trim();sw.style.display=has?'block':'none';sadd.style.display=has?'none':'inline-flex';};
  st.addEventListener('blur',ssync);ssync();
  return h('div',{class:'ei'},h('span',{class:'qn'},String(n+1)),
    h('div',{class:'grow'},nw,add,bind(h('textarea',{rows:2,placeholder:'Otázka'},it.q||''),it,'q'),h('div',{class:'ar2'},ans,cb),sadd,sw),
    delBtn(()=>{k.items.splice(n,1);save();redraw();},'×'));
}
function edTask(l,k,j,redraw){
  const il=h('div');
  const draw=()=>{il.replaceChildren();k.items.forEach((it,n)=>il.append(edItem(k,it,n,draw)));};
  draw();
  return h('div',{class:'ek','data-k':k.id},
    h('div',{class:'lkh'},h('span',{class:'tn'},'Task '+(j+1)),inp(k,'title','Název tasku'),delBtn(()=>{l.tasks.splice(j,1);save();redraw();},'×')),
    bind(h('textarea',{rows:2,placeholder:'Pokyn k tasku (volitelné)'},k.note||''),k,'note'),
    il,
    h('button',{class:'btn',type:'button',onclick:()=>{k.items.push({id:uid(),q:'',a:''});save();draw();}},'+ Přidat otázku'));
}
function linkBox(t,l,i,redraw){
  if(!Array.isArray(l.tasks))l.tasks=[];
  const a=h('a',{class:'btn go',target:'_blank',rel:'noopener noreferrer'},'Otevřít ↗');
  const setA=()=>{const u=fixUrl(l.url);if(u){a.href=u;a.classList.remove('off');}else{a.removeAttribute('href');a.classList.add('off');}};
  const url=inp(l,'url','https://tryhackme.com/room/…');
  url.addEventListener('input',setA);setA();
  const tl=h('div');
  const draw=()=>{tl.replaceChildren();l.tasks.forEach((k,j)=>tl.append(edTask(l,k,j,draw)));};
  draw();
  const bulk=h('textarea',{rows:6,spellcheck:'false',placeholder:'Nadpis tasku (bez odsazení)\n   Otázka (3 mezery)\n      Odpověď (6 mezer)'});
  const bd=h('details',{class:'bulkd'},h('summary',{},'Vložit hromadně z textu'),bulk,
    h('button',{class:'btn',type:'button',onclick:()=>{const p=parseAnswer(bulk.value);if(!p.length)return;l.tasks.push(...p);bulk.value='';bd.open=false;save();draw();}},'Převést a přidat'));
  return h('div',{class:'lk'},
    h('div',{class:'lkh'},h('span',{class:'num'},String(i+1)),inp(l,'label','Název odkazu (např. Wireshark 01)'),delBtn(()=>{t.links.splice(i,1);save();redraw();},'×')),
    h('div',{class:'row'},url,a),
    tl,
    h('div',{class:'tools2'},h('button',{class:'btn',type:'button',onclick:()=>{l.tasks.push({id:uid(),title:'',note:'',items:[{id:uid(),q:'',a:''}]});save();draw();}},'+ Přidat task')),
    bd);
}
function editBody(sub,t,body,sum){
  const ti=h('input',{class:'ti','data-id':t.id,value:t.title||'',placeholder:'Název zadání',type:'text'});
  ti.addEventListener('input',()=>{t.title=ti.value;sum.textContent=ti.value||'Nové zadání';save();});
  body.append(field('Název',ti),field('Zadání',bind(h('textarea',{rows:4,placeholder:'Text zadání…'},t.desc||''),t,'desc')));
  if(sub.type==='links'){
    if(!Array.isArray(t.links))t.links=[];
    const ls=h('div');
    const draw=()=>{ls.replaceChildren();t.links.forEach((l,i)=>ls.append(linkBox(t,l,i,draw)));};
    draw();
    body.append(h('h3',{},'Odkazy a odpovědi'),ls,
      h('button',{class:'btn',type:'button',onclick:()=>{t.links.push(newLink(t.links.length+1));save();draw();}},'+ Přidat odkaz'));
  }else{
    const dl=h('datalist',{id:'dl-'+t.id},['C','C++','Python','Java','JavaScript','Assembler'].map(x=>h('option',{value:x})));
    const lang=inp(t,'lang','Jazyk (volitelné)');lang.setAttribute('list','dl-'+t.id);
    const code=bind(h('textarea',{class:'code',rows:10,spellcheck:'false',wrap:'off',placeholder:'Sem vlož kód…'},t.code||''),t,'code');
    code.addEventListener('keydown',e=>{
      if(e.key==='Tab'){e.preventDefault();code.setRangeText('    ',code.selectionStart,code.selectionEnd,'end');t.code=code.value;save();}
    });
    const cb=h('button',{class:'btn pri',type:'button',onclick:()=>copy(code.value,cb)},'Kopírovat kód');
    body.append(h('h3',{},'Kód'),code,h('div',{class:'ch'},field('Jazyk',lang),dl,cb));
  }
  const chk=h('input',{type:'checkbox',checked:!!t.done});
  chk.addEventListener('change',()=>{t.done=chk.checked;save();render();});
  const di=h('input',{type:'date',value:t.due||''});
  di.addEventListener('change',()=>{t.due=di.value;save();render();});
  const mv=dir=>()=>{const l=S[sub.id],i=l.indexOf(t),j=i+dir;if(j<0||j>=l.length)return;[l[i],l[j]]=[l[j],l[i]];save();render();};
  body.append(field('Termín odevzdání (volitelné)',di));
  body.append(h('div',{class:'foot'},h('label',{},chk,'Hotovo'),
    sortMode==='manual'?h('span',{},h('button',{class:'btn',type:'button',onclick:mv(-1)},'↑'),' ',h('button',{class:'btn',type:'button',onclick:mv(1)},'↓')):null,
    delBtn(()=>{const l=S[sub.id];l.splice(l.indexOf(t),1);save();render();},'Smazat zadání')));
}

/* ---------- režim jen pro čtení ---------- */
function solBox(it){
  if(!(it.sol||'').trim())return null;
  return h('details',{class:'sol'},h('summary',{},'💡 Postup řešení'),h('div',{class:'txt'},it.sol));
}
function ansRow(it){
  const a=(it.a||'').trim();
  if(!a)return h('div',{class:'ar'},h('div',{class:'av empty'},'— zatím bez odpovědi —'));
  const b=h('button',{class:'btn',type:'button',onclick:()=>copy(a,b)},'Kopírovat');
  return h('div',{class:'ar'},h('div',{class:'av'},a),b);
}
function roTask(k,j){
  const items=k.items||[],done=items.filter(i=>(i.a||'').trim()).length;
  const d=h('details',{class:'tk','data-k':k.id,open:openTasks.has(k.id)},
    h('summary',{},h('span',{class:'chev'},'▸'),h('span',{class:'tn'},'Task '+(j+1)),h('span',{class:'tt'},k.title||''),h('span',{class:'tc'},done+'/'+items.length)));
  d.addEventListener('toggle',()=>{d.open?openTasks.add(k.id):openTasks.delete(k.id);});
  const b=h('div',{class:'tb'});
  if(k.note)b.append(h('div',{class:'note txt'},k.note));
  items.forEach((it,n)=>b.append(h('div',{class:'q'},it.note?h('div',{class:'note txt'},it.note):null,h('div',{class:'qq'},h('span',{class:'qn'},String(n+1)),h('div',{class:'qt txt'},it.q)),ansRow(it),solBox(it))));
  d.append(b);
  return d;
}
function roRoom(l,i){
  const u=fixUrl(l.url),c=cnt(l),tasks=l.tasks||[];
  const tg=h('button',{class:'btn ghost',type:'button'},'');
  const upd=()=>{tg.textContent=[...r.querySelectorAll('details.tk')].every(d=>d.open)?'Sbalit vše':'Rozbalit vše';};
  tg.onclick=()=>{const ds=[...r.querySelectorAll('details.tk')],all=ds.every(d=>d.open);ds.forEach(d=>{d.open=!all;});};
  const r=h('div',{class:'room'},
    h('div',{class:'rh'},h('span',{class:'num'},String(i+1)),
      h('div',{class:'rt'},l.label||'Odkaz '+(i+1),c[1]?h('div',{class:'rs'},c[0]+' / '+c[1]+' odpovědí'):null),
      tasks.length>1?tg:null,
      u?h('a',{class:'btn thm',href:u,target:'_blank',rel:'noopener noreferrer'},'Otevřít ↗'):null));
  if(c[1])r.append(h('div',{class:'prog'},h('i',{style:'width:'+Math.round(c[0]/c[1]*100)+'%'})));
  tasks.forEach((k,j)=>r.append(roTask(k,j)));
  if(!tasks.length)r.append(h('div',{class:'tb mut'},'Zatím bez odpovědí.'));
  r.addEventListener('toggle',upd,true);upd();
  return r;
}
function roBody(sub,t,body){
  if(t.desc)body.append(h('div',{class:'f'},h('span',{},'Zadání'),h('div',{class:'txt'},t.desc)));
  if(sub.type==='links'){
    (t.links||[]).forEach((l,i)=>body.append(roRoom(l,i)));
  }else{
    const cb=h('button',{class:'btn pri',type:'button',onclick:()=>copy(t.code||'',cb)},'Kopírovat kód');
    body.append(h('h3',{},'Kód'+(t.lang?' · '+t.lang:'')),
      t.code?h('pre',{class:'codero'},t.code):h('div',{class:'mut'},'Zatím bez kódu.'),
      t.code?h('div',{class:'foot'},cb):null);
  }
}

function card(sub,t){
  const sum=h('span',{class:'tt'},t.title||'Nové zadání');
  const d=h('details',{class:'card','data-k':t.id,open:openIds.has(t.id)},
    h('summary',{},h('span',{class:'chev'},'▸'),sum,dueBadge(t),t.done?h('span',{class:'badge'},'hotovo'):null));
  d.addEventListener('toggle',()=>{d.open?openIds.add(t.id):openIds.delete(t.id);});
  const body=h('div',{class:'body'});
  canEdit?editBody(sub,t,body,sum):roBody(sub,t,body);
  d.append(body);
  return d;
}
function addTask(sub){
  const t={id:uid(),title:'',desc:'',done:false};
  if(sub.type==='links')t.links=[newLink(1)];else{t.lang='';t.code='';}
  S[sub.id].unshift(t);openIds.add(t.id);focusId=t.id;save();render();
}

let query='',sortMode='manual';
const fold=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function dueBadge(t){
  if(!t.due)return null;
  const d=new Date(t.due+'T00:00:00');if(isNaN(d))return null;
  const td=new Date();td.setHours(0,0,0,0);
  const days=Math.round((d-td)/864e5);
  return h('span',{class:'due'+(t.done?'':days<0?' late':days<=3?' soon':'')},'do '+d.toLocaleDateString('cs-CZ'));
}
function jump(x){
  openIds.add(x.tid);if(x.kid)openTasks.add(x.kid);
  query='';document.getElementById('q').value='';render();
  const el=document.querySelector('[data-k="'+(x.kid||x.tid)+'"]');if(el)el.scrollIntoView({block:'start'});
}
function renderSearch(root){
  const qt=query.trim(),qf=fold(qt),hits=[];
  const add=(sub,t,kind,text,where,kid)=>{
    if(!text)return;const o=String(text),f=fold(o);
    const i=f.length===o.length?f.indexOf(qf):o.toLowerCase().indexOf(qt.toLowerCase());
    if(i>=0)hits.push({sid:sub.id,tid:t.id,kid:kid,kind:kind,text:o,i:i,where:where,sub:sub.name});
  };
  [SUB].forEach(sub=>S.zadani.forEach(t=>{
    add(sub,t,'Zadání',t.title,t.title);add(sub,t,'Zadání',t.desc,t.title);
    if(sub.type==='links')(t.links||[]).forEach(l=>{
      add(sub,t,'Odkaz',l.label,t.title);
      (l.tasks||[]).forEach((k,j)=>{
        const w=t.title+' › '+(l.label||'')+' › Task '+(j+1);
        add(sub,t,'Task',k.title,w,k.id);add(sub,t,'Pokyn',k.note,w,k.id);
        (k.items||[]).forEach(it=>{add(sub,t,'Pokyn',it.note,w,k.id);add(sub,t,'Otázka',it.q,w,k.id);add(sub,t,'Odpověď',it.a,w,k.id);add(sub,t,'Postup',it.sol,w,k.id);});
      });
    });
    else{add(sub,t,'Kód',t.code,t.title);add(sub,t,'Jazyk',t.lang,t.title);}
  }));
  root.append(h('p',{class:'mut'},hits.length?hits.length+' výsledků pro „'+qt+'“':'Nic nenalezeno pro „'+qt+'“'));
  hits.slice(0,60).forEach(x=>{
    const a=Math.max(0,x.i-40),e=Math.min(x.text.length,x.i+qf.length+90);
    root.append(h('div',{class:'hit',tabindex:'0',onclick:()=>jump(x)},
      h('div',{class:'hw'},x.where),
      h('div',{class:'txt'},h('span',{class:'hk'},x.kind),(a?'…':'')+x.text.slice(a,x.i),h('mark',{},x.text.slice(x.i,x.i+qf.length)),x.text.slice(x.i+qf.length,e)+(e<x.text.length?'…':''))));
  });
}
function render(){
  const root=document.getElementById('app');
  root.replaceChildren();
  if(query.trim())return renderSearch(root);
  const raw=S.zadani,k=t=>t.due||'9999';
  const list=sortMode==='due'?raw.slice().sort((x,y)=>k(x)<k(y)?-1:k(x)>k(y)?1:0):raw;
  root.append(h('div',{class:'bar'},h('h2',{class:'group grow'},'Zadání · '+raw.length),
    h('div',{class:'tools2'},
      h('button',{class:'btn',type:'button',onclick:()=>{sortMode=sortMode==='due'?'manual':'due';render();}},sortMode==='due'?'Řazení: podle termínu':'Řazení: ručně'),
      canEdit?h('button',{class:'btn pri',type:'button',onclick:()=>addTask(SUB)},'+ Nové zadání'):null,
      canEdit?h('button',{class:'btn',type:'button',onclick:exportData},'⬇ Stáhnout '+CFG.file):null,
      canEdit?delBtn(()=>{S=norm(FILE);try{localStorage.removeItem(KEY);}catch(e){}render();updateStat();},'Zahodit lokální změny'):null)));
  if(!list.length)root.append(h('p',{class:'empty'},canEdit?'Zatím tu nic není. Přidej první zadání tlačítkem nahoře.':'Zatím tu nic není.'));
  list.forEach(t=>root.append(card(SUB,t)));
  if(focusId){const el=root.querySelector('[data-id="'+focusId+'"]');if(el)el.focus();focusId=null;}
}

/* ---------- horní lišta ---------- */
const TK='skolni-zapisnik-tema',TH=['dark','light'],TL={dark:'☾ Tmavý',light:'☀ Světlý'};
let th='dark';try{th=localStorage.getItem(TK)==='light'?'light':'dark';}catch(e){}
const applyTh=()=>document.documentElement.setAttribute('data-theme',th);
applyTh();
const thB=h('button',{class:'btn sm',type:'button',onclick:()=>{th=TH[(TH.indexOf(th)+1)%2];try{localStorage.setItem(TK,th);}catch(e){}applyTh();thB.textContent=TL[th];}},TL[th]);
const idEl=h('code',{},myId);
document.getElementById('top').append(
  h('div',{class:'dev',title:'Klikni pro zkopírování ID zařízení',onclick:()=>copy(myId,idEl)},h('span',{},'ID zařízení'),idEl),
  h('span',{class:'role '+(canEdit?'ed':'ro')},canEdit?'Úpravy povoleny':'Jen čtení'),
  h('span',{id:'stat'}),thB);
const qi=document.getElementById('q');
qi.addEventListener('input',()=>{query=qi.value;render();});
qi.addEventListener('keydown',e=>{if(e.key==='Escape'){qi.value='';query='';render();}});
render();
updateStat();
