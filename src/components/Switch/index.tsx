import React, { useCallback } from 'react'
import { View } from '@tarojs/components'
import './index.less'

interface IProps {
  checked: boolean
  theme?: string
  onChange: (...any) => void
}

export default (props: IProps) => {
  const onClick = useCallback(() => {
    props.onChange && props.onChange(!props.checked)
  }, [props.checked])

  return (
    <View
      className={`switch-component ${
        props.checked && !props.theme
          ? 'checked bg-default'
          : props.checked
          ? 'checked'
          : 'bg-gray'
      } ${props.theme}-background`}
      onClick={onClick}
    >
      <View className="fake-bkg" />
      <View className="node"></View>
    </View>
  )
}
