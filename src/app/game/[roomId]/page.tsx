// app/game/[roomId]/page.tsx

"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function GameRoom() {
  const { roomId } = useParams();
  const [playerName, setPlayerName] = useState("");
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    // Simulasi log awal
    setLog([
      "Welcome to Elysium Rift.",
      "You have entered the realm of Room ID: " + roomId,
      "Players List:",
      "1. Player A",
      "2. Player B",
      "Prepare yourself...",
    ]);
  }, [roomId]);

  return (
    <main className="min-h-screen  text-white p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-amber-400 mb-4">Elysium Rift</h1>
      <p className="text-sm mb-6">Room: {roomId}</p>

      <section className="bg-gray-800 p-4 rounded-lg w-full max-w-xl mb-4">
        <h2 className="text-lg font-semibold mb-2">Battle Log</h2>
        <div className="h-56 overflow-y-auto space-y-1 text-sm">
          {log.map((entry, index) => (
            <p key={index}>➤ {entry}</p>
          ))}
        </div>
      </section>

      <section className="w-full max-w-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Logic aksi seperti "Go to Yggdrasil Forest"
            setLog((prev) => [...prev, `You chose: ${playerName}`]);
            setPlayerName("");
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
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
