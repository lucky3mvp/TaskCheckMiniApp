import React, { Component } from 'react'
import { useSelector } from 'react-redux'
import { View, Button, Text, Image } from '@tarojs/components'

import './index.less'


export default () => {
  return (
    <View className='my-page'>
      <View
        className={'avatar-wrapper border-bottom'}
      >
        <Button
          open-type='getUserInfo'
          onGetUserInfo={
            ()=>{}
          }
          className="avatar-btn no-button"
        >
          <Image
            src={
              'https://sf3-ttcdn-tos.pstatp.com/obj/static-assets/e28ab4819d63c0277b996592cde9fd6a.png'
            }
            className='avatar'
          />
        </Button>
        <View>
          <Button
            open-type='getUserInfo'
            onGetUserInfo={
              ()=>{}
            }
          >
            啦啦啦
          </Button>
        </View>
      </View>
    </View>
  )
}
