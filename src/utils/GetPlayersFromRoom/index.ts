import { Server } from "socket.io";
import { Player } from "@/utils/Type";

export const getPlayersFromRoom = (io: Server, roomId: string): Player[] => {
  const room = io.sockets.adapter.rooms.get(roomId);
  if (!room) return [];

  return Array.from(room).map((socketId) => {
    const playerSocket = io.sockets.sockets.get(socketId);
    return {
      userId: playerSocket?.data.userId,
      username: playerSocket?.data.username,
      isReady: playerSocket?.data.isReady || false,
      role: playerSocket?.data.role || null,
    };
  });
};
