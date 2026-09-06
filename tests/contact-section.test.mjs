import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const appSource = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');
const contactSource = await readFile(new URL('../src/contact/ContactSection.tsx', import.meta.url), 'utf8');
const tabSource = await readFile(new URL('../src/contact/ContactTab.tsx', import.meta.url), 'utf8');
const contactCss = await readFile(new URL('../src/contact/contact.css', import.meta.url), 'utf8');
const cutout = await readFile(new URL('../public/racing-suit-cutout.png', import.meta.url));

test('Contact closes the portfolio after Projects with the approved personal links', () => {
  assert.ok(appSource.indexOf('<ProjectsTransition />') < appSource.indexOf('<ContactSection />'));
  assert.match(contactSource, /1503794397@qq\.com/);
  assert.match(contactSource, /chenyikaizuishuai/);
  assert.match(contactSource, /github\.com\/sky-k111/);
  assert.match(contactSource, /x\.com\/ykchenxxx/);
  assert.match(contactSource, /facebook\.com\/profile\.php\?id=61593491366698/);
  assert.match(contactSource, /<EthanSignature active=\{signatureReady\}\s*\/>/);
  assert.match(contactSource, /visibleRatio >= 0\.88/);
  assert.match(contactSource, /\/ai-brands\/openai\.svg/);
  assert.match(contactSource, /\/ai-brands\/codex\.svg/);
  assert.match(contactSource, /\/ai-brands\/grok\.svg/);
  assert.match(contactSource, /name: 'Qwen', icon: '\/ai-brands\/qwen\.png'/);
  assert.match(contactSource, /\/ai-brands\/doubao\.png/);
  assert.doesNotMatch(contactSource, /通义千问/);
  assert.match(contactSource, /import PersonalLogo from '@\/components\/PersonalLogo'/);
  assert.match(contactSource, /<PersonalLogo className="contact__identity-mark"\s*\/>/);
  assert.doesNotMatch(contactSource, /BrandMark/);
});

test('Contact uses a real transparent racing-suit cutout and a visibility-bounded marquee', () => {
  assert.equal(cutout[25], 6, 'PNG must use RGBA color type 6');
  assert.match(contactSource, /racing-suit-cutout\.png/);
  assert.match(contactCss, /animation:\s*contact-marquee[^;]*paused/);
  assert.match(contactCss, /data-contact-visible[^}]+animation-play-state:\s*running/s);
  assert.match(contactCss, /prefers-reduced-motion:\s*reduce/);
});

test('The fixed contact tab changes into a reduced-motion-aware back-to-top control', () => {
  assert.match(appSource, /<ContactTab visible=\{openingComplete\}/);
  assert.match(tabSource, /import PersonalLogo from '@\/components\/PersonalLogo'/);
  assert.match(tabSource, /<PersonalLogo className="contact-tab__mark"\s*\/>/);
  assert.match(tabSource, /<span className="contact-tab__label">\{label\}<\/span>/);
  assert.doesNotMatch(tabSource, /BrandMark/);
  assert.match(tabSource, /contactActive \? 'BACK TO TOP' : 'CONTACT'/);
  assert.match(tabSource, /prefers-reduced-motion:\s*reduce/);
});
