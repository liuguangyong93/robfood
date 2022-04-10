const {objectToQueryString, request} = require('../utils/index')
const {getHeaders, getData} = require('./global')
const {red} = require("kolorist");

module.exports = (products, address) => new Promise((r, p) => {

    const options = {
        url: 'https://maicai.api.ddxq.mobi/order/getMultiReserveTime',
        method: 'POST',
        headers: getHeaders(),
        form: getData({
            products: JSON.stringify(products),
            station_id: address.station_id,
            address_id: address.id,
            group_config_id: '',
            isBridge: false
        })
    };
    // console.log(options);
    request(options, function callback(error, response, body) {
        // console.log(body);
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body)
            if (data.code === 0) {
                var time = data.data[0].time
                var timeList = []
                // var timeResult = undefined;
                time.forEach(timeKey => {
                    timeKey.times.forEach(timesKey => {
                        console.log(`  ${timesKey.select_msg} ${timesKey.disableType === 0 ? '可配送' : '已约满'}`)
                        timeList.push(timesKey)
                        // if (timeResult === undefined && !timesKey.disableType) {
                        // if (!timesKey.disableType) {
                        //     timeResult = timesKey
                        // }
                    })
                })
                if (timeList) {
                    r(timeList)
                } else {
                    p("  获取配送时间出错");
                }
            } else {
                p(data.msg);
            }
        } else {
            p('配送时间API请求失败' + response?.statusCode + error)
        }
    });
})