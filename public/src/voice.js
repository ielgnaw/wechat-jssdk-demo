/**
 * @file 主启动模块
 * @author ielgnaw(wuji0223@gmail.com)
 */

define(function (require) {

    var wx = require('wx');

    /**
     * 微信 api 配置
     *
     * @param {Object} opts 配置对象
     * @param {string} opts.appid 公众号的 appid
     * @param {number} opts.timestamp 生成签名的时间戳
     * @param {string} opts.nonceStr 生成签名的随机串
     * @param {string} opts.signature 签名
     */
    function wxConfig(opts) {
        wx.config({
            debug: 0,
            appId: opts.appid,
            timestamp: opts.timestamp,
            nonceStr: opts.nonceStr,
            signature: opts.signature,
            jsApiList: [
                'checkJsApi',
                'translateVoice',
                'startRecord',
                'stopRecord',
                'onRecordEnd',
                'playVoice',
                'pauseVoice',
                'stopVoice',
                'uploadVoice',
                'downloadVoice'
            ]
        });
    }

    function start() {
        var $ = require('jquery');
        $.ajax({
            method: 'post',
            url: '/getConfig',
            type: 'post',
            data: {
                url: location.href.split('#')[0]
            }
        }).done(function (data) {
            var params = data.data;
            console.warn('jsapi_ticket: ' + params.ticket);
            console.warn('nonceStr: ' + params.nonceStr);
            console.warn('timestamp: ' + params.timestamp);
            console.warn('url: ' + params.url);
            console.log('signature: ' + params.signature);
            wxConfig(params);
            wx.ready(function () {
                var voice = {
                    localId: '',
                    serverId: ''
                };

                var pressNode = document.querySelector('#press');
                // 按住超过 500 ms 才算是按住
                var delay = 100;
                var timer;
                pressNode.addEventListener('touchstart', function (e) {
                    timer = setTimeout(function () {
                        voice = {
                            localId: '',
                            serverId: ''
                        };
                        pressNode.innerHTML = '开始说话...';
                        wx.startRecord({
                            cancel: function () {
                                alert('用户拒绝授权录音');
                            }
                        });
                    }, delay);
                });

                pressNode.addEventListener('touchend', function (e) {
                    clearTimeout(timer);
                    pressNode.innerHTML = '按住说话';
                    wx.stopRecord({
                        success: function (res) {
                            voice.localId = res.localId;
                            wx.translateVoice({
                                localId: voice.localId,
                                complete: function (res) {
                                    if (res.hasOwnProperty('translateResult')) {
                                        setTimeout(function () {
                                            window.location.href = 'http://m.baidu.com/s?word=' + res.translateResult.slice(0, -1);
                                        }, 20);
                                        // alert('识别结果：' + res.translateResult);
                                    } else {
                                        alert('无法识别');
                                    }
                                }
                            });

                            voice = {
                                localId: '',
                                serverId: ''
                            };
                        },
                        fail: function (res) {
                            alert(JSON.stringify(res));
                        }
                    });
                });

                wx.onVoiceRecordEnd({
                    complete: function (res) {
                        voice.localId = res.localId;
                        alert('录音时间已超过一分钟');
                    }
                });

                document.querySelector('#playVoice').onclick = function () {
                    if (voice.localId == '') {
                        alert('请先使用 startRecord 接口录制一段声音');
                        return;
                    }
                    wx.playVoice({
                        localId: voice.localId
                    });

                    wx.translateVoice({
                        localId: voice.localId,
                        complete: function (res) {
                            if (res.hasOwnProperty('translateResult')) {
                                alert('识别结果：' + res.translateResult);
                            } else {
                                alert('无法识别');
                            }
                        }
                    });
                };

                // 3 智能接口
                // var voice = {
                //     localId: '',
                //     serverId: ''
                // };
                // // 3.1 识别音频并返回识别结果
                // document.querySelector('#translateVoice').onclick = function () {
                //     if (voice.localId == '') {
                //         alert('请先使用 startRecord 接口录制一段声音');
                //         return;
                //     }
                //     wx.translateVoice({
                //         localId: voice.localId,
                //         complete: function (res) {
                //             if (res.hasOwnProperty('translateResult')) {
                //                 alert('识别结果：' + res.translateResult);
                //             } else {
                //                 alert('无法识别');
                //             }
                //         }
                //     });
                // };

                // // 4 音频接口
                // // 4.2 开始录音
                // document.querySelector('#startRecord').onclick = function () {
                //     wx.startRecord({
                //         cancel: function () {
                //             alert('用户拒绝授权录音');
                //         }
                //     });
                // };

                // // 4.3 停止录音
                // document.querySelector('#stopRecord').onclick = function () {
                //     wx.stopRecord({
                //         success: function (res) {
                //             voice.localId = res.localId;
                //         },
                //         fail: function (res) {
                //             alert(JSON.stringify(res));
                //         }
                //     });
                // };

                // // 4.4 监听录音自动停止
                // wx.onVoiceRecordEnd({
                //     complete: function (res) {
                //         voice.localId = res.localId;
                //         alert('录音时间已超过一分钟');
                //     }
                // });

                // // 4.5 播放音频
                // document.querySelector('#playVoice').onclick = function () {
                //     if (voice.localId == '') {
                //         alert('请先使用 startRecord 接口录制一段声音');
                //         return;
                //     }
                //     wx.playVoice({
                //         localId: voice.localId
                //     });
                // };

                // // 4.6 暂停播放音频
                // document.querySelector('#pauseVoice').onclick = function () {
                //     wx.pauseVoice({
                //         localId: voice.localId
                //     });
                // };

                // // 4.7 停止播放音频
                // document.querySelector('#stopVoice').onclick = function () {
                //     wx.stopVoice({
                //         localId: voice.localId
                //     });
                // };

                // // 4.8 监听录音播放停止
                // wx.onVoicePlayEnd({
                //     complete: function (res) {
                //         alert('录音（' + res.localId + '）播放结束');
                //     }
                // });

                // // 4.8 上传语音
                // document.querySelector('#uploadVoice').onclick = function () {
                //     if (voice.localId == '') {
                //         alert('请先使用 startRecord 接口录制一段声音');
                //         return;
                //     }
                //     wx.uploadVoice({
                //         localId: voice.localId,
                //         success: function (res) {
                //             alert('上传语音成功，serverId 为' + res.serverId);
                //             voice.serverId = res.serverId;
                //         }
                //     });
                // };

                // // 4.9 下载语音
                // document.querySelector('#downloadVoice').onclick = function () {
                //     if (voice.serverId == '') {
                //         alert('请先使用 uploadVoice 上传声音');
                //         return;
                //     }
                //     wx.downloadVoice({
                //         serverId: voice.serverId,
                //         success: function (res) {
                //             alert('下载语音成功，localId 为' + res.localId);
                //             voice.localId = res.localId;
                //         }
                //     });
                // };

            });
        });
    }

    return {
        start: start
    }
});
