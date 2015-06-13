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
            debug: true,
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
                console.warn(1);
            });
        });
    }

    return {
        start: start
    }
});
