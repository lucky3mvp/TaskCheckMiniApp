import React, { useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { UnitMap } from 'src/constants/config'

import './index.less'

export default (props: CheckListItemType) => {
  const [isShowComment, setIsShowComment] = useState(false)
  const onClickComment = () => {
    setIsShowComment(!isShowComment)
  }
  return (
    <View className="check-list-item-component">
      <View className="inner border-bottom">
        <View
          className={`plan-icon iconfont icon-${props.icon} ${props.theme}-color`}
        />
        <View className="info">
          <View className="detail-item">
            <View className="name">{props.name}</View>
            <View className="achieve">
              {props.achieve} {UnitMap[props.unit]}
            </View>
          </View>
          <View className="detail-item">
            <View className="time">
              {props.actualCheckTime
                ? `${props.actualCheckTime} 补打卡`
                : props.checkTime}
            </View>
            {props.comment ? (
              <View className="check-comment" onClick={onClickComment}>
                查看打卡心情
              </View>
            ) : null}
          </View>
          <View
            className={`detail-item comment-wrapper ${
              isShowComment ? 'show' : ''
            }`}
          >
            <View className="indicator" />
            <View className="comment">{props.comment}</View>
          </View>
        </View>
      </View>
    </View>
  )
}
