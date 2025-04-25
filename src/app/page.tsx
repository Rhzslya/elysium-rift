"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import Modal from "./components/Modal";

export default function Home() {
  const [playerName, setPlayerName] = useState("");
  const [showStartModal, setShowStartModal] = useState(false);
  const router = useRouter();

  const handleStart = () => {
    if (!playerName.trim()) return;
    const roomId = nanoid(6); // Generate unique room ID
    router.push(`/game/${roomId}?name=${encodeURIComponent(playerName)}`);
  };
  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-white p-4">
      <h1 className="text-5xl font-extrabold mb-6 tracking-wide text-amber-400">
        Elysium Rift
      </h1>
      <p className="text-sm text-gray-300 mb-10 text-center max-w-md">
        Step into a world of choices and fate. Choose your path, strengthen your
        character, and face your opponent in an epic duel.
      </p>
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <button
          onClick={() => setShowStartModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 rounded-xl shadow-md transition"
        >
          Start Game
        </button>
        <button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 rounded-xl shadow-md transition">
          Join Room
        </button>
        <button className="border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white py-3 rounded-xl shadow-md transition">
          Credits
        </button>
      </div>
      {showStartModal && (
        <Modal
          playerName={playerName}
          setPlayerName={setPlayerName}
          setShowStartModal={setShowStartModal}
          handleStart={handleStart}
        />
      )}
    </main>
  );
}
