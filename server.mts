// server.mts
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handle);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    const updatePlayersList = (roomId: string) => {
      const room = io.sockets.adapter.rooms.get(roomId);
      if (room) {
        const players = Array.from(room)
          .map((id) => {
            const player = io.sockets.sockets.get(id);
            return {
              username: player?.data.username,
              isReady: player?.data.isReady || false,
            };
          })
          .filter((username) => username !== undefined);

        io.to(roomId).emit("update-players", players);

        console.log(
          `Players in room ${roomId}: ${players.map((p) => p.username)}`
        );

        return players;
      }
    };

    socket.on("check-room", (roomId, callback) => {
      const room = io.sockets.adapter.rooms.get(roomId);
      if (room) {
        console.log(`Room ${roomId} exists.`);
        callback(true);
      } else {
        console.log(`Room ${roomId} not found.`);
        callback(false); // Room tidak ada
      }
    });

    socket.on("join-room", ({ roomId, username }) => {
      if (socket.rooms.has(roomId)) {
        return; // sudah join, tidak perlu proses lagi
      }
      socket.join(roomId);

      console.log(`User ${username} joined room ${roomId}`);

      socket.data.username = username;

      const players = updatePlayersList(roomId);

      socket.to(roomId).emit("update-players", players);

      socket.to(roomId).emit("user-joined", `${username} has joined the game.`);
    });

    socket.on("message", ({ message, roomId, sender }) => {
      console.log(`Message from ${sender} in room ${roomId}: ${message}`);
      socket.to(roomId).emit("message", { sender, message });
    });

    socket.on("player-ready", ({ roomId, username, isReady }) => {
      socket.data.isReady = isReady;

      const room = io.sockets.adapter.rooms.get(roomId);
      if (room) {
        const players = Array.from(room).map((id) => {
          const playerSocket = io.sockets.sockets.get(id);
          return {
            username: playerSocket?.data.username,
            isReady: playerSocket?.data.isReady || false,
          };
        });

        io.to(roomId).emit("update-players", players);
        console.log(
          `${username} is now ${
            isReady ? "ready" : "not ready"
          } in room ${roomId}`
        );
      }
    });

    socket.on("exit-room", (roomId, username) => {
      socket.data.isReady = false;

      socket.leave(roomId);

      setTimeout(() => {
        // kasih delay dikit biar socket.leave selesai
        updatePlayersList(roomId);
      }, 0);

      console.log(`User ${username} left room ${roomId}`);
      io.to(roomId).emit("user-left", `${username} has left room.`);
    });

    socket.on("disconnect", () => {
      socket.data.isReady = false;
      console.log("User disconnected", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
