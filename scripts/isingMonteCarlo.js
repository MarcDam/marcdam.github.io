// Get the canvas element to draw on
var canvas = document.getElementById("mainCanvas");
var ctx = canvas.getContext("2d");

var scale = 5; // scale hould divide width and height of canvas
document.getElementById("scaleSlider").value = scale;

// Field dimensions
var xMax = canvas.width / scale;
var yMax = canvas.height / scale;
var nCells = xMax*yMax;

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

// Function to calculate the remainder of n when divided by m
function mod(n, m) {
    return ((n % m) + m) % m
}

// Generate random initial conditions
function resetCanvas() {
  var initCon = new Array(xMax);

  for (i = 0; i < xMax; i++) {
    initCon[i] = new Array(yMax);
    
    for (j = 0; j < yMax; j++) {
      initCon[i][j] = 1 - 2*getRandomInt(0, 1);
    }
  }
  
  return initCon;
}

field = resetCanvas();

var cmap = {};

cmap[1] = "#000000";
cmap[-1] = "#FFFFFF";

// Redraws the entire canvas with the current field
function drawField() {
  for (i = 0; i < xMax; i++) {
    for (j = 0; j < yMax; j++) {
      drawPoint(i, j, cmap[field[i][j]]);
    }
  }
}

drawField();

// Button to reset canvas
document.getElementById("canvasResetButton").onclick = function() {
  // Generate and draw the new field
  field = resetCanvas();
  drawField();
}

// "Game loop"
ups = 50 // "updates" per second
T = 1;
document.getElementById("temperatureSlider").value = T;
document.getElementById("temperatureText").innerHTML = T;

function run() { //
  // Repeat twice for each step on the speed slider
  for (s = 0; s < speed; s++) {
    // Pick a random point
    x = getRandomInt(0, xMax - 1);
    y = getRandomInt(0, yMax - 1);
    
    // Calculate the energy difference (periodic boundary conditions)
    deltaU = 2*field[x][y]*(field[mod(x + 1, xMax)][y] + field[mod(x - 1, xMax)][y] + field[x][mod(y + 1, yMax)] + field[x][mod(y - 1, yMax)]);
    
    if (deltaU <= 0) {
        field[x][y] *= -1;
        drawPoint(x, y, cmap[field[x][y]]);
    } else if (Math.random() < Math.exp(-deltaU/T)) {
        field[x][y] *= -1;
        drawPoint(x, y, cmap[field[x][y]]);
    }
  }
}
// Start the simulation
intervalId = setInterval(run, 1000/ups);
simulationRunning = true;

// Stop button
document.getElementById("stopButton").onclick = function() {
  clearInterval(intervalId);
  simulationRunning = false;
}

// Start button
document.getElementById("startButton").onclick = function() {
  intervalId = setInterval(run, 1000/ups);
  simulationRunning = true;
}

// Scale slider
document.getElementById("scaleSlider").onchange = function() {
  scale = this.value;
  canvas.width = scale*xMax;
  canvas.height = scale*yMax;
  
  // If the simulation is running while changing the scale we pause it while redrawing
  if (simulationRunning) {
    clearInterval(intervalId);
  }
  
  drawField();
  
  // If the simulation was running before we started redrawing we start it again
  if (simulationRunning) {
    intervalId = setInterval(run, 1000/ups);
  }
}

// Speed slider
speed = 1;
document.getElementById("speedSlider").value = speed;

document.getElementById("speedSlider").onchange = function() {
  speed = this.value;
}

// Temperature slider
document.getElementById("temperatureSlider").onchange = function() {
  T = this.value;
}
document.getElementById("temperatureSlider").oninput = function() {
  document.getElementById("temperatureText").innerHTML = this.value;
}

// Number of cells slider
document.getElementById("cellSlider").value = xMax;
document.getElementById("cellText").innerHTML = xMax*xMax;

document.getElementById("cellSlider").onchange = function() {
  xMax = yMax = parseInt(this.value);
  nCells = xMax*yMax;
  canvas.width = scale*xMax;
  canvas.height = scale*yMax;
  
  // If the simulation is running while changing the canvas size we pause it while redrawing
  if (simulationRunning) {
    clearInterval(intervalId);
  }
  
  // Generate and draw the new field
  field = resetCanvas();
  drawField();
  
  // If the simulation was running before we started redrawing we start it again
  if (simulationRunning) {
    intervalId = setInterval(run, 1000/ups);
  }
}

document.getElementById("cellSlider").oninput = function() {
  document.getElementById("cellText").innerHTML = this.value*this.value;
}
