import * as fs from "fs";
import * as http from "http";

interface roomInfo {
    title: string,//房间标题
    url: string,//房间链接
    roomId:string,//房间号
    nickname: string,//主播昵称
    avatar: string,//主播头像
    type: string,//直播类型
    quality:string,//视频最高画质
    num: string,//观众人数
    level: 0|1|2,//重要等级：默认为0；等级1以上将发送监控邮件（目前默认全局发送）；等级2将直接记录直播流。
    remark: string|null
}

interface roomLiveInfo extends roomInfo{
    live:boolean, //是否正在直播
    statusCode:number,//http响应码
    sex:number|null,//主播性别 1为男 2为女 null未知
    streamUrl:string,//视频流链接
    streamerName:string//视频流名称
}


http.createServer(function (request, response) {
    response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    const liveFileName:string = "../info/live.json";//房间信息的json文件地址
    let livesInfo:roomLiveInfo[] = JSON.parse(fs.readFileSync(liveFileName).toString());

    let html =`
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>监控面板</title>
</head>
<body>`;


    html += `<table border='1'><tr>
    <th>标题</th>
    <th>主播</th>
    <th>房间号</th>
    <th>是否正在直播</th>
    <th>直播流</th>
  </tr>`;

    livesInfo.forEach((value) => {
        html += `<tr><td>${value.title}</td>
    <td>${value.nickname}</td><td>${value.roomId}</td><td>${value.live}</td><td>${value.streamUrl}</td></tr>`;
    })


    html +=`
</table></body>
</html> `;

    response.end(html);
}).listen(8888);

// 终端打印如下信息
console.log('Server running at http://127.0.0.1:8888/');







