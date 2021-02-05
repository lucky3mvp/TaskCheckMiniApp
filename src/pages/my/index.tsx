import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import { View, Button, Text, Image } from '@tarojs/components'
import wit from 'src/utils/wit'
import { updateUserInfo } from 'src/store/actions/userInfo'
import { Greetings } from 'src/constants'
import Gap from 'src/components/Gap'
import Modal from 'src/components/Modal'

import './index.less'

type PageStateProps = {
  userInfo: UserInfoStoreType
}

type PageDispatchProps = {
  updateUserInfo: (_) => void
}

type PageOwnProps = {}

type PageState = {
  stage: number
}

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
  state = {
    stage: 0
  }
  greetingIndex: number = 0
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
  // gotoMood = async () => {
  //   Taro.navigateTo({
  //     url: '/pages/mood/index'
  //   })
  // }
  toBeExpected = async () => {
    this.onShowModal()
  }
  onShowModal = () => {
    this.setState(
      {
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
        stage: 1
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
              onGetUserInfo={this.getUserInfo}
            >
              {txts.main}
            </Button>
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
        {/* <View className="list-item border-bottom" onClick={this.gotoMood}>
          <Image src={require('../../assets/write.png')} className="icon" />
          <View className="item-title">随心记</View>
          <View className="iconfont icon-right-arrow" />
        </View> */}
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

        <Modal
          maskCloseable
          visible={this.state.stage > 0}
          onClose={this.onCloseModal}
        >
          <View
            className={`my-page-expected-module ${
              this.state.stage > 1 ? 'show' : 'hide'
            }`}
          >
            <View className="cnt">
              <View>
                批量打卡，补签，个人积分，倒计时，统计报表等功能正在开发中，敬请期待！
              </View>
            </View>
            <View className="btn border-top" onClick={this.onCloseModal}>
              我知道了
            </View>
          </View>
        </Modal>
      </View>
    )
  }
}

export default My
