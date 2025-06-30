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
  health: "bg-green-300",
  attack: "bg-red-300",
  defense: "bg-blue-300",
  speed: "bg-yellow-300",
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
  {
    id: 3,
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
  {
    id: 4,
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
    <section className="h-full relative max-h-[600px] col-start-1 row-start-2 row-span-2 overflow-y-auto  rounded-lg hide-scrollbar">
      <div className=" w-full flex justify-center top-0 px-4 py-2">
        <h2 className="text-2xl font-semibold text-red-400">Enemies Status</h2>
      </div>

      <div className="px-4 py-2 space-y-4">
        {enemyData.length > 0 &&
          enemyData.map((enemy) => (
            <div key={enemy.id} className="text-sm text-gray-300 pb-2">
              <h3 className="text-base font-medium">{enemy.type}</h3>
              <p className="text-xs italic text-gray-400 mb-1">{enemy.name}</p>

              {/* HEALTH BAR */}
              <div className="mb-2">
                <div className="w-full bg-gray-600 rounded h-5 relative overflow-hidden">
                  {(() => {
                    const current = enemy.stats.currentHealth;
                    const max = enemy.stats.maxHealth;
                    const percentage = Math.max(
                      0,
                      Math.min(100, (current / max) * 100)
                    );
                    let barColor = "bg-green-500";
                    if (percentage < 30) {
                      barColor = "bg-red-600";
                    } else if (percentage < 60) {
                      barColor = "bg-yellow-500";
                    }
                    return (
                      <div
                        className={`${barColor} h-5 transition-all duration-300 flex items-center justify-between px-2 text-white text-xs font-medium`}
                        style={{ width: `${percentage}%` }}
                      >
                        <div className="flex items-center">
                          {statIcons.health}
                        </div>
                        <span>{`${current}/${max}`}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* OTHER STATS AS TEXT */}
              <ul className="space-y-1 mt-1">
                {["attack", "defense", "speed"].map((stat) => {
                  const icon = statIcons[stat as keyof typeof statIcons];
                  const value = enemy.stats[
                    stat as keyof typeof enemy.stats
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

              {/* HEALTH BAR */}
              <div className="mb-2">
                <div className="w-full bg-gray-600 rounded h-5 relative overflow-hidden">
                  {(() => {
                    const current = enemy.stats.currentHealth;
                    const max = enemy.stats.maxHealth;
                    const percentage = Math.max(
                      0,
                      Math.min(100, (current / max) * 100)
                    );
                    let barColor = "bg-green-300";
                    if (percentage < 30) {
                      barColor = "bg-red-300";
                    } else if (percentage < 60) {
                      barColor = "bg-yellow-300";
                    }
                    return (
                      <div
                        className={`${barColor} h-5 transition-all duration-300 flex items-center justify-between px-2 text-white text-xs font-medium`}
                        style={{ width: `${percentage}%` }}
                      >
                        <div className="flex items-center">
                          {statIcons.health}
                        </div>
                        <span>{`${current}/${max}`}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* OTHER STATS AS TEXT */}
              <ul className="space-y-1 mt-1">
                {["attack", "defense", "speed"].map((stat) => {
                  const icon = statIcons[stat as keyof typeof statIcons];
                  const value = enemy.stats[
                    stat as keyof typeof enemy.stats
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

              {enemy.passive && (
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="w-24 text-left text-gray-300">Passive</span>
                  <span className="pr-1">:</span>
                  <span className="italic text-gray-400 flex-1">
                    {enemy.passive}
                  </span>
                </div>
              )}

              {enemy.skill && (
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="w-24 text-left text-gray-300">Skill</span>
                  <span className="pr-1">:</span>
                  <span className="italic text-gray-400 flex-1">
                    {enemy.skill}
                  </span>
                </div>
              )}
            </div>
          ))}
      </div>
    </section>
  );
};

export default EnemiesList;
