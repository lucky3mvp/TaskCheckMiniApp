import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import { View, Button, Text, Image } from '@tarojs/components'
import wit from 'src/utils/wit'
import { updateUserInfo } from 'src/store/actions/userInfo'
import { Greetings } from 'src/constants'
import Gap from 'src/components/Gap'

import './index.less'

type PageStateProps = {
  userInfo: UserInfoStoreType
}

type PageDispatchProps = {
  updateUserInfo: (_) => void
}

type PageOwnProps = {}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

type GreetingType = {
  main: string
  sub: string
}

interface My {
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
class My extends Component {
  getUserInfo = async () => {
    const [res] = await wit.getUserInfo()
    if (res) {
      this.props.updateUserInfo(res)
    }
  }
  getGreetings(): GreetingType {
    const { userInfo } = this.props
    if (userInfo.nickName) {
      const l = Greetings.length
      const index = Math.floor(Math.random() * l)
      return {
        main: userInfo.nickName,
        sub: `${Greetings[index]}，${
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
  async ensureLogin() {
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
  }
  gotoPlanList = async () => {
    await this.ensureLogin()
    Taro.navigateTo({
      url: '/pages/plan-list/index'
    })
  }
  gotoMenstruation = async () => {
    await this.ensureLogin()
    Taro.navigateTo({
      url: '/pages/menstruation/index'
    })
  }

  render() {
    const { userInfo } = this.props
    const txts = this.getGreetings()
    return (
      <View className="my-page">
        <View className={'header'}>
          <Button
            open-type="getUserInfo"
            onGetUserInfo={this.getUserInfo}
            className="avatar no-button"
          >
            <Image
              src={
                userInfo.avatarUrl ||
                'https://sf3-ttcdn-tos.pstatp.com/obj/static-assets/e28ab4819d63c0277b996592cde9fd6a.png'
              }
              className="img"
            />
          </Button>
          <View className="txt">
            <Button
              open-type="getUserInfo"
              className="txt-main no-button"
              onGetUserInfo={() => {}}
            >
              {txts.main}
            </Button>
            <View className="txt-sub">{txts.sub}</View>
          </View>
        </View>
        {/* 批量打卡，补签，暂停计划，提前结束 */}
        <Gap height={8} bkg={'#f4f5f6'} />
        <View className="list-item border-bottom" onClick={this.gotoPlanList}>
          <Image src={require('../../assets/schedule.png')} className="icon" />
          <View className="item-title">我的计划</View>
          <View className="iconfont icon-right-arrow" />
        </View>
        <View className="list-item border-bottom">
          <Image src={require('../../assets/record.png')} className="icon" />
          <View className="item-title">打卡记录</View>
          <View className="iconfont icon-right-arrow" />
        </View>
        <View className="list-item border-bottom">
          <Image src={require('../../assets/write.png')} className="icon" />
          <View className="item-title">随心记</View>
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

        <View className="list-item border-bottom">
          <Image src={require('../../assets/todo.png')} className="icon" />
          <View className="item-title">敬请期待</View>
          <View className="iconfont icon-right-arrow" />
        </View>
      </View>
    )
  }
}

export default My
