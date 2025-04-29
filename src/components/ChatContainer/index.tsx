import React from "react";
import ChatBox from "../ChatBox";

const ChatContainer = ({
  chatAreaRef,
  messages,
  playerName,
}: {
  chatAreaRef: React.RefObject<HTMLDivElement | null>;
  messages: { sender: string; message: string }[];
  playerName: string | null;
}) => {
  return (
    <section className="relative msg-box min-h-screen text-white flex flex-col items-center">
      <div className="flex flex-col w-full max-w-xl h-[500px] bg-gray-800 rounded-lg overflow-hidden">
        {/* Fixed title */}
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

export default ChatContainer;
