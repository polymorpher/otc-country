export interface Asset {
  value: string
  label: string
  rate: number | string
  icon?: string
}

export const DEPEGGED: Asset[] = [
  {
    value: '0x985458E523dB3d53125813eD68c274899e9DfAb4',
    label: 'Depegged 1USDC',
    icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg',
    rate: 1
  },
  {
    value: '0x6983D1E6DEf3690C4d616b13597A09e6193EA013',
    label: 'Depegged 1ETH',
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
    rate: 1100
  },
  {
    value: '0x3095c7557bCb296ccc6e363DE01b760bA031F2d9',
    label: 'Depegged 1WBTC',
    icon: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.svg',
    rate: 20000
  },
  {
    value: '0x3C2B8Be99c50593081EAA2A724F0B8285F5aba8f',
    label: 'Depegged 1USDT',
    icon: 'https://cryptologos.cc/logos/tether-usdt-logo.svg',
    rate: 1
  },
  {
    value: '0xEf977d2f931C1978Db5F6747666fa1eACB0d0339',
    label: 'Depegged 1DAI',
    icon: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg',
    rate: 1
  },
  {
    value: '0xE176EBE47d621b984a73036B9DA5d834411ef734',
    label: 'Depegged BUSD',
    icon: 'https://cryptologos.cc/logos/binance-usd-busd-logo.svg',
    rate: 1
  },
  {
    value: '0xF720b7910C6b2FF5bd167171aDa211E226740bfe',
    label: 'Depegged 1WETH',
    rate: 1100
  },
  {
    value: '0xb1f6E61E1e113625593a22fa6aa94F8052bc39E0',
    label: 'Depegged bscBNB',
    icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg',
    rate: 220
  },
  {
    value: '0x0aB43550A6915F9f67d0c454C2E90385E6497EaA',
    label: 'Depegged bscBUSD',
    icon: 'https://cryptologos.cc/logos/binance-usd-busd-logo.svg',
    rate: 1
  },
  {
    value: '0xeB6C08ccB4421b6088e581ce04fcFBed15893aC3',
    label: 'Depegged 1FRAX',
    icon: 'https://cryptologos.cc/logos/frax-frax-logo.svg',
    rate: 1
  }
]

export const ASSETS: Asset[] = [
  {
    value: '0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a',
    label: 'WONE',
    icon: 'https://cryptologos.cc/logos/harmony-one-logo.svg',
    rate: '0xc572690504b42b57a3f7aed6bd4aae08cbeeebdadcf130646a692fe73ec1e009'
  },
  {
    value: '0xBC594CABd205bD993e7FfA6F3e9ceA75c1110da5',
    label: '1USDC',
    icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg',
    rate: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a'
  },
  {
    value: '0x4cC435d7b9557d54d6EF02d69Bbf72634905Bf11',
    label: '1ETH',
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
    rate: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace'
  },
  {
    value: '0x118f50d23810c5E09Ebffb42d7D3328dbF75C2c2',
    label: '1WBTC',
    icon: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.svg',
    rate: '0xc9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33'
  },
  {
    value: '0x301259f392B551CA8c592C9f676FCD2f9A0A84C5',
    label: '1MATIC',
    icon: 'https://cryptologos.cc/logos/polygon-matic-logo.svg',
    rate: '0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52'
  },
  {
    value: '0xF2732e8048f1a411C63e2df51d08f4f52E598005',
    label: '1USDT',
    icon: 'https://cryptologos.cc/logos/tether-usdt-logo.svg',
    rate: '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b'
  }
]
