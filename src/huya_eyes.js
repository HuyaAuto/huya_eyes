"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const fs = require("fs");
const infoFileName = "../info/roomInfo_100004.json"; //房间信息的json文件地址
let roomsInfo = JSON.parse(fs.readFileSync(infoFileName).toString());
let roomsLiveInfo = [];
//TODO:请求是异步的，但是貌似请求太多会阻塞，原因不明？封IP
const netPromise = new Promise((resolve, reject) => {
    roomsInfo.forEach((value, index) => {
        request(value.url, function (error, response, body) {
            let oneLive = {
                title: value.title,
                url: value.url,
                roomId: value.roomId,
                nickname: value.nickname,
                avatar: value.avatar,
                type: value.type,
                quality: value.quality,
                num: value.num,
                level: value.level,
                remark: value.remark,
                live: false,
                statusCode: response.statusCode,
                sex: null,
                streamUrl: "",
                streamerName: "" //视频流名称
            };
            if (!error && response.statusCode == 200 && (typeof body) === "string") {
                const regRes = /"stream": ({.+?})\s*}/.exec(body);
                if (regRes && JSON.parse("{" + regRes[0])["stream"]["status"] == 200) {
                    const infoObj = JSON.parse("{" + regRes[0])["stream"];
                    oneLive.live = true;
                    //下面是copy的getHuyaStreamUrl.ts
                    const room_info = infoObj["data"][0]["gameLiveInfo"];
                    //主播性别
                    oneLive.sex = room_info["sex"];
                    //视频流名称
                    const streamerName = room_info["nick"];
                    oneLive.streamerName = streamerName;
                    const len = infoObj["data"][0]["gameStreamInfoList"].length;
                    let streamArr = [];
                    for (let i = 0; i < len; i++) {
                        const stream_info = infoObj["data"][0]["gameStreamInfoList"][i];
                        // console.log(stream_info);
                        const sHlsUrl = stream_info["sHlsUrl"];
                        // console.log('sHlsUrl',sHlsUrl);
                        const sStreamName = stream_info["sStreamName"];
                        const sHlsUrlSuffix = stream_info["sHlsUrlSuffix"];
                        const sHlsAntiCode = stream_info["sHlsAntiCode"];
                        const resStream = `${sHlsUrl}/${sStreamName}.${sHlsUrlSuffix}?${sHlsAntiCode}`;
                        streamArr.push(resStream);
                    }
                    const tsStream = streamArr.filter((v) => {
                        // console.log(v.substr(7,2));
                        return v.substr(7, 2) === "tx";
                    });
                    //视频流链接
                    oneLive.streamUrl = tsStream[0];
                }
                console.log(`第${index}项已完成`);
            }
            roomsLiveInfo.push(oneLive);
            console.log(roomsLiveInfo.length + "/" + roomsInfo.length);
            if (roomsLiveInfo.length == roomsInfo.length) {
                resolve(roomsLiveInfo);
            }
        });
    });
});
//TODO:理论可行了，但是总是会丢失info，无法正常resolve
netPromise.then(data => {
    console.log(`直播房状态抓取完毕`);
    console.log("准备写入 /info/live.json 文件");
    fs.writeFile(`../info/live.json`, JSON.stringify(data), function (err) {
        if (err) {
            return console.error(err);
        }
        console.log("数据文件写入成功！");
    });
}, err => console.log(err));
//# sourceMappingURL=huya_eyes.js.map