import React from "react";
import { Enemies, Role, Stage } from "@/utils/Type";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInNotification } from "@/utils/FramerMotionStyles";

const RoleCard = ({
  role,
  onSelect,
}: {
  role: Role;
  onSelect: (role: Role) => void;
}) => (
  <button
    onClick={() => onSelect(role)}
    className="bg-gray-800 text-white rounded-xl border border-white cursor-pointer shadow-md p-4 text-left 
      transform transition-all duration-200 ease-in-out hover:scale-105 hover:bg-gray-700 hover:shadow-lg"
  >
    <h2 className="text-lg font-bold text-amber-300 mb-1">{role.name}</h2>
    <p className="text-sm text-gray-300 mb-2">{role.description}</p>
    <div className="text-xs text-gray-400 mb-2 space-y-1">
      <p>🗡️ Attack: {role.stats.attack}</p>
      <p>❤️ Health: {role.stats.maxHealth}</p>
      <p>🛡️ Defense: {role.stats.defense}</p>
      <p>⚡ Speed: {role.stats.speed}</p>
    </div>
    <p className="italic text-emerald-400 text-sm">Passive: {role.passive}</p>
  </button>
);

const EnemyCard = ({
  enemy,
  onAttack,
}: {
  enemy: Enemies;
  onAttack: (id: string) => void;
}) => (
  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
    <h3 className="text-md font-bold text-white">{enemy.name}</h3>
    {enemy.isAlive ? (
      <button
        onClick={() => onAttack(enemy.id)}
        className="mt-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-lg transition duration-200"
      >
        Attack
      </button>
    ) : (
      <p className="mt-2 text-sm text-gray-400 italic">Enemy is defeated</p>
    )}
  </div>
);

const BattleLogsChat = ({
  logs,
  countdown,
  tempMessage,
  gameStarted,
  handleSelectionRoles,
  hasChosenRole,
  availableRoles,
  stage,
  enemyData,
  handleAttackEnemy,
  notification,
}: {
  logs: { sender: string; message: string }[];
  countdown: number | null;
  tempMessage: string | null;
  availableRoles: Role[];
  gameStarted: boolean;
  handleSelectionRoles: (role: Role) => void;
  hasChosenRole: boolean;
  stage: Stage | null;
  enemyData: Enemies[];
  handleAttackEnemy: (enemyId: string) => void;
  notification: string | null;
}) => {
  return (
    <section className="relative flex flex-col justify-center items-center mb-3 text-sm px-4">
      <div className="battle-logs-chat w-full max-w-3xl space-y-2">
        {typeof countdown === "number" && countdown > 0 && (
          <div className="text-center font-semibold text-yellow-300 animate-pulse">
            Game will start in {countdown} seconds
          </div>
        )}

        {tempMessage && (
          <div className="text-center">
            <span className="text-red-400 font-medium">{tempMessage}</span>
          </div>
        )}

        {logs.map((log, index) => (
          <p
            key={index}
            className={`font-semibold ${
              log.sender === "systemBattleLogs"
                ? "text-amber-400"
                : "text-blue-400"
            }`}
          >
            {log.message}
          </p>
        ))}
      </div>
      {/* Role Selection */}
      {!hasChosenRole && gameStarted && availableRoles?.length > 0 && (
        <div className="selection-roles mt-6 w-full max-w-4xl">
          <h1 className="text-xl font-semibold text-center text-amber-400">
            Select Your Role
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {availableRoles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                onSelect={handleSelectionRoles}
              />
            ))}
          </div>
        </div>
      )}
      {/* Stage Info */}
      {stage && gameStarted && !tempMessage && (
        <div className="stage-section w-full max-w-4xl mt-6 space-y-6">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
              <h1 className="text-2xl font-bold text-amber-400 text-center tracking-wide">
                {stage.stageName}
              </h1>
            </div>
            <div className="p-6">
              <p className="text-base text-gray-300 leading-relaxed">
                {stage.intro}
              </p>
            </div>
          </div>

          {/* Enemy Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {enemyData.map((enemy) => (
              <EnemyCard
                key={enemy.id}
                enemy={enemy}
                onAttack={handleAttackEnemy}
              />
            ))}
          </div>
        </div>
      )}
      {notification && (
        <AnimatePresence>
          <motion.div
            key="notification"
            className={`absolute top-6 left-1/2 transform -translate-x-1/2 z-50 
        px-6 py-3 rounded-lg border text-lg font-semibold shadow-lg flex space-x-2 justify-center items-center
        ${
          notification.toLowerCase().includes("your turn")
            ? "bg-green-700 text-green-200 border-green-400"
            : notification.toLowerCase().includes("enemy turn")
            ? "bg-red-800 text-red-200 border-red-500"
            : "bg-gray-700 text-white border-gray-500"
        }`}
            variants={fadeInNotification(0.2)}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {notification.toLowerCase().includes("your turn") ? (
              <>
                <motion.span
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -10, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Your
                </motion.span>
                <motion.span
                  initial={{ x: 10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 10, opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Turn
                </motion.span>
              </>
            ) : notification.toLowerCase().includes("enemy turn") ? (
              <>
                <motion.span
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -10, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Enemy
                </motion.span>
                <motion.span
                  initial={{ x: 10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 10, opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Turn
                </motion.span>
              </>
            ) : (
              <motion.span>{notification}</motion.span>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  );
};

export default BattleLogsChat;
