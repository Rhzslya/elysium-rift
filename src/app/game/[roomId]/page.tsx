"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { socket } from "../../../lib/socketClient";

export default function GameRoom() {
  const { roomId } = useParams();
  const searchParams = useSearchParams();
  const playerName = searchParams.get("name");

  const [log, setLog] = useState<string[]>([]);
  const [players, setPlayers] = useState<string[]>([]);
  const [message, setMessage] = useState<string[]>([]);

  console.log(playerName);

  useEffect(() => {
    if (!playerName) return;

    // Simulasi log awal
    setPlayers([playerName]);
    setLog([
      "Welcome to Elysium Rift.",
      "You have entered the realm of Room ID: " + roomId,
      "Prepare yourself...",
    ]);

    socket.emit("join-room", roomId, playerName);

    socket.on("update-players", (playersList: string[]) => {
      setPlayers(playersList);
    });

    return () => {
      socket.off("update-players");
    };
  }, [roomId]);

  useEffect(() => {
    // Hanya menambahkan pesan jika pemain baru belum ada di dalam daftar pesan
    socket.on("user-joined", (data) => {
      if (!message.includes(`${data.username} joined the room`)) {
        setMessage((prev) => [...prev, `${data.username} joined the room`]);
      }
    });

    return () => {
      socket.off("user-joined");
      socket.off("message");
    };
  }, [message]);

  return (
    <main className="min-h-screen text-white p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-amber-400 mb-4">Elysium Rift</h1>
      <p className="text-sm mb-6">Room: {roomId}</p>

      <section className="bg-gray-800 p-4 rounded-lg w-full max-w-xl mb-4">
        <h2 className="text-lg font-semibold mb-2">Battle Log</h2>
        <div className="h-56 overflow-y-auto space-y-1 text-sm">
          {log.map((entry, index) => (
            <p key={index}>➤ {entry}</p>
          ))}
          <div className="flex flex-col gap-2 w-full">
            {message.map((msg, index) => (
              <div
                key={index}
                className="flex justify-center items-center text-xs mx-auto bg-green-600 text-white p-2 rounded-lg mb-2 transition-all"
              >
                <p>{msg}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-800 p-4 rounded-lg w-full max-w-xl mb-4">
        <h2 className="text-lg font-semibold mb-2">Players List</h2>
        <ul className="space-y-1 text-sm">
          {players.map((player, index) => (
            <li key={index}>
              {index + 1}. {player}
            </li>
          ))}
        </ul>
      </section>

      <section className="w-full max-w-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // clear input
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            className="flex-1 p-2 rounded bg-gray-700 outline-none"
            placeholder="Type your action..."
          />
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded text-black font-semibold"
          >
            Send
          </button>
        </form>
      </section>
    </main>
  );
}
