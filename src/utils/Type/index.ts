export type Role = {
  id: number;
  name: string;
  description: string;
  stats: {
    attack: number;
    currentHealth: number;
    maxHealth: number;
    defense: number;
    energy: number;
    bonusAttackApplied: boolean;
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

// export type Enemies = {
//   id: string;
//   type: string;
//   name: string;
//   description: string;
//   stats: {
//     attack: number;
//     currentHealth: number;
//     maxHealth: number;
//     defense: number;
//     energy: number;
//     bonusAttackApplied: boolean;
//   };
//   isAlive: boolean;
//   passive?: string;
//   skills?: string;
// };

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
  id: string;
  templateId: string;
  name: string;
  stats: {
    attack: number;
    maxHealth: number;
    currentHealth: number;
    defense: number;
    energy: number;
    bonusAttackApplied: boolean;
  };
  isAlive: boolean;
  skill?: string;
  passive?: string;
  statusEffects: {
    type: "buff" | "debuff";
    stat: "attack" | "defense" | "energy";
    amount: number;
    duration: number;
  }[];
};

export type EntityType = "player" | "enemy";

export type EntityWithPassive = Role | ResolvedEnemy;
