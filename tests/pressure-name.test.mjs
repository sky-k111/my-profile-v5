import assert from 'node:assert/strict';
import test from 'node:test';
import * as pressureName from '../src/lib/name.ts';

test('pressure name supplies all visible characters before effects run', () => {
  assert.deepEqual(pressureName.getPressureCharacters(), ['Y', 'I', 'K', 'A', 'I', '\u00a0', 'C', 'H', 'E', 'N']);
});

test('pressure name exposes its line-break space without relying on encoded source text', () => {
  assert.equal(typeof pressureName.isPressureSpace, 'function');
  assert.equal(pressureName.isPressureSpace('\u00a0'), true);
  assert.equal(pressureName.isPressureSpace('I'), false);
});
