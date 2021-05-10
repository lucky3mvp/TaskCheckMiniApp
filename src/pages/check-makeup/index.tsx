import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import { UnitMap } from 'src/constants/config'

import Modal from 'src/components/Modal'
import SelfInput from 'src/components/SelfInput'

import { getPlanByDate, check } from 'src/utils/request2.0'

import './index.less'
import manualEvent from 'src/utils/manualEvent'

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {}

type IState = {
  loading: boolean
  stage: number
  achieve: string
  comment: string
  plans: Array<PlanType>
  checkItem: PlanType
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect()
class CheckMakeup extends Component<IProps, IState> {
  lock = false
  state = {
    loading: true,
    stage: 0,
    achieve: '',
    comment: '',
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
    if (p.status === 1 || p.totalAchieve > p.goal || p.totalTimes > p.times)
      return // 已完成返回
    this.onShowModal(p)
  }

  onShowModal = (p: PlanType) => {
    this.setState(
      {
        checkItem: p,
        stage: 1
      },
      () => {
        setTimeout(() => {
          this.setState({
            stage: 2
          })
        }, 100)
      }
    )
  }
  onCloseModal = () => {
    this.setState(
      {
        stage: 1,
        achieve: '',
        comment: '',
        checkItem: {} as PlanType
      },
      () => {
        setTimeout(() => {
          this.setState({
            stage: 0
          })
        }, 100)
      }
    )
  }
  onAchieveChange = (achieve: string) => {
    this.setState({
      achieve
    })
  }
  onCommentChange = (comment: string) => {
    this.setState({
      comment
    })
  }
  onSubmitCheck = async () => {
    if (!this.state.achieve) return
    if (this.lock) return
    this.lock = true
    Taro.showLoading({
      title: '请求中'
    })
    const { code, msg } = await check({
      date: this.date,
      achieve: +this.state.achieve,
      comment: this.state.comment,
      planID: this.state.checkItem.planID,
      isReCheck: true
    })
    if (code === 200) {
      this.onCloseModal()
      Taro.showToast({
        title: '补打卡成功啦~'
      })
      manualEvent.change('check-list', 'update current day check list')
      setTimeout(() => {
        this.getCheckList(false)
      }, 1500)
    } else if (code === 401) {
      Taro.showToast({
        title: msg
      })
      this.getCheckList(false)
    } else {
      Taro.showToast({
        title: '出错了，一会再试吧',
        icon: 'none'
      })
    }
    this.lock = false
    Taro.hideLoading()
  }
  render() {
    return this.state.loading ? null : (
      <View>
        <View className="check-page">
          {this.state.plans.map((p: PlanType) => (
            <View
              className="check-plan-item"
              key={p.planID}
              onClick={this.onCheck.bind(this, p)}
            >
              <View className={`bkg bkg-full ${p.theme}-background`} />
              <View
                className={`bkg bkg-progress ${p.theme}-background`}
                style={{
                  width: `${
                    p.totalAchieve === 0
                      ? '0px'
                      : p.totalAchieve >= p.goal
                      ? '100%'
                      : `${(p.totalAchieve / p.goal) * 100}%`
                  }`
                }}
              />
              <View className="cnt">
                <View className="left">
                  <View className={`iconfont icon-${p.icon}`} />
                  <View>{p.name}</View>
                  {/* 这类计划允许完成后继续打卡的，所以 */}
                  {p.totalTimes >= p.times &&
                    (p.type === 4 || (p.type === 3 && p.subType === 1)) && (
                      <Image
                        className="price"
                        src={require('../../assets/jiangli.png')}
                      />
                    )}
                </View>
                <View className="right">
                  {p.status === 1 ? (
                    <View className="iconfont icon-gou" />
                  ) : (
                    <View>
                      {p.totalAchieve}/{p.goal} {UnitMap[p.unit]}
                    </View>
                  )}
                  <View className="dot-wrapper">
                    {(p.type === 4 || (p.type === 3 && p.subType === 1)) &&
                      Array(p.times > p.totalTimes ? p.times : p.totalTimes)
                        .fill('1')
                        .map((i, j) => (
                          <View
                            className={`dot ${
                              p.totalTimes > j ? 'active' : ''
                            }`}
                          />
                        ))}
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
        <Modal
          maskCloseable
          visible={this.state.stage > 0}
          onClose={this.onCloseModal}
        >
          <View
            className={`check-page-check-module ${
              this.state.stage > 1 ? 'show' : 'hide'
            }`}
          >
            <View className="achieve-item border-bottom">
              <SelfInput
                type="number"
                placeholder={`打卡成绩，当前已完成：${this.state.checkItem.totalAchieve}/${this.state.checkItem.goal}`}
                maxlength={10}
                value={this.state.achieve}
                onBlur={this.onAchieveChange}
                onInput={this.onAchieveChange}
              />
              <View className="unit">{UnitMap[this.state.checkItem.unit]}</View>
            </View>
            <View className="border-bottom">
              <SelfInput
                type="text"
                placeholder="留下此刻的心情吧~"
                value={this.state.comment}
                onBlur={this.onCommentChange}
                onInput={this.onCommentChange}
              />
            </View>
            <View
              className={`check-btn ${!!this.state.achieve ? '' : 'disable'} ${
                this.state.checkItem.theme
              }-background`}
              onClick={this.onSubmitCheck}
            >
              补打卡！Keep Going!
            </View>
          </View>
        </Modal>
      </View>
    )
  }
}

export default CheckMakeup
