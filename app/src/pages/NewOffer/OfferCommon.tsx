import type { Address } from 'abitype'
import { ASSETS, DEPEGGED } from '~/helpers/assets.js'
import type { RegisterOptions } from 'react-hook-form'
import { isAddress, zeroAddress } from 'viem'
import { readContract } from '@wagmi/core'
import { config } from '~/helpers/config.js'
import { otcContract } from '~/helpers/contracts.js'

const checkAssetAvailable = (asset: string): Promise<boolean> =>
  readContract(config, {
    ...otcContract,
    functionName: 'assets',
    args: [asset]
  }).then((res) => !!res)

export interface FormFields {
  domainOwner: Address
  srcAsset: Address
  destAsset: Address
  depositAmount: string
  acceptAmount: string
  commissionRate: number
  lockWithdrawDuration: number
}

export const defaultValues: FormFields = {
  domainOwner: '' as Address,
  srcAsset: DEPEGGED[0].value as Address,
  destAsset: ASSETS[0].value as Address,
  depositAmount: '',
  acceptAmount: '',
  commissionRate: 0.5,
  lockWithdrawDuration: 6
}

export const rules: Record<keyof FormFields, RegisterOptions> = {
  domainOwner: {
    required: 'Domain owner is required',
    validate: {
      address: (v: string) =>
        (isAddress(v) && v !== zeroAddress) || 'not address format'
    }
  },
  srcAsset: {
    required: 'Source asset must be specified',
    validate: {
      address: (v: string) => isAddress(v) || 'not address format',
      available: async (v: string) =>
        (await checkAssetAvailable(v)) || `asset ${v} is not available`
    }
  },
  destAsset: {
    required: 'Target asset must be specified',
    validate: {
      address: (v: string) => isAddress(v) || 'not address format',
      sameAsSrc: (v: string, values) =>
        values.srcAsset !== v || 'should not be the same as source asset',
      available: async (v: string) =>
        (await checkAssetAvailable(v)) || `asset ${v} is not available`
    }
  },
  depositAmount: {
    required: 'Deposit amount is required',
    validate: {
      number: (v: string) => !isNaN(Number(v)) || 'should be number',
      notZero: (v: string) => Number(v) > 0 || 'should be not zero'
    }
  },
  acceptAmount: {
    required: 'Desirable amount is required',
    validate: {
      number: (v: string) => !isNaN(Number(v)) || 'should be number',
      notZero: (v: string) => Number(v) > 0 || 'should be not zero'
    }
  },
  commissionRate: {
    required: true,
    validate: {
      number: (v: string) => !isNaN(Number(v)) || 'should be number',
      notZero: (v: string) => Number(v) > 0 || 'should be not zero'
    }
  },
  lockWithdrawDuration: { required: true }
}
