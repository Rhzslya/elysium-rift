// server.mts
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
import { roles } from "./src/utils/Roles/index.js";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handle);
  const io = new Server(httpServer);
  const roomStates: {
    [roomId: string]: {
      countdownTimer?: NodeJS.Timeout;
      gameStarted: boolean;
    };
  } = {};

  io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    const updatePlayersList = (roomId: string, resetReady = false) => {
      const room = io.sockets.adapter.rooms.get(roomId);
      if (!room) return;

      const players = Array.from(room)
        .map((id) => {
          const player = io.sockets.sockets.get(id);
          if (!player) return undefined;

          if (resetReady) player.data.isReady = false;

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
    };

    socket.on("check-room", (roomId, callback) => {
      const gameStarted = roomStates[roomId]?.gameStarted ?? false;

      if (gameStarted) {
        console.log(`Room ${roomId} already started.`);
        callback(false, true); // Room exists but game already started
        return;
      }

      const room = io.sockets.adapter.rooms.get(roomId);
      if (room) {
        console.log(`Room ${roomId} exists.`);
        callback(true, false); // Room exists and not started
      } else {
        console.log(`Room ${roomId} not found.`);
        callback(false, false); // Room doesn't exist
      }
    });

    socket.on("join-room", ({ roomId, username }) => {
      if (socket.rooms.has(roomId)) {
        return; // sudah join, tidak perlu proses lagi
      }
      socket.join(roomId);
      socket.data.username = username;
      socket.data.isReady = false;

      if (roomStates[roomId]?.countdownTimer) {
        clearInterval(roomStates[roomId].countdownTimer);
        roomStates[roomId].countdownTimer = undefined;

        io.to(roomId).emit("countdown", null);
        io.to(roomId).emit("message", {
          sender: "systemBattleLogs",
          message: `${username} joined. Countdown canceled.`,
        });
      }

      console.log(`User ${username} joined room ${roomId}`);

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
            roles: [],
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

    socket.on("game-start", ({ roomId, isReady, countdown }) => {
      socket.data.isReady = isReady;

      console.log(`Game Start in room ${roomId} with countdown ${countdown}`);
      const room = io.sockets.adapter.rooms.get(roomId);
      if (room) {
        const players = Array.from(room).map((id) => {
          const playerSocket = io.sockets.sockets.get(id);
          return {
            username: playerSocket?.data.username,
            isReady: playerSocket?.data.isReady || false,
            roles: [],
          };
        });

        const allReady = players.every((player) => player.isReady);
        console.log(`All Player Ready: ${allReady}`);

        io.to(roomId).emit("update-players", players);

        if (players.length > 1 && allReady) {
          if (!roomStates[roomId]) {
            roomStates[roomId] = { gameStarted: false };
          }

          if (roomStates[roomId].countdownTimer) return;

          let countdown = 5;
          io.sockets.emit("countdown", countdown);

          const countdownInterval = setInterval(() => {
            countdown -= 1;
            io.to(roomId).emit("countdown", countdown);

            if (countdown <= 0) {
              clearInterval(countdownInterval);
              roomStates[roomId].countdownTimer = undefined;
              roomStates[roomId].gameStarted = true;
              io.to(roomId).emit("game-started", true);

              //Kirimkan list Role yang dapat dipilih Player
              io.to(roomId).emit("choose-role-phase", roles);
            }
          }, 1000);

          roomStates[roomId].countdownTimer = countdownInterval;

          socket.emit("ready-status-updated", { isReady: true });
        } else if (players.length <= 1) {
          console.log(
            `Cannot Ready because there are one player in room ${roomId}`
          );

          socket.emit("not-enough-players", {
            message: "You can't ready up. Not enough players in the room.",
          });

          socket.emit("ready-status-updated", { isReady: false });
        } else {
          // Jika ada yang batal siap, batalkan countdown
          if (roomStates[roomId]?.countdownTimer) {
            clearInterval(roomStates[roomId].countdownTimer);
            roomStates[roomId].countdownTimer = undefined;

            io.to(roomId).emit("countdown", null); // Reset countdown di client
            io.to(roomId).emit("message", {
              sender: "systemBattleLogs",
              message: "A player is not ready. Countdown canceled.",
            });
          }

          socket.emit("ready-status-updated", { isReady });
        }
      }
    });

    socket.on("exit-room", (roomId, username) => {
      socket.data.isReady = false;

      socket.leave(roomId);

      setTimeout(() => {
        // kasih delay dikit biar socket.leave selesai
        updatePlayersList(roomId, true);
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
