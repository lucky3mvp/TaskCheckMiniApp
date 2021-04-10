const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  console.log('getCheckList params: ', event)
  const db = cloud.database()
  const _ = db.command
  const wxContext = cloud.getWXContext()

  let { date, returnPlanTabs } = event

  let tabs = []
  let list = []

  if (returnPlanTabs) {
    const collection = db.collection('plan')
    const { errMsg, data } = await collection
      .where({
        status: 1, // 1-正常 2-已删除
        userID: wxContext.OPENID
      })
      .get()

    tabs = data.map(p => ({
      planID: p.planID,
      name: p.name,
      description: p.description,
      theme: p.theme,
      icon: p.icon,
      category: p.category,
      beginTime: p.beginTime,
      endTime: p.endTime
    }))
    console.log('check list should return plan tabs', tabs)
  }

  /**
   * 坑?微信是utc时间，不是东八区
   */
  const dateObj = new Date(date)
  const dateBeginTimestamp = dateObj.getTime() - 8 * 60 * 60 * 1000
  const dateEndTimestamp =
    new Date(
      dateObj.getFullYear(),
      dateObj.getMonth(),
      dateObj.getDate() + 1
    ).getTime() -
    8 * 60 * 60 * 1000 -
    1
  console.log('get check list v2', dateBeginTimestamp, dateEndTimestamp)
  const checkCollection = db.collection('check')
  const { data: checkList } = await checkCollection
    .where({
      userID: wxContext.OPENID,
      // 时间要在查询时间那天内
      checkTime: _.nor([_.lt(dateBeginTimestamp), _.gt(dateEndTimestamp)])
    })
    .orderBy('checkTime', 'desc')
    .get()
  console.log('get check list result: ', checkList)

  const cache = {}
  const planCollection = db.collection('plan')
  for (let check of checkList) {
    // 以结束时间做过滤
    if (check.checkTime < dateEndTimestamp) {
      const { planID } = check
      if (!cache[`${planID}`]) {
        const { data } = await planCollection.doc(check.planID).get()
        cache[`${planID}`] = data
      }
      const plan = cache[`${planID}`]
      // 返回所有打卡记录，不管计划是不是被删了
      list.push({
        planID,
        comment: check.comment,
        checkTime: check.checkTime,
        actualCheckTime: check.actualCheckTime,
        achieve: check.achieve,
        name: plan.name,
        icon: plan.icon,
        theme: plan.theme,
        unit: plan.unit
      })
    }
  }

  return {
    code: 200,
    list,
    tabs
  }
}
