/*
  To-do:  ???
*/

// ### Math related functions ### \\

// Function which returns an array of linearly spaced values between start and end with nSteps steps
function linspace(start, end, nSteps) {
  var out = new Array(nSteps);

  for (i = 0; i < nSteps; i++) {
    out[i] = ((end-start)/(nSteps-1))*i + start;
  }

  return out;
}

// Function which does numerical integration using Simpson's method (length of x must be even)
function simps(f, x) {
  var out = math.add(f[0], f[f.length - 1]);
  
  for (let i = 1; i < x.length/2; i++) {
    out = math.add(out, math.add(4*f[2*i-1], 2*f[2*i]));
  }
  
  return math.divide(math.multiply(out, x[x.length - 1] - x[0]), 3*x.length);
}

function simps2D(f, x, y) {
  var yIntegrals = new Array(f.length);
  
  // First we integrate over the y-axis
  for (let i = 0; i < f.length; i++) {
    yIntegrals[i] = simps(f[i], y);
  }
  
  // Then we integrate over the x-axis
  out = simps(yIntegrals, x);
  
  return out;
}

// Function to generate random integers between max and min inclusive (from MDN)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ### Quantum mechanics related functions ### \\

// The stationary states
function psi_n(n1, n2, x, y) {
  var out = new Array(x.length);

  for (let i = 0; i < x.length; i++) {
    out[i] = new Array(y.length);
    
    for (let j = 0; j < y.length; j++) {
      out[i][j] = 2 * Math.sin(n1 * Math.PI * x[i]) * Math.sin(n2 * Math.PI * y[j]);
    }
  }

  return out;
}

// The energies corresponding to the stationary states
function energy(n1, n2) {
  return (n1*n1 + n2*n2)*math.pi*math.pi/2;
}

// The time-depedent stationary states
function Psi_n(n1, n2, x, y, t) {
  var out = psi_n(n1, n2, x, y);
  
  for (let i = 0; i < x.length; i++) {
    for (let j = 0; j < y.length; j++) {
      out[i][j] = math.multiply(out[i][j], math.exp(math.complex(0, -energy(n1, n2)*t)));
    }
  }

  return out;
}

// A linear combination of stationary states
function Psi(cn, x, y, t) {
  // Initalize the out array
  var out = new Array(x.length);
  
  for (i = 0; i < x.length; i++) {
    out[i] = new Array(y.length);
    
    for (j = 0; j < y.length; j++) {
      out[i][j] = 0;
    }
  }
  
  // Calcualte the linear combination
  for (let i = 0; i < cn.length; i++) {
    for (let j = 0; j < cn[i].length; j++) {
      timeDep = Psi_n(i+1, j+1, x, y, t);
      
      for (k = 0; k < x.length; k++) {
        for (l = 0; l < y.length; l++) {
          out[k][l] = math.add(out[k][l], math.multiply(cn[i][j], timeDep[k][l]));
        }
      }
    }
  }
  
  return out;
}

// Function which takes an arbitrary wave function and projects it onto the stationary states
function getcn(f, x, n1, n2) {
  var cn = new Array(n1);
  
  for (let i = 0; i < n1; i++) {
    cn[i] = new Array(n2);
    
    for (let j = 0; j < n2; j++) {
      cn[i][j] = simps2D(math.dotMultiply(math.conj(psi_n(i+1, j+1, x, y)), f), x, y);
    }
  }
  
  return cn;
}

// ### Drawing/UI/"draw loop" related stuff ### \\

// Function to generate a colormap with 'n' colors
function colormap(n) {
  var cmap = new Array(n);
  for (i = 0; i < n; i++) {
    cmap[i] = 'hsl(' + i*360/n + ", 75%, 50%)";
  }
  
  return cmap;
}

// Initialize the wave package and the canvas

// Get the canvas element to draw on
var canvas = document.getElementById("mainCanvas");
var ctx = canvas.getContext("2d");

// Well dimensions
var xMax = canvas.width;
var yMax = canvas.height;

// The well dimensions determine the resolution of our simulation
var x = linspace(0, 1, xMax);
var y = linspace(0, 1, yMax);

// Setup the wave package
x0 = 0.5;
y0 = 0.5
sigma = 0.01;
k0x = 100;
k0y = 100;

// fun = np.exp(-1/2 * (x-x0)**2/sigma**2) * np.exp(-1j*k0*x)
var fun = new Array(xMax);

for (i = 0; i < xMax; i++) {
  fun[i] = new Array(yMax);
  
  for (j = 0; j < yMax; j++) {
    fun[i][j] = math.multiply(math.exp(-1/2*((x[i]-x0)*(x[i]-x0) + (y[j]-y0)*(y[j]-y0))/(sigma*sigma)), math.exp(math.complex(0, -(k0x*x[i] + k0y*y[j]))));
  }
}

var cn = getcn(fun, x, y, 50, 50);

var f0 = Psi(cn, x, y, 0);

maxIntensity = math.max(math.abs(f0));

// "Draw loop"
ups = 1 // "frames" per second

var t = 0;
var deltat = 0.001;

// Setup the image data
var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
var data = imageData.data;

function run() {
  // Get the function at the current time
  f = Psi(cn, x, y, t);
  
  // Do the drawing
  for (let i = 0; i < data.length; i += 4) {
    let j = i/4;
    data[i + 3] = 255*math.abs(f[(j - (j % yMax))/xMax][j % yMax])/maxIntensity;
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  t += speed*deltat;
  
  console.log(t)
}

intervalId = setInterval(run, 1000/ups);
simulationRunning = true;

// Button to set the wave package position and direction
document.getElementById("setWavePackageButton").onclick = function() {
  console.log("I am a button")
}

// Button to reset canvas
document.getElementById("canvasResetButton").onclick = function() {
  console.log("I am a button")
}

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
