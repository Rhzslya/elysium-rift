"use client";

import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import ModalJoinRoom from "@/components/ModalJoinRoom";
import { useUserSocket } from "@/utils/Contexts";

export default function Home() {
  const [playerName, setPlayerName] = useState("");
  const [showStartModal, setShowStartModal] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { userId, socket } = useUserSocket();

  const handleStart = () => {
    if (!playerName.trim() || !userId || !socket) return;

    const roomId = nanoid(6);
    router.push(
      `/game/${roomId}?name=${encodeURIComponent(playerName)}&host=true`
    );
  };

  const handleJoinRoom = () => {
    if (!roomCode.trim() || !playerName.trim() || !socket) return;

    if (!socket.connected) {
      socket.once("connect", () => doCheckRoom());
      socket.connect();
    } else {
      doCheckRoom();
    }
  };

  const doCheckRoom = () => {
    socket?.emit(
      "check-room",
      roomCode,
      (exists: boolean, gameStarted: boolean) => {
        if (exists) {
          router.push(
            `/game/${roomCode}?name=${encodeURIComponent(
              playerName
            )}&host=false`
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
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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
