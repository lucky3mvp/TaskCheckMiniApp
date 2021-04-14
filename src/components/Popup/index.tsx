import React, { useCallback, useState, useEffect } from 'react'
import { View } from '@tarojs/components'
import './index.less'

type IProps = {
  title?: string
  visible: boolean
  hideCloseIcon?: boolean
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
  const onClose = useCallback(() => {
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
    <View className={`popup-component ${status > 0 ? '' : 'hide'}`}>
      <View
        className={`mask ${props.transparent ? 'transparent' : ''} ${
          status > 1 ? 'fade-in' : ''
        }`}
        catchMove
        onClick={onMaskClose}
      />
      <View className={`content ${status > 1 ? 'slide-up' : ''}`}>
        {!props.hideCloseIcon ? (
          <View className="close" onClick={onClose}>
            <View className="iconfont icon-close" />
          </View>
        ) : null}
        {props.title ? <View className="title">{props.title}</View> : null}
        {props.children}
      </View>
    </View>
  )
}
