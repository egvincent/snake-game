//-- variables (score defined above)
      var gridWidth = 30,
          gridHeight = 30,
          gridSquareSize = 10,
          interval,
          headPosition,
          goalPosition,
          bodyPositions = [],
          borderWidth = 6,
          paused = true,
          dead = false,
          started = false,
          direction = 1,
          newDirection = null;
      //0 is up, 1 is right, 2 is down, 3 is left
      
//-- things to do right away
      //get context
      var canvas = document.getElementById('can'),
          ctx = canvas.getContext('2d');
      //set width and height of canvas object
      canvas.width = (gridWidth * gridSquareSize) + 
                     (gridWidth * 2) + 2;
      canvas.height = (gridHeight * gridSquareSize) + 
                     (gridHeight * 2) + 2;
      //set width of canvas div
      document.getElementById('div_containsCanvas')
        .setAttribute("style", "width:" + (canvas.width + 2 * borderWidth) + "px");
      //first initialization doesn't use init(), because the timer should be set up later on in the code
        //set initial snake position
        bodyPositions = [];
        bodyPositions.push([15,13,1]);
        bodyPositions.push([15,14,1]);
        headPosition = [15,15,1];
        //set initial goal position
        newGoal();
        //set speed
        interval = 250; //4 times a second
        //make timer
        var intervalId = window.setInterval("repeats()", interval);
        redraw();
      //called every time you restart
      function init(){
        //set initial snake position
        bodyPositions = [];
        bodyPositions.push([15,13,1]);
        bodyPositions.push([15,14,1]);
        headPosition = [15,15,1];
        newDirection = null;
        //set initial goal position
        newGoal();
        //set speed
        interval = 250; //4 times a second
        //reset timer
        window.clearInterval(intervalId);
        intervalId = window.setInterval("repeats()", interval);
        redraw();
      }
      
//-- functions to set goalPosition to a new randomized location
      function newGoal(){
        var newGoalPosition = [Math.floor(Math.random() * 30), 
                             Math.floor(Math.random() * 30)];
        while(!isValidGoal(newGoalPosition)){
          newGoalPosition = [Math.floor(Math.random() * 30), 
                             Math.floor(Math.random() * 30)];
        }
        goalPosition = newGoalPosition;
      }
      function isValidGoal(position){
        if(position[0] == headPosition[0] || 
             position[1] == headPosition[1]){
            return false;
        }
        for(var pos = 0; pos < bodyPositions.length; pos++){
          console.log("-- isValidGoal -- checking validity of " + position[0] + ", " + position[1]);
          if(position[0] == bodyPositions[pos][0] && 
             position[1] == bodyPositions[pos][1]){
            console.log("-- isValidGoal -- not valid");
            return false;
          }
        }
        console.log("-- isValidGoal -- valid");
        return true;
      }
      
//-- to set up key listeners
      window.onkeydown = function (e) {
        var code = e.keyCode ? e.keyCode : e.which;
        if (code === 37 && !paused) { //left key
          console.log('left/3');
          newDirection = 3;
        }
        else if (code === 38 && !paused) { //up key
          console.log('up/0');
          newDirection = 0;
        } 
        else if (code === 39 && !paused) { //right key
          console.log('right/1');
          newDirection = 1;
        }
        else if (code === 40 && !paused) { //down key
          console.log('down/2');
          newDirection = 2;
        }
        else if (code === 32) { //space key
          console.log('space');
          //if game hasn't started yet
          if(paused && !started && !dead){
            paused = false;
            started = true;
          }
          else{
            //if paused during game
            if(paused && started && !dead){
              paused = false;
            }
            //during normal gameplay
            else if(!paused && started && !dead){
              paused = true;
            }
            //if dead
            else if(dead && started && !paused){
              dead = false;
              score = 0;
              init();
            }
          }
        }
      };
      
//-- function called every time the snake moves
      function move(){
        var endOfSnake = bodyPositions[0].slice();
        console.log("endOfSnake: " + endOfSnake);
      //move body
      console.log("-- move -- shifting bodyPositions coords");
        for(var i = 0; i < bodyPositions.length - 1; i++){ //up through second to last segment
          bodyPositions[i][0] = bodyPositions[i + 1][0];
          bodyPositions[i][1] = bodyPositions[i + 1][1];
        }
        if(newDirection != null){
        console.log("-- move -- newDirection is not null");
        //changes second to last body segment's pos/dir in direction newDirection
          bodyPositions[bodyPositions.length - 1][0] = headPosition[0];
          bodyPositions[bodyPositions.length - 1][1] = headPosition[1];
          bodyPositions[bodyPositions.length - 1][2] = newDirection;
        console.log("-- move -- changed 2nd to last body segment's pos/dir (in newDirection)");
        //changes head pos/dir in direction newDirection
          if(newDirection == 0){
            headPosition[0] -= 1; }
          else if(newDirection == 1){
            headPosition[1] += 1; }
          else if(newDirection == 2){
            headPosition[0] += 1; }
          else{
            headPosition[1] -= 1; }
          headPosition[2] = newDirection;
          console.log("-- move -- changed head pos/dir (in newDirection)");
          newDirection = null;
        }
        else{
          console.log("-- move -- newDirection is null");
          //changes second to last body segment's pos in way it was moving
            bodyPositions[bodyPositions.length - 1][0] = headPosition[0];
            bodyPositions[bodyPositions.length - 1][1] = headPosition[1];
          console.log("-- move -- changed 2nd to last body segment's pos (same direction)");
          //changes head pos in way it was moving
            if(headPosition[2] == 0){
              headPosition[0] -= 1; }
            else if(headPosition[2] == 1){
              headPosition[1] += 1; }
            else if(headPosition[2] == 2){
              headPosition[0] += 1; }
            else{
              headPosition[1] -= 1; }
            console.log("-- move -- changed head pos (same direction)");
          console.log("bodyPositions: " + bodyPositions);
          }
        //check if head's on body or wall, if is, make dead
          //wall
          if(headPosition[0] < 0           || 
             headPosition[0] >= gridHeight ||
             headPosition[1] < 0           ||
             headPosition[1] >= gridWidth){
            dead = true;
            return;
          }
          //body
          for(var i = 0; i < bodyPositions.length; i++){
            if(bodyPositions[i][0] == headPosition[0] &&
               bodyPositions[i][1] == headPosition[1]){
              dead = true;
              return;
        }
      }
      //check if head's on goal square, then add point and make new goal
        if(headPosition[0] == goalPosition[0] && headPosition[1] == goalPosition[1]){
        //add point and display
          score ++;
          document.getElementById("scoreSpan").innerHTML = score;
          console.log("-- move -- score now: " + score);
        //make new goal
          newGoal();
        //lengthen snake
          bodyPositions.unshift(endOfSnake);
        //shorten interval
          window.clearInterval(intervalId);
          interval *= (97/100);  //(97/100) good? - score probably <= 50
          intervalId = window.setInterval("repeats()", interval);
        }
      }
      
//-- to redisplay context content
      function redraw() {
        ctx.fillStyle = "#8FBC8F";
        for(var r = 0; r < gridHeight; r++){
          for(var c = 0; c < gridWidth; c++){
            square(r,c);
          }
        }
        ctx.fillStyle = "red"
        square(goalPosition[0], goalPosition[1]);
        ctx.fillStyle = "#5F9EA0"
        square(headPosition[0], headPosition[1]);
        ctx.fillStyle = "#48D1CC";
        for(var i = 0; i < bodyPositions.length; i++){
          square(bodyPositions[i][0], bodyPositions[i][1]);
        }
      }
      function square(r,c){
        ctx.fillRect((c * gridSquareSize) + ((1 + c) * 2),
                     (r * gridSquareSize) + ((1 + r) * 2),
                     gridSquareSize,
                     gridSquareSize);
        document.getElementById("div_containsCanvas").style.height = canvas.height + 80;
      }
      
//-- on a timer set above for the initial time
      var firstTimePaused = true,
          firstTimeDead = true;
      ctx.fillStyle = "rgba(255,255,255,0.15)"; //15% grey over whole canvas while paused
      ctx.fillRect(0,0,canvas.width, canvas.height);
      function repeats(){
        //if game hasn't started yet
        if(paused && !started && !dead){
          document.getElementById("pausedOrNot").innerHTML = "~Press Space To Start~";
        }
        else{
          //if paused during game
          if(paused && firstTimePaused && started && !dead){
            ctx.fillStyle = "rgba(255,255,255,0.15)"; //15% grey over whole canvas while paused
            ctx.fillRect(0,0,canvas.width, canvas.height);
            document.getElementById("pausedOrNot").innerHTML = "~paused~";
            firstTimePaused = false;
          }
          //during normal gameplay
          else if(!paused && started && !dead){
            ctx.clearRect(0,0,canvas.width, canvas.height);
            move();
            redraw();
            document.getElementById("pausedOrNot").innerHTML = "";
            firstTimePaused = true;
            firstTimeDead = true;
          }
          //if dead
          else if(dead && firstTimeDead && started && !paused){
            ctx.fillStyle = "rgba(255,255,255,0.15)"; //15% grey over whole canvas while paused
            ctx.fillRect(0,0,canvas.width, canvas.height);
            document.getElementById("pausedOrNot").innerHTML = "~You died! Press space to retry~";
            firstTimeDead = false;
          }
        }
      }

