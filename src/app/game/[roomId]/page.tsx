"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { socket } from "../../../lib/socketClient";
import BattleLogs from "@/components/BattleLogs";
import ChatContainer from "@/components/ChatContainer";
import PlayerInfo from "@/components/PlayerInfo";

export default function GameRoom() {
  const { roomId } = useParams();
  const searchParams = useSearchParams();
  const playerName = searchParams.get("name");
  const router = useRouter();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [tempMessage, setTempMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ sender: string; message: string }[]>([]);
  const [players, setPlayers] = useState<
    {
      userId: string | undefined;
      username: string;
      isReady: boolean;
      roles: string[];
    }[]
  >([]);
  const [userId, setUserId] = useState<string | undefined>();
  const [messages, setMessages] = useState<
    { sender: string; message: string }[]
  >([]);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<any>([]);
  const [hasChosenRole, setHasChosenRole] = useState(false);

  console.log(userId);
  console.log(players);

  useEffect(() => {
    const storedUserId =
      sessionStorage.getItem("userId") || crypto.randomUUID();
    sessionStorage.setItem("userId", storedUserId);
    setUserId(storedUserId);
  }, []);

  useEffect(() => {
    if (!userId || !playerName || !roomId || hasJoined) return;

    setPlayers([{ userId, username: playerName, isReady: false, roles: [] }]);
    socket.emit("join-room", {
      roomId,
      username: playerName,
      userId,
    });

    setHasJoined(true);
    socket.on("message", (data) => {
      const { sender, message } = data;

      if (sender === "systemBattleLogs") {
        setLogs((prev) => [...prev, { sender, message }]);
      } else {
        setMessages((prev) => [...prev, { sender, message }]);
      }
    });

    socket.on("temp-message", ({ message }) => {
      setTempMessage(message);
    });

    socket.on("user-joined", (message) => {
      setMessages((prev) => [...prev, { sender: "system", message }]);
    });

    socket.on(
      "update-players",
      (
        playersList: {
          userId: string | undefined;
          username: string;
          isReady: boolean;
          roles: string[];
        }[]
      ) => {
        setPlayers(playersList);
      }
    );

    socket.on("user-left", (message) => {
      setMessages((prev) => [...prev, { sender: "system", message }]);
    });

    return () => {
      socket.removeAllListeners("message");
      socket.removeAllListeners("user-joined");
      socket.removeAllListeners("update-players");
      socket.removeAllListeners("game-started");
      socket.off("user-left");
      socket.off("game-started");
    };
  }, [userId, roomId, playerName, socket]);

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

  setTimeout(() => {
    if (tempMessage) {
      setTempMessage("");
    }
  }, 3000);

  console.log(gameStarted);

  return (
    <main className="min-h-screen text-white p-6 grid grid-cols-[0.5fr_1fr_0.5fr] gap-4">
      <div className="title col-span-3 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-amber-400 mb-4">Elysium Rift</h1>
        <p className="text-sm mb-6">Room: {roomId}</p>
      </div>
      <ChatContainer
        chatAreaRef={chatAreaRef}
        messages={messages}
        playerName={playerName}
      />
      <BattleLogs
        countdown={countdown}
        logs={logs}
        tempMessage={tempMessage}
        handleReady={handleReady}
        handleExitRoom={handleExitRoom}
        handleSendMessage={handleSendMessage}
        players={players}
        userId={userId}
        availableRoles={availableRoles}
        hasChosenRole={hasChosenRole}
      />
      <PlayerInfo playerName={playerName} players={players} />
    </main>
  );
}
