import Taro from '@tarojs/taro'
import config from '../../host'
import Global from './global'

function addHeader(params = {}) {
  return {
    header: {
      uid: Global.openID,
      isTest: process.env.NODE_ENV === 'production' ? 0 : 1
    },
    ...params
  }
}

export const login = async params =>
  post(`${config.server.prefix}/login`, addHeader(params))

export const submitPlan = async params =>
  post(`${config.server.prefix}/submitPlan`, addHeader(params))

export const getPlanByDate = async params =>
  post(`${config.server.prefix}/getPlanByDate`, addHeader(params))

export const getPlanList = async (params?) =>
  post(`${config.server.prefix}/getPlanList`, addHeader(params))

export const getPlanTabList = async (params?) =>
  post(`${config.server.prefix}/getPlanTabList`, addHeader(params))

export const check = async params =>
  post(`${config.server.prefix}/check`, addHeader(params))

export const getMenstruationDetail = async params =>
  post(`${config.server.prefix}/getMenstruationDetail`, addHeader(params))

async function post(url, data): Promise<any> {
  return fetchData(url, 'post', data, {
    'content-type': 'application/json'
  }).catch(e => {
    errorHandler({ url, data }, e)
  })
}

function fetchData(url, method, data, header) {
  return new Promise((res, rej) => {
    const wxRequestOptions = {
      url,
      method,
      data,
      header
    }

    Taro.request(wxRequestOptions)
      .then(async response => {
        console.log('request 请求成功', response)
        if (response && response.statusCode === 200) {
          res(response.data)
        } else {
          rej(response)
        }
      })
      .catch(error => {
        console.log('request 请求失败', error)
        rej(error)
      })
  })
}

function errorHandler(wxRequestOptions, err) {
  Taro.showModal({
    title: '网络异常，请稍后再试',
    // title:
    //   err.errMsg.indexOf('request:fail') !== -1 ? '网络不给力' : '请求出错',
    showCancel: false,
    content: ''
  })
  Taro.hideLoading()
  console.error('[http error]: ', wxRequestOptions, err)
  // throw new Error(JSON.stringify(err.data, null, 2)); // 不继续往外抛错误了啊
}
