import { Server } from "socket.io";

export const updatePlayersList = (
  io: Server,
  roomId: string,
  resetReady = false
) => {
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
    .filter((player): player is NonNullable<typeof player> => player !== null);

  io.to(roomId).emit("update-players", players);

  console.log(
    `Players in room ${roomId}: ${players.map((p) => p.username).join(",")}`
  );

  return players;
};
