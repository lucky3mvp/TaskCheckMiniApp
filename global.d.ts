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
