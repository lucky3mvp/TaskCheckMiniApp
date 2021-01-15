import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Button, Block, Image } from '@tarojs/components'
import classnames from 'classnames'
import { updateUserInfo } from 'src/store/actions/userInfo'

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
  UnitMap
} from 'src/constants'
import { isIpx } from 'src/utils'

import './index.less'

type PageStateProps = {
  userInfo: UserInfoStoreType
}

type PageDispatchProps = {
  updateUserInfo: (_) => void
}

type PageOwnProps = {}

type IState = {
  isIpx: boolean
  bannerImgIndex: number
  name: string
  description: string
  theme: string
  icon: string
  unit: string
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

interface PlanAdd {
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
class PlanAdd extends Component<IProps, IState> {
  state = {
    isIpx: false,
    bannerImgIndex: 0,
    name: '',
    description: '',
    theme: 'theme28',
    icon: '',
    unit: '',
    goal: '',
    times: '',
    days: ['0', '1', '2', '3', '4', '5', '6'],
    type: '3', // 2-每日 3-每周 4-每月
    subType: '1', // 1-每周x天 2-每周周几
    beginTime: '',
    endTime: '',
    typeBtns: [],
    daysBtns: [],
    unitOptions: []
  }
  componentDidMount() {
    const index = Math.floor(Math.random() * BannerImgs.length)
    this.setState({
      isIpx: isIpx(),
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
  onNameChange = (name: string) => {
    this.setState({
      name
    })
  }
  onDescriptionChange = (description: string) => {
    this.setState({
      description
    })
  }
  onTypeChange = (o: CommonItemType) => {
    this.setState({
      type: o.value,
      subType: '1'
    })
  }
  onSubTypeChange = (subType: string) => {
    this.setState({
      subType
    })
  }
  onTimesChange = (t: string) => {
    this.setState({
      times: t
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
      days
    })
  }
  onGoalChange = (goal: string) => {
    this.setState({
      goal
    })
  }
  onUnitChange = (unit: string) => {
    this.setState({
      unit
    })
  }
  onChooseBeginTime = p => {
    console.log(p)
  }
  onChooseEndTime = p => {
    console.log(p)
  }
  onChooseIcon = (icon: string) => {
    this.setState({
      icon
    })
  }
  onChooseTheme = (theme: string) => {
    this.setState({
      theme
    })
  }
  onSubmit = () => {
    console.log(this.state)
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
                      type="text"
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
                placeholder="输入奋斗目标"
                maxlength={10}
                value={this.state.goal}
                onBlur={this.onGoalChange}
              />
            </View>
            <View className="picker">
              <Picker
                mode="selector"
                placeholder="请选择"
                value={this.state.unit}
                range={this.state.unitOptions}
                onChange={this.onUnitChange}
              />
            </View>
          </View>
        </FormItem>
        <FormItem label="时间">
          <View className="time-wrapper">
            <View className="picker">
              {/* datePicker 跟 picker 还是不一样的，datePicker 组件更自治 ㄟ( ▔, ▔ )ㄏ */}
              <DatePicker
                placeholder="开始时间"
                range={4}
                leftArrow
                onChange={this.onChooseBeginTime}
              />
            </View>
            <View className="line">——</View>
            <View className="picker">
              <DatePicker
                placeholder="结束时间"
                range={4}
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
        <View className={`footer ${this.state.isIpx ? 'ipx' : ''}`}>
          <View className="holder">
            <View className="btn-wrapper"></View>
            <View className="gap"></View>
          </View>
          <View className="fixed">
            <View className="btn-wrapper">
              <View
                className={`btn ${this.state.theme}-background`}
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
