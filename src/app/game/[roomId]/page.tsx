"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { socket } from "../../../lib/socketClient";
import BattleLogs from "@/components/BattleLogs";
import BoxRight from "@/components/BoxRight";
import PlayerInfo from "@/components/PlayerInfo";
import { ResolvedEnemy, Player, Role } from "@/utils/Type";
import TitleRoom from "@/components/TitleRoom";
import ChatBox from "@/components/ChatBox";

export default function GameRoom() {
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
  const [userId, setUserId] = useState<string | undefined>();
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

  useEffect(() => {
    const storedUserId = sessionStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
    if (!userId || !playerName || !roomId || hasJoined) return;

    setPlayers([{ userId, username: playerName, isReady: false, roles: null }]);
    socket.emit("join-room", {
      roomId,
      username: playerName,
      userId,
    });

    setHasJoined(true);

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
      countdown: countdown,
    });
  };

  useEffect(() => {
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
    socket.emit("exit-room", roomId, playerName);

    router.push("/");
  };

  const handleSendMessage = (message: string) => {
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
    socket.emit("player-selected-role", { roomId, userId, role });
    setHasChosenRole(true);
  };

  const handleAttackEnemy = (enemyId: string) => {
    if (!stage || !userId) return;

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
        className="col-start-1 row-start-4 h-[200px] flex-1 overflow-y-auto p-4 space-y-2 hide-scrollbar"
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
      <div className="row-span-3 col-start-1 row-start-1">Enemy Status</div>
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
      <div className="row-span-2 col-start-3 row-start-2">Player Status</div>
      <div className="col-start-3 row-start-4">Skill Button</div>
    </main>
  );
}
