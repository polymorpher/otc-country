import { HStack } from '@chakra-ui/react'
import React from 'react'
import Select, { components, type OptionProps, type SingleValueProps } from 'react-select'
import { abbreviateAddress } from '~/helpers/address'

const assets = [
  ['0x985458E523dB3d53125813eD68c274899e9DfAb4', 'Depegged 1USDC', 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg'],
  ['0x6983D1E6DEf3690C4d616b13597A09e6193EA013', 'Depegged 1ETH', 'https://cryptologos.cc/logos/ethereum-eth-logo.svg'],
  ['0x3095c7557bCb296ccc6e363DE01b760bA031F2d9', 'Depegged 1WBTC', 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.svg'],
  ['0x3C2B8Be99c50593081EAA2A724F0B8285F5aba8f', 'Depegged 1USDT', 'https://cryptologos.cc/logos/tether-usdt-logo.svg'],
  ['0xEf977d2f931C1978Db5F6747666fa1eACB0d0339', 'Depegged 1DAI', 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg'],
  ['0xE176EBE47d621b984a73036B9DA5d834411ef734', 'Depegged BUSD', 'https://cryptologos.cc/logos/binance-usd-busd-logo.svg'],
  ['0xF720b7910C6b2FF5bd167171aDa211E226740bfe', 'Depegged 1WETH'],
  ['0xb1f6E61E1e113625593a22fa6aa94F8052bc39E0', 'Depegged bscBNB', 'https://cryptologos.cc/logos/bnb-bnb-logo.svg'],
  ['0x0aB43550A6915F9f67d0c454C2E90385E6497EaA', 'Depegged bscBUSD', 'https://cryptologos.cc/logos/binance-usd-busd-logo.svg'],
  ['0xeB6C08ccB4421b6088e581ce04fcFBed15893aC3', 'Depegged 1FRAX', 'https://cryptologos.cc/logos/frax-frax-logo.svg'],
  ['0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a', 'WONE'],
  ['0xBC594CABd205bD993e7FfA6F3e9ceA75c1110da5', '1USDC', 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg'],
  ['0x4cC435d7b9557d54d6EF02d69Bbf72634905Bf11', '1ETH', 'https://cryptologos.cc/logos/ethereum-eth-logo.svg'],
  ['0x118f50d23810c5E09Ebffb42d7D3328dbF75C2c2', '1WBTC', 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.svg'],
  ['0x301259f392B551CA8c592C9f676FCD2f9A0A84C5', '1MATIC', 'https://cryptologos.cc/logos/polygon-matic-logo.svg'],
  ['0xF2732e8048f1a411C63e2df51d08f4f52E598005', '1USDT', 'https://cryptologos.cc/logos/tether-usdt-logo.svg']
].map(item => ({
  value: item[0],
  label: item[1],
  icon: item[2]
}))

interface Item {
  value: string
  label: string
  icon: string
}

const unknownLogo = 'https://www.reshot.com/preview-assets/icons/VM8X47B5JK/question-VM8X47B5JK.svg'

const SingleValue: React.FC<SingleValueProps<Item>> = ({ children, ...props }) => (
  <HStack as={components.SingleValue} {...props} justifyContent="space-between">
    <HStack>
      <img src={props.data.icon ?? unknownLogo} width="15" />
      <div>{props.data.label}</div>
    </HStack>
    <div>{abbreviateAddress(props.data.value)}</div>
  </HStack>
)

const Option: React.FC<OptionProps<Item>> = (props) => (
  <components.Option {...props}>
    <HStack justifyContent="space-between">
      <HStack>
        <img src={props.data.icon ?? unknownLogo} width="15" />
        <div>{props.data.label}</div>
      </HStack>
      <div>{abbreviateAddress(props.data.value)}</div>
    </HStack>
  </components.Option>
)

interface AssetSelectProps {
  value: string
  onChange: (value: string) => void
}

const AssetSelect: React.FC<AssetSelectProps> = ({ value, onChange }) => (
  <Select
    value={assets.find(asset => asset.value === value) ?? assets[0]}
    options={assets}
    onChange={value => { onChange(value.value) }}
    components={{
      Option,
      SingleValue
    }}
  />
)

export default AssetSelect
