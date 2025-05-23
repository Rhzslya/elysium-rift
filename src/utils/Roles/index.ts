export const roles = [
  {
    id: 1,
    name: "Warrior",
    description: "Warriors are the most powerful fighters in the game.",
    stats: {
      attack: 8,
      maxHealth: 10,
      currentHealth: 10,
      defense: 7,
      speed: 4,
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
      attack: 8,
      maxHealth: 90,
      currentHealth: 90,
      defense: 7,
      speed: 4,
    },
    passive: "Eagle Eye: 20% more critical chance on ranged attacks.",
  },
];
