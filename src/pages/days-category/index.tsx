import React, { Component } from 'react'
import { connect } from 'react-redux'
import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import { DaysCategoryIcons } from 'src/constants/config'

import Empty from 'src/components/Empty'
import Popup from 'src/components/Popup'
import FormItem from 'src/components/FormItem'
import SelfInput from 'src/components/SelfInput'
import Footer from 'src/components/Footer'

import manualEvent from 'src/utils/manualEvent'

import { commonApi } from 'src/utils/request2.0'

import './index.less'

type PageStateProps = {}

type PageDispatchProps = {}

type PageOwnProps = {}

type IState = {
  loading: boolean
  isShowAddPopup: boolean
  isShowEditPopup: boolean
  name: string
  icon: string
  list: DaysCategoryType[]
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect()
class DaysCategory extends Component<IProps, IState> {
  lock = false
  editItem: DaysCategoryType = {} as DaysCategoryType
  state = {
    loading: true,
    isShowAddPopup: false,
    isShowEditPopup: false,
    name: '',
    icon: '',
    list: []
  }
  async componentDidMount() {
    this.getCategoryList()
  }

  componentDidShow() {}

  onShareAppMessage() {
    return {
      title: '排骨打卡',
      path: '/pages/check/index'
    }
  }

  async getCategoryList(showLoading = false) {
    showLoading &&
      Taro.showLoading({
        title: '加载中...'
      })
    const { code, categories = [] } = await commonApi({
      _scope: 'days',
      _type: 'fetchCategory'
    })
    if (code === 200) {
      this.setState({
        loading: false,
        list: categories
      })
    }
    // this.setState({
    //   loading: false,
    //   list: [
    //     {
    //       _id: '1111',
    //       name: '生活',
    //       icon: 'life',
    //       status: 1
    //     }
    //   ]
    // })
    Taro.hideLoading()
  }
  onNameChange = (name: string) => {
    this.setState({
      name
    })
  }
  onChooseIcon = (icon: string) => {
    this.setState({
      icon
    })
  }
  onShowAddPopup = () => {
    this.setState({
      isShowAddPopup: true
    })
  }
  onHideAddPopup = () => {
    this.setState(
      {
        isShowAddPopup: false
      },
      () => {
        this.setState({
          name: '',
          icon: ''
        })
      }
    )
  }
  onAdd = async () => {
    if (!this.state.name) return
    if (this.lock) return
    this.lock = true
    Taro.showLoading({
      title: '请求中'
    })
    const { code } = await commonApi({
      _scope: 'days',
      _type: 'submitCategory',
      name: this.state.name,
      icon: this.state.icon
    })
    if (code === 200) {
      manualEvent.change('days-add-page', 'update days category')
      manualEvent.change('days-list-page', 'update days category')
      Taro.showToast({
        title: '新增分类成功'
      })
      this.getCategoryList(false)
      setTimeout(() => {
        this.onHideAddPopup()
      }, 1500)
    } else {
      Taro.showToast({
        title: '出错了，一会再试吧',
        icon: 'none'
      })
    }
    this.lock = false
    Taro.hideLoading()
  }

  onShowEditPopup = (c: DaysCategoryType) => {
    this.editItem = c
    this.setState({
      name: c.name,
      icon: c.icon,
      isShowEditPopup: true
    })
  }
  onHideEditPopup = () => {
    this.setState(
      {
        isShowEditPopup: false
      },
      () => {
        this.setState({
          name: '',
          icon: ''
        })
      }
    )
  }

  onEdit = async () => {
    if (!this.state.name) return
    if (this.lock) return
    this.lock = true
    Taro.showLoading({
      title: '请求中'
    })
    const { code } = await commonApi({
      _scope: 'days',
      _type: 'updateCategory',
      id: this.editItem._id,
      name: this.state.name,
      icon: this.state.icon
    })
    if (code === 200) {
      manualEvent.change('days-add-page', 'update days category')
      manualEvent.change('days-list-page', 'update days category')
      Taro.showToast({
        title: '编辑分类成功'
      })
      this.getCategoryList(false)
      setTimeout(() => {
        this.onHideEditPopup()
      }, 1500)
    } else {
      Taro.showToast({
        title: '出错了，一会再试吧',
        icon: 'none'
      })
    }
    this.lock = false
    Taro.hideLoading()
  }

  onDelete = c => {
    Taro.showModal({
      title: '提示',
      content: '确定要删除该分类嘛？',
      success: async res => {
        if (res.confirm) {
          if (this.lock) return
          this.lock = true
          Taro.showLoading({
            title: '请求中'
          })
          const { code } = await commonApi({
            _scope: 'days',
            _type: 'deleteCategory',
            id: c._id
          })
          if (code === 200) {
            manualEvent.change('days-add-page', 'update days category')
            manualEvent.change('days-list-page', 'update days category')
            Taro.showToast({
              title: '删除成功'
            })
            this.getCategoryList(false)
          } else {
            Taro.showToast({
              title: '出错了，一会再试吧',
              icon: 'none'
            })
          }
          this.lock = false
          Taro.hideLoading()
        }
      }
    })
  }

  render() {
    return this.state.loading ? null : (
      <View className="days-category-page">
        {!this.state.list.length ? <Empty tip="还没有分类哦~" /> : null}
        {this.state.list.map((c: DaysCategoryType) => (
          <View className="category border-bottom">
            <Image
              src={require(`../../assets/days/${c.icon}.png`)}
              className="img"
            />
            <View className="name">{c.name}</View>
            <View
              className="iconfont icon-edit"
              onClick={this.onShowEditPopup.bind(this, c)}
            />
            <View
              className="iconfont icon-delete"
              onClick={this.onDelete.bind(this, c)}
            />
          </View>
        ))}
        <Footer text="新增分类" onClick={this.onShowAddPopup} />
        <Popup
          maskCloseable
          title="新增分类"
          visible={this.state.isShowAddPopup}
          onClose={this.onHideAddPopup}
        >
          <View className="days-category-page-add-module">
            <FormItem label="名称">
              <SelfInput
                type="text"
                placeholder="请输入分类名称"
                maxlength={20}
                value={this.state.name}
                onBlur={this.onNameChange}
                onInput={this.onNameChange}
              />
            </FormItem>
            <FormItem label="图标" vertical>
              <View className="img-wrapper">
                {DaysCategoryIcons.map(i => (
                  <View
                    className={`img-item ${
                      i === this.state.icon ? 'active' : ''
                    }`}
                  >
                    <Image
                      key={i}
                      className="img"
                      src={require(`../../assets/days/${i}.png`)}
                      onClick={this.onChooseIcon.bind(this, i)}
                    />
                  </View>
                ))}
              </View>
            </FormItem>

            <Footer
              text="提交"
              onClick={this.onAdd}
              disable={!this.state.name || !this.state.icon}
            />
          </View>
        </Popup>
        <Popup
          maskCloseable
          title="编辑分类"
          visible={this.state.isShowEditPopup}
          onClose={this.onHideEditPopup}
        >
          <View className="days-category-page-add-module">
            <FormItem label="名称">
              <SelfInput
                type="text"
                placeholder="请输入分类名称"
                maxlength={20}
                value={this.state.name}
                onBlur={this.onNameChange}
                onInput={this.onNameChange}
              />
            </FormItem>
            <FormItem label="图标" vertical>
              <View className="img-wrapper">
                {DaysCategoryIcons.map(i => (
                  <View
                    className={`img-item ${
                      i === this.state.icon ? 'active' : ''
                    }`}
                  >
                    <Image
                      key={i}
                      className="img"
                      src={require(`../../assets/days/${i}.png`)}
                      onClick={this.onChooseIcon.bind(this, i)}
                    />
                  </View>
                ))}
              </View>
            </FormItem>

            <Footer
              text="提交"
              onClick={this.onEdit}
              disable={!this.state.name || !this.state.icon}
            />
          </View>
        </Popup>
      </View>
    )
  }
}

export default DaysCategory
