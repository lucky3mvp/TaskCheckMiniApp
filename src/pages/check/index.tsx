import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Button, Text, Image } from '@tarojs/components'
import { UnitMap } from 'src/constants/config'

import Modal from 'src/components/Modal'
import SelfInput from 'src/components/SelfInput'

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
  modalStatus: number
  achieve: string
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
    modalStatus: 0,
    achieve: '',
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
    // const { code, plans = [] } = await getPlanByDate({
    //   date: formatDate(new Date(), 'yyyy/MM/dd')
    // })
    // if (code === 200) {
    //   console.log(plans)
    //   this.setState({
    //     plans: plans.map(p => ({
    //       ...p,
    //       days: (p.days || '').split(',')
    //     }))
    //   })
    // }
    this.setState({
      plans: [
        {
          planID: '60029aa3720bc4003c52b0ca',
          beginTime: '2021-01-16T00:00:00.000Z',
          category: 1,
          days: '0,1,2,3,4,5,6',
          description: '加油',
          endTime: '2022-01-01T00:00:00.000Z',
          goal: 5,
          icon: 'running',
          name: '跑步',
          subType: 1,
          theme: 'theme3',
          times: 4,
          type: 3,
          unit: '3',
          status: 0,
          totalAchieve: 0,
          totalTimes: 1
        }
      ].map((p: PlanApiResType) => ({
        ...p,
        days: (p.days || '').split(',')
      }))
    })
  }
  onCheck = (p: PlanType) => {
    this.onShowModal()
    if (p.status === 1) return // 已完成返回
  }

  onShowModal = () => {
    this.setState(
      {
        modalStatus: 1
      },
      () => {
        setTimeout(() => {
          this.setState({
            modalStatus: 2
          })
        }, 100)
      }
    )
  }
  onCloseModal = () => {
    this.setState(
      {
        modalStatus: 1
      },
      () => {
        setTimeout(() => {
          this.setState({
            modalStatus: 0
          })
        }, 100)
      }
    )
  }
  onAchieveChange = () => {
    this.setState
  }
  render() {
    return (
      <View>
        <View className="check-page">
          {this.state.plans.map((p: PlanType) => (
            <View
              className="check-plan-item"
              key={p.planID}
              onClick={this.onCheck.bind(this, p)}
            >
              <View className={`bkg bkg-full ${p.theme}-background`}></View>
              <View className={`bkg bkg-progress ${p.theme}-background`}></View>
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
          ))}
        </View>
        <Modal
          maskCloseable
          visible={this.state.modalStatus > 0}
          onClose={this.onCloseModal}
        >
          <View
            className={`check-page-check-modal ${
              this.state.modalStatus > 1 ? 'show' : 'hide'
            }`}
          >
            1111
            <SelfInput
              type="text"
              placeholder="取个名字吧~"
              maxlength={10}
              value={this.state.achieve}
              onBlur={this.onAchieveChange}
            />
          </View>
        </Modal>
      </View>
    )
  }
}

export default Check
