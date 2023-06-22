import * as CONFIG from './config';

export const round = (value: number | string) =>
  Math.round(Number(value) * 10 ** CONFIG.mantisaPrecision) / CONFIG.mantisaPrecision;
