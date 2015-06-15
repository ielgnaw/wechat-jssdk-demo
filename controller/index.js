/**
 * @file controller
 * @author ielgnaw(wuji0223@gmail.com)
 */

var bodyParser = require('body-parser');
var https = require('https');
var jsSHA = require('jssha');
var util = require('../util');

/**
 * 公众号配置
 *
 * @type {Object}
 */
var APP_CONFIG = {
    // appid: 'wxa0f06601f19433af',
    // secret: '097fd14bac218d0fb016d02f525d0b1e'
    appid: 'wxde2318072350bd03',
    secret: 'be0ab502d47d9cbd51da2eb57e5bf0c6'
};

/**
 * 签名的缓存 url 为 key
 *
 * @type {Object}
 */
var SIGNATURE_CACHE = {};

/**
 * ticket 有效时间
 *
 * @type {number}
 */
var EXPIRE_TIME = 7200;

/**
 * 初始化
 *
 * @param {express} app express 服务实例
 */
exports.init = function (app) {
    // for parsing application/json
    app.use(bodyParser.json());

    // for parsing application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({extended: true}));

    exports.routeRequireConfig(app);
    exports.routeWXConfig(app);
};

/**
 * require.config.js 的 route
 *
 * @param {express} app express 服务实例
 */
exports.routeRequireConfig = function (app) {
    var config = {
        baseUrl: './src',
        packages: [
            {
                name: 'jquery',
                location: '../dep/jquery/1.9.1/src',
                main: 'jquery.min'
            },
            {
                name: 'wx',
                location: '../dep/jweixin',
                main: 'jweixin-1.0.0'
            }
        ]
    };
    var configStr = 'require.config(' + JSON.stringify(config) + ');';
    app.get('/require.config.js', function (req, res) {
        res.setHeader('Content-Type', 'text/javascript; charset=UTF-8');
        res.end(configStr);
    });
};

/**
 * 获取 wx config 的请求
 *
 * @param {express} app express 服务实例
 */
exports.routeWXConfig = function (app) {

    app.post('/getConfig', function (req, res) {
        var postArgs = req.body;

        var url = postArgs.url;

        if (!url) {
            util.jsonResponse(res, {}, '缺少 url 参数');
            return;
        }

        var cache = SIGNATURE_CACHE[url];

        // 如果缓存中已存在签名，则直接返回签名
        if (cache && cache.timestamp) {
            var t = createTimeStamp() - cache.timestamp;

            // 未过期，并且访问的是同一个地址
            // 判断地址是因为微信分享出去后会额外添加一些参数，地址就变了不符合签名规则，需重新生成签名
            if (t < EXPIRE_TIME && cache.url == url) {
                util.jsonResponse(res, cache);
                return;
            }
            // 过期了
            else {
                delete SIGNATURE_CACHE[url];
            }
        }

        var getAccessTokenUrl = ''
            + 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='
            + APP_CONFIG.appid
            + '&secret='
            + APP_CONFIG.secret;

        // 获取 access_token
        https.get(getAccessTokenUrl, function (_res) {
            var accessTokenStr = '';
            _res.on('data', function (data) {
                accessTokenStr += data;
            });
            _res.on('end', function () {
                console.warn('get access_token: ' + accessTokenStr);

                var accessTokenObj = {};
                try {
                    accessTokenObj = JSON.parse(accessTokenStr);
                }
                catch (e) {
                    util.jsonResponse(res, {}, '获取 access_token 错误: ' + e);
                    return;
                }

                getTicket(url, accessTokenObj, res);
            });
        });

    });
};

/**
 * 获取 ticket
 *
 * @param {string} url 用于签名的 url
 * @param {Object} accessData access_token 数据对象
 * @param {Object} res 相应对象
 */
function getTicket(url, accessData, res) {
    var getTicketUrl = ''
        + 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='
        + accessData.access_token
        + '&type=jsapi';

    https.get(getTicketUrl, function (_res) {
        var ticketStr = '';
        var ticketObj = {};
        _res.on('data', function (data) {
            ticketStr += data;
        });
        _res.on('end', function () {
            console.warn('get ticket: ' + ticketStr);
            try {
                ticketObj = JSON.parse(ticketStr);
            }
            catch (e) {
                util.jsonResponse(res, {}, '获取 ticket 错误: ' + e);
                return;
            }

            var timestamp = createTimeStamp();
            var nonceStr = createNonceStr();
            var ticket = ticketObj.ticket;
            var signature = createSignature(ticket, nonceStr, timestamp, url);

            SIGNATURE_CACHE[url] = {
                nonceStr: nonceStr,
                appid: APP_CONFIG.appid,
                timestamp: timestamp,
                signature: signature,
                url: url,
                ticket: ticket
            };

            util.jsonResponse(res, SIGNATURE_CACHE[url]);
            return;
        });
    });
}

/**
 * 产生随机串 nonceStr
 *
 * @return {string} 随机串
 */
function createNonceStr() {
    return Math.random().toString(36).substr(2, 15);
}

/**
 * 产生时间戳 timestamp
 *
 * @return {number} 时间戳
 */
function createTimeStamp() {
    return parseInt(new Date().getTime() / 1000) + '';
}

/**
 * 生成签名
 *
 * @param {string} ticket 用于签名的 jsapi_ticket
 * @param {string} noncestr 用于签名的随机串
 * @param {number} timestamp 用于签名的时间戳
 * @param {string} url 用于签名的 url
 *
 * @return {string} 签名
 */
function createSignature(ticket, noncestr, timestamp, url) {
    var str = 'jsapi_ticket=' + ticket + '&noncestr=' + noncestr + '&timestamp='+ timestamp +'&url=' + url;
    var shaObj = new jsSHA(str, 'TEXT');
    return shaObj.getHash('SHA-1', 'HEX');
}
