import React, { ReactNode, useCallback, useState } from 'react'
import Dialog from 'src/components/Dialog'
import { View, Text, Block } from '@tarojs/components'

import './index.less'

interface IProps {
  label: string
  labelTips?: string | ReactNode
  labelWidth?: number
  children: React.ReactElement
  renderRightBlock?: any
  vertical?: boolean
  hideBorderBottom?: boolean
}

export default (props: IProps) => {
  const [isShowDialog, setIsShowDialog] = useState(false)
  const onShowTips = useCallback(() => {
    console.log('onShowTips')
    setIsShowDialog(true)
  }, [])
  const onCloseDialog = useCallback(() => {
    console.log('onCloseDialog')
    setIsShowDialog(false)
  }, [])
  return (
    <Block>
      <View
        className={`form-item-component ${!!props.vertical ? 'vertical' : ''}`}
      >
        <View
          className={`form-item-inner ${
            !!props.hideBorderBottom ? '' : 'border-bottom'
          } `}
        >
          {props.labelWidth ? (
            <View
              className="left"
              style={{
                width: `${props.labelWidth}px`
              }}
            >
              {props.label}
              {props.labelTips ? (
                <View
                  className="iconfont icon-tishi-empty"
                  onClick={onShowTips}
                />
              ) : null}
            </View>
          ) : (
            <View className="left">
              {props.label}
              {props.labelTips ? (
                <View
                  className="iconfont icon-tishi-empty"
                  onClick={onShowTips}
                />
              ) : null}
            </View>
          )}

          <View className="center">{props.children}</View>
          {props.renderRightBlock ? (
            <View className="right">{props.renderRightBlock}</View>
          ) : null}
        </View>
      </View>
      {props.labelTips ? (
        typeof props.labelTips === 'string' ? (
          <Dialog
            visible={isShowDialog}
            content={props.labelTips}
            confirmText="我知道了"
            onConfirm={onCloseDialog}
          />
        ) : (
          <Dialog
            visible={isShowDialog}
            confirmText="我知道了"
            onConfirm={onCloseDialog}
          >
            {props.labelTips}
          </Dialog>
        )
      ) : null}
    </Block>
  )
}
