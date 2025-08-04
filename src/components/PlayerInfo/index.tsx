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
  players: Player[] | [];
  userId: string | null;
}) => {
  const currentPlayer =
    players?.find((player) => player.userId === userId) || null;
  console.log(currentPlayer);

  return (
    <section className="h-full relative max-h-[600px] row-span-2 col-start-3 row-start-2 overflow-y-auto rounded-lg hide-scrollbar">
      <div className=" w-full flex justify-center top-0 px-4 py-2">
        <h2 className="text-2xl font-semibold text-green-400">Your Status</h2>
      </div>

      <div className="px-4 py-2 space-y-4">
        {currentPlayer ? (
          <div className="text-sm text-gray-300 pb-2">
            {currentPlayer.role ? (
              (() => {
                const role = currentPlayer.role;

                const current = role.stats.currentHealth;
                const max = role.stats.maxHealth;
                const percentage = Math.max(
                  0,
                  Math.min(100, (current / max) * 100)
                );
                let barColor = "bg-green-500";
                if (percentage < 30) barColor = "bg-red-600";
                else if (percentage < 60) barColor = "bg-yellow-500";

                return (
                  <>
                    <h3 className="text-base font-medium">{role.name}</h3>
                    <p className="text-xs italic text-gray-400 mb-1">
                      {currentPlayer.username}
                    </p>

                    {/* Health Bar */}
                    <div className="mb-2">
                      <div className="w-full bg-gray-600 rounded h-5 relative overflow-hidden">
                        <div
                          className={`${barColor} h-5 transition-all duration-300 flex items-center justify-between px-2 text-white text-xs font-medium`}
                          style={{ width: `${percentage}%` }}
                        >
                          <div className="flex items-center">
                            {statIcons.health}
                          </div>
                          <span>{`${current}/${max}`}</span>
                        </div>
                      </div>
                    </div>

                    {/* Other Stats */}
                    <ul className="space-y-1 mt-1">
                      {["attack", "defense", "speed"].map((stat) => {
                        const icon = statIcons[stat as keyof typeof statIcons];
                        const value = role.stats[
                          stat as keyof typeof role.stats
                        ] as number;
                        return (
                          <li
                            key={stat}
                            className="flex items-center gap-2 text-sm capitalize"
                          >
                            <div>{icon}</div>
                            <div className="flex flex-1 items-baseline">
                              <span className="w-20 text-left text-gray-300">
                                {stat}
                              </span>
                              <span className="pr-2">:</span>
                              <span className="font-medium">{value}</span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>

                    {/* Passive and Skill */}
                    {role.passive && (
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="w-[98px] text-left text-gray-300">
                          Passive
                        </span>
                        <span className="pr-1">:</span>
                        <span className="italic text-gray-400 flex-1">
                          {role.passive}
                        </span>
                      </div>
                    )}

                    {role.skills && (
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="w-[98px] text-left text-gray-300">
                          Skill
                        </span>
                        <span className="pr-1">:</span>
                        <span className="italic text-gray-400 flex-1">
                          {role.skills}
                        </span>
                      </div>
                    )}
                  </>
                );
              })()
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
    </section>
  );
};

export default PlayerInfo;
