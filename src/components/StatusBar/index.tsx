import React from 'react'
import { useSelector } from 'react-redux'
import { View } from '@tarojs/components'
import './index.less'

export default () => {
  const statusBarHeight = useSelector(
    (state: GlobalStateType) => state.helper.statusBarHeight
  )
  console.log('statusBarHeight: ', statusBarHeight)
  return (
    <View
      className="status-bar-component"
      style={{
        paddingTop: `${statusBarHeight}px`
      }}
    />
  )
}
