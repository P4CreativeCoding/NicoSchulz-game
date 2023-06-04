const express = require("express");
const app = express();
// const server = require("http").createServer(app);
// const io = require("socket.io")(server);
const port = process.env.PORT || 3000;
app.use(express.static(__dirname + "/public"));
// server.js
const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080 });

const players = new Set();

server.on("connection", (socket) => {
  console.log("Client connected.");

  // Füge den neuen Spieler zur Liste hinzu
  players.add(socket);

  // Sende die aktuelle Liste der Spieler an den neuen Spieler
  const playerList = Array.from(players).map((player) => player.playerId);
  socket.send(JSON.stringify({ type: "playerList", data: playerList }));

  // Sende die Information über den neu verbundenen Spieler an alle anderen Spieler
  const playerId = generatePlayerId();
  socket.playerId = playerId;
  broadcastToOtherPlayers(socket, { type: "playerConnected", data: playerId });

  socket.on("message", (message) => {
    const parsedMessage = JSON.parse(message);

    switch (parsedMessage.type) {
      case "playerPosition":
        // Sende die Position des Spielers an alle anderen Spieler
        broadcastToOtherPlayers(socket, {
          type: "playerPosition",
          data: parsedMessage.data,
        });
        break;
      case "playerDisconnected":
        // Entferne den Spieler aus der Liste
        players.delete(socket);

        // Sende die Information über den abgetrennten Spieler an alle anderen Spieler
        broadcastToOtherPlayers(socket, {
          type: "playerDisconnected",
          data: socket.playerId,
        });
        break;
    }
  });

  socket.on("close", () => {
    console.log("Client disconnected.");

    // Entferne den Spieler aus der Liste
    players.delete(socket);

    // Sende die Information über den abgetrennten Spieler an alle anderen Spieler
    broadcastToOtherPlayers(socket, {
      type: "playerDisconnected",
      data: socket.playerId,
    });
  });
});

function broadcastToOtherPlayers(sender, message) {
  Array.from(players)
    .filter((player) => player !== sender)
    .forEach((player) => player.send(JSON.stringify(message)));
}

function generatePlayerId() {
  return Math.random().toString(36).substr(2, 9);
}

app.listen(port, function () {
  console.log(`App listening on port: ${port}`);
});
