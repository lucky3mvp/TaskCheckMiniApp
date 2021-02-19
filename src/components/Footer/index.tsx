import React from 'react'
import { useSelector } from 'react-redux'
import { View } from '@tarojs/components'
import './index.less'

interface IProps {
  text: string
  theme?: string
  disable?: boolean
  onClick: () => void
}

export default (props: IProps) => {
  const isIpx = useSelector((state: GlobalStateType) => state.helper.isIpx)
  return (
    <View className={`footer-component ${isIpx ? 'ipx' : ''}`}>
      <View className="holder">
        <View className="btn-wrapper"></View>
        <View className="gap"></View>
      </View>
      <View className="fixed">
        <View className="btn-wrapper">
          <View
            className={`btn ${props.theme || 'main'}-background ${
              props.disable ? 'disable' : ''
            }`}
            onClick={props.onClick}
          >
            {props.text}
          </View>
        </View>
        <View className="gap"></View>
      </View>
    </View>
  )
}
