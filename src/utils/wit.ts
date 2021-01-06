declare const wx: any
declare const wit: Wit

interface Wit {
  login(): Promise<[any | null, any]>
}

import { login } from './request'
import Global, {setGlobal} from './global'

export default {
  login: async () => {
    return await new Promise(resolve => {
      if (!Global.openID) {
        wx.login({
          success: async (r) => {
            const { openid } = await login({
              code: r.code
            })
            setGlobal({
              openID: openid
            })
            resolve([
              { code: r.code, openID: openid },
              null
            ])
          },
          fail: e => {
            resolve([null, e])
          }
        })
      } else {
        resolve([{
          openID: Global.openID
        }, null])
      }
    })
  },
} as Wit
