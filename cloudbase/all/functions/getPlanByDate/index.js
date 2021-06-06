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
  const collection = db.collection('plan')
  const statusCollection = db.collection('planCheckStatus')

  const result = []

  const { list } = await db
    .collection('plan')
    .aggregate()
    .match({
      userID: wxContext.OPENID,
      status: 1, // 1-正常 2-已删除
      beginTime: _.lte(dateTime),
      endTime: _.eq(null).or(_.gte(dateTime))
      /**
       *
      p.type === 2 ||
      p.type === 4 ||
      (p.type === 3 && p.subType === 1) ||
      (p.type === 3 &&
        p.subType === 2 &&
        days.indexOf(`${dateObj.getDay()}`) >= 0)
       */
      // type: _.eq(2).or(_.eq(4)).or()
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
      as: 'monthFulfillTimes'
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
      as: 'weekFulfillTimes'
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
      planCheckStatus: 0
    })
    .end()

  console.log(list)
  return

  for (let p of data) {
    let totalFulfillTimes = 0
    const days = p.days.split(',')
    // 查询日期的在计划的时间范围内
    // if (dateTime >= p.beginTime && (!p.endTime || dateTime <= p.endTime)) {
    if (
      p.type === 2 ||
      p.type === 4 ||
      (p.type === 3 && p.subType === 1) ||
      (p.type === 3 &&
        p.subType === 2 &&
        days.indexOf(`${dateObj.getDay()}`) >= 0)
    ) {
      if (p.type === 4) {
        let { total } = await statusCollection
          .where({
            userID: wxContext.OPENID,
            planID: p.planID,
            year: dateObj.getFullYear(),
            month: dateObj.getMonth() + 1,
            status: 1 // 1-已完成 0-未完成
          })
          .count()
        console.log('getPlanByDate 月计划完成的次数', p.name, total)
        totalFulfillTimes = total
      } else if (p.type === 3 && p.subType === 1) {
        let { total } = await statusCollection
          .where({
            userID: wxContext.OPENID,
            planID: p.planID,
            weekStart: getWeekStart(dateObj),
            status: 1 // 1-已完成 0-未完成
          })
          .count()
        console.log('getPlanByDate 周计划完成的次数', p.name, total)
        totalFulfillTimes = total
      }

      // 改成都返回吧，这样即使任务完成了，还可以继续打卡
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
        totalFulfillTimes: totalFulfillTimes
        // 同时返回date这一天的打卡记录和详情
      }

      let { errMsg, data } = await statusCollection
        .where({
          userID: wxContext.OPENID,
          planID: p.planID,
          year: dateObj.getFullYear(),
          month: dateObj.getMonth() + 1,
          day: dateObj.getDate(),
          weekStart: getWeekStart(dateObj)
        })
        .get()

      console.log('取status： ', p.name, data)
      let detail = data[0]
      if (!detail) {
        detail = {
          totalAchieve: 0,
          status: 0
        }
      }
      item.totalAchieve = detail.totalAchieve
      item.status = detail.status
      result.push(item)
    }
    // }
  }

  return {
    code: 200,
    plans: result
  }
}
