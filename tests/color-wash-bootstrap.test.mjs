import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('the color wash exists before the React root mounts', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(html, /<div id="color-wash" aria-hidden="true"><\/div>\s*<div id="root">/);
  assert.match(html, /html\[data-portfolio-booting\] #color-wash\{[^}]*background:#050505/);
});
