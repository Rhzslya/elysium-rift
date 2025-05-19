export type Role = {
  id: number;
  name: string;
  description: string;
  stats: {
    attack: number;
    currentHealth: number;
    maxHealth: number;
    defense: number;
    speed: number;
  };
  isAlive: boolean;
  passive?: string;
  skills?: string;
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
    currentHealth: number;
    maxHealth: number;
    defense: number;
    speed: number;
  };
  isAlive: boolean;
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
};

export type ResolvedEnemy = {
  instanceId: string; // Unik tiap musuh dalam satu stage
  templateId: string; // ID musuh asli (dari data template)
  name: string;
  stats: {
    attack: number;
    health: number;
    defense: number;
    speed: number;
  };
  currentHealth: number;
  isAlive: boolean;
  skill?: string;
  passive?: string;
  statusEffects: {
    type: "buff" | "debuff";
    stat: "attack" | "defense" | "speed";
    amount: number;
    duration: number; // dalam jumlah turn
  }[];
};
