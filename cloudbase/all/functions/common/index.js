// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { _scope, _type } = event
  const db = cloud.database()
  const _ = db.command
  const $ = db.command.aggregate

  console.log('common api params: ', event)

  try {
    const result = await cloud.openapi.security.msgSecCheck({
      content: JSON.stringify(event)
    })
    console.log('result: ', result)
    if (result.errCode !== 0) {
      return {
        code: 333
      }
    }
  } catch (err) {
    console.log('err: ', err)
  }

  if (_scope === 'charts') {
    const { date, type, year, month } = event
    if (_type === 'chartsAll') {
      const condition = [
        $.eq(['$planID', '$$planID']),
        $.eq(['$userID', '$$userID'])
      ]
      if (type === 'week') {
        condition.push($.eq(['$weekStart', date.replace(/\//g, '-')]))
      } else if (type === 'month') {
        condition.push($.eq(['$year', year]))
        condition.push($.eq(['$month', month]))
      } else if (type === 'year') {
        condition.push($.eq(['$year', year]))
      }
      const { list } = await db
        .collection('plan')
        .aggregate()
        .match({
          userID: wxContext.OPENID,
          status: 1 // 1-正常 2-已删除
        })
        .lookup({
          from: 'planCheckStatus',
          let: {
            planID: '$planID',
            userID: '$userID'
          },
          pipeline: $.pipeline()
            .match(_.expr($.and(condition)))
            .project({
              _id: 0,
              totalAchieve: 0,
              planID: 0,
              userID: 0,
              weekStart: 0
            })
            .sort({
              year: 1,
              month: 1,
              day: 1
            })
            .done(),
          as: 'detail'
        })
        .project({
          _id: 0,
          userID: 0
        })
        .limit(1000) // 云开发默认20，最大1000
        .end()
      console.log('charts all week result: ', list)
      return {
        code: 200,
        list
      }
    }
  } else if (_scope === 'login') {
    /**
     * openID
     * avatarUrl
     * gender
     * nickName
     */
    const collection = db.collection('user')
    if (_type === 'getUserProfile') {
      const { errMsg, data } = await collection
        .where({
          openID: wxContext.OPENID
        })
        .get()
      console.log('查用户： ', errMsg, data)
      let result = null
      if (!data || !data[0]) {
        result = {
          openID: wxContext.OPENID,
          avatarUrl: '',
          gender: 0,
          nickName: ''
        }
        const { errMsg } = await collection.add({
          data: result
        })
        console.log('查用户, 新增用户')
      } else {
        result = data[0]
      }
      return result
    } else if (_type === 'updateUserProfile') {
      const { errMsg, data } = collection
        .where({
          openID: wxContext.OPENID
        })
        .update({
          data: {
            gender: event.gender,
            nickName: event.nickName,
            avatarUrl: event.avatarUrl
          }
        })
      return {
        code: 200
      }
    }
  } else if (_scope === 'reading') {
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
      if (year === 0 && status === 0) {
        const { errMsg, data } = await collection
          .where({
            userID: wxContext.OPENID,
            status: _.neq(4) // 非删除的书
          })
          .orderBy('createTime', 'desc')
          .get()
        list = data
      } else if (year === 0) {
        const { errMsg, data } = await collection
          .where({
            userID: wxContext.OPENID,
            status: status
          })
          .orderBy('createTime', 'desc')
          .get()
        list = data
      } else if (status === 0) {
        const { errMsg, data } = await collection
          .where({
            userID: wxContext.OPENID,
            status: _.neq(4), // 非删除的书
            time: _.nor([_.lt(yearBeginTime), _.gt(yearEndTime)])
          })
          .orderBy('createTime', 'desc')
          .get()
        list = data
      } else {
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
      }
      console.log('fetch reading list not all：', status, list)
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
    const categoryCollection = db.collection('days-category')
    const daysCollection = db.collection('days')
    if (_type === 'fetchCategory') {
      const { errMsg, data } = await categoryCollection
        .where({
          userID: wxContext.OPENID,
          status: 1 // 1-正常
        })
        .get()
      console.log('获取days分类，', data)
      return { code: 200, categories: data }
    } else if (_type === 'submitCategory') {
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
      const { id } = event
      const { errMsg } = await categoryCollection.doc(id).update({
        data: {
          status: 2 // 2-删除
        }
      })
      // 更新days表的category
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

      if (isTop) {
        const { errMsg } = await daysCollection
          .where({
            userID: wxContext.OPENID,
            isTop: true,
            status: 1
          })
          .update({
            data: { isTop: false }
          })
        console.log(
          '新添加的日子isTop为true, 将此前置顶的数据取消置顶，msg： ',
          errMsg
        )
      }

      const { errMsg } = await daysCollection.add({
        data: d
      })
      console.log('添加日子： ', d, errMsg)
      return {
        code: errMsg.indexOf('add:ok') >= 0 ? 200 : 400
      }
    } else if (_type === 'fetchDays') {
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
  } else if (_scope === 'menstruation') {
    const { year, month, day, type, _type } = event
    const collection = db.collection('menstruation')

    if (_type === 'submit') {
      const { errMsg } = await collection.add({
        data: {
          userID: wxContext.OPENID,
          year: year,
          month: month,
          day: day,
          type: type
        }
      })

      return {
        code: errMsg.indexOf('add:ok') >= 0 ? 200 : 400
      }
    } else if (_type === 'fetchDetail') {
      console.log('menstruation fetchDetail')
      const { errMsg, data } = await collection
        .where({
          userID: wxContext.OPENID,
          year: year,
          month: month
        })
        .orderBy('year', 'asc')
        .orderBy('month', 'asc')
        .orderBy('day', 'asc')
        .get()

      console.log('menstruation query result', errMsg, data)

      if (errMsg.indexOf('get:ok') < 0) {
        return {
          code: 200,
          data: {
            records: [],
            prevStart: null,
            nextEnd: null
          }
        }
      }

      let prevStart = null
      let nextEnd = null
      if (data && data.length) {
        console.log('data0', data[0])
        if (data[0].type === 2 && data[0].day < 7) {
          const prevAllowStart = new Date(year, month - 1, data[0].day - 7)
          const { data } = await collection
            .where({
              year: prevAllowStart.getFullYear(),
              month: prevAllowStart.getMonth() + 1,
              day: _.gt(prevAllowStart.getDate()),
              type: 1
            })
            .get()
          console.log('start', start)
          if (data.length) {
            prevStart = data[0]
          }
        }
        const len = data.length
        const thisMonthLastDay = new Date(year, month - 1, 0).getDate()

        if (
          data[len - 1].type === 1 &&
          data[len - 1].day > thisMonthLastDay - 6
        ) {
          const nextAllowEnd = new Date(year, month - 1, data[len - 1].day + 7)
          const { data: data2 } = await collection
            .where({
              year: nextAllowEnd.getFullYear(),
              month: nextAllowEnd.getMonth() + 1,
              day: _.lt(nextAllowEnd.getDate()),
              type: 2
            })
            .get()
          if (data2.length) {
            nextEnd = data2[0]
          }
        }
      }

      return {
        code: 200,
        data: {
          records: data.map(r => ({
            year: r.year,
            month: r.month,
            day: r.day,
            type: r.type
          })),
          prevStart: prevStart
            ? {
                year: prevStart.year,
                month: prevStart.month,
                day: prevStart.day,
                type: prevStart.type
              }
            : null,
          nextEnd: nextEnd
            ? {
                year: nextEnd.year,
                month: nextEnd.month,
                day: nextEnd.day,
                type: nextEnd.type
              }
            : null
        }
      }
    }
  } else if (_scope === 'plan') {
    const { _type, planID, name, description, theme, icon, category } = event
    const collection = db.collection('plan')

    if (_type === 'delete') {
      await collection.doc(planID).update({
        data: {
          status: 2
        }
      })
    } else if (_type === 'update') {
      const res = await collection.doc(planID).update({
        data: {
          name,
          description,
          theme,
          icon,
          category
        }
      })
      console.log('plan update res: ', res)
    } else if (_type === 'submit') {
      const { year, month, day, type } = event
      const bt = new Date(event.beginTime).getTime()
      const et = event.endTime ? new Date(event.endTime).getTime() : null

      const { errMsg, _id } = await collection.add({
        data: {
          userID: wxContext.OPENID,
          name: event.name,
          description: event.description,
          theme: event.theme,
          icon: event.icon,
          category: event.category,
          unit: event.unit,
          goal: event.goal,
          type: event.type,
          subType: event.type === 2 ? 0 : event.subType,
          times: event.times,
          days: event.days,
          beginTime: bt,
          endTime: et,
          status: 1
        }
      })
      console.log('plan table add', errMsg, _id)
      if (_id) {
        // 更新 planID
        const res = await collection.doc(_id).update({
          data: {
            planID: _id
          }
        })
        console.log('plan table update', res)
        return {
          code: 200
        }
      }
      return {
        code: 400
      }
    }
    return {
      code: 200
    }
  }
}
