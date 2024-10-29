import React from 'react'
import { HStack, Image, Tooltip } from '@chakra-ui/react'
import type { Address } from 'abitype'
import Select, {
  components,
  type PropsValue,
  type OptionProps,
  type SingleValueProps
} from 'react-select'
import { abbreviateAddress } from '~/helpers/format'
import { type Asset } from '~/helpers/assets'

interface Item {
  value: string
  label: string
  icon: string
}

const unknownLogo =
  'https://www.reshot.com/preview-assets/icons/VM8X47B5JK/question-VM8X47B5JK.svg'

const SingleValue: React.FC<SingleValueProps<Item>> = ({
  children,
  ...props
}) => (
  <HStack as={components.SingleValue} {...props} justifyContent="space-between">
    <HStack>
      <Image
        src={props.data.icon ?? unknownLogo}
        filter={
          props.data.label.startsWith('Depegged') ? 'grayscale(1)' : undefined
        }
        boxSize="15"
      />
      <div>{props.data.label}</div>
    </HStack>
    <Tooltip label={props.data.value}>
      {abbreviateAddress(props.data.value)}
    </Tooltip>
  </HStack>
)

const Option: React.FC<OptionProps<Item>> = (props) => (
  <components.Option {...props}>
    <HStack justifyContent="space-between">
      <HStack>
        <Image
          src={props.data.icon ?? unknownLogo}
          filter={
            props.data.label.startsWith('Depegged') ? 'grayscale(1)' : undefined
          }
          boxSize="15"
        />
        <div>{props.data.label}</div>
      </HStack>
      <Tooltip label={props.data.value}>
        {abbreviateAddress(props.data.value)}
      </Tooltip>
    </HStack>
  </components.Option>
)

interface AssetSelectProps {
  value: string
  onChange: (value: Address) => void
  list: Asset[]
}

const AssetSelect: React.FC<AssetSelectProps> = ({ value, onChange, list }) => (
  <Select
    value={
      (list.find((item) => item.value === value) ?? list[0]) as PropsValue<Item>
    }
    options={list}
    onChange={(selected: any) => {
      onChange(selected?.value)
    }}
    components={{
      Option,
      SingleValue
    }}
  />
)

export default AssetSelect
