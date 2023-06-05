const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));

const players = new Set();

io.on("connection", (socket) => {
  console.log("Client connected.");

  // Füge den neuen Spieler zur Liste hinzu
  players.add(socket);

  // Sende die aktuelle Liste der Spieler an den neuen Spieler
  const playerList = Array.from(players).map((player) => player.playerId);
  socket.emit(
    "message",
    JSON.stringify({ type: "playerList", data: playerList })
  );

  // Sende die Information über den neu verbundenen Spieler an alle anderen Spieler
  const playerId = generatePlayerId();
  socket.playerId = playerId;
  socket.broadcast.emit(
    "message",
    JSON.stringify({ type: "playerConnected", data: playerId })
  );

  socket.on("message", (message) => {
    const parsedMessage = JSON.parse(message);

    switch (parsedMessage.type) {
      case "playerPosition":
        // Sende die Position des Spielers an alle anderen Spieler
        socket.broadcast.emit(
          "message",
          JSON.stringify({
            type: "playerPosition",
            data: parsedMessage.data,
          })
        );
        break;
      case "playerDisconnected":
        // Entferne den Spieler aus der Liste
        players.delete(socket);

        // Sende die Information über den abgetrennten Spieler an alle anderen Spieler
        socket.broadcast.emit(
          "message",
          JSON.stringify({
            type: "playerDisconnected",
            data: socket.playerId,
          })
        );
        break;
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected.");

    // Entferne den Spieler aus der Liste
    players.delete(socket);

    // Sende die Information über den abgetrennten Spieler an alle anderen Spieler
    socket.broadcast.emit(
      "message",
      JSON.stringify({
        type: "playerDisconnected",
        data: socket.playerId,
      })
    );
  });
});

function generatePlayerId() {
  return Math.random().toString(36).substr(2, 9);
}

http.listen(port, function () {
  console.log(`App listening on port: ${port}`);
});
