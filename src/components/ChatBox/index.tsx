"use client";

import { capitalizeFirst } from "@/utils/Capitalize";
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
          className={`max-w-[90%] sm:max-w-[70%] min-w-[120px] px-2 rounded-md ${
            isSystemMessage
              ? "text-amber-400"
              : isOwnMessage
              ? "text-sky-300"
              : "text-red-300"
          }`}
        >
          <p className="text-sm break-all whitespace-pre-wrap">
            {`${
              sender === "system" ? capitalizeFirst(sender) : sender
            } : ${message}`}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ChatBox;
