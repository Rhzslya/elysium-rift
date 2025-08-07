import React, { useEffect, useState } from "react";
import BattleLogsChat from "../BattleLogsChat";
import ChatForm from "../ChatForm";
import { ResolvedEnemy, Player, Role, Stage } from "@/utils/Type";

const BattleLogs = ({
  countdown,
  logs,
  handleReady,
  handleExitRoom,
  players,
  setPlayers,
  userId,
  tempMessage,
  gameStarted,
  handleSelectionRoles,
  handleAttackEnemy,
  hasChosenRole,
  stage,
  enemyData,
  turnMessages,
}: {
  countdown: number | null;
  logs: { sender: string; message: string }[];
  handleReady: () => void;
  handleExitRoom: () => void;
  handleSendMessage: (message: string) => void;
  players: Player[];
  setPlayers: (players: Player[]) => void;
  userId: string | null;
  tempMessage: string | null;
  gameStarted: boolean;
  handleSelectionRoles: (role: Role) => void;
  handleAttackEnemy: (enemyId: string) => void;
  hasChosenRole: boolean;
  stage: Stage | null;
  enemyData: ResolvedEnemy[];
  turnMessages: string | null;
}) => {
  const currentPlayer = players.find((p) => p.userId === userId);
  const isReady = currentPlayer?.isReady ?? false;
  const [availableRoles, setAvailableRoles] = useState<any>([]);

  return (
    <section className="battle-logs relative w-full text-white flex flex-col items-center row-span-3 col-start-2 row-start-2">
      <div className="flex flex-col w-full max-w-[800px] h-[600px] overflow-y-auto bg-gray-800 rounded-lg">
        <div className="sticky top-0 bg-gray-800 z-10 px-4 py-2 border-b border-gray-700">
          <h2 className="text-2xl font-semibold">Battle Logs</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 hide-scrollbar">
          <BattleLogsChat
            logs={logs}
            countdown={countdown}
            tempMessage={tempMessage}
            availableRoles={availableRoles}
            gameStarted={gameStarted}
            handleSelectionRoles={handleSelectionRoles}
            handleAttackEnemy={handleAttackEnemy}
            hasChosenRole={hasChosenRole}
            stage={stage}
            enemyData={enemyData}
            turnMessages={turnMessages}
          />
        </div>
      </div>

      <div className="w-full mt-3">
        <div className="flex items-center justify-center gap-2">
          {countdown !== 0 && (
            <div className="ready-btn mt-3 w-full">
              <button
                onClick={handleReady}
                className={`w-full cursor-pointer px-4 py-2 rounded text-black font-semibold transition-colors duration-200
        ${
          isReady
            ? "bg-yellow-300 hover:bg-yellow-500"
            : "bg-green-400 hover:bg-green-600"
        }`}
                aria-pressed={isReady}
              >
                {isReady ? "Cancel Ready" : "I'm Ready"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BattleLogs;
