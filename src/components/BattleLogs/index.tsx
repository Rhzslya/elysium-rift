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
          className={`max-w-xs px-4 py-2 rounded-lg ${
            isSystemMessage
              ? "bg-gray-700 text-xs"
              : isOwnMessage
              ? "bg-green-600"
              : "bg-red-600"
          }`}
        >
          {!isSystemMessage && <p className="text-white font-bold">{sender}</p>}
          <p>{message}</p>
        </div>
      </div>
    </section>
  );
};

export default BattleLogs;
