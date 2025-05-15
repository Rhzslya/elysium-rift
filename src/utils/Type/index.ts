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

export type Enemies = {
  id: string;
  type: string;
  name: string;
  description: string;
  stats: {
    attack: number;
    health: number;
    defense: number;
    speed: number;
  };
  passive?: string;
  skills?: string;
};

export type Skill = {
  role: string;
  skillName: string;
  description: string;
  power: number;
};

export type Reward = {
  skills: Skill[];
};

export type Stage = {
  stageId: number;
  stageName: string;
  intro: string;
  enemies: Enemies[];
};
