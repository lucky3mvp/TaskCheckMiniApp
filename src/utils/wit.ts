declare const wx: any

interface Wit {
  login(): Promise<[any, any]>
  getUserInfo(opts?: any): Promise<[any, any]>
}

import { login } from './request'
import Global, { setGlobal } from './global'

export default {
  login: async () => {
    return await new Promise(resolve => {
      if (!Global.openID) {
        wx.login({
          success: async r => {
            const { openid } = await login({
              code: r.code
            })
            setGlobal({
              openID: openid
            })
            resolve([{ openID: openid }, null])
          },
          fail: e => {
            resolve([null, e])
          }
        })
      } else {
        resolve([
          {
            openID: Global.openID
          },
          null
        ])
      }
    })
  },
  getUserInfo: async (opts = {}) => {
    return await new Promise(res => {
      wx.getUserInfo({
        ...opts,
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
