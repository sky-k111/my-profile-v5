import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('the initial document stays black until React has mounted the signal opening', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const css = await readFile(new URL('../src/index.css', import.meta.url), 'utf8');

  assert.match(html, /<html[^>]*data-portfolio-booting/);
  assert.match(html, /<link rel="icon" href="\/yikai-logo\.png" type="image\/png"/);
  assert.match(html, /html\[data-portfolio-booting\][^}]*background:\s*#050505/);
  assert.match(app, /useLayoutEffect/);
  assert.match(app, /removeAttribute\('data-portfolio-booting'\)/);
  assert.match(html, /navigationEntry\?\.type === 'reload'/);
  assert.match(html, /\['about', 'projects', 'contact'\]\.includes\(refreshTarget\)/);
  assert.match(html, /history\.scrollRestoration = 'manual'/);
  assert.match(html, /history\.replaceState\(history\.state, '', `\$\{location\.pathname\}\$\{location\.search\}`\)/);
  assert.match(html, /portfolioRefreshReset = 'home'/);
  assert.ok(html.indexOf('portfolioRefreshReset') < html.indexOf('/src/main.tsx'));
  assert.match(app, /window\.history\.scrollRestoration = 'auto'/);
  assert.match(css, /html\s*\{[^}]*scrollbar-width:\s*none;/s);
  assert.match(css, /html::\-webkit-scrollbar,[\s\S]*body::\-webkit-scrollbar\s*\{[^}]*display:\s*none;/);
});
