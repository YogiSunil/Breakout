const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Game Variables
let x, y, dx, dy;
const ballRadius = 10;

const paddleHeight = 10;
const paddleWidth = 75;
let paddleX;

let rightPressed = false;
let leftPressed = false;
let mouseX = null;

let brickRowCount;
let brickColumnCount;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 35;

let bricks = [];
let score = 0;
let lives = 3;
let level = 1;

function resetGameState() {
  x = canvas.width / 2;
  y = canvas.height - 30;
  dx = 2 + level;
  dy = -(2 + level);
  paddleX = (canvas.width - paddleWidth) / 2;

  brickRowCount = 3 + level - 1;
  brickColumnCount = 5 + Math.floor(level / 2);

  bricks = [];
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#A133FF", "#FFC733"];
  const brickWidth = Math.max(30, 75 - level * 5); // Decrease brick width as level increases

  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;

        const colorIndex = (c + r + level) % colors.length;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = colors[colorIndex];
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText(`Score: ${score}`, 8, 20);
}

function drawLives() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText(`Lives: ${lives}`, canvas.width - 65, 20);
}

function drawLevel() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText(`Level: ${level}`, canvas.width / 2 - 30, 20);
}

function collisionDetection() {
  const brickWidth = Math.max(30, 75 - level * 5);
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
          dy = -dy;
          b.status = 0;
          score++;
          if (score === brickRowCount * brickColumnCount) {
            level++;
            alert(`Level ${level}! Get ready!`);
            resetGameState();
          }
        }
      }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall();
  drawPaddle();
  drawBricks();
  drawScore();
  drawLives();
  drawLevel();
  collisionDetection();

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }
  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (y + dy > canvas.height - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy;
    } else {
      lives--;
      if (!lives) {
        alert("GAME OVER");
        document.location.reload();
      } else {
        resetGameState();
      }
    }
  }

  if (mouseX !== null) {
    paddleX = Math.min(Math.max(mouseX - paddleWidth / 2, 0), canvas.width - paddleWidth);
  } else {
    if (rightPressed) {
      paddleX = Math.min(paddleX + 7, canvas.width - paddleWidth);
    } else if (leftPressed) {
      paddleX = Math.max(paddleX - 7, 0);
    }
  }

  x += dx;
  y += dy;
  requestAnimationFrame(draw);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
});

document.getElementById("runButton").addEventListener("click", function () {
  level = 1; 
  score = 0;
  lives = 3;
  resetGameState();
  draw();
  this.disabled = true;
});
