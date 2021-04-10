declare const wx
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro from '@tarojs/taro'
import { View, Image, Icon } from '@tarojs/components'

import FormItem from 'src/components/FormItem'
import Radio from 'src/components/Radio'
import DatePicker from 'src/components/DatePicker'
import SelfInput from 'src/components/SelfInput'
import Footer from 'src/components/Footer'

import { commonApi } from 'src/utils/request2.0'
import manualEvent from 'src/utils/manualEvent'

import './index.less'

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {}

type IState = {
  initialValue: Number[]
  fileID: string
  name: string
  status: number
  time: string
  comment: string
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect()
class Check extends Component<IProps, IState> {
  lock = false
  timeStartDate = new Date(2021, 0, 1)
  state = {
    initialValue: [0, 0, 0],
    fileID: '',
    name: '',
    status: 3, // 1-未读 2-在读 3-读完
    time: '',
    comment: ''
  }
  componentDidMount() {
    const today = new Date()
    const y = today.getFullYear()
    const m = today.getMonth()
    const d = today.getDate()
    this.setState({
      initialValue: [y - 2021, m, d - 1]
    })
  }

  componentDidShow() {}

  onShareAppMessage() {
    return {
      title: '排骨打卡',
      path: '/pages/check/index'
    }
  }

  onUploadCover = () => {
    wx.chooseImage({
      count: 1,
      sourceType: 'album',
      sizeType: ['compressed'],
      success: res => {
        this.setState({
          fileID: res.tempFilePaths[0]
        })
      },
      fail: res => {
        Taro.showToast({
          title: JSON.stringify(res.errMsg.replace('chooseImage:fail', '')),
          icon: 'none'
        })
      }
    })
  }
  onNameChange = (name: string) => {
    this.setState({
      name
    })
  }
  onStatusChange = (status: number) => {
    this.setState({
      status
    })
  }
  onChooseTime = (p: CommonItemType[]) => {
    this.setState({
      time: p.map(p => p.value).join('/')
    })
  }
  onCommentChange = (comment: string) => {
    this.setState({
      comment
    })
  }

  formatTime = (p: CommonItemType[]) => {
    return p.map(p => p.value).join('.')
  }
  onSubmit = async () => {
    if (!this.state.name) return

    if (this.lock) return
    this.lock = true
    Taro.showLoading({
      title: '请求中'
    })

    const { fileID } = this.state
    let cloudFileID = ''
    if (fileID) {
      wx.cloud.init()
      cloudFileID = await new Promise(resolve => {
        const tmp = fileID.split('/')
        const name = tmp[tmp.length - 1]
        wx.cloud.uploadFile({
          cloudPath: name, // 上传至云端的路径
          filePath: fileID, // 小程序临时文件路径
          success: res => {
            console.log(res.fileID)
            resolve(res.fileID)
          },
          fail: console.error
        })
      })
    }

    const { name, status, time, comment } = this.state
    const { code } = await commonApi({
      _scope: 'reading',
      _type: 'submit',
      name: name,
      status: status,
      cover: cloudFileID,
      time: time,
      comment: comment
    })

    if (code === 200) {
      Taro.hideLoading()
      Taro.showToast({
        title: '添加成功',
        icon: 'none',
        duration: 2000
      })
      manualEvent.change('reading-list-page', 'update reading list', {
        status,
        year: time ? +time.split('/')[0] : 0
      })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    }
    Taro.hideLoading()
    this.lock = false
  }

  render() {
    return (
      <View className="reading-add-page">
        <View className="cover-wrapper">
          <View className="cover">
            {this.state.fileID ? (
              <Image
                mode="widthFix"
                className="img"
                key={this.state.fileID}
                src={this.state.fileID}
                onClick={this.onUploadCover}
              />
            ) : (
              <Image
                mode="widthFix"
                className="img default"
                src={require('../../assets/upfile.png')}
                onClick={this.onUploadCover}
              />
            )}
          </View>
          <View className="info">
            <FormItem label="书名" labelWidth={36}>
              <SelfInput
                type="number"
                placeholder="输入书名"
                maxlength={50}
                value={this.state.name}
                onBlur={this.onNameChange}
              />
            </FormItem>
            <FormItem label="状态" labelWidth={36}>
              <View className="status">
                <View
                  className="status-item"
                  onClick={this.onStatusChange.bind(null, 3)}
                >
                  <Radio
                    checked={this.state.status === 3}
                    onChange={this.onStatusChange.bind(null, 3)}
                  />
                  <View className="status-item-txt">读完</View>
                </View>
                <View
                  className="status-item"
                  onClick={this.onStatusChange.bind(null, 2)}
                >
                  <Radio
                    checked={this.state.status === 2}
                    onChange={this.onStatusChange.bind(null, 2)}
                  />
                  <View className="status-item-txt">在读</View>
                </View>
                <View
                  className="status-item"
                  onClick={this.onStatusChange.bind(null, 1)}
                >
                  <Radio
                    checked={this.state.status === 1}
                    onChange={this.onStatusChange.bind(null, 1)}
                  />
                  <View className="status-item-txt">未读</View>
                </View>
              </View>
            </FormItem>
          </View>
        </View>
        <View>
          <FormItem label="时间">
            <View className="picker">
              <DatePicker
                placeholder="选择时间"
                startDate={this.timeStartDate}
                initialValue={this.state.initialValue}
                formatter={this.formatTime}
                onChange={this.onChooseTime}
              />
            </View>
          </FormItem>
          <FormItem label="备注">
            <SelfInput
              type="text"
              placeholder="留下你的足迹~"
              maxlength={50}
              value={this.state.comment}
              onBlur={this.onCommentChange}
            />
          </FormItem>
        </View>
        <Footer
          text="添加读书"
          disable={!this.state.name}
          onClick={this.onSubmit}
        />
      </View>
    )
  }
}

export default Check
