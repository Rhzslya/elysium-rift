import React from "react";

const BattleLogsChat = ({
  sender,
  message,
}: {
  sender: string;
  message: string;
}) => {
  const isSystemBattleLogsMessager = sender === "systemBattleLogs";
  return (
    <section>
      <div className={`flex justify-center items-center mb-3 text-sm`}>
        <div className="battle-logs-chat">
          <p
            className={`font-semibold ${
              isSystemBattleLogsMessager ? "text-amber-400" : "text-blue-400"
            }`}
          >
            {message}
          </p>
        </div>
      </div>
    </section>
  );
};

export default BattleLogsChat;
