// matter.js variable
var Engine = Matter.Engine
// Render = Matter.Render;
World = Matter.World
Bodies = Matter.Bodies
Body = Matter.Body
Constraint = Matter.Constraint
Mouse = Matter.Mouse
MouseConstraint = Matter.MouseConstraint
Events = Matter.Events

var engine
var world

var boxes = []
var bell

// socket
var socket
var myColor
var forceIndex = 0.00005
var myAngle = 0.6

function preload () {
  bell = loadSound('assets/bell.wav')
}

function setup () {
  var canvas = createCanvas(windowWidth, windowHeight)

  engine = Engine.create()
  world = engine.world
  // Engine.run(engine);
  var canvasmouse = Mouse.create(canvas.elt)
  canvasmouse.pixelRatio = pixelDensity()
  var options = {
    mouse: canvasmouse,
    constraint: {
      stiffness: 0
      // allow bodies on mouse to rotate
      // angularStiffness: 0
    }
  }
  mouseconstraint = MouseConstraint.create(engine, options)
  World.add(world, mouseconstraint)

  CanvasInit()
  CollisionDetection()

  // socket event listener
  socket = io()
  // socket.on('sendforce',);
  socket.on('sendColor', assignColor)
  socket.on('pull', function (data) {
    boxes[data.id].applyforce(data.id, data.offset, data.force);
    boxes[data.id].switchcolor(data.color);
  })

  // p5js
  colorMode(RGB, 255)
}

function CanvasInit () {
  var winterval = (windowWidth - 200) / 16
  var hinterval = (windowHeight - 200) / 9

  var idno = 0
  for (var i = 0; i < 16; i++) {
    for (var a = 0; a < 9; a++) {
      var box = new Box(100 + i * winterval, 100 + hinterval * a,2, winterval+20)
      boxes.push(box)
      boxes[idno].id = idno
      idno++
    }
  }
}

function CollisionDetection () {
  // event system
  Events.on(engine, 'collisionStart', function (event) {
    var pairs = event.pairs
    // change object colours to show those starting a collision
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i]
      var colorA=pair.bodyA.GetParent().collisioncolor;
      var colorB = pair.bodyB.GetParent().collisioncolor;
      if(colorA != {r:0, g:0, b:0}){
        pair.bodyB.GetParent().collisioncolor = colorA;
      }
      if(colorB != {r:0, g:0, b:0}){
        pair.bodyA.GetParent().collisioncolor = colorB;
      }
      if (pair.bodyA.GetParent != null) {
        pair.bodyA.GetParent().OnCollision()
        }
      if (pair.bodyB.GetParent != null) {
        pair.bodyB.GetParent().OnCollision()
      }    
    }
  })
  Events.on(engine, 'collisionEnd', function (event) {
    var pairs = event.pairs

    // change object colours to show those ending a collision
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i]
      
        pair.bodyA.GetParent().ExitCollision()
        pair.bodyB.GetParent().ExitCollision()
      
    }
  })
}

function draw () {
  background(255)

  Engine.update(engine)
  for (var i = 0; i < boxes.length; i++) {
    boxes[i].show()
    boxes[i].revert()
  }

  if (mouseIsPressed) {
    drawline()
  }
  // if (mouseconstraint.body) {
  //   var pos = mouseconstraint.body.position
  //   var offset = mouseconstraint.constraint.pointB

  //   push()
  //   line(pos.x + offset.x, pos.y + offset.y, mouseX, mouseY)
  //   pop()
  //   //send pull action to server and then broadcast
  //   mouseconstraint.body.GetParent().pull(offset)
  // }
}

function drawline () {
  if (mouseconstraint.body) {
    var pos = mouseconstraint.body.position
    var offset = mouseconstraint.constraint.pointB
    push()
    line(pos.x + offset.x, pos.y + offset.y, mouseX, mouseY)
    pop()
    // send pull action to server and then broadcast
  }
}

function mouseReleased () {
  if (mouseconstraint.body) {
    var pos = mouseconstraint.body.position
    var offset = mouseconstraint.constraint.pointB
    // pass data into the function that package the pull action
    mouseconstraint.body
      .GetParent()
      .pull(mouseconstraint.body.GetParent().id, offset, {
        x: mouseX-pos.x-offset.x,
        y: mouseY-pos.y-offset.y
      },myColor)
  }
}

function Box (x, y, w, h) {
  // color of the box, assign each connection a color
  // swicth shape under certain condition

  var options = {
    restitution: 1,
    angle: myAngle,
    strength: 1
  }

  var id
  var parent = this
  var originalcolor = {r:0, g:0, b:0};
  this.collisioncolor = {r:0, g:0, b:0};
 
  //current color
  this.color = { r: 0, g: 0, b: 0 }
  
  this.isreverting = true;
  this.x = x
  this.y = y
  this.w = w
  this.h = h
  this.collisionCount = 0
  this.body = Bodies.rectangle(this.x, this.y, this.w, this.h, options)

  // get parent oject
  this.body.GetParent = function () {
    return parent
  }

  this.OnCollision = function () {
    
    this.isreverting = false
    this.color = this.collisioncolor
    bell.play(0,random(0,3))
    this.collisionCount++
    //console.log(this.collisioncolor);
  }

  this.ExitCollision = function () {
    //revert color after collision
    this.color = originalcolor;
    setTimeout(()=>{this.isreverting = true},1000)
    
  }

  // add constraint to the bar
  this.constraint = Constraint.create({
    pointA: { x: this.x, y: this.y },
    bodyB: this.body,
    length: 0,
    stiffness: 0.2,
    damping: 1
  })

  World.add(world, [this.body, this.constraint])

  // render the bar
  this.show = function () {
    var pos = this.body.position
    var angle = this.body.angle
    push()
    noStroke()
    fill(this.color.r, this.color.g, this.color.b)
    rectMode(CENTER)
    translate(pos.x, pos.y)
    rotate(angle)
    rect(0, 0, this.w, this.h)
    pop()
  }

  this.getId = function () {
    return id
  }

  // return the bar back to its origin position
  this.revert = function () {
    var diff = this.body.angle%2-myAngle

  if(this.isreverting==true & Math.abs(diff) > 0.03){

    if (diff>0) {
      var angle = this.body.angle;
      Body.setAngle(this.body,this.body.angle-0.01)
      //Body.setAngularVelocity(this.body,0)
      }
    if (diff<0) {
        var angle = this.body.angle;
        Body.setAngle(this.body, this.body.angle+0.01)
        Body.setAngularVelocity(this.body,0)
        
      }
    
    }
    
  }
  // send pull action as a package to server (which bar is moved, what color is it, how big is the force)
  this.pull = function (id, offset, force,color) {
    this.pos = offset

    ellipse(
      this.body.position.x + this.pos.x,
      this.body.position.y + this.pos.y,
      5,
      5
    )
    // this is the data you packaged and send to the server
    this.data = { id: id, offset: offset, force: force, color:color }
    socket.emit('sendpull', this.data)
  }

  this.applyforce = function (id, offsetposition, force) {
    this.isreverting = false;
    Body.applyForce(
      this.body,
      {
        x: this.body.position.x + offsetposition.x,
        y: this.body.position.y + offsetposition.y
      },
      { x: force.x * forceIndex, y: force.y * forceIndex }
    )
    setTimeout(()=>{
      this.isreverting = true
      },1000)
  }
  

  this.switchcolor = function(color){
    this.collisioncolor = color
  }

  this.startrevert = function(){
    this.isreverting = true;
  }
  this.stoprevert = function (){
    this.isreverting = false
  }
}

// get color from server upon connection
function assignColor (data) {
  myColor = data
}
