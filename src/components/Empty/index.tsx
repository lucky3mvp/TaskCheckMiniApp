import React from 'react'
import { View, Text } from '@tarojs/components'
import './index.less'

interface IProps {
  tip?: string
  children?: any
}

export default (props: IProps) => {
  return (
    <View className="empty-component">
      {props.children}
      <Text className="empty-text">{props.tip || '暂无数据'}</Text>
    </View>
  )
}
