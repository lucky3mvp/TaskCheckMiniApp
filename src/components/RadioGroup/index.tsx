import React from 'react'
import { useSelector } from 'react-redux'
import { View, Block } from '@tarojs/components'
import './index.less'

interface IProps {
  value: any
  options: CommonItemType[]
  mode: 'fixedPadding' | 'fixedWidth'
  fixedPadding?: number
  fixedWidth?: number
  onChange: (o: CommonItemType) => void
}

export default (props: IProps) => {
  const windowWidth = useSelector(
    (state: GlobalStateType) => state.helper.windowWidth
  )
  const len = props.options.length
  return (
    <View className={`radio-button-component`}>
      {props.options.map((o, i) => (
        <Block>
          <View
            className={`radio-item ${
              props.value === o.value ? 'checked' : ''
            } ${i === 0 ? 'first' : ''} ${i === len - 1 ? 'last' : ''}`}
            style={
              props.mode === 'fixedWidth' && props.fixedWidth
                ? {
                    width: `${(props.fixedWidth * windowWidth) / 375}px`
                  }
                : {}
            }
            onClick={() => {
              props.onChange(o)
            }}
          >
            {o.label}
          </View>
          {i !== len - 1 && (
            <View
              className={`radio-line ${
                props.value === o.value ||
                (props.options[i + 1] &&
                  props.options[i + 1].value === props.value)
                  ? 'checked'
                  : ''
              }`}
            />
          )}
        </Block>
      ))}
    </View>
  )
}
