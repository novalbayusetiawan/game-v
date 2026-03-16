import { reactive } from "vue";

export const playerStats = reactive({
  health: 100,
  maxHealth: 100,
  scrap: 0,
  magic: 0,
  speed: 0.08, // Base speed
});

export const playerCombat = reactive({
  weapon: "pistol" as "pistol" | "shotgun",
  lastShot: 0,
  isAiming: false,
  aimTarget: { x: 0, y: 0, z: 0 },
  pistolDamage: 3,
  shotgunDamage: 1.5,
});

export const skillsState = reactive({
  hiraishin: {
    cooldown: 0,
    maxCooldown: 3,
    isKunaiActive: false,
    kunaiPosition: { x: 0, y: 0, z: 0 },
    kunaiVelocity: { x: 0, y: 0, z: 0 },
  },
  phaseShift: {
    cooldown: 0,
    maxCooldown: 5,
    isActive: false,
    timeRemaining: 0,
    duration: 0.5,
  },
});

export const playerPosition = reactive({ x: 0, y: 1, z: 0 });

export interface Enemy {
  id: number;
  x: number;
  y: number;
  z: number;
  speed: number;
  hp: number;
  maxHp: number;
  state: "idle" | "chase";
  targetX: number;
  targetZ: number;
  variant: "Converted_Vampire" | "Vampire_Girl" | "Countess_Vampire";
  isFacingRight: boolean;
  animState: "idle" | "walk" | "run" | "attack";
}

export const gameState = reactive({
  enemies: [] as Enemy[],
  buildings: [] as { x: number; z: number; width: number; depth: number }[],
  projectiles: [] as {
    id: number;
    x: number;
    z: number;
    vx: number;
    vz: number;
    type: "pistol" | "shotgun";
    life: number;
  }[],
  nextProjectileId: 0,
});
