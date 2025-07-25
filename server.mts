// server.mts
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
import { Player } from "./src/utils/Type/index.js";
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

    const removePlayerFromRoom = (roomId: string, userId: string) => {
      const room = roomStates[roomId];
      if (!room || !room.players) return;

      const idx = room.players.findIndex((p) => p.userId === userId);
      if (idx !== -1) {
        room.players.splice(idx, 1);
      }
    };

    const updatePlayersList = (roomId: string, resetReady = false) => {
      const room = io.sockets.adapter.rooms.get(roomId);
      if (!room) return [];

      const players = Array.from(room)
        .map((socketId) => {
          const player = io.sockets.sockets.get(socketId);
          if (!player) return null;

          if (resetReady) player.data.isReady = false;

          return {
            userId: player.data.userId,
            username: player.data.username,
            isReady: player.data.isReady || false,
            roles: player.data.roles || null,
            roleSelected: player.data.roleSelected || false,
          };
        })
        .filter(
          (player): player is NonNullable<typeof player> => player !== null
        );

      io.to(roomId).emit("update-players", players);

      console.log(
        `Players in room ${roomId}: ${players.map((p) => p.username).join(",")}`
      );

      return players;
    };

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

      const players = updatePlayersList(roomId);
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
          message: "Cannot ready up: Minimum 2 players required in the room.",
        });
        return;
      }

      socket.data.isReady = isReady;

      console.log(`${username} is now ${isReady ? "ready" : "not ready"}`);

      const players = getPlayersFromRoom(roomId);
      io.to(roomId).emit("update-players", players);

      if (allPlayersReady(roomId)) {
        io.to(roomId).emit("game-started", true);
      }
    });

    function getPlayersFromRoom(roomId: string) {
      const room = io.sockets.adapter.rooms.get(roomId);
      if (!room) return [];
      return Array.from(room).map((socketId) => {
        const playerSocket = io.sockets.sockets.get(socketId);
        return {
          userId: playerSocket?.data.userId,
          username: playerSocket?.data.username,
          isReady: playerSocket?.data.isReady || false,
          roles: playerSocket?.data.roles || null,
        };
      });
    }

    const allPlayersReady = (roomId: string): boolean => {
      const socketsInRoom = io.sockets.adapter.rooms.get(roomId);
      if (!socketsInRoom) return false;

      for (const socketId of socketsInRoom) {
        const socket = io.sockets.sockets.get(socketId);
        if (!socket?.data.isReady) return false;
      }

      return true;
    };

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

      updatePlayersList(roomId, true);

      console.log(`User ${username} left room ${roomId}`);
      io.to(roomId).emit("user-left", `${username} has left room.`);
    });

    socket.on("disconnect", () => {
      const { userId, username, roomId } = socket.data;
      if (roomId && userId) {
        console.log(
          `User ${username} (${userId}) disconnected. Removing from room ${roomId}`
        );

        // Hapus player dari roomStates
        removePlayerFromRoom(roomId, userId);

        // Emit update ke semua player di room
        const players = updatePlayersList(roomId);
        io.to(roomId).emit("update-players", players);
        socket.to(roomId).emit("user-left", `${username} has left the game.`);
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
