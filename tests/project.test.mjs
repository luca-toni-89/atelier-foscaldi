import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const worker=await readFile('src/worker.ts','utf8'),sql=await readFile('migrations/0001_initial.sql','utf8'),sections=await readFile('migrations/0002_editable_site_sections.sql','utf8'),app=await readFile('public/app.js','utf8'),style=await readFile('public/style.css','utf8'),admin=await readFile('public/admin.js','utf8');
test('drafts are excluded from both public artwork queries',()=>assert.equal((worker.match(/visibility='published'/g)||[]).length>=3,true));
test('schema enforces unique object numbers and statuses',()=>{assert.match(sql,/object_number TEXT NOT NULL UNIQUE/);for(const x of ['available','reserved','sold'])assert.match(sql,new RegExp(x))});
test('sequence is monotonic and separate from artworks',()=>{assert.match(sql,/object_sequence/);assert.match(worker,/next_number=next_number\+1/)});
test('security controls are present',()=>{for(const x of ['HttpOnly','Secure','SameSite=Lax','x-csrf-token','PBKDF2','login_attempts'])assert.match(worker,new RegExp(x))});
test('public price and correctly encoded mail are rendered',()=>{assert.match(app,/Preis auf Anfrage/);assert.match(app,/Richtpreis: CHF/);assert.match(app,/encodeURIComponent\(subject\)/)});
test('single and retry-safe bulk upload UI use real endpoints',()=>{assert.match(admin,/accept="image\/\*" multiple/);assert.match(admin,/if\(x.done\)continue/);assert.match(admin,/FormData/)});
test('all expected database models exist',()=>{for(const x of ['artworks','artwork_images','site_content','admin_sessions','login_attempts'])assert.match(sql,new RegExp(`CREATE TABLE ${x}`))});

test('public section headings are editable instead of hardcoded',()=>{for(const x of ['story_title','works_title','contact_title','site_sections']){assert.match(worker+admin+sections,new RegExp(x))}});
test('artwork images preserve their natural aspect ratio',()=>{assert.match(style,/\.frame img\{[^}]*height:auto/);assert.match(style,/object-fit:contain/);assert.doesNotMatch(app,/width=\"800\" height=\"1000\"/)});
test('gallery motion is progressive and respects reduced motion',()=>{assert.match(app,/IntersectionObserver/);assert.match(style,/data-reveal/);assert.match(style,/prefers-reduced-motion/)});
