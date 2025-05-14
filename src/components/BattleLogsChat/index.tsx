import { socket } from "@/lib/socketClient";
import { Player, Role } from "@/utils/Type";
import React, { useEffect } from "react";

const BattleLogsChat = ({
  logs,
  countdown,
  tempMessage,
  gameStarted,
  handleSelectionRoles,
  hasChosenRole,
  availableRoles,
}: {
  logs: { sender: string; message: string }[];
  countdown: number | null;
  tempMessage: string | null;
  availableRoles: Role[];
  gameStarted: boolean;
  handleSelectionRoles: (role: Role) => void;
  hasChosenRole: boolean;
}) => {
  return (
    <section>
      <div className="flex justify-center items-center mb-3 text-sm">
        {!hasChosenRole && gameStarted && availableRoles ? (
          <div className="selection-roles">
            <div className="selection-role-title">
              <h1 className="text-xl font-semibold text-amber-400">
                Selection Roles
              </h1>
              <div className="role-box grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {availableRoles.map((role) => (
                  <div className="flex flex-start" key={role.id}>
                    <button
                      onClick={() => handleSelectionRoles(role)}
                      className="bg-gray-800 text-white rounded-xl border border-white cursor-pointer shadow-md p-4 text-left 
                 transform transition-all duration-200 ease-in-out 
                 hover:scale-105 hover:bg-gray-700 hover:shadow-lg"
                    >
                      <h2 className="text-lg font-bold text-amber-300 mb-1">
                        {role.name}
                      </h2>
                      <p className="text-sm text-gray-300 mb-2">
                        {role.description}
                      </p>
                      <div className="text-xs text-gray-400 mb-2 space-y-1">
                        <p>🗡️ Attack: {role.stats.attack}</p>
                        <p>❤️ Health: {role.stats.health}</p>
                        <p>🛡️ Defense: {role.stats.defense}</p>
                        <p>⚡ Speed: {role.stats.speed}</p>
                      </div>
                      <p className="italic text-emerald-400 text-sm">
                        Passive: {role.passive}
                      </p>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="battle-logs-chat">
            {typeof countdown === "number" && countdown > 0 && (
              <div>Game Will Start in {countdown} seconds</div>
            )}
            <div className="temp-message">
              <span className="text-red-400">{tempMessage}</span>
            </div>
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
        )}
      </div>
    </section>
  );
};

export default BattleLogsChat;
