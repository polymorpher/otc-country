import * as CONFIG from './config.js'

export const round = (value: number | string): number =>
  Math.round(Number(value) * 10 ** CONFIG.mantisaPrecision) /
  10 ** CONFIG.mantisaPrecision
