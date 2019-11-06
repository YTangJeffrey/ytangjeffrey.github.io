// webgazer start

// caligration

var iscalibrated = false
var canvas
var adslist = []
var coinlist=[];
var gazepoint = { x: 0, y: 0, width: 10 }
var money = 0
var showprediction = false
var timer = 30

webgazer.setTracker('clmtrackr')
webgazer
  .setGazeListener(function (data, elapsedTime) {
    if (data == null) {
      return
    }
    var xprediction = data.x // these x coordinates are relative to the viewport
    var yprediction = data.y // these y coordinates are relative to the viewport
  })
  .begin()
// webgazer.params.showGazeDot = true;

$('#startwork').click(function () {
  webgazer.params.showGazeDot = true
  showprediction = true
  $('.calibrationpage').toggle()
  $('.landingpage').toggle()
  $('#about').toggle()
})

$('#stopwork').click(function () {
  webgazer.params.showGazeDot = false
  webgazer.pause()
})

$('#download').click(function () {
  saveCanvas(canvas, 'myReceipt', 'png')
})

$('#about').click(function () {
  window.location = 'about.html'
})

let keysound
let coinsound
let happytimes
let VTF

function preload () {
  keysound = loadSound('assets/key.wav')
  coinsound = loadSound('assets/coinsound.wav')
  happytimes = loadFont('assets/happy-times-NG_bold_master.otf')
  VTF = loadFont('assets/VTF_Mixo.otf')
}

let cursorsize = 20

function setup () {
  canvas = createCanvas(windowWidth, windowHeight)
  background(255)
  frameRate(30)
  canvas.position(0, 0)
  canvas.style('z-index', '0')
  rectMode(CENTER)
}

let isinitialized = false
var calibratorlist = []
var calibratorClicked = 0
// generate dots for tracking calibration
function calibration () {
  if (isinitialized == false) {
    for (let i = 0; i < 4; i++) {
      for (let a = 0; a < 4; a++) {
        let newcalibrator = new Calibrator(
          (width / 3) * i,
          (height / 3) * a,
          20,
          20
        )
        calibratorlist.push(newcalibrator)
      }
    }
    isinitialized = true
  } else {
    for (let i = 0; i < calibratorlist.length; i++) {
      calibratorlist[i].render()
    }

    if (calibratorClicked == 16) {
      iscalibrated = true
      $('#calibrationdescription').hide()
      
      
    }
  }
}
// verify clibration
function mouseClicked () {
  if (iscalibrated == false) {
    for (let i = 0; i < calibratorlist.length; i++) {
      calibratorlist[i].detection(mouseX, mouseY)
    }
  }
}

function draw () {
  // show the prediction cube
  if (showprediction == true) {
    gazepoint.x = gazingX
    gazepoint.y = gazingY
    background(255)
    // show gaze point
    push()
    translate(gazepoint.x, gazepoint.y)
    textFont(VTF)
    textSize(cursorsize)
    text('o', 0, 0)
    textAlign(CENTER, CENTER)
    // rect(0, 0, gazepoint.width, gazepoint.width)
    pop()
    if (iscalibrated == false) {
      calibration()
    }
  }
  if (iscalibrated == true) {
    // hidemousewhileplaying
    $('body').css('cursor', 'none')

    // show score and countdown

    if (frameCount % 30 == 0 && timer > 0) {
      timer--
    }

    // ads generation
    if ((adslist.length < 20) & (timer > 0)) {
      if (frameCount % 30 == 0) {
        noStroke()
        let newads = new ads(
          random(0, width),
          random(0, height),
          random(100, 300),
          random(100, 300)
        )
        adslist.push(newads)
      }
    }
    // ads rendering
    if (timer > 0) {
      for (let i = 0; i < adslist.length; i++) {
        adslist[i].detection(gazepoint)
      }
    }
    for (let i = 0; i < adslist.length; i++) {
      adslist[i].render()
    }
    for (let i = 0; i < coinlist.length; i++) {
      coinlist[i].render()

    }
    if (timer > 0) {
      push()
      textFont(happytimes)
      textAlign(CENTER, CENTER)
      textSize(120)
      fill(240, 180)
      text(timer, width / 2, height / 2)
      pop()
    }
  }
  if ((iscalibrated == true) & (timer == 0)) {
    $('body').css('cursor', 'default')
    resultpage()
  }
}
function resultpage () {
  $('#earningamount').text(money)
  $('#resultpage').show()
  $('#about').show()
}

class ads {
  constructor (posx, posy, width, height) {
    this.posx = posx
    this.posy = posy
    this.width = width
    this.height = height
    this.health = 30
  }

  render () {
    push()
    fill(100,200)
    rect(this.posx, this.posy, this.width, this.height)
    pop()
  }

  detection (gazepoint) {
    if (
      (gazepoint.x + gazepoint.width / 2 > this.posx - this.width / 2) &
      (gazepoint.x - gazepoint.width / 2 < this.posx + this.width / 2) &
      (gazepoint.y + gazepoint.width / 2 > this.posy - this.height / 2) &
      (gazepoint.y - gazepoint.width / 2 < this.posy + this.height / 2)
    ) {
      
      this.health--
      this.width -= 2
      this.height -= 2
      money++
      //generate new coin icon upon collision
      let newcoin = new Coin(gazepoint.x,gazepoint.y);
      coinlist.push(newcoin);
      coinsound.play()
      if (this.health == 0) {
        this.destroy()
      }
    }
    // get gold if detected
  }

  destroy () {
    adslist.splice(adslist.indexOf(this), 1)
    money++
  }
}

class Coin {
  constructor (posx, posy) {
    this.posx = posx
    this.posy = posy
  }
  render () {
    push()
    textFont(happytimes)
    textAlign(CENTER, CENTER)
    textSize(25)
    fill(0)
    text('$', this.posx, this.posy)
    pop()
  }
}

// calibration square object, there are 9 calibration objects
// when mouse click, it turns red
class Calibrator {
  constructor (posx, posy, width, height) {
    this.posx = posx
    this.posy = posy
    this.width = width
    this.height = height
    this.condition = false
    this.isadded = false
  }

  render () {
    push()
    noStroke()

    if (!this.condition) {
      fill(0)
    } else {
      fill(200)
    }
    textSize(45)
    textAlign(CENTER, CENTER)
    textFont(VTF)
    text('o', this.posx, this.posy)
    pop()
  }

  detection (mouseX, mouseY) {
    if (
      (mouseX > this.posx - this.width / 2) &
      (mouseX < this.posx + this.width / 2) &
      (mouseY > this.posy - this.height / 2) &
      (mouseY < this.posy + this.height / 2)
    ) {
      // turn it red
      this.condition = true
      if (!this.isadded) {
        calibratorClicked++
        cursorsize += 3
        keysound.play()
        this.isadded = true
      }
    }
  }
}
