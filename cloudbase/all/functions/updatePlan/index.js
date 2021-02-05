// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { optType, planID, name, description, theme, icon, category } = event

  console.log('updatePlan params: ', event)

  const db = cloud.database()
  const collection = db.collection('plan')

  if (optType === 'delete') {
    await collection.doc(planID).update({
      data: {
        status: 2
      }
    })
  } else {
    await collection.doc(planID).update({
      data: {
        name,
        description,
        theme,
        icon,
        category
      }
    })
  }
  return {
    code: 200
  }
}
