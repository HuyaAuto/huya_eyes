import * as request from "request";
import * as fs from "fs";

//roomInfo接口
function base64ToString(base64Str){
    var str = Buffer.from(base64Str,'base64').toString();
    return str;
}

interface roomInfo {
    title: string,//房间标题
    url: string,//房间链接
    roomId: string,//房间号
    nickname: string,//主播昵称
    avatar: string,//主播头像
    type: string,//直播类型
    quality: string,//视频最高画质
    num: string,//观众人数
    level: 0 | 1 | 2,//重要等级：默认为0；等级1以上将发送监控邮件（目前默认全局发送）；等级2将直接记录直播流。
    remark: string | null
}

interface roomLiveInfo extends roomInfo {
    live: boolean, //是否正在直播
    statusCode: number,//http响应码
    sex: number | null,//主播性别 1为男 2为女 null未知
    streamUrl: string,//视频流链接
    streamerName: string//视频流名称
}

const infoFileName: string = "../info/roomInfo_lol.json";//房间信息的json文件地址
let roomsInfo: roomInfo[] = JSON.parse(fs.readFileSync(infoFileName).toString());

let roomsLiveInfo: roomLiveInfo[] = [];

const netPromise = new Promise((resolve, reject) => {
    //5秒跳出
    setTimeout(function () {
        resolve(roomsLiveInfo);
    },5000)

    roomsInfo.forEach((value, index) => {
        request(value.url, function (error, response, body) {
            let oneLive: roomLiveInfo = {
                ...value,
                live: false, //是否正在直播
                statusCode: response.statusCode || 403,//http响应码
                sex: null,//主播性别 1为男 2为女 null未知
                streamUrl: "",//视频流链接
                streamerName: ""//视频流名称
            };
            if (!error && response.statusCode == 200 && (typeof body) === "string") {
                const regRes1: any = body.split("hyPlayerConfig =")[1].split("};")[0] + "}";

                if (regRes1 && JSON.parse(regRes1)["stream"]) {
                    let infoObj = JSON.parse(base64ToString(JSON.parse(regRes1)["stream"]));


                    let streamInfoList = infoObj.data[0].gameStreamInfoList;

                    let urlInfo1 = streamInfoList[0];
                    let urlInfo2 = streamInfoList[1];
                    //console.log("阿里的CDN");
                    let aliFLV = urlInfo1["sFlvUrl"] + "/" + urlInfo1["sStreamName"] + ".flv?" + urlInfo1["sFlvAntiCode"];
                    let aliHLS = urlInfo1["sHlsUrl"] + "/" + urlInfo1["sStreamName"] + ".m3u8?" + urlInfo1["sHlsAntiCode"];
                    let aliP2P = urlInfo1["sP2pUrl"] + "/" + urlInfo1["sStreamName"] + ".slice?" + urlInfo1["newCFlvAntiCode"];

                    //console.log("腾讯的CDN");
                    let txFLV = urlInfo2["sFlvUrl"] + "/" + urlInfo2["sStreamName"] + ".flv?" + urlInfo2["sFlvAntiCode"];
                    let txHLS = urlInfo2["sHlsUrl"] + "/" + urlInfo2["sStreamName"] + ".m3u8?" + urlInfo2["sHlsAntiCode"];
                    let txP2P = urlInfo2["sP2pUrl"] + "/" + urlInfo2["sStreamName"] + ".slice?" + urlInfo2["newCFlvAntiCode"];

                    oneLive.live = true;
                    //下面是copy的getHuyaStreamUrl.ts
                    const room_info = infoObj["data"][0]["gameLiveInfo"];
                    //主播性别
                    oneLive.sex = room_info["sex"];
                    //视频流名称
                    const streamerName = room_info["nick"];
                    oneLive.streamerName = streamerName;
                    //视频流链接
                    oneLive.streamUrl = txHLS.replace("amp;","");
                }
                console.log(`第${index}项已完成`);
            }
            roomsLiveInfo.push(oneLive);
            console.log(roomsLiveInfo.length + "/" + roomsInfo.length);
            if (roomsLiveInfo.length == roomsInfo.length) {
                resolve(roomsLiveInfo);
            }
        });
    })

});

netPromise.then(data => {
        console.log(`直播房状态抓取完毕`);
        console.log("准备写入 /info/live.json 文件");

        fs.writeFile(`../info/live.json`, JSON.stringify(data), function (err) {
            if (err) {
                return console.error(err);
            }
            console.log("数据文件写入成功！");
            process.exit();
        });
    }
    , err => console.log(err))
