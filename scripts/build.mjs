import { mkdir, readFile, writeFile, cp, rm } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist/assets', { recursive: true });
await cp('assets', 'dist/assets', { recursive: true });
await cp('scripts/site.js', 'dist/site.js');
const html = await readFile('index.html', 'utf8');
const isPreview = process.env.VERCEL_ENV !== 'production';
await writeFile('dist/index.html', html.replace('data-preview="true"', `data-preview="${isPreview}"`));
console.log(`Built static site: ${isPreview ? 'safe preview (no form transmission)' : 'production form endpoint enabled'}`);
