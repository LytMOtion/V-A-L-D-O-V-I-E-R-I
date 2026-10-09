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
    assert.ok(html.includes(`data-color="${color.id}" aria-current="true"`));
    assert.equal([...html.matchAll(/aria-current="true"/g)].length,1);
    for(const view of ['front','detail']) assert.ok(html.includes(`src="/assets/products/${color[view]}"`));
    assert.ok(html.includes(`id="inquiryPiece" value="${product.name}"`));
    assert.ok(html.includes(`id="inquiryColor" value="${color.name}"`));
    assert.ok(html.includes(`id="accessContext">${product.name} / ${color.name}</p>`));
    assert.ok(html.includes(encodeURIComponent(`VALDOVIERI inquiry — ${product.name} / ${color.name}`)));
    assert.ok(html.includes('href="/#collection"'));
  }
});
test('every rendered local image/link resolves and every garment mark keeps original geometry', () => {
  const icon=readFileSync('assets/mark-original.svg','utf8').match(/<path d="([^"]+)"/)[1];
  const pages=['dist/index.html',...products.flatMap(p=>p.colors.map(c=>`dist${productPath(p,c)}index.html`))];
  for(const page of pages){
    const html=readFileSync(page,'utf8');
    for(const match of html.matchAll(/(?:src|href)="(\/[^"#]*)(?:#[^"]*)?"/g)){
      const path=match[1]; const file=path.endsWith('/')?`dist${path}index.html`:`dist${path}`;
      assert.ok(existsSync(file),`${page} -> ${file}`);
    }
    const paths=[...html.matchAll(/<path data-icon-path="original" d="([^"]+)"/g)].map(x=>x[1]);
    assert.equal(paths.length,page==='dist/index.html'?6:3);
    paths.forEach(path=>assert.equal(path,icon));
    assert.ok(html.includes('role="status"'));
    assert.ok(!html.includes('{{'));
  }
  const css=readFileSync('scripts/site.css','utf8');
  assert.ok(css.includes('prefers-reduced-motion:reduce'));
  assert.ok(!/IntersectionObserver|opacity:\s*0(?:;|})|class="lock"/.test(script+css));
});
test('all fifteen active photographic views are distinct completed assets',()=>{
  const files=products.flatMap(p=>[p.collection,...p.colors.flatMap(c=>[c.front,c.detail])]);
  assert.equal(files.length,15); assert.equal(new Set(files).size,15);
  const hashes=files.map(file=>createHash('sha256').update(readFileSync(`assets/products/${file}`)).digest('hex'));
  assert.equal(new Set(hashes).size,15,'active photos must not repeat as separate looks');
});
test('safe dry-run identifies all six piece/color combinations and never sends',async()=>{
  for(const product of products)for(const color of product.colors){
    const x=setup({preview:true,piece:product.name,color:color.name});await x.submit();
    assert.equal(x.state.calls,0); assert.ok(x.state.status.includes(`${product.name} / ${color.name}`));
    assert.match(x.state.status,/No request has been sent/);
  }
});
