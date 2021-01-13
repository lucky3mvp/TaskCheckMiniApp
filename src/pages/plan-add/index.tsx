import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, Button, Block, Image } from '@tarojs/components'
import classnames from 'classnames'
import { updateUserInfo } from 'src/store/actions/userInfo'

import FormItem from 'src/components/FormItem'
import FormTitle from 'src/components/FormTitle'
import Gap from 'src/components/Gap'
import BtnGroup from 'src/components/BtnGroup'

import SelfInput from 'src/components/SelfInput'

import { BannerImgs, Themes, Icons, TypeMap } from 'src/constants'
import { isIpx } from 'src/utils'

import './index.less'

type PageStateProps = {
  userInfo: UserInfoStoreType
}

type PageDispatchProps = {
  updateUserInfo: (_) => void
}

type PageOwnProps = {}

type PageState = {
  isIpx: boolean
  bannerImgIndex: number
  theme: string
  icon: string
  unit: string
  goal: string
  detail: number
  details: number[]
  type: number
  beginTime: string | number
  endTime: string | number
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
class PlanAdd extends Component {
  state = {
    isIpx: false,
    bannerImgIndex: 0,
    theme: 'theme28',
    icon: '',
    unit: '',
    goal: '',
    detail: 1,
    details: [],
    type: 2,
    beginTime: '',
    endTime: '',
    typeBtns: []
  }
  componentDidMount() {
    const index = Math.floor(Math.random() * BannerImgs.length)
    this.setState({
      isIpx: isIpx(),
      bannerImgIndex: index,
      typeBtns: Object.keys(TypeMap).map(t => ({
        label: TypeMap[t],
        value: +t
      }))
    })
  }
  onChooseTheme = theme => {
    this.setState({
      theme
    })
  }
  onTypeChange = (o: CommonItemType) => {
    this.setState({
      type: o.value
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
        <FormTitle title="基础信息" />
        <FormItem label="计划名">
          <SelfInput type="text" placeholder="取个名字吧~" />
        </FormItem>
        <FormItem label="描述语">
          <SelfInput type="text" placeholder="一句话激励自己~" maxlength={50} />
        </FormItem>
        <FormItem label="频率">
          <View className="type-wrapper">
            <BtnGroup
              btns={this.state.typeBtns}
              value={this.state.type}
              theme={this.state.theme}
              onChange={this.onTypeChange}
            />
            {this.state.type === 3 ? (
              <View className="type-detail-info three">
                444
                <View className="indicator"></View>
              </View>
            ) : null}
            {this.state.type === 4 ? (
              <View className="type-detail-info three">
                <View className="indicator"></View>
                444
              </View>
            ) : null}
          </View>
        </FormItem>
        {/* begintime endtime times days unit goal */}
        <Gap height={20} />
        <FormTitle title="主题信息" />
        <FormItem label="图标" vertical>
          <View className="icon-wrapper">
            {Icons.map(t => (
              <View
                className={`icon-item iconfont icon-${t}`}
                onClick={this.onChooseTheme.bind(this, t)}
              />
            ))}
          </View>
        </FormItem>
        <FormItem label="颜色" vertical hideBorderBottom>
          <View className="theme-wrapper">
            {Themes.map(t => (
              <View
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
