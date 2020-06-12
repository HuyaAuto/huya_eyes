import * as request from "request";
import * as cheerio from "cheerio";
import * as fs from "fs";

//roomInfo接口
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

function getRoomId(url:string):string {
    let array = url.split("/");
    return array[array.length-1];
}

//分区ID
let zoneId:number = 100004;
let url:string = `https://www.huya.com/g/${zoneId}`;
//roomInfo集合
let rooms:roomInfo[]=[];
request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        let $ = cheerio.load(body, {ignoreWhitespace: true});
        //分区标题
        let title:string = $("title").text();
        //房间信息集合
        let lis = $("#js-live-list li");
        console.log(`分区ID:${zoneId}\n${title}\n${url}\n共检测出${lis.length}间直播房`);
        //遍历直播房信息
        lis.each(function(index,element){

            var $room =cheerio.load($(element).html());
            let oneRoom:roomInfo={
                title: $room("a.title").text(),//房间标题
                url: $room("a.title").attr('href'),//房间链接
                roomId:getRoomId($room("a.title").attr('href')),//房间号
                nickname: $room("span.avatar.fl > i").text(),//主播昵称
                avatar: $room("span.avatar.fl > img").attr('data-original'),//主播头像
                type: $room("span.game-type.fr > a").text(),//直播类型
                quality:$room("a.video-info > p > em").text(),//视频最高画质,
                num: $room("span.num > i.js-num").text(),//观众人数
                level: 0,//重要等级：默认为0(不重要)
                remark: ""//默认备注为空
            }
            rooms.push(oneRoom)
        })
        console.log(`${rooms.length}间直播房信息抓取完毕`);
        console.log("准备写入 /info/roomInfo_${zoneId}.json 文件");

        fs.writeFile(`../info/roomInfo_${zoneId}.json`, JSON.stringify(rooms),  function(err) {
            if (err) {
                return console.error(err);
            }
            console.log("数据文件写入成功！");
        });

    }else{
        console.log(`\n分区ID:${zoneId}\n链接: ${url} 响应错误`);
    }
});