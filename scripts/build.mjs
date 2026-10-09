import { mkdir, readFile, writeFile, cp, rm } from 'node:fs/promises';
import { products, renderHome, renderCollection, renderProduct, productPath } from './render.mjs';
const placements = JSON.parse(await readFile('data/mark-placements.json', 'utf8'));
const isPreview = process.env.VERCEL_ENV !== 'production';
await rm('dist', { recursive: true, force: true });
await mkdir('dist/assets/products', { recursive: true });
await cp('assets/products', 'dist/assets/products', { recursive: true });
await cp('assets/fonts', 'dist/assets/fonts', {recursive:true});
await cp('assets/materials', 'dist/assets/materials', { recursive: true });
await cp('assets/mark-original.svg', 'dist/assets/mark-original.svg');
await cp('scripts/site.js', 'dist/site.js');
await cp('scripts/gallery.js', 'dist/gallery.js');
await cp('scripts/color-route.js', 'dist/color-route.js');
await cp('scripts/site.css', 'dist/site.css');
await writeFile('dist/index.html', renderHome(isPreview));
await mkdir('dist/collection', {recursive:true});
await writeFile('dist/collection/index.html', renderCollection(placements, isPreview));
for (const product of products) {
  for (const color of product.colors) {
    const folder = `dist${productPath(product, color)}`;
    await mkdir(folder, { recursive: true });
    await writeFile(`${folder}index.html`, renderProduct(product, color, placements, isPreview));
  }
}
console.log(`Built editorial home, collection and six product/color states: ${isPreview ? 'safe preview (no form transmission)' : 'production form endpoint enabled'}`);
