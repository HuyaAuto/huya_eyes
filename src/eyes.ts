import * as request from "request";
import * as fs from "fs";

//roomInfo接口
//TODO:如何把接口放在公共文件中？模块？
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

const infoFileName: string = "../info/roomInfo_100004.json";//房间信息的json文件地址
let roomsInfo: roomInfo[] = JSON.parse(fs.readFileSync(infoFileName).toString());

let roomsLiveInfo: roomLiveInfo[] = [];

//TODO:请求是异步的，但是貌似请求太多会阻塞，原因不明？封IP

const netPromise = new Promise((resolve, reject) => {
    //5秒跳出
    setTimeout(function () {
        resolve(roomsLiveInfo);
    },5000)

    roomsInfo.forEach((value, index) => {
        request(value.url, function (error, response, body) {
            let oneLive: roomLiveInfo = {
                title: value.title,//房间标题
                url: value.url,//房间链接
                roomId: value.roomId,//房间号
                nickname: value.nickname,//主播昵称
                avatar: value.avatar,//主播头像
                type: value.type,//直播类型
                quality: value.quality,//视频最高画质
                num: value.num,//观众人数
                level: value.level,//重要等级：默认为0；等级1以上将发送监控邮件（目前默认全局发送）；等级2将直接记录直播流。
                remark: value.remark,
                live: false, //是否正在直播
                statusCode: response.statusCode || 403,//http响应码
                sex: null,//主播性别 1为男 2为女 null未知
                streamUrl: "",//视频流链接
                streamerName: ""//视频流名称
            };
            if (!error && response.statusCode == 200 && (typeof body) === "string") {

                const regRes: any = /"stream": ({.+?})\s*}/.exec(body);
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
                    const tsStream: any = streamArr.filter((v: string) => {
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
    })

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
    }
    , err => console.log(err))
