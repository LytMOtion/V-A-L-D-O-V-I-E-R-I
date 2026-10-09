import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { products, productPath } from './render.mjs';
const script = readFileSync('scripts/site.js', 'utf8');
function setup({ preview = false, valid = true, response = {ok: true}, fail = false, defer = false, piece = 'Collection I', color = 'Not selected' } = {}) {
  const state = { calls: 0, resets: 0, handler: null, status: '', timers: 0, cleared: 0 };
  const button = { disabled: false, textContent: 'Request access' };
  const status = { get textContent() { return state.status; }, set textContent(v) { state.status = v; } };
  const form = { dataset: { preview: String(preview) }, querySelector: () => button,
    addEventListener: (_, cb) => { state.handler = cb; }, reportValidity: () => valid,
    reset: () => state.resets++, setAttribute: () => {}, removeAttribute: () => {} };
  const elements = {suForm:form, suOk:status, inquiryPiece:{value:piece}, inquiryColor:{value:color}};
  const context = { document: { getElementById: id => elements[id] || null },
    FormData: class {}, AbortController, setTimeout: () => ++state.timers, clearTimeout: () => state.cleared++,
    fetch: async (url, opts) => { state.calls++; assert.equal(url, 'https://formspree.io/f/xlgyeaaz');
      assert.equal(opts.method, 'POST'); if (defer) await new Promise(r => { state.resolve = r; });
      if (fail) throw new Error('simulated offline'); return response; } };
  vm.runInNewContext(script, context);
  const submit = () => state.handler({ preventDefault() {} });
  return { state, button, submit };
}
test('preview validates but never transmits', async () => {
  const x = setup({preview:true}); await x.submit(); assert.equal(x.state.calls,0);
  assert.match(x.state.status, /No request has been sent/); assert.equal(x.state.resets,0);
});
test('invalid email never transmits', async () => {
  const x = setup({valid:false}); await x.submit(); assert.equal(x.state.calls,0); assert.equal(x.state.status,'');
});
test('simulated success resets and announces receipt', async () => {
  const x = setup(); await x.submit(); assert.equal(x.state.calls,1); assert.equal(x.state.resets,1);
  assert.match(x.state.status,/Received/); assert.equal(x.button.disabled,false); assert.equal(x.state.cleared,1);
});
test('simulated server rejection keeps address and shows recovery', async () => {
  const x=setup({response:{ok:false}}); await x.submit(); assert.equal(x.state.resets,0);
  assert.match(x.state.status,/try again or email/); assert.equal(x.button.disabled,false);
});
test('simulated offline request restores usable button', async () => {
  const x=setup({fail:true}); await x.submit(); assert.equal(x.state.resets,0);
  assert.match(x.state.status,/could not be sent/); assert.equal(x.button.disabled,false);
});
test('duplicate submission while sending is suppressed', async () => {
  const x=setup({defer:true}); const first=x.submit(); await x.submit(); assert.equal(x.state.calls,1);
  assert.equal(x.button.disabled,true); x.state.resolve(); await first; assert.equal(x.button.disabled,false);
});
test('six product/color routes show matching images, selected color and inquiry context', () => {
  for(const product of products) for(const color of product.colors){
    const html=readFileSync(`dist${productPath(product,color)}index.html`,'utf8');
    assert.ok(html.includes(`<strong id="selectedColor">${color.name}</strong>`));
    assert.ok(html.includes(`data-color="${color.id}" aria-current="page"`));
    assert.equal([...html.matchAll(/class="color-option"[^>]*aria-current="page"/g)].length,1);
    for(const view of ['front','detail']) assert.ok(html.includes(`src="/assets/products/${color[view]}"`));
    assert.ok(html.includes(`id="inquiryPiece" value="${product.name}"`));
    assert.ok(html.includes(`id="inquiryColor" value="${color.name}"`));
    assert.ok(html.includes(`id="accessContext">${product.name} / ${color.name}</p>`));
    assert.ok(html.includes(encodeURIComponent(`VALDOVIERI inquiry — ${product.name} / ${color.name}`)));
    assert.ok(html.includes('href="/collection/"'));
  }
});
test('all pages resolve assets/routes, preserve exact brand geometry and omit public placement overlays', () => {
  const icon=readFileSync('assets/mark-original.svg','utf8').match(/<path d="([^"]+)"/)[1];
  const pages=['dist/index.html','dist/collection/index.html',...products.flatMap(p=>p.colors.map(c=>`dist${productPath(p,c)}index.html`))];
  for(const page of pages){
    const html=readFileSync(page,'utf8');
    for(const match of html.matchAll(/(?:src|href)="(\/[^"#]*)(?:#[^"]*)?"/g)){
      const path=match[1]; const file=path.endsWith('/')?`dist${path}index.html`:`dist${path}`;
      assert.ok(existsSync(file),`${page} -> ${file}`);
    }
    const paths=[...html.matchAll(/<path d="([^"]+)"/g)].map(x=>x[1]);
    assert.equal(paths.length,2); paths.forEach(path=>assert.equal(path,icon));
    assert.ok(!/garment-mark|placement-note|\d+mm|digitally applied/.test(html));
    assert.ok(html.includes('role="status"')); assert.ok(!html.includes('{{'));
  }
  const css=readFileSync('scripts/site.css','utf8');
  assert.ok(css.includes('prefers-reduced-motion:reduce'));
  assert.ok(!/IntersectionObserver|opacity:\s*0(?:;|})|class="lock"/.test(script+css));
});
test('homepage is editorial and catalog is separately addressable', () => {
  const home=readFileSync('dist/index.html','utf8');
  const collection=readFileSync('dist/collection/index.html','utf8');
  assert.ok(!/wordmark|Form\.|Restraint\.|piece-grid/.test(home));
  assert.ok(home.includes('class="opening"')); assert.ok(home.includes('class="construction-study"'));
  assert.ok(home.includes('class="closing"')); assert.ok(collection.includes('class="piece-grid"'));
  assert.ok(home.includes('(max-width:900px) and (orientation:portrait)'));
});
test('product order preserves summary, front, inquiry, then remaining views', () => {
  for(const p of products)for(const c of p.colors){
    const html=readFileSync(`dist${productPath(p,c)}index.html`,'utf8');
    const sequence=['class="product-heading"','class="product-first"','class="product-actions"','class="product-more"'];
    const positions=sequence.map(x=>html.indexOf(x)); assert.ok(positions.every(x=>x>=0));
    assert.deepEqual([...positions].sort((a,b)=>a-b),positions);
    assert.ok(html.includes('id="imageDialog"')); assert.ok(html.includes('data-image-src='));
  }
});
test('documented crop remains a crop and never an alternate angle',()=>{
  for(const p of products)for(const c of p.colors)if(c.detailCrop){
    const html=readFileSync(`dist${productPath(p,c)}index.html`,'utf8');
    assert.ok(html.includes('data-faithful-crop="true"'));assert.ok(html.includes('Detail crop / same photograph'));
    assert.deepEqual(readFileSync(`assets/products/${c.detail}`),readFileSync(`assets/products/${c.front}`));
  }
});
test('safe dry-run identifies all six piece/color combinations and never sends',async()=>{
  for(const product of products)for(const color of product.colors){
    const x=setup({preview:true,piece:product.name,color:color.name});await x.submit();
    assert.equal(x.state.calls,0); assert.ok(x.state.status.includes(`${product.name} / ${color.name}`));
    assert.match(x.state.status,/No request has been sent/);
  }
});
function queryRoute(product, url) {
  const html = readFileSync(`dist${productPath(product)}index.html`, 'utf8');
  const routes = html.match(/<script type="application\/json" id="colorRoutes">([^<]+)<\/script>/)[1];
  let destination;
  vm.runInNewContext(readFileSync('scripts/color-route.js', 'utf8'), {
    document: { getElementById: () => ({ textContent: routes }) }, URL,
    window: { location: { href: url, replace: value => { destination = value; } } }
  });
  return destination;
}
test('query-selected colors resolve within the same product with anchor and matching static context', () => {
  for (const product of products) for (const color of product.colors) {
    const other = product.colors.find(c => c.id !== color.id);
    const start = `https://preview.example${productPath(product, other)}?color=${encodeURIComponent(color.name)}&source=review#access`;
    const resolved = queryRoute(product, start);
    const next = new URL(resolved, start);
    assert.equal(next.pathname, productPath(product, color));
    assert.equal(next.searchParams.get('color'), color.id);
    assert.equal(next.searchParams.get('source'), 'review');
    assert.equal(next.hash, '#access');
    assert.equal(queryRoute(product, next.href), undefined, 'canonical selection must not loop');
    const html = readFileSync(`dist${next.pathname}index.html`, 'utf8');
    assert.ok(html.includes(`id="selectedColor">${color.name}</strong>`));
    assert.ok(html.includes(`id="inquiryColor" value="${color.name}"`));
    assert.ok(html.includes(`src="/assets/products/${color.front}"`));
    assert.ok(html.includes(`src="/assets/products/${color.detail}"`));
  }
});
test('unavailable or arbitrary query values cannot switch product or redirect off site', () => {
  for (const product of products) {
    for (const color of ['gold', 'https://outside.example/', '__proto__', 'constructor']) {
      assert.equal(queryRoute(product, `https://preview.example${productPath(product)}?color=${encodeURIComponent(color)}`), undefined);
    }
    assert.equal(queryRoute(product, `https://preview.example${productPath(product)}`), undefined);
  }
  assert.equal(queryRoute(products[0], 'https://preview.example/products/jacket/?color=navy'), undefined);
  assert.equal(new URL(queryRoute(products[2], 'https://preview.example/products/beanie/?color=navy'), 'https://preview.example').pathname, '/products/beanie/midnight-navy/');
});

test('final photography release gate', {skip: process.env.REQUIRE_FINAL_PHOTOGRAPHY !== '1'},()=>{
  const editorial=JSON.parse(readFileSync('data/editorial.json','utf8'));
  assert.equal(editorial.status,'approved-intended-photography');
  assert.notEqual(editorial.opening.file,editorial.opening.mobile.file);
  assert.notEqual(editorial.opening.file,editorial.closing.file);
  for(const p of products)for(const c of p.colors){
    assert.deepEqual(c.views.map(v=>v.id),['front','angle','detail']);
    assert.equal(new Set(c.views.map(v=>v.file)).size,3);
    assert.ok(c.views.every(v=>!v.crop&&v.provenance==='generated-design-concept'));
  }
});
