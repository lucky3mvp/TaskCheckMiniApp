import React, { useMemo, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import { PlanStatusIconMap, UnitMap } from 'src/constants/config'
import { formatDate } from 'src/utils'
import './index.less'

interface IProps extends PlanListItemType {
  onEdit?: () => {}
  onRecord?: () => {}
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
  const onEdit = useCallback(() => {
    props.onEdit && props.onEdit()
  }, [])
  const onRecord = useCallback(() => {
    props.onRecord && props.onRecord()
  }, [])
  return (
    <View className="plan-list-item">
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
      {/*
        前端的status
        - 1-未开始
        - 2-进行中
        - 3-已结束
        - 4-暂停
      */}
      {props.status === 2 || props.status === 4 ? (
        <View className="mid border-bottom">
          {props.status === 2 ? (
            <View className="mid-item">
              <View>本周打卡次数</View>
              <View className={`mid-item-times ${props.theme}-color`}>
                {props.weekCheckTimes || 0}
              </View>
            </View>
          ) : null}
          {props.status === 2 ? (
            <View className="mid-item">
              <View>本月打卡次数</View>
              <View className={`mid-item-times ${props.theme}-color`}>
                {props.monthCheckTimes || 0}
              </View>
            </View>
          ) : null}
          <View className="mid-item">
            <View>累计打卡次数</View>
            <View className={`mid-item-times ${props.theme}-color`}>
              {props.totalCheckTimes || 0}
            </View>
          </View>
        </View>
      ) : null}
      {props.status === 3 ? (
        <View className="mid border-bottom">
          <View className="mid-item">
            <View>累计打卡次数</View>
            <View className={`mid-item-times ${props.theme}-color`}>
              {props.totalCheckTimes || 0}
            </View>
          </View>
          <View className="mid-item">
            <View>累计完成次数</View>
            <View className={`mid-item-times ${props.theme}-color`}>
              {props.totalFulfillTimes || 0}
            </View>
          </View>
        </View>
      ) : null}
      <View className="btm">
        <View className="left">
          <View className="btm-item">
            目标：{props.goal}
            {UnitMap[props.unit]}
          </View>
          <View className="btm-item">
            时间：{beginTime} - {endTime}
          </View>
        </View>
        {props.status === 1 || props.status === 2 ? (
          <View className="iconfont icon-edit" onClick={onEdit} />
        ) : null}
        {props.status === 2 || props.status === 3 ? (
          <View className="iconfont icon-daka" onClick={onRecord} />
        ) : null}
      </View>
    </View>
  )
}
