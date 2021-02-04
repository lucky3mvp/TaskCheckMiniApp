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
  // 先查出计划信息
  const planCollection = db.collection('plan')
  const statusCollection = db.collection('planCheckStatus')
  const { errMsg: errMsg2, data: data2 } = await planCollection
    .where({
      userID: wxContext.OPENID,
      planID: planID
    })
    .get()
  const plan = data2[0]
  if (plan && plan.status === 1) {
    // 2.查这个计划当前的打卡状态
    let { errrMsg3, data: data3 } = await statusCollection
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
    let detail = data3[0]

    if (!detail) {
      // 3.还没有就新增一条记录
      detail = {
        userID: wxContext.OPENID,
        planID: planID,
        totalAchieve: achieve,
        status: achieve >= plan.goal ? 1 : 0,
        type: plan.type,
        subType: plan.subType,
        year: checkYear,
        month: checkMonth,
        day: checkDay,
        weekStart: getWeekStart(checkDate)
      }
      const { errMsg4, _id: _id4 } = await statusCollection.add({
        data: detail
      })
    } else {
      detail.totalAchieve += achieve
      detail.status = detail.totalAchieve >= plan.goal ? 1 : 0
      // 4.更新计划的打卡状态
      const res = await statusCollection.doc(detail._id).update({
        data: {
          totalAchieve: detail.achieve,
          status: detail.status
        }
      })
    }

    return {
      code: 200,
      planDetail: detail
    }
  } else if (plan && plan.status === 3){
    return {
      code: 401,
      msg: '该计划已删除'
    }
  } else if (plan && plan.status === 2){
    return {
      code: 401,
      msg: '该计划已暂停'
    }
  }

  return {
    code: 400
  }
}
