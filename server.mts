// server.mts
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
import { roles } from "./src/utils/Roles/index.js";
import { stages } from "./src/utils/Stages/index.js";
import {
  EntityWithPassive,
  Player,
  ResolvedEnemy,
} from "./src/utils/Type/index.js";
import { enemies } from "./src/utils/Enemies/index.js";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handle);
  const io = new Server(httpServer);

  const roomStates: {
    [roomId: string]: {
      players?: Player[];
      countdownTimer?: NodeJS.Timeout;
      autoAssignTimeout?: NodeJS.Timeout;
      gameStarted?: boolean;
      stageNumber?: number | null;
      battleStarted?: boolean;
      playerEnemies?: {
        [socketId: string]: ResolvedEnemy[];
      };
      playerTurnDone?: Set<string>;
      currentPhase?: "player" | "enemy";
    };
  } = {};

  io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    const removePlayerFromRoom = (roomId: string, userId: string) => {
      const room = roomStates[roomId];
      if (!room || !room.players) return;

      const idx = room.players.findIndex((p) => p.userId === userId);
      if (idx !== -1) {
        room.players.splice(idx, 1);
      }
    };

    const updatePlayersList = (roomId: string, resetReady = false) => {
      const room = io.sockets.adapter.rooms.get(roomId);
      if (!room) return [];

      const players = Array.from(room)
        .map((socketId) => {
          const player = io.sockets.sockets.get(socketId);
          if (!player) return null;

          if (resetReady) player.data.isReady = false;

          return {
            userId: player.data.userId,
            username: player.data.username,
            isReady: player.data.isReady || false,
            roles: player.data.roles || null,
            roleSelected: player.data.roleSelected || false,
          };
        })
        .filter(
          (player): player is NonNullable<typeof player> => player !== null
        );

      io.to(roomId).emit("update-players", players);

      console.log(
        `Players in room ${roomId}: ${players.map((p) => p.username).join(",")}`
      );

      return players;
    };

    const clearDataAfterGameStart = (roomId: string, username: string) => {
      clearInterval(roomStates[roomId].countdownTimer);
      roomStates[roomId].countdownTimer = undefined;
      roomStates[roomId].gameStarted = false;
      roomStates[roomId].battleStarted = false;
      roomStates[roomId].stageNumber = null;
      roomStates[roomId].playerEnemies = {};

      io.to(roomId).emit("countdown", null);

      console.log(
        `room ${roomId} reset, gameStarted: ${
          roomStates[roomId].gameStarted
        } battleStarted: ${roomStates[roomId].battleStarted} stageNumber: ${
          roomStates[roomId].stageNumber
        } playerEnemies: ${JSON.stringify(roomStates[roomId].playerEnemies)}`
      );

      io.to(roomId).emit("game-started", false);
      io.to(roomId).emit("temp-message", {
        message: `${username} Rejoined. Game has been canceled.`,
      });

      resetPlayerRoles(roomId);

      const players = updatePlayersList(roomId);
      console.log(
        "Player List:",
        players?.map((p) => ({
          username: p.username,
          role: p.roles || "Not selected",
          roleSelected: p.roleSelected ?? false,
          isReady: p.isReady,
        }))
      );
      io.to(roomId).emit("update-players", players);
      io.to(roomId).emit("clear-stage");
    };

    const getEnemiesByIds = (ids: string[]) => {
      return ids.map((id, index) => {
        const baseEnemy = enemies.find((e) => e.id === id);
        if (!baseEnemy) throw new Error(`Enemy ID ${id} not found`);

        return {
          ...JSON.parse(JSON.stringify(baseEnemy)),
          id: `${id}-${index + 1}`,
        };
      });
    };

    const performTurnPhase = (roomId: string) => {
      const state = roomStates[roomId];
      if (!state) return;

      const room = io.sockets.adapter.rooms.get(roomId);
      if (!room) return;

      const players = Array.from(room).map((id) => {
        const playerSocket = io.sockets.sockets.get(id);
        return {
          type: "player" as const,
          socketId: id,
          userId: playerSocket?.data.userId,
          username: playerSocket?.data.username,
          isReady: playerSocket?.data.isReady || false,
          stats: playerSocket?.data.roles?.stats || null,
          roles: playerSocket?.data.roles || null,
        };
      });

      // Enemy attacks each player
      players.forEach((player) => {
        const enemies = state.playerEnemies?.[player.socketId] || [];
        let playerActionDelay = 0;

        enemies
          .filter((e) => e.isAlive)
          .forEach((enemy) => {
            setTimeout(async () => {
              applyPassives(enemy, { socket: undefined });

              if (player.stats?.currentHealth > 0) {
                const attack = enemy.stats.attack || 0;
                const defense = player.stats.defense || 0;
                const damage = Math.floor(attack * (100 / (100 + defense)));

                const originalHp = player.stats.currentHealth;
                const newHp = Math.max(originalHp - damage, 0);
                player.stats.currentHealth = newHp;

                io.to(player.socketId).emit("update-health", {
                  currentHealth: newHp,
                });

                console.log(
                  `🧟 ${enemy.name} menyerang ${player.username} untuk ${damage} damage. Sisa HP: ${newHp}`
                );

                if (newHp === 0) {
                  io.to(player.socketId).emit("game-over", {
                    sender: "systemBattleLogs",
                    messageId: "game-over",
                    message: "Kamu telah dikalahkan oleh musuh!",
                  });

                  stages;
                }

                // Apply passive setelah HP di-update
                applyPassives(player.roles, { socket: io.to(player.socketId) });

                io.to(player.socketId).emit("update-enemies", { enemies });
                await updatePlayersList(roomId);
              } else {
                console.log(
                  `🧟 ${enemy.name} mencoba menyerang ${player.username}, tapi dia sudah kalah.`
                );
              }
            }, playerActionDelay);

            playerActionDelay += 1500;
          });
      });

      const maxDelay = Math.max(
        ...players.map((p) => {
          const enemies =
            state.playerEnemies?.[p.socketId]?.filter((e) => e.isAlive) || [];
          return enemies.length * 1500;
        })
      );

      setTimeout(() => {
        state.currentPhase = "player";
        state.playerTurnDone?.clear();

        io.to(roomId).emit("battle-phase-update", {
          phase: "player",
          message: "Your Turn",
          duration: 2000,
        });
      }, maxDelay + 500);
    };

    const applyPassives = (
      entity: EntityWithPassive,
      context: { socket?: { emit: (event: string, data: any) => void } }
    ) => {
      const stats = entity.stats;
      const passive = entity.passive;
      if (!passive) return { doubleShotTriggered: false };

      let doubleShotTriggered = false;

      if (passive.includes("Berserk") || passive.includes("Quick Slash")) {
        const currentHP = stats.currentHealth;
        const maxHP = stats.maxHealth;
        const attackBoost = 2;

        if (currentHP < maxHP / 2 && !stats.bonusAttackApplied) {
          stats.attack += attackBoost;
          stats.bonusAttackApplied = true;

          console.log(
            `${entity.name} activated ${passive}! +${attackBoost} Attack!`
          );

          context.socket?.emit("passive-activated", {
            passive,
            message: `${passive} aktif! +${attackBoost} Attack!`,
          });
        }
      }

      if (passive.includes("Double Shot")) {
        const chance = Math.random();
        if (chance < 0.9) {
          doubleShotTriggered = true;
          console.log(`${entity.name} triggered Double Shot!`);

          context.socket?.emit("passive-activated", {
            passive,
            message: `${passive} aktif! Serangan ganda dilakukan!`,
          });
        }
      }

      return { doubleShotTriggered };
    };

    const startStage = (roomId: string, stageId: number | null) => {
      const room = io.sockets.adapter.rooms.get(roomId);
      if (!room) return;

      const stage = stages.find((s) => s.id === stageId);
      if (!stage) return;

      if (!roomStates[roomId]) {
        roomStates[roomId] = {};
      }

      roomStates[roomId].stageNumber = stageId;
      roomStates[roomId].battleStarted = true;
      roomStates[roomId].playerEnemies = {};
      roomStates[roomId].playerTurnDone = new Set();
      roomStates[roomId].currentPhase = "player";

      for (const socketId of room) {
        const enemiesForPlayer = getEnemiesByIds(stage.enemies);
        roomStates[roomId].playerEnemies![socketId] = enemiesForPlayer;

        io.to(socketId).emit("stage-started", {
          stageId: stage.id,
          stageName: stage.name,
          intro: stage.intro,
          enemies: enemiesForPlayer,
        });
      }

      setTimeout(() => {
        io.to(roomId).emit("battle-phase-update", {
          phase: "player",
          message: "Your turn",
          duration: 2000,
        });
      }, 500);

      console.log(`Stage ${stageId} started in room ${roomId}`);
    };

    const resetPlayerRoles = (roomId: string) => {
      const room = io.sockets.adapter.rooms.get(roomId);
      if (!room) return;

      for (const socketId of room) {
        const s = io.sockets.sockets.get(socketId);
        if (!s) continue;
        s.data.roles = null;
        s.data.roleSelected = false;

        io.to(socketId).emit("role-selected", {
          roomId,
          userId: s.data.userId,
          role: null,
        });
      }
    };

    socket.on("check-room", (roomId, callback) => {
      const gameStarted = roomStates[roomId]?.gameStarted ?? false;

      if (gameStarted) {
        console.log(`Room ${roomId} already started.`);
        callback(false, true);
        return;
      }

      const room = io.sockets.adapter.rooms.get(roomId);
      if (room) {
        console.log(`Room ${roomId} exists.`);
        callback(true, false);
      } else {
        console.log(`Room ${roomId} not found.`);
        callback(false, false);
      }
    });

    socket.on("join-room", ({ roomId, username, userId }, callback) => {
      const socketsInRoom = io.sockets.adapter.rooms.get(roomId);

      if (socketsInRoom) {
        for (const socketId of socketsInRoom) {
          const existingSocket = io.sockets.sockets.get(socketId);
          if (existingSocket?.data.userId === userId) {
            console.warn(
              `Duplicate userId detected: ${userId} already in room ${roomId}`
            );
            callback?.({
              success: false,
              reason: "User already joined in this room",
            });
            return;
          }
        }
      }

      // Join user ke room
      socket.join(roomId);
      socket.data.roomId = roomId; // tambahkan roomId ke data socket
      socket.data.userId = userId;
      socket.data.username = username;
      socket.data.isReady = false;

      resetPlayerRoles(roomId);

      if (roomStates[roomId]?.countdownTimer) {
        clearInterval(roomStates[roomId].countdownTimer);
        roomStates[roomId].countdownTimer = undefined;
        io.to(roomId).emit("countdown", null);
        io.to(roomId).emit("temp-message", {
          message: `${username} joined. Countdown canceled.`,
        });
      }

      if (roomStates[roomId]?.gameStarted) {
        clearDataAfterGameStart(roomId, username);
      }

      console.log(
        `User ${username} joined room ${roomId} with userId ${userId}`
      );

      const players = updatePlayersList(roomId);
      io.to(roomId).emit("update-players", players);
      socket.to(roomId).emit("user-joined", `${username} has joined the game.`);
      callback?.({ success: true });
    });

    socket.on("message", ({ message, roomId, sender }) => {
      console.log(`Message from ${sender} in room ${roomId}: ${message}`);
      socket.to(roomId).emit("message", { sender, message });
    });

    socket.on("player-ready", ({ roomId, username, isReady }) => {
      socket.data.isReady = isReady;

      const room = io.sockets.adapter.rooms.get(roomId);
      if (room) {
        const players = Array.from(room).map((id) => {
          const playerSocket = io.sockets.sockets.get(id);
          return {
            userId: playerSocket?.data.userId,
            username: playerSocket?.data.username,
            isReady: playerSocket?.data.isReady || false,
            roles: null,
          };
        });

        console.log(
          `${username} is now ${
            isReady ? "ready" : "not ready"
          } in room ${roomId}`
        );
      }
    });

    socket.on("game-start", ({ roomId, isReady, countdown }) => {
      socket.data.isReady = isReady;

      console.log(`Game Start in room ${roomId} with countdown ${countdown}`);
      const room = io.sockets.adapter.rooms.get(roomId);
      if (room) {
        const players = Array.from(room).map((id) => {
          const playerSocket = io.sockets.sockets.get(id);
          return {
            userId: playerSocket?.data.userId,
            username: playerSocket?.data.username,
            isReady: playerSocket?.data.isReady || false,
            roles: null,
          };
        });

        const allReady = players.every((player) => player.isReady);
        console.log(`All Player Ready: ${allReady}`);

        io.to(roomId).emit("update-players", players);

        if (players.length > 1 && allReady) {
          if (!roomStates[roomId]) {
            roomStates[roomId] = { gameStarted: false };
          }

          if (roomStates[roomId].countdownTimer) return;

          let countdown = 5;

          io.to(roomId).emit("countdown", countdown);

          const countdownInterval = setInterval(() => {
            countdown -= 1;
            io.to(roomId).emit("countdown", countdown);

            if (countdown <= 0) {
              clearInterval(countdownInterval);
              roomStates[roomId].countdownTimer = undefined;
              roomStates[roomId].gameStarted = true;
              io.to(roomId).emit("game-started", true);

              io.to(roomId).emit("choose-role-phase", roles);
            }
          }, 2000);

          roomStates[roomId].countdownTimer = countdownInterval;

          socket.emit("ready-status-updated", { isReady: true });
        } else if (players.length <= 1) {
          console.log(
            `Cannot Ready because there are one player in room ${roomId}`
          );

          socket.emit("ready-status-updated", { isReady: false });
        } else {
          // Jika ada yang batal siap, batalkan countdown
          if (roomStates[roomId]?.countdownTimer) {
            clearInterval(roomStates[roomId].countdownTimer);
            roomStates[roomId].countdownTimer = undefined;

            io.to(roomId).emit("countdown", null);
            io.to(roomId).emit("temp-message", {
              message: "A player is not ready. Countdown canceled.",
            });
          }

          socket.emit("ready-status-updated", { isReady });
        }
      }
    });

    socket.on("player-selected-role", ({ roomId, userId, role }) => {
      const room = io.sockets.adapter.rooms.get(roomId);
      if (!room) return;

      console.log(
        `Player ${userId} selected role ${role.name} in room ${roomId}`
      );

      for (const id of room) {
        const s = io.sockets.sockets.get(id);
        if (!s) continue;

        if (s.data.userId === userId) {
          s.data.roles = role;
          s.data.roleSelected = true;
        }
      }

      const players = Array.from(room).map((id) => {
        const s = io.sockets.sockets.get(id);
        return {
          socketId: id,
          userId: s?.data.userId,
          username: s?.data.username,
          isReady: s?.data.isReady || false,
          roles: s?.data.roles || null,
          roleSelected: s?.data.roleSelected || false,
        };
      });

      io.to(roomId).emit("update-players", players);

      console.log(`role selected: ${players.map((p) => p.roleSelected)}`);

      const allSelected = players.every((p) => p.roleSelected);
      const notifiedPlayers = players.filter((p) => p.roleSelected);
      const waitingPlayers = players.filter((p) => !p.roleSelected);
      if (allSelected) {
        if (roomStates[roomId]?.autoAssignTimeout) {
          clearTimeout(roomStates[roomId].autoAssignTimeout);
          delete roomStates[roomId].autoAssignTimeout;
        }

        notifiedPlayers.forEach((p) => {
          io.to(p.socketId).emit("clear-message", {
            messageId: "waiting-role",
          });
        });

        io.to(roomId).emit("message", {
          message: "Stage 1 Begins!",
          sender: "systemBattleLogs",
          messageId: "stage-starting",
        });

        setTimeout(() => {
          io.to(roomId).emit("clear-message", {
            messageId: "stage-starting",
          });

          startStage(roomId, 1);
        }, 3000);

        return;
      }

      if (!roomStates[roomId]?.autoAssignTimeout) {
        notifiedPlayers.forEach((p) => {
          io.to(p.socketId).emit("message", {
            message: "Waiting for other players to choose role.",
            sender: "systemBattleLogs",
            messageId: "waiting-role",
          });
        });

        roomStates[roomId].autoAssignTimeout = setTimeout(() => {
          notifiedPlayers.forEach((p) => {
            io.to(p.socketId).emit("clear-message", {
              messageId: "waiting-role",
            });
          });

          waitingPlayers.forEach((p) => {
            const randomRole = roles[Math.floor(Math.random() * roles.length)];

            const s = io.sockets.sockets.get(p.socketId);
            if (s) {
              s.data.roles = randomRole;
              s.data.roleSelected = true;
            }

            const playerIndex = players.findIndex(
              (pl) => pl.userId === p.userId
            );
            if (playerIndex !== -1) {
              players[playerIndex].roles = randomRole;
              players[playerIndex].roleSelected = true;
            }

            io.to(p.socketId).emit("temp-message", {
              message: `You have been automatically assigned the ${randomRole.name} role.`,
            });

            io.to(p.socketId).emit("auto-role-selected", {
              roomId,
              userId: p.userId,
              role: randomRole,
              roleSelected: true,
            });

            io.to(p.socketId).emit("clear-message", {
              messageId: "waiting-your-turn",
            });
          });

          io.to(roomId).emit("message", {
            message: "Stage 1 dimulai!",
            sender: "systemBattleLogs",
            messageId: "stage-starting",
          });

          setTimeout(() => {
            io.to(roomId).emit("clear-message", {
              messageId: "stage-starting",
            });

            startStage(roomId, 1);
          }, 3000);

          io.to(roomId).emit("update-players", players);
          delete roomStates[roomId].autoAssignTimeout;
        }, 5000);
      }
    });

    socket.on("attacking-phase", ({ roomId, enemyId, userId }) => {
      const room = io.sockets.adapter.rooms.get(roomId);
      if (!room) return;

      const state = roomStates[roomId];
      if (!state || !state.battleStarted) return;

      if (state.currentPhase !== "player") {
        socket.emit("error-message", "Bukan giliranmu untuk menyerang!");
        return;
      }

      const players = Array.from(room).map((id) => {
        const playerSocket = io.sockets.sockets.get(id);
        return {
          socketId: id,
          userId: playerSocket?.data.userId,
          username: playerSocket?.data.username,
          isReady: playerSocket?.data.isReady || false,
          roles: playerSocket?.data.roles || null,
        };
      });

      const player = players.find((p) => p.userId === userId);
      if (!player || !player.socketId) {
        console.log("Player not found or has no socket.");
        return;
      }

      if (state.playerTurnDone?.has(userId)) {
        io.to(player.socketId).emit("player-turn", {
          message: "Kamu sudah menyerang di giliran ini",
          status: true,
        });
        return;
      }

      const playerSocket = io.sockets.sockets.get(player.socketId);
      const playerHealth = playerSocket?.data.roles?.stats?.currentHealth || 0;

      if (playerHealth <= 0) {
        io.to(player.socketId).emit(
          "error-message",
          "Kamu sudah kalah dan tidak bisa menyerang lagi."
        );
        return;
      }

      // Trigger passives
      const { doubleShotTriggered } = applyPassives(player.roles, {
        socket: io.to(player.socketId),
      });
      updatePlayersList(roomId);

      const attackPower = player.roles?.stats?.attack || 0;

      const playerEnemies = state.playerEnemies;
      if (!playerEnemies || !playerEnemies[player.socketId]) {
        console.log("❌ No enemies found for this player.");
        return;
      }

      const enemies = playerEnemies[player.socketId];
      const enemy = enemies.find((e) => e.id === enemyId);
      if (!enemy) {
        console.log("❌ Enemy not found.");
        return;
      }

      const enemyDefend = enemy.stats.defense || 0;

      // ========== HIT PERTAMA ==========
      const firstDamage = Math.max(attackPower - enemyDefend, 0);
      enemy.stats.currentHealth = Math.max(
        enemy.stats.currentHealth - firstDamage,
        0
      );
      if (enemy.stats.currentHealth === 0) enemy.isAlive = false;

      applyPassives(enemy, {
        socket: io.to(player.socketId),
      });

      console.log(
        `✅ Player ${userId} attacked enemy ${enemyId} for ${attackPower} damage (after ${enemyDefend} defend ➜ ${firstDamage}). Remaining HP: ${enemy.stats.currentHealth}`
      );

      // Update data musuh ke client setelah hit pertama
      io.to(player.socketId).emit("update-enemies", { enemies });

      // ========== DOUBLE SHOT ==========
      if (doubleShotTriggered && enemy.isAlive) {
        const secondDamage = Math.max(attackPower - enemyDefend, 0);
        enemy.stats.currentHealth = Math.max(
          enemy.stats.currentHealth - secondDamage,
          0
        );
        if (enemy.stats.currentHealth === 0) enemy.isAlive = false;
        applyPassives(enemy, {
          socket: io.to(player.socketId),
        });

        console.log(
          `🎯 Double Shot! Player ${userId} attacked enemy ${enemyId} again for ${attackPower} damage (after ${enemyDefend} defend ➜ ${secondDamage}). Remaining HP: ${enemy.stats.currentHealth}`
        );

        io.to(player.socketId).emit("update-enemies", { enemies });
      }

      // Update state player sudah menyerang
      state.playerTurnDone?.add(userId);

      // Cek apakah semua pemain sudah selesai menyerang
      const alivePlayers = players.filter(
        (p) => (p.roles?.stats?.currentHealth || 0) > 0
      );
      const allDone = alivePlayers.every((p) =>
        state.playerTurnDone?.has(p.userId)
      );

      if (allDone) {
        setTimeout(() => {
          state.currentPhase = "enemy";
          state.playerTurnDone?.clear();

          io.to(roomId).emit("battle-phase-update", {
            phase: "enemy",
            message: "Enemy Turn",
            duration: 2000,
          });

          setTimeout(() => {
            performTurnPhase(roomId);
          }, 3000);
        }, 1000);
      }
    });

    socket.on("exit-room", (roomId, username) => {
      socket.data.isReady = false;

      socket.leave(roomId);

      if (roomStates[roomId]?.countdownTimer) {
        clearInterval(roomStates[roomId].countdownTimer);
        roomStates[roomId].countdownTimer = undefined;

        io.to(roomId).emit("countdown", null);
        io.to(roomId).emit("temp-message", {
          message: `${username} has left. Countdown canceled.`,
        });
      }

      if (roomStates[roomId]?.gameStarted) {
        clearDataAfterGameStart(roomId, username);
      }

      updatePlayersList(roomId, true);

      console.log(`User ${username} left room ${roomId}`);
      io.to(roomId).emit("user-left", `${username} has left room.`);
    });

    socket.on("disconnect", () => {
      const { userId, username, roomId } = socket.data;
      if (roomId && userId) {
        console.log(
          `User ${username} (${userId}) disconnected. Removing from room ${roomId}`
        );

        // Hapus player dari roomStates
        removePlayerFromRoom(roomId, userId);

        // Emit update ke semua player di room
        const players = updatePlayersList(roomId);
        io.to(roomId).emit("update-players", players);
        socket.to(roomId).emit("user-left", `${username} has left the game.`);
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
