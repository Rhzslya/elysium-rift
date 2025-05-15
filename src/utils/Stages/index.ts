export const stages = [
  {
    id: 1,
    name: "Stage 1",
    intro: "3 Goblins appear! Eliminate them to earn your basic skill.",
    enemies: [
      {
        id: "goblin-1",
        type: "Goblin",
        name: "Goblin",
        stats: {
          attack: 5,
          health: 40,
          defense: 2,
          speed: 5,
        },
        skill: "Quick Slash",
      },
      {
        id: "goblin-2",
        type: "Goblin",
        name: "Goblin",
        stats: {
          attack: 5,
          health: 40,
          defense: 2,
          speed: 5,
        },
        skill: "Quick Slash",
      },
      {
        id: "goblin-3",
        type: "Goblin",
        name: "Goblin",
        stats: {
          attack: 5,
          health: 40,
          defense: 2,
          speed: 5,
        },
        skill: "Quick Slash",
      },
    ],
    reward: {
      skills: [
        {
          role: "Warrior",
          skillName: "Power Strike",
          description: "Deal a heavy blow to a single enemy.",
          power: 25,
        },
        {
          role: "Mage",
          skillName: "Fireball",
          description: "Cast a fireball that damages all enemies.",
          power: 20,
        },
        {
          role: "Archer",
          skillName: "Piercing Arrow",
          description: "Shoot an arrow that ignores enemy defense.",
          power: 22,
        },
      ],
    },
  },
];
