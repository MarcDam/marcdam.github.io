// Get the canvas element to draw on
var canvas = document.getElementById("mainCanvas");
var ctx = canvas.getContext("2d");

var scale = 5; // scale hould divide width and height of canvas
document.getElementById("scaleSlider").value = scale;

// Field dimensions
var xMax = canvas.width / scale;
var yMax = canvas.height / scale;
var nCells = xMax*yMax;

// Number of particles in system
var Npercent = 0.5;
document.getElementById("particleSlider").value = Npercent;
document.getElementById("particleText").innerHTML = Npercent;

var N = Math.floor(Npercent*nCells);

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
      initCon[i][j] = 0;
    }
  }
  
  var n = 0;
  
  while (n < N) {
    x1 = getRandomInt(0, xMax-1);
    y1 = getRandomInt(0, yMax-1);
    
    if (initCon[x1][y1] != 1) {
        initCon[x1][y1] = 1;
        n++;
    }
  }
  
  return initCon;
}

field = resetCanvas();

var cmap = {};

cmap[0] = "#000000";
cmap[1] = "#FFFFFF";

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

function localEnergy(x, y) {
    return -field[x][y]*(field[mod(x-1, xMax)][y] + field[mod(x+1, xMax)][y] + field[x][mod(y-1, yMax)] + field[x][mod(y+1, yMax)]);
}

function run() { //
  // Repeat once for each step on the speed slider
  for (s = 0; s < speed; s++) {
    // Pick a random point
    x1 = getRandomInt(0, xMax - 1);
    y1 = getRandomInt(0, yMax - 1);
    
    do {
        x2 = getRandomInt(0, xMax - 1);
        y2 = getRandomInt(0, yMax - 1);
    } while (field[x1][y1] == field[x2][y2]);
    
    // Calculate old energy
    Uold = localEnergy(x1, y1) + localEnergy(x2, y2);
    
    // Swap particles
    old1 = field[x1][y1];
    field[x1][y1] = field[x2][y2];
    field[x2][y2] = old1;
    
    // Calculate the trial energy
    Utrial = localEnergy(x1, y1) + localEnergy(x2, y2);
    
    // Calculate the energy difference
    deltaU = Utrial - Uold;
    
    if (deltaU <= 0) { // We keep the trial state if it has lower energy...
        drawPoint(x1, y1, cmap[field[x1][y1]]);
        drawPoint(x2, y2, cmap[field[x2][y2]]);
    } else if (Math.random() < Math.exp(-deltaU/T)) { //... or if it is accepted by chance
        drawPoint(x1, y1, cmap[field[x1][y1]]);
        drawPoint(x2, y2, cmap[field[x2][y2]]);
    } else { // We swap back if we do not accept the trial state
        field[x2][y2] = field[x1][y1];
        field[x1][y1] = old1;
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
var speed = 1;
document.getElementById("speedSlider").value = speed;

document.getElementById("speedSlider").onchange = function() {
  speed = this.value;
}

// Temperature slider
document.getElementById("temperatureSlider").onchange = function() {
  T = parseFloat(this.value);
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
  N = Math.floor(Npercent*nCells);
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

document.getElementById("particleSlider").onchange = function() {
  Npercent = parseFloat(this.value);
  N = Math.floor(Npercent*nCells);
  
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

document.getElementById("particleSlider").oninput = function() {
  document.getElementById("particleText").innerHTML = this.value;
}

