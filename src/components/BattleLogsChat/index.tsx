import React from "react";
import { ResolvedEnemy, Role, Stage } from "@/utils/Type";
import { Sword, X } from "lucide-react";

const RoleCard = ({
  role,
  onSelect,
}: {
  role: Role;
  onSelect: (role: Role) => void;
}) => (
  <button
    onClick={() => onSelect(role)}
    className="bg-gray-800 text-white rounded-xl border border-white cursor-pointer shadow-md p-4 text-left 
      transform transition-all duration-200 ease-in-out hover:scale-105 hover:bg-gray-700 hover:shadow-lg"
  >
    <h2 className="text-lg font-bold text-amber-300 mb-1">{role.name}</h2>
    <p className="text-sm text-gray-300 mb-2">{role.description}</p>
    <div className="text-xs text-gray-400 mb-2 space-y-1">
      <p>🗡️ Attack: {role.stats.attack}</p>
      <p>❤️ Health: {role.stats.maxHealth}</p>
      <p>🛡️ Defense: {role.stats.defense}</p>
      <p>⚡ Speed: {role.stats.energy}</p>
    </div>
    <p className="italic text-emerald-400 text-sm">Passive: {role.passive}</p>
  </button>
);

const BattleLogsChat = ({
  logs,
  countdown,
  tempMessage,
  gameStarted,
  handleSelectionRoles,
  hasChosenRole,
  availableRoles,
  stage,
  enemyData,
  handleAttackEnemy,
  turnMessages,
}: {
  logs: { sender: string; message: string }[];
  countdown: number | null;
  tempMessage: string | null;
  availableRoles: Role[];
  gameStarted: boolean;
  handleSelectionRoles: (role: Role) => void;
  hasChosenRole: boolean;
  stage: Stage | null;
  enemyData: ResolvedEnemy[];
  handleAttackEnemy: (enemyId: string) => void;
  turnMessages: string | null;
}) => {
  const [selectedEnemyId, setSelectedEnemyId] = React.useState<string | null>(
    null
  );
  const [isSelectingEnemy, setIsSelectingEnemy] = React.useState(false);

  const handleSingleAttackEnemy = () => {
    if (!selectedEnemyId) {
      setIsSelectingEnemy(!isSelectingEnemy);
    } else {
      handleAttackEnemy(selectedEnemyId);
      setSelectedEnemyId(null);
      setIsSelectingEnemy(false);
    }
  };

  const cancelSelectionEnemy = () => {
    setSelectedEnemyId(null);
    setIsSelectingEnemy(false);
  };

  return (
    <section className="relative flex flex-col justify-center items-center text-sm px-4">
      <div className="battle-logs-chat w-full max-w-3xl space-y-2">
        {typeof countdown === "number" && countdown > 0 && (
          <div className="text-center font-semibold text-yellow-300 animate-pulse">
            Game will start in {countdown} seconds
          </div>
        )}

        {tempMessage && countdown === null && (
          <div className="text-center">
            <span className="text-red-400 font-medium">{tempMessage}</span>
          </div>
        )}

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

      {!hasChosenRole && gameStarted && availableRoles?.length > 0 && (
        <div className="selection-roles mt-6 w-full max-w-4xl">
          <h1 className="text-xl font-semibold text-center text-amber-400">
            Select Your Role
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {availableRoles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                onSelect={handleSelectionRoles}
              />
            ))}
          </div>
        </div>
      )}
      {stage && gameStarted && !tempMessage && (
        <div className="stage-section w-full max-w-4xl space-y-6 border rounded-md border-gray-700">
          <div className="px-6 py-4 ">
            <h1 className="text-2xl font-bold text-amber-400 text-center tracking-wide">
              {stage.stageName}
            </h1>
          </div>
          <div className="flex p-6 m-0 mb-2 border-b border-gray-700">
            <p className="text-base text-gray-300 leading-relaxed">
              {stage.intro}
            </p>
          </div>

          <div className="relative grid grid-cols-3 grid-rows-3 gap-2 py-2">
            {selectedEnemyId && (
              <div className="button-cancel col-start-3 row-start-1 flex ml-auto mr-4">
                <button
                  className="cursor-pointer hover:text-red-500 duration-300"
                  onClick={cancelSelectionEnemy}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            )}
            <div className="button-attack row-span-2 col-start-3 row-start-2 flex justify-center items-center">
              <button
                onClick={handleSingleAttackEnemy}
                className={`${
                  selectedEnemyId ? "bg-red-500" : "bg-red-400"
                } relative hover:bg-red-600 cursor-pointer text-white font-semibold p-3 rounded-full flex items-center justify-center shadow-lg ml-8`}
              >
                <Sword className="w-6 h-6" />
              </button>
            </div>

            {isSelectingEnemy && (
              <div className="col-span-2 col-start-1 row-start-3 flex justify-center ml-auto">
                <div className="flex ">
                  {enemyData
                    .filter((e) => e.isAlive)
                    .map((enemy) => (
                      <button
                        key={enemy.id}
                        onClick={() => {
                          setSelectedEnemyId(enemy.id);
                          setIsSelectingEnemy(false);
                        }}
                        className={`text-left cursor-pointer text-white text-sm py-1 px-2 rounded-sm transition-all duration-200 font-medium ${
                          selectedEnemyId === enemy.id
                            ? "bg-emerald-500 text-white ring-2 ring-emerald-300"
                            : "hover:bg-gray-100 text-gray-800"
                        }`}
                      >
                        {enemy.name}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {turnMessages && (
        <div className="absolute  z-50 w-full flex justify-center">
          <div
            className={`px-6 py-3 rounded-xl text-white text-xl font-bold tracking-wide bg-gradient-to-r ${
              turnMessages.toLowerCase() === "your turn"
                ? "from-green-400 via-emerald-500 to-teal-600"
                : "from-red-500 via-pink-600 to-rose-700"
            } shadow-lg`}
          >
            {turnMessages}
          </div>
        </div>
      )}
    </section>
  );
};

export default BattleLogsChat;
