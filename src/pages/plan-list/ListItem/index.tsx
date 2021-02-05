import React, { useMemo, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import { PlanStatusIconMap, UnitMap } from 'src/constants/config'
import { formatDate } from 'src/utils'
import './index.less'

interface IProps extends PlanType {
  onClick?: () => {}
}

export default (props: IProps) => {
  const beginTime = useMemo(() => {
    if (props.beginTime) {
      return formatDate(new Date(props.beginTime), 'yyyy.MM.dd')
    }
    return ''
  }, [props.beginTime])
  const endTime = useMemo(() => {
    if (props.endTime) {
      return formatDate(new Date(props.endTime), 'yyyy.MM.dd')
    }
    return '永远'
  }, [props.endTime])
  const onClick = useCallback(() => {
    props.onClick && props.onClick()
  }, [])
  return (
    <View className="plan-list-item" onClick={onClick}>
      <View className="top border-bottom">
        <View
          className={`plan-icon iconfont icon-${props.icon} ${props.theme}-color`}
        />
        <View className="top-mid">
          <View className="name">{props.name}</View>
          <View className="description">{props.description}</View>
        </View>
        <View
          className={`status-icon iconfont icon-${
            PlanStatusIconMap[props.status]
          } ${props.theme}-color`}
        />
      </View>
      {props.status === 2 || props.status === 4 ? (
        <View className="mid border-bottom">
          {props.status === 2 ? (
            <View className="mid-item">
              <View>本周打卡次数</View>
              <View className={`mid-item-times ${props.theme}-color`}>
                {props.weekTimes || 0}
              </View>
            </View>
          ) : null}
          {props.status === 2 ? (
            <View className="mid-item">
              <View>本月打卡次数</View>
              <View className={`mid-item-times ${props.theme}-color`}>
                {props.monthTimes || 0}
              </View>
            </View>
          ) : null}
          <View className="mid-item">
            <View>累计打卡次数</View>
            <View className={`mid-item-times ${props.theme}-color`}>
              {props.totalTimes || 0}
            </View>
          </View>
        </View>
      ) : null}
      {props.status === 3 ? (
        <View className="mid border-bottom">
          <View className="mid-item-horizon">
            <View>累计打卡次数</View>
            <View className={`num ${props.theme}-color`}>
              {props.totalTimes || 0}
            </View>
          </View>
        </View>
      ) : null}
      <View className="btm">
        <View>
          <View className="btm-item">
            目标：{props.goal}
            {UnitMap[props.unit]}
          </View>
          <View className="btm-item">
            时间：{beginTime} - {endTime}
          </View>
        </View>
      </View>
    </View>
  )
}
