const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  console.log('getPlanList params: ', event)
  const wxContext = cloud.getWXContext()

  const dateObj = new Date()
  const dateTime = dateObj.getTime()

  const db = cloud.database()
  const _ = db.command
  const collection = db.collection('plan')
  const statusCollection = db.collection('planCheckStatus')

  const unStarted = []
  const started = []
  const ended = []

  const { errMsg, data } = await collection
    .where({
      userID: wxContext.OPENID
    })
    .get()

  for (let p of data) {
    console.log('p', p)
    let status = 0
    // - 1-未开始
    // - 2-进行中
    // - 3-已结束
    // - 4-暂停
    if (p.status !== 4) {
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
    }

    const { total } = await statusCollection
      .where({
        userID: wxContext.OPENID,
        planID: p.planID,
        type: p.type,
        subType: p.subType,
        status: 1
      })
      .count()
    console.log('getPlanList 月计划 times 完成的次数', total)
    totalTimes = total

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
      status: status,
      totalTimes: totalTimes
    }
    if (status === 1) {
      unStarted.push(item)
    } else if (status === 3) {
      ended.push(item)
    } else {
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
