const sql = require('mssql');
const colors = require('colors');
var connection = require('./connection');


module.exports.getDateTime = function () {

    var date = new Date()

    var hour = date.getHours()
    hour = (hour < 10 ? "0" : "") + hour

    var min = date.getMinutes()
    min = (min < 10 ? "0" : "") + min

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec

    var mini = date.getMilliseconds()

    var year = date.getFullYear()

    var month = date.getMonth() + 1
    month = (month < 10 ? "0" : "") + month

    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day

    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec + "." + mini

}
module.exports.getDateCustom = function () {

    var date = new Date()

    var year = date.getFullYear()

    var month = date.getMonth() + 1
    month = (month < 10 ? "0" : "") + month

    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day

    return year + "-" + month + "-" + day + ""

}

module.exports.getTimeCustom = function () {

    var date = new Date()
    
    var hour = date.getHours()
    hour = (hour < 10 ? "0" : "") + hour

    var min = date.getMinutes()
    min = (min < 10 ? "0" : "") + min

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec

    return hour + ":" + min + ":" + sec
}

// module.exports.insert = function (query) {

//     var pool = new sql.ConnectionPool(connection.config).connect().then(pool => {
//         return pool.request().query(query)
//     }).then((result) => {
//         sql.close();
//         console.log("Insert success!".green)
//     }).catch((err) => {
//         console.error(`Error: ${err}`.red)
//     })

//     sql.on('error', err => {
//         console.log("error connection!".red)
//         sql.close();
//     })
// }

// module.exports.Update = function (query) {
//     var pool = new sql.ConnectionPool(connection.config).connect().then(pool => {
//         return pool.request().query(query);
//     }).then((result) => {
//         console.log("Update success!");
//         sql.close();
//     }).catch((err) => {
//         console.error(`Error: ${err}`.red)

//     })

//     sql.on('error', err => {
//         console.log(err.red)
//         sql.close();
//     })
// }

// module.exports.GetItem = async function (query) {
//     let sqlResult = '';
//     try {
//         await sql.connect(connection.config)
//         const result = await sql.query(query);
//         if (result.recordset === undefined) {
//             console.dir("get item if true");
//             sqlResult = 0;
//         }

//         else {
//             console.dir("get item if fasle");
//             sqlResult = result;    
//         }
//         sql.close();
//     } catch (err) {
//         console.log("Not found".yellow);
//         console.log(err);
//         sql.close();
//     }

//     return sqlResult;
 
// }
