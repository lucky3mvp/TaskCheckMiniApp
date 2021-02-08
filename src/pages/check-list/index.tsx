import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import { View, Block } from '@tarojs/components'
import Empty from 'src/components/Empty'
import Gap from 'src/components/Gap'
import { UnitMap } from 'src/constants/config'
import { getCheckList } from 'src/utils/request2.0'
import { formatDate } from 'src/utils'

import './index.less'
import Calendar from './Calendar'

type PageStateProps = {
  helper: HelperStoreType
}

type PageDispatchProps = {}

type PageOwnProps = {}

type IState = {
  inited: boolean
  curPlan: string
  selectedDate: string
  tabs: Array<PlanTabType>
  list: Array<CheckListItemType>
  listOrigin: Array<CheckListItemType>
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect(
  ({ helper }) => ({
    helper
  }),
  dispatch => ({})
)
class CheckList extends Component<IProps, IState> {
  cache: Record<string, any> = {}
  block = false
  state = {
    inited: false,
    curPlan: 'all',
    selectedDate: formatDate(new Date(), 'yyyy/MM/dd'),
    tabs: [],
    list: [],
    listOrigin: []
  }
  componentDidMount() {
    this.fetchCheckList()
  }
  onShareAppMessage() {
    return {
      title: '排骨打卡',
      path: '/pages/home/index'
    }
  }
  async fetchCheckList(paramDate = '') {
    !this.state.inited &&
      Taro.showLoading({
        title: '加载中...'
      })
    const { curPlan, selectedDate } = this.state
    const date = paramDate || selectedDate
    if (this.cache[`${date}`]) {
      console.log('命中cache，不会请求')
      const listOrigin = this.cache[`${date}`]
      this.setState({
        listOrigin: listOrigin,
        list:
          curPlan === 'all'
            ? listOrigin
            : listOrigin.filter((l: CheckListItemType) => {
                return l.planID === curPlan
              })
      })
      return
    }

    console.log('未命中cache，发起请求')
    const { code, list, tabs } = {
      code: 200,
      list: [
        {
          planID: 'b00064a7601be60102cbd3901430caa9',
          comment: '',
          checkTime: 1612754550998,
          achieve: 2,
          name: '每天喝水4杯',
          icon: 'yangsheng',
          theme: 'theme28',
          unit: '1'
        },
        {
          planID: 'b00064a7601be60102cbd3901430caa9',
          comment: '',
          checkTime: 1612698378056,
          achieve: 1,
          name: '每天喝水4杯',
          icon: 'yangsheng',
          theme: 'theme28',
          unit: '1'
        },
        {
          planID: 'b00064a7601be60102cbd3901430caa9',
          comment: '',
          checkTime: 1612690543077,
          achieve: 1,
          name: '每天喝水4杯',
          icon: 'yangsheng',
          theme: 'theme28',
          unit: '1'
        },
        {
          planID: '3b020ca3601be719028300f1295d0412',
          comment: '',
          checkTime: 1612679416076,
          achieve: 1,
          name: '每周游泳3次',
          icon: 'swimming',
          theme: 'theme12',
          unit: '1'
        },
        {
          planID: 'b00064a7601be60102cbd3901430caa9',
          comment: '',
          checkTime: 1612668030587,
          achieve: 2,
          name: '每天喝水4杯',
          icon: 'yangsheng',
          theme: 'theme28',
          unit: '1'
        },
        {
          planID: 'b00064a7601be60102cbd3901430caa9',
          comment: '',
          checkTime: 1612507062758,
          achieve: 1,
          name: '每天喝水4杯',
          icon: 'yangsheng',
          theme: 'theme28',
          unit: '1'
        },
        {
          planID: 'b00064a7601be60102cbd3901430caa9',
          comment: '',
          checkTime: 1612507030840,
          achieve: 1,
          name: '每天喝水4杯',
          icon: 'yangsheng',
          theme: 'theme28',
          unit: '1'
        },
        {
          planID: '79550af26020fa8c035be97b08f5ecee',
          comment: '',
          checkTime: 1612502542498,
          achieve: 1,
          name: '每周瑜伽两次',
          icon: 'yoga',
          theme: 'theme8',
          unit: '1'
        },
        {
          planID: '79550af2601be79a029a8fc95ce6ff04',
          comment: '',
          checkTime: 1612493418589,
          achieve: 1,
          name: '每周跳绳3次',
          icon: 'skipping',
          theme: 'theme20',
          unit: '1'
        },
        {
          planID: 'b00064a7601be60102cbd3901430caa9',
          comment: '',
          checkTime: 1612493388788,
          achieve: 1,
          name: '每天喝水4杯',
          icon: 'yangsheng',
          theme: 'theme28',
          unit: '1'
        }
      ],
      tabs: [
        {
          planID: 'b00064a7601be60102cbd3901430caa9',
          name: '每天喝水4杯',
          description: '多喝热水！',
          theme: 'theme28',
          icon: 'yangsheng',
          category: 3,
          beginTime: 1612396800000,
          endTime: null
        },
        {
          planID: '28ee4e3e6020fa6903bb53880cca4aaa',
          name: '每周跳绳3次',
          description: '夏天要到了',
          theme: 'theme19',
          icon: 'skipping',
          category: 1,
          beginTime: 1612742400000,
          endTime: null
        },
        {
          planID: '79550af26020fa8c035be97b08f5ecee',
          name: '每周瑜伽2次',
          description: '夏天要到了',
          theme: 'theme8',
          icon: 'yoga',
          category: 1,
          beginTime: 1612742400000,
          endTime: null
        },
        {
          planID: '79550af26020fb23035c0d6b7caeb3d5',
          name: '每周读书/文章',
          description: '读书人是人上人！',
          theme: 'theme10',
          icon: 'reading',
          category: 4,
          beginTime: 1612742400000,
          endTime: null
        }
      ]
    }
    // await getCheckList({
    //   date: date,
    //   returnPlanTabs: !this.state.inited, // 后面的请求就不用再请求tabs了
    //   version: 'v2'
    // })
    if (code === 200) {
      const lo = list.map(l => {
        return {
          ...l,
          checkTime: formatDate(new Date(l.checkTime), 'yyyy.MM.dd hh:mm'),
          isShowComment: false
        }
      })
      this.setState({
        inited: true,
        listOrigin: lo,
        list:
          curPlan === 'all'
            ? lo
            : lo.filter((l: CheckListItemType) => {
                return l.planID === curPlan
              }),
        tabs: tabs
      })
      this.cache[`${date}`] = lo
    }
    Taro.hideLoading()
  }
  gotoCheckPage = () => {
    Taro.switchTab({
      url: '/pages/check/index'
    })
  }
  onClickComment = (index: number) => {
    const { list } = this.state
    const item: CheckListItemType = list[index]
    if (!item.comment) return
    item.isShowComment = !item.isShowComment
    this.setState({
      list: [...list]
    })
  }
  onPlanChange = planTab => {
    const { listOrigin } = this.state
    this.setState({
      curPlan: planTab,
      list:
        planTab === 'all'
          ? listOrigin
          : listOrigin.filter((l: CheckListItemType) => {
              return l.planID === planTab
            })
    })
  }
  onDayClick = ({ year, month, date }) => {
    const d = `${year}/${month < 10 ? '0' : ''}${month}/${
      date < 10 ? '0' : ''
    }${date}`

    if (year < 2021) {
      this.setState({
        curPlan: 'all', // 切换的时候默认换到全部？
        selectedDate: d,
        listOrigin: [],
        list: []
      })
      return
    }

    this.setState(
      {
        curPlan: 'all', // 切换的时候默认换到全部？
        selectedDate: d
      },
      () => {
        this.fetchCheckList(d)
      }
    )
  }

  render() {
    return (
      <View className={'check-list-page'}>
        <Calendar
          onDayClick={this.onDayClick}
          plans={this.state.tabs}
          curPlan={this.state.curPlan}
          onPlanChange={this.onPlanChange}
        />

        {!this.state.inited ? null : !this.state.tabs.length ? (
          <View className="no-plan-no-no-check">
            <Empty tip="今天没有打卡任务，enjoy your day~">
              <View className="go-check" onClick={this.gotoCheckPage}>
                <View>去建计划</View>
                <View className="iconfont icon-right-arrow" />
              </View>
            </Empty>
          </View>
        ) : !this.state.listOrigin.length ? (
          <View className="has-plan-but-no-check">
            <Empty tip="还没有打卡记录，要加油了鸭！">
              <View className="go-check" onClick={this.gotoCheckPage}>
                <View>去打卡</View>
                <View className="iconfont icon-right-arrow" />
              </View>
            </Empty>
          </View>
        ) : !this.state.list.length ? (
          <View className="no-more">暂无数据~</View>
        ) : (
          <Block>
            {this.state.list.map((l: CheckListItemType, index) => (
              <View className="check-item" key={`${l.planID}${index}`}>
                <View className="inner border-bottom">
                  <View
                    className={`plan-icon iconfont icon-${l.icon} ${l.theme}-color`}
                  />
                  <View className="info">
                    <View className="detail-item">
                      <View className="name">{l.name}</View>
                      <View className="achieve">
                        {l.achieve} {UnitMap[l.unit]}
                      </View>
                    </View>
                    <View className="detail-item">
                      <View className="time">{l.checkTime}</View>
                      {l.comment ? (
                        <View
                          className="check-comment"
                          onClick={this.onClickComment.bind(null, index)}
                        >
                          查看打卡心情
                        </View>
                      ) : null}
                    </View>
                    <View
                      className={`detail-item comment-wrapper ${
                        l.isShowComment ? 'show' : ''
                      }`}
                    >
                      <View className="indicator" />
                      <View className="comment">{l.comment}</View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
            {this.state.list.length ? (
              <View className="no-more">没有更多了嗷~</View>
            ) : null}
            {this.props.helper.isIpx ? (
              <Gap height={34} bkg="transparent" />
            ) : null}
          </Block>
        )}
      </View>
    )
  }
}

export default CheckList
