import React, { useCallback } from 'react'
import { View } from '@tarojs/components'

import './index.less'

interface IProps {
  onClick: () => void
}

export default (props: IProps) => {
  const onAdd = useCallback(() => {
    props.onClick()
  }, [props.onClick])

  return <View className="iconfont icon-add add-component" onClick={onAdd} />
}
