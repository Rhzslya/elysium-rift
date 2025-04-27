"use client";

import React, { useState } from "react";

const BattleLogs = ({ log }: { log: string[] }) => {
  const [message, setMessage] = useState<string[]>([]);
  return (
    <section className="bg-gray-800 p-4 rounded-lg w-full max-w-xl mb-4">
      <h2 className="text-lg font-semibold mb-2">Battle Log</h2>
      <div className="h-56 overflow-y-auto space-y-1 text-sm">
        {log.map((entry, index) => (
          <p key={index}>➤ {entry}</p>
        ))}
      </div>
    </section>
  );
};

export default BattleLogs;
