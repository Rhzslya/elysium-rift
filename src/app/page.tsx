"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import Modal from "../components/Modal";
import { socket } from "@/lib/socketClient";
import ModalJoinRoom from "@/components/ModalJoinRoom";

export default function Home() {
  const [playerName, setPlayerName] = useState("");
  const [showStartModal, setShowStartModal] = useState(false);
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedUserId =
      sessionStorage.getItem("userId") || crypto.randomUUID();
    sessionStorage.setItem("userId", storedUserId);
  }, []);

  const handleStart = () => {
    if (!playerName.trim()) return;
    const roomId = nanoid(6);
    router.push(`/game/${roomId}?name=${encodeURIComponent(playerName)}`);
    const userId = sessionStorage.getItem("userId");
    socket.emit("join-room", {
      roomId,
      username: playerName,
      userId,
    });
  };

  const handleJoinRoom = () => {
    if (!roomCode.trim() || !playerName.trim()) return;

    socket.emit(
      "check-room",
      roomCode,
      (exists: boolean, gameStarted: boolean) => {
        if (exists) {
          router.push(
            `/game/${roomCode}?name=${encodeURIComponent(playerName)}`
          );
        } else if (gameStarted) {
          setMessage("Game already started!");
        } else {
          setMessage("Room not found!");
        }
      }
    );
  };

  useEffect(() => {
    if (message) {
      setTimeout(() => {
        setMessage("");
      }, 3000);
    }
  });

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
        <button
          onClick={() => setShowJoinModal(true)}
          className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 rounded-xl shadow-md transition"
        >
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
      {showJoinModal && (
        <ModalJoinRoom
          playerName={playerName}
          roomCode={roomCode}
          setPlayerName={setPlayerName}
          setRoomCode={setRoomCode}
          setShowJoinModal={setShowJoinModal}
          handleJoin={handleJoinRoom}
          message={message}
        />
      )}
    </main>
  );
}
