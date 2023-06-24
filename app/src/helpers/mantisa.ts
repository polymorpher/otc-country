import * as CONFIG from './config';

export const round = (value: number | string) =>
  Math.round(Number(value) * 10 ** CONFIG.mantisaPrecision) / 10 ** CONFIG.mantisaPrecision;
