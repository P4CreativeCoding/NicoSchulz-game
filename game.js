window.onload = function () {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const canvasWidth = 2000; // Spielfeldbreite
  const canvasHeight = 1000; // Spielfeldhöhe

  const player = {
    x: canvasWidth / 2,
    y: canvasHeight / 2,
    radius: 20,
    color: "blue",
    speed: 2,
    health: 100,
    score: 0,
    bulletSpeed: 8,
    lastShotTime: 0,
    isGameOver: false, // Neue Eigenschaft für Game Over-Status
    update: function () {
      if (this.isGameOver) {
        return; // Spieler kann sich nicht bewegen, wenn das Spiel vorbei ist
      }

      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const angle = Math.atan2(dy, dx);
      this.x += Math.cos(angle) * this.speed;
      this.y += Math.sin(angle) * this.speed;

      // Begrenzung des Spielers innerhalb des Spielfelds
      if (this.x < this.radius) {
        this.x = this.radius;
      }
      if (this.x > canvasWidth - this.radius) {
        this.x = canvasWidth - this.radius;
      }
      if (this.y < this.radius) {
        this.y = this.radius;
      }
      if (this.y > canvasHeight - this.radius) {
        this.y = canvasHeight - this.radius;
      }
    },
    draw: function () {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fill();
    },
    shoot: function () {
      const currentTime = Date.now();
      if (currentTime - this.lastShotTime > 200) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const angle = Math.atan2(dy, dx);

        const bullet = {
          x: this.x,
          y: this.y,
          radius: 5,
          color: "green",
          speed: this.bulletSpeed,
          dx: Math.cos(angle),
          dy: Math.sin(angle),
          update: function () {
            this.x += this.dx * this.speed;
            this.y += this.dy * this.speed;
          },
          draw: function () {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
          },
        };

        bullets.push(bullet);
        this.lastShotTime = currentTime;
      }
    },
  };

  const bullets = [];

  const enemies = [];

  let score = 0;
  let enemyCount = 0;

  let countdown = 3;

  const mouse = {
    x: canvasWidth / 2,
    y: canvasHeight / 2,
  };

  const keyState = {};

  document.addEventListener("keydown", function (event) {
    keyState[event.code] = true;
    if (event.code === "Space") {
      player.shoot();
    }
  });

  document.addEventListener("keyup", function (event) {
    keyState[event.code] = false;
  });

  document.addEventListener("mousemove", function (event) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
  });

  function spawnEnemy() {
    if (enemyCount < 10 && !player.isGameOver) {
      let enemyX, enemyY;
      do {
        enemyX = Math.random() * canvasWidth;
        enemyY = Math.random() * canvasHeight;
      } while (checkPlayerProximity(enemyX, enemyY));

      const enemy = {
        x: enemyX,
        y: enemyY,
        radius: 15,
        color: "red",
        speed: Math.random() * 1 + 0.5,
        update: function () {
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * this.speed;
          this.y += Math.sin(angle) * this.speed;
        },
        draw: function () {
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
          ctx.closePath();
          ctx.fill();
        },
      };

      enemies.push(enemy);
      enemyCount++;
    }
  }

  function update() {
    if (player.isGameOver) {
      gameOver();
      return;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

    player.update();
    player.draw();

    bullets.forEach(function (bullet) {
      bullet.update();
      bullet.draw();

      enemies.forEach(function (enemy) {
        if (checkCollision(bullet, enemy)) {
          bullets.splice(bullets.indexOf(bullet), 1);
          enemies.splice(enemies.indexOf(enemy), 1);
          player.score += 30;
          enemyCount--;
        }
      });

      if (
        bullet.x < 0 ||
        bullet.x > canvasWidth ||
        bullet.y < 0 ||
        bullet.y > canvasHeight
      ) {
        bullets.splice(bullets.indexOf(bullet), 1);
      }
    });

    enemies.forEach(function (enemy) {
      enemy.update();
      enemy.draw();

      if (checkCollision(player, enemy)) {
        player.health -= 10;
        if (player.health <= 0) {
          player.isGameOver = true;
        }
      }
    });

    drawScore();
    drawHealthBar();
    drawEnemyCount();

    requestAnimationFrame(update);
  }

  function drawScore() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Score: " + player.score, 10, 30);
  }

  function drawHealthBar() {
    ctx.fillStyle = "red";
    ctx.fillRect(10, canvasHeight - 30, player.health * 2, 20);
  }

  function drawEnemyCount() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Enemies: " + enemyCount, 10, 60);
  }

  function checkCollision(object1, object2) {
    const dx = object1.x - object2.x;
    const dy = object1.y - object2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < object1.radius + object2.radius) {
      return true;
    }

    return false;
  }

  function gameOver() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.font = "40px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", canvasWidth / 2, canvasHeight / 2 - 20);
    ctx.font = "30px Arial";
    ctx.fillText(
      "Final Score: " + player.score,
      canvasWidth / 2,
      canvasHeight / 2 + 20
    );
  }

  function checkPlayerProximity(x, y) {
    const dx = player.x - x;
    const dy = player.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < player.radius + 50) {
      return true;
    }

    return false;
  }

  setInterval(spawnEnemy, 1000);

  update();
};
