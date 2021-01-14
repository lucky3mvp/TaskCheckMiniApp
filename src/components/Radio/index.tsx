import React from 'react'
import { View } from '@tarojs/components'
import './index.less'

interface IProps {
  checked: boolean
  theme: string
  onChange: () => void
}

export default (props: IProps) => (
  <View
    className={`radio-component ${props.checked ? 'checked' : ''} ${
      props.theme
    }-border-color`}
  >
    {props.checked ? (
      <View className={`radio-inner ${props.theme}-background`} />
    ) : null}
  </View>
)
