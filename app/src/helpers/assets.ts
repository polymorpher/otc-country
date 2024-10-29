/**
 * should be defined class as it is shared in subgraph mapping (assemblyscript) doesn't support object
 */
export class Asset {
  constructor(
    public value: string,
    public label: string,
    public icon: string,
    public rate: string
  ) {}
}

export const DEPEGGED: Asset[] = [
  new Asset(
    '0x985458E523dB3d53125813eD68c274899e9DfAb4',
    'Depegged 1USDC',
    'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg',
    '1'
  ),
  new Asset(
    '0x6983D1E6DEf3690C4d616b13597A09e6193EA013',
    'Depegged 1ETH',
    'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
    '1100'
  ),
  new Asset(
    '0x3095c7557bCb296ccc6e363DE01b760bA031F2d9',
    'Depegged 1WBTC',
    'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.svg',
    '20000'
  ),
  new Asset(
    '0x3C2B8Be99c50593081EAA2A724F0B8285F5aba8f',
    'Depegged 1USDT',
    'https://cryptologos.cc/logos/tether-usdt-logo.svg',
    '1'
  ),
  new Asset(
    '0xEf977d2f931C1978Db5F6747666fa1eACB0d0339',
    'Depegged 1DAI',
    'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg',
    '1'
  ),
  new Asset(
    '0xE176EBE47d621b984a73036B9DA5d834411ef734',
    'Depegged BUSD',
    'https://cryptologos.cc/logos/binance-usd-busd-logo.svg',
    '1'
  ),
  new Asset(
    '0xF720b7910C6b2FF5bd167171aDa211E226740bfe',
    'Depegged 1WETH',
    'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
    '110'
  ),
  new Asset(
    '0xb1f6E61E1e113625593a22fa6aa94F8052bc39E0',
    'Depegged bscBNB',
    'https://cryptologos.cc/logos/bnb-bnb-logo.svg',
    '220'
  ),
  new Asset(
    '0x0aB43550A6915F9f67d0c454C2E90385E6497EaA',
    'Depegged bscBUSD',
    'https://cryptologos.cc/logos/binance-usd-busd-logo.svg',
    '1'
  ),
  new Asset(
    '0xeB6C08ccB4421b6088e581ce04fcFBed15893aC3',
    'Depegged 1FRAX',
    'https://cryptologos.cc/logos/frax-frax-logo.svg',
    '1'
  )
]

export const ASSETS: Asset[] = [
  // https://hermes.pyth.network/api/latest_price_feeds?ids[]=0xc9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33
  new Asset(
    '0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a',
    'WONE',
    'https://cryptologos.cc/logos/harmony-one-logo.svg',
    '0xc572690504b42b57a3f7aed6bd4aae08cbeeebdadcf130646a692fe73ec1e009'
  ),
  new Asset(
    '0xBC594CABd205bD993e7FfA6F3e9ceA75c1110da5',
    '1USDC',
    'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg',
    '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a'
  ),
  new Asset(
    '0x4cC435d7b9557d54d6EF02d69Bbf72634905Bf11',
    '1ETH',
    'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
    '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace'
  ),
  new Asset(
    '0x118f50d23810c5E09Ebffb42d7D3328dbF75C2c2',
    '1WBTC',
    'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.svg',
    '0xc9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33'
  ),
  new Asset(
    '0x301259f392B551CA8c592C9f676FCD2f9A0A84C5',
    '1MATIC',
    'https://cryptologos.cc/logos/polygon-matic-logo.svg',
    '0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52'
  ),
  new Asset(
    '0xF2732e8048f1a411C63e2df51d08f4f52E598005',
    '1USDT',
    'https://cryptologos.cc/logos/tether-usdt-logo.svg',
    '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b'
  )
]
