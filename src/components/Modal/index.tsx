import React, { FC } from "react";

type ModalProps = {
  playerName: string;
  setPlayerName: React.Dispatch<React.SetStateAction<string>>;
  setShowStartModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleStart: () => void;
};

const Modal: FC<ModalProps> = ({
  playerName,
  setPlayerName,
  setShowStartModal,
  handleStart,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl shadow-xl w-80">
        <h2 className="text-xl font-semibold mb-4 text-white">
          Enter your name
        </h2>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Player name"
          className="w-full px-4 py-2 rounded bg-gray-700 text-white mb-4 outline-none focus:ring-2 focus:ring-amber-500"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowStartModal(false)}
            className="text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            className="bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded font-bold"
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
