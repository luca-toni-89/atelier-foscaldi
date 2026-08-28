const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mark=`<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22"/><path d="M15 34 24 12l9 22M19 25h10"/><path d="M33 14h-9v20"/></svg>`;
const menu=$('#menu'),nav=$('#navigation');
menu.onclick=()=>{const on=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(on))};
nav.addEventListener('click',e=>{if(e.target.matches('a')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}});
addEventListener('scroll',()=>$('.site-header')?.classList.toggle('scrolled',scrollY>24),{passive:true});

const price=a=>a.price_chf==null?'Preis auf Anfrage':`Richtpreis: CHF ${Number(a.price_chf).toLocaleString('de-CH')}.–`;
const status={available:'Verfügbar',reserved:'Reserviert',sold:'Verkauft'};
async function get(p){const r=await fetch(p,{headers:{accept:'application/json'}});if(!r.ok)throw Error('Inhalt konnte nicht geladen werden.');return r.json()}
function setBrand(s){$('.brand-name').textContent=s.artist_name;document.title=`${s.artist_name} – Werkkatalog`}
function foot(s){$('#footer').innerHTML=`<div class="footer-brand"><strong>${esc(s.artist_name)}</strong><br><span>Digitaler Werkkatalog</span></div><div class="footer-contact"><strong>${esc(s.contact_name)}</strong><br><a href="mailto:${encodeURIComponent(s.email)}">${esc(s.email)}</a><br><a href="tel:${esc(s.phone)}">${esc(s.phone)}</a></div>`}
function reveal(){
  const nodes=$$('[data-reveal]');
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches){nodes.forEach(x=>x.classList.add('is-visible'));return}
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px',threshold:.08});
  nodes.forEach(x=>io.observe(x));
}
function images(){
  $$('.frame img').forEach(img=>{const done=()=>img.classList.add('loaded');img.complete?done():img.addEventListener('load',done,{once:true})});
}
function motion(){
  reveal();images();
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||matchMedia('(max-width: 720px)').matches)return;
  const emblem=$('.hero-emblem');if(!emblem)return;let ticking=false;
  addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(()=>{emblem.style.transform=`translate3d(0,${Math.min(scrollY*.08,60)}px,0)`;ticking=false});ticking=true}},{passive:true});
}
function value(s,key,fallback){return s[key]||fallback}

async function home(){
  const [s,a]=await Promise.all([get('/api/public/site'),get('/api/public/artworks')]);setBrand(s);foot(s);
  $('#main').innerHTML=`
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow" data-reveal>${esc(s.artist_name)}</p>
        <h1 data-reveal style="--delay:90ms">${esc(s.hero_title)}</h1>
        <p class="intro" data-reveal style="--delay:180ms">${esc(s.intro_text)}</p>
      </div>
      <div class="hero-emblem" data-reveal="scale" style="--delay:240ms">${mark}</div>
      <div class="scroll-cue" aria-hidden="true">Entdecken</div>
    </section>
    <section id="geschichte" class="section story">
      <div class="story-inner">
        <div class="story-title" data-reveal="left">
          <p class="eyebrow">${esc(value(s,'story_eyebrow','Geschichte'))}</p>
          <h2>${esc(value(s,'story_title','Über den Künstler'))}</h2>
        </div>
        <div class="bio" data-reveal style="--delay:100ms">${esc(s.biography)}</div>
      </div>
    </section>
    <section id="werke" class="section catalogue">
      <div class="section-heading">
        <div data-reveal="left"><p class="eyebrow">${esc(value(s,'works_eyebrow','Werkkatalog'))}</p><h2>${esc(value(s,'works_title','Ausgewählte Werke'))}</h2></div>
        <p class="lead" data-reveal>${esc(value(s,'works_intro','Ein persönlicher Einblick in ein künstlerisches Lebenswerk.'))}</p>
      </div>
      ${a.length?`<div class="grid">${a.map((x,i)=>card(x,i)).join('')}</div>`:'<p class="empty" data-reveal>Der Katalog wird derzeit vorbereitet.</p>'}
    </section>
    <section id="kontakt" class="section contact">
      <div class="contact-inner" data-reveal>
        <p class="eyebrow">${esc(value(s,'contact_eyebrow','Kontakt'))}</p>
        <h2>${esc(value(s,'contact_title','Ein Werk berührt Sie?'))}</h2>
        <p>${esc(value(s,'contact_text','Gerne geben wir persönlich Auskunft und erzählen Ihnen mehr über die verfügbaren Werke.'))}</p>
        <a class="button" href="mailto:${encodeURIComponent(s.email)}">E-Mail schreiben <span aria-hidden="true">↗</span></a>
      </div>
    </section>`;
  motion();
}
function card(a,i){return `<a class="work" data-reveal href="/werk/${encodeURIComponent(a.id)}" style="--delay:${(i%3)*85}ms"><div class="frame">${a.image_id?`<img loading="lazy" decoding="async" src="/images/${encodeURIComponent(a.image_id)}" alt="${esc(a.title)}">`:''}</div><div class="work-copy"><h3>${esc(a.title)}</h3>${a.status!=='available'?`<span class="badge">${status[a.status]}</span>`:''}<p class="meta">${esc(a.object_number)} · ${price(a)}</p></div></a>`}

async function detail(id){
  const [s,a]=await Promise.all([get('/api/public/site'),get('/api/public/artworks/'+encodeURIComponent(id))]);
  setBrand(s);document.title=`${a.title} · ${s.artist_name}`;foot(s);
  const subject=`Interesse an Werk ${a.object_number} – ${a.title}`,body=`Guten Tag\n\nIch interessiere mich für das Werk „${a.title}“ mit der Objektnummer ${a.object_number}.\n\nFreundliche Grüsse`;
  $('#main').innerHTML=`<article class="section detail">
    <div class="detail-gallery">${a.images.map((i,n)=>`<figure class="detail-image" data-reveal style="--delay:${Math.min(n*80,240)}ms"><img loading="${n?'lazy':'eager'}" decoding="async" src="/images/${encodeURIComponent(i.id)}" alt="${esc(a.title)}${a.images.length>1?` – Ansicht ${n+1}`:''}"></figure>`).join('')}</div>
    <div class="detail-copy" data-reveal>
      <a class="back-link" href="/#werke">← Zurück zu den Werken</a>
      <p class="eyebrow">${esc(a.object_number)}</p><h1>${esc(a.title)}</h1>
      ${a.status!=='available'?`<span class="badge">${status[a.status]}</span>`:''}
      ${a.description?`<p class="bio">${esc(a.description)}</p>`:''}
      <p class="price"><strong>${price(a)}</strong></p>
      <p><a class="button" href="mailto:${encodeURIComponent(s.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}">Interesse anfragen <span aria-hidden="true">↗</span></a></p>
      <p>Oder telefonisch: <a href="tel:${esc(s.phone)}">${esc(s.phone)}</a></p>
    </div>
  </article>`;
  reveal();
}

(async()=>{try{const m=location.pathname.match(/^\/werk\/([^/]+)/);m?await detail(m[1]):await home()}catch(e){$('#main').innerHTML=`<p class="empty">${esc(e.message)}</p>`}})();
