import React, { useCallback, useState, useEffect } from 'react'
import { View } from '@tarojs/components'
import './index.less'

type IProps = {
  visible: boolean
  transparent?: boolean
  maskCloseable?: boolean
  children?: any
  onClose?: () => void
}

export default (props: IProps) => {
  const [status, setStatus] = useState(0)
  const onMaskClose = useCallback(() => {
    if (!props.maskCloseable) return
    props.onClose && props.onClose()
  }, [props.maskCloseable])
  useEffect(() => {
    if (props.visible) {
      setStatus(1)
      setTimeout(() => {
        setStatus(2)
      }, 100)
    } else {
      setStatus(1)
      setTimeout(() => {
        setStatus(0)
      }, 300)
    }
    return () => {}
  }, [props.visible])
  return (
    <View className={`modal-component ${status > 0 ? '' : 'hide'}`}>
      <View
        className={`mask ${props.transparent ? 'transparent' : ''} ${
          status > 1 ? 'fade-in' : ''
        }`}
        catchMove
        onClick={onMaskClose}
      />
      {props.children}
    </View>
  )
}
