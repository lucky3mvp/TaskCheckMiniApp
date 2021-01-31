import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { UnitMap } from 'src/constants/config'

import Empty from 'src/components/Empty'
import Modal from 'src/components/Modal'
import SelfInput from 'src/components/SelfInput'

import wit from 'src/utils/wit'
import { formatDate } from 'src/utils'

import { updateUserInfo } from 'src/store/actions/userInfo'

import { getPlanByDate, check } from 'src/utils/request'

import './index.less'

type PageStateProps = {
  userInfo: UserInfoStoreType
}

type PageDispatchProps = {
  updateUserInfo: (_) => void
}

type PageOwnProps = {}

type PageState = {
  loading: boolean
  stage: number
  achieve: string
  comment: string
  plans: Array<PlanType>
  checkItem: PlanType
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
class Check extends Component<IProps, PageState> {
  inited = false
  state = {
    loading: true,
    stage: 0,
    achieve: '',
    comment: '',
    plans: [],
    checkItem: {} as PlanType
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
    await this.getPlans()
    // this.setState({
    //   plans: [
    //     {
    //       planID: '60090712f9777f003c2fe9d1',
    //       name: '每月跑3次计划一次6km',
    //       description: '每月跑3次计划',
    //       theme: 'theme11',
    //       icon: 'running',
    //       category: 1,
    //       unit: '4',
    //       goal: 6,
    //       type: 4,
    //       subType: 1,
    //       times: 30,
    //       days: ['0'],
    //       beginTime: '2021-01-21T00:00:00.000Z',
    //       endTime: '2021-01-21T00:00:00.000Z',
    //       totalTimes: 1,
    //       totalAchieve: 0,
    //       status: 0
    //     }
    //   ]
    // })
    setTimeout(() => {
      this.inited = true
    }, 1000)
  }

  componentDidShow() {
    if (this.inited) {
      this.getPlans(this.inited)
    }
  }

  async getPlans(inited) {
    !inited &&
      Taro.showLoading({
        title: '加载中...'
      })
    const { code, plans = [] } = await getPlanByDate({
      date: formatDate(new Date(), 'yyyy/MM/dd')
    })
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
    const { code } = await check({
      date: formatDate(new Date(), 'yyyy/MM/dd'),
      achieve: +this.state.achieve,
      comment: this.state.comment,
      planID: this.state.checkItem.planID
    })
    if (code === 200) {
      this.onCloseModal()
      Taro.showToast({
        title: '打卡成功啦~'
      })
      this.getPlans()
    } else {
      Taro.showToast({
        title: '出错了，一会再试吧'
      })
    }
  }
  gotoAddPlan = () => {
    Taro.navigateTo({
      url: '/pages/plan-add/index'
    })
  }
  render() {
    return this.state.loading ? null : (
      <View>
        <View className="check-page">
          {!this.state.plans.length ? (
            <Empty tip="今天还没有打卡计划哦~">
              <View onClick={this.gotoAddPlan} className="add-plan">
                <View>去创建计划</View>
                <View className="iconfont icon-right-arrow" />
              </View>
            </Empty>
          ) : (
            this.state.plans.map((p: PlanType) => (
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
                        Array(p.times)
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
            ))
          )}
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
              />
            </View>
            <View
              className={`check-btn ${!!this.state.achieve ? '' : 'disable'} ${
                this.state.checkItem.theme
              }-background`}
              onClick={this.onSubmitCheck}
            >
              打卡！打！耶！Keep Going!
            </View>
          </View>
        </Modal>
      </View>
    )
  }
}

export default Check
