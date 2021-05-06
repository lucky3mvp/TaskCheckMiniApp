## 数据库表设计

### Plan 表：
| 字段名 | 类型 | 含义 |
| ---  | --- | --- |
| planID | string | 唯一标识
| userID | string | 创建者
| name | string | 名称
| description | string | 简介
| icon | string | 图标
| theme | string | 主题颜色
| status | number | 状态, 1-正常 2-已删除
| beginTime | number | 开始时间 毫秒数
| endTime | number/null | 结束时间，没有则默认为永远吧
| category |number | 分类，属于运动，or 生活， or 健康
| type | number | 类型 1-不设置，想着用于以后扩展 2-每日 3-每周 4-每月
| subType | number | 子类型  1-每周x天 2-每周周几
| times |  number | 打几次卡
| days | string | 每周几打卡逗号分隔的 `0,1,2`
| unit | string | 任务目标单位，eg: 每日跑5000米，那unit就是mi
| goal | number | 任务目标，eg: 每日跑5000米，那goal就是5000


```
Plan.status 跟前端的status有区别，注意下
- 1-未开始
- 2-进行中
- 3-已结束
- 4-暂停
```


### Check 表
| 字段名 | 类型 | 含义 |
| ---  | --- | --- |
| planID | string | 计划id
| userID | string | 用户id
| comment | string | 备注
| checkTime | number | 打卡时间戳
| achieve | number | 打开成就，eg： 阅读30min这种，允许打卡阅读了x分钟，x<=30

### PlanCheckStatus 表
| 字段名 | 类型 | 含义 |
| ---  | --- | --- |
| planID | string | 计划id
| userID | string | 用户id
| day | number | 日
| month | number | 月
| year | number | 年
| weekStart | string | 对应的周一日期 eg: "2021-05-03"
| totalAchieve | number | 总共完成了多少
| status | number | 当日是否完成 0-未完成 1-已完成

```
老数据还有 type、subType 字段，对应 plan 的 type、subType，后废弃
```


### User 表
| 字段名 | 类型 | 含义 |
| ---  | --- | --- |
| openID | string | 用户id
| avatarUrl | string | 用户头像url
| gender | number | 性别 1-男 2-女
| nickName | string | 昵称
| Points |  | 积分？以后再说


### Menstruation 表：
| 字段名 | 类型 | 含义 |
| ---  | --- | --- |
| userID | string | 用户id
| day | number | 日
| month | number | 月
| year | number | 年
| type | number | 类型 1-开始 2-结束


### Days 表：
| 字段名 | 类型 | 含义 |
| ---  | --- | --- |
| userID | string | 用户id
| category | string | days category 的 id
| cover | string | 图片URL
| name | string | 名字
| createTime | number | 创建时间戳
| notifyTime | number | 通知时间戳
| date | number | 日子的时间戳
| isTop | boolean | 是否置顶
| status | number | 状态 1-正常 2-已删除


### Days Category 表：
| 字段名 | 类型 | 含义 |
| ---  | --- | --- |
| userID | string | 用户id
| icon | string | 图标
| name | string | 名字
| status | number | 状态 1-正常 2-已删除


### Reading 表：
| 字段名 | 类型 | 含义 |
| ---  | --- | --- |
| userID | string | 用户id
| name | string | 名字
| cover | string | 图片URL
| createTime | number | 创建时间戳
| beginTime | number | 在读时间戳
| finishTime | number | 读完时间戳
| comment | string | days category 的 id
| status | number | 状态 1-未读 2-在读 3-读完
