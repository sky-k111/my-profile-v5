import assert from 'node:assert/strict';
import test from 'node:test';
import { pressureValue } from '../src/lib/pressure.ts';

test('pressureValue is strongest at the cursor and weakest at max distance', () => {
  assert.equal(pressureValue(0, 200, 5, 200), 200);
  assert.equal(pressureValue(200, 200, 5, 200), 5);
});
