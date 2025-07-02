"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type UserSocketContextType = {
  userId: string | null;
  socket: Socket | null;
};

const UserSocketContext = createContext<UserSocketContextType>({
  userId: null,
  socket: null,
});

export const UserSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    let mounted = true;

    let storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      storedUserId = crypto.randomUUID();
      localStorage.setItem("userId", storedUserId);
    }

    if (mounted) setUserId(storedUserId);

    const s = io({ autoConnect: false });
    if (mounted) setSocket(s);

    return () => {
      mounted = false;
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => console.log("🔌 Socket connected", socket.id);
    const handleDisconnect = () => console.log("❌ Socket disconnected");

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket]);

  return (
    <UserSocketContext.Provider value={{ userId, socket }}>
      {children}
    </UserSocketContext.Provider>
  );
};

export const useUserSocket = () => useContext(UserSocketContext);
