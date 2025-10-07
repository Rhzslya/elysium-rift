import { Player } from "@/utils/Type";
import React from "react";

const PlayerRoomCard = ({ players }: { players: Player[] }) => {
  return (
    <div className="relative col-span-3 row-span-2 w-[80%] mx-auto row-start-2 flex flex-wrap justify-center gap-6 p-6 bg-gradient-to-r from-gray-200 to-gray-100 rounded-2xl shadow-inner border-4 border-white">
      <div className="box-card w-full p-4 h-full flex flex-col">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-12 h-full">
          {players.slice(0, 4).map((player, index) => (
            <li
              key={index}
              className="bg-white rounded-2xl border-4 border-white shadow-md hover:scale-105 transition-transform duration-200 cursor-pointer"
            >
              {/* Header gradient bulat */}
              <div
                className={`h-[300px] w-full bg-gradient-to-bl ${
                  [
                    "from-orange-600 to-yellow-400",
                    "from-purple-600 to-pink-500",
                    "from-indigo-700 to-blue-300",
                    "from-emerald-600 to-green-400",
                  ][index % 4]
                } rounded-br-[60%] rounded-tl-[60%] flex justify-center items-center`}
              >
                <span className="text-white text-3xl font-bold">
                  {player?.username?.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Isi konten */}
              <div className="flex flex-col items-center text-gray-700 px-3 py-4">
                <h1 className="text-sm font-semibold text-center capitalize">
                  {player.username}
                </h1>

                <p
                  className={`text-xs font-medium mt-2 ${
                    player.isReady ? "text-green-500" : "text-gray-400"
                  }`}
                >
                  {player.isReady ? "Ready" : "Not Ready"}
                </p>

                <button
                  className={`mt-3 px-4 py-1 text-xs font-semibold text-white rounded-full bg-gradient-to-l ${
                    player.isReady
                      ? "from-green-500 to-lime-400"
                      : "from-gray-400 to-gray-500"
                  }`}
                >
                  {player.isReady ? "Ready" : "Waiting"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PlayerRoomCard;
