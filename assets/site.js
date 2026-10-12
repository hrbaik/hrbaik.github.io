'use strict';
// Progressive enhancement: page navigation and all source text work without JavaScript.
const menu=document.querySelector('.site-menu');
const desktop=matchMedia('(min-width:901px)');
function syncMenu(){if(menu)menu.open=desktop.matches;}
syncMenu();desktop.addEventListener('change',syncMenu);
document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{
 const el=document.getElementById(button.dataset.copy);if(!el)return;
 try{await navigator.clipboard.writeText(el.innerText.trim());button.setAttribute('aria-label','Copied');const toast=document.getElementById('toast');if(toast){toast.setAttribute('role','status');toast.classList.add('visible');setTimeout(()=>toast.classList.remove('visible'),1500);}}
 catch{button.setAttribute('aria-label','Please select and copy the address manually');const range=document.createRange();range.selectNodeContents(el);getSelection().removeAllRanges();getSelection().addRange(range);}
}));
// Reclassify existing semantic HTML: no fetch, duplicate data, or build required.
const academicEvents=document.querySelector('[data-academic-events]');
function academicEventsToday(now=new Date()){
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const part=type=>parts.find(p=>p.type===type).value;
 return `${part('year')}-${part('month')}-${part('day')}`;
}
function syncAcademicEvents(){
 if(!academicEvents)return;
 const today=academicEventsToday();
 const events=[...academicEvents.querySelectorAll('[data-event-end]')];
 const compare=(a,b)=>{
  for(const key of ['eventStart','eventEnd','eventName']){
   if(a.dataset[key]!==b.dataset[key])return a.dataset[key]<b.dataset[key]?-1:1;
  }
  return 0;
 };
 for(const group of ['upcoming','past']){
  const rows=events.filter(e=>(e.dataset.eventEnd<today)===(group==='past'));
  rows.sort((a,b)=>group==='past'?-compare(a,b):compare(a,b));
  const list=academicEvents.querySelector(`[data-event-list="${group}"]`);
  rows.forEach(e=>list.append(e));
  academicEvents.querySelector(`[data-event-section="${group}"]`).hidden=rows.length===0;
 }
}
if(academicEvents){
 syncAcademicEvents();
 // Recheck across KST midnight even if the tab stays open; also resume promptly.
 setInterval(syncAcademicEvents,30000);
 document.addEventListener('visibilitychange',syncAcademicEvents);
 window.addEventListener('pageshow',syncAcademicEvents);
}
const search=document.getElementById('routeSearch');
if(search){const routes=[...document.querySelectorAll('[data-keywords]')];const count=document.getElementById('routeCount');search.setAttribute('aria-label','Search travel routes');search.addEventListener('input',()=>{const q=search.value.trim().toLowerCase();let visible=0;routes.forEach(r=>{r.hidden=!!q&&!((r.dataset.keywords+' '+r.innerText).toLowerCase().includes(q));if(!r.hidden)visible++;});if(count)count.textContent=visible+' route(s) shown';});}
