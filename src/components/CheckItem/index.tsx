import React from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { UnitMap } from 'src/constants/config'

import './index.less'

interface IProps {
  plan: PlanType
  onClick: (p: PlanType) => void
}

export default (props: IProps) => {
  const onClick = () => {
    props.onClick(props.plan)
  }

  return (
    <View
      className="check-plan-item-component"
      key={props.plan.planID}
      onClick={onClick}
    >
      <View className={`bkg bkg-full ${props.plan.theme}-background`} />
      <View
        className={`bkg bkg-progress ${props.plan.theme}-background`}
        style={{
          width: `${
            props.plan.totalAchieve === 0
              ? '0px'
              : props.plan.totalAchieve >= props.plan.goal
              ? '100%'
              : `${(props.plan.totalAchieve / props.plan.goal) * 100}%`
          }`
        }}
      />
      <View className="cnt">
        <View className="left">
          <View className={`iconfont icon-${props.plan.icon}`} />
          <View>{props.plan.name}</View>
          {/* 这类计划允许完成后继续打卡的，所以 */}
          {props.plan.totalFulfillTimes >= props.plan.times &&
            (props.plan.type === 4 ||
              (props.plan.type === 3 && props.plan.subType === 1)) && (
              <Image
                className="price"
                src={require('../../assets/jiangli.png')}
              />
            )}
        </View>
        <View className="right">
          {props.plan.status === 1 ? (
            <View className="iconfont icon-gou" />
          ) : (
            <View>
              {props.plan.totalAchieve}/{props.plan.goal}{' '}
              {UnitMap[props.plan.unit]}
            </View>
          )}
          <View className="dot-wrapper">
            {(props.plan.type === 4 ||
              (props.plan.type === 3 && props.plan.subType === 1)) &&
              Array(
                props.plan.times > props.plan.totalFulfillTimes
                  ? props.plan.times
                  : props.plan.totalFulfillTimes
              )
                .fill('1')
                .map((i, j) => (
                  <View
                    className={`dot ${
                      props.plan.totalFulfillTimes > j ? 'active' : ''
                    }`}
                  />
                ))}
          </View>
        </View>
      </View>
    </View>
  )
}
