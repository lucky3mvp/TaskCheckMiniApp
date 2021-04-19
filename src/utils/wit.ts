declare const wx: any

interface Wit {
  login(): Promise<[any, any]>
  getUserInfo(opts?: any): Promise<[any, any]>
  getUserProfile(opts?: any): Promise<[any, any]>
}

export default {
  login: async () => {
    return await new Promise(resolve => {
      //   // 减少请求
      //   const openID = Taro.getStorageSync('openID') || Global.openID
      //   if (!openID) {
      //     // // 用假数据，没公网接口
      //     // const t = Date.now()
      //     // setGlobal({
      //     //   openID: t
      //     // })
      //     // Taro.setStorageSync('openID', t)
      //     // resolve([{ openID: t }, null])
      //     wx.login({
      //       success: async r => {
      //         const { code, openID } = await login({
      //           code: r.code
      //         })
      //         if (code === 200) {
      //           setGlobal({
      //             openID: openID
      //           })
      //           Taro.setStorageSync('openID', openID)
      //           resolve([{ openID: openID }, null])
      //         } else {
      //           resolve([null, { msg: 'login error' }])
      //         }
      //       },
      //       fail: e => {
      //         resolve([null, e])
      //       }
      //     })
      //   } else {
      //     setGlobal({
      //       openID: openID
      //     })
      //     Taro.setStorageSync('openID', openID)
      //     resolve([
      //       {
      //         openID: openID
      //       },
      //       null
      //     ])
      //   }
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
