declare module '*.png'
declare module '*.gif'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.svg'
declare module '*.css'
declare module '*.less'
declare module '*.scss'
declare module '*.sass'
declare module '*.styl'

// @ts-ignore
declare const process: {
  env: {
    TARO_ENV:
      | 'weapp'
      | 'swan'
      | 'alipay'
      | 'h5'
      | 'rn'
      | 'tt'
      | 'quickapp'
      | 'qq'
      | 'jd'
    NODE_ENV: 'production' | 'development'
    [key: string]: any
  }
}

type UserInfoStoreType = {
  isLogin: boolean
  openID: string
  avatarUrl: string
  gender: number
  nickName: string
}
type HelperStoreType = {
  isIpx: boolean
  statusBarHeight: number
  windowWidth: number
}

type DateType = {
  year: number
  month: number
  date: number
}
type CommonItemType = {
  label: string
  value: string
}
type MenstruationType = {
  year: number
  month: number
  day: number
  type: number
}

type CreateDateRangeParamsType = {
  start?: Date
  end?: Date
  range?: number
  specificStart?: Array<Array<CommonItemType>>
  specificEnd?: Array<Array<CommonItemType>>
}

type PlanType = {
  planID: string
  name: string
  description: string
  theme: string
  icon: string
  category: number
  unit: string
  goal: number
  type: number
  subType: number
  times: number
  /*
    前端的status
    - 1-未开始
    - 2-进行中
    - 3-已结束
    - 4-暂停
  */
  status: number
  days: string // 接口返回的是string,没做split
  beginTime: number
  endTime: number
  totalAchieve: number
  /**
   * 累计完成的次数
   * 指的是计划在当前计划周期内，完成了多少次
   * 比如计划是每周5次xxx
   * 那么这里的totalTimes指的是本周这个计划当前完成了多少次
   * 使用的地方如：今日打卡页的dot指示
   */
  totalTimes: number
  weekTimes?: number
  monthTimes?: number
  /**
   * 累计打卡的次数
   * eg: 目标是每次跑5km，但某次打卡，可能只跑了3km，此时不会记成完成状态，但会记录此次打卡
   * 因此 totalTimes 不会包含本次打卡，
   * 但 totalCheckTimes 会包含本次打卡
   */
  totalCheckTimes: number
}

type PlanTabType = {
  planID: string
  name: string
  description: string
  theme: string
  icon: string
  category: number
  beginTime: number
  endTime: number | null
}

type CheckListItemType = {
  planID: string
  comment: string
  checkTime: string
  actualCheckTime: string
  achieve: number
  name: string
  icon: string
  theme: string
  unit: string
  isShowComment?: boolean
}

type ReadingListItemType = {
  _id: string
  name: string
  /**
   * status
   * 1-未读
   * 2-在读
   * 3-读完
   */
  status: number
  cover: string
  comment: string
  createTime: number
  beginTime?: number
  finishTime?: number
}

type DaysItemType = {
  _id: string
  name: string
  category: string
  date: number
  dateFormat: string
  createTime: number
  dayCount: number
  notifyTime?: number | null
  isTop: boolean
  cover: string
  /**
   * status
   * 1-正常
   * 2-已删除
   */
  status: number
  userID: string
}

type DaysCategoryType = {
  _id: string
  name: string
  icon: string
  /**
   * status
   * 1-正常
   * 2-已删除
   */
  status: number
}
