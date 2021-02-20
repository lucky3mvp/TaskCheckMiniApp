declare const wx

import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'

import FormItem from 'src/components/FormItem'
import Gap from 'src/components/Gap'
import Switch from 'src/components/Switch'
import Picker from 'src/components/Picker'
import DatePicker from 'src/components/DatePicker'
import TimePicker from 'src/components/TimePicker'
import SelfInput from 'src/components/SelfInput'
import Footer from 'src/components/Footer'

import { commonApi } from 'src/utils/request2.0'
import manualEvent from 'src/utils/manualEvent'

import './index.less'

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {}

type IState = {
  disable: boolean
  name: string
  categoryIndex: string
  categoryOptions: CommonItemType[]
  date: string
  dateInitialValue: Number[]
  isTop: boolean
  notify: boolean
  notifyDate: string
  notifyTime: string
  cover: string
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect()
class DaysAdd extends Component<IProps, IState> {
  lock = false
  startDate = new Date(1971, 0, 1)
  endDate = new Date(2051, 11, 31)
  state = {
    disable: true,
    name: '',
    categoryIndex: '',
    categoryOptions: [],
    date: '',
    dateInitialValue: [0, 0, 0],
    isTop: false,
    notify: false,
    notifyDate: '',
    notifyTime: '',
    cover: ''
  }
  onShareAppMessage() {
    return {
      title: '排骨打卡',
      path: '/pages/check/index'
    }
  }
  async componentDidMount() {
    await this.getCategoryList()

    const today = new Date()
    const y = today.getFullYear()
    const m = today.getMonth()
    const d = today.getDate()
    this.setState({
      dateInitialValue: [y - 1971, m, d - 1]
    })

    manualEvent.register('days-add-page').on('update days category', () => {
      this.getCategoryList()
      manualEvent.clear('days-add-page')
    })
  }
  componentDidShow() {
    manualEvent.run('days-add-page')
  }
  async getCategoryList() {
    const { categories = [] } = await commonApi({
      _scope: 'days',
      _type: 'fetchCategory'
    })
    this.setState({
      categoryOptions: categories.map((c: DaysCategoryType) => ({
        label: c.name,
        value: c._id
      }))
    })
  }
  getValue(
    field: string,
    exception: Record<string, string | boolean | string[]>
  ) {
    const expFields = Object.keys(exception)
    return expFields.includes(field) ? exception[field] : this.state[field]
  }
  checkDisable(exception: Record<string, string | boolean | string[]>) {
    let r: boolean = !!(
      this.getValue('name', exception) &&
      this.getValue('categoryIndex', exception) &&
      this.getValue('date', exception)
    )
    if (!r) return false
    const notify = this.getValue('notify', exception)
    if (notify) {
      const notifyDate = !!this.getValue('notifyDate', exception)
      const notifyTime = !!this.getValue('notifyTime', exception)
      if (notifyDate && notifyTime) return true
      else return false
    }
    return r
  }
  onNameChange = (name: string) => {
    this.setState({
      name,
      disable: !this.checkDisable({ name: name })
    })
  }
  onChooseCategory = (categoryIndex: string) => {
    this.setState({
      categoryIndex: categoryIndex,
      disable: !this.checkDisable({ categoryIndex: categoryIndex })
    })
  }
  formatDate = (p: CommonItemType[]) => {
    return p.map(p => p.value).join('.')
  }
  onChooseDate = (p: CommonItemType[]) => {
    const d = p.map(p => p.value).join('/')
    this.setState({
      date: d,
      disable: !this.checkDisable({ date: d })
    })
  }
  onIsTopChange = (checked: boolean) => {
    this.setState({
      isTop: checked
    })
  }
  onNotifyChange = (checked: boolean) => {
    this.setState({
      notify: checked,
      disable: !this.checkDisable({
        notify: checked
      })
    })
  }
  formatNotifyDate = (p: CommonItemType[]) => {
    return p.map(p => p.value).join('.')
  }
  onChooseNotifyDate = (p: CommonItemType[]) => {
    const d = p.map(p => p.value).join('/')
    this.setState({
      notifyDate: d,
      disable: !this.checkDisable({
        notifyDate: d
      })
    })
  }
  formatNotifyTime = (p: CommonItemType[]) => {
    return p.map(p => p.value).join(':')
  }
  onChooseNotifyTime = (p: CommonItemType[]) => {
    const t = this.formatNotifyTime(p)
    this.setState({
      notifyTime: t,
      disable: !this.checkDisable({
        notifyTime: t
      })
    })
  }
  onUploadCover = () => {
    wx.chooseImage({
      count: 1,
      sourceType: 'album',
      sizeType: ['compressed'],
      success: res => {
        this.setState({
          cover: res.tempFilePaths[0]
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

  onSubmit = async () => {
    if (this.state.disable) return
    if (this.lock) return
    this.lock = true
    Taro.showLoading({
      title: '请求中'
    })

    const { cover } = this.state
    let cloudFileID = ''
    if (cover) {
      wx.cloud.init()
      cloudFileID = await new Promise(resolve => {
        const tmp = cover.split('/')
        const name = tmp[tmp.length - 1]
        wx.cloud.uploadFile({
          cloudPath: name, // 上传至云端的路径
          filePath: cover, // 小程序临时文件路径
          success: res => {
            console.log(res.fileID)
            resolve(res.fileID)
          },
          fail: console.error
        })
      })
    }

    const res = await commonApi({
      _scope: 'days',
      _type: 'submitDays',
      name: this.state.name,
      category: this.state.categoryOptions[this.state.categoryIndex].value,
      date: this.state.date,
      isTop: this.state.isTop,
      notifyTime: this.state.notify
        ? new Date(
            `${this.state.notifyDate} ${this.state.notifyTime}`
          ).getTime()
        : null,
      cover: cloudFileID
    })
    if (res.code === 200) {
      Taro.hideLoading()
      Taro.showToast({
        title: '添加成功',
        icon: 'none',
        duration: 2000
      })
      manualEvent.change('days-list-page', 'update days list')
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    }
    Taro.hideLoading()
    this.lock = false
  }

  gotoDaysCategory = () => {
    Taro.navigateTo({
      url: '/pages/days-category/index'
    })
  }

  render() {
    return (
      <View className="days-add-page">
        <FormItem label="名称">
          <SelfInput
            type="text"
            placeholder="请输入名称"
            maxlength={20}
            value={this.state.name}
            onBlur={this.onNameChange}
          />
        </FormItem>
        <FormItem label="分类" key="picker">
          {this.state.categoryOptions.length ? (
            <View className="picker">
              <Picker
                rightArrow
                mode="selector"
                placeholder="选择分类"
                index={+this.state.categoryIndex}
                range={this.state.categoryOptions}
                onChange={this.onChooseCategory}
              />
            </View>
          ) : (
            <View className="picker-txt">
              <View className="txt" onClick={this.gotoDaysCategory}>
                管理分类
              </View>
              <View className="iconfont icon-right-arrow" />
            </View>
          )}
        </FormItem>
        <FormItem
          label="日期"
          labelTips={
            <View>
              <View>选择未来日期倒数，</View>
              <View>选择过去日期正数。</View>
            </View>
          }
        >
          <View className="picker">
            <DatePicker
              rightArrow
              placeholder="选择日期"
              startDate={this.startDate}
              endDate={this.endDate}
              initialValue={this.state.dateInitialValue}
              formatter={this.formatDate}
              onChange={this.onChooseDate}
            />
          </View>
        </FormItem>
        <FormItem label="置顶" labelTips="只有最近置顶的一条才生效哦~">
          <View className="switch">
            <Switch checked={this.state.isTop} onChange={this.onIsTopChange} />
          </View>
        </FormItem>
        <FormItem label="通知">
          <View className="switch">
            <Switch
              checked={this.state.notify}
              onChange={this.onNotifyChange}
            />
          </View>
        </FormItem>
        {this.state.notify ? (
          <FormItem label="通知时间">
            <View className="date-time-picker">
              <View className="date-picker">
                <DatePicker
                  placeholder="选择通知日期"
                  endDate={this.endDate}
                  formatter={this.formatNotifyDate}
                  onChange={this.onChooseNotifyDate}
                />
              </View>
              <View>/</View>
              <View className="time-picker">
                <TimePicker
                  placeholder="选择通知时间"
                  formatter={this.formatNotifyTime}
                  onChange={this.onChooseNotifyTime}
                />
              </View>
            </View>
          </FormItem>
        ) : null}
        <FormItem label="图片" hideBorderBottom={!!this.state.cover}>
          <View className="cover" onClick={this.onUploadCover}>
            <View className="iconfont icon-upload" />
            <View>{this.state.cover ? '重新上传' : '上传图片'}</View>
          </View>
        </FormItem>
        {this.state.cover ? (
          <View className="cover-wrapper border-bottom">
            <Image
              mode="center"
              className="img"
              key={this.state.cover}
              src={this.state.cover}
            />
          </View>
        ) : null}
        <Gap height={30} />
        <Footer
          text="提交"
          onClick={this.onSubmit}
          disable={this.state.disable}
        />
      </View>
    )
  }
}

export default DaysAdd
