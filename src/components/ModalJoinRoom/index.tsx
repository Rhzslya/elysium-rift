import React, { FC, useEffect } from "react";

type ModalJoinRoomProps = {
  playerName: string;
  roomCode: string;
  setPlayerName: React.Dispatch<React.SetStateAction<string>>;
  setRoomCode: React.Dispatch<React.SetStateAction<string>>;
  setShowJoinModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleJoin: () => void;
  message: string;
};

const ModalJoinRoom: FC<ModalJoinRoomProps> = ({
  playerName,
  roomCode,
  setPlayerName,
  setRoomCode,
  setShowJoinModal,
  handleJoin,
  message,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="relative bg-gray-800 p-6 rounded-xl shadow-xl w-80">
        {message && (
          <div className="absolute rounded-md px-2 py-1 bg-red-400 w-full left-0 -top-10">
            <p className="text-white text-md text-center">{message}</p>
          </div>
        )}

        <h2 className="text-xl font-semibold mb-4 text-white">Join a Room</h2>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          className="w-full px-4 py-2 rounded bg-gray-700 text-white mb-4 outline-none focus:ring-2 focus:ring-amber-500"
        />
        <input
          type="text"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          placeholder="Enter room code"
          className="w-full px-4 py-2 rounded bg-gray-700 text-white mb-4 outline-none focus:ring-2 focus:ring-amber-500"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowJoinModal(false)}
            className="text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            className="bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded font-bold"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalJoinRoom;
