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
  console.log('getPlanList params: ', event)
  const wxContext = cloud.getWXContext()

  const dateObj = new Date()
  const dateTime = dateObj.getTime()
  const year = dateObj.getFullYear()
  const month = dateObj.getMonth() + 1

  const db = cloud.database()
  const _ = db.command
  const collection = db.collection('plan')
  const statusCollection = db.collection('planCheckStatus')

  const unStarted = []
  const started = []
  const ended = []

  const { errMsg, data } = await collection
    .where({
      userID: wxContext.OPENID,
      status: 1 // 1-正常 2-已删除
    })
    .get()

  for (let p of data) {
    // 给前端的status
    // - 1-未开始
    // - 2-进行中
    // - 3-已结束
    let status = 0
    if (dateTime < p.beginTime) {
      status = 1
    } else if (
      dateTime >= p.beginTime &&
      (!p.endTime || dateTime <= p.endTime)
    ) {
      status = 2
    } else {
      status = 3
    }

    const item = {
      planID: p.planID,
      name: p.name,
      description: p.description,
      theme: p.theme,
      icon: p.icon,
      category: p.category,
      unit: p.unit,
      goal: p.goal,
      type: p.type,
      subType: p.subType,
      times: p.times,
      days: p.days,
      beginTime: p.beginTime,
      endTime: p.endTime,
      status: status
      // totalTimes: totalTimes
    }
    if (status === 1) {
      unStarted.push(item)
    } else if (status === 3) {
      const { total: totalTimes } = await statusCollection
        .where({
          userID: wxContext.OPENID,
          planID: p.planID,
          type: p.type,
          subType: p.subType,
          status: 1
        })
        .count()
      console.log('getPlanList 累计打卡次数', totalTimes)
      item.totalTimes = totalTimes
      ended.push(item)
    } else {
      const { total: totalTimes } = await statusCollection
        .where({
          userID: wxContext.OPENID,
          planID: p.planID,
          type: p.type,
          subType: p.subType,
          status: 1
        })
        .count()
      console.log('getPlanList 累计打卡次数', totalTimes)
      item.totalTimes = totalTimes

      const { total: monthTimes } = await statusCollection
        .where({
          userID: wxContext.OPENID,
          year: year,
          month: month,
          planID: p.planID,
          type: p.type,
          subType: p.subType,
          status: 1
        })
        .count()
      console.log('getPlanList 本月累计打卡次数', monthTimes)
      item.monthTimes = monthTimes

      const { total: weekTimes } = await statusCollection
        .where({
          userID: wxContext.OPENID,
          weekStart: getWeekStart(dateObj),
          planID: p.planID,
          type: p.type,
          subType: p.subType,
          status: 1
        })
        .count()
      console.log('getPlanList 本周累计打卡次数', weekTimes)
      item.weekTimes = weekTimes

      started.push(item)
    }
  }

  return {
    code: 200,
    unStarted,
    started,
    ended
  }
}
