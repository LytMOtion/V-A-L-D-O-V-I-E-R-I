import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';
const script = readFileSync('scripts/site.js', 'utf8');
function setup({ preview = false, valid = true, response = {ok: true}, fail = false, defer = false } = {}) {
  const state = { calls: 0, resets: 0, handler: null, status: '', timers: 0, cleared: 0 };
  const button = { disabled: false, textContent: 'Request access' };
  const status = { get textContent() { return state.status; }, set textContent(v) { state.status = v; } };
  const form = { dataset: { preview: String(preview) }, querySelector: () => button,
    addEventListener: (_, cb) => { state.handler = cb; }, reportValidity: () => valid,
    reset: () => state.resets++, setAttribute: () => {}, removeAttribute: () => {} };
  const context = { document: { getElementById: id => id === 'suForm' ? form : status },
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
test('static image references and original icon geometry are intact', () => {
  const html=readFileSync('index.html','utf8');
  for (const path of [...html.matchAll(/(?:src|href)="(assets\/[^"#]+)"/g)].map(x=>x[1])) assert.ok(existsSync(path),path);
  const icon=readFileSync('assets/mark-original.svg','utf8').match(/<path d="([^"]+)"/)[1];
  const paths=[...html.matchAll(/<path[^>]+d="([^"]+)"/g)].map(x=>x[1]);
  assert.equal(paths.length,3); paths.forEach(p=>assert.equal(p,icon));
  assert.ok(!/IntersectionObserver|opacity:0|class="lock"/.test(html));
  assert.ok(html.includes('prefers-reduced-motion:reduce')); assert.ok(html.includes('role="status"'));
});
