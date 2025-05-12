export type Role = {
  id: number;
  name: string;
  description: string;
  stats: {
    attack: number;
    health: number;
    defense: number;
    speed: number;
  };
  passive: string;
};

export type Player = {
  userId: string | undefined;
  username: string;
  isReady: boolean;
  roles: Role | null;
};
