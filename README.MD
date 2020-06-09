# 虎牙之眼
> 监控虎牙直播状况，并且调用 StreamerHelper 进行视频流录制

## 源码文件
+ index.ts
> 爬取虎牙分区房间基本信息roomInfo.json文件
+ huya_eyes.ts
> 查询roomInfo.json文件中记录的房间的状态，生成live.json
+ panel.ts
> 展示相关live.json中的信息

## Do
1. 爬虫抓取虎牙分区（默认120个房间），生成房间信息json
2. 定时监控房间的直播是否打开
3. HTML5面板展示房间状态

## TODO
1. 根据房间等级设定，选择调用视频录制和邮件推送状态
2. 面板展示美化
3. 支持数据库记录

## Bug
1. Promise莫名停止？网络请求问题？
> 可能是room数过多导致的，可能是ip访问被拦截的，必须要ip代理
> 如果遇到这种问题，请删除 roomInfo_xxx.json 中过多的项
