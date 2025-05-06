import React from "react";

const BattleLogsChat = ({
  logs,
  countdown,
  tempMessage,
}: {
  logs: { sender: string; message: string }[];
  countdown: number | null;
  tempMessage: string | null;
}) => {
  return (
    <section>
      <div className="flex justify-center items-center mb-3 text-sm">
        <div className="battle-logs-chat">
          {typeof countdown === "number" && countdown > 0 && (
            <div>Game Will Start in {countdown} seconds</div>
          )}
          <div className="temp-message">
            <span className="text-red-400">{tempMessage}</span>
          </div>
          {logs.map((log, index) => (
            <p
              key={index}
              className={`font-semibold ${
                log.sender === "systemBattleLogs"
                  ? "text-amber-400"
                  : "text-blue-400"
              }`}
            >
              {log.message}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BattleLogsChat;
