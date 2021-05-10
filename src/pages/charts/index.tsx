import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import { UnitMap } from 'src/constants/config'

import Add from 'src/components/Add'
import Empty from 'src/components/Empty'
import Modal from 'src/components/Modal'
import SelfInput from 'src/components/SelfInput'

import { formatDate } from 'src/utils'
import manualEvent from 'src/utils/manualEvent'

import { getPlanByDate, check } from 'src/utils/request2.0'

import './index.less'

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {}

type IState = {
  from: string
  planID: string
  loading: boolean
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect()
class Charts extends Component<IProps, IState> {
  state = {
    from: getCurrentInstance().router!.params.from || '', // my 入口，打卡记录入口，plan 入口
    planID: getCurrentInstance().router!.params.planID || '',
    loading: true
  }
  async componentDidMount() {
    if (this.state.from === 'plan-list') {
    } else if (this.state.from === 'my' || this.state.from === 'check-list') {
    }
  }

  componentDidShow() {}

  // onShareAppMessage() {
  //   return {
  //     title: '排骨打卡',
  //     path: '/pages/check/index'
  //   }
  // }

  render() {
    return this.state.loading ? null : this.state.planID ? (
      <View className="charts-page single-plan">某个计划的统计</View>
    ) : (
      <View className="charts-page all-plan">所有计划的统计</View>
    )
  }
}

export default Charts
