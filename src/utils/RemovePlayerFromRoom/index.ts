import { RoomStates } from "../Type";

export const removePlayerFromRoom = (
  roomStates: RoomStates,
  roomId: string,
  userId: string
) => {
  const room = roomStates[roomId];
  if (!room || !room.players) return;

  const idx = room.players.findIndex((p) => p.userId === userId);
  if (idx !== -1) {
    room.players.splice(idx, 1);
  }
};
