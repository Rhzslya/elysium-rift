import { Player } from "@/utils/Type";
import React from "react";

const PlayerRoomCard = ({ players }: { players: Player[] }) => {
  return (
    <div className="col-span-3 row-span-2 row-start-2 bg-neutral-900 rounded-md p-4 shadow-md">
      <div className="box-card rounded-lg p-4 h-full flex flex-col">
        <div className="player-card flex-1 overflow-x-auto">
          {players.length === 0 ? (
            <p className="text-gray-500 text-sm">No players in the room...</p>
          ) : (
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 h-full">
              {players.slice(0, 4).map((player, index) => (
                <li
                  key={index}
                  className={`flex flex-col items-center px-4 py-3 rounded-md border ${
                    player.isReady
                      ? "border-green-400 bg-green-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold mb-2">
                    {player?.username?.charAt(0).toUpperCase()}
                  </div>

                  <span className="font-medium text-gray-700 text-sm">
                    {player.username}
                  </span>
                  <span
                    className={`text-xs font-semibold mt-1 ${
                      player.isReady ? "text-green-500" : "text-gray-400"
                    }`}
                  >
                    {player.isReady ? "Ready" : "Not Ready"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerRoomCard;
