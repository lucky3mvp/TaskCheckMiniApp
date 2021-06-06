import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, Image, Block } from '@tarojs/components'

import CheckModal from 'src/components/CheckModal'
import CheckItem from 'src/components/CheckItem'

import { getPlanByDate } from 'src/utils/request2.0'

import './index.less'
import manualEvent from 'src/utils/manualEvent'

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {}

type IState = {
  loading: boolean
  isShowModal: boolean
  plans: Array<PlanType>
  checkItem: PlanType
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect()
class CheckMakeup extends Component<IProps, IState> {
  lock = false
  state = {
    loading: true,
    isShowModal: false,
    plans: [],
    checkItem: {} as PlanType
  }
  date = getCurrentInstance().router!.params.date
  async componentDidMount() {
    this.getCheckList(true)
  }

  // onShareAppMessage() {
  //   return {
  //     title: '排骨打卡',
  //     path: '/pages/check/index'
  //   }
  // }

  async getCheckList(showLoading = false) {
    showLoading &&
      Taro.showLoading({
        title: '加载中...'
      })
    const { code, plans = [] } = await getPlanByDate({
      date: this.date
    })
    console.log(plans)
    if (code === 200) {
      this.setState({
        loading: false,
        plans: plans.map(p => ({
          ...p,
          days: (p.days || '').split(',')
        }))
      })
    }
    Taro.hideLoading()
  }

  onCheck = (p: PlanType) => {
    // if (p.status === 1 || p.totalAchieve > p.goal || p.totalTimes > p.times)
    if (p.status === 1 || p.totalAchieve > p.goal) return // 已完成返回

    this.setState({
      checkItem: p,
      isShowModal: true
    })
  }

  onCloseModal = () => {
    this.setState({
      isShowModal: false
    })
  }

  onSubmitCheck = async () => {
    this.getCheckList(false)
    this.onCloseModal()

    if (getCurrentInstance().router!.params.from === 'check-list') {
      manualEvent.change('check-list', 'update current day check list')
    }
  }
  render() {
    return this.state.loading ? null : (
      <Block>
        <View className="check-makeup-page">
          {this.state.plans.map((p: PlanType) => (
            <CheckItem key={p.planID} onClick={this.onCheck} plan={p} />
          ))}
        </View>
        <CheckModal
          submitBtnText="补打卡！Keep Going!"
          isShow={this.state.isShowModal}
          onClose={this.onCloseModal}
          onSubmit={this.onSubmitCheck}
          plan={this.state.checkItem}
        />
      </Block>
    )
  }
}

export default CheckMakeup
