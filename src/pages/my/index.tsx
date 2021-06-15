import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import { View, Button, Text, Image } from '@tarojs/components'
import wit from 'src/utils/wit'
import { updateUserInfo } from 'src/store/actions/userInfo'
import { Greetings } from 'src/constants'
import Gap from 'src/components/Gap'
import Dialog from 'src/components/Dialog'
import { commonApi } from 'src/utils/request2.0'

import './index.less'

type PageStateProps = {
  userInfo: UserInfoStoreType
}

type PageDispatchProps = {
  updateUserInfo: (_) => void
}

type PageOwnProps = {}

type IState = {
  visible: boolean
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

type GreetingType = {
  main: string
  sub: string
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
class My extends Component<IProps, IState> {
  state = {
    visible: false
  }
  greetingIndex: number = 0
  // onShareAppMessage() {
  //   return {
  //     title: '排骨打卡',
  //     path: '/pages/check/index'
  //   }
  // }
  getUserProfile = async () => {
    if (this.props.userInfo.isLogin) return

    const [res] = await wit.getUserProfile()
    if (res) {
      this.props.updateUserInfo(res)
      commonApi({
        _scope: 'login',
        _type: 'updateUserProfile',
        ...res
      })
    }
  }
  getGreetings(): GreetingType {
    const { userInfo } = this.props
    if (userInfo.nickName) {
      const l = Greetings.length
      if (!this.greetingIndex) {
        this.greetingIndex = Math.floor(Math.random() * l)
      }
      return {
        main: userInfo.nickName,
        sub: `${Greetings[this.greetingIndex]}，${
          userInfo.gender === 1
            ? '小哥哥，'
            : userInfo.gender === 2
            ? '小姐姐，'
            : ''
        }冲鸭~`
      }
    } else {
      return { main: '立即登录', sub: '' }
    }
  }

  gotoPlanList = async () => {
    Taro.navigateTo({
      url: '/pages/plan-list/index'
    })
  }
  gotoCheckList = async () => {
    Taro.navigateTo({
      url: '/pages/check-list/index'
    })
  }
  gotoMenstruation = async () => {
    Taro.navigateTo({
      url: '/pages/menstruation/index'
    })
  }
  gotoReading = async () => {
    Taro.navigateTo({
      url: '/pages/reading-list/index'
    })
  }
  toBeExpected = async () => {
    this.onShowModal()
  }
  onShowModal = () => {
    this.setState({
      visible: true
    })
  }
  onCloseDialog = () => {
    this.setState({
      visible: false
    })
  }

  render() {
    const { userInfo } = this.props
    const txts = this.getGreetings()
    return (
      <View className="my-page">
        <View className="header">
          <Image
            src={
              userInfo.avatarUrl ||
              'https://sf3-ttcdn-tos.pstatp.com/obj/static-assets/e28ab4819d63c0277b996592cde9fd6a.png'
            }
            className="avatar img"
            onClick={this.getUserProfile}
          />
          <View className="txt txt-main" onClick={this.getUserProfile}>
            {txts.main}
            <View className="txt-sub">{txts.sub}</View>
          </View>
        </View>
        <Gap height={8} bkg={'#f4f5f6'} />
        <View className="list-item border-bottom" onClick={this.gotoPlanList}>
          <Image src={require('../../assets/schedule.png')} className="icon" />
          <View className="item-title">我的计划</View>
          <View className="iconfont icon-right-arrow" />
        </View>
        <View className="list-item border-bottom" onClick={this.gotoCheckList}>
          <Image src={require('../../assets/record.png')} className="icon" />
          <View className="item-title">打卡记录</View>
          <View className="iconfont icon-right-arrow" />
        </View>
        <View className="list-item border-bottom" onClick={this.gotoReading}>
          <Image src={require('../../assets/reading.png')} className="icon" />
          <View className="item-title">读书清单</View>
          <View className="iconfont icon-right-arrow" />
        </View>
        {this.props.userInfo.gender === 2 ||
        this.props.userInfo.nickName === 'ASY' ? (
          <View
            className="list-item border-bottom"
            onClick={this.gotoMenstruation}
          >
            <Image src={require('../../assets/aixin.png')} className="icon" />
            <View className="item-title">大姨妈</View>
            <View className="iconfont icon-right-arrow" />
          </View>
        ) : null}
        <View className="list-item border-bottom" onClick={this.toBeExpected}>
          <Image src={require('../../assets/todo.png')} className="icon" />
          <View className="item-title">敬请期待</View>
          <View className="iconfont icon-right-arrow" />
        </View>

        <Dialog
          visible={this.state.visible}
          content="批量打卡，个人积分，统计报表等功能正在开发中，敬请期待！"
          confirmText="我知道了"
          onConfirm={this.onCloseDialog}
        />
      </View>
    )
  }
}

export default My
