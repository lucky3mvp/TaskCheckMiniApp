const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  console.log('getCheckList params: ', event)

  try {
    // result 结构
    // { errCode: 0, errMsg: 'openapi.templateMessage.send:ok' }
    const result = await cloud.openapi.security.msgSecCheck(
      JSON.stringify(event)
    )
    if (errCode !== 0) {
      return {
        code: 333
      }
    }
  } catch (err) {
    return {
      code: 333
    }
  }

  const db = cloud.database()
  const _ = db.command
  const wxContext = cloud.getWXContext()

  let { pageSize = 20, pageNo = 1, date, version, returnPlanTabs } = event

  if (version === 'v2') {
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

    const dateObj = new Date(date)
    const dateBeginTimestamp = dateObj.getTime()
    const dateEndTimestamp = new Date(
      dateObj.getFullYear(),
      dateObj.getMonth(),
      dateObj.getDate() + 1
    ).getTime()
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
  } else {
    // todo 以下是老版本，之后可以删的
    const checkCollection = db.collection('check')
    const { total } = await checkCollection
      .where({
        userID: wxContext.OPENID
      })
      .count()
    console.log('getCheckList count: ', total)

    const { data: listOldV } = await checkCollection
      .where({
        userID: wxContext.OPENID
      })
      .orderBy('checkTime', 'desc')
      .skip(pageSize * (pageNo - 1))
      .limit(pageSize)
      .get()
    const result = []
    const cache = {}
    const planCollection = db.collection('plan')
    for (let check of listOldV) {
      const { planID } = check
      if (!cache[`${planID}`]) {
        const { data } = await planCollection.doc(check.planID).get()
        cache[`${planID}`] = data
      }
      const plan = cache[`${planID}`]
      // 返回所有打卡记录，不管计划是不是被删了
      result.push({
        planID,
        comment: check.comment,
        checkTime: check.checkTime,
        achieve: check.achieve,
        name: plan.name,
        icon: plan.icon,
        theme: plan.theme,
        unit: plan.unit
      })
    }

    return {
      code: 200,
      list: result,
      totalSize: total,
      totalPage: parseInt(total / pageSize) + 1,
      pageSize: pageSize,
      pageNo: pageNo
    }
  }
}
