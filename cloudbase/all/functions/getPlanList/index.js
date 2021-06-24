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
  const $ = db.command.aggregate

  // 未开始计划
  const { list: unStarted } = await db
    .collection('plan')
    .aggregate()
    .match({
      userID: wxContext.OPENID,
      status: 1, // 1-正常 2-已删除
      beginTime: _.gt(dateTime)
    })
    .addFields({
      status: 1 // 这是给前端的status，不是计划本身的status，注意下
    })
    .limit(1000) // 云开发默认20，最大1000
    .end()
  console.log('unStarted: ', unStarted)

  // 进行中计划
  const { list: started } = await db
    .collection('plan')
    .aggregate()
    .match({
      userID: wxContext.OPENID,
      status: 1, // 1-正常 2-已删除
      beginTime: _.lte(dateTime),
      endTime: _.eq(null).or(_.gte(dateTime))
    })
    .lookup({
      from: 'planCheckStatus',
      let: {
        planID: '$planID',
        userID: '$userID'
      },
      pipeline: $.pipeline()
        .match(
          _.expr(
            $.and([
              $.eq(['$planID', '$$planID']),
              $.eq(['$userID', '$$userID']),
              // $.eq(['$status', 1]), // 取完成次数的时候再加上
              $.eq(['$weekStart', getWeekStart(dateObj)])
            ])
          )
        )
        .done(),
      as: 'weekCheckTimes'
    })
    .lookup({
      from: 'planCheckStatus',
      let: {
        planID: '$planID',
        userID: '$userID'
      },
      pipeline: $.pipeline()
        .match(
          _.expr(
            $.and([
              $.eq(['$planID', '$$planID']),
              $.eq(['$userID', '$$userID']),
              // $.eq(['$status', 1]), // 取完成次数的时候再加上
              $.eq(['$year', year]),
              $.eq(['$month', month])
            ])
          )
        )
        .done(),
      as: 'monthCheckTimes'
    })
    .lookup({
      from: 'check',
      localField: 'planID',
      foreignField: 'planID',
      as: 'totalCheckTimes'
    })
    .addFields({
      status: 2, // 这是给前端的status，不是计划本身的status，注意下
      weekCheckTimes: $.size('$weekCheckTimes'), // 累计打卡次数
      monthCheckTimes: $.size('$monthCheckTimes'), // 累计打卡次数
      totalCheckTimes: $.size('$totalCheckTimes') // 累计打卡次数
    })
    .limit(1000) // 云开发默认20，最大1000
    .end()
  console.log('started: ', started)

  // 已结束计划
  const { list: ended } = await db
    .collection('plan')
    .aggregate()
    .match({
      userID: wxContext.OPENID,
      status: 1, // 1-正常 2-已删除
      endTime: _.lt(dateTime)
    })
    .lookup({
      from: 'check',
      localField: 'planID',
      foreignField: 'planID',
      as: 'totalCheckTimes'
    })
    .lookup({
      from: 'planCheckStatus',
      let: {
        planID: '$planID',
        userID: '$userID'
      },
      pipeline: $.pipeline()
        .match(
          _.expr(
            $.and([
              $.eq(['$planID', '$$planID']),
              $.eq(['$userID', '$$userID']),
              $.eq(['$status', 1])
            ])
          )
        )
        .done(),
      as: 'totalFulfillTimes'
    })
    .addFields({
      status: 3, // 这是给前端的status，不是计划本身的status，注意下
      totalCheckTimes: $.size('$totalCheckTimes'), // 累计打卡次数
      totalFulfillTimes: $.size('$totalFulfillTimes') // 累计完成次数
    })
    .limit(1000) // 云开发默认20，最大1000
    .end()
  console.log('ended: ', ended)

  return {
    code: 200,
    unStarted,
    started,
    ended
  }
}
