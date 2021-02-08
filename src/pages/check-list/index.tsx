import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { connect } from 'react-redux'
import {
  ScrollView,
  View,
  Button,
  Text,
  Image,
  Block
} from '@tarojs/components'
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
  cur: string
  tabs: Array<PlanTabType>
  inited: boolean
  pageSize: number
  pageNo: number
  totalPage: number
  totalSize: number
  last: boolean
  list: Array<CheckListItemType>
}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

@connect(
  ({ helper }) => ({
    helper
  }),
  dispatch => ({})
)
class CheckList extends Component<IProps, IState> {
  block = false
  state = {
    tabs: [],
    cur: 'all',
    inited: false,
    pageSize: 15,
    pageNo: 1,
    totalPage: 0,
    totalSize: 0,
    last: false,
    list: []
  }
  componentDidMount() {
    this.fetchCheckList({
      pageSize: this.state.pageSize,
      pageNo: this.state.pageNo
    })
  }
  onShareAppMessage() {
    return {
      title: '排骨打卡',
      path: '/pages/home/index'
    }
  }
  onReachBottom = async () => {
    if (this.block) return
    if (this.state.pageNo < this.state.totalPage) {
      this.block = true
      await this.fetchCheckList({
        pageSize: this.state.pageSize,
        pageNo: this.state.pageNo + 1
      })
      this.block = false
    }
  }
  async fetchCheckList(pageInfo) {
    !this.state.inited &&
      Taro.showLoading({
        title: '加载中...'
      })
    const { code, list, totalSize, totalPage, pageSize, pageNo, tabs } = {
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
          planID: '28ee4e3e601cd6010304e6af6cf78473',
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
          planID: '28ee4e3e601a43f402aa8a9a294acb51',
          name: '读书',
          description: '如果能重来，希望做一个知识人',
          theme: 'theme12',
          icon: 'reading',
          category: 4,
          beginTime: 1609430400000,
          endTime: null
        },
        {
          planID: '79550af2601a7409026a6137022e9ca8',
          name: '打球',
          description: '又A又飒',
          theme: 'theme14',
          icon: 'badminton',
          category: 1,
          beginTime: 1609430400000,
          endTime: null
        },
        {
          planID: '79550af2601a7525026aa98d1a450897',
          name: '瑜伽',
          description: '要优雅~~',
          theme: 'theme11',
          icon: 'yoga',
          category: 1,
          beginTime: 1609430400000,
          endTime: null
        },
        {
          planID: '28ee4e3e601a799802b49d9200bd73a8',
          name: '跳绳',
          description: '从来、坚持、都不是、轻而易举',
          theme: 'theme20',
          icon: 'skipping',
          category: 1,
          beginTime: 1617206400000,
          endTime: 1635609600000
        },
        {
          planID: '1526e12a601a79f5020250253d35c871',
          name: '游泳',
          description: '想做一条鱼，在水里游来游去',
          theme: 'theme4',
          icon: 'swimming',
          category: 1,
          beginTime: 1609430400000,
          endTime: null
        }
      ],
      totalSize: 10,
      totalPage: 1,
      pageSize: 15,
      pageNo: 1
    }
    // await getCheckList({
    //   ...pageInfo,
    //   version: 'v2'
    // })
    const _list = list.map(l => {
      return {
        ...l,
        checkTime: formatDate(new Date(l.checkTime), 'yyyy.MM.dd hh:mm'),
        isShowComment: false
      }
    })
    if (code === 200) {
      this.setState({
        inited: true,
        list: [...this.state.list, ..._list],
        tabs: tabs,
        totalSize,
        totalPage,
        pageSize,
        pageNo,
        last: totalPage === pageNo
      })
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

  onPlanChange = cur => {
    this.setState({
      cur
    })
  }
  onDayClick = cur => {
    this.setState({
      cur
    })
  }

  render() {
    return (
      <View className={'check-list-page'}>
        <Calendar
          onDayClick={this.onDayClick}
          plans={this.state.tabs}
          curPlan={this.state.cur}
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
        ) : !this.state.list.length ? (
          <View className="has-plan-but-no-check">
            <Empty tip="还没有打卡记录，要加油了鸭！">
              <View className="go-check" onClick={this.gotoCheckPage}>
                <View>去打卡</View>
                <View className="iconfont icon-right-arrow" />
              </View>
            </Empty>
          </View>
        ) : (
          <Block>
            {this.state.list.map((l: CheckListItemType, index) => (
              <View className="check-item">
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
            {this.state.last ? (
              <View className="no-more">没有更多了嗷</View>
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
