// server.mts
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
import { roles } from "./src/utils/Roles/index.js";
import { stages } from "./src/utils/Stages/index.js";
import { Enemies } from "./src/utils/Type/index.js";
import { enemies } from "./src/utils/Enemies/index.js";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handle);
  const io = new Server(httpServer);

  const roomStates: {
    [roomId: string]: {
      countdownTimer?: NodeJS.Timeout;
      autoAssignTimeout?: NodeJS.Timeout;
      gameStarted?: boolean;
      stageNumber?: number | null;
      battleStarted?: boolean;
      playerEnemies?: {
        [socketId: string]: Enemies[];
      };
      playerTurnDone?: Set<string>;
      currentPhase?: "player" | "enemy";
    };
  } = {};

  io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    const updatePlayersList = (roomId: string, resetReady = false) => {
      const room = io.sockets.adapter.rooms.get(roomId);
      if (!room) return;

      const players = Array.from(room)
        .map((id) => {
          const player = io.sockets.sockets.get(id);
          if (!player) return undefined;

          if (resetReady) player.data.isReady = false;

          return {
            userId: player?.data.userId,
            username: player?.data.username,
            isReady: player?.data.isReady || false,
            roles: player?.data.roles || null,
            roleSelected: player?.data.roleSelected || false,
          };
        })
        .filter((username) => username !== undefined);

      io.to(roomId).emit("update-players", players);

      console.log(
        `Players in room ${roomId}: ${players.map((p) => p.username)}`
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
          id: `${id}-${index + 1}`, // contoh: goblin-1, goblin-2
        };
      });
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

    const enemyAttackPhase = (roomId: string) => {
      const state = roomStates[roomId];
      if (!state) return;

      const room = io.sockets.adapter.rooms.get(roomId);
      if (!room) return;

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

      players.forEach((player) => {
        const enemies = roomStates[roomId]?.playerEnemies?.[player.socketId];
        const playerStats = player.roles?.stats;
        if (!enemies || !playerStats) return;

        const totalDamage = enemies
          .filter((enemy) => enemy.isAlive)
          .reduce((sum, enemy) => sum + (enemy.stats.attack || 0), 0);

        const originalHp = playerStats.currentHealth;
        const newHp = Math.max(originalHp - totalDamage, 0);
        playerStats.currentHealth = newHp;

        console.log(
          `🧟 Musuh menyerang ${player.username} (${player.socketId}) dengan total ${totalDamage} damage. Sisa HP: ${newHp}`
        );

        updatePlayersList(roomId);

        if (newHp === 0) {
          io.to(player.socketId).emit("player-defeated", {
            message: "Kamu telah dikalahkan oleh musuh!",
          });
        }

        console.log(enemies);
      });

      state.currentPhase = "player";
      state.playerTurnDone?.clear();

      io.to(roomId).emit("battle-phase-update", {
        phase: "player",
        message: "Your turn",
        duration: 2000,
      });
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

    socket.on("join-room", ({ roomId, username, userId }) => {
      if (socket.rooms.has(roomId)) {
        return;
      }
      socket.join(roomId);
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

      console.log(
        "Player List:",
        players?.map((p) => ({
          username: p.username,
          role: p.roles || "Not selected",
          roleSelected: p.roleSelected ?? false,
          isReady: p.isReady,
        }))
      );

      socket.to(roomId).emit("update-players", players);

      socket.to(roomId).emit("user-joined", `${username} has joined the game.`);
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

      if (state.playerTurnDone?.has(userId)) {
        socket.emit("error-message", "Kamu sudah menyerang di giliran ini.");
        return;
      }

      const player = players.find((p) => p.userId === userId);
      if (!player || !player.socketId) {
        console.log("Player not found or has no socket.");
        return;
      }

      const attackPower = player.roles?.stats?.attack || 0;
      if (attackPower === 0) {
        console.log("⚠️  Attack power is 0. Roles might be missing.");
      }

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

      // 🎯 Serang musuh
      enemy.stats.currentHealth = Math.max(
        enemy.stats.currentHealth - attackPower,
        0
      );
      if (enemy.stats.currentHealth === 0) {
        enemy.isAlive = false;
      }

      playerEnemies[player.socketId] = enemies;
      io.to(player.socketId).emit("update-enemies", { enemies });

      state.playerTurnDone?.add(userId);

      console.log(
        `✅ Player ${userId} attacked enemy ${enemyId} for ${attackPower} damage. Remaining HP: ${
          enemy.stats.currentHealth
        } player status: ${state.playerTurnDone?.add(userId)}`
      );

      const allPlayerUserIds = players.map((p) => p.userId);
      const allDone = allPlayerUserIds.every((id) =>
        state.playerTurnDone?.has(id)
      );

      if (allDone) {
        state.currentPhase = "enemy";
        state.playerTurnDone?.clear();

        io.to(roomId).emit("battle-phase-update", {
          phase: "enemy",
          message: "Enemy Turn",
          duration: 2000,
        });

        setTimeout(() => {
          enemyAttackPhase(roomId);
        }, 3000);
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
      const roomId = Object.keys(socket.rooms)[1];

      if (roomStates[roomId]?.gameStarted) {
        const room = io.sockets.adapter.rooms.get(roomId);
        if (room) {
          const players = Array.from(room).map((id) => {
            const playerSocket = io.sockets.sockets.get(id);
            return {
              userId: playerSocket?.data.userId,
              username: playerSocket?.data.username,
              isReady: playerSocket?.data.isReady || false,
              roles: playerSocket?.data.roles || null,
            };
          });
        }
      }

      socket.data.isReady = false;
      socket.data.gameStarted = false;
      console.log("User disconnected", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
