const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  console.log('getCheckList params: ', event)
  const db = cloud.database()
  const _ = db.command
  const $ = db.command.aggregate
  const wxContext = cloud.getWXContext()

  let { date, returnPlanTabs, dateEnd = '' } = event

  let tabs = []
  if (returnPlanTabs) {
    const { errMsg, data } = await db
      .collection('plan')
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
  let dateEndTimestamp = ''
  if (!dateEnd) {
    dateEndTimestamp =
      new Date(
        dateObj.getFullYear(),
        dateObj.getMonth(),
        dateObj.getDate() + 1
      ).getTime() -
      8 * 60 * 60 * 1000 -
      1
  } else {
    const dateObj = new Date(dateEnd)
    dateEndTimestamp =
      new Date(
        dateObj.getFullYear(),
        dateObj.getMonth(),
        dateObj.getDate() + 1
      ).getTime() -
      8 * 60 * 60 * 1000 -
      1
    console.log('有dateEnd', dateEnd, dateObj, dateEndTimestamp)
  }

  console.log('get check list v2', dateBeginTimestamp, dateEndTimestamp)

  const { list, errMsg } = await db
    .collection('check')
    .aggregate()
    .match({
      userID: wxContext.OPENID,
      checkTime: _.nor([_.lt(dateBeginTimestamp), _.gt(dateEndTimestamp)])
    })
    .lookup({
      from: 'plan',
      localField: 'planID',
      foreignField: 'planID',
      as: 'plan'
    })
    .replaceRoot({
      newRoot: $.mergeObjects([$.arrayElemAt(['$plan', 0]), '$$ROOT'])
    })
    .project({
      // plan: 0, // 不能在有下面代码的情况下再plan: 0，会报错o.o
      planID: 1,
      comment: 1,
      checkTime: 1,
      actualCheckTime: 1,
      achieve: 1,
      name: 1,
      icon: 1,
      theme: 1,
      unit: 1
    })
    .sort({
      checkTime: -1
    })
    .limit(1000) // 云开发默认20，最大1000
    .end()
  console.log('get check list result: ', list)

  return {
    code: 200,
    list,
    tabs
  }
}
