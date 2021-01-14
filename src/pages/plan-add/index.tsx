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
  theme: string
  icon: string
  unit: number
  goal: string
  times: number
  days: number[]
  type: number
  subType: number
  beginTime: string | number
  endTime: string | number
  typeBtns: Array<CommonItemType>
  daysBtns: Array<CommonItemType>
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
    theme: 'theme28',
    icon: '',
    unit: 1,
    goal: '1',
    times: 1,
    days: [0, 1, 2],
    type: 3,
    subType: 1, // 1-每周x天 2-每周周几
    beginTime: '',
    endTime: '',
    typeBtns: [],
    daysBtns: []
  }
  componentDidMount() {
    const index = Math.floor(Math.random() * BannerImgs.length)
    this.setState({
      isIpx: isIpx(),
      bannerImgIndex: index,
      typeBtns: Object.keys(TypeMap).map(t => ({
        label: TypeMap[t],
        value: +t
      })),
      daysBtns: Weekdays.map((t, i) => ({
        label: t,
        value: i
      }))
    })
  }
  onTypeChange = (o: CommonItemType) => {
    this.setState({
      type: +o.value
    })
  }
  onSubTypeChange = () => {
    this.setState({})
  }
  onTimesChange = t => {
    this.setState({
      times: t
    })
  }
  onDaysChange = (o: CommonItemType) => {
    this.setState({
      type: +o.value
    })
  }
  onChooseIcon = icon => {
    this.setState({
      icon
    })
  }
  onChooseTheme = theme => {
    this.setState({
      theme
    })
  }

  render() {
    return (
      <View className="plan-add-page">
        <Image
          src={BannerImgs[this.state.bannerImgIndex]}
          mode="widthFix"
          className="banner"
        />
        <View className="icon iconfont icon-right-arrow"></View>
        <View className="icon iconfont icon-liebiao"></View>
        <View className="icon iconfont icon-home"></View>
        <FormTitle title="基础信息" />
        <FormItem label="计划名">
          <SelfInput type="text" placeholder="取个名字吧~" />
        </FormItem>
        <FormItem label="描述语">
          <SelfInput type="text" placeholder="一句话激励自己~" maxlength={50} />
        </FormItem>
        <FormItem label="频率" hideBorderBottom={this.state.type !== 2}>
          <View className="type-wrapper">
            <BtnGroup
              btns={this.state.typeBtns}
              value={this.state.type}
              theme={this.state.theme}
              onChange={this.onTypeChange}
            />
          </View>
        </FormItem>
        {this.state.type === 3 || this.state.type === 4 ? (
          <View className="sub-type-wrapper border-bottom">
            <View className="sub-type-inner">
              {this.state.type === 3 ? (
                <View className="week">
                  <View className="indicator"></View>
                  <View className="sub-type-item">
                    <View className="radio">
                      <Radio
                        theme={this.state.theme}
                        checked={this.state.subType === 1}
                        onChange={this.onSubTypeChange}
                      />
                    </View>

                    <View className="txt">{TypeMap[this.state.type]}</View>
                    <View className="ipt">
                      <SelfInput
                        type="text"
                        placeholder=" 1 - 7 "
                        onBlur={this.onTimesChange}
                      />
                    </View>
                    <View className="txt">天</View>
                  </View>
                  <View className="sub-type-item sec">
                    <View className="radio">
                      <Radio
                        theme={this.state.theme}
                        checked={this.state.subType === 2}
                        onChange={this.onSubTypeChange}
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
                </View>
              ) : null}
              {this.state.type === 4 ? (
                <View className="month">
                  <View className="indicator"></View>
                  444
                </View>
              ) : null}
            </View>
          </View>
        ) : null}
        <FormItem label="目标">
          <View className="goal-wrapper">
            <SelfInput />米
          </View>
        </FormItem>
        {/* begintime endtime times days unit goal */}
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
            <View
              className={classnames(`icon-uncheck`, {
                'icon-item': true,
                iconfont: true,
                [`icon-default-color`]: true
              })}
            />
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
              <View className={`btn ${this.state.theme}-background`}>
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
