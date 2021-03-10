declare const wx: any

import Taro from '@tarojs/taro'

export const getPlanByDate = async params => post(`getPlanByDate`, params)

export const getPlanList = async (params = {}) => post(`getPlanList`, params)

export const check = async params => post(`check`, params)

export const getCheckList = async params => post(`getCheckList`, params)

export const commonApi = async params => post(`common`, params)

async function post(name, data): Promise<any> {
  return new Promise((resolve, reject) => {
    wx.cloud.init()
    wx.cloud.callFunction({
      // 云函数名称
      name: name,
      // 传给云函数的参数
      data: data,
      success: function (res) {
        if (res.result.code === 333) {
          Taro.showModal({
            title: '提示',
            content: '网络不佳，请稍后重试'
          })
          reject()
        } else {
          resolve(res.result)
        }
      },
      fail: function (err) {
        Taro.hideLoading()
        Taro.showModal({
          title: '网络异常，请稍后再试',
          // title:
          //   err.errMsg.indexOf('request:fail') !== -1 ? '网络不给力' : '请求出错',
          showCancel: false,
          content: ''
        })
        console.error('[http error]: ', err)
      }
    })
  })
}
