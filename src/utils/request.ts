import Taro from '@tarojs/taro'
import config from '../config'
import Global from './global'

function addHeader(params, headers = {}) {
  return {
    header: {
      ...headers,
      uid: Global.openID
    },
    ...params
  }
}

export const login = async params =>
  post(
    `${config.server.prefix}/mpLogin`,
    addHeader(params),
  )

async function post(
  url,
  data,
): Promise<any> {
  return fetchData(
    url,
    'post',
    data,
    { 'content-type': 'application/json' },
  ).catch(e => {
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
