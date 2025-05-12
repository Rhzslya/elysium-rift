import React, { useEffect, useState } from "react";
import BattleLogsChat from "../BattleLogsChat";
import ChatForm from "../ChatForm";
import { socket } from "@/lib/socketClient";
import { Player, Role } from "@/utils/Type";

const BattleLogs = ({
  countdown,
  logs,
  handleReady,
  handleExitRoom,
  handleSendMessage,
  players,
  setPlayers,
  userId,
  tempMessage,
  gameStarted,
  handleSelectionRoles,
}: {
  countdown: number | null;
  logs: { sender: string; message: string }[];
  handleReady: () => void;
  handleExitRoom: () => void;
  handleSendMessage: (message: string) => void;
  players: Player[];
  setPlayers: (players: Player[]) => void;
  userId: string | undefined;
  tempMessage: string | null;
  gameStarted: boolean;
  handleSelectionRoles: (role: Role) => void;
}) => {
  const currentPlayer = players.find((p) => p.userId === userId);
  const isReady = currentPlayer?.isReady ?? false;
  const [availableRoles, setAvailableRoles] = useState<any>([]);
  const [hasChosenRole, setHasChosenRole] = useState(false);

  useEffect(() => {
    socket.on("choose-role-phase", (roles: Role[]) => {
      setAvailableRoles(roles);
      setHasChosenRole(true);
    });

    return () => {
      socket.removeAllListeners("choose-role-phase");
    };
  }, [gameStarted]);

  return (
    <section className="battle-logs relative  min-h-screen text-white flex flex-col items-center">
      <div className="flex flex-col w-full max-w-xl h-[500px] overflow-y-auto bg-gray-800 rounded-lg">
        <div className="sticky top-0 bg-gray-800 z-10 px-4 py-2 border-b border-gray-700">
          <h2 className="text-2xl font-semibold">Battle Logs</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 hide-scrollbar">
          <BattleLogsChat
            logs={logs}
            countdown={countdown}
            tempMessage={tempMessage}
            availableRoles={availableRoles}
            hasChosenRole={hasChosenRole}
            gameStarted={gameStarted}
            players={players}
            setPlayers={setPlayers}
            userId={userId}
            handleSelectionRoles={handleSelectionRoles}
          />
        </div>
      </div>

      <div className="w-full max-w-xl mt-3">
        <ChatForm onSendMessage={handleSendMessage} />
        <div className="flex items-center justify-center gap-2">
          <div className="exit-btn mt-3 mr-auto">
            <button
              onClick={handleExitRoom}
              className="cursor-pointer bg-red-400 hover:bg-red-600 px-4 py-2 rounded text-black font-semibold"
            >
              Exit
            </button>
          </div>

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
