import React from "react";
import { Clipboard } from "lucide-react";

const TitleRoom = ({ roomId }: { roomId?: string }) => {
  const handleCopyRoomId = () => {
    if (typeof roomId === "string") {
      navigator.clipboard.writeText(roomId);
    }
  };
  return (
    <div className="title col-start-2 row-start-1 flex flex-col items-center justify-center text-center">
      <div className="box-title">
        <h1 className="text-2xl font-bold text-amber-500 mb-2">Elysium Rift</h1>
      </div>
      {typeof roomId === "string" && (
        <div
          className="roomId cursor-pointer flex justify-center items-center gap-x-1 text-gray-400 group"
          onClick={handleCopyRoomId}
        >
          <h2 className="text-sm ">Room Code : {roomId}</h2>
          <Clipboard className="w-5 h-5 group-hover:text-gray-300 duration-300" />
        </div>
      )}
      {typeof roomId !== "string" && <div>Loading Room Code...</div>}
    </div>
  );
};

export default TitleRoom;
