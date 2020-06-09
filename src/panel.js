"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const http = require("http");
http.createServer(function (request, response) {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    const liveFileName = "../info/live.json"; //房间信息的json文件地址
    let livesInfo = JSON.parse(fs.readFileSync(liveFileName).toString());
    let html = `
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
    });
    html += `
</table></body>
</html> `;
    response.end(html);
}).listen(8888);
// 终端打印如下信息
console.log('Server running at http://127.0.0.1:8888/');
//# sourceMappingURL=panel.js.map