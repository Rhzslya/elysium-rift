// server.mts
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
import { Player } from "./utils/Type/index.js";
import { getPlayersFromRoom } from "./utils/GetPlayersFromRoom/index.js";
import { removePlayerFromRoom } from "./utils/RemovePlayerFromRoom/index.js";
import { updatePlayersList } from "./utils/UpdatePlayerList/index.js";
import { allPlayersReady } from "./utils/AllPlayersReady/index.js";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handle);
  const io = new Server(httpServer);

  const roomStates: {
    [roomId: string]: {
      players?: Player[];
      countdownTimer?: NodeJS.Timeout;
      autoAssignTimeout?: NodeJS.Timeout;
      gameStarted?: boolean;
    };
  } = {};

  io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    socket.on("check-room", (roomId, callback) => {
      const gameStarted = roomStates[roomId]?.gameStarted ?? false;

      if (gameStarted) {
        console.log(`Room ${roomId} already started.`);
        callback(false, true);
        return;
      }

      const room = io.sockets.adapter.rooms.get(roomId);
      if (room) {
        console.log(`Room ${roomId} exists.`);
        callback(true, false);
      } else {
        console.log(`Room ${roomId} not found.`);
        callback(false, false);
      }
    });

    socket.on("join-room", ({ roomId, username, userId }, callback) => {
      const socketsInRoom = io.sockets.adapter.rooms.get(roomId);

      if (socketsInRoom) {
        for (const socketId of socketsInRoom) {
          const existingSocket = io.sockets.sockets.get(socketId);
          if (existingSocket?.data.userId === userId) {
            console.warn(
              `Duplicate userId detected: ${userId} already in room ${roomId}`
            );
            callback?.({
              success: false,
              reason: "User already joined in this room",
            });
            return;
          }
        }
      }

      // Join user ke room
      socket.join(roomId);
      socket.data.roomId = roomId; // tambahkan roomId ke data socket
      socket.data.userId = userId;
      socket.data.username = username;
      socket.data.isReady = false;

      console.log(`Incoming join-room:`, {
        userId,
        roomId,
        socketId: socket.id,
      });

      if (roomStates[roomId]?.countdownTimer) {
        clearInterval(roomStates[roomId].countdownTimer);
        roomStates[roomId].countdownTimer = undefined;
        io.to(roomId).emit("countdown", null);
        io.to(roomId).emit("temp-message", {
          message: `${username} joined. Countdown canceled.`,
        });
      }

      console.log(
        `User ${username} joined room ${roomId} with userId ${userId}`
      );

      const players = updatePlayersList(io, roomId);
      io.to(roomId).emit("update-players", players);
      console.log(`Player List: ${players.map((p) => p.username).join(",")}`);
      socket.to(roomId).emit("user-joined", `${username} has joined the game.`);
      callback?.({ success: true });
    });

    socket.on("message", ({ message, roomId, sender }) => {
      console.log(`Message from ${sender} in room ${roomId}: ${message}`);
      socket.to(roomId).emit("message", { sender, message });
    });

    socket.on("player-ready", ({ roomId, username, isReady }) => {
      const room = io.sockets.adapter.rooms.get(roomId);
      if (!room || room.size < 2) {
        socket.emit("temp-message", {
          message: "Minimum 2 players required in the room.",
        });
        return;
      }

      socket.data.isReady = isReady;

      console.log(`${username} is now ${isReady ? "ready" : "not ready"}`);

      const players = getPlayersFromRoom(io, roomId);
      io.to(roomId).emit("update-players", players);

      if (allPlayersReady(io, roomId) && !roomStates[roomId]?.countdownTimer) {
        console.log(
          `All Players in Room ${roomId} are ready. Starting Countdown.`
        );

        if (!roomStates[roomId]) {
          roomStates[roomId] = {};
        }

        let countdown = 5;
        io.to(roomId).emit("countdown", countdown);

        const timer = setInterval(() => {
          countdown--;
          io.to(roomId).emit("countdown", countdown);

          if (countdown <= 0) {
            clearInterval(timer);
            roomStates[roomId].countdownTimer = undefined;

            roomStates[roomId].gameStarted = true;

            io.to(roomId).emit("start-game");
            console.log(`Game started in room ${roomId}`);
          }
        }, 1000);

        roomStates[roomId].countdownTimer = timer;
      }
    });

    socket.on("exit-room", (roomId, username) => {
      socket.data.isReady = false;

      socket.leave(roomId);

      if (roomStates[roomId]?.countdownTimer) {
        clearInterval(roomStates[roomId].countdownTimer);
        roomStates[roomId].countdownTimer = undefined;

        io.to(roomId).emit("countdown", null);
        io.to(roomId).emit("temp-message", {
          message: `${username} has left. Countdown canceled.`,
        });
      }

      updatePlayersList(io, roomId, true);

      console.log(`User ${username} left room ${roomId}`);
      io.to(roomId).emit("user-left", `${username} has left room.`);
    });

    socket.on("disconnect", (reason) => {
      const { userId, username, roomId } = socket.data;
      if (roomId && userId) {
        console.log(
          `User ${username} (${userId}) disconnected. Removing from room ${roomId}`
        );

        // Hapus player dari roomStates
        removePlayerFromRoom(roomStates, roomId, userId);

        console.log("Socket disconnected:", socket.id, reason);

        // Emit update ke semua player di room
        const players = updatePlayersList(io, roomId);
        io.to(roomId).emit("update-players", players);
        socket.to(roomId).emit("user-left", `${username} has left the game.`);
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
