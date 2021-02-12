// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { _scope, _type } = event
  const db = cloud.database()
  const _ = db.command

  console.log('common api params: ', event)

  if (_scope === 'reading') {
    const collection = db.collection('reading')
    if (_type === 'submit') {
      const { name, status, time, comment, cover } = event
      const t = time ? new Date(time).getTime() : Date.now()
      const d = {
        userID: wxContext.OPENID,
        name: name,
        cover: cover || '',
        status: status,
        comment: comment || '',
        createTime: t
      }
      if (status === 1) {
        // d.createTime = t // 添加时间
      } else if (status === 2) {
        // d.createTime = t // 添加时间
        d.beginTime = t // 开始读的时间
      } else if (status === 3) {
        // d.createTime = t // 添加时间
        d.finishTime = t // 读完的时间
      }

      const { errMsg } = await collection.add({
        data: d
      })
      console.log('添加读书清单： ', d, errMsg)
      return {
        code: errMsg.indexOf('add:ok') >= 0 ? 200 : 400
      }
    } else if (_type === 'fetchList') {
      const { status, year } = event
      const yearBeginTime = new Date(year, 0, 1).getTime()
      const yearEndTime = new Date(year + 1, 0, 1).getTime()
      let list = []
      if (status === 0) {
        // 全部
        const { errMsg, data } = await collection
          .where({
            userID: wxContext.OPENID,
            status: _.neq(4), // 非删除的书
            time: _.nor([_.lt(yearBeginTime), _.gt(yearEndTime)])
          })
          .orderBy('createTime', 'desc')
          .get()
        list = data
        console.log('fetch reading list all：', list)
      } else if (status === 1 || status === 2 || status === 3) {
        const { errMsg, data } = await collection
          .where({
            userID: wxContext.OPENID,
            status: status,
            time: _.nor([_.lt(yearBeginTime), _.gt(yearEndTime)])
          })
          .orderBy(
            status === 3
              ? 'finishTime'
              : status === 2
              ? 'beginTime'
              : 'createTime',
            'desc'
          )
          .get()
        list = data
        console.log('fetch reading list not all：', status, list)
      }

      return {
        code: 200,
        list
      }
    } else if (_type === 'update') {
      const { id, status, oldStatus } = event
      const d = {
        status: status
      }
      if (status === 2) {
        // ->在读, 只有未读能->在读
        d.beginTime = new Date().getTime()
      } else if (status === 3) {
        // 1. 未读 -> 已读
        // 2. 在读 -> 已读
        // if (oldStatus === 1) {
        //   d.finishTime = new Date().getTime()
        // } else if (oldStatus === 2) {
        //   d.finishTime = new Date().getTime()
        // }
        d.finishTime = new Date().getTime()
      }
      await collection.doc(id).update({
        data: d
      })

      return {
        code: 200
      }
    } else if (_type === 'delete') {
      const { id } = event
      await collection.doc(id).update({
        data: {
          status: 4
        }
      })

      return {
        code: 200
      }
    }
  }
}
