import React from "react";
import { Clipboard, DoorOpen } from "lucide-react";

interface RoomControlsProps {
  copied?: boolean;
  handleCopyRoomId: () => void;
  countdown?: number | null;
  handleReady: () => void;
  isReady?: boolean;
  handleExitRoom: () => void;
}

const RoomControls: React.FC<RoomControlsProps> = ({
  copied = false,
  handleCopyRoomId,
  countdown = 0,
  handleReady,
  isReady = false,
  handleExitRoom,
}) => {
  return (
    <div className="col-start-2 row-start-4 btn-box flex justify-center items-center gap-4 text-base">
      {/* ROOM CODE BUTTON */}
      <div className="room-code-btn relative w-full">
        {copied && (
          <div className="absolute w-full h-full -top-full flex justify-center items-center text-white font-medium text-xs transition-opacity">
            <span>Code Copied</span>
          </div>
        )}
        <button
          onClick={handleCopyRoomId}
          className="cursor-pointer w-full bg-neutral-500 hover:bg-neutral-600 px-6 py-2 text-white font-semibold transition-colors duration-300"
        >
          <Clipboard className="inline mb-1 mr-2 font-bold" size={18} />
          ROOM CODE
        </button>
      </div>

      {/* READY BUTTON */}
      <div className="ready-btn relative w-full flex justify-center items-center">
        <div className="absolute inset-0 -top-1 -left-1 -right-1 -bottom-1 border-neutral-100 border"></div>

        {countdown !== 0 && (
          <button
            onClick={handleReady}
            aria-pressed={isReady}
            className={`relative w-full cursor-pointer px-8 py-4 z-10 border-2 border-transparent text-white font-semibold transition-colors duration-300
              ${
                isReady
                  ? "bg-neutral-300 hover:bg-neutral-500"
                  : "bg-neutral-400 hover:bg-neutral-300"
              }`}
          >
            {isReady ? "CANCEL" : "READY"}
          </button>
        )}
      </div>

      {/* EXIT BUTTON */}
      <div className="exit-btn w-full">
        <button
          onClick={handleExitRoom}
          className="cursor-pointer w-full bg-neutral-500 hover:bg-neutral-600 px-2 py-2 text-white font-semibold transition-colors duration-300"
        >
          LEAVE ROOM
          <DoorOpen className="inline mb-1 ml-2 font-bold" size={18} />
        </button>
      </div>
    </div>
  );
};

export default RoomControls;
