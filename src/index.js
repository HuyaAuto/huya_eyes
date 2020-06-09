"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
function getRoomId(url) {
    let array = url.split("/");
    return array[array.length - 1];
}
//分区ID
let zoneId = 100004;
let url = `https://www.huya.com/g/${zoneId}`;
//roomInfo集合
let rooms = [];
request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        let $ = cheerio.load(body, { ignoreWhitespace: true });
        //分区标题
        let title = $("title").text();
        //房间信息集合
        let lis = $("#js-live-list li");
        console.log(`分区ID:${zoneId}\n${title}\n${url}\n共检测出${lis.length}间直播房`);
        //遍历直播房信息
        lis.each(function (index, element) {
            var $room = cheerio.load($(element).html());
            let oneRoom = {
                title: $room("a.title").text(),
                url: $room("a.title").attr('href'),
                roomId: getRoomId($room("a.title").attr('href')),
                nickname: $room("span.avatar.fl > i").text(),
                avatar: $room("span.avatar.fl > img").attr('data-original'),
                type: $room("span.game-type.fr > a").text(),
                quality: $room("a.video-info > p > em").text(),
                num: $room("span.num > i.js-num").text(),
                level: 0,
                remark: "" //默认备注为空
            };
            rooms.push(oneRoom);
        });
        console.log(`${rooms.length}间直播房信息抓取完毕`);
        console.log("准备写入 /info/roomInfo_${zoneId}.json 文件");
        fs.writeFile(`../info/roomInfo_${zoneId}.json`, JSON.stringify(rooms), function (err) {
            if (err) {
                return console.error(err);
            }
            console.log("数据文件写入成功！");
        });
    }
    else {
        console.log(`\n分区ID:${zoneId}\n链接: ${url} 响应错误`);
    }
});
//# sourceMappingURL=index.js.map