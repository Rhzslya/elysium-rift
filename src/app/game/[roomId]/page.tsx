"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { socket } from "../../../lib/socketClient";
import BattleLogs from "@/components/BattleLogs";
import ChatForm from "@/components/ChatForm";

export default function GameRoom() {
  const { roomId } = useParams();
  const searchParams = useSearchParams();
  const playerName = searchParams.get("name");
  const router = useRouter();

  const [log, setLog] = useState<string[]>([]);
  const [players, setPlayers] = useState<string[]>([]);
  const [messages, setMessages] = useState<
    { sender: string; message: string }[]
  >([]);

  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (!playerName || !roomId || hasJoined) return;
    setPlayers([playerName]);

    // Simulasi log awal
    // setLog([
    //   "Welcome to Elysium Rift.",
    //   "You have entered the realm of Room ID: " + roomId,
    //   "Prepare yourself...",
    // ]);

    socket.emit("join-room", { roomId, username: playerName }); // Join room

    setHasJoined(true);
    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("user-joined", (message) => {
      setMessages((prev) => [...prev, { sender: "system", message }]);
    });

    socket.on("update-players", (playersList: string[]) => {
      setPlayers([...playersList]);
    });

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

  return (
    <main className="min-h-screen text-white p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-amber-400 mb-4">Elysium Rift</h1>
      <p className="text-sm mb-6">Room: {roomId}</p>
      <div className="flex w-full max-w-xl h-[500px] overflow-y-auto p-4 mb-4 bg-gray-800 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Battle Log</h2>
        {messages.map((msg, index) => (
          <BattleLogs
            key={index}
            sender={msg.sender}
            message={msg.message}
            isOwnMessage={msg.sender === playerName}
          />
        ))}
      </div>

      <section className="bg-gray-800 p-4 rounded-lg w-full max-w-xl mb-4">
        <h2 className="text-lg font-semibold mb-2">Players List</h2>
        <ul className="space-y-1 text-sm">
          {players.map((player, index) => (
            <li
              key={index}
              className={
                player === playerName ? "text-amber-400 font-bold" : ""
              }
            >
              {index + 1}. {player}
            </li>
          ))}
        </ul>
      </section>

      <section className="w-full max-w-xl">
        <ChatForm onSendMessage={handleSendMessage} />
        <div className="exit-btn mt-3 mr-auto">
          <button
            onClick={handleExitRoom}
            className="cursor-pointer bg-red-400 hover:bg-red-600 px-4 py-2 rounded text-black font-semibold"
          >
            Exit
          </button>
        </div>
      </section>
    </main>
  );
}
