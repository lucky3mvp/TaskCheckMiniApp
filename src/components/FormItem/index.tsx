import React from 'react'
import { View, Text, Image } from '@tarojs/components'

import './index.less'

interface IProps {
  label: string
  children: React.ReactElement
  renderRightBlock?: any
  vertical?: boolean
  hideBorderBottom?: boolean
}

export default (props: IProps) => {
  return (
    <View
      className={`form-item-component ${!!props.vertical ? 'vertical' : ''}`}
    >
      <View
        className={`form-item-inner ${
          !!props.hideBorderBottom ? '' : 'border-bottom'
        } `}
      >
        <View className="left">{props.label}</View>
        <View className="center">{props.children}</View>
        {props.renderRightBlock ? (
          <View className="right">{props.renderRightBlock}</View>
        ) : null}
      </View>
    </View>
  )
}
