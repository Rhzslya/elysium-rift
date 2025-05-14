import { Player } from "@/utils/Type";
import React from "react";
import { Heart, Sword, Shield, Zap } from "lucide-react";
import type { JSX } from "react";

const statIcons: Record<string, JSX.Element> = {
  health: <Heart size={14} className="mr-1" />,
  attack: <Sword size={14} className="mr-1" />,
  defense: <Shield size={14} className="mr-1" />,
  speed: <Zap size={14} className="mr-1" />,
};

const statColors: Record<string, string> = {
  health: "bg-green-500",
  attack: "bg-red-500",
  defense: "bg-blue-500",
  speed: "bg-yellow-500",
};

const PlayerInfo = ({
  playerName,
  players,
  userId,
}: {
  playerName: string | null;
  players: Player[];
  userId: string | undefined;
}) => {
  const currentPlayer = players.find((player) => player.userId === userId);

  return (
    <section className="player-list rrelative  min-h-screen text-white flex flex-col gap-4 items-center">
      <div className="flex flex-col w-full max-w-xl h-[242px] overflow-y-auto bg-gray-800 rounded-lg">
        <div className="sticky top-0 bg-gray-800 z-10 px-4 py-2 border-b border-gray-700">
          <h2 className="text-2xl font-semibold">Player List</h2>
        </div>
        <div className="flex justify-between items-center text-xs">
          <ul className="space-y-1 w-full">
            {players.map((player, index) => (
              <li
                key={index}
                className={`flex justify-between items-center text-base px-2 py-1 rounded
      ${
        player.username === playerName
          ? "text-amber-400 font-bold"
          : "text-white"
      }`}
              >
                <span>
                  {index + 1}. {player.username}
                </span>
                {player.isReady ? (
                  <span className="text-green-400 text-sm font-semibold ml-2">
                    (Ready)
                  </span>
                ) : (
                  <span className="text-red-400 text-sm font-semibold ml-2">
                    (Not Ready)
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-col w-full max-w-xl h-[242px] overflow-y-auto bg-gray-800 rounded-lg">
        <div className="sticky top-0 bg-gray-800 z-10 px-4 py-2 border-b border-gray-700">
          <h2 className="text-2xl font-semibold text-white">Your Status</h2>
        </div>
        <div className="px-4 py-2">
          {currentPlayer ? (
            <div className="flex flex-colrounded-md text-white">
              {currentPlayer.roles ? (
                <div className="mt-2 text-sm text-gray-300">
                  <h2 className="text-base font-medium">
                    {currentPlayer.roles.name}
                  </h2>

                  <ul className="mt-1 space-y-2">
                    {["health", "attack", "defense", "speed"].map((stat) => {
                      const value =
                        currentPlayer.roles!.stats[
                          stat as keyof typeof currentPlayer.roles.stats
                        ];
                      const color = statColors[stat];

                      return (
                        <li key={stat} className="text-sm capitalize">
                          <div className="w-full bg-gray-600 rounded h-5 mt-1">
                            <div
                              className={`${color} h-5 rounded w-full flex items-center justify-between px-2 text-white text-xs font-medium`}
                            >
                              <div className="flex items-center">
                                {statIcons[stat]}
                              </div>
                              <span>{value}</span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  <p className="mt-1 italic text-gray-400">
                    Passive: {currentPlayer.roles.passive}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-400 mt-2 italic">
                  No role selected
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-400">You are not in the player list.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default PlayerInfo;
