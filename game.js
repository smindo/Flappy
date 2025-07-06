const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let frames = 0;
const gravity = 0.25;
const jump = 4.6;
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;
let pipes = [];
let gameOver = false;

const bird = {
  x: 50,
  y: 150,
  size: 30,
  velocity: 0,
  color: "#FFD700",
  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size / 2, 0, Math.PI * 2);
    ctx.fill();

    // თვალი
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(this.x + 20, this.y + 10, 3, 0, Math.PI * 2);
    ctx.fill();
  },
  update() {
    this.velocity += gravity;
    this.y += this.velocity;

    if (this.y + this.size >= canvas.height) {
      setGameOver();
    }
  },
  flap() {
    this.velocity = -jump;
  },
  reset() {
    this.y = 150;
    this.velocity = 0;
  }
};

function createPipe() {
  const topHeight = Math.floor(Math.random() * 250) + 50;
  const gap = 140;
  pipes.push({
    x: canvas.width,
    topY: 0,
    topH: topHeight,
    bottomY: topHeight + gap,
    bottomH: canvas.height - topHeight - gap
  });
}

function drawPipes() {
  pipes.forEach(pipe => {
    ctx.fillStyle = "#2ecc71";
    ctx.strokeStyle = "#27ae60";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.roundRect(pipe.x, pipe.topY, 60, pipe.topH, [10]);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(pipe.x, pipe.bottomY, 60, pipe.bottomH, [10]);
    ctx.fill();
    ctx.stroke();
  });
}

function updatePipes() {
  pipes.forEach(pipe => {
    pipe.x -= 2;

    if (
      bird.x < pipe.x + 60 &&
      bird.x + bird.size > pipe.x &&
      (bird.y < pipe.topH || bird.y + bird.size > pipe.bottomY)
    ) {
      setGameOver();
    }

    if (pipe.x + 60 === bird.x) {
      score++;
      if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore);
      }
    }
  });

  pipes = pipes.filter(pipe => pipe.x + 60 > 0);
}

function drawScore() {
  ctx.fillStyle = "#444";
  ctx.font = "bold 24px Arial";
  ctx.fillText("Score: " + score, 20, 40);
  ctx.fillText("Best: " + bestScore, 20, 70);
}

function drawGameOverScreen() {
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 36px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, 200);

  ctx.font = "24px Arial";
  ctx.fillText(`Score: ${score}`, canvas.width / 2, 250);
  ctx.fillText(`Best: ${bestScore}`, canvas.width / 2, 290);

  ctx.font = "20px Arial";
  ctx.fillText("Press SPACE to restart", canvas.width / 2, 350);
  ctx.textAlign = "start";
}

function drawClouds() {
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  ctx.arc(80, 80, 25, 0, Math.PI * 2);
  ctx.arc(100, 80, 30, 0, Math.PI * 2);
  ctx.arc(130, 80, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(250, 100, 20, 0, Math.PI * 2);
  ctx.arc(270, 100, 30, 0, Math.PI * 2);
  ctx.arc(300, 100, 25, 0, Math.PI * 2);
  ctx.fill();
}

function resetGame() {
  score = 0;
  pipes = [];
  bird.reset();
  frames = 0;
  gameOver = false;
}

function setGameOver() {
  gameOver = true;
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawClouds();

  if (!gameOver) {
    frames++;
    if (frames % 90 === 0) {
      createPipe();
    }

    bird.update();
    bird.draw();
    updatePipes();
    drawPipes();
    drawScore();
  } else {
    drawPipes();
    bird.draw();
    drawScore();
    drawGameOverScreen();
  }

  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", function (e) {
  if (e.code === "Space") {
    if (gameOver) {
      resetGame();
    } else {
      bird.flap();
    }
  }
});

// CanvasHelper: დამატებითი ფუნქცია მრგვალი კუთხებისთვის
CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
  if (typeof radius === 'number') radius = [radius];
  this.beginPath();
  this.moveTo(x + radius[0], y);
  this.lineTo(x + width - radius[0], y);
  this.quadraticCurveTo(x + width, y, x + width, y + radius[0]);
  this.lineTo(x + width, y + height - radius[0]);
  this.quadraticCurveTo(x + width, y + height, x + width - radius[0], y + height);
  this.lineTo(x + radius[0], y + height);
  this.quadraticCurveTo(x, y + height, x, y + height - radius[0]);
  this.lineTo(x, y + radius[0]);
  this.quadraticCurveTo(x, y, x + radius[0], y);
  this.closePath();
};

gameLoop();
