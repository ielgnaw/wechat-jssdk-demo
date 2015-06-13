/**
 * @file 启动edp web
 * @author errorrik[errorrik@gmail.com]
 */

var express = require('express');
var edp = require('edp-core');
var path = require('path');
var fs = require('fs');
// var util = require('./util');

/**
 * 机器ip
 *
 * @inner
 * @type {string}
 */
var ip = (function () {
    var ifaces = require('os').networkInterfaces();
    var defultAddress = '127.0.0.1';
    var ip = defultAddress;

    function x(details) {
        if (ip === defultAddress && details.family === 'IPv4') {
            ip = details.address;
        }
    }

    for (var dev in ifaces) {
        ifaces[dev].forEach(x);
    }

    return ip;
})();


function start(port) {
    var app = express();
    app.use(express.static(__dirname + '/public'));

    var files = fs.readdirSync(__dirname);
    files.forEach(function (file) {
        var dir = path.resolve(__dirname, file);
        var indexFile = path.resolve(dir, 'index.js');
        if (fs.statSync(dir).isDirectory() && fs.existsSync(indexFile)) {
            var indexModule = require(indexFile);
            if (typeof indexModule.init === 'function') {
                indexModule.init(app);
            }
        }
    });

    var server = app.listen(port);
    // var io = startWebSocketServer(server);

    // extensionInit(app, io);

    edp.log.info('Edp Web start.');
    edp.log.info('Visit ' + underlineString('http://localhost:' + port)
        + ' or ' + underlineString('http://' + ip + ':' + port));
    edp.log.info('To stop, Press Ctrl+C');
}

start(8000);

/**
 * 对输出命令行的字符串添加下划线
 *
 * @inner
 * @param {string} str 源字符串
 * @return {string}
 */
function underlineString(str) {
    return '\033[4m'+ str + '\033[0m';
}
