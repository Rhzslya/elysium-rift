import React, { useState } from "react";

const ChatForm = ({
  onSendMessage,
}: {
  onSendMessage: (message: string) => void;
}) => {
  const [message, setMessage] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted");
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex px-3 gap-x-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 p-2 rounded bg-gray-700 outline-none"
        placeholder="Type your action..."
      />

      <button
        type="submit"
        className="hidden bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded text-black font-semibold"
      >
        Send
      </button>
    </form>
  );
};

export default ChatForm;
