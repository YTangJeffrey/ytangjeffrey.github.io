let realtimesealevel=0;

let canvas
let birdlist = []
let audioinput
let bgm
let bgimg
let bgimgratio

let amplitude
let bgmamplitude
let bgmamplitudescaler = 150;

let mic;
let recorder;
let micvolume // volume of the microphone

let bird1
let bird2
let birdanistate;
let birddie;

let soundfile
let blocksize = 12
let blocklist = []
let score = 0;
let scorefont;
let base = 4 // minimum sealevel, related to score

let recordisplay = false;
let iswin =false;

// preload background, bird assets, blockassets, music
function preload () {
  bgm = loadSound('assets/ngm.mp3');
  scorefont = loadFont("assets/Minecraft.ttf");
  birddie = loadSound("assets/birdshot.wav");
  bird1 = loadImage('assets/bird1.png');
  bird2 = loadImage('assets/bird2.png');
  bgimg = loadImage('assets/city');
  
}

function setup () {
  frameRate(15);
  canvas = createCanvas(windowWidth, windowHeight)
  canvas.position(0, 0)
  canvas.style('z-index', '-1')
  amplitude = new p5.Amplitude()
  mic = new p5.AudioIn();
  mic.start();
  bgm.play();

  recorder = new p5.SoundRecorder();
  recorder.setInput(mic);
  soundFile = new p5.SoundFile();
  recorder.record(soundFile);
  bgimgratio = bgimg.height / bgimg.width
}

function draw () {
  // setup bg img
  if(base*blocksize < height&!iswin){
  background(255)
  image(bgimg, 0, 0, width, width * bgimgratio);
  

  realtimsealevel = realtimesealevel/(blocklist.length);
  
    // print score on the board
  push();
  textFont(scorefont);
  fill(0,255);
  textSize(50);
  text("Sea Level: "+nf((97+realtimesealevel), 3, 3)+ "mm", 200, 200)
  pop();

  realtimesealevel= 0;
  // get amplitude from bgm to create wave
  amplitude.setInput(bgm)
  bgmamplitude = amplitude.getLevel()

  // get input volume from microphone to amply wave
  micvolume = mic.getLevel()
  let volumeamplify = map(micvolume, 0, 1, 1.2,2.5);

  // generate bird every 5s
  if (frameCount % 55-score*1 == 0) {
    let newsize = floor(random(2,5))*20;
    let newspeed = floor(random(1.5,6));
    let newbird = new Bird(0, random(0, height-(base+4)*blocksize), newsize, newsize,newspeed);
    birdlist.push(newbird)
  }
  // draw bird everyframe
  for (i = 0; i < birdlist.length; i++) {
    let thisbird = birdlist[i]
    thisbird.draw()
    thisbird.move()
  }
  //autoincrease
  if(frameCount%150 == 0){
    score++;
    base+=1;
  }

  // drawblock: based on the music rythem, amplified by your voice input
  // size of the block precided by the block size.

  // record x and y of the radio wave line, and push to array
  // turn x,y information in visual block based on the visual input
  // collision detection of these blocks and the birds
  // if those dots go beyond screen, remove them from the array

  // take node from the rightside of the screen
  if (frameCount % 10 == 0) {
    let newnode = new Node(width, bgmamplitude * bgmamplitudescaler)
    blocklist.push(newnode)
    for (let i = 0; i < blocklist.length; i++) {
      blocklist[i].move()
    }
  }

  for (let i = 0; i < blocklist.length; i++) {
    blocklist[i].drawcube(volumeamplify, base)
    if(blocklist[i].px<-2){
      blocklist[i].die()  ;
    }

   

  }}
   else{
    iswin = true;
    bgm.stop();
    background(0);
    push();
    textFont(scorefont);
    fill(255);
    textSize(30);
    text("When the fisherman catches no salmon nor bream,", 200, 200,);
    text("and there is no more coffee, nor chocolate ice cream,,", 200, 250,);
    text("be vocal, but avoid high pitched tones and screams.", 200, 300,);
    text("Remind yourself that it is not a dream.", 200, 350,);
    textSize(18);
    text("By Scarlet McCall", 300, 500);
    text("https://hellopoetry.com/scarlet-mccall/", 300, 530);
    pop();

//play recorded audio
    recorder.stop();
    soundFile.play();


  
   } 


}

function windowResized () {
  resizeCanvas(windowWidth, windowHeight)
}

class Node {
  constructor (xposition, yheight) {
    this.px = xposition
    this.yh = yheight
  }

  drawcube (volume, base) {
    
  

    let blockcount = base + floor(this.yh * volume);
    realtimesealevel += map(blockcount*blocksize,0,height,0,1)
    for (let a = 0; a < blockcount; a++) {
      push();
      blendMode(MULTIPLY);
      fill(0, 0, 255);
      noStroke();
      rect(this.px, height - a * blocksize, blocksize, blocksize);
      pop(); };
    push();
    fill(255, 255, 255, 155)
    noStroke();
    rect(this.px, height - blockcount * blocksize, blocksize, blocksize);
    pop();

    //collisiondetection
    for(i=0;i<birdlist.length;i++){
      let thisbird = birdlist[i];
      if( thisbird.px+thisbird.w>this.px&
          thisbird.px<this.px+blocksize&
          thisbird.py+thisbird.h>height-blocksize*blockcount

      ){
       
        birdlist[i].die();
        
      }
    }

  }
  move () {
    this.px -= blocksize;
  }
  die(){
    blocklist.splice(blocklist.indexOf(this),1);
    
  }
}

class Bird {
  constructor (px, py, w, h,s) {
    this.animationstate = 1;
    this.px = px;
    this.py = py;
    this.w = w;
    this.h = h;
    this.s = s;
  }
  move () {
    this.px += this.s;
    this.py += this.s*sin(frameCount * 0.1)
  }
  draw () {
    if (this.animationstate == 1) {
      image(bird1, this.px, this.py, this.w, this.h)
    } else {
      image(bird2, this.px, this.py, this.w, this.h)
    }

    if ((this.animationstate == 1) & (frameCount % 20 == 0)) {
      this.animationstate = 2
    } else if ((this.animationstate == 2) & (frameCount % 20 == 0)) {
      this.animationstate = 1
    }
  }

  die(){
    score++;
    birdlist.splice(birdlist.indexOf(this),1);
    base+=2;
    birddie.play();

  }
}
