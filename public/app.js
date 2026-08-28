const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mark=`<svg viewBox="0 0 48 48" aria-hidden="true"><circle class="mark-ring" cx="24" cy="24" r="22"/><path class="mark-a" d="M15 34 24 12l9 22M19 25h10"/><path class="mark-f" d="M33 14h-9v20"/></svg>`;
const menu=$('#menu'),nav=$('#navigation');
menu.onclick=()=>{const on=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(on));document.body.classList.toggle('menu-open',on)};
nav.addEventListener('click',e=>{if(e.target.matches('a')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open')}});
addEventListener('scroll',()=>$('.site-header')?.classList.toggle('scrolled',scrollY>24),{passive:true});

const price=a=>a.price_chf==null?'Preis auf Anfrage':`Richtpreis: CHF ${Number(a.price_chf).toLocaleString('de-CH')}.–`;
const status={available:'Verfügbar',reserved:'Reserviert',sold:'Verkauft'};
async function get(p){const r=await fetch(p,{headers:{accept:'application/json'}});if(!r.ok)throw Error('Inhalt konnte nicht geladen werden.');return r.json()}
async function track(type,artworkId=''){try{await fetch('/api/public/analytics',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({type,artwork_id:artworkId}),keepalive:true})}catch{}}
function setBrand(s){$('.brand-name').textContent=s.artist_name;document.title=`${s.artist_name} – Werkkatalog`}
function foot(s){$('#footer').innerHTML=`<div class="footer-brand"><strong>${esc(s.artist_name)}</strong><br><span>Digitaler Werkkatalog</span></div><div class="footer-contact"><strong>${esc(s.contact_name)}</strong><br><a href="mailto:${encodeURIComponent(s.email)}">${esc(s.email)}</a><br><a href="tel:${esc(s.phone)}">${esc(s.phone)}</a></div>`}
function reveal(){
  const nodes=$$('[data-reveal]');
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches){nodes.forEach(x=>x.classList.add('is-visible'));return}
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px',threshold:.08});
  nodes.forEach(x=>io.observe(x));
}
function images(){
  $$('.frame img,.showcase img').forEach(img=>{const done=()=>img.classList.add('loaded');img.complete?done():img.addEventListener('load',done,{once:true})});
}
function motion(){
  reveal();images();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progress=$('.page-progress');let ticking=false;
  addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(()=>{
    if(progress){const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max>0?Math.min(scrollY/max,1):0})`}
    const emblem=$('.hero-emblem');if(emblem&&!reduced&&innerWidth>720)emblem.style.transform=`translate3d(0,${Math.min(scrollY*.08,60)}px,0)`;
    ticking=false
  });ticking=true}},{passive:true});
}
function value(s,key,fallback){return s[key]||fallback}
function paragraphs(text){return String(text||'').split(/\n\s*\n/).filter(Boolean).map((p,i)=>`<p data-reveal style="--delay:${Math.min(i*70,280)}ms">${esc(p).replace(/\n/g,'<br>')}</p>`).join('')}
function scrollToCurrentHash(){
  if(!location.hash)return;
  let id;try{id=decodeURIComponent(location.hash.slice(1))}catch{return}
  const target=document.getElementById(id);if(!target)return;
  requestAnimationFrame(()=>target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}));
}
function shuffled(items){const copy=[...items];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy}
function showcase(artworks){
  const slides=shuffled(artworks.filter(x=>x.image_id)).slice(0,5);if(!slides.length)return'';
  return `<section class="showcase" aria-label="Impressionen aus dem Werkkatalog" data-reveal>
    <div class="showcase-stage">${slides.map((x,i)=>`<a class="showcase-slide${i?'':' is-active'}" href="/werk/${encodeURIComponent(x.id)}" aria-hidden="${i?'true':'false'}"><img loading="${i?'lazy':'eager'}" decoding="async" src="/images/${encodeURIComponent(x.image_id)}" alt="${esc(x.title)}"><span><b>${esc(x.object_number)}</b>${esc(x.title)}</span></a>`).join('')}<div class="showcase-timer" aria-hidden="true"><i></i></div></div>
    <div class="showcase-footer"><p><span>Einblicke</span> in das Lebenswerk</p><div class="showcase-dots" aria-label="Bild auswählen">${slides.map((_,i)=>`<button type="button" aria-label="Bild ${i+1} anzeigen" aria-current="${i?'false':'true'}"></button>`).join('')}</div><span class="showcase-count"><b>01</b> / ${String(slides.length).padStart(2,'0')}</span></div>
  </section>`
}
function startShowcase(){
  const root=$('.showcase');if(!root)return;const slides=$$('.showcase-slide'),dots=$$('.showcase-dots button');if(slides.length<2)return;
  let current=0,timer;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,interval=5000,bar=$('.showcase-timer i');
  const restartProgress=()=>{if(reduced||!bar)return;bar.classList.remove('running');void bar.offsetWidth;bar.classList.add('running')};
  const show=n=>{current=(n+slides.length)%slides.length;slides.forEach((slide,i)=>{const active=i===current;slide.classList.toggle('is-active',active);slide.setAttribute('aria-hidden',String(!active))});dots.forEach((dot,i)=>dot.setAttribute('aria-current',String(i===current)));$('.showcase-count b').textContent=String(current+1).padStart(2,'0');restartProgress()};
  const pause=()=>{clearInterval(timer);root.classList.add('is-paused')},play=()=>{if(!reduced){clearInterval(timer);root.classList.remove('is-paused');restartProgress();timer=setInterval(()=>show(current+1),interval)}};
  dots.forEach((dot,i)=>dot.onclick=()=>{show(i);play()});root.addEventListener('mouseenter',pause);root.addEventListener('mouseleave',play);document.addEventListener('visibilitychange',()=>document.hidden?pause():play());play()
}

async function home(){
  const [s,a]=await Promise.all([get('/api/public/site'),get('/api/public/artworks')]);setBrand(s);foot(s);
  const featured=a.slice(0,6);
  $('#main').innerHTML=`
    <div class="page-progress" aria-hidden="true"></div>
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow" data-reveal>${esc(s.artist_name)}</p>
        <h1 data-reveal style="--delay:90ms">${esc(s.hero_title)}</h1>
        <p class="intro" data-reveal style="--delay:180ms">${esc(s.intro_text)}</p>
      </div>
      <div class="hero-emblem" data-reveal="scale" style="--delay:240ms">${mark}</div>
      <div class="scroll-cue" aria-hidden="true">Entdecken</div>
    </section>
    ${showcase(a)}
    <section id="geschichte" class="section story">
      <div class="story-inner">
        <div class="story-title" data-reveal="left">
          <p class="eyebrow">${esc(value(s,'story_eyebrow','Geschichte'))}</p>
          <h2>${esc(value(s,'story_title','Über den Künstler'))}</h2>
        </div>
        <div class="bio">${paragraphs(s.biography)}</div>
      </div>
    </section>
    <section id="werke" class="section catalogue">
      <div class="section-heading">
        <div data-reveal="left"><p class="eyebrow">${esc(value(s,'works_eyebrow','Werkkatalog'))}</p><h2>${esc(value(s,'works_title','Ausgewählte Werke'))}</h2></div>
        <p class="lead" data-reveal>${esc(value(s,'works_intro','Ein persönlicher Einblick in ein künstlerisches Lebenswerk.'))}</p>
      </div>
      ${featured.length?`<div class="grid">${featured.map((x,i)=>card(x,i)).join('')}</div><div class="catalogue-more" data-reveal><a class="button secondary" href="/werke">Alle Werke anschauen <span aria-hidden="true">→</span></a></div>`:'<p class="empty" data-reveal>Der Katalog wird derzeit vorbereitet.</p>'}
    </section>
    <section id="kontakt" class="section contact">
      <div class="contact-inner" data-reveal>
        <p class="eyebrow">${esc(value(s,'contact_eyebrow','Kontakt'))}</p>
        <h2>${esc(value(s,'contact_title','Ein Werk berührt Sie?'))}</h2>
        <p>${esc(value(s,'contact_text','Gerne geben wir persönlich Auskunft und erzählen Ihnen mehr über die verfügbaren Werke.'))}</p>
        <a class="button" href="mailto:${encodeURIComponent(s.email)}">E-Mail schreiben <span aria-hidden="true">↗</span></a>
      </div>
    </section>`;
  motion();startShowcase();scrollToCurrentHash();track('page');
}
async function gallery(){
  const [s,a]=await Promise.all([get('/api/public/site'),get('/api/public/artworks')]);setBrand(s);document.title=`Alle Werke · ${s.artist_name}`;foot(s);
  $('#main').innerHTML=`<div class="page-progress" aria-hidden="true"></div><section class="section catalogue catalogue-page"><div class="section-heading"><div data-reveal="left"><p class="eyebrow">Werkkatalog</p><h1>Alle Werke</h1></div><p class="lead" data-reveal>${esc(value(s,'works_intro','Ein persönlicher Einblick in ein künstlerisches Lebenswerk.'))}</p></div>${a.length?`<div class="grid">${a.map((x,i)=>card(x,i)).join('')}</div>`:'<p class="empty">Der Katalog wird derzeit vorbereitet.</p>'}</section>`;
  motion();track('page')
}
function card(a,i){return `<a class="work" data-reveal href="/werk/${encodeURIComponent(a.id)}" style="--delay:${(i%3)*85}ms"><div class="frame">${a.image_id?`<img loading="lazy" decoding="async" src="/images/${encodeURIComponent(a.image_id)}" alt="${esc(a.title)}">`:''}${a.status!=='available'?`<span class="frame-status ${a.status}">${status[a.status]}</span>`:''}</div><div class="work-copy"><h3>${esc(a.title)}</h3><p class="meta">${esc(a.object_number)} · ${price(a)}</p></div></a>`}

function recentlyViewed(a){
  let stored=[];try{stored=JSON.parse(localStorage.getItem('atelier_recently_viewed')||'[]');if(!Array.isArray(stored))stored=[]}catch{}
  const previous=stored.filter(x=>x&&x.id!==a.id).slice(0,4),current={id:a.id,title:a.title,object_number:a.object_number,price_chf:a.price_chf,status:a.status,image_id:a.images?.[0]?.id||null};
  try{localStorage.setItem('atelier_recently_viewed',JSON.stringify([current,...stored.filter(x=>x&&x.id!==a.id)].slice(0,6)))}catch{}
  return previous
}

async function detail(id){
  const [s,a]=await Promise.all([get('/api/public/site'),get('/api/public/artworks/'+encodeURIComponent(id))]);
  setBrand(s);document.title=`${a.title} · ${s.artist_name}`;foot(s);
  const recent=recentlyViewed(a);
  const subject=`Interesse an Werk ${a.object_number} – ${a.title}`,body=`Guten Tag\n\nIch interessiere mich für das Werk „${a.title}“ mit der Objektnummer ${a.object_number}.\n\nFreundliche Grüsse`;
  $('#main').innerHTML=`<div class="page-progress" aria-hidden="true"></div><article class="section detail">
    <a class="back-link mobile-back" href="/#werke">← Zurück zu den Werken</a>
    <div class="detail-gallery">${a.images.map((i,n)=>`<figure class="detail-image" data-reveal style="--delay:${Math.min(n*80,240)}ms"><img loading="${n?'lazy':'eager'}" decoding="async" src="/images/${encodeURIComponent(i.id)}" alt="${esc(a.title)}${a.images.length>1?` – Ansicht ${n+1}`:''}"></figure>`).join('')}</div>
    <div class="detail-copy" data-reveal>
      <a class="back-link" href="/#werke">← Zurück zu den Werken</a>
      <p class="eyebrow">${esc(a.object_number)}</p><h1>${esc(a.title)}</h1>
      ${a.status!=='available'?`<span class="badge">${status[a.status]}</span>`:''}
      ${a.description?`<p class="bio">${esc(a.description)}</p>`:''}
      <p class="price"><strong>${price(a)}</strong></p>
      ${a.status==='sold'
        ?`<p><span class="button sold-button" aria-disabled="true">Dieses Werk ist verkauft</span></p>`
        :`<p><a class="button" href="mailto:${encodeURIComponent(s.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}">Werk anfragen <span aria-hidden="true">↗</span></a></p>
          <p>Oder telefonisch: <a href="tel:${esc(s.phone)}">${esc(s.phone)}</a></p>`}
    </div>
  </article>${recent.length?`<section class="section recently-viewed"><div class="recent-heading" data-reveal><p class="eyebrow">Ihre Entdeckungen</p><h2>Kürzlich angesehen</h2></div><div class="grid">${recent.map((x,i)=>card(x,i)).join('')}</div></section>`:''}`;
  motion();track('page').then(()=>track('artwork',a.id));
}

(async()=>{try{const m=location.pathname.match(/^\/werk\/([^/]+)/);m?await detail(m[1]):location.pathname.replace(/\/$/,'')==='/werke'?await gallery():await home()}catch(e){$('#main').innerHTML=`<p class="empty">${esc(e.message)}</p>`}})();
