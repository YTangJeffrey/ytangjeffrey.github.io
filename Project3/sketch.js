// webgazer start

// caligration

var iscalibrated = false
var canvas
var adslist = []
var gazepoint = { x: 0, y: 0, width: 10 }
var money = 0
var calibratorlist = []
var showprediction = false

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
  webgazer.params.showGazeDot = true;
  showprediction = true;
  $('.calibrationpage').toggle();
  $('.landingpage').toggle();
})

$('#stopwork').click(function () {
  webgazer.params.showGazeDot = false
  webgazer.pause();
})

function setup () {
  canvas = createCanvas(windowWidth, windowHeight)
  background(255);
  canvas.position(0, 0);
  canvas.style('z-index', '0')
  rectMode(CENTER)
}

// generate dots for tracking calibration
function calibration () {
  for (let i = 0; i < 4; i++) {
    for (let a = 0; a < 4; a++) {
      push();
      fill(255);
      rect((width / 3) * i, (height / 3) * a, 20, 20)
      pop();
    }
  }

  if (calibratorlist.length == 0) {
    iscalibrated = false;
  }
}

function draw () {

  //show the prediction cube
  if (showprediction == true) {
    gazepoint.x = gazingX
    gazepoint.y = gazingY
    background(255)
    calibration()
    push()
    translate(gazepoint.x, gazepoint.y)
    rect(0, 0, gazepoint.width, gazepoint.width)
    pop()
  }

  if (iscalibrated == true) {
    push()
    textSize(100)
    fill(255)
    text('$' + money, width / 2, height / 2)
    pop()

    // ads generation
    if (adslist.length < 20) {
      if (frameCount % 30 == 0) {
        let newads = new ads(random(0, width), random(0, height), 100, 100)
        adslist.push(newads)
      }
    }
    // ads rendering
    for (let i = 0; i < adslist.length; i++) {
      adslist[i].detection(gazepoint)
    }

    for (let i = 0; i < adslist.length; i++) {
      adslist[i].render()
    }
  }
}

class ads {
  constructor (posx, posy, width, height) {
    this.posx = posx
    this.posy = posy
    this.width = width
    this.height = height
  }

  render () {
    push()
    fill(200)
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
      console.log('detected')
      this.destroy()
    }
    // get gold if detected
  }

  destroy () {
    adslist.splice(adslist.indexOf(this), 1)
    money++
  }
}

class Coin {
  constructor () {
    this.speed
  }
}

class Calibrator {
  constructor () {}

  destroy () {}
}
