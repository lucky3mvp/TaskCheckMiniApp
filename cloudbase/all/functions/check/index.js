const cloud = require('wx-server-sdk')
cloud.init()

const getWeekStart = function (d) {
  const day = d.getDay()
  if (day === 0) {
    return formatDate(d, 'yyyy-MM-dd')
  }
  const s = new Date(d.getFullYear(), d.getMonth(), d.getDate() - day)
  return formatDate(s, 'yyyy-MM-dd')
}

exports.main = async (event, context) => {
  console.log('check params: ', event)

  const wxContext = cloud.getWXContext()
  const { achieve, comment, planID } = event
  const checkDate = event.date ? new Date(event.date) : new Date()
  let checkYear, checkMonth, checkDay
  if (event.date) {
    const arr = event.date.split('/')
    checkYear = +arr[0]
    checkMonth = +arr[1]
    checkDay = +arr[2]
  } else {
    checkYear = checkDate.getFullYear()
    checkMonth = checkDate.getMonth() + 1
    checkDay = checkDate.getDate()
  }

  const db = cloud.database()
  const _ = db.command
  const collection = db.collection('check')

  const { errMsg, _id } = await collection.add({
    data: {
      userID: wxContext.OPENID,
      planID: planID,
      achieve: achieve,
      comment: comment,
      checkTime: new Date().getTime()
    }
  })

  // 更新计划状态表
  // 1.先查出计划信息
  const planCollection = db.collection('plan')
  const { errMsg: errMsg2, data2 } = await planCollection
    .where({
      userID: wxContext.OPENID,
      planID: planID
    })
    .get()
  const plan = data2[0]
  if (plan) {
    const detailCollection = inspirecloud.db.table('planCheckStatus')
    // 2.查这个计划当前的打卡状态
    let { errrMsg3, data: data3 } = await detailCollection
      .where({
        userID: wxContext.OPENID,
        planID: planID,
        type: plan.type,
        subType: plan.subType,
        year: checkYear,
        month: checkMonth,
        day: checkDay,
        weekStart: getWeekStart(checkDate)
      })
      .get()
    const detail = data3[0]
    if (!detail) {
      // 3.还没有就新增一条记录
      const d = {
        userID: wxContext.OPENID,
        planID: planID,
        totalAchieve: 0,
        status: 0,
        type: plan.type,
        subType: plan.subType,
        year: checkYear,
        month: checkMonth,
        day: checkDay,
        weekStart: getWeekStart(checkDate)
      }
      const { errMsg4, _id: _id4 } = await detailCollection.add(d)
      detail = {
        _id: _id4,
        ...d
      }
    }
    detail.totalAchieve += achieve
    detail.status = detail.totalAchieve >= plan.goal ? 1 : 0
    // 4.更新计划的打卡状态
    const res = await collection.doc(detail._id).update({
      data: {
        ...detail
      }
    })

    return {
      code: 200,
      planDetail: detail
    }
  }

  return {
    code: 400
  }
}
