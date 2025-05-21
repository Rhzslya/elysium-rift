"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { socket } from "../../../lib/socketClient";
import BattleLogs from "@/components/BattleLogs";
import BoxRight from "@/components/BoxRight";
import PlayerInfo from "@/components/PlayerInfo";
import { Enemies, Player, Role } from "@/utils/Type";

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
  const [enemyData, setEnemyData] = useState<Enemies[]>([]);
  const [attackingEnemyId, setAttackingEnemyId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | "">("");

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
      setNotification(message);

      if (duration) {
        setTimeout(() => {
          setNotification("");
        }, duration);
      }
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
    };
  }, [userId, roomId, playerName]);

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

    console.log("Ok");
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

  return (
    <main className="min-h-screen text-white p-6 grid grid-cols-[0.5fr_1fr_0.5fr] gap-4">
      <div className="title col-span-3 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-amber-400 mb-4">Elysium Rift</h1>
        <p className="text-sm mb-6">Room: {roomId}</p>
      </div>
      <BoxRight
        chatAreaRef={chatAreaRef}
        messages={messages}
        playerName={playerName}
        stage={stage}
        enemyData={enemyData}
      />
      <BattleLogs
        countdown={countdown}
        logs={logs}
        tempMessage={tempMessage}
        handleReady={handleReady}
        handleExitRoom={handleExitRoom}
        handleSendMessage={handleSendMessage}
        players={players}
        setPlayers={setPlayers}
        userId={userId}
        gameStarted={gameStarted}
        handleSelectionRoles={handleSelectionRoles}
        handleAttackEnemy={handleAttackEnemy}
        hasChosenRole={hasChosenRole}
        stage={stage}
        enemyData={enemyData}
        notification={notification}
      />
      <PlayerInfo playerName={playerName} players={players} userId={userId} />
    </main>
  );
}
