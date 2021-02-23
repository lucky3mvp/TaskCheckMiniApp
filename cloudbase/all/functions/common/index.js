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

  try {
    // result 结构
    // { errCode: 0, errMsg: 'openapi.templateMessage.send:ok' }
    const result = await cloud.openapi.security.msgSecCheck(
      JSON.stringify(event)
    )
    if (errCode !== 0) {
      return {
        code: 333
      }
    }
  } catch (err) {
    return {
      code: 333
    }
  }

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
  } else if (_scope === 'days') {
    if (_type === 'fetchCategory') {
      const categoryCollection = db.collection('days-category')
      const { errMsg, data } = await categoryCollection
        .where({
          userID: wxContext.OPENID,
          status: 1 // 1-正常
        })
        .get()
      console.log('获取days分类，', data)
      return { code: 200, categories: data }
    } else if (_type === 'submitCategory') {
      const categoryCollection = db.collection('days-category')
      const { name, icon } = event
      const { errMsg } = await categoryCollection.add({
        data: {
          userID: wxContext.OPENID,
          name,
          icon,
          status: 1 // 1-正常
        }
      })
      console.log('添加days分类： ', errMsg)
      return {
        code: errMsg.indexOf('add:ok') >= 0 ? 200 : 400
      }
    } else if (_type === 'updateCategory') {
      const categoryCollection = db.collection('days-category')
      const { name, icon, id } = event
      const { errMsg } = await categoryCollection.doc(id).update({
        data: {
          name,
          icon
        }
      })
      console.log('更新days分类： ', errMsg)
      return { code: 200 }
    } else if (_type === 'deleteCategory') {
      const categoryCollection = db.collection('days-category')
      const { id } = event
      const { errMsg } = await categoryCollection.doc(id).update({
        data: {
          status: 2 // 2-删除
        }
      })
      // 更新days表的category
      const daysCollection = db.collection('days')
      const { errMsg: errMsg2 } = daysCollection
        .where({
          userID: wxContext.OPENID,
          category: id
        })
        .update({
          // 已删除的分类，days里的分类置为空
          data: { category: '' }
        })
      console.log('删除days分类，并更新days表： ', errMsg, errMsg2)
      return { code: 200 }
    } else if (_type === 'submitDays') {
      const daysCollection = db.collection('days')
      const { name, category, date, isTop, notifyTime, cover } = event
      const d = {
        userID: wxContext.OPENID,
        name: name,
        category: category,
        date: new Date(date).getTime(),
        isTop: isTop,
        notifyTime: notifyTime,
        cover: cover || '',
        status: 1, // 1-正常,
        createTime: Date.now()
      }
      const { errMsg } = await daysCollection.add({
        data: d
      })
      console.log('添加日子： ', d, errMsg)
      return {
        code: errMsg.indexOf('add:ok') >= 0 ? 200 : 400
      }
    } else if (_type === 'fetchDays') {
      const daysCollection = db.collection('days')
      const { errMsg, data } = await daysCollection
        .where({
          userID: wxContext.OPENID,
          status: 1 // 1-正常,
        })
        .orderBy('createTime', 'desc')
        .get()
      console.log('获取日子： ', data, errMsg)
      return { code: 200, days: data }
    }
  }
}
