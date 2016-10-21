var http = require("http");
var url = require('url');
var fs = require('fs');
var io = require('socket.io'); // 加入 Socket.IO
var pagePath = "../page/";
var allRooms = new StringSet();
allRooms.add("default");

var server = http.createServer(function(request, response) {

  var pageType = '.html'

  console.log('Connection');
  var path = url.parse(request.url).pathname;

  switch (path) {
    case '/':
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write('Hello, World.');
      response.end();
      break;
    case '/socket':
      fs.readFile(pagePath + path + pageType, function(error, data) {
        if (error){
          response.writeHead(404);
          response.write("opps this doesn't exist - 404");
        } else {
          response.writeHead(200, {"Content-Type": "text/html"});
          response.write(data, "utf8");
        }
        response.end();
      });
      break;
    case '/allRooms':
      response.writeHead(200, {'Content-Type': 'text/json'});
      response.write(allRooms.toString());
      response.end();
      break;
    default:
      response.writeHead(404);
      response.write("opps " + path + " doesn't exist - 404");
      response.end();
      break;
  }
});

server.listen(8001);

serv_io = io.listen(server);
serv_io.set('log level', 1); // 關閉 debug 訊息

serv_io.sockets.on('connection', function(socket) {
  var room = socket.handshake.query.room;
  socket.join(room);//join room
  console.log("join room["+room+"]");

  if(!allRooms.contains(room)){
    allRooms.add(room)
    socket.emit('newRoom',{'data':room});//has new Room
    for (var i = 0; i<allRooms.values().length; i++) {
      //console.log("sdf"+allRooms.values()[i]);
      socket.broadcast.to(allRooms.values()[i]).emit('newRoom',{'data':room});//has new Room
    };
    console.log("newRoom["+room+"] come in");
  }
  socket.emit('allRooms',{'data':allRooms.values()});//send to self all room

  // 接收來自於瀏覽器的資料
  socket.on('sendMessage', function(data) {
    console.log("receive message["+data.data+"]");
    socket.emit('newMessage',{'data':data.data});//send to self
    socket.broadcast.to(room).emit("newMessage",{"data":data.data});//send to room 'all'
  });
  console.log("socket id["+socket.id+"]");
});


function StringSet() {
    var setObj = {}, val = {};

    this.add = function(str) {
      // if(!contains(str)){
        setObj[str] = val;
      // }
    };

    this.contains = function(str) {
        return setObj[str] === val;
    };

    this.remove = function(str) {
        delete setObj[str];
    };

    this.values = function() {
        var values = [];
        for (var i in setObj) {
            if (setObj[i] === val) {
                values.push(i);
            }
        }
        return values;
    };
}