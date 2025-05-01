"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { socket } from "../../../lib/socketClient";
import PlayerList from "@/components/PlayerList";
import BattleLogs from "@/components/BattleLogs";
import ChatContainer from "@/components/ChatContainer";

export default function GameRoom() {
  const { roomId } = useParams();
  const searchParams = useSearchParams();
  const playerName = searchParams.get("name");
  const router = useRouter();
  const [readyPlayers, setReadyPlayers] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [countdownMessage, setCountdownMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ sender: string; message: string }[]>([]);
  const [players, setPlayers] = useState<
    { username: string; isReady: boolean }[]
  >([]);
  const [messages, setMessages] = useState<
    { sender: string; message: string }[]
  >([]);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (!playerName || !roomId || hasJoined) return;
    setPlayers([{ username: playerName, isReady: false }]);

    socket.emit("join-room", { roomId, username: playerName }); // Join room

    setHasJoined(true);
    socket.on("message", (data) => {
      const { sender, message } = data;

      if (sender === "systemBattleLogs") {
        setLogs((prev) => [...prev, { sender, message }]);
      } else {
        setMessages((prev) => [...prev, { sender, message }]); // Masukkan ke chat biasa
      }
    });

    socket.on("user-joined", (message) => {
      setMessages((prev) => [...prev, { sender: "system", message }]);
    });

    socket.on(
      "update-players",
      (playersList: { username: string; isReady: boolean }[]) => {
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
      socket.off("user-left");
    };
  }, [roomId, playerName, socket]);

  const handleReady = () => {
    const newIsReady = !readyPlayers;

    socket.emit("game-start", {
      roomId,
      isReady: newIsReady,
      countdown: countdown,
    });

    setReadyPlayers(newIsReady);
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

    // Optional: emit untuk sync status saat client baru masuk
    socket.emit("game-started", handleGameStarted);

    return () => {
      socket.off("countdown", handleCountdown);
      socket.off("game-started", handleGameStarted);
    };
  }, []);

  console.log(countdown);
  console.log(gameStarted);

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
    // Scroll ke bawah setiap kali messages berubah
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

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
        readyPlayers={readyPlayers}
        handleReady={handleReady}
        handleExitRoom={handleExitRoom}
        handleSendMessage={handleSendMessage}
      />
      <PlayerList playerName={playerName} players={players} />
    </main>
  );
}
