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
import ChatForm from "@/components/ChatForm";
import PlayerRoomCard from "@/components/PlayerRoomCard";
import CountdownBox from "@/components/CountdownBox";

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
  const [selectedEnemyId, setSelectedEnemyId] = React.useState<string | null>(
    null
  );
  const [isSelectingEnemy, setIsSelectingEnemy] = React.useState(false);
  const currentPlayer = players.find((p) => p.userId === userId);
  const isReady = currentPlayer?.isReady ?? false;

  const handleSingleAttackEnemy = () => {
    if (!selectedEnemyId) {
      setIsSelectingEnemy(!isSelectingEnemy);
    } else {
      handleAttackEnemy(selectedEnemyId);
      setSelectedEnemyId(null);
      setIsSelectingEnemy(false);
    }
  };

  const cancelSelectionEnemy = () => {
    setSelectedEnemyId(null);
    setIsSelectingEnemy(false);
  };

  useEffect(() => {
    if (!socket || !userId || !playerName || !roomId || hasJoined) return;

    if (!socket || !roomId || !userId || !playerName) return;

    // Setup listener terlebih dahulu
    const handleUpdatePlayers = (players: Player[]) => {
      setPlayers(players);
    };
    socket.on("update-players", handleUpdatePlayers);

    // Emit join-room setelah listener siap
    const join = () => {
      socket.emit("join-room", { roomId, username: playerName, userId });
    };

    if (socket.connected) {
      join();
    } else {
      socket.once("connect", join);
      socket.connect();
    }

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

    socket.on("countdown", (value) => {
      setCountdown(value);
    });

    socket.on("countdown-cancelled", () => {
      setCountdown(null);
    });

    socket.on("user-left", (message) => {
      setMessages((prev) => [...prev, { sender: "system", message }]);
    });

    socket.on("game-started", (started) => {
      setGameStarted(started);
    });

    return () => {
      socket.off("message");
      socket.off("user-joined");
      socket.off("update-players");
      socket.off("user-left");
      socket.off("countdown-cancelled");
      socket.off("game-started");
    };
  }, [socket, userId, roomId, playerName]);

  const handleReady = () => {
    if (!socket || !userId) return;

    const currentPlayer = players.find((p) => p.userId === userId);
    const newIsReady = !currentPlayer?.isReady;

    socket.emit("player-ready", {
      roomId,
      username: playerName,
      isReady: newIsReady,
    });
  };

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

  const handleCopyRoomId = () => {
    if (typeof roomId === "string") {
      navigator.clipboard.writeText(roomId);
    }
  };

  return (
    <main className="min-h-screen relative text-white p-6 grid grid-cols-3 grid-rows-[0.5fr_1fr_1fr_auto] gap-2">
      <CountdownBox countdown={countdown} />

      <TitleRoom />
      {/* <BattleLogs
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
      /> */}
      <PlayerRoomCard players={players} />
      <div className="col-start-2 row-start-4 btn-box flex justify-center items-center gap-4 text-base">
        <div className="room-code-btn w-full">
          <button
            className="cursor-pointer w-full bg-neutral-400 hover:bg-neutral-600 px-6 py-2  text-white font-semibold"
            onClick={handleCopyRoomId}
          >
            ROOM CODE
          </button>
        </div>
        <div className="ready-btn relative w-full flex justify-center items-center">
          {/* border absolute */}
          <div className="absolute inset-0 -top-1 -left-1 -right-1 -bottom-1 border-neutral-100 border-1 "></div>

          {countdown !== 0 && (
            <button
              onClick={handleReady}
              className={`relative w-full cursor-pointer px-8 py-4 z-10 border-2 border-transparent  text-white font-semibold transition-colors duration-300
        ${
          isReady
            ? "bg-neutral-300 hover:bg-neutral-500"
            : "bg-neutral-500 hover:bg-neutral-300"
        }`}
              aria-pressed={isReady}
            >
              {isReady ? "Cancel Ready" : "READY"}
            </button>
          )}
        </div>

        <div className="exit-btn w-full">
          <button
            onClick={handleExitRoom}
            className="cursor-pointer w-[50%] bg-neutral-400 hover:bg-neutral-600 px-2 py-2  text-white font-semibold"
          >
            EXIT
          </button>
        </div>
      </div>

      <div className="col-start-1 row-start-4">
        <div
          ref={chatAreaRef}
          className="h-[100px] flex-1 overflow-y-auto py-4 space-y-2 hide-scrollbar"
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
        <ChatForm onSendMessage={handleSendMessage} />
      </div>

      {/* <EnemiesList enemyData={enemyData} /> */}
      {/* <div className="player-list col-start-3 row-start-1">
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
      </div> */}

      {/* <PlayerInfo playerName={playerName} players={players} userId={userId} /> */}
      <div className="col-start-3 row-start-4"></div>
    </main>
  );
}
