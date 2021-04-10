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

  /**
   * 从小程序打卡页面进来的，isQueryToday都是true
   * 这里这个其实是区分补打卡的case
   * 但没法区分，
   * 比如跑步是一周三次，在周五的时候这周就跑完三次了，那周六再查的时候，isQueryToday 就还是true,
   * 所以哪怕total>p.times 还是会return
   * 修改成不通过完成次数决定返不返回了，如果完成了，那么也展示，
   * 因此返回的status其实只表示今天这一天计划的状态
   */
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
          totalTimes = total
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
          totalTimes = total
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
          totalTimes: totalTimes
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
    }
  }

  return {
    code: 200,
    plans: result
  }
}
