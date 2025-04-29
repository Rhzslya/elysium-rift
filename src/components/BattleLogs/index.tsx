"use client";

import React, { useState } from "react";

interface BattleLogsProps {
  sender: string;
  message: string;
  isOwnMessage: boolean;
}

const BattleLogs = ({ sender, message, isOwnMessage }: BattleLogsProps) => {
  const isSystemMessage = sender === "system";
  return (
    <section className="">
      <div
        className={`flex ${
          isSystemMessage
            ? "justify-center"
            : isOwnMessage
            ? "justify-end"
            : "justify-start"
        } mb-3 text-sm`}
      >
        <div
          className={`max-w-xs min-w-[120px] px-2 py-1 rounded-md ${
            isSystemMessage
              ? "bg-gray-500 text-neutral-200 text-center"
              : isOwnMessage
              ? "bg-blue-400 text-white"
              : "bg-gray-600 text-white"
          }`}
        >
          {!isSystemMessage && <p className="font-semibold">{sender}</p>}
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </section>
  );
};

export default BattleLogs;
