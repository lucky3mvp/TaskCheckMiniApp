// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { year, month } = event
  console.log('MenstruationDetail params: ', event)

  const db = cloud.database()
  const _ = db.command
  const collection = db.collection('menstruation')

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

    if (data[len - 1].type === 1 && data[len - 1].day > thisMonthLastDay - 6) {
      const nextAllowEnd = new Date(year, month - 1, data[len - 1].day + 7)
      const { data } = await collection
        .where({
          year: nextAllowEnd.getFullYear(),
          month: nextAllowEnd.getMonth() + 1,
          day: _.lt(nextAllowEnd.getDate()),
          type: 2
        })
        .get()
      if (data.length) {
        nextEnd = data[0]
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
