import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Button, Text, Image } from '@tarojs/components'
import { UnitEngMap } from 'src/constants/config'

import wit from 'src/utils/wit'
import { formatDate } from 'src/utils'

import { updateUserInfo } from 'src/store/actions/userInfo'

import { getPlanByDate } from 'src/utils/request'

import './index.less'

type PageStateProps = {
  userInfo: UserInfoStoreType
}

type PageDispatchProps = {
  updateUserInfo: (_) => void
}

type PageOwnProps = {}

type PageState = {
  plans: Array<PlanType>
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Check {
  props: IProps
}

@connect(
  ({ userInfo }) => ({
    userInfo
  }),
  dispatch => ({
    updateUserInfo(userInfo) {
      dispatch(updateUserInfo(userInfo))
    }
  })
)
class Check extends Component {
  state = {
    plans: []
  }
  async componentDidMount() {
    if (!this.props.userInfo.isLogin) {
      const [res] = await wit.login()
      const [userInfoRes] = await wit.getUserInfo()
      if (userInfoRes) {
        this.props.updateUserInfo({
          ...(res ? res : {}),
          ...userInfoRes
        })
      }
    }
    const { code, plans = [] } = await getPlanByDate({
      date: formatDate(new Date(), 'yyyy/MM/dd')
    })
    if (code === 200) {
      console.log(plans)
      this.setState({
        plans: plans.map(p => ({
          ...p,
          days: (p.days || '').split(',')
        }))
      })
    }
  }
  render() {
    return (
      <View className="check-page">
        {this.state.plans.map((p: PlanType) => (
          <View className="check-plan-item" key={p.planID}>
            <View className={`bkg bkg-full ${p.theme}-background`}></View>
            <View className={`bkg bkg-progress ${p.theme}-background`}></View>
            <View className="cnt">
              <View className="left">
                <View className={`iconfont icon-${p.icon}`} />
                <View>{p.name}</View>
              </View>
              <View className="right">
                <View>
                  {p.achieve}/{p.goal} {UnitEngMap[p.unit]}
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    )
  }
}

export default Check
