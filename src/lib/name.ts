export const PRESSURE_NAME = 'YIKAI CHEN';

export function getPressureCharacters() {
  return Array.from(PRESSURE_NAME, character => character === ' ' ? '\u00a0' : character);
}

export function isPressureSpace(character: string) {
  return character === '\u00a0';
}
