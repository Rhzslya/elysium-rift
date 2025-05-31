import React from "react";
import ChatBox from "../ChatBox";
import { ResolvedEnemy, Stage } from "@/utils/Type";
import EnemiesList from "../EnemiesList";

const BoxRight = ({
  chatAreaRef,
  messages,
  playerName,
  enemyData,
}: {
  chatAreaRef: React.RefObject<HTMLDivElement | null>;
  messages: { sender: string; message: string }[];
  playerName: string | null;
  stage: Stage | null;
  enemyData: ResolvedEnemy[];
}) => {
  console.log(enemyData);
  return (
    <section className="relative msg-box min-h-screen text-white flex flex-col gap-4 items-center">
      {enemyData.length > 0 && <EnemiesList enemyData={enemyData} />}
      <div
        className={`flex flex-col w-full max-w-xl ${
          enemyData.length > 0 ? "h-[242px]" : "h-[500px]"
        } overflow-y-auto bg-gray-800 rounded-lg`}
      >
        <div className="sticky top-0 bg-gray-800 z-10 px-4 py-2 border-b border-gray-700">
          <h2 className="text-2xl font-semibold">Chat Box</h2>
        </div>

        {/* Scrollable chat area */}
        <div
          ref={chatAreaRef}
          className="flex-1 overflow-y-auto p-4 space-y-2 hide-scrollbar"
        >
          {messages.map((msg, index) => (
            <ChatBox
              key={index}
              sender={msg.sender === playerName ? "You" : msg.sender}
              message={msg.message}
              isOwnMessage={msg.sender === playerName}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BoxRight;
