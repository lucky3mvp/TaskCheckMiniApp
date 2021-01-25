import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import './index.less'

interface IProps {
  tip?: string
  children?: any
}

export default (props: IProps) => {
  return (
    <View className="empty-component">
      <Image src={require('../../assets/empty.png')} className="img" />
      {props.tip ? <Text className="empty-text">{props.tip}</Text> : null}
      {props.children}
    </View>
  )
}
