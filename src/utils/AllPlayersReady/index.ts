import { Server } from "socket.io";

export const allPlayersReady = (io: Server, roomId: string): boolean => {
  const socketsInRoom = io.sockets.adapter.rooms.get(roomId);
  if (!socketsInRoom) return false;

  for (const socketId of socketsInRoom) {
    const socket = io.sockets.sockets.get(socketId);
    if (!socket?.data.isReady) return false;
  }

  return true;
};
