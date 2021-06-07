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
  console.log('getPlanByDate params: ', event)
  const wxContext = cloud.getWXContext()
  const { date } = event
  const dateObj = new Date(date)
  const dateTime = dateObj.getTime()

  const db = cloud.database()
  const _ = db.command
  const $ = db.command.aggregate

  const { list } = await db
    .collection('plan')
    .aggregate()
    .match({
      userID: wxContext.OPENID,
      status: 1, // 1-正常 2-已删除
      beginTime: _.lte(dateTime),
      endTime: _.eq(null).or(_.gte(dateTime))
      // 需要排除指定周几的case,但不知道该怎么写啊。。。
      /**
       *
      p.type === 2 ||
      p.type === 4 ||
      (p.type === 3 && p.subType === 1) ||
      (p.type === 3 &&
        p.subType === 2 &&
        days.indexOf(`${dateObj.getDay()}`) >= 0)
       */
      // type: _.eq(2).or(_.eq(4))
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
              $.eq(['$year', dateObj.getFullYear()]),
              $.eq(['$month', dateObj.getMonth() + 1]),
              $.eq(['$day', dateObj.getDate()]),
              $.eq(['$weekStart', getWeekStart(dateObj)])
            ])
          )
        )
        .project({
          _id: 0,
          totalAchieve: 1,
          status: 1
        })
        .done(),
      as: 'planCheckStatus'
    })
    .lookup({
      from: 'planCheckStatus',
      let: {
        planID: '$planID',
        userID: '$userID',
        type: '$type'
      },
      pipeline: $.pipeline()
        .match(
          _.expr(
            $.and([
              $.eq(['$planID', '$$planID']),
              $.eq(['$userID', '$$userID']),
              $.eq(['$year', dateObj.getFullYear()]),
              $.eq(['$month', dateObj.getMonth() + 1]),
              $.eq(['$$type', 4]),
              $.eq(['$status', 1])
            ])
          )
        )
        .done(),
      as: 'monthPlanFulfillTimes'
    })
    .lookup({
      from: 'planCheckStatus',
      let: {
        planID: '$planID',
        userID: '$userID',
        type: '$type',
        subType: '$subType'
      },
      pipeline: $.pipeline()
        .match(
          _.expr(
            $.and([
              $.eq(['$planID', '$$planID']),
              $.eq(['$userID', '$$userID']),
              $.eq(['$weekStart', getWeekStart(dateObj)]),
              $.eq(['$$type', 3]),
              $.eq(['$$subType', 1]),
              $.eq(['$status', 1])
            ])
          )
        )
        .done(),
      as: 'weekPlanFulfillTimes'
    })
    .addFields({
      // 不管是周计划，还是月计划，统一用totalFulfillTimes字段返回计划完成的次数
      totalFulfillTimes: $.add([
        $.size('$monthPlanFulfillTimes'),
        $.size('$weekPlanFulfillTimes')
      ])
    })
    .replaceRoot({
      newRoot: $.mergeObjects([
        '$$ROOT',
        {
          totalAchieve: 0,
          status: 0 // 这是给前端的当日任务是否完成的标识，不是计划本身的status
        },
        $.arrayElemAt(['$planCheckStatus', 0])
      ])
    })
    .project({
      planCheckStatus: 0,
      monthPlanFulfillTimes: 0,
      weekPlanFulfillTimes: 0
    })
    .end()

  return list.filter(
    p =>
      p.type === 2 ||
      p.type === 4 ||
      (p.type === 3 && p.subType === 1) ||
      (p.type === 3 &&
        p.subType === 2 &&
        p.days.split(',').indexOf(`${dateObj.getDay()}`) >= 0)
  )
}
