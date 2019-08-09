const path = require('path')
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const colors = require('colors');
//Khai bao thu vien socketio 
const socketio = require('socket.io')
const io = socketio(server, { 'pingInterval': 10000, 'pingTimeout': 10000 });
//const io = socketio(server);
//const sql = require('mssql');
const esp8266_nsp = io.of('/esp8266')
const middleware = require('socketio-wildcard')()
esp8266_nsp.use(middleware);

var cycleTimeCollection = [];
var cycleTimeQuantity = 10;

//Khai bao thu vien Mongodb
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017";

// Database Name
const dbName = 'IoT';

// Create a new MongoClient
//const client = new MongoClient(url);
const client = new MongoClient(url, { useNewUrlParser: true });

//Khai bao ham ho tro
const common = require('./helpers/common')

//Khai bao ip
const ip = require('ip')

const port = process.env.PORT || 3484
const publicDirectoryPath = path.join(__dirname, '../public')

var connection = require('./helpers/connection');

var socketCount = 0;


app.use(express.static(publicDirectoryPath))
app.set("view engine", "ejs");
app.set("views", "./views");
function sendTime() {
    let time = common.getDateTime().toString();
    var json = {

        time: time
    }
    io.sockets.emit('atime', json);
}

io.on('connection', (socket) => {
    console.log("-----------------------------------------")
    socketCount++;
    let Time1 = common.getDateTime().toString();

    console.log(`esp8266 connected. ID: = ${socket.id}, Time: ${Time1}`.green)
    console.log(`Users online : ${socketCount}`.green);

    socket.emit('welcome', {
        message: 'Connected !!!!'
    });

    socket.on('nameESP', function (data) {
        console.log(data);
    });
    socket.on('message', function (data) {
        console.log(data);
    });
    socket.on('revatime', function (data) {
        console.log(colors.gray(data));
    });
    socket.on('atime', function (data) {
        sendTime();
        console.log(colors.gray(data));
    });
    // 
    // 
    // 
    //     

    var tempDate = "";
    var updatedSequence = 1;

    // var cycleTimeCollection = [];
    // var cycleTimeQuantity = 10;

    debugger;
    socket.on('command2', function (data) {


        console.log(colors.green(data));

        //Tạo biến thời gian để so sánh xem thời gian hiện tại đã đạt 07:30 chưa, bằng cách chuyển thời gian về dạng số giây tính từ 00:00
        //(ví dụ vào lúc 01:00 số giây là 3600 giây, vào lúc 07:30 số giây là 7*3600 + 30*60)
        var date01 = new Date();
        var hour = date01.getHours();
        var minute = date01.getMinutes();
        var second = date01.getSeconds();
        var timeInSec = hour * 3600 + minute * 60 + second;
        var at0730InSec = 7 * 3600 + 30 * 60;
        //

        if (timeInSec >= at0730InSec) {

            if (data.s == 'D' && data.e == 'O') {
                var today = common.getDateCustom();
                if (today == tempDate) {
                    updatedSequence++;
                }
                else {
                    updatedSequence = 1;
                }
            }

            tempDate = today;
            data.sq = updatedSequence;
            data.c = common.getTimeCustom();

            // Use connect method to connect to the Server
            client.connect(function (err) {

                console.log("Connected successfully to server");

                const db = client.db(dbName);

                const collection = db.collection('CycleTime');
                const collection2 = db.collection('DisplayData');

                debugger;
                collection.insertOne(data, function (err, result) {

                    console.log("Inserted 1 document into the collection");

                });

                if (data.s == 'D' && data.e == 'U') {

                    var today = common.getDateCustom();

                    collection2.findOne({ 'CreatedDay': today }, function (err, result) {
                        if (err) throw err;

                        if (result != null) {
                            
                            var newUpTime = result.UpTime + data.d

                            collection2.updateOne({ 'CreatedDay': today }, { $set: { 'ArduinoID': result.ArduinoID, 'TotalTime': result.TotalTime, 'Count': result.Count, 'CycleTimeCollection': result.CycleTimeCollection, 'MinRealTime': result.MinRealTime, 'MaxRealTime': result.MaxRealTime, 'Average': result.Average, 'CreatedDay': result.CreatedDay, 'CreatedTime': result.CreatedTime, 'UpTime': newUpTime } }, function (err, res) {
                                if (err) throw err;
                            });
                            
                        }

                    });
                
                }

                if (data.s == 'D' && data.e == 'D') {

                    //if duration of cycle time <= 2, does not calculate!
                    if (data.d > 2000) {

                        //get date today
                        var today = common.getDateCustom();
                        var timeNow = common.getTimeCustom();



                        //db find one
                        collection2.findOne({ 'CreatedDay': today }, function (err, result) {
                            if (err) throw err;


                            //if today's DisplayData not exist (if null), then insert new...
                            //...document(ArduinoID: data.arduinoID,TotalTime: data.cycletime,Count:1,RealTime:data.cycletime,MinRealTime:data.cycletime,CreatedTime:datetime.now())
                            if (result == null) {

                                //nếu ngày hôm nay chưa có dữ liệu, reset cycleTimeCollection, rồi thêm dữ liệu đầu tiên vào.
                                cycleTimeCollection = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                                cycleTimeCollection[9] = data;

                                //Gửi lên database với giá trị khởi tạo
                                collection2.insertOne({ 'ArduinoID': data.a, 'TotalTime': data.d, 'Count': 1, 'CycleTimeCollection': cycleTimeCollection, 'MinRealTime': data.d, 'MaxRealTime': data.d, 'Average': data.d, 'CreatedDay': today, 'CreatedTime': timeNow, 'UpTime':0 }, function (err, result) {

                                    console.log("Inserted 1 document into the collection");
                                });
                            }


                            //else update current document (not null)
                            //nếu hôm nay có dữ liệu DisplayData rồi thì cập nhật mới
                            else if (result != null) {

                                console.log(result);

                                //result.array[0].TotalTime += data.cycleTime
                                //if result.array[0].MinRealTime > data.cycleTime, then result.array[0].MinRealTime = data.cycleTime
                                //result.array[0].count++
                                //result.array[0].realTime = data.cycleTime

                                var newArduinoID = result.ArduinoID
                                var newTotalTime = result.TotalTime + data.d;
                                var newCount = result.Count + 1;
                                var newMinRealTime = Math.min(result.MinRealTime, data.d);
                                var newMaxRealTime = Math.max(result.MaxRealTime, data.d);
                                var newAvgCT = Math.round(newTotalTime / newCount * 10) / 10;
                                var newCreatedDay = result.CreatedDay;
                                var newTimeNow = result.CreatedTime;
                                var newUpTime = result.UpTime;

                                cycleTimeCollection.push(data);

                                if (cycleTimeCollection.length > cycleTimeQuantity) {
                                    cycleTimeCollection.shift();
                                }

                                collection2.updateOne({ 'CreatedDay': today }, { $set: { 'ArduinoID': newArduinoID, 'TotalTime': newTotalTime, 'Count': newCount, 'CycleTimeCollection': cycleTimeCollection, 'MinRealTime': newMinRealTime, 'MaxRealTime': newMaxRealTime, 'Average': newAvgCT, 'CreatedDay': newCreatedDay, 'CreatedTime': newTimeNow, 'UpTime': newUpTime } }, function (err, res) {
                                    if (err) throw err;
                                    console.log("1 document updated");
                                    //db.close();
                                });
                            }
                        });
                    }

                }

                

            });
        }


    });
    // socket.on('command', function (data) {
    //     //console.log(data);
    //     // let address = socket.handshake.address;
    //     // console.log('IP: ' + address);
    //     let Time3 = common.getDateTime().toString();
    //     var ct = Math.abs(Number(data.ct));
    //     console.log(Time3.red);
    //     if (data.ct != undefined && data.name != undefined) {
    //        //Nếu dữ liệu khác undefined 
    //         console.log('du lieu la'+ct)
    //         let Time = common.getDateTime().toString();
    //         //let value = ct;
    //         ///Thêm dữ liệu vào bảng CycleTime
    //         let a = data.name;
    //         let query = `INSERT INTO CycleTime(ArduinoID,RealTimeCycleTime,TimeRevCycleTime)VALUES ('${a}',${ct},'${Time}')`;
    //         common.insert(connection.config,query);
    //         //console.log(query.yellow);
    //         //retrieve displaydatas
    //         ///Kiểm tra bảng DisplayData theo data.name (là ArduinoID)
    //         let selectDisplayDatas = `SELECT * FROM DisplayDatas WHERE ArduinoID = '${data.name}' and CreateTime = '${common.getDateCustom()}'`;
    //         let item = common.GetItem(connection.config,selectDisplayDatas);
    //         item.then(result => {
    //             console.table(result);

    //             ///Nếu ArduinoID chưa có trong DisplayData
    //             if (result.rowsAffected[0]=== 0) {
    //                 console.log("chua co du lieu trong display data".cyan);
    //                 let query = `INSERT INTO DisplayDatas(ArduinoID,TotalTime,Count,RealTime,MinRealTime,CreateTime,CurrentTime)VALUES ('${data.name}',${ct},${1},${1}, ${1000000000000000},'${common.getDateCustom()}','${common.getDateTime()}')`
    //                 common.insert(connection.config,query);
    //                 console.log(query);
    //             }
    //             else {
    //                 ///Thì thêm mới
    //                 console.log("lay du lieu tu displaydata roi update lai".cyan);
    //                 // let select = `SELECT * FROM DisplayDatas WHERE ArduinoID = '${data.name}' and CreateTime = '${common.getDateCustom()}'`;
    //                 // var result2 =common.GetItem(select);
    //                // console.log(result[0]);
    //                  //update data

    //                   ///Tính totalTime để cập nhật
    //                  let totalTime = result.recordset[0].TotalTime +ct;
    //                  console.log(result.recordset.length);
    //                  //Đếm số lượng record thêm vào db
    //                  let count = result.recordset[0].Count + 1;

    //                  ///Tính thời gian nhỏ nhất để cập nhật
    //                  let realTime = ct;
    //                  var min=result.recordset[0].MinRealTime;
    //                  if (min >= ct) {
    //                      min = ct;
    //                  }
    //                  ///Cập nhật lại
    //                  //save db
    //                  let query = `UPDATE DisplayDatas SET Count =${count}, TotalTime=${totalTime},RealTime=${realTime} ,MinRealTime=${min}, CurrentTime = '${common.getDateTime()}' WHERE ArduinoID = '${data.name}' AND CreateTime = '${common.getDateCustom()}' `;
    //                  console.log(query);
    //                  common.Update(connection.config,query);
    //                //------------
    //             }
    //         })
    //     }

    // });

    socket.on('disconnect', () => {
        console.log("-----------------------------------------")
        socketCount--;
        console.log(`Users online : ${socketCount}`.red);
        let Time2 = common.getDateTime().toString();
        console.log(`User "${socket.id}" disconnected! `.red)
        console.log(`Time: ${Time2}`.red)

    })

})
server.listen(port, (res) => {
    // let a = "M1BC002";
    // let selectDisplayDatas = `SELECT * FROM DisplayDatas WHERE ArduinoID = '${a}' and CreateTime = '${common.getDateCustom()}'`;
    // console.log(selectDisplayDatas);
    // let item = common.GetItem(selectDisplayDatas);

    // let selectDisplayDatas = `SELECT * FROM DisplayDatas WHERE ArduinoID = 'M1BC002' and CreateTime = '2019-06-24 00:00:00.000'`;
    // let item = common.GetItem(connection.config, selectDisplayDatas);
    // item.then(result => {
    //     console.table(result.recordset)
    // })
     console.log(`Server is up on address ${ip.address()}:${port}!`.cyan);
})

app.get("/", function (req, res) {
    res.render("home");
}
);
