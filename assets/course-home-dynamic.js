(function(){
'use strict';
const SUPABASE_URL='https://irnrjzeejalbbqdrbzmj.supabase.co';
const SUPABASE_KEY='sb_publishable_aj2vpjfJrSMvjTxcKuC0pQ_pf7JbDo2';
const API=SUPABASE_URL+'/functions/v1/course-home-api';
const body=document.body;
const course=(body.dataset.course||'').trim().toUpperCase();
const style=(body.dataset.planStyle||'activity').trim();
const host=document.getElementById('dynamicCoursePlan');
const context=document.getElementById('planContext');
const sectionId=new URLSearchParams(location.search).get('section_id');
if(!course||!host)return;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>v?new Date(v).toLocaleString([], {dateStyle:'medium',timeStyle:'short'}):'';
function basePath(){return '/'+encodeURIComponent(course)+'/'}
function itemHref(item){
  const p=item.page_path||item.offering?.assignment?.page_path||'';
  if(!p)return '';
  if(/^https?:\/\//i.test(p)||p.startsWith('/'))return p;
  return basePath()+p.replace(/^\.\//,'');
}
function statusText(item){
  if(item.item_type!=='participation')return item.item_type==='exam'?'Assessment':item.item_type==='project'?'Project':item.item_type==='quiz'?'Quiz':'Course roadmap';
  switch(item.status){
    case 'open': return 'Available now';
    case 'late_open': return 'Late · still open';
    case 'closed': return 'Closed';
    case 'not_open': return item.offering?.opens_at?'Opens '+fmt(item.offering.opens_at):'Not yet open';
    case 'hidden': return 'Not yet published';
    default:return 'Course roadmap';
  }
}
function renderCard(item){
  const isParticipation=item.item_type==='participation';
  const href=itemHref(item);
  const active=isParticipation&&['open','late_open'].includes(item.status);
  const cls=style==='week'?'week':'activity';
  const numCls=style==='week'?'week-num':'activity-num';
  const statusCls=(active?'status':'status soon');
  const linkAllowed=isParticipation&&href&&item.status!=='hidden'&&item.status!=='not_open';
  return `<article class="${cls}${active?' active':''}">
    <div>
      <div class="${numCls}">${esc(item.label||('Item '+item.display_order))}</div>
      <h3>${esc(item.title)}</h3>
      ${item.description?`<p>${esc(item.description)}</p>`:''}
    </div>
    <div>
      <div class="${statusCls}">${esc(statusText(item))}</div>
      ${linkAllowed?`<a href="${esc(href)}">Open ${esc(item.label||item.title)} →</a>`:''}
    </div>
  </article>`;
}
async function getSession(){
  if(!window.supabase)return null;
  try{
    const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
    const {data}=await sb.auth.getSession();return data.session||null;
  }catch(_){return null}
}
async function load(){
  host.innerHTML='<div class="notice">Loading current course plan…</div>';
  try{
    const s=await getSession();
    const headers={'Content-Type':'application/json','apikey':SUPABASE_KEY};
    if(s?.access_token)headers.Authorization='Bearer '+s.access_token;
    const r=await fetch(API,{method:'POST',headers,body:JSON.stringify({course_code:course,section_id:sectionId||null})});
    const j=await r.json().catch(()=>({error:'Unable to read course-plan response'}));
    if(!r.ok||j.error)throw new Error(j.error||'Unable to load course plan');
    if(context){context.textContent=`${j.section?.term?.name||''} · ${course}-${j.section?.section_code||''}`.replace(/^ · | · $/g,'')}
    const plan=(j.plan||[]).filter(x=>x.visible!==false);
    if(!plan.length){host.innerHTML='<div class="notice">No course activities have been published for this section yet.</div>';return}
    host.innerHTML=plan.map(renderCard).join('');
  }catch(e){host.innerHTML=`<div class="notice"><strong>Course plan unavailable.</strong> ${esc(e.message||e)}</div>`}
}
load();
})();
