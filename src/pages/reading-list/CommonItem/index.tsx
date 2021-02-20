import React, { useState, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import Radio from 'src/components/Radio'

import './index.less'
import { commonApi } from 'src/utils/request2.0'

interface IProps extends ReadingListItemType {
  onUpdate: (type: string, data: ReadingListItemType) => void
}

export default (props: IProps) => {
  const [beginStatus, setBeginStatus] = useState(false)
  const [finishStatus, setFinishStatus] = useState(false)
  const onBeginStatusChange = useCallback(() => {
    const old = beginStatus
    setBeginStatus(!old)
    Taro.showModal({
      title: '提示',
      content: `确认标记为开始阅读嘛？`,
      success: async function (res) {
        if (res.confirm) {
          Taro.showLoading({
            title: '请求中'
          })
          const { code } = await commonApi({
            _scope: 'reading',
            _type: 'update',
            id: props._id,
            oldStatus: props.status,
            status: 2
          })
          Taro.hideLoading()
          if (code === 200) {
            Taro.showToast({
              title: '更新成功'
            })
            props.onUpdate('updateBegin', props)
          }
        } else if (res.cancel) {
          setBeginStatus(old)
        }
      }
    })
  }, [beginStatus, props._id, props.status])
  const onFinishStatusChange = useCallback(() => {
    const old = finishStatus
    setFinishStatus(!old)
    Taro.showModal({
      title: '提示',
      content: `确认标记为读完嘛？`,
      success: async function (res) {
        if (res.confirm) {
          Taro.showLoading({
            title: '请求中'
          })
          const { code } = await commonApi({
            _scope: 'reading',
            _type: 'update',
            id: props._id,
            oldStatus: props.status,
            status: 3
          })
          Taro.hideLoading()
          if (code === 200) {
            Taro.showToast({
              title: '更新成功'
            })
            props.onUpdate('updateFinish', props)
          }
        } else if (res.cancel) {
          setFinishStatus(old)
        }
      }
    })
  }, [finishStatus, props._id, props.status])
  const onDelete = useCallback(() => {
    Taro.showModal({
      title: '提示',
      content: `确认删除书籍嘛？`,
      success: async function (res) {
        if (res.confirm) {
          Taro.showLoading({
            title: '请求中'
          })
          const { code } = await commonApi({
            _scope: 'reading',
            _type: 'delete',
            id: props._id
          })
          Taro.hideLoading()
          if (code === 200) {
            Taro.showToast({
              title: '删除成功'
            })
            props.onUpdate('delete', props)
          }
        }
      }
    })
  }, [props])
  return (
    <View className="common-item-component">
      <View className="inner border-bottom">
        <View
          className={`iconfont icon-${
            props.status === 1 ? 'star-empty' : 'star-half'
          }`}
        />
        <View className="info">
          <View className="main">
            {/* todo */}
            <View className="time">
              {props.status === 1
                ? props.formatCreateTime
                : props.formatBeginTime}
            </View>
            <View className="name">{props.name}</View>
          </View>
          <View className="operation">
            <View className="update">
              {props.status === 1 ? (
                <View className="radio-item first">
                  <Radio checked={beginStatus} onChange={onBeginStatusChange} />
                  <View onClick={onBeginStatusChange}>标记为在读</View>
                </View>
              ) : null}
              <View className="radio-item">
                <Radio checked={finishStatus} onChange={onFinishStatusChange} />
                <View onClick={onFinishStatusChange}>标记为读完</View>
              </View>
            </View>
            <View className="delete">
              <View className="iconfont icon-delete" onClick={onDelete} />
              <View onClick={onDelete}>删除书籍</View>
            </View>
          </View>
        </View>
        {props.cover ? (
          <Image src={props.cover} className="cover" mode="widthFix" />
        ) : (
          <Image
            src={require('../../../assets/defaultCover.png')}
            className="cover"
            mode="widthFix"
          />
        )}
      </View>
    </View>
  )
}
