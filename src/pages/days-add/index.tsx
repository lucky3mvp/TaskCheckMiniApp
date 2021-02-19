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

import { commonApi, updatePlan } from 'src/utils/request2.0'
import manualEvent from 'src/utils/manualEvent'

import './index.less'

type PageStateProps = {
  helper: HelperStoreType
}

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

@connect(
  ({ helper }) => ({
    helper
  }),
  dispatch => ({})
)
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
    const { categories } = await commonApi({
      _scope: 'days',
      _type: 'fetchCategory'
    })
    this.setState({
      categoryOptions: (categories || []).map((c: DaysCategoryType) => ({
        label: c.name,
        value: c._id
      }))
    })
  }
  getValue(field: string, exception: Record<string, string | string[]>) {
    const expFields = Object.keys(exception)
    return expFields.includes(field) ? exception[field] : this.state[field]
  }
  checkDisable(exception: Record<string, string | string[]>) {
    let r: boolean = !!(
      this.getValue('name', exception) &&
      this.getValue('icon', exception) &&
      this.getValue('unitIndex', exception) &&
      this.getValue('goal', exception) &&
      this.getValue('beginTime', exception) &&
      this.getValue('endTime', exception)
    )

    if (!r) return false

    // 到这儿的证明上面几项都填了
    const type = this.getValue('type', exception)
    const subType = this.getValue('subType', exception)
    if (type === '3') {
      if (subType === '1') {
        r = !!this.getValue('times', exception)
      } else {
        r = !!this.getValue('days', exception).length
      }
    } else if (type === '4') {
      r = !!this.getValue('times', exception)
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
      categoryIndex: categoryIndex
    })
  }
  formatDate = (p: CommonItemType[]) => {
    return p.map(p => p.value).join('.')
  }
  onChooseDate = (p: CommonItemType[]) => {
    this.setState({
      date: p.map(p => p.value).join('/')
    })
  }
  onIsTopChange = (checked: boolean) => {
    this.setState({
      isTop: checked
    })
  }
  onNotifyChange = (checked: boolean) => {
    this.setState({
      notify: checked
    })
  }
  formatNotifyDate = (p: CommonItemType[]) => {
    return p.map(p => p.value).join('.')
  }
  onChooseNotifyDate = (p: CommonItemType[]) => {
    this.setState({
      notifyDate: p.map(p => p.value).join('/')
    })
  }
  formatNotifyTime = (p: CommonItemType[]) => {
    return p.map(p => p.value).join(':')
  }
  onChooseNotifyTime = (p: CommonItemType[]) => {
    this.setState({
      notifyTime: this.formatNotifyTime(p)
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

    const res = await updatePlan({
      _type: 'submit',
      name: this.state.name
    })
    if (res.code === 200) {
      Taro.hideLoading()
      Taro.showToast({
        title: '创建成功，去看看',
        icon: 'none',
        duration: 2000
      })
      manualEvent.change('days-list-page', 'update days list')
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/check/index' })
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
        <View className={`footer ${this.props.helper.isIpx ? 'ipx' : ''}`}>
          <View className="holder">
            <View className="btn-wrapper"></View>
            <View className="gap"></View>
          </View>
          <View className="fixed">
            <View className="btn-wrapper">
              <View
                className={`btn ${'main'}-background ${
                  this.state.disable ? 'disable' : ''
                }`}
                onClick={this.onSubmit}
              >
                提交
              </View>
            </View>
            <View className="gap"></View>
          </View>
        </View>
      </View>
    )
  }
}

export default DaysAdd
