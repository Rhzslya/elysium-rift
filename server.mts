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

    // Fungsi untuk update daftar pemain di semua user dalam room
    const updatePlayersList = (roomId: string) => {
      const room = io.sockets.adapter.rooms.get(roomId);
      if (room) {
        const players = Array.from(room).map((id) => {
          const player = io.sockets.sockets.get(id);
          return player?.data.username; // Mengakses username dari socket.data
        });
        io.to(roomId).emit("update-players", players); // Kirim daftar pemain ke semua yang ada di room
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

    socket.on("join-room", (roomId: string, username: string) => {
      socket.join(roomId);
      console.log(`User ${username} joined room ${roomId}`);

      socket.data.username = username;

      updatePlayersList(roomId);

      socket.to(roomId).emit("user-joined", { username });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
