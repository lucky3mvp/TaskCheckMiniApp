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
  plans: Array<CheckPlanType>
  checkItem: CheckPlanType
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect()
class Check extends Component<IProps, IState> {
  lock = false
  state = {
    loading: true,
    isShowModal: false,
    plans: [],
    checkItem: {} as CheckPlanType
  }
  async componentDidMount() {
    this.getPlanList(true)
    manualEvent.register('check-page').on('update check list', () => {
      this.getPlanList()
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

  async getPlanList(showLoading = false) {
    showLoading &&
      Taro.showLoading({
        title: '加载中...'
      })
    let { code, plans = [] } = await getPlanByDate({
      date: formatDate(new Date(), 'yyyy/MM/dd')
    })
    // const code = 200
    // const plans = [
    //   {
    //     beginTime: 1609430400000,
    //     category: 1,
    //     days: '',
    //     description: '又A又飒',
    //     endTime: null,
    //     goal: 1,
    //     icon: 'badminton',
    //     name: '打球',
    //     planID: '79550af2601a7409026a6137022e9ca8',
    //     status: 0,
    //     subType: 1,
    //     theme: 'theme14',
    //     times: 1,
    //     totalAchieve: 0,
    //     totalFulfillTimes: 0,
    //     type: 3,
    //     unit: '1',
    //     userID: 'oeNr50FDlBDDRaxr3G288oM27KD8',
    //     _id: '79550af2601a7409026a6137022e9ca8'
    //   },
    //   {
    //     beginTime: 1609430400000,
    //     category: 1,
    //     days: '1,5',
    //     description: '要优雅~~',
    //     endTime: null,
    //     goal: 1,
    //     icon: 'yoga',
    //     name: '瑜伽',
    //     planID: '79550af2601a7525026aa98d1a450897',
    //     status: 1,
    //     subType: 2,
    //     theme: 'theme11',
    //     times: '',
    //     totalAchieve: 1,
    //     totalFulfillTimes: 0,
    //     type: 3,
    //     unit: '1',
    //     userID: 'oeNr50FDlBDDRaxr3G288oM27KD8',
    //     _id: '79550af2601a7525026aa98d1a450897'
    //   }
    // ]
    console.log(plans)
    if (code === 200) {
      this.setState({
        loading: false,
        plans: plans.map(
          (p: CheckPlanResType): CheckPlanType => ({
            ...p,
            days: (p.days || '').split(',')
          })
        )
      })
    }
    Taro.hideLoading()
  }

  onCheck = (p: CheckPlanType) => {
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
    this.getPlanList(false)
    this.onCloseModal()
  }
  gotoAddPlan = () => {
    Taro.navigateTo({
      url: '/pages/plan-add/index'
    })
  }
  gotoCheckMakeupPage = () => {
    Taro.navigateTo({
      url: `/pages/check-makeup/index`
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
            this.state.plans.map((p: CheckPlanType) => (
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
