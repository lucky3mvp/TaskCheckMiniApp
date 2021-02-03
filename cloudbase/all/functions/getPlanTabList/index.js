const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  console.log('getPlanTabList params: ', event)

  const wxContext = cloud.getWXContext()

  const db = cloud.database()
  const _ = db.command
  const collection = db.collection('plan')

  const { errMsg, data } = await collection
    .where({
      userID: wxContext.OPENID
    })
    .get()

  const plans = plans.map(p => {
    return {
      planID: p.planID,
      name: p.name,
      description: p.description,
      theme: p.theme,
      icon: p.icon,
      category: p.category,
      beginTime: p.beginTime,
      endTime: p.endTime
    }
  })

  return {
    code: 200,
    tabs: plans
  }
}

module.exports = async function (params, context) {
  const openID = params.header.uid
  const isTest = !!params.header.isTest
  if (!openID) {
    return {
      code: 400,
      msg: '缺失用户信息'
    }
  }

  const planTable = inspirecloud.db.table('mpPlan')
  let plans = await planTable
    .where({
      userID: openID,
      isTest: isTest
    })
    .find()
  plans = plans.map(p => {
    return {
      planID: p.planID,
      name: p.name,
      description: p.description,
      theme: p.theme,
      icon: p.icon,
      category: p.category,
      beginTime: p.beginTime,
      endTime: p.endTime
    }
  })

  return {
    code: 200,
    tabs: plans
  }
}
