
//这下面都是伪代码
function download(streamerUrl,streamerName) {

    for (let i = 1;true;i++){
        /*
        执行ffmpeg录制直播流
        const huyaApp = spawn(cmd, [
            "-i",
            stream.streamUrl,
            "-f",
            "mp4",
            `${huyaRoomTitle}-${timeV}-res-${i}.MP4`,
        ]);
        */
        let fileSize = 0;
        while(true){
            //等待30s
            sleep(3000);
            //xxx()是获取文件大小的函数
            if(xxx() > 1000){
                //如果文件大于1000MB就跳出本次循环，结束ffmpeg循环
                //进入下一P循环
                break;
            }

            if(fileSize == xxx()){
                //如果文件大小30s没改变，则说明直播流断开
                //杀死ffmpeg进程
                //可以直接跳出两层循环
                return;
            }
        }

    }
}