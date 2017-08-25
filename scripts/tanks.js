// Get the canvas element to draw on
var canvas = document.getElementById("mainCanvas");
var ctx = canvas.getContext("2d");

var scale = 8; // scale hould divide width and height of canvas

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

function drawLineTo (x0, y0, x1, y1, color) {
    ctx.beginPath();
    ctx.moveTo(scale*(x0+0.5), scale*(y0+0.5));
    ctx.lineTo(scale*(x1+0.5), scale*(y1+0.5));
    ctx.strokeStyle = color;
    ctx.lineWidth = scale/2;
    ctx.stroke();
}

var ground = new Array(xMax);
for (let i = 0; i < xMax; i++) {
    ground[i] = new Array(yMax);
    for (let j = 0; j < yMax; j++) {
        ground[i][j] = false;
    }
}

function resetGround() {
    for (let i = 0; i < xMax; i++) {
        for (let j = 3/4*yMax; j < yMax; j++) {
            drawPoint(i, j, "#007B0C");
            ground[i][j] = true;
        }
    }
}

resetGround();

var player1 = new Object();
player1.xPos = 20;
player1.yPos = 3/4*yMax - 1;
player1.color = "#FF0000"
player1.goingLeft = false;
player1.goingRight = false;
player1.aimLeft = false;
player1.aimRight = false;
player1.angle = Math.PI/4;
player1.bullet = false;
player1.bulletX = 0;
player1.bulletY = 0;
player1.bulletSpeedX = 0;
player1.bulletSpeedY = 0;
player1.bulletAngle = 0;
player1.fired = false;

var player2 = new Object();
player2.xPos = 80;
player2.yPos = 3/4*yMax - 1;
player2.color = "#0000FF";
player2.goingLeft = false;
player2.goingRight = false;
player2.aimLeft = false;
player2.aimRight = false;
player2.angle = Math.PI*3/4;
player2.bullet = false;
player2.bulletX = 0;
player2.bulletY = 0;
player2.bulletSpeedX = 0;
player2.bulletSpeedY = 0;
player2.bulletAngle = 0;
player2.fired = false;

var players = [player1, player2];

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the ground
    for (let i = 0; i < xMax; i++) {
        for (let j = 0; j < yMax; j++) {
            if (ground[i][j]) {
                drawPoint(i, j, "#007B0C");
            }
        }
    }

    // Draw the players and the bullets
    for (let i = 0; i < players.length; i++) {
        // Players
        drawPoint(players[i].xPos, players[i].yPos, players[i].color);
        drawLineTo(players[i].xPos, players[i].yPos, players[i].xPos + 5*Math.cos(players[i].angle),players[i].yPos - 5*Math.sin(players[i].angle), players[i].color);

        // Bullets
        if (players[i].bullet) {
            drawPoint(players[i].bulletX, players[i].bulletY, "#000000");
        }
    }
}

gravity = 0.002;
bulletSpeed = 2;
explosionRadius = 2;

function explosion(x, y) {
    console.log("Bullet hit at x:" + x + " y:" + y);
    for (let i = -explosionRadius; i <= explosionRadius; i++) {
        for (let j = -explosionRadius; j <= explosionRadius; j++) {
            if (i*i + j*j <= explosionRadius*explosionRadius) {
                if (x + i >= 0 && x + i < xMax && y + j >= 0 && y + j < yMax)
                ground[x + i][y + j] = false;
            }
        }
    }
}

function run() {
    for (let i = 0; i < players.length; i++) {
        // Move the tanks if the keys are pressed
        if (players[i].goingLeft && players[i].xPos > 0) {
            if (!ground[players[i].xPos-1][players[i].yPos]) {
                players[i].xPos -= 1
            }
        } else if (players[i].goingRight && players[i].xPos < xMax-1) {
            if (!ground[players[i].xPos+1][players[i].yPos]) {
                players[i].xPos += 1;
            }
        }

        // Change the aim
        if (players[i].aimLeft) {
            players[i].angle += 0.1;
        } else if (players[i].aimRight) {
            players[i].angle -= 0.1;
        }

        // Fire a bullet if no bullet is in the air
        if (players[i].fired && !players[i].bullet) {
            console.log("Fired a bullet");
            players[i].bulletX = players[i].xPos;
            players[i].bulletY = players[i].yPos;
            players[i].bulletAngle = players[i].angle;
            players[i].bulletSpeedX = bulletSpeed*Math.cos(players[i].angle);
            players[i].bulletSpeedY = -bulletSpeed*Math.sin(players[i].angle);
            players[i].fired = false;
            players[i].bullet = true;
        }

        // If a bullet is in the air we update its position and do collision detection
        if (players[i].bullet) {
            // Move bullet
            players[i].bulletX += players[i].bulletSpeedX;
            players[i].bulletY += players[i].bulletSpeedY;
            players[i].bulletSpeedY += gravity*dt;
            // Remove the bullet if it goes off screen
            if (players[i].bulletX < 0 || players[i].bulletX > xMax || players[i].bulletY < 0 || players[i].bulletY > yMax) {
                players[i].bullet = false;
            } else {
                var abort = false;
                // Collision detection with the ground
                for (let j = 0; j < xMax && !abort; j++) {
                    for (let k = 0; k < yMax; k++) {
                        if (ground[j][k]) {
                            if (players[i].bulletX > j && players[i].bulletX < j+1 && players[i].bulletY > k && players[i].bulletY < k+1) {
                                players[i].bullet = false;
                                explosion(j, k);
                                console.log("Bullet hit ground");
                                abort = true;
                                break;
                            }
                        }
                    }
                }
            }
        }


    }

    draw()
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
    if (e.keyCode == 65) { // a
        player1.goingLeft = true;
    } else if (e.keyCode == 68) { // d
        player1.goingRight = true;
    } else if (e.keyCode == 81) { // q
        player1.aimLeft = true;
    } else if (e.keyCode == 69) { // e
        player1.aimRight = true;
    } else if (e.keyCode == 87) { // w
        player1.fired = true;
    } else if (e.keyCode == 74) { // j
        player2.goingLeft = true;
    } else if (e.keyCode == 76) { // l
        player2.goingRight = true;
    } else if (e.keyCode == 85) { // u
        player2.aimLeft = true;
    } else if (e.keyCode == 79) { // o
        player2.aimRight = true;
    } else if (e.keyCode == 73) { // i
        player2.fired = true;
    }
}

function keyUpHandler(e) {
    if (e.keyCode == 65) { // a
        player1.goingLeft = false;
    } else if (e.keyCode == 68) { // d
        player1.goingRight = false;
    } else if (e.keyCode == 81) { // q
        player1.aimLeft = false;
    } else if (e.keyCode == 69) { // e
        player1.aimRight = false;
    } else if (e.keyCode == 87) { // w
        player1.fired = false;
    } else if (e.keyCode == 74) { // j
        player2.goingLeft = false;
    } else if (e.keyCode == 76) { // l
        player2.goingRight = false;
    } else if (e.keyCode == 85) { // u
        player2.aimLeft = false;
    } else if (e.keyCode == 79) { // o
        player2.aimRight = false;
    } else if (e.keyCode == 73) { // i
        player2.fired = false;
    }
}

dt = 1000/30;

setInterval(run, dt);
