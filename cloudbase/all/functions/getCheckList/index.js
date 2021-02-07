const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  console.log('getCheckList params: ', event)
  const db = cloud.database()
  const _ = db.command
  const wxContext = cloud.getWXContext()

  /**
   * 应该有三种吧？
   * 一是现有的分页的
   * 二是某人某个计划某天的记录
   * 三是某人所有计划某天的记录
   */
  const { pageSize = 20, pageNo = 1, planID, date } = event

  // if (!planID && !date) {
  // 我的->打卡列表页的case
  const checkCollection = db.collection('check')
  const { total } = await checkCollection
    .where({
      userID: wxContext.OPENID
    })
    .count()
  console.log('getCheckList count: ', total)

  const { data: list } = await checkCollection
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
  for (let check of list) {
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
  // } else if (date) {
  //   if (planID) {

  //   } else {

  //   }
  // }
}
