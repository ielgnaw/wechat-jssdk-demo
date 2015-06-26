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
                var t;
                var pressNode = document.querySelector('#press');
                var oRounds = document.querySelectorAll('.round');
                var oSuggestion = document.querySelector('.suggestion');
                var oP = document.querySelector('#before_result');
                var oResult = document.querySelector('#result');
                var oClose = document.querySelector('#close');

                //用户点击关闭按钮
                oClose.addEventListener('click', function (e) {
                    wx.closeWindow();
                })
                // 按住超过 500 ms 才算是按住
                var delay = 100;
                var timer;
                pressNode.addEventListener('touchstart', function (e) {
                    oSuggestion.style.display = 'block';
                    oP.style.display = 'none';
                    timer = setTimeout(function () {
                        voice = {
                            localId: '',
                            serverId: ''
                        };
                        for(var i=0; i<oRounds.length; i++)
                        {
                            oRounds[i].style.display = 'block';
                        }
                        oP.style.display = 'block';
                        oP.innerHTML = '😄倾听中......';
                        clearTimeout(t);
                        oSuggestion.style.display = 'none';
                      //  pressNode.innerHTML = '开始说话...';
                        wx.startRecord({
                            cancel: function () {
                                alert('用户拒绝授权录音');
                            }
                        });
                    }, delay);
                });

                pressNode.addEventListener('touchend', function (e) {
                    clearTimeout(timer);
                   // pressNode.innerHTML = '按住说话';
                   for(var i=0; i<oRounds.length; i++)
                    {
                        oRounds[i].style.display = 'none';
                    }
                    wx.stopRecord({
                        success: function (res) {
                            oP.style.display = 'none';
                            voice.localId = res.localId;
                            wx.translateVoice({
                                localId: voice.localId,
                                complete: function (res) {
                                    if (res.hasOwnProperty('translateResult')) {
                                        var translateResult = res.translateResult.slice(0, -1);
                                        oResult.innerHTML = translateResult;
                                        setTimeout(function () {
                                            window.location.href = 'http://m.baidu.com/s?word=' + translateResult;
                                        }, 1000);
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
                            oSuggestion.style.display = 'none';
                            oP.style.display = 'block';
                            oP.innerHTML = '😢抱歉无法识别';
                            t = setTimeout(function(){
                                oP.style.display = 'none';
                                oSuggestion.style.display = 'block';
                            },1500);
                            //alert(JSON.stringify(res));
                        }
                    });
                    e.preventDefault();
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

            });
        });
    }

    return {
        start: start
    }
});
