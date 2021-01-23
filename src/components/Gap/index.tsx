import React from 'react'
import { View } from '@tarojs/components'
import './index.less'

interface IProps {
  height: number
  bkg?: string
}

export default (props: IProps) => (
  <View
    className="gap-component"
    style={{
      height: `${props.height || 10}px`,
      background: `${props.bkg || '#ffffff'}`
    }}
  ></View>
)
