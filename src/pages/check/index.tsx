import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro from '@tarojs/taro'
import { View, Image, Block } from '@tarojs/components'
import { UnitMap } from 'src/constants/config'

import Add from 'src/components/Add'
import Empty from 'src/components/Empty'
import CheckModal from 'src/components/CheckModal'
import CheckItem from 'src/components/CheckItem'

import { formatDate } from 'src/utils'
import manualEvent from 'src/utils/manualEvent'

import { getPlanByDate, check } from 'src/utils/request2.0'

import './index.less'

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
class Check extends Component<IProps, IState> {
  lock = false
  state = {
    loading: true,
    isShowModal: false,
    plans: [],
    checkItem: {} as PlanType
  }
  async componentDidMount() {
    this.getCheckList(true)
    manualEvent.register('check-page').on('update check list', () => {
      this.getCheckList()
      manualEvent.clear('check-page')
    })
  }

  componentDidShow() {
    manualEvent.run('check-page')
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
    let { code, plans = [] } = await getPlanByDate({
      date: formatDate(new Date(), 'yyyy/MM/dd')
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
  }
  gotoAddPlan = () => {
    Taro.navigateTo({
      url: '/pages/plan-add/index'
    })
  }
  gotoCheckMakeupPage = () => {
    Taro.navigateTo({
      url: `/pages/check-makeup/index?from=check`
    })
  }
  render() {
    return this.state.loading ? null : (
      <Block>
        <View className="check-page">
          {/* 没有计划的时候，会有一个“去创建计划，就不加add了” */}
          {this.state.plans.length ? <Add onClick={this.gotoAddPlan} /> : null}
          {!this.state.plans.length ? (
            <Empty tip="今天还没有打卡计划哦~">
              <View onClick={this.gotoAddPlan} className="add-plan">
                <View>去创建计划</View>
                <View className="iconfont icon-right-arrow" />
              </View>
            </Empty>
          ) : (
            this.state.plans.map((p: PlanType) => (
              <CheckItem key={p.planID} onClick={this.onCheck} plan={p} />
            ))
          )}
          <View className="holder" />
          <View className="go-check" onClick={this.gotoCheckMakeupPage}>
            <View>忘记打卡了？</View>
            <View className="link">去补打卡</View>
            <View className="iconfont icon-right-arrow" />
          </View>
        </View>
        <CheckModal
          submitBtnText="打卡！打！耶！Keep Going!"
          isShow={this.state.isShowModal}
          onClose={this.onCloseModal}
          onSubmit={this.onSubmitCheck}
          plan={this.state.checkItem}
        />
      </Block>
    )
  }
}

export default Check
