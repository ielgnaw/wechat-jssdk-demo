/**
 * @file 常用方法
 * @author ielgnaw(wuji0223@gmail.com)
 */

/**
 * 响应 json 对象
 *
 * @param {Object} res response 对象
 * @param {Object} data 数据
 * @param {?string} errorMsg 错误信息，如果存在，那么说明是错误的响应
 */
exports.jsonResponse = function (res, data, errorMsg) {
    // CORS 跨域资源共享
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,GET',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Headers': 'X-Requested-With'
    });

    if (errorMsg) {
        res.json({status: 1, message: info, data: data});
    }
    else {
        res.json({status: 0, data: data});
    }
};

