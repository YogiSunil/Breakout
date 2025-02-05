document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    let level = 1;
    let isGameRunning = false;
    let bricksMoving = false;
    let rightPressed = false;
    let leftPressed = false;

    class Ball {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = canvas.width / 2;
            this.y = canvas.height - 30;
            this.radius = 10;
            this.color = "red";
            this.dx = 2 + level;
            this.dy = -2 - level;
        }

        render(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }

        move(canvas, paddle) {
            this.x += this.dx;
            this.y += this.dy;

            if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
                this.dx = -this.dx;
            }

            if (this.y - this.radius < 0) {
                this.dy = -this.dy;
            }

            if (this.y + this.radius > paddle.y &&
                this.x > paddle.x && this.x < paddle.x + paddle.width) {
                this.dy = -this.dy;
            }

            if (this.y + this.radius > canvas.height) {
                lives.loseLife();
                if (lives.lives === 0) {
                    alert("Game Over! Try again.");
                    document.location.reload();
                } else {
                    this.reset();
                }
            }
        }
    }

    class Paddle {
        constructor() {
            this.width = 80 - level * 3;
            this.height = 10;
            this.x = (canvas.width - this.width) / 2;
            this.y = canvas.height - this.height - 10;
            this.color = "blue";
            this.speed = 7 + level;
        }

        render(ctx) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        moveWithMouse(mouseX) {
            this.x = mouseX - this.width / 2;
            this.checkBounds();
        }

        moveWithKeyboard() {
            if (rightPressed && this.x + this.width < canvas.width) {
                this.x += this.speed;
            }
            if (leftPressed && this.x > 0) {
                this.x -= this.speed;
            }
        }

        checkBounds() {
            if (this.x < 0) this.x = 0;
            if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
        }
    }

    class Brick {
        constructor(x, y, width, height, color, speed = 0) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.color = color;
            this.status = true;
            this.speed = speed;
            this.direction = 1;
        }

        render(ctx) {
            if (this.status) {
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        }

        move() {
            if (this.status && this.speed > 0) {
                this.x += this.speed * this.direction;

                // **Keep bricks inside canvas**
                if (this.x <= 0 || this.x + this.width >= canvas.width) {
                    this.direction *= -1;
                }
            }
        }
    }
// Score class
    class Score {
        constructor() {
            this.score = 0;
        }

        render(ctx) {
            ctx.fillStyle = "black";
            ctx.font = "16px Arial";
            ctx.fillText(`Score: ${this.score}`, 10, 20);
        }

        update(points) {
            this.score += points;
        }
    }
// Lives class 
    class Lives {
        constructor() {
            this.lives = 3;
        }

        render(ctx) {
            ctx.fillStyle = "black";
            ctx.font = "16px Arial";
            ctx.fillText(`Lives: ${this.lives}`, canvas.width - 80, 20);
        }

        loseLife() {
            this.lives -= 1;
        }
    }

    let ball = new Ball();
    let paddle = new Paddle();
    let score = new Score();
    let lives = new Lives();
    let bricks = [];

    function createBricks() {
        bricks = [];
        const rows = Math.max(3, 5 - level);
        const cols = Math.max(5, 8 - level);
        const brickWidth = Math.floor(Math.random() * 30) + 40;
        const brickHeight = Math.floor(Math.random() * 10) + 20;
        const brickPadding = 10;
        const offsetTop = 30;
        const offsetLeft = 20;

        for (let c = 0; c < cols; c++) {
            bricks[c] = [];
            for (let r = 0; r < rows; r++) {
                let x = c * (brickWidth + brickPadding) + offsetLeft;
                let y = r * (brickHeight + brickPadding) + offsetTop;
                let speed = level > 2 ? 1 + Math.random() * level : 0;
                bricks[c][r] = new Brick(x, y, brickWidth, brickHeight, "green", speed);
            }
        }

        bricksMoving = level >= 3;
    }
    createBricks();

    function drawBricks() {
        bricks.forEach(column => column.forEach(brick => {
            brick.render(ctx);
            if (bricksMoving) brick.move();
        }));
    }

    function checkBrickCollision() {
        let bricksRemaining = 0;
        bricks.forEach(column => {
            column.forEach(brick => {
                if (brick.status) {
                    bricksRemaining++;
                    if (
                        ball.x > brick.x &&
                        ball.x < brick.x + brick.width &&
                        ball.y > brick.y &&
                        ball.y < brick.y + brick.height
                    ) {
                        ball.dy = -ball.dy;
                        brick.status = false;
                        score.update(10);
                    }
                }
            });
        });

        if (bricksRemaining === 0) {
            level++;
            alert(`Level ${level}! Bricks are moving faster now!`);
            ball.reset();
            createBricks();
        }
    }

    function gameLoop() {
        if (!isGameRunning) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ball.render(ctx);
        ball.move(canvas, paddle);
        paddle.moveWithKeyboard();
        paddle.render(ctx);
        drawBricks();
        checkBrickCollision();
        score.render(ctx);
        lives.render(ctx);
        requestAnimationFrame(gameLoop);
    }

    document.addEventListener("mousemove", event => {
        const rect = canvas.getBoundingClientRect();
        paddle.moveWithMouse(event.clientX - rect.left);
    });

    document.addEventListener("keydown", event => {
        if (event.key === "ArrowRight") rightPressed = true;
        if (event.key === "ArrowLeft") leftPressed = true;
    });

    document.addEventListener("keyup", event => {
        if (event.key === "ArrowRight") rightPressed = false;
        if (event.key === "ArrowLeft") leftPressed = false;
    });

    document.getElementById("runButton").addEventListener("click", () => {
        if (!isGameRunning) {
            isGameRunning = true;
            gameLoop();
        }
    });
});
