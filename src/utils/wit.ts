declare const wx: any
import { commonApi } from './request2.0'

interface Wit {
  login(): Promise<[any, any]>
  getUserInfo(opts?: any): Promise<[any, any]>
  getUserProfile(opts?: any): Promise<[any, any]>
}

export default {
  login: async () => {
    return await new Promise(async resolve => {
      const res = await commonApi({
        _scope: 'login',
        _type: 'getUserProfile'
      })
      resolve(res)
    })
  },
  getUserInfo: async (opts = {}) => {
    return await new Promise(res => {
      wx.getUserInfo({
        ...opts,
        success: r => {
          console.log('aa', r)
          res([r.userInfo, null])
        },
        fail: e => {
          console.log('bb', e)
          res([null, e])
        }
      })
    })
  },
  getUserProfile: async (opts = {}) => {
    return await new Promise(res => {
      wx.getUserProfile({
        ...opts,
        desc: '获取信息',
        success: r => {
          res([r.userInfo, null])
        },
        fail: e => {
          res([null, e])
        }
      })
    })
  }
} as Wit
