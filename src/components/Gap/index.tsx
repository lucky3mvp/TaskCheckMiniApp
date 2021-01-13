import React from 'react'
import { View } from '@tarojs/components'
import './index.less'

interface IProps {
  height: number
}

export default (props: IProps) => (
  <View
    className="gap-component"
    style={{
      height: `${props.height || 10}px`
    }}
  ></View>
)
