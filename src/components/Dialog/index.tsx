import React, { useCallback, useState, useEffect, ReactNode } from 'react'
import { View } from '@tarojs/components'
import Modal from '../Modal'
import './index.less'

/**
 * 受控的组件，由外部visible控制，只不过因为组件内需要有动画，才自己维护了一个显示隐藏的状态
 */
type IProps = {
  visible: boolean
  title?: string
  content?: string
  children?: ReactNode
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  maskCloseable?: boolean
  onClickMask?: () => void
  onConfirm?: () => void
  onCancel?: () => void
}

export default (props: IProps) => {
  const [stage, setStage] = useState(0)
  const onShowModal = useCallback(() => {
    setStage(1)
    setTimeout(() => {
      setStage(2)
    }, 100)
  }, [])
  const onCloseModal = useCallback(() => {
    if (stage !== 2) return
    setStage(1)
    setTimeout(() => {
      setStage(0)
    }, 100)
  }, [stage])
  useEffect(() => {
    if (props.visible) {
      onShowModal()
    } else {
      onCloseModal()
    }
    return () => {}
  }, [props.visible])
  const onCancel = useCallback(() => {
    props.onCancel && props.onCancel()
  }, [stage])
  const onConfirm = useCallback(() => {
    props.onConfirm && props.onConfirm()
  }, [])
  const onClickMask = useCallback(() => {
    if (props.maskCloseable) {
      props.onClickMask && props.onClickMask()
    }
  }, [props.maskCloseable])
  return (
    <Modal
      maskCloseable={props.maskCloseable}
      visible={stage > 0}
      onClose={onClickMask}
    >
      <View className={`dialog-component ${stage > 1 ? 'show' : 'hide'}`}>
        {props.title ? <View className="title">{props.title}</View> : null}
        <View className="content border-bottom">
          {props.content || props.children}
        </View>
        <View className="btns">
          {props.showCancel ? (
            <View className="btn cancel border-right" onClick={onCancel}>
              {props.cancelText || '取消'}
            </View>
          ) : null}
          <View className="btn confirm" onClick={onConfirm}>
            {props.confirmText || '确定'}
          </View>
        </View>
      </View>
    </Modal>
  )
}
