const {objectToQueryString, request} = require('../utils/index')
const {getHeaders, getData} = require('./global')


module.exports = (packageInfo) => new Promise((r, p) => {


    let headers = getHeaders();
    delete headers.time
    const data = getData({package_order: JSON.stringify(packageInfo),showMsg: 'false', showData: 'true', ab_config: '{"key_onion":"C"}',});
    delete data.is_load
    delete data.ab_config

    const options = {
        url: 'https://maicai.api.ddxq.mobi/order/addNewOrder',
        method: 'POST',
        headers: headers,
        form: data
    };

    // console.log(options);
    request(options, function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body)
            r(data)
            // if (data.code === 0) {
            //     r(data.data)
            // } else if(data.code === 5001){//有商品缺货
            //     console.log("  有商品缺货,自动去除缺货商品下单");
            //     r(data.data.order.payment_order)
            //     // p(`${data.msg}`);
            // } else if(data.code === 5014){
            //     p(`${data.msg}`);
            // } else {
            //     p(`createOrder code: ${data.code} msg:${data.msg}`);
            // }
        } else {
            p(`createOrder API请求失败 httpCode: ${response.statusCode}`)
        }
    });
})

