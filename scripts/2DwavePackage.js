/*
  To-do:  ???
*/
// Get the canvas element to draw on
var canvas = document.getElementById("mainCanvas");
var ctx = canvas.getContext("2d");

// Well dimensions
var xMax = canvas.width;
var yMax = canvas.height;

// ### Math related functions ### \\

function linspace(start, end, nSteps) {
  return math.add(math.multiply(math.range(0, nSteps), (end-start)/(nSteps-1)), start)
}

// ### Quantum mechanics related functions ### \\

// The stationary states
function psi_n(n1, n2, x, y) {
  out = math.zeros(math.size(x)[0], math.size(y)[0])

  for (i = 0; i < math.size(y)[0]; i ++) {
  
  }

  return 2*math.sin(math.multiply(n1*math.pi, x))*math.sin(math.multiply(n2*math.pi, y));
}

// The energies corresponding to the stationary states
function energy(n1, n2) {
  return (n1*n1 + n2*n2)*math.pi*math.pi/2;
}

// The time-depedent stationary states
function Psi_n(n1, n2, x, y, t) {
  return math.dotMultiply(psi_n(n1, n2, x, y), math.exp(math.complex(0, -energy(n1, n2)*t)))
}

// A linear combination of stationary states
function Psi(cn, x, y, t) {
  var out;

  for (i = 0; i < cn.length; i++) {
    for (j = 0; j < cn[i].length; j++) {
      
    }
  }
}

// ### Drawing/UI/"game loop" related functions ### \\

// Function to generate a colormap with 'n' colors
function colormap(n) {
  var cmap = new Array(n);
  for (i = 0; i < n; i++) {
    cmap[i] = 'hsl(' + i*360/n + ", 75%, 50%)";
  }
  
  return cmap;
}

// Function to generate random integers between max and min inclusive (from MDN)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Button to set the wave package position and direction
document.getElementById("setWavePackageButton").onclick = function() {
  console.log("I am a button")
}

// Button to reset canvas
document.getElementById("canvasResetButton").onclick = function() {
  console.log("I am a button")
}

// "Game loop"
ups = 100 // "updates" per second

function run() {
  // Repeat for each step on the speed slider
  for (s = 0; s < speed; s++) {
    // DO ME!
  }
}

intervalId = setInterval(run, 1000/ups);
simulationRunning = true;

function resetPage () {
 // DO ME!
}

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

// Speed slider
speed = 1;
document.getElementById("speedSlider").value = speed;

document.getElementById("speedSlider").onchange = function() {
  speed = this.value;
}

// Number of cells slider
document.getElementById("cellSlider").value = xMax;

document.getElementById("cellSlider").onchange = function() {
  xMax = yMax = parseInt(this.value);
  canvas.width = xMax;
  canvas.height = yMax;
  
  // If the simulation is running while changing the canvas size we pause it while redrawing
  if (simulationRunning) {
    clearInterval(intervalId);
  }
  
  // DO ME!
  
  // If the simulation was running before we started redrawing we start it again
  if (simulationRunning) {
    intervalId = setInterval(run, 1000/ups);
  }
}
