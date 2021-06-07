const cloud = require('wx-server-sdk')
cloud.init()

const formatDate = function (idate, fmt) {
  const o = {
    'M+': idate.getMonth() + 1,
    'd+': idate.getDate(),
    'h+': idate.getHours(),
    'm+': idate.getMinutes(),
    's+': idate.getSeconds(),
    'q+': Math.floor((idate.getMonth() + 3) / 3),
    S: idate.getMilliseconds()
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      String(idate.getFullYear()).substr(4 - RegExp.$1.length)
    )
  }
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      const temp =
        RegExp.$1.length === 1
          ? o[k]
          : ('00' + o[k]).substr(String(o[k]).length)
      fmt = fmt.replace(RegExp.$1, temp)
    }
  }

  return fmt
}

const getWeekStart = function (d) {
  const day = d.getDay()
  const s = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate() - ((day - 1 + 7) % 7)
  )
  return formatDate(s, 'yyyy-MM-dd')
}

exports.main = async (event, context) => {
  console.log('check params: ', event)

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

  const wxContext = cloud.getWXContext()
  const { achieve, comment, planID, isReCheck } = event
  const checkDate = event.date ? new Date(event.date) : new Date()
  const checkYear = checkDate.getFullYear()
  const checkMonth = checkDate.getMonth() + 1
  const checkDay = checkDate.getDate()

  const db = cloud.database()
  const _ = db.command
  const collection = db.collection('check')

  const t = Date.now()
  const { _id } = await collection.add({
    data: {
      userID: wxContext.OPENID,
      planID: planID,
      achieve: achieve,
      comment: comment,
      actualCheckTime: t,
      checkTime: isReCheck ? checkDate.getTime() - 8 * 60 * 60 * 1000 : t
    }
  })

  // 更新计划状态表
  // 先查出计划信息
  const planCollection = db.collection('plan')
  const statusCollection = db.collection('planCheckStatus')
  const { data: plan } = await planCollection.doc(planID).get()
  console.log('check 查 plan : ', plan)
  if (plan) {
    // 2.查这个计划当前的打卡状态
    let { data: data3 } = await statusCollection
      .where({
        userID: wxContext.OPENID,
        planID: planID,
        year: checkYear,
        month: checkMonth,
        day: checkDay,
        weekStart: getWeekStart(checkDate)
      })
      .get()
    let detail = data3[0]
    console.log('check 查 plan check status : ', data3)

    if (!detail) {
      // 3.还没有就新增一条记录
      detail = {
        userID: wxContext.OPENID,
        planID: planID,
        totalAchieve: achieve,
        status: achieve >= plan.goal ? 1 : 0, // 1-已完成 0-未完成
        year: checkYear,
        month: checkMonth,
        day: checkDay,
        weekStart: getWeekStart(checkDate)
      }
      const { _id: _id4 } = await statusCollection.add({
        data: detail
      })
      console.log('check 新增 planCheckStatus', detail)
    } else {
      detail.totalAchieve += achieve
      detail.status = detail.totalAchieve >= plan.goal ? 1 : 0 // 1-已完成 0-未完成
      // 4.更新计划的打卡状态
      const res = await statusCollection.doc(detail._id).update({
        data: {
          totalAchieve: detail.totalAchieve,
          status: detail.status
        }
      })
      console.log('check 更新 planCheckStatus', {
        totalAchieve: detail.totalAchieve,
        status: detail.status
      })
    }

    return {
      code: 200,
      planDetail: detail
    }
  }

  return {
    code: 400
  }
}
