let scale = 80;
let cameraX;
let cameraY;
let cameraSpeed;
let preMX;
let preMY;

let margin = 0;

let baseHinge

let hinges = [];

let exprX, exprY;

let tMin = 0;
let tMax = 2 * Math.PI;
let step = 0.01;

let tempXML;
let hingeXML;
let newXML;

function preload(){
    tempXML = loadXML("template.bsg");
    hingeXML = loadXML("hinge.xml");
}

function setup(){
  createCanvas(windowWidth, windowHeight);
  updateFunction();
  
  cameraX = width * (0.5);
  cameraY = height * (0.5);
  cameraSpeed = 0.1 * scale;

  baseHinge = new Hinge();
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}

function draw(){

  background(0);
  translate(cameraX,cameraY);

  drawGraph();

  chainHinge();


}

function mousePressed() {
  preMX = mouseX;
  preMY = mouseY;
}

function mouseDragged() {
  let dx = mouseX - preMX;
  let dy = mouseY - preMY;

  cameraX += dx;
  cameraY += dy;

  preMX = mouseX;
  preMY = mouseY;
}

function touchStarted() {
  preMX = mouseX;
  preMY = mouseY;
}

function touchMoved() {
  let dx = mouseX - preMX;
  let dy = mouseY - preMY;

  cameraX += dx;
  cameraY += dy;

  preMX = mouseX;
  preMY = mouseY;

  return false;
}

class Hinge{

  constructor(position, rotation){
    if ( position === undefined ) {
        this.position = createVector(0,0);
    }else{
        this.position = position.copy();
    }

    if ( rotation === undefined ) {
        this.rotstion = 0;        
    }else{
        this.rotation = rotation;
    }
    
    
    this.boxSize = createVector(0.95,0.32);
    this.distanceBoxCenter = 0.18;
    this.headRadius = 0.322;
    this.distanceBase = 1.0;
    this.baseRadius = 0.2575;
  }

  drawHinge(){
    push();
      translate(this.position.x*scale, this.position.y*scale);
      rotate(this.rotation);

      noStroke();

      fill(84,172,219,144);
      rectMode(CENTER);
      rect(0,
           this.distanceBoxCenter*scale,
           this.boxSize.x*scale,
           this.boxSize.y*scale);

      fill(238,120,0,144);
      circle(0,0,this.headRadius*2*scale);

      fill(200,50,50,144);
      circle(0,
             this.distanceBase*scale,
             this.baseRadius*2*scale);
    pop();
  }

  setBeside(anotherHinge, ang){

    let angle = constrain(-ang/2, -PI/2, PI/2);

    let nX = 0;
    let nY = 0;

    let c = this.distanceBoxCenter;
    let r = this.headRadius;
    let sX = this.boxSize.x;
    let sY = this.boxSize.y;

    if(angle > 0 && (r - c + sY/2)/tan(angle) <= sX/2){
      nX = (r - c + sY/2)/sin(angle);

    }else if(c - sY/2 <= -(r + sX/2)*tan(angle) &&
             -(r + sX/2)*tan(angle) <= c + sY/2){

      nX = (r + sX/2)/cos(angle);

    }else if(angle < 0 && -(r + c + sY/2)/tan(angle) <= sX/2){

      nX = -(r + c + sY/2)/sin(angle);

    }else if(angle >= -atan(c/(r + sX/2))){

      nX = sqrt(r*r - pow(((sY/2 - c)*cos(angle) - (sX/2)*sin(angle)), 2))
           + (sX/2)*cos(angle)
           + (sY/2 - c)*sin(angle);

    }else{

      nX = sqrt(r*r - pow(((sX/2)*sin(angle) + (c + sY/2)*cos(angle)), 2))
           - (c + sY/2)*sin(angle)
           + (sX/2)*cos(angle);
    }



    this.position.x = nX + margin;
    this.position.y = nY;

    let rotated = rotateVec(this.position, -angle + anotherHinge.rotation);
    this.position = p5.Vector.add(rotated, anotherHinge.position);

    this.rotation = -2*angle + anotherHinge.rotation;
    if(angle >= -atan((sY+2*c)/sX)){
        this.rotation -= 0.02;
    }else{
        this.rotation += 0.02;
    }
  }

    getBasePos(){
        return p5.Vector.add(
            this.position,
            rotateVec(createVector(0,this.distanceBase), this.rotation)
        );
    }

    getLeftPos(){
        return p5.Vector.add(this.position,rotateVec(createVector(
            -this.boxSize.x/2,this.distanceBoxCenter-this.boxSize.y/2
        ), this.rotation));
    }

    getRightPos(){
        return p5.Vector.add(this.position,rotateVec(createVector(
            this.boxSize.x/2,this.distanceBoxCenter-this.boxSize.y/2
        ), this.rotation));
    }

    setLeftPos(p){
        this.position = p5.Vector.sub(p,rotateVec(createVector(
            -this.boxSize.x/2,this.distanceBoxCenter-this.boxSize.y/2
        ), this.rotation));
    }

    setRightPos(p){
        this.position = p5.Vector.sub(p,rotateVec(createVector(
            this.boxSize.x/2,this.distanceBoxCenter-this.boxSize.y/2
        ), this.rotation));
    }
}

function rotateVec(v, theta){
  return createVector(
    v.x*cos(theta) - v.y*sin(theta),
    v.x*sin(theta) + v.y*cos(theta)
  );
}


function updateFunction() {
  let fx = document.getElementById("inputX").value;
  let fy = document.getElementById("inputY").value;

  try {
    exprX = math.compile(fx);
    exprY = math.compile(fy);
  } catch (e) {
    alert("式にエラーがあります");
  }
  try {
    tMin = math.evaluate(document.getElementById("inputTMin").value);
    tMax = math.evaluate(document.getElementById("inputTMax").value);
    num = math.evaluate(document.getElementById("inputNum").value);
  } catch (e) {
    alert("tの範囲、個数にエラーがあります");
  }
}

function drawGraph(){
  stroke(255);
  strokeWeight(2);
  noFill();
  beginShape();
  for (let c = tMin; c <= tMax; c += step) {
    try {
      let x = xx(c);
      let y = yy(c);

      x *= scale;
      y *= -scale;

      if (isFinite(x) && isFinite(y)) {
        vertex(x, y);
      }
    } catch (e) {
      // 無視
    }
  }
  endShape();
}

function searchNextPoint(a){
    let l = 0.95;
    let aX = xx(a);
    let aY = yy(a);
    let b;
    let bX;
    let bY;
    for(let n = 1; n < 100; n ++){
        b=a+n*l;
        bX = xx(b);
        bY = yy(b);
        if((aX-bX)**2 + (aY-bY)**2 > l**2){
            break;
        }
    }
    let min = b - l;
    let max = b;
    let alpha;
    let beta;
    for(let m = 0; m < 100; m ++){

        // stroke(255,0,0);
        // strokeWeight(5);
        // point(scale*xx(max),-scale*yy(max));
        // stroke(0,255,0);
        // point(scale*xx(min),-scale*yy(min));

        alpha = (max-min)*0.25+min;
        beta = (max-min)*0.75+min;
        let alX = xx(alpha);
        let alY = yy(alpha);
        let beX = xx(beta);
        let beY = yy(beta);
        if(abs((alX - aX)**2 + (alY - aY)**2 - l**2)**0.5 < 0.01){
            break;
        }
        if(Math.abs((alX - aX)**2 + (alY - aY)**2 - l**2) 
            <= Math.abs((beX - aX)**2 + (beY - aY)**2 - l**2)){
            max = (max-min)*0.5+min;
        }else{
            min = (max-min)*0.5+min;
        }
    }

  return alpha;
}

function searchClosestPoint(p,t){
    let d = Number.MAX_SAFE_INTEGER;
    let t2 = searchNextPoint(t);

    let min = 2*t-t2;
    let max = t2;

    // stroke(255,0,0);
    // strokeWeight(5);
    // point(scale*xx(max),-scale*yy(max));
    // stroke(0,255,0);
    // point(scale*xx(min),-scale*yy(min));

    let alpha;
    let beta;
    for(let m = 0; m < 100; m ++){

        alpha = (max-min)*0.25+min;
        beta = (max-min)*0.75+min;
        let alX = xx(alpha);
        let alY = yy(alpha);
        let beX = xx(beta);
        let beY = yy(beta);
        if(Math.abs((p.x-alX)**2 + (p.y+alY)**2 -d) < 0.001){
            break;
        }
        if((p.x-alX)**2 + (p.y+alY)**2
            <= (p.x-beX)**2 + (p.y+beY)**2){
            max = (max-min)*0.5+min;
        }else{
            min = (max-min)*0.5+min;
        }
        d = (p.x-alX)**2 + (p.y+alY)**2;
    }

    // stroke(0,255,0);
    // strokeWeight(5);
    // line(scale*xx(alpha),-scale*yy(alpha),scale*p.x,scale*p.y);

    return alpha;
}

function chainHinge(){
    let nt = searchNextPoint(tMin);

    baseHinge.rotation = Math.atan2(yy(tMin)-yy(nt),xx(nt)-xx(tMin));

    baseHinge.setLeftPos(
        createVector(xx(tMin),-yy(tMin))
    );


    baseHinge.drawHinge();

    for(let n = 0; n < num; n ++){
        hinges.push(new Hinge(createVector(n,0),0));

        let preHinge;
        if(n == 0){
            preHinge = baseHinge;
        }else{
            preHinge = hinges[n-1];
        }

        nt = searchNextPoint(nt);

        let angle =
        wrapAngle(Math.atan2(-yy(nt) - preHinge.getRightPos().y,
                    xx(nt) - preHinge.getRightPos().x)
        -preHinge.rotation);

        hinges[n].setBeside(preHinge,angle);

        for(let m = 0; m < 3; m++){

            let angle =
            wrapAngle(Math.atan2(-yy(nt) - hinges[n].getLeftPos().y,
                        xx(nt) - hinges[n].getLeftPos().x)
            -preHinge.rotation);

            hinges[n].setBeside(preHinge,angle);

            nt = searchClosestPoint(hinges[n].getRightPos(),nt);

        }

        // stroke(255,0,0);
        // line(scale*preHinge.getRightPos().x,scale*preHinge.getRightPos().y,scale*xx(nt),-scale*yy(nt));

        hinges[n].drawHinge();
    }

}

function wrapAngle(theta) {
  return ((theta + Math.PI) % (2 * Math.PI) + (2 * Math.PI)) % (2 * Math.PI) - Math.PI;
}

function xx(c){
    return exprX.evaluate({ t: c });
}
function yy(c){
    return exprY.evaluate({ t: c });
}

function makeData(){
    newXML = new p5.XML(tempXML.DOM.cloneNode(true));
    let blockXML = newXML.getChild("Blocks");
    let hingeObject;
    for(let n = -1; n < num; n ++){

        if(n == -1){
            hingeObject = baseHinge;
        }else{
            hingeObject = hinges[n];
        }
        
        let hingeBlock = new p5.XML(hingeXML.DOM.cloneNode(true));
        hingeBlock.setAttribute("guid", crypto.randomUUID());
        let hingeTrans = hingeBlock.getChild("Transform");
        hingeTrans.getChild("Position").setAttribute("x", hingeObject.getBasePos().x);
        hingeTrans.getChild("Position").setAttribute("y", -hingeObject.getBasePos().y);
        hingeTrans.getChild("Position").setAttribute("z", 0);

        let hingeRot = hingeTrans.getChild("Rotation");
        let theta = hingeObject.rotation;
        hingeRot.setAttribute("x", -cos(theta/2)/2**0.5);
        hingeRot.setAttribute("y", sin(theta/2)/2**0.5);
        hingeRot.setAttribute("z", -sin(theta/2)/2**0.5);
        hingeRot.setAttribute("w", cos(theta/2)/2**0.5);

        blockXML.addChild(hingeBlock);
    }
}

function saveXML() {

    makeData();

    let xmlText = '<?xml version="1.0" encoding="utf-8"?>' + newXML.serialize();

    const blob = new Blob([xmlText], { type: "application/octet-stream" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "hingeArmor.bsg";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}