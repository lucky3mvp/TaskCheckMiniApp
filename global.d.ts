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
    - 1-未开始
    - 2-进行中
    - 3-已结束
    - 4-暂停
  */
  status: number
  days: Array<string>
  beginTime: number
  endTime: number
  totalAchieve: number
  /**
   * 指的是计划在当前计划周期内，完成了多少次
   * 比如计划是每周5次xxx
   * 那么这里的totalTimes指的是本周这个计划当前完成了多少次
   * 使用的地方如：今日打卡页的dot指示
   */
  totalTimes: number
}

type CheckListItemType = {
  planID: string
  comment: string
  checkDate: string
  checkTime: string
  achieve: number
  name: string
  icon: string
  theme: string
  unit: string
  isShowComment?: boolean
}
