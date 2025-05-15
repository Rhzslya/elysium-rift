// components/EnemiesList.tsx
import React, { JSX } from "react";
import { Heart, Sword, Shield, Zap } from "lucide-react";
import type { Enemies } from "@/utils/Type";

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

const EnemiesList = ({ enemies }: { enemies: Enemies[] }) => {
  return (
    <section className="flex flex-col w-full max-w-xl h-[242px] overflow-y-auto bg-gray-800 rounded-lg hide-scrollbar">
      <div className="sticky top-0 bg-gray-800 z-10 px-4 py-2 border-b border-gray-700">
        <h2 className="text-2xl font-semibold text-red-400">Enemies Status</h2>
      </div>

      <div className="px-4 py-2 space-y-4">
        {enemies.length > 0 ? (
          enemies.map((enemy) => (
            <div key={enemy.id} className="text-sm text-gray-300  pb-2">
              <h3 className="text-base font-medium">{enemy.type}</h3>
              <p className="text-xs italic text-gray-400 mb-1">{enemy.name}</p>

              <ul className="space-y-2">
                {["health", "attack", "defense", "speed"].map((stat) => {
                  const value = enemy.stats[stat as keyof typeof enemy.stats];
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

              {enemy.passive && (
                <p className="mt-1 italic text-gray-400">
                  Passive: {enemy.passive}
                </p>
              )}

              {enemy.skills && (
                <p className="mt-1 italic text-gray-400">
                  Skill: {enemy.skills}
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 mt-2 italic">No enemies found</p>
        )}
      </div>
    </section>
  );
};

export default EnemiesList;
