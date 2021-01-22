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
type DateType = {
  year: number
  month: number
  date: number
}
type CommonItemType = {
  label: string
  value: string
}

type CreateDateRangeParamsType = {
  start?: Date
  end?: Date
  range?: number
  specificStart?: Array<Array<CommonItemType>>
  specificEnd?: Array<Array<CommonItemType>>
}

type PlanApiResType = {
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
  days: string
  beginTime: string
  endTime: string
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
  status: number
  days: Array<string>
  beginTime: string
  endTime: string
  beginTimeDate: Date
  endTimeDate: Date
  totalAchieve: number
  totalTimes: number
}
