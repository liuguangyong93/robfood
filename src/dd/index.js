const cart = require('./cart')
const checkOrder = require('./check_order')
const reserverTime = require('./reserver_time')
const addNewOrder = require('./add_order')
const address = require('./address')
const {loading} = require('../utils/index')
const {prompt} = require('enquirer')
const play = require('play');

const {
    green,
    red,
    yellow,
} = require('kolorist')
const _ = require('lodash')
const path = require("path");

async function addressList(list) {
    const _list = []
    const _map = {}
    _.sortBy(list, e => !e.is_default).forEach(item => {
        const add = `${item.location.name}-${item.addr_detail}-${item.mobile}`
        _list.push(add)
        _map[add] = item
    })

    const select = await prompt({
        type: 'select',
        name: 'address',
        message: "选择送货地址",
        choices: _list
    })

    return _map[select.address]
    // return list[0];
}

let selectTime = {
    "type": 4,
    "fullFlag": false,
    "disableType": 0,
    "disableMsg": "",
    "textMsg": "",
    "start_time": "5:59",
    "end_time": "23:00",
    "start_timestamp": 1680123600,
    "end_timestamp": 1680188400,
    "arrival_time_msg": "自动尝试可用时段",
    "arrival_time": false,
    "select_msg": "自动尝试可用时段"
}
let selectAddress;
let timeList
let cartInfo
let orderInfo

async function addOrder(packageInfo) {
    try {
        // randomSelectTime()

        // if (packageInfo.payment_order.reserved_time_end === -1) {
        //     packageInfo.payment_order.reserved_time_start = selectTime.start_timestamp
        //     packageInfo.payment_order.reserved_time_end = selectTime.end_timestamp
        //     packageInfo.packages[0].reserved_time_start = selectTime.start_timestamp
        //     packageInfo.packages[0].reserved_time_end = selectTime.end_timestamp
        // }

        console.log(yellow("6.创建订单"))
        const createOrder = await addNewOrder(packageInfo);
        // console.log('createOrder:::', packageInfo, createOrder);
        if (createOrder.code === 0) {
            console.log(green("  订单创建成功"))
            play.sound(path.resolve(__dirname, "../../static/Royal Philharmonic Orchestra - Yellow.mp3"));
        } else if (createOrder.code === 5001) {//有商品缺货
            console.log(yellow("  有商品缺货,自动去除缺货商品下单"));
            await addOrder(createOrder.data.order.payment_order)
        } else if (createOrder.code === -3001) {//有商品缺货
            console.log(red("  人多拥挤，稍后再试"));
            await addOrder(packageInfo)
        } else if (createOrder.code === 5003) {//送达时间已抢光 商品信息有变化  请求频繁
            let number = Math.floor(Math.random() * (1600 - 900) + 900);
            console.log(red(`  ${createOrder.msg} ${number}毫秒后重试`));
            setTimeout(function () {
                addOrder(packageInfo)
            }, number)
        } else if (createOrder.code === 1111) {//登录失效
            console.log(red("  登录失效"));
            process.exit(1)
        } else if (createOrder.code === 5004) {//您选择的送达时间已经失效了，请重新选择
            console.log(red(`  ${createOrder.msg || '您选择的送达时间已失效，自动重试'}`));
            // for (let item of timeList) {
            //     if (item.end_timestamp === packageInfo.reserved_time_end) {
            //         item.disableType = 1
            //         break
            //     }
            // }
            await addOrder(packageInfo)
        } else if (createOrder.code === 5014) {//暂未营业
            let number = Math.floor(Math.random() * (1600 - 900) + 900);
            console.log(red(`  暂未营业,${number}毫秒后重试`));
            setTimeout(function () {
                addOrder(packageInfo)
            }, number)
        } else {
            console.log(red(`  ${JSON.stringify(createOrder)}，将重试 `))
            await addOrder(packageInfo)
        }
    } catch (error) {
        // let number = Math.floor(Math.random() * (1600 - 900) + 900);
        // console.log(red(`${error.message || error} ${number}毫秒后重试`));
        // setTimeout(function () {
        //     addOrder(packageInfo)
        // }, number)
        console.log(red(`  ${error.message || error}，立马重试 `))
        await addOrder(packageInfo)
    }


}

async function initCart() {
    console.log(yellow("2.购物车初始化"))
    try {
        cartInfo = await cart({"ddmc-station-id": selectAddress.station_id}, {station_id: selectAddress.station_id})

        if (!cartInfo) {
            console.log("\n", red("  购物车获取失败,自动重试"))
            await initCart()
            return
        }
        if (!cartInfo.new_order_product_list) {
            console.log("\n", red("  购物车参数错误，请修正"))
            process.exit(1)
        } else if (cartInfo.new_order_product_list.length === 0) {
            console.log("\n", red("  购物车中商品已全部失效, 请先添加"))
            process.exit(1)
        }
    } catch (error) {
        console.log(red(`  ${error.message || error}，立马重试 `))
        await initCart()
    }

}

async function getAddress() {
    try {
        console.log(yellow("1.加载配送地址"))
        if (!selectAddress) {
            let _addressList = await address();
            if (!_addressList) {
                console.log("\n", red("获取地址失败,尝试重新获取"))
                await getAddress()
            } else {
                selectAddress = await addressList(_addressList)
                // console.log(green(`  获取地址成功：${selectAddress.location.name}-${selectAddress.addr_detail}-${selectAddress.mobile}`))
            }
        } else {
            console.log(green(`  获取缓存地址成功：${selectAddress.location.name}-${selectAddress.addr_detail}-${selectAddress.mobile}`))
        }
    } catch (error) {
        console.log(red(`  ${error.message || error}，立马重试 `))
        await getAddress()
    }

}

// async function getMultiReserveTime(products) {
//     try {
//         console.log(yellow("3.加载配送时间列表"))
//         selectTime = undefined
//         timeList = undefined
//         timeList = await reserverTime([products], selectAddress)
//         if (!timeList) {
//             console.log(red("加载配送时间列表失败，将重试"))
//             await getMultiReserveTime()
//         }
//
//     } catch (error) {
//         console.log(red(`  ${error.message || error}，立马重试 `))
//         await getMultiReserveTime()
//     }
//
// }

async function checkOrder1(packageInfo) {
    try {
        console.log(yellow("4.检查订单"))
        orderInfo = await checkOrder(packageInfo, selectAddress)

        if (!orderInfo) {
            console.log(red("checkOrder失败，将重试"))
            await checkOrder1(packageInfo)
        } else {
            const price = orderInfo.order.total_money
            console.log(red("  订单检查成功，总额"), price)
        }
    } catch (error) {
        console.log(red(`  ${error.message || error}，立马重试 `))
        await checkOrder1(packageInfo)
    }

}

function randomSelectTime() {
    console.log(yellow("5.随机选择配送时间"))
    let num = Math.floor(Math.random() * timeList.length);
    const time = timeList[num]
    if (time.disableType === 0) {
        selectTime = time
        console.log(red("  选定配送时间"), selectTime.select_msg)
    } else {
        randomSelectTime()
    }


    // timeList.forEach(item => {
    //     if (item.disableType !== 0) {
    //         selectTime = item
    //     }
    // })
    // if (selectTime) {
    //     console.log(yellow("  选定配送时间"), selectTime.select_msg)
    // } else {
    //     console.log(red("  无可用配送时间，自动重试"))
    // }
}

async function main() {
    console.log("\n")
    console.log(yellow("------------------------------------"))
    console.log(yellow("---------------开始购买-------------"))
    console.log(yellow("------------------------------------"))


    await getAddress()
    await initCart()

    const products = cartInfo.new_order_product_list[0].products
    var _products = []

    console.log(yellow(`  购物车中支持购买的商品，共${products.length}种`))
    products.forEach((item, index) => {
        console.log(`    商品${index + 1}: ${item.product_name}: 单价:${item.price}: 数量:${item.count}: 总价:${item.total_price}`)
        _products.push({
            id: item.id,
            category_path: item.category_path,
            count: item.count,
            price: item.price,
            total_money: item.total_price,
            instant_rebate_money: item.instant_rebate_money,
            activity_id: item.activity_id,
            conditions_num: item.conditions_num,
            product_type: item.product_type,
            sizes: item.sizes,
            type: item.type,
            total_origin_money: item.total_origin_price,
            price_type: item.price_type,
            batch_type: item.sale_batches.batch_type,
            sub_list: item.sub_list,
            order_sort: item.order_sort,
            origin_price: item.origin_price,

        })
    })
    // await getMultiReserveTime(products)


    let packageInfo = cartInfo.new_order_product_list
    delete packageInfo[0].products
    packageInfo[0].products = _products
    packageInfo[0].products.reserved_time = {
        reserved_time_start: null,
        reserved_time_end: null
    }

    await checkOrder1(packageInfo)


    const packageInfo2 = {
        "payment_order": {
            "reserved_time_start": selectTime.start_timestamp,
            "reserved_time_end": selectTime.end_timestamp,
            "price": orderInfo.order.total_money,
            "freight_discount_money": orderInfo.order.freight_discount_money,
            "freight_money": orderInfo.order.freight_money,
            "order_freight": "0.00",
            "parent_order_sign": cartInfo.parent_order_info.parent_order_sign,
            "product_type": 1,
            "address_id": selectAddress.id,
            "form_id": "477ae57157ae44928a21d351f6b79390",
            "receipt_without_sku": null,
            "pay_type": 6,
            "vip_money": "",
            "vip_buy_user_ticket_id": "",
            "coupons_money": "",
            "coupons_id": ""
        },
        "packages": [{
            "products": products,
            "total_money": orderInfo.order.total_money,
            "total_origin_money": orderInfo.order.goods_origin_money,
            "goods_real_money": orderInfo.order.goods_real_money,
            "total_count": cartInfo.new_order_product_list[0].total_count,
            "cart_count": cartInfo.new_order_product_list[0].cart_count,
            "is_presale": cartInfo.new_order_product_list[0].is_presale,
            "instant_rebate_money": cartInfo.new_order_product_list[0].instant_rebate_money,
            "total_rebate_money": cartInfo.new_order_product_list[0].total_rebate_money,
            "used_balance_money": cartInfo.new_order_product_list[0].used_balance_money,
            "can_used_balance_money": cartInfo.new_order_product_list[0].can_used_balance_money,
            "used_point_num": cartInfo.new_order_product_list[0].used_point_num,
            "used_point_money": cartInfo.new_order_product_list[0].used_point_money,
            "can_used_point_num": cartInfo.new_order_product_list[0].can_used_point_num,
            "can_used_point_money": cartInfo.new_order_product_list[0].can_used_point_money,
            "is_share_station": cartInfo.new_order_product_list[0].is_share_station,
            "only_today_products": cartInfo.new_order_product_list[0].only_today_products,
            "only_tomorrow_products": cartInfo.new_order_product_list[0].only_tomorrow_products,
            "package_type": cartInfo.new_order_product_list[0].package_type,
            "package_id": cartInfo.new_order_product_list[0].package_id,
            "front_package_text": cartInfo.new_order_product_list[0].front_package_text,
            "front_package_type": cartInfo.new_order_product_list[0].front_package_type,
            "front_package_stock_color": cartInfo.new_order_product_list[0].front_package_stock_color,
            "front_package_bg_color": cartInfo.new_order_product_list[0].front_package_bg_color,
            "eta_trace_id": "",
            "reserved_time_start": selectTime.start_timestamp,
            "reserved_time_end": selectTime.end_timestamp,
            "soon_arrival": "",
            "first_selected_big_time": 1
        }]
    }
    // packageInfo.payment_order.reserved_time_start = selectTime.start_timestamp
    // packageInfo.payment_order.reserved_time_end = selectTime.end_timestamp
    // packageInfo.packages[0].reserved_time_start = selectTime.start_timestamp
    // packageInfo.packages[0].reserved_time_end = selectTime.end_timestamp

    console.log('packageInfo2::::', packageInfo2);

    await addOrder(packageInfo2);


}


run();

async function run() {
    // try {
    await main()
    // } catch (error) {
    //
    //
    // }
}