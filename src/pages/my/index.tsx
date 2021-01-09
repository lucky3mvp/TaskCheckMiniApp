import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Button, Text, Image } from '@tarojs/components'
import wit from 'src/utils/wit'
import { updateUserInfo } from 'src/store/actions/userInfo'
import { Greetings } from 'src/constants'

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

  render() {
    const { userInfo } = this.props
    const txts = this.getGreetings()
    return (
      <View className="my-page">
        <View className={'header border-bottom'}>
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
      </View>
    )
  }
}

export default My
