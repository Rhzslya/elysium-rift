import React from "react";

const SideBar = ({
  players,
  playerName,
}: {
  players: string[];
  playerName: string;
}) => {
  return (
    <section className="absolute left-20 top-10 max-w-xs bg-gray-800 p-4 rounded-lg w-full  mb-4">
      <h2 className="text-lg font-semibold mb-2">Players List</h2>
      <ul className="space-y-1 text-sm">
        {players.map((player, index) => (
          <li
            key={index}
            className={player === playerName ? "text-amber-400 font-bold" : ""}
          >
            {index + 1}. {player}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SideBar;
