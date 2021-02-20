declare const wx
import React, { useState, useCallback, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'

import './index.less'

export default (props: ReadingListItemType) => {
  const [fold, setFold] = useState(true)
  const [cover, setCover] = useState(props.cover)
  useEffect(() => {
    wx.cloud.init()
  }, [])
  const toggleFold = useCallback(() => {
    setFold(!fold)
    // 展开的时候才展示图片，
    if (fold && props.cover && cover === props.cover) {
      wx.cloud.downloadFile({
        fileID: props.cover,
        success: res => {
          // 返回临时文件路径
          setCover(res.tempFilePath)
        },
        fail: console.error
      })
    }
  }, [fold, cover])
  return (
    <View className="finish-item-component ">
      <View className={`inner border-bottom ${fold ? 'fold' : 'unfold'}`}>
        <View className="iconfont icon-star-full" />
        <View className="info">
          <View className="main">
            <View className="time">{props.formatFinishTime}</View>
            <View className="name">《{props.name}》</View>
            {/* <View className="iconfont icon-gou" /> */}
          </View>
          {props.createTime !== props.finishTime ? (
            <View className="sub">
              <View className="process">
                <View className="line-vertical" />
                <View className="process-item">
                  <View className="line-horizontal" />
                  <View className="time">{props.formatCreateTime}</View>
                  <View className="txt">添加书籍</View>
                </View>
                {props.beginTime ? (
                  <View className="process-item">
                    <View className="line-horizontal" />
                    <View className="time">{props.formatBeginTime}</View>
                    <View className="txt">开始阅读</View>
                  </View>
                ) : null}
              </View>
              <View className="arrow-wrapper" onClick={toggleFold}>
                <View className="iconfont icon-right-arrow " />
              </View>
            </View>
          ) : null}
        </View>
        {props.cover ? (
          <Image src={cover} className="cover" mode="widthFix" />
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
