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
  const [readyPlayers, setReadyPlayers] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const [log, setLog] = useState<string[]>([]);
  const [players, setPlayers] = useState<
    { username: string; isReady: boolean }[]
  >([]);
  const [messages, setMessages] = useState<
    { sender: string; message: string }[]
  >([]);

  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (!playerName || !roomId || hasJoined) return;
    setPlayers([{ username: playerName, isReady: false }]);

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
    socket.emit("player-ready", {
      roomId,
      username: playerName,
      isReady: !readyPlayers,
    });

    setReadyPlayers(!readyPlayers);
  };

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
    <main className="min-h-screen text-white p-6 grid grid-cols-[0.5fr_1fr_0.5fr] gap-4">
      <div className="title col-span-3 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-amber-400 mb-4">Elysium Rift</h1>
        <p className="text-sm mb-6">Room: {roomId}</p>
      </div>
      <section></section>
      <section className="min-h-screen text-white flex flex-col items-center">
        <div className="flex flex-col w-full max-w-xl h-[500px] overflow-y-auto p-4 mb-4 bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">Battle Log</h2>
          {messages.map((msg, index) => (
            <BattleLogs
              key={index}
              sender={msg.sender === playerName ? "You" : msg.sender}
              message={msg.message}
              isOwnMessage={msg.sender === playerName}
            />
          ))}
        </div>

        <div className="w-full max-w-xl">
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

            <div className="ready-btn mt-3 w-full">
              <button
                onClick={handleReady}
                className={`w-full cursor-pointer px-4 py-2 rounded text-black font-semibold transition-colors duration-200
      ${
        readyPlayers
          ? "bg-yellow-300 hover:bg-yellow-500"
          : "bg-green-400 hover:bg-green-600"
      }
    `}
                aria-pressed={readyPlayers}
              >
                {readyPlayers ? "Cancel Ready" : "I'm Ready"}
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="flex bg-gray-800 max-h-[500px] p-4 rounded-lg w-full max-w-xl mb-4">
        <div className="w-full">
          <h2 className="text-2xl font-semibold mb-2">Players List</h2>
          <div className="flex justify-between items-center text-xs">
            <ul className="space-y-1 w-full">
              {players.map((player, index) => (
                <li
                  key={index}
                  className={`flex justify-between items-center text-base px-2 py-1 rounded
          ${
            player.username === playerName
              ? "text-amber-400 font-bold"
              : "text-white"
          }`}
                >
                  <span>
                    {index + 1}. {player.username}
                  </span>
                  {player.isReady ? (
                    <span className="text-green-400 text-sm font-semibold ml-2">
                      (Ready)
                    </span>
                  ) : (
                    <span className="text-red-400 text-sm font-semibold ml-2">
                      (Not Ready)
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
