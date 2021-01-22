import React, { ReactNode, useCallback } from 'react'
import { View } from '@tarojs/components'
import './index.less'

type IProps = {
  visible: boolean
  transparent?: boolean
  maskCloseable?: boolean
  children?: ReactNode
  onClose?: () => void
}

export default (props: IProps) => {
  const onMaskClose = useCallback(() => {
    if (!props.maskCloseable) return
    props.onClose && props.onClose()
  }, [props.maskCloseable])
  return (
    <View className={`modal-component ${props.visible ? '' : 'hide'}`}>
      <View
        className={`mask ${props.transparent ? 'transparent' : ''}`}
        catchMove
        onClick={onMaskClose}
      />
      {props.children}
    </View>
  )
}
