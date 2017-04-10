/*
  To-do:  More initial conditions
          Defensive interactions
          graphs (?)
*/

// Get the canvas element to draw on
var canvas = document.getElementById("mainCanvas");
var ctx = canvas.getContext("2d");

var scale = 5; // scale hould divide width and height of canvas
document.getElementById("scaleSlider").value = scale;
var n = 3 // Number of colors
// Field dimensions
var xMax = canvas.width / scale;
var yMax = canvas.height / scale;
var nCells = xMax*yMax;

// Function to generate a colormap with 'n' colors
function colormap(n) {
  var cmap = new Array(n);
  for (i = 0; i < n; i++) {
    cmap[i] = 'hsl(' + i*360/n + ", 75%, 50%)";
  }
  
  return cmap;
}

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

function countCells(cellArray) {
  var totals = Array(n);
  
  for (i = 0; i < totals.length; i++) {
    totals[i] = 0;
  }
  
  for (i = 0; i < cellArray.length; i ++) {
    for (j = 0; j < cellArray[i].length; j++) {
      totals[cellArray[i][j]]++;
    }
  }
  
  return totals;
}

// Function to create the displayed interactions table
function createInteractionsTable() {
  var tableDiv = document.getElementById("interactionsTable");
  interactionsTable = document.createElement("table");
  interactionsTable.id = "iTable";
  
  for (i = 0; i < n + 1; i++) {
    var tableRow = interactionsTable.insertRow();
    if (i == 0) {
      tableRow.insertCell();
      for (j = 0; j < n; j++) {
        var td = tableRow.insertCell();
        td.appendChild(document.createTextNode(j.toString() + " \u25CF"));
        td.className = "i" + j.toString();
      }
    } else {
      var td = tableRow.insertCell();
      td.appendChild(document.createTextNode((i- 1).toString() + " \u25CF"));
      td.className = "i" + (i - 1).toString();
      for (j = 0; j < n; j++) {
        var td = tableRow.insertCell();
        var inputBox = document.createElement("input");
        inputBox.type = "number"; inputBox.min = "0"; inputBox.max = n.toString(); inputBox.id = (i - 1).toString() + "," + j.toString(); inputBox.className = "numberBox";
        td.appendChild(inputBox);
      }
    }
  }
  
  tableDiv.appendChild(interactionsTable);
}

// Function to create the "spock-like" interactions table
function resetInteractionsSpockLike() {
  iTable = new Array(n);
  
  for (i = 0; i < n; i++) {
    iTable[i] = new Array(n);
    for (j = 0; j < n; j++) {
      iTable[i][j] = j;
    }
    for (j = 0; j <= Math.floor(n/2); j++) {
      iTable[i][(i + j) % n] = i;
    }
  }
  
  return iTable;
}

// Function to create the cyclic interactions table
function resetInteractionsCyclic() {
  iTable = new Array(n);
  
  for (i = 0; i < n; i++) {
    iTable[i] = new Array(n);
    for (j = 0; j < n; j++) {
      if ((i + 1) % n == j) {
        iTable[i][j] = i;
      } else {
        iTable[i][j] = j;
      }
    }
  }
  
  return iTable;
}

// Function to create the "self-destruction" interactions table
function resetInteractionsSelfDestruction() {
  iTable = new Array(n);
  
  for (i = 0; i < n; i++) {
    iTable[i] = new Array(n);
    for (j = 0; j < n; j++) {
      if (i == j) {
        iTable[i][j] = 0;
      } else if (j == 0) {
        iTable[i][j] = i;
      } else {
        iTable[i][j] = j;
      }
    }
  }
  
  return iTable;
}

// Create a hash table of the interaction generating functions. Used when increasing or decreasing the number of species
interactionsList = ["Cyclic", "Spock-Like", "Self-Destruction"];
resetInteractions = {};
resetInteractions["Cyclic"] = resetInteractionsCyclic;
resetInteractions["Spock-Like"] = resetInteractionsSpockLike;
resetInteractions["Self-Destruction"] = resetInteractionsSelfDestruction;

// Function to populate the HTML select element with the possible interaction presets
function populateInteractionsList() {
  list = document.getElementById("interactionsList");
  for (i = 0; i < interactionsList.length; i++) {
    list.add(new Option(interactionsList[i], interactionsList[i]));
  }
}

populateInteractionsList();

// The color map to use for the species
cmap = colormap(n);

// Create the interactions table
selectedInteractions = "Cyclic";
document.getElementById("interactionsList").value = selectedInteractions;

interactions = resetInteractions[selectedInteractions]();

createInteractionsTable();

// Function to populate and color the HTML table
function populateHTMLTable() {
  // Populate the HTML table with the above values
  for (i = 0; i < interactions.length; i++) {
    for (j = 0; j < interactions.length; j++) {
      document.getElementById(i.toString() + "," + j.toString()).value = interactions[i][j];
    }
  }

  // Set the colors on the table headers
  for (i = 0; i < interactions.length; i++) {
    var tableHeaders = document.querySelectorAll(".i" + i.toString())
    for (j = 0; j < tableHeaders.length; j++) {
      tableHeaders[j].style.color = cmap[i];
    }
  }
}

populateHTMLTable();

// Generate circular initial conditions
function resetCanvasCircular(c, r) {
  var initCon = new Array(xMax);
  
  for (i = 0; i < xMax; i++) {
    initCon[i] = new Array(yMax);
    
    for (j = 0; j < yMax; j++) {
      d = (i - c[0])*(i - c[0]) + (j - c[1])*(j - c[1]);
      
      for (k = 0; k < n; k++) {
        if (d <= r[k]) {
          initCon[i][j] = k;
          break;
        } else if (k == n - 1) {
          initCon[i][j] = k;
        }
      }
    }
  }
  
  return initCon;
}

// Generate circular equiradial initial condtions with center in (xMax/2, yMax/2)
function resetCanvasCircularEquiradialCenter() {
  // Center in the middle of the field
  c = [xMax/2, yMax/2];
  r = Array(n);
  
  for (i = 0; i < n; i++) {
    r[i] = (xMax/(2*n)*(i + 1))*(xMax/(2*n)*(i + 1)); // We use r^2 since computing square roots is slow
  }
  
  return resetCanvasCircular(c, r);
}

// Generate circular equiradial initial condtions with center in (0, 0)
function resetCanvasCircularEquiradialCorner() {
  // Center in the middle of the field
  c = [0, 0];
  r = Array(n);
  
  for (i = 0; i < n; i++) {
    r[i] = ((xMax/n)*(i + 1))*((xMax/n)*(i + 1)); // We use r^2 since computing square roots is slow
  }
  
  return resetCanvasCircular(c, r);
}
  
// Generate random initial conditions
function resetCanvasRandomly() {
  var initCon = new Array(xMax);

  for (i = 0; i < xMax; i++) {
    initCon[i] = new Array(yMax);
    
    for (j = 0; j < yMax; j++) {
      initCon[i][j] = getRandomInt(0, n - 1);
    }
  }
  
  return initCon;
}

// Create a hash table of the initial condition generating functions. Used when increasing or decreasing the number of species
initialConditionsList = ["Random", "Circular: Center", "Circular: Corner"];
resetCanvas = {};
resetCanvas["Random"] = resetCanvasRandomly;
resetCanvas["Circular: Center"] = resetCanvasCircularEquiradialCenter;
resetCanvas["Circular: Corner"] = resetCanvasCircularEquiradialCorner;

// Function to populate the HTML select element with the possible initial conditions
function populateInitialConditionsList() {
  list = document.getElementById("initialConditionsList");
  for (i = 0; i < initialConditionsList.length; i++) {
    list.add(new Option(initialConditionsList[i], initialConditionsList[i]));
  }
}

populateInitialConditionsList();

// Redraws the entire canvas with the current field
function drawField() {
  for (i = 0; i < xMax; i++) {
    for (j = 0; j < yMax; j++) {
      drawPoint(i, j, cmap[field[i][j]]);
    }
  }
}

selectedInitialConditions = "Random";
document.getElementById("initialConditionsList").value = selectedInitialConditions;

var field = resetCanvas[selectedInitialConditions]();

drawField();

// Button to change interactions
document.getElementById("interactionsButton").onclick = function() {
  for (i = 0; i < n; i++) {
    for (j = 0; j < n; j++) {
      interactions[i][j] = parseInt(document.getElementById(i.toString() + "," + j.toString()).value);
    }
  }
}

// Button to reset canvas
document.getElementById("canvasResetButton").onclick = function() {
  field = resetCanvas[selectedInitialConditions]();
  drawField();
}

neighbors = [[1, 0], [-1, 0], [0, 1], [0, -1]];
document.getElementById("neighborList").value = "4"

// "Game loop"
ups = 50 // "updates" per second
updates = 0;

function run() {
  // Repeat twice for each step on the speed slider
  for (s = 0; s < 2*speed; s++) {
    updates++;
    // Pick a random point
    x = getRandomInt(0, xMax - 1);
    y = getRandomInt(0, yMax - 1);
    
    for (i = 0; i < neighbors.length; i++) {
      xn = ((x + neighbors[i][0]) % xMax + xMax) % xMax;
      yn = ((y + neighbors[i][1]) % yMax + yMax) % yMax;
      
      // Check if interaction leads to a change and update field and canvas if so
      if (field[xn][yn] != interactions[field[x][y]][field[xn][yn]]) {
        counts[field[xn][yn]]--; // Count the disappearing species down
        counts[interactions[field[x][y]][field[xn][yn]]]++; // Count the overtaking species up
        field[xn][yn] = interactions[field[x][y]][field[xn][yn]];
        drawPoint(xn, yn, cmap[field[xn][yn]]);
      }
    }
  }
  
  var tmp = [updates];
  for (i = 0; i < n; i ++) {
    tmp.push(counts[i]/nCells);
  }
  
  data.push(tmp);
  if (data.length > 500) {
    data.shift();
  }
  popChart.updateOptions({'file': data});
}

// Function to reset the chart
function resetChart() {
  updates = 0;
  data = [];
  var tmp = [0];
  labels = ["Steps"];
  for (i = 0; i < n; i ++) {
    tmp.push(counts[i]/nCells);
    labels.push(i.toString());
  }
  
  data.push(tmp);
  
  // If a graph already exists, then destroy it
  if (popChart) {
    popChart.destroy();
  }
  
  // Create the new graph
  popChart = new Dygraph(document.getElementById("populationChart"), data, {
    drawPoints: true,
    valueRange: [0, 1], // Set y-axis
    colors: cmap,
    labels: labels});
}

// Setup the relevant chart variable and plot initial population on it
var data;
var popChart;

var counts = countCells(field);

resetChart();

// Start the simulation
intervalId = setInterval(run, 1000/ups);
simulationRunning = true;

function resetPage () {
  clearInterval(intervalId);
  simulation = false;
  cmap = colormap(n);
  interactions = resetInteractions[selectedInteractions]();
  document.getElementById("interactionsTable").removeChild(document.getElementById("iTable"));
  createInteractionsTable();
  populateHTMLTable();
  field = resetCanvas[selectedInitialConditions]();
  drawField();
  counts = countCells(field)
  resetChart();
  intervalId = setInterval(run, 1000/ups);
  simulationRunning = true;
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

// Add species button
document.getElementById("addSpeciesButton").onclick = function() {
 n++;
 resetPage();
}

// Remove species button
document.getElementById("removeSpeciesButton").onclick = function() {
 if (n > 1) {
   n--;
   resetPage();
 }
}

// Interactions list
document.getElementById("interactionsList").onchange = function() {
  selectedInteractions = this.value;
  interactions = resetInteractions[selectedInteractions]();
  populateHTMLTable();
}

// Initial conditions list
document.getElementById("initialConditionsList").onchange = function() {
  selectedInitialConditions = this.value;
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

// Number of cells slider
document.getElementById("cellSlider").value = xMax;

document.getElementById("cellSlider").onchange = function() {
  xMax = yMax = parseInt(this.value);
  nCells = xMax*yMax;
  canvas.width = scale*xMax;
  canvas.height = scale*yMax;
  
  // If the simulation is running while changing the canvas size we pause it while redrawing
  if (simulationRunning) {
    clearInterval(intervalId);
  }
  
  field = resetCanvas[selectedInitialConditions]();
  drawField();
  
  // If the simulation was running before we started redrawing we start it again
  if (simulationRunning) {
    intervalId = setInterval(run, 1000/ups);
  }
}

// Neighbor list
document.getElementById("neighborList").onchange = function() {
  if (this.value == "4") {
    neighbors = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  } else {
    neighbors = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  }
}

