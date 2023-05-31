const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static(__dirname + "/public"));

const players = {};

io.on("connection", (socket) => {
  console.log("Neuer Spieler verbunden");

  // Neuen Spieler initialisieren
  players[socket.id] = {
    x: 0,
    y: 0,
    width: 20,
    height: 20,
    color: getRandomColor(),
  };

  // Spielerbewegung aktualisieren
  socket.on("keydown", (key) => {
    handlePlayerMovement(socket.id, key, true);
  });

  socket.on("keyup", (key) => {
    handlePlayerMovement(socket.id, key, false);
  });

  // Aktualisiere den Spielzustand und sende ihn an alle Spieler
  socket.on("update", (player) => {
    players[socket.id] = player;
    io.emit("state", players);
  });

  socket.on("disconnect", () => {
    console.log("Spieler getrennt");
    delete players[socket.id];
    io.emit("state", players);
  });

  // Zufällige Farbe generieren
  function getRandomColor() {
    const colors = ["red", "green", "blue", "orange", "purple", "pink"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Spielerbewegung verarbeiten
  function handlePlayerMovement(playerId, key, isKeyDown) {
    const player = players[playerId];

    switch (key) {
      case "ArrowUp":
        player.y -= isKeyDown ? 5 : 0;
        break;
      case "ArrowDown":
        player.y += isKeyDown ? 5 : 0;
        break;
      case "ArrowLeft":
        player.x -= isKeyDown ? 5 : 0;
        break;
      case "ArrowRight":
        player.x += isKeyDown ? 5 : 0;
        break;
    }
  }
});

http.listen(3000, () => {
  console.log("Server gestartet auf http://localhost:3000");
});
