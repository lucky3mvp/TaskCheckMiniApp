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
  date: string
  isShowModal: boolean
  plans: Array<CheckPlanType>
  checkItem: CheckPlanType
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect()
class CheckMakeup extends Component<IProps, IState> {
  lock = false
  state = {
    date: getCurrentInstance().router!.params.date || '',
    loading: true,
    isShowModal: false,
    plans: [],
    checkItem: {} as CheckPlanType
  }
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
    if (!this.state.date) return
    showLoading &&
      Taro.showLoading({
        title: '加载中...'
      })
    const { code, plans = [] } = await getPlanByDate({
      date: this.state.date
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
    this.getCheckList(false)
    this.onCloseModal()
  }
  render() {
    return this.state.loading ? null : (
      <Block>
        <View className="check-makeup-page">
          {this.state.plans.map((p: CheckPlanType) => (
            <CheckItem key={p.planID} onClick={this.onCheck} plan={p} />
          ))}
        </View>
        <CheckModal
          isMakeUp
          date={this.state.date}
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
