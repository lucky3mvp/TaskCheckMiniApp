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

  let [queryYear, queryMonth, queryDay] = date.split('/')
  queryYear = Number(queryYear)
  queryMonth = Number(queryMonth)
  queryDay = Number(queryDay)

  const today = new Date()
  const todayYear = today.getFullYear()
  const todayMonth = today.getMonth() + 1
  const todayDay = today.getDate()

  /**
   * 从小程序打卡页面进来的，isQueryToday都是true
   * 这里这个其实是区分补打卡的case
   * 但没法区分，
   * 比如跑步是一周三次，在周五的时候这周就跑完三次了，那周六再查的时候，isQueryToday 就还是true,
   * 所以哪怕total>p.times 还是会return
   * 修改成不通过完成次数决定返不返回了，如果完成了，那么也展示，只不过是完成状态
   */
  const isQueryToday =
    queryYear === todayYear &&
    queryMonth === todayMonth &&
    queryDay === todayDay

  const db = cloud.database()
  const _ = db.command
  const collection = db.collection('plan')
  const statusCollection = db.collection('planCheckStatus')

  const result = []

  const { errMsg, data } = await collection
    .where({
      userID: wxContext.OPENID,
      // 查非删除的计划
      status: 1 // 1-正常 2-已删除
    })
    .get()
  for (let p of data) {
    let shouldReturn = false
    let totalTimes = 0
    const days = p.days.split(',')
    // 查询日期的在计划的时间范围内
    if (dateTime >= p.beginTime && (!p.endTime || dateTime <= p.endTime)) {
      if (
        // 每日的计划都可以返回
        p.type === 2 ||
        // 每周的周几的计划，需要判断查询日期是否是指定的周几之一
        (p.type === 3 &&
          p.subType === 2 &&
          days.indexOf(`${dateObj.getDay()}`) >= 0)
      ) {
        shouldReturn = true
      } else if (p.type === 4) {
        // 每月或每周几次的case, 如果当前次数已经完成，就不返回了
        let { total } = await statusCollection
          .where({
            userID: wxContext.OPENID,
            planID: p.planID,
            // type: p.type,
            // subType: p.subType,
            year: dateObj.getFullYear(),
            month: dateObj.getMonth() + 1,
            status: 1 // 1-已完成 0-未完成
          })
          .count()
        console.log('getPlanByDate 月计划 times 完成的次数', total)
        totalTimes = total
        /**
         * 还没完成 =》 返回
         * 完成了，但是是当前 =》 返回（要不在check页打完卡就看不见了）
         */
        if (total < p.times || isQueryToday) {
          shouldReturn = true
        } else {
          shouldReturn = false
        }
      } else if (p.type === 3 && p.subType === 1) {
        let { total } = await statusCollection
          .where({
            userID: wxContext.OPENID,
            planID: p.planID,
            // type: p.type,
            // subType: p.subType,
            year: dateObj.getFullYear(),
            month: dateObj.getMonth() + 1,
            weekStart: getWeekStart(dateObj),
            status: 1 // 1-已完成 0-未完成
          })
          .count()
        console.log('getPlanByDate 周计划 times 完成的次数', total)
        totalTimes = total
        // if (total >= p.times && !isQueryToday) {
        //   shouldReturn = false
        // } else {
        //   shouldReturn = true
        // }
        /**
         * 还没完成 =》 返回
         * 完成了，但是是当前 =》 返回（要不在check页打完卡就看不见了）
         */
        if (total < p.times || isQueryToday) {
          shouldReturn = true
        } else {
          shouldReturn = false
        }
      } else {
        shouldReturn = false
      }

      if (shouldReturn) {
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
          totalTimes: totalTimes
          // 同时返回date这一天的打卡记录和详情
        }

        let { errMsg, data } = await statusCollection
          .where({
            userID: wxContext.OPENID,
            planID: p.planID,
            // type: p.type,
            // subType: p.subType,
            year: dateObj.getFullYear(),
            month: dateObj.getMonth() + 1,
            day: dateObj.getDate(),
            weekStart: getWeekStart(dateObj)
          })
          .get()
        console.log('should return query params: ', {
          userID: wxContext.OPENID,
          planID: p.planID,
          // type: p.type,
          // subType: p.subType,
          year: dateObj.getFullYear(),
          month: dateObj.getMonth() + 1,
          day: dateObj.getDate(),
          weekStart: getWeekStart(dateObj)
        })
        console.log('should return query result: ', data)
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
    }
  }

  return {
    code: 200,
    plans: result
  }
}
