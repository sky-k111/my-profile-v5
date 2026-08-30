import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('the initial document stays white until React has mounted the white opening', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');

  assert.match(html, /<html[^>]*data-portfolio-booting/);
  assert.match(html, /html\[data-portfolio-booting\][^}]*background:\s*#fff/);
  assert.match(app, /useLayoutEffect/);
  assert.match(app, /removeAttribute\('data-portfolio-booting'\)/);
});
