const socket = io();

const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

// Spielerobjekt
const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  width: 20,
  height: 20,
  color: "blue",
};

// Event-Handler für Tastendrücke
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};

function handleKeyDown(event) {
  if (event.key in keys) {
    event.preventDefault();
    keys[event.key] = true;
    socket.emit("keydown", event.key);
  }
}

function handleKeyUp(event) {
  if (event.key in keys) {
    event.preventDefault();
    keys[event.key] = false;
    socket.emit("keyup", event.key);
  }
}

// Aktualisierung der Spielerposition
function updatePlayerPosition() {
  if (keys.ArrowUp) {
    player.y -= 5;
  }
  if (keys.ArrowDown) {
    player.y += 5;
  }
  if (keys.ArrowLeft) {
    player.x -= 5;
  }
  if (keys.ArrowRight) {
    player.x += 5;
  }
}

// Zeichne den Spielzustand
function drawGameState(players) {
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Zeichne alle Spieler
  for (const playerId in players) {
    const p = players[playerId];
    context.fillStyle = p.color;
    context.fillRect(p.x, p.y, p.width, p.height);
  }
}

// Empfange aktualisierte Spielzustände vom Server
socket.on("state", (players) => {
  drawGameState(players);
});

// Haupt-Update-Schleife
function updateLoop() {
  updatePlayerPosition();
  socket.emit("update", player);
  requestAnimationFrame(updateLoop);
}

// Starte das Spiel
updateLoop();
