import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import classnames from 'classnames'

import FormItem from 'src/components/FormItem'
import FormTitle from 'src/components/FormTitle'
import Gap from 'src/components/Gap'

import SelfInput from 'src/components/SelfInput'

import {
  Themes,
  Icons,
  TypeMap,
  SimpleWeekdays,
  UnitMap,
  IconCategoryMap
} from 'src/constants'
import { updatePlan, deletePlan } from 'src/utils/request2.0'
import { formatDate } from 'src/utils'

import './index.less'
import manualEvent from 'src/utils/manualEvent'

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
  name: string
  description: string
  detail: string
  theme: string
  icon: string
  beginTime: string
  endTime: string
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface PlanAdd {
  props: IProps
}

@connect(
  ({ helper }) => ({
    helper
  }),
  dispatch => ({})
)
class PlanAdd extends Component<IProps, IState> {
  lock = false
  plan: PlanType = {} as PlanType
  state = {
    disable: false,
    name: '',
    description: '',
    detail: '',
    theme: '',
    icon: '',
    beginTime: '',
    endTime: ''
  }
  componentDidMount() {
    this.plan = Taro.getStorageSync('plan')
    Taro.removeStorageSync('plan')
    const {
      name,
      description,
      theme,
      icon,
      type,
      subType,
      goal,
      unit,
      times,
      days,
      beginTime,
      endTime
    } = this.plan

    let detail = `${TypeMap[type]}`
    if (type === 2) {
      detail += ` ${goal} ${UnitMap[unit]}`
    } else if (type === 3) {
      if (subType === 1) {
        detail += ` ${times} 天`
      } else if (subType === 2) {
        detail += `${days.map(d => SimpleWeekdays[d]).join('、')}`
      }
      detail += ` ${goal} ${UnitMap[unit]}`
    } else if (type === 4) {
      if (subType === 1) {
        detail += ` ${times} 天`
      }
      detail += ` ${goal} ${UnitMap[unit]}`
    }
    this.setState({
      name,
      description,
      theme,
      icon,
      detail,
      beginTime: formatDate(new Date(beginTime), 'yyyy.MM.dd'),
      endTime: endTime ? formatDate(new Date(endTime), 'yyyy.MM.dd') : '永远'
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
      this.getValue('icon', exception)
    )
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
    if (this.state.disable) return

    const {
      name: _name,
      description: _description,
      theme: _theme,
      icon: _icon
    } = this.plan
    const { name, description, theme, icon } = this.state
    if (
      _name === name &&
      description === _description &&
      theme === _theme &&
      icon === _icon
    ) {
      Taro.showToast({
        title: '没有修改计划'
      })
      return
    }

    if (this.lock) return
    this.lock = true
    Taro.showLoading({
      title: '请求中'
    })

    const res = await updatePlan({
      planID: this.plan.planID,
      name: this.state.name,
      description: this.state.description,
      theme: this.state.theme,
      icon: this.state.icon,
      category: IconCategoryMap[this.state.icon]
    })
    if (res.code === 200) {
      Taro.hideLoading()
      Taro.showToast({
        title: '修改成功'
      })
      manualEvent.change('plan-list-page', 'update plan list')
      manualEvent.change('home-page', 'update plan tab list')
      manualEvent.change('check-page', 'update check list')
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    }
    Taro.hideLoading()
    this.lock = false
  }

  onDelete = () => {
    Taro.showModal({
      title: '提示',
      content: '确认删除该计划吗？',
      success: async res => {
        if (res.confirm) {
          if (this.lock) return
          this.lock = true
          Taro.showLoading({
            title: '请求中'
          })
          await deletePlan({
            planID: this.plan.planID
          })
          Taro.showToast({
            title: '删除成功'
          })
          manualEvent.change('plan-list-page', 'update plan list')
          setTimeout(() => {
            Taro.navigateBack()
          }, 1500)
          Taro.hideLoading()
          this.lock = false
        } else if (res.cancel) {
        }
      }
    })
  }

  render() {
    return (
      <View className="plan-add-page">
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
        <FormItem label="详情">
          <View className="text">{this.state.detail}</View>
        </FormItem>
        <FormItem label="时间">
          <View className="text">
            {this.state.beginTime}
            <View className="line">—</View>
            {this.state.endTime}
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
        <FormItem label="颜色" vertical>
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
        <View className="del" onClick={this.onDelete}>
          删除计划
        </View>
        <Gap height={20} />
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
                更新计划
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
