const express = require('express')
const app = express()


const port = process.env.Port||3000
var server = app.listen(port,() => {
  console.log('is listening')
})

var socket = require('socket.io')
var io = socket(server);


app.use(express.static('public'));

io.on('connection', newConnection)


//assign color on connection
function newConnection(socket){

   socket.on('sendpull',senddata);

   var newcolor = {r:0, g:0, b:0}
   newcolor.r = Math.floor(Math.random()*255)
   newcolor.g = Math.floor(Math.random()*255)
   newcolor.b = Math.floor(Math.random()*255)
   console.log(newcolor);
   console.log(socket.id);
   socket.emit('sendColor',newcolor)



   function senddata(data){
    this.data =data;
    console.log(this.data);
    io.emit('pull', this.data);
  
  }


}





