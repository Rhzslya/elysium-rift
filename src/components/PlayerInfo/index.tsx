import React from "react";

const PlayerInfo = ({
  playerName,
  players,
}: {
  playerName: string | null;
  players: { username: string; isReady: boolean }[];
}) => {
  return (
    <section className="player-list rrelative  min-h-screen text-white flex flex-col gap-4 items-center">
      <div className="flex flex-col w-full max-w-xl h-[242px] overflow-y-auto bg-gray-800 rounded-lg">
        <div className="sticky top-0 bg-gray-800 z-10 px-4 py-2 border-b border-gray-700">
          <h2 className="text-2xl font-semibold">Player List</h2>
        </div>
        <div className="flex justify-between items-center text-xs">
          <ul className="space-y-1 w-full">
            {players.map((player, index) => (
              <li
                key={index}
                className={`flex justify-between items-center text-base px-2 py-1 rounded
      ${
        player.username === playerName
          ? "text-amber-400 font-bold"
          : "text-white"
      }`}
              >
                <span>
                  {index + 1}. {player.username}
                </span>
                {player.isReady ? (
                  <span className="text-green-400 text-sm font-semibold ml-2">
                    (Ready)
                  </span>
                ) : (
                  <span className="text-red-400 text-sm font-semibold ml-2">
                    (Not Ready)
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-col w-full max-w-xl h-[242px] overflow-y-auto bg-gray-800 rounded-lg">
        <div className="sticky top-0 bg-gray-800 z-10 px-4 py-2 border-b border-gray-700">
          <h2 className="text-2xl font-semibold">Player Status</h2>
        </div>
      </div>
    </section>
  );
};

export default PlayerInfo;
