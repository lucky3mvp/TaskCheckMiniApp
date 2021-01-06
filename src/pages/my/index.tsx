import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Button, Text, Image } from '@tarojs/components'
import wit from 'src/utils/wit'
import {updateUserInfo} from 'src/store/actions/userInfo'

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

interface My {
  props: IProps;
}

@connect(({ userInfo }) => ({
  userInfo
}), (dispatch) => ({
  updateUserInfo (userInfo) {
    dispatch(updateUserInfo(userInfo))
  }
}))
class My extends Component {
  getUserInfo = async () => {
    const [res] = await wit.getUserInfo()
    if (res) {
      this.props.updateUserInfo(res)
    }
  }
  render(){
    return (
      <View className='my-page'>
        <View
          className={'avatar-wrapper border-bottom'}
        >
          <Button
            open-type='getUserInfo'
            onGetUserInfo={this.getUserInfo}
            className="avatar no-button"
          >
            <Image
              src={
                this.props.userInfo.avatarUrl || 'https://sf3-ttcdn-tos.pstatp.com/obj/static-assets/e28ab4819d63c0277b996592cde9fd6a.png'
              }
              className='img'
            />
          </Button>
          <View>
            <Button
              open-type='getUserInfo'
              className="name no-button"
              onGetUserInfo={
                ()=>{}
              }
            >
              {this.props.userInfo.nickName}
            </Button>
          </View>
        </View>
      </View>
    )
  }
}

export default My
