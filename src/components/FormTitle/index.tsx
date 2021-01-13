import React from 'react'
import { View } from '@tarojs/components'
import './index.less'

interface IProps {
  title: string
  labelIcon?: string
}

export default (props: IProps) => (
  <View className="form-title-component border-bottom">
    {props.labelIcon ? (
      <View className="label-icon">{props.labelIcon}</View>
    ) : null}
    <View className="title">{props.title}</View>
  </View>
)
