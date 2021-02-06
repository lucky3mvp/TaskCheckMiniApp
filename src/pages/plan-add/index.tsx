import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import classnames from 'classnames'

import FormItem from 'src/components/FormItem'
import FormTitle from 'src/components/FormTitle'
import Gap from 'src/components/Gap'
import BtnGroup from 'src/components/BtnGroup'
import Radio from 'src/components/Radio'
import Picker from 'src/components/Picker'
import DatePicker from 'src/components/DatePicker'

import SelfInput from 'src/components/SelfInput'

import {
  BannerImgs,
  Themes,
  Icons,
  TypeMap,
  Weekdays,
  UnitMap,
  IconCategoryMap
} from 'src/constants'
import { updatePlan } from 'src/utils/request2.0'
import manualEvent from 'src/utils/manualEvent'

import './index.less'

/**
 * name: 20
 * description: 50
 * times: 2
 * goal: 10
 */

type PageStateProps = {
  helper: HelperStoreType
}

type PageDispatchProps = {}

type PageOwnProps = {}

type IState = {
  disable: boolean
  bannerImgIndex: number
  name: string
  description: string
  theme: string
  icon: string
  unitIndex: string
  goal: string
  times: string
  days: string[]
  type: string
  subType: string
  beginTime: string
  endTime: string
  typeBtns: Array<CommonItemType>
  daysBtns: Array<CommonItemType>
  unitOptions: Array<CommonItemType>
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect(
  ({ helper }) => ({
    helper
  }),
  dispatch => ({})
)
class PlanAdd extends Component<IProps, IState> {
  lock = false
  state = {
    disable: true,
    bannerImgIndex: 0,
    name: '',
    description: '',
    theme: 'theme1',
    icon: '',
    unitIndex: '',
    goal: '',
    times: '',
    days: ['0', '1', '2', '3', '4', '5', '6'],
    type: '3', // 2-每日 3-每周 4-每月
    subType: '2', // 1-每周x天 2-每周周几
    beginTime: '',
    endTime: '',
    typeBtns: [],
    daysBtns: [],
    unitOptions: []
  }
  onShareAppMessage() {
    return {
      title: '排骨打卡',
      path: '/pages/home/index'
    }
  }
  componentDidMount() {
    const index = Math.floor(Math.random() * BannerImgs.length)
    this.setState({
      bannerImgIndex: index,
      typeBtns: Object.keys(TypeMap).map(t => ({
        label: TypeMap[t],
        value: `${t}`
      })),
      daysBtns: Weekdays.map((t, i) => ({
        label: t,
        value: `${i}`
      })),
      unitOptions: Object.keys(UnitMap).map(u => ({
        label: UnitMap[u],
        value: `${u}`
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
      this.getValue('description', exception) &&
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
  onDescriptionChange = (description: string) => {
    this.setState({
      description,
      disable: !this.checkDisable({ description: description })
    })
  }
  onTypeChange = (o: CommonItemType) => {
    this.setState({
      type: o.value,
      subType: '1',
      times: '',
      disable: !this.checkDisable({
        type: o.value,
        subType: '1',
        times: ''
      })
    })
  }
  onSubTypeChange = (subType: string) => {
    this.setState({
      subType,
      disable: !this.checkDisable({ subType: subType })
    })
  }
  onTimesChange = (times: string) => {
    this.setState({
      times,
      disable: !this.checkDisable({ times: times })
    })
  }
  onDaysChange = (o: CommonItemType) => {
    const days = [...this.state.days]
    const index = days.indexOf(o.value)
    if (index < 0) {
      days.push(o.value)
    } else {
      days.splice(index, 1)
    }
    this.setState({
      days,
      disable: !this.checkDisable({ days: days })
    })
  }
  onGoalChange = (goal: string) => {
    this.setState({
      goal,
      disable: !this.checkDisable({ goal: goal })
    })
  }
  onUnitChange = (unitIndex: string) => {
    this.setState({
      unitIndex,
      disable: !this.checkDisable({ unitIndex: unitIndex })
    })
  }
  formatTime = (field: 'start' | 'end', p: CommonItemType[]) => {
    const r = p.map(p => p.value).join('.')
    if (field === 'start') return r
    return r === '9999.99.99' ? '永远' : r
  }
  onChooseBeginTime = p => {
    const beginTime = p.map(p => p.value).join('/')
    this.setState({
      beginTime,
      disable: !this.checkDisable({ beginTime: beginTime })
    })
  }
  onChooseEndTime = p => {
    const endTime = p.map(p => p.value).join('/')
    this.setState({
      endTime,
      disable: !this.checkDisable({ endTime: endTime })
    })
  }
  onChooseIcon = (icon: string) => {
    this.setState({
      icon,
      disable: !this.checkDisable({ icon: icon })
    })
  }
  onChooseTheme = (theme: string) => {
    this.setState({
      theme,
      disable: !this.checkDisable({ theme: theme })
    })
  }
  onSubmit = async () => {
    console.log(this.state)
    if (this.state.disable) return

    if (this.state.subType === '1') {
      if (this.state.type === '3' && +this.state.times > 7) {
        Taro.showToast({
          title: '每周天数不应该超过7天',
          icon: 'none'
        })
        return
      }
      if (this.state.type === '4' && +this.state.times > 30) {
        Taro.showToast({
          title: '每月天数不应该超过30天',
          icon: 'none'
        })
        return
      }
    }
    if (
      this.state.endTime !== '9999/99/99' &&
      new Date(this.state.beginTime) > new Date(this.state.endTime)
    ) {
      Taro.showToast({
        title: '开始时间不应该超过结束时间',
        icon: 'none'
      })
      return
    }
    if (this.lock) return
    this.lock = true
    Taro.showLoading({
      title: '请求中'
    })

    const res = await updatePlan({
      optType: 'submit',
      name: this.state.name,
      description: this.state.description,
      theme: this.state.theme,
      icon: this.state.icon,
      category: IconCategoryMap[this.state.icon],
      unit: this.state.unitOptions[this.state.unitIndex].value, // state存的是picker的index
      goal: +this.state.goal,
      type: +this.state.type,
      subType: +this.state.subType,
      times:
        (this.state.type === '3' && this.state.subType === '1') ||
        this.state.type === '4'
          ? +this.state.times
          : '', // 数据库定义了要数字，这样好像写不进去，也行
      // 目前 days 只有每周才能选
      days:
        this.state.type === '3' && this.state.subType === '2'
          ? this.state.days.join(',')
          : '',
      beginTime: this.state.beginTime,
      // 没有默认为永远
      endTime: this.state.endTime === '9999/99/99' ? '' : this.state.endTime
    })
    if (res.code === 200) {
      Taro.hideLoading()
      Taro.showToast({
        title: '创建成功，去看看',
        icon: 'none',
        duration: 2000
      })
      manualEvent.change('home-page', 'update plan tab list')
      manualEvent.change('check-page', 'update check list')
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/home/index' })
      }, 1500)
    }
    Taro.hideLoading()
    this.lock = false
  }

  render() {
    return (
      <View className="plan-add-page">
        <Image
          src={BannerImgs[this.state.bannerImgIndex]}
          mode="widthFix"
          className="banner"
        />
        <FormTitle title="基础信息" />
        <FormItem label="计划名">
          <SelfInput
            type="text"
            placeholder="取个名字吧~"
            maxlength={20}
            value={this.state.name}
            onBlur={this.onNameChange}
          />
        </FormItem>
        <FormItem label="描述语">
          <SelfInput
            type="text"
            placeholder="一句话激励自己~"
            maxlength={50}
            value={this.state.description}
            onBlur={this.onDescriptionChange}
          />
        </FormItem>
        <FormItem label="频率" hideBorderBottom={this.state.type !== '2'}>
          <View className="type-wrapper">
            <BtnGroup
              btns={this.state.typeBtns}
              value={this.state.type}
              theme={this.state.theme}
              onChange={this.onTypeChange}
            />
          </View>
        </FormItem>
        {this.state.type === '3' || this.state.type === '4' ? (
          <View className="sub-type-wrapper border-bottom">
            <View className="sub-type-inner">
              <View className={this.state.type === '3' ? 'week' : 'month'}>
                <View className="indicator" />
                <View className="sub-type-item">
                  <View className="radio">
                    <Radio
                      theme={this.state.theme}
                      checked={this.state.subType === '1'}
                      onChange={this.onSubTypeChange.bind(null, '1')}
                    />
                  </View>
                  <View className="txt">{TypeMap[this.state.type]}</View>
                  <View className="ipt">
                    <SelfInput
                      type="number"
                      placeholder={` 1 - ${this.state.type === '3' ? 7 : 30} `}
                      maxlength={2}
                      value={this.state.times}
                      onBlur={this.onTimesChange}
                    />
                  </View>
                  <View className="txt">天</View>
                </View>
                {this.state.type === '3' ? (
                  <View className="sub-type-item">
                    <View className="radio">
                      <Radio
                        theme={this.state.theme}
                        checked={this.state.subType === '2'}
                        onChange={this.onSubTypeChange.bind(null, '2')}
                      />
                    </View>
                    <View className="txt">{TypeMap[this.state.type]}</View>
                    <View className="multi-btn-group-wrapper">
                      <BtnGroup
                        multiple
                        btns={this.state.daysBtns}
                        values={this.state.days}
                        theme={this.state.theme}
                        onChange={this.onDaysChange}
                        btnStyle={{
                          width: '45px',
                          height: '20px',
                          fontSize: '12px',
                          lineHeight: '18px',
                          borderRadius: '10px'
                        }}
                      />
                    </View>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        ) : null}
        <FormItem label="目标">
          <View className="goal-wrapper">
            <View className="ipt">
              <SelfInput
                type="number"
                placeholder="输入奋斗目标"
                maxlength={10}
                value={this.state.goal}
                onBlur={this.onGoalChange}
              />
            </View>
            <View className="picker">
              <Picker
                align="flex-end"
                mode="selector"
                placeholder="目标单位"
                index={+this.state.unitIndex}
                range={this.state.unitOptions}
                onChange={this.onUnitChange}
              />
            </View>
          </View>
        </FormItem>
        <FormItem label="时间">
          <View className="time-wrapper">
            <View className="picker">
              <DatePicker
                align="flex-start"
                placeholder="开始时间"
                range={4}
                formatter={this.formatTime.bind(null, 'start')}
                onChange={this.onChooseBeginTime}
              />
            </View>
            <View className="line">—</View>
            <View className="picker">
              <DatePicker
                align="flex-end"
                placeholder="结束时间"
                range={4}
                formatter={this.formatTime.bind(null, 'end')}
                specificStart={[
                  [{ value: '9999', label: '永远' }],
                  [{ value: '99', label: '' }],
                  [{ value: '99', label: '' }]
                ]}
                onChange={this.onChooseEndTime}
              />
            </View>
          </View>
        </FormItem>
        <Gap height={20} />
        <FormTitle title="主题信息" />
        <FormItem label="图标" vertical>
          <View className="icon-wrapper">
            {Icons.map(i => (
              <View
                key={i}
                className={classnames(`icon-${i} icon-item iconfont`, {
                  [`icon-default-color`]: this.state.icon !== i,
                  [`${this.state.theme}-color`]: this.state.icon === i
                })}
                onClick={this.onChooseIcon.bind(this, i)}
              />
            ))}
          </View>
        </FormItem>
        <FormItem label="颜色" vertical hideBorderBottom>
          <View className="theme-wrapper">
            {Themes.map(t => (
              <View
                key={t}
                className={classnames('theme-item', {
                  active: t === this.state.theme,
                  [`${t}-border-color`]: t === this.state.theme,
                  [`${t}-background`]: true
                })}
                onClick={this.onChooseTheme.bind(this, t)}
              >
                <View className={`theme-item-inner ${t}-background`} />
              </View>
            ))}
          </View>
        </FormItem>
        <Gap height={30} />
        <View className={`footer ${this.props.helper.isIpx ? 'ipx' : ''}`}>
          <View className="holder">
            <View className="btn-wrapper"></View>
            <View className="gap"></View>
          </View>
          <View className="fixed">
            <View className="btn-wrapper">
              <View
                className={`btn ${this.state.theme}-background ${
                  this.state.disable ? 'disable' : ''
                }`}
                onClick={this.onSubmit}
              >
                提交、完成、冲鸭！
              </View>
            </View>
            <View className="gap"></View>
          </View>
        </View>
      </View>
    )
  }
}

export default PlanAdd
