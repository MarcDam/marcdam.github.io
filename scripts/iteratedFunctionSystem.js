// Get the canvas element to draw on
var canvas = document.getElementById("mainCanvas");
var ctx = canvas.getContext("2d");

var scale = 2; // scale hould divide width and height of canvas
document.getElementById("scaleSlider").value = scale;

// Field dimensions
var xMax = canvas.width/scale;
var yMax = canvas.height/scale;

// Function to draw points on the canvas
function drawPoint (x, y, color) {
  ctx.beginPath();
  ctx.rect(scale*x, scale*y, scale, scale);
  ctx.fillStyle = color;
  ctx.fill();
}

// Function to generate random integers between max and min inclusive (from MDN)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Button to reset canvas
document.getElementById("canvasResetButton").onclick = function() {
  if (IFSRunning) {
    IFSRunning = false;
    clearInterval(intervalId);
  }
  points = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updates = 0;
}

// "Game loop"
var ups = 50 // "updates" per second
var updates = 0;

function run() {
  for (s = 0; s < speed; s++) {
    updates++;
    
    // Pick a point at random from our list of points
    point = points[getRandomInt(0, points.length - 2)];
    
    // Recolor the old currentPoint
    drawPoint(currentPoint[0], currentPoint[1], "#00F");
    
    // Calculate the new point by taking the average
    currentPoint = [(currentPoint[0] + point[0])/2, (currentPoint[1] + point[1])/2];
    
    // Draw the new point
    drawPoint(currentPoint[0], currentPoint[1], "#0F0");
  }
}

// Set the variables that keep track of wether the IFS is running
var intervalId;
var IFSRunning = false;
var currentPoint;

var points = [];

// The function which handles clicking on the canvas
canvas.onclick = function(event) {
  if (!IFSRunning) { // Only draw points if the IFS is not running
    // Fill in the old "new" point
    if (points.length > 0) {
      drawPoint(points[points.length -1][0], points[points.length -1][1], "#000");
    }
    
    //  Get the position of the point just clicked on
    rect = this.getBoundingClientRect();
    x = (event.x - rect.left)/scale;
    y = (event.y - rect.top)/scale;
    drawPoint(x, y, "#F00"); // Draw it in red to indicate it is new
    points.push([x, y]);
    currentPoint = points[points.length-1];
  }
}

// Stop button
document.getElementById("stopButton").onclick = function() {
  clearInterval(intervalId);
  IFSRunning = false;
  document.getElementById("scaleSlider").disabled = false;
}

// Start button
document.getElementById("startButton").onclick = function() {
  intervalId = setInterval(run, 1000/ups);
  IFSRunning = true;
  document.getElementById("scaleSlider").disabled = true;
}

// Speed slider
speed = 1;
document.getElementById("speedSlider").value = speed;

document.getElementById("speedSlider").onchange = function() {
  speed = this.value;
}

// Scale slider
document.getElementById("scaleSlider").onchange = function() {
  scale = this.value;
  canvas.width = scale*xMax;
  canvas.height = scale*yMax;
  
  // Redraw the points used by the IFS
  for (i = 0; i < points.length -1; i++) {
    drawPoint(points[i][0], points[i][1], "#000");
  }
  if (points.length > 0) {
    drawPoint(points[points.length -1][0], points[points.length -1][1], "#F00"); // Draw the latest point in red
  }
}
