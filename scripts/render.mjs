import { readFileSync } from 'node:fs';
export const products = JSON.parse(readFileSync('data/products.json', 'utf8'));
const editorial = JSON.parse(readFileSync('data/editorial.json', 'utf8'));
const icon = readFileSync('assets/mark-original.svg', 'utf8').match(/<path d="([^"]+)"/)[1];
const template = readFileSync('index.html', 'utf8');
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function productPath(product, color = product.colors[0]) {
  return `/products/${product.id}/${color.id === 'graphite' ? '' : `${color.id}/`}`;
}
function brand() { return `<svg viewBox="0 0 252 293" aria-hidden="true"><path d="${icon}"/></svg><span>VALDOVIERI</span>`; }
function viewData(color, name) {
  return color.views?.find(v => v.id === name) || {id:name,file:color[name],dimensions:color[`${name}Dimensions`] || [1122,1402],label:name === 'front' ? 'Front view' : color.detailCrop ? 'Detail crop / same photograph' : 'Detail view',crop:name === 'detail' ? color.detailCrop : null};
}
export function imageFrame({product, color, view, eager = false, id = '', href}) {
  const item = view === 'collection' ? {file:product.collection,dimensions:product.collectionDimensions || [1536,1024],label:'Outfit study'} : viewData(color,view);
  const [nativeW,nativeH] = item.dimensions;
  const crop = item.crop;
  const [w,h] = crop ? crop.slice(2) : [nativeW,nativeH];
  const alt = item.alt || `Generated design concept: ${product.name} in ${color.name}, ${item.label.toLowerCase()}.`;
  const photo = `<img src="/assets/products/${item.file}" width="${nativeW}" height="${nativeH}" alt="${escape(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
  const visiblePhoto = crop ? `<span class="image-crop-source" style="width:${nativeW/w*100}%;height:${nativeH/h*100}%;left:${-crop[0]/w*100}%;top:${-crop[1]/h*100}%">${photo}</span>` : photo;
  const frame = `<span class="image-frame" data-view="${view}" ${crop ? 'data-faithful-crop="true"' : ''} style="--photo-width:${w}px;aspect-ratio:${w}/${h}" ${id ? `id="${id}"` : ''}>${visiblePhoto}</span>`;
  return href === null ? frame : `<a class="image-link" href="${href || productPath(product,color)}" aria-label="${escape(`Explore ${product.name} in ${color.name}`)}">${frame}</a>`;
}
function access(product, color, preview) {
  const context = product ? `${product.name} / ${color.name}` : 'Collection I';
  return `<section class="access" id="access" aria-labelledby="access-title"><div class="access-grid wrap"><div><h2 id="access-title">Private Access</h2><p class="lead">For collection and piece inquiries.</p><p class="access-context" id="accessContext">${escape(context)}</p></div><div class="access-form"><form id="suForm" data-preview="${preview}"><input type="hidden" name="piece" id="inquiryPiece" value="${escape(product?.name || 'Collection I')}"><input type="hidden" name="color" id="inquiryColor" value="${escape(color?.name || 'Not selected')}"><label for="email">Email address</label><div class="form-row"><input id="email" type="email" name="email" placeholder="you@example.com" autocomplete="email" required aria-describedby="form-note suOk"><button type="submit">Request access</button></div><p class="form-note" id="form-note">${preview ? 'Preview: no request will be sent.' : 'Your request includes the piece and color shown above.'}</p></form><p class="status" id="suOk" role="status" aria-live="polite"></p><noscript><p class="form-note">Email <a href="mailto:inquiries@valdovieri.com?subject=${encodeURIComponent(`VALDOVIERI inquiry — ${context}`)}">inquiries@valdovieri.com</a>.</p></noscript></div></div></section>`;
}
function layout({title, description, content, preload, product, color, preview, page}) {
  const header = `<header class="top"><nav class="nav wrap" aria-label="Main navigation"><a class="brand" href="/" aria-label="VALDOVIERI home">${brand()}</a><div class="nav-links"><a href="/collection/" ${page === 'collection' ? 'aria-current="page"' : ''}>Collection</a><a href="#access"><span class="desktop-access">Private </span>Access</a></div></nav></header>`;
  const footer = `<footer><div class="wrap"><div class="footer-row"><a class="brand" href="/" aria-label="VALDOVIERI home">${brand()}</a><a href="mailto:inquiries@valdovieri.com">inquiries@valdovieri.com</a><a href="#top">Back to top ↑</a></div><p class="provenance">Generated design concepts. Materials, construction and availability are unconfirmed.</p></div></footer>`;
  const routeScript = product ? `<script type="application/json" id="colorRoutes">${JSON.stringify(Object.fromEntries(product.colors.map(c => [c.id,productPath(product,c)])))}</script><script src="/color-route.js"></script>` : '';
  const preloads = (Array.isArray(preload) ? preload : [{file:preload}]).map(p => `<link rel="preload" as="image" href="/assets/products/${p.file}" ${p.media ? `media="${p.media}"` : ''} fetchpriority="high">`).join('');
  const values = {COLOR_ROUTE:routeScript, TITLE:escape(title), DESCRIPTION:escape(description), HEADER:header, CONTENT:content + access(product,color,preview), FOOTER:footer, PRELOAD:preloads};
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key]);
}
function campaignPhoto(slot, {eager=false, classes=''}={}) {
  const img = `<img src="/assets/products/${slot.file}" width="${slot.dimensions[0]}" height="${slot.dimensions[1]}" alt="${escape(slot.alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" style="object-position:${slot.position || '50% 50%'}">`;
  const picture = slot.mobile ? `<picture><source media="(max-width:900px) and (orientation:portrait)" srcset="/assets/products/${slot.mobile.file}" width="${slot.mobile.dimensions[0]}" height="${slot.mobile.dimensions[1]}">${img}</picture>` : img;
  return `<a class="campaign-photo ${classes}" href="${slot.href}" aria-label="${escape(slot.linkLabel)}">${picture}</a>`;
}
function caption(slot) { return `<figcaption><a href="${slot.href}">${escape(slot.caption)} ↗</a></figcaption>`; }
export function renderHome(preview=true) {
  const s = editorial;
  const opening = `<section class="opening" aria-labelledby="home-title"><h1 class="visually-hidden" id="home-title">VALDOVIERI — Collection I</h1>${campaignPhoto(s.opening,{eager:true})}<a class="opening-link" href="/collection/">Collection I <span aria-hidden="true">→</span></a></section>`;
  const study = `<section class="jacket-study wrap"><figure class="outfit-study">${campaignPhoto(s.outfit)}${caption(s.outfit)}</figure><div class="closer-study"><h2>The Jacket</h2><p>A point collar. A front zip.<br>A straight silhouette.</p><figure>${campaignPhoto(s.closer)}${caption(s.closer)}</figure></div><figure class="construction-study">${campaignPhoto(s.construction)}${caption(s.construction)}</figure><div class="construction-copy"><h2>Collar, zip and seam</h2><p>${escape(s.construction.copy)}</p></div></section>`;
  const headwear = `<section class="headwear"><div class="headwear-grid wrap"><figure class="cap-study">${campaignPhoto(s.cap)}${caption(s.cap)}<p>Five-panel shape. Curved brim.</p></figure><figure class="beanie-study">${campaignPhoto(s.beanie)}${caption(s.beanie)}<p>A ribbed crown with a turned cuff.</p></figure></div></section>`;
  const closing = `<section class="closing">${campaignPhoto(s.closing)}<div class="featured wrap">${s.closing.featured.map(f=>`<a href="${f.href}">${escape(f.label)} ↗</a>`).join('')}</div></section>`;
  return layout({title:'VALDOVIERI — Collection I',description:'VALDOVIERI. An editorial study of The Jacket, The Cap and The Beanie.',content:opening+study+headwear+closing,preload:[{file:s.opening.file,media:'(min-width:901px), (orientation:landscape)'},{file:s.opening.mobile.file,media:'(max-width:900px) and (orientation:portrait)'}],preview,page:'home'});
}
export function renderCollection(_placements, preview=true) {
  const cards = products.map(p => `<article class="piece-card">${imageFrame({product:p,color:p.colors[0],view:'front',eager:true})}<p class="eyebrow">${p.number} / ${escape(p.type)}</p><h2><a href="${productPath(p)}">${p.name}</a></h2><p>${escape(p.description)}</p><div class="card-colors" aria-label="Colors for ${p.name}">${p.colors.map(c=>`<a href="${productPath(p,c)}"><span class="swatch-dot" style="--swatch:${c.hex}" aria-hidden="true"></span>${c.name}</a>`).join('')}</div><a class="text-link" href="${productPath(p)}">Explore the piece ↗</a></article>`).join('');
  return layout({title:'Collection I — VALDOVIERI',description:'Explore three VALDOVIERI design concepts and their proposed colors.',content:`<section class="collection wrap"><p class="eyebrow">Collection I</p><h1>The pieces</h1><div class="piece-grid">${cards}</div></section>`,preload:products[0].colors[0].front,preview,page:'collection'});
}
function galleryFigure(product,color,view,eager=false) {
  const v=viewData(color,view);
  return `<figure class="gallery-figure" id="view-${view}">${imageFrame({product,color,view,eager,href:`/assets/products/${v.file}`})}<figcaption>${product.name} / ${color.name} / ${escape(v.label)}</figcaption><button class="image-open" type="button" data-image-src="/assets/products/${v.file}" data-image-title="${escape(`${product.name} / ${color.name} / ${v.label}`)}" hidden>View full image ↗</button></figure>`;
}
export function renderProduct(product,color,_placements,preview=true) {
  const views=color.views?.map(v=>v.id) || ['front','detail'];
  const swatches=product.colors.map(c=>`<a class="color-option" href="${productPath(product,c)}" data-color="${c.id}" ${c.id===color.id?'aria-current="page"':''}><span class="swatch-dot" style="--swatch:${c.hex}" aria-hidden="true"></span><span>${c.name}</span></a>`).join('');
  const content=`<div class="product-wrap wrap" data-product="${product.id}"><a class="back-link" href="/collection/">← Collection</a><section class="product-grid" aria-labelledby="product-title"><div class="product-heading"><p class="eyebrow">Collection I / ${product.number}</p><h1 id="product-title">${product.name}</h1><p class="product-lead">${escape(product.description)}</p><fieldset class="color-selector"><legend>Color — <strong id="selectedColor">${color.name}</strong></legend><div class="color-options">${swatches}</div></fieldset></div><div class="product-first" id="gallery">${galleryFigure(product,color,views[0],true)}</div><div class="product-actions"><a class="primary-link" id="pieceAccess" href="#access">Inquire about this piece ↘</a><a class="inquiry-link" id="pieceInquiry" href="mailto:inquiries@valdovieri.com?subject=${encodeURIComponent(`VALDOVIERI inquiry — ${product.name} / ${color.name}`)}">Email about ${product.name} / <span data-inquiry-color>${color.name}</span> ↗</a><p class="concept-note">Generated design concept. Details and availability remain unconfirmed.</p></div><div class="product-more" id="detail">${views.slice(1).map(v=>galleryFigure(product,color,v)).join('')}</div></section><a class="return-link" href="/collection/">← Return to Collection</a></div><dialog id="imageDialog" aria-labelledby="zoomTitle"><div class="zoom-header"><h2 id="zoomTitle"></h2><button type="button" id="closeImage">Close ×</button></div><div class="zoom-viewport"><img id="zoomImage" alt=""></div></dialog>`;
  return layout({title:`${product.name} — ${color.name} — VALDOVIERI`,description:`${product.name}, a VALDOVIERI design concept in ${color.name}.`,content,preload:viewData(color,views[0]).file,product,color,preview,page:'product'});
}
