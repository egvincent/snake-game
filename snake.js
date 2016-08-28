var COLS = 30;
var ROWS = 30;
var SQUARE_SIDE_LENGTH = 14;

var COLOR_BACKGROUND = "#8FBC8F";
var COLOR_GOAL = "#FF6347";
var COLOR_HEAD = "#4169E1";
var COLOR_BODY = "#6495ED";

var interval;
var headPosition;
var goalPosition;
var bodyPositions; // one row per body segment in format [x, y, direction]

var paused = true;
var dead = false;
var started = false;
var score = 0;
var direction = 1; // 0-3, top first and clockwise
var newDirection = null;
var firstTimePaused = true;
var firstTimeDead = true;

var pausedElement = document.getElementById("snake-paused");
var scoreElement = document.getElementById("snake-score");
var canvas = document.getElementById("canvas");
var canvasContainer = document.getElementById("canvas-container");

var ctx = canvas.getContext("2d");

// set dimensions
canvas.width = (COLS * SQUARE_SIDE_LENGTH) + (COLS * 2) + 2;
canvas.height = (ROWS * SQUARE_SIDE_LENGTH) + (ROWS * 2) + 2;
canvasContainer.style.width = canvas.width;
canvasContainer.style.height = canvas.height;

init();
var intervalId = newInterval(interval)
redraw();

function init() {
  // initial snake position
  bodyPositions = [];
  bodyPositions.push([15,13,1]);
  bodyPositions.push([15,14,1]);
  headPosition = [15,15,1];
  newDirection = null;
  // initial goal position
  goalPosition = newGoal();
  // initial speed
  interval = 250; // 4 times a second
}

// main loop
function repeats() {
  // if game hasn't started yet
  if(paused && !started && !dead) {
    pausedElement.innerHTML = "Press Space To Start";
  }
  else {
    // if paused during game
    if (paused && firstTimePaused && started && !dead) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)"; // 15% grey over whole canvas while paused
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      pausedElement.innerHTML = "paused";
      firstTimePaused = false;
    }
    // during normal gameplay
    else if (!paused && started && !dead) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      move();
      redraw();
      pausedElement.innerHTML = "<br>";
      firstTimePaused = true;
      firstTimeDead = true;
      scoreElement.innerHTML = score;
    }
    // if dead
    else if (dead && firstTimeDead && started && !paused) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)"; // 15% grey over whole canvas while paused
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      pausedElement.innerHTML = "You died! Press space to retry";
      firstTimeDead = false;
    }
  }
}

// takes an optional current interval id and returns a new id
function newInterval(frequency) {
  if (intervalId) window.clearInterval(intervalId);
  return window.setInterval("repeats()", frequency);
}

function restart() {
  init();
  intervalId = newInterval(interval);

  redraw();
}
      
// returns a new random and valid location
function newGoal() {
  var newGoalPosition = [Math.floor(Math.random() * COLS), 
                         Math.floor(Math.random() * ROWS)];
  while (!isValidGoal(newGoalPosition)) {
    newGoalPosition = [Math.floor(Math.random() * COLS),
                       Math.floor(Math.random() * ROWS)];
  }
  return newGoalPosition;
}

function isValidGoal(position) {
  if (position[0] == headPosition[0] ||
      position[1] == headPosition[1]) {
    return false;
  }
  for (var pos = 0; pos < bodyPositions.length; pos++) {
    if(position[0] == bodyPositions[pos][0] && 
       position[1] == bodyPositions[pos][1]) {
      return false;
    }
  }
  return true;
}
      
// set up key listeners
window.onkeydown = function (e) {
  // avoid arrow key scrolling
  e.preventDefault();
  var code = e.keyCode ? e.keyCode : e.which;
  // switch direction in normal gameplay
  if (!paused) {
    if (code == 37) newDirection = 3;      // left
    else if (code == 38) newDirection = 0; // up
    else if (code == 39) newDirection = 1; // right
    else if (code == 40) newDirection = 2; // down
  }
  // space key is pressed: either start/restart or pause/play
  if (code == 32) {
    // hasn't started -> start
    if (paused && !started && !dead) {
      paused = false;
      started = true;
    }
    else {
      // pause/play
      if (started && !dead) {
        paused = !paused;
      }
      // dead -> restart
      else if (started && dead && !paused) {
        dead = false;
        score = 0;
        restart();
      }
    }
  }
};

function move() {
  var endOfSnake = bodyPositions[0].slice();
  // move body by shifting positions down the length of the snake
  for (var i = 0; i < bodyPositions.length - 1; i++) {
    bodyPositions[i][0] = bodyPositions[i + 1][0];
    bodyPositions[i][1] = bodyPositions[i + 1][1];
  }
  if (newDirection != null) {
    // set front body segment to former head position
    bodyPositions[bodyPositions.length - 1] = [headPosition[0], headPosition[1], newDirection];
    // adjust head according to newDirection
    if (newDirection == 0) headPosition[0] -= 1;
    else if (newDirection == 1) headPosition[1] += 1;
    else if (newDirection == 2) headPosition[0] += 1;
    else headPosition[1] -= 1;
    headPosition[2] = newDirection;
    newDirection = null;
  }
  else {
    // changes front body segment's pos in way it was moving
    bodyPositions[bodyPositions.length - 1][0] = headPosition[0];
    bodyPositions[bodyPositions.length - 1][1] = headPosition[1];
    // changes head pos in way it was moving
    if (headPosition[2] == 0) headPosition[0] -= 1;
    else if (headPosition[2] == 1) headPosition[1] += 1;
    else if (headPosition[2] == 2) headPosition[0] += 1;
    else headPosition[1] -= 1;
  }

  if (shouldKillSnake()) {
    dead = true;
    return;
  }

  // if head is on a goal
  if (headPosition[0] == goalPosition[0] && headPosition[1] == goalPosition[1]) {
    // increment score and display
    score ++;
    scoreElement.innerHTML = score;
    // make new goal
    goalPosition = newGoal();
    // lengthen snake by duplicating trailing segment
    bodyPositions.unshift(endOfSnake);
    // shorten interval
    interval *= (97/100);
    intervalId = newInterval(interval);
  }
}

// check if head's on body or wall, if so, return true
function shouldKillSnake() {
  // wall
  if (headPosition[0] < 0     || 
      headPosition[0] >= ROWS ||
      headPosition[1] < 0     ||
      headPosition[1] >= COLS) {
    return true;
  }
  // body
  for (var i = 0; i < bodyPositions.length; i++) {
    if (bodyPositions[i][0] == headPosition[0] &&
        bodyPositions[i][1] == headPosition[1]) {
      return true;
    }
  }
  return false;
}

// redisplay context content
function redraw() {
  ctx.fillStyle = COLOR_BACKGROUND;
  for(var r = 0; r < ROWS; r++) {
    for(var c = 0; c < COLS; c++) {
      square(r,c);
    }
  }
  square(goalPosition[0], goalPosition[1], COLOR_GOAL);
  square(headPosition[0], headPosition[1], COLOR_HEAD);
  ctx.fillStyle = COLOR_BODY
  for(var i = 0; i < bodyPositions.length; i++) {
    square(bodyPositions[i][0], bodyPositions[i][1]);
  }
}

function square(r, c, color) {
  if (color) ctx.fillStyle = color;
  ctx.fillRect((c * SQUARE_SIDE_LENGTH) + ((1 + c) * 2),
               (r * SQUARE_SIDE_LENGTH) + ((1 + r) * 2),
               SQUARE_SIDE_LENGTH, SQUARE_SIDE_LENGTH);
}