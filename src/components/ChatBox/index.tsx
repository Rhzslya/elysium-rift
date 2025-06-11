"use client";

import React, { useState } from "react";

interface ChatBoxProps {
  sender: string;
  message: string;
  isOwnMessage: boolean;
}

const ChatBox = ({ sender, message, isOwnMessage }: ChatBoxProps) => {
  const isSystemMessage = sender === "system";
  console.log(message);
  return (
    <section className="">
      <div className={`flex text-sm`}>
        <div
          className={`max-w-xs min-w-[120px] px-2 rounded-md ${
            isSystemMessage
              ? "text-amber-400"
              : isOwnMessage
              ? "text-sky-400"
              : "text-red-400"
          }`}
        >
          <p className="text-sm text-wrap">{`${sender} : ${message}`}</p>
        </div>
      </div>
    </section>
  );
};

export default ChatBox;
