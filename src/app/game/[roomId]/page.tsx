"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useUserSocket } from "@/utils/Contexts";
import BattleLogs from "@/components/BattleLogs";
import PlayerInfo from "@/components/PlayerInfo";
import { ResolvedEnemy, Player, Role } from "@/utils/Type";
import TitleRoom from "@/components/TitleRoom";
import ChatBox from "@/components/ChatBox";
import EnemiesList from "@/components/EnemiesList";
import { Sword, X } from "lucide-react";

export default function GameRoom() {
  const { socket, userId } = useUserSocket();
  const { roomId } = useParams();
  const searchParams = useSearchParams();
  const playerName = searchParams.get("name");

  const router = useRouter();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [tempMessage, setTempMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<
    { sender: string; message: string; messageId?: string }[]
  >([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [messages, setMessages] = useState<
    { sender: string; message: string; messageId?: string }[]
  >([]);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [hasChosenRole, setHasChosenRole] = useState(false);
  const [stage, setStage] = useState<{
    stageId: number;
    stageName: string;
    intro: string;
  } | null>(null);
  const [enemyData, setEnemyData] = useState<ResolvedEnemy[]>([]);
  const [turnMessages, setTurnMessages] = useState<string | "">("");
  const [turnStatus, setTurnStatus] = useState<boolean>(false);
  const [selectedEnemyId, setSelectedEnemyId] = React.useState<string | null>(
    null
  );
  const [isSelectingEnemy, setIsSelectingEnemy] = React.useState(false);

  const handleSingleAttackEnemy = () => {
    if (!selectedEnemyId) {
      setIsSelectingEnemy(!isSelectingEnemy);
    } else {
      handleAttackEnemy(selectedEnemyId);
      setSelectedEnemyId(null);
      setIsSelectingEnemy(false);
    }
  };

  console.log(userId);
  console.log(socket);

  const cancelSelectionEnemy = () => {
    setSelectedEnemyId(null);
    setIsSelectingEnemy(false);
  };

  useEffect(() => {
    if (!socket || !userId || !playerName || !roomId || hasJoined) return;

    setHasJoined(true);

    setPlayers([{ userId, username: playerName, isReady: false, roles: null }]);

    socket.on("message", (data) => {
      const { sender, message, messageId } = data;

      if (sender === "systemBattleLogs") {
        setLogs((prev) => [...prev, { sender, message, messageId }]);
      } else {
        setMessages((prev) => [...prev, { sender, message, messageId }]);
      }
    });

    socket.on("clear-message", ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg.messageId !== messageId));
      setLogs((prev) => prev.filter((msg) => msg.messageId !== messageId));
    });

    socket.on("temp-message", ({ message }) => {
      setTempMessage(message);
    });

    socket.on("user-joined", (message) => {
      setMessages((prev) => [...prev, { sender: "system", message }]);
    });

    socket.on("update-players", (playersList: Player[]) => {
      setPlayers(playersList);
    });

    socket.on("update-enemies", ({ enemies }) => {
      setEnemyData(enemies);
    });

    socket.on("stage-started", ({ stageId, stageName, intro, enemies }) => {
      setStage({ stageId, stageName, intro });
      setEnemyData(enemies);
    });

    socket.on("clear-stage", () => {
      setStage(null);
      setEnemyData([]);
      setHasChosenRole(false);
    });

    socket.on("player-turn", ({ message, status }) => {
      setTempMessage(message);
      setTurnStatus(status);
    });

    socket.on("auto-role-selected", ({ userId, role, roleSelected }) => {
      setPlayers((prev) =>
        prev.map((player) => {
          if (player.userId === userId) {
            return {
              ...player,
              roles: role,
              roleSelected,
            };
          }

          return player;
        })
      );

      setHasChosenRole(true);
    });

    socket.on("battle-phase-update", ({ phase, message, duration }) => {
      console.log("🔄 Phase changed:", phase);
      setTurnMessages(message);

      if (duration) {
        setTimeout(() => {
          setTurnMessages("");
        }, duration);
      }
    });

    socket.on("game-over", ({ sender, message, messageId }) => {
      setLogs((prev) => [...prev, { sender, message, messageId }]);
      setTurnStatus(false);
      setStage(null);
    });

    socket.on("user-left", (message) => {
      setMessages((prev) => [...prev, { sender: "system", message }]);
    });

    return () => {
      socket.off("message");
      socket.off("user-joined");
      socket.off("update-players");
      socket.off("game-started");
      socket.off("user-left");
      socket.off("game-started");
      socket.off("auto-role-selected");
      socket.off("stage-started");
      socket.off("update-enemies");
      socket.off("player-turn");
      socket.off("game-over");
    };
  }, [userId, roomId, playerName]);

  console.log(`Turn Status ${turnStatus}`);

  const handleReady = () => {
    if (!socket) return;
    if (players.length <= 1) {
      setTempMessage(
        "Not enough players to start the game. Please wait for the other player to join."
      );
      return;
    }
    const currentPlayer = players.find((p) => p.userId === userId);
    const newIsReady = !currentPlayer?.isReady;

    socket.emit("player-ready", {
      roomId,
      username: playerName,
      isReady: newIsReady,
    });

    socket.emit("game-start", {
      roomId,
      isReady: newIsReady,
      countdown,
    });
  };

  useEffect(() => {
    if (!socket) return;
    const handleCountdown = (value: number | null) => {
      setCountdown(value);
    };

    const handleGameStarted = (started: boolean) => {
      setGameStarted(started);
    };

    socket.on("countdown", handleCountdown);
    socket.on("game-started", handleGameStarted);

    return () => {
      socket.off("countdown", handleCountdown);
      socket.off("game-started", handleGameStarted);
    };
  }, []);

  const handleExitRoom = () => {
    if (!socket) return;
    socket.emit("exit-room", roomId, playerName);

    router.push("/");
  };

  const handleSendMessage = (message: string) => {
    if (!socket) return;
    if (!playerName) return; // Tambah validasi biar aman
    const data = { roomId, message, sender: playerName };
    setMessages((prev) => [...prev, { sender: playerName, message }]);
    socket.emit("message", data);
  };

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (tempMessage) {
      const timeout = setTimeout(() => {
        setTempMessage("");
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [tempMessage]);

  const handleSelectionRoles = (role: Role) => {
    if (!socket) return;
    socket.emit("player-selected-role", { roomId, userId, role });
    setHasChosenRole(true);
  };

  const handleAttackEnemy = (enemyId: string) => {
    if (!socket || !stage || !userId) return;

    socket.on("update-enemies", ({ enemies }) => {
      setEnemyData(enemies);
    });
    socket.emit("attacking-phase", {
      roomId: roomId,
      enemyId,
      userId: userId,
    });
  };

  console.log(`Player List ${players.map((p) => p.username)}`);
  console.log(`Stage Data ${stage}`);
  console.log(`Enemy Data ${enemyData}`);
  console.log(`Has Chosen Role ${hasChosenRole}`);
  console.log(`Game State ${gameStarted}`);
  console.log(messages);

  return (
    <main className="min-h-screen text-white p-6 grid grid-cols-3 grid-rows-[0.5fr_1fr_1fr_auto] gap-2">
      <TitleRoom roomId={Array.isArray(roomId) ? roomId[0] : roomId} />
      <BattleLogs
        countdown={countdown}
        logs={logs}
        handleReady={handleReady}
        handleExitRoom={handleExitRoom}
        handleSendMessage={handleSendMessage}
        players={players}
        setPlayers={setPlayers}
        userId={userId}
        tempMessage={tempMessage}
        gameStarted={gameStarted}
        handleSelectionRoles={handleSelectionRoles}
        handleAttackEnemy={handleAttackEnemy}
        hasChosenRole={hasChosenRole}
        stage={stage}
        enemyData={enemyData}
        turnMessages={turnMessages}
      />

      <div
        ref={chatAreaRef}
        className="col-start-1 row-start-4 h-[100px] flex-1 overflow-y-auto p-4 space-y-2 hide-scrollbar"
      >
        {messages.map((msg, index) => (
          <ChatBox
            key={index}
            sender={msg.sender === playerName ? "You" : msg.sender}
            message={msg.message}
            isOwnMessage={msg.sender === playerName}
          />
        ))}
      </div>
      <EnemiesList enemyData={enemyData} />
      <div className="player-list col-start-3 row-start-1 flex flex-col items-end">
        <div>
          <h2 className="text-lg font-semibold text-white">Player List</h2>
        </div>
        <div className="flex flex-col items-end text-sm space-y-1">
          {players.map((player, index) => (
            <span
              key={index}
              className={`${
                player.isReady ? "text-green-400" : "text-gray-500"
              }`}
            >
              {player.username}
            </span>
          ))}
        </div>
      </div>

      <PlayerInfo playerName={playerName} players={players} userId={userId} />
      <div className="relative      col-start-3 row-start-4">
        {selectedEnemyId && (
          <div className="button-cancel col-start-3 row-start-1 flex ml-auto mr-4">
            <button
              className="cursor-pointer hover:text-red-500 duration-300"
              onClick={cancelSelectionEnemy}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}
        <div className="button-attack row-span-2 col-start-3 row-start-2 flex justify-center items-center">
          <button
            onClick={handleSingleAttackEnemy}
            className={`${
              selectedEnemyId ? "bg-red-500" : "bg-red-400"
            } relative hover:bg-red-600 cursor-pointer text-white font-semibold p-3 rounded-full flex items-center justify-center shadow-lg ml-8`}
          >
            <Sword className="w-6 h-6" />
          </button>
        </div>

        {isSelectingEnemy && (
          <div className="col-span-2 col-start-1 row-start-3 flex justify-center ml-auto">
            <div className="flex ">
              {enemyData
                .filter((e) => e.isAlive)
                .map((enemy) => (
                  <button
                    key={enemy.id}
                    onClick={() => {
                      setSelectedEnemyId(enemy.id);
                      setIsSelectingEnemy(false);
                    }}
                    className={`text-left cursor-pointer text-white text-sm py-1 px-2 rounded-sm transition-all duration-200 font-medium ${
                      selectedEnemyId === enemy.id
                        ? "bg-emerald-500 text-white ring-2 ring-emerald-300"
                        : "hover:bg-gray-100 text-gray-800"
                    }`}
                  >
                    {enemy.name}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
