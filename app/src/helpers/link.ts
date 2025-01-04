import { LOCAL_TARGET, TLD } from '~/helpers/config.js'

export const host = 'explorer.harmony.one'

export const hashLink = (hash: string): string => `https://${host}/tx/${hash}`

export const buildTarget = (sld: string): string => {
  return LOCAL_TARGET ? `/offer/${sld}` : `https://${sld}.${TLD}`
}
