export const roles = [
  {
    id: 1,
    name: "Warrior",
    description: "Warriors are the most powerful fighters in the game.",
    stats: {
      attack: 8,
      maxHealth: 20,
      currentHealth: 20,
      defense: 7,
      speed: 4,
      bonusAttackApplied: false,
    },
    passive: "Berserk: Gains +2 attack when HP drops below 50%.",
  },
  {
    id: 2,
    name: "Mage",
    description: "Mages are the most powerful spellcasters in the game.",
    stats: {
      attack: 8,
      maxHealth: 100,
      currentHealth: 100,
      defense: 7,
      speed: 20,
    },
    passive: "Mana Surge: 30% chance to cast a spell twice.",
  },
  {
    id: 3,
    name: "Archer",
    description: "Archers are the most powerful ranged fighters in the game.",
    stats: {
      attack: 20,
      maxHealth: 90,
      currentHealth: 90,
      defense: 7,
      speed: 4,
    },
    passive: "Double Shot: 20% Chance to shoot twice.",
  },
];
