const { objectToQueryString, request } = require('../utils/index')
const { getHeaders, getData } = require('./global')

// const packageInfo = [
//     {
//         "package_type": 1,
//         "package_id": 1,
//         "products": []
//     }
// ]


module.exports = (packageInfo, address) => new Promise((r, p) => {

    // packageInfo[0].products = products

    // products.products.forEach((item, index) => {
    //
    // })

    const form1 = {
        // 'address_id': '624bdd14ee8ec40001d4cea4',
        'user_ticket_id': 'default',
        'freight_ticket_id': 'default',
        'is_use_point': '0',
        'is_use_balance': '0',
        'is_buy_vip': '0',
        'coupons_id': '',
        'is_buy_coupons': '0',
        // 'packages': '[{"products":[{"id":"622ac0109675ba7699cec4b2","category_path":"58fd663f936edfe3568b5c15,58fd6a18936edfe4568b5c37,593f5379936edf9b22a0b15a","count":1,"price":"16.50","total_money":"16.50","instant_rebate_money":"0.00","activity_id":"","conditions_num":"","product_type":0,"sizes":[],"type":1,"total_origin_money":"16.50","price_type":0,"batch_type":-1,"sub_list":[],"order_sort":1,"origin_price":"16.50"},{"id":"622f17a33ef5cb777d65a2e8","category_path":"","count":1,"price":"13.90","total_money":"13.90","instant_rebate_money":"0.00","activity_id":"","conditions_num":"","product_type":0,"sizes":[],"type":1,"total_origin_money":"13.90","price_type":0,"batch_type":-1,"sub_list":[],"order_sort":2,"origin_price":"13.90"},{"id":"5fec3e46077214aa18895d10","category_path":"58f9e514936edfe3568b572e,58fa1cc1936edfe6568b58c2","count":3,"price":"9.90","total_money":"29.70","instant_rebate_money":"0.00","activity_id":"","conditions_num":"","product_type":0,"sizes":[],"type":1,"total_origin_money":"29.70","price_type":0,"batch_type":-1,"sub_list":[],"order_sort":3,"origin_price":"9.90"},{"id":"58c3a2df936edfad323d47a1","category_path":"58f9e574936edfe4568b5789,5e00bc90b0055a0b5b0b388e","count":1,"price":"49.90","total_money":"49.90","instant_rebate_money":"0.00","activity_id":"","conditions_num":"","product_type":0,"sizes":[],"type":1,"total_origin_money":"49.90","price_type":0,"batch_type":-1,"sub_list":[],"order_sort":4,"origin_price":"49.90"},{"id":"58f822db916edf584dcc241a","category_path":"58f9e5b3936edfe3568b5742,5b0ffb4545cd42444e8c837f","count":1,"price":"15.90","total_money":"15.90","instant_rebate_money":"0.00","activity_id":"","conditions_num":"","product_type":0,"sizes":[],"type":1,"total_origin_money":"15.90","price_type":0,"batch_type":-1,"sub_list":[],"order_sort":5,"origin_price":"15.90"},{"id":"5eb8acc07cdbf0130d24f455","category_path":"59701e80936edf4f38915857,5b0ff8d306752e25278bdb24","count":1,"price":"11.80","total_money":"11.80","instant_rebate_money":"0.00","activity_id":"","conditions_num":"","product_type":0,"sizes":[],"type":1,"total_origin_money":"11.80","price_type":0,"batch_type":-1,"sub_list":[],"order_sort":6,"origin_price":"11.80"},{"id":"62491582092dd5e25331a3b6","category_path":"","count":1,"price":"39.80","total_money":"39.80","instant_rebate_money":"0.00","activity_id":"","conditions_num":"","product_type":0,"sizes":[],"type":1,"total_origin_money":"39.80","price_type":0,"batch_type":-1,"sub_list":[],"order_sort":7,"origin_price":"39.80"},{"id":"59112c60916edf46248b5064","category_path":"58f9e574936edfe4568b5789,5e00bc90b0055a0b5b0b388e","count":1,"price":"49.90","total_money":"49.90","instant_rebate_money":"0.00","activity_id":"","conditions_num":"","product_type":0,"sizes":[],"type":1,"total_origin_money":"49.90","price_type":0,"batch_type":-1,"sub_list":[],"order_sort":8,"origin_price":"49.90"},{"id":"6243c546e61e7ed7f6e1f833","category_path":"","count":1,"price":"18.90","total_money":"18.90","instant_rebate_money":"0.00","activity_id":"","conditions_num":"","product_type":0,"sizes":[],"type":1,"total_origin_money":"18.90","price_type":0,"batch_type":-1,"sub_list":[],"order_sort":9,"origin_price":"18.90"}],"total_money":"246.30","total_origin_money":"246.30","goods_real_money":"246.30","total_count":11,"cart_count":11,"is_presale":0,"instant_rebate_money":"0.00","total_rebate_money":"0.00","used_balance_money":"0.00","can_used_balance_money":"0.00","used_point_num":0,"used_point_money":"0.00","can_used_point_num":0,"can_used_point_money":"0.00","is_share_station":0,"only_today_products":[],"only_tomorrow_products":[],"package_type":1,"package_id":1,"front_package_text":"即时配送","front_package_type":0,"front_package_stock_color":"#2FB157","front_package_bg_color":"#fbfefc","reserved_time":{"reserved_time_start":null,"reserved_time_end":null}}]',
        'packages': JSON.stringify(packageInfo),
        'check_order_type': '0',
        'is_support_merge_payment': '1',
        'showData': 'true',
        'showMsg': 'false',
        'nars': 'd07424bcff6e52994b647f225d09ecd2',
        'sesi': 'SPWffHj04c9a2bc95323b7a6a955e62f8680e80',
        station_id: address.station_id,//站点id
        address_id: address.id,//地址id
    }

    // let packages = JSON.stringify(form1);
    var options = {
        url: 'https://maicai.api.ddxq.mobi/order/checkOrder',
        method: 'POST',
        headers: getHeaders(),
        form: getData(
            form1
        )
    };
    // console.log(options);
    request(options, function callback(error, response, body) {
        // console.log(body);
        if (!error && response.statusCode == 200) {
            const data = JSON.parse(body)
            if (data.code === 0) {
                r(data.data)
            } else {
                p("checkOrder error: " + (body));
            }
        } else {
            p('checkOrder error: API请求失败' + error)
        }
    });
})
