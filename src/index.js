// const path = require('path')
// const express = require('express')
// const sql = require('mssql')
// const app = express()
// const server = require('http').createServer(app)

// const socketio = require('socket.io')

// const io = socketio(server)

// var ip = require('ip')
// var esp8266_nsp = io.of('/esp8266')
// var middleware = require('socketio-wildcard')()
// esp8266_nsp.use(middleware);

// const port = process.env.PORT || 3484
// const publicDirectoryPath = path.join(__dirname, '../public')

// // Configuration object for your database
// var config = {
//     user: 'sa',
//     password: 'shc@1234',
//     server: '10.4.5.61\\MSSQLSERVER18',
//     database: 'IoTProject',
//     port: 1433
// };

// app.use(express.static(publicDirectoryPath))

// function getDateTime() {

//     var date = new Date()

//     var hour = date.getHours()
//     hour = (hour < 10 ? "0" : "") + hour

//     var min = date.getMinutes()
//     min = (min < 10 ? "0" : "") + min

//     var sec = date.getSeconds();
//     sec = (sec < 10 ? "0" : "") + sec

//     var mini = date.getMilliseconds()

//     var year = date.getFullYear()

//     var month = date.getMonth() + 1
//     month = (month < 10 ? "0" : "") + month

//     var day = date.getDate();
//     day = (day < 10 ? "0" : "") + day

//     return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec + "." + mini

// }

// var insert = function (config, query) {
//     var pool = new sql.ConnectionPool(config).connect().then(pool => {
//         return pool.request().query(query)
//     }).then((result) => {
//         sql.close();
//         console.log("success!")
//     }).catch((err) => {
//         console.error("failed!")
//     })

//     sql.on('error', err => {
//         console.log("error connection!")
//         sql.close()
//     })
// }
// server.listen(port, (res) => {
//     console.log(`Server is up on address ${ip.address()}:${port}!`);
// })

// esp8266_nsp.on('connection', (socket) => {
//     var CurrentTime = getDateTime().toString();
//     console.log(`esp8266 connected. ID: = ${socket.id}, Time: ${CurrentTime}`)
//     socket.on('disconnect', () => {
//         console.log(`Disconnect socket esp8266, Time: ${CurrentTime}`)
//     })

//     //receive any command
//     socket.on("*", (packet) => {
//         var time = getDateTime().toString();
//         console.log(`Data: ${time}`)
//         console.log(packet.data)
//             // var CurrentTime = getDateTime().toString();
//             // var query = `insert into CycleTime(RealTimeCycleTime,TimeRevCycleTime) values (1,'${CurrentTime}')`;
//             // insert(config, query)
//     })
    
// })
