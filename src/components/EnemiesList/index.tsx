// components/EnemiesList.tsx
import React, { JSX } from "react";
import { Heart, Sword, Shield, Zap } from "lucide-react";
import { ResolvedEnemy } from "@/utils/Type";

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

const dummyEnemyData = [
  {
    id: 1,
    type: "Goblin",
    name: "Grumblar",
    stats: {
      currentHealth: 25,
      maxHealth: 100,
      attack: 15,
      defense: 8,
      speed: 12,
    },
    passive: "Regenerates 5 HP per turn",
    skill: "Poison Blade",
  },
  {
    id: 2,
    type: "Orc",
    name: "Throgg",
    stats: {
      currentHealth: 60,
      maxHealth: 80,
      attack: 25,
      defense: 20,
      speed: 10,
    },
    passive: "Takes less damage from physical attacks",
    skill: "Ground Slam",
  },
];

const EnemiesList = ({ enemyData }: { enemyData: ResolvedEnemy[] }) => {
  const enemyDummyData = dummyEnemyData;

  return (
    <section className="h-full col-start-1 row-start-2 row-span-2 overflow-y-auto  rounded-lg hide-scrollbar">
      <div className="sticky top-0 z-10 px-4 py-2">
        <h2 className="text-2xl font-semibold text-red-400">Enemies Status</h2>
      </div>

      <div className="px-4 py-2 space-y-4">
        {enemyData.length > 0 &&
          enemyData.map((enemy) => (
            <div key={enemy.id} className="text-sm text-gray-300 pb-2">
              <h3 className="text-base font-medium">{enemy.type}</h3>
              <p className="text-xs italic text-gray-400 mb-1">{enemy.name}</p>

              <ul className="space-y-2">
                {["health", "attack", "defense", "speed"].map((stat) => {
                  const icon = statIcons[stat];
                  let value: number;
                  let barWidth = "100%";
                  let barColor = statColors[stat];

                  if (stat === "health") {
                    const current = enemy.stats.currentHealth;
                    const max = enemy.stats.maxHealth;
                    value = current;
                    const percentage = Math.max(
                      0,
                      Math.min(100, (current / max) * 100)
                    );
                    barWidth = `${percentage}%`;
                    if (percentage < 30) {
                      barColor = "bg-red-600";
                    } else if (percentage < 60) {
                      barColor = "bg-yellow-500";
                    } else {
                      barColor = "bg-green-500";
                    }
                  } else {
                    value = enemy.stats[
                      stat as keyof typeof enemy.stats
                    ] as number;
                  }

                  return (
                    <li key={stat} className="text-sm capitalize">
                      <div className="w-full bg-gray-600 rounded h-5 mt-1 relative overflow-hidden">
                        <div
                          className={`${barColor} h-5 transition-all duration-300 ${
                            stat === "health" && value === 0
                              ? "p-0"
                              : "flex items-center justify-between px-2 text-white text-xs font-medium"
                          }`}
                          style={{
                            width: stat === "health" ? barWidth : "100%",
                          }}
                        >
                          {stat === "health" && value === 0 ? null : (
                            <>
                              <div className="flex items-center">{icon}</div>
                              <span>
                                {stat === "health"
                                  ? `${enemy.stats.currentHealth}/${enemy.stats.maxHealth}`
                                  : value}
                              </span>
                            </>
                          )}
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

              {enemy.skill && (
                <p className="mt-1 italic text-gray-400">
                  Skill: {enemy.skill}
                </p>
              )}
            </div>
          ))}
      </div>
      <div className="px-4 py-2 space-y-4">
        {enemyDummyData.length > 0 &&
          enemyDummyData.map((enemy) => (
            <div key={enemy.id} className="text-sm text-gray-300 pb-2">
              <h3 className="text-base font-medium">{enemy.type}</h3>
              <p className="text-xs italic text-gray-400 mb-1">{enemy.name}</p>

              <ul className="space-y-2">
                {["health", "attack", "defense", "speed"].map((stat) => {
                  const icon = statIcons[stat as keyof typeof statIcons];
                  let value: number;
                  let barWidth = "100%";
                  let barColor = statColors[stat as keyof typeof statColors];

                  if (stat === "health") {
                    const current = enemy.stats.currentHealth;
                    const max = enemy.stats.maxHealth;
                    value = current;
                    const percentage = Math.max(
                      0,
                      Math.min(100, (current / max) * 100)
                    );
                    barWidth = `${percentage}%`;
                    if (percentage < 30) {
                      barColor = "bg-red-600";
                    } else if (percentage < 60) {
                      barColor = "bg-yellow-500";
                    } else {
                      barColor = "bg-green-500";
                    }
                  } else {
                    value = enemy.stats[
                      stat as keyof typeof enemy.stats
                    ] as number;
                  }

                  return (
                    <li key={stat} className="text-sm capitalize">
                      <div className="w-full bg-gray-600 rounded h-5 mt-1 relative overflow-hidden">
                        <div
                          className={`${barColor} h-5 transition-all duration-300 ${
                            stat === "health" && value === 0
                              ? "p-0"
                              : "flex items-center justify-between px-2 text-white text-xs font-medium"
                          }`}
                          style={{
                            width: stat === "health" ? barWidth : "100%",
                          }}
                        >
                          {stat === "health" && value === 0 ? null : (
                            <>
                              <div className="flex items-center">{icon}</div>
                              <span>
                                {stat === "health"
                                  ? `${enemy.stats.currentHealth}/${enemy.stats.maxHealth}`
                                  : value}
                              </span>
                            </>
                          )}
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

              {enemy.skill && (
                <p className="mt-1 italic text-gray-400">
                  Skill: {enemy.skill}
                </p>
              )}
            </div>
          ))}
      </div>
    </section>
  );
};

export default EnemiesList;
