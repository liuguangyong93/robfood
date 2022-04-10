const { queryStringToJSON } = require('../utils');
var path = require('path')
const { red } = require('kolorist')

var config = (() => {
    try {
        return require(path.resolve(__dirname, "../../config.js"))
    } catch {
        console.log(red("没有找到配置文件config.js"))
        process.exit(1)
    }
})()

const publicData = queryStringToJSON(config.options.url)
delete publicData.packages

// console.log(publicData);
const getData = (data) => {
    return { ...publicData, ...data, time: Date.parse(new Date()) / 1000 + '' }
}

const getHeaders = (data) => {
    let newVar = { ...config.headers, ...data, time: Date.parse(new Date()) / 1000 + '' };
    return newVar
}

module.exports = {
    getData,
    getHeaders
}