import assert from 'node:assert/strict';
import test from 'node:test';
import { ABOUT_CONTENT, ABOUT_PHOTOS } from '../src/about/about-content.ts';

test('About exposes the approved bilingual identity and eight unique photos', () => {
  assert.equal(ABOUT_CONTENT.nameEn, 'CHEN YIKAI');
  assert.equal(ABOUT_CONTENT.nameZh, '陈奕恺');
  assert.match(ABOUT_CONTENT.aiZh, /人工智能（Artificial Intelligence，AI）/);
  assert.equal(ABOUT_CONTENT.manifestoZh, '保持热爱，永远向前。');
  assert.equal(ABOUT_PHOTOS.length, 8);
  assert.deepEqual(
    ABOUT_PHOTOS.map(photo => photo.id),
    ['photo-01', 'photo-04', 'photo-05', 'photo-06', 'photo-07', 'photo-08', 'photo-09', 'photo-10'],
  );
  assert.ok(ABOUT_PHOTOS.every(photo => photo.src && photo.altZh));
  assert.equal(new Set(ABOUT_PHOTOS.map(photo => photo.src)).size, ABOUT_PHOTOS.length);
});

test('the red-rail portrait keeps its original frame with a lower crop', () => {
  const portrait = ABOUT_PHOTOS.find(photo => photo.id === 'photo-10');

  assert.equal(portrait?.ratio, '3/2');
  assert.equal(portrait?.objectPosition, '56% 80%');
});
