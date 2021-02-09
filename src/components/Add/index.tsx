import React, { useCallback } from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'

import './index.less'

export default () => {
  const onAdd = useCallback(() => {
    Taro.navigateTo({
      url: '/pages/plan-add/index'
    })
  }, [])

  return <View className="iconfont icon-add add-component" onClick={onAdd} />
}
