// src/utils/constants.js
import {
  PLAYER_SPRITE,
  ENEMY_SPRITES,
  BOSS_SPRITE,
  ATTACK_SLASH_SPRITE,
  HEALTH_PICKUP_SPRITE,
} from './sprites';

// Arena dimensions
export const ARENA = {
  WIDTH: 800,
  HEIGHT: 600,
  BACKGROUND_COLOR: '#2d2d44',
  BORDER_COLOR: '#5c5c8a',
  BORDER_WIDTH: 4,
};

// Player configuration
export const PLAYER = {
  SIZE: 30,
  SPEED: 5,
  COLOR: '#4ade80',
  MAX_HEALTH: 100,
  ATTACK_DAMAGE: 25,
  ATTACK_RANGE: 50,
  ATTACK_COOLDOWN: 300,
  SPRITE: PLAYER_SPRITE,
};

// Enemy configuration (base values - scale with room)
export const ENEMY = {
  SIZE: 25,
  BASE_SPEED: 2,
  COLOR: '#ef4444',
  BASE_HEALTH: 30,
  BASE_DAMAGE: 10,
  ATTACK_COOLDOWN: 1000,
  SPRITES: ENEMY_SPRITES,
};

// Boss configuration
export const BOSS = {
  SIZE: 60,
  SPEED: 1.5,
  COLOR: '#a855f7',
  HEALTH: 300,
  DAMAGE: 25,
  ATTACK_COOLDOWN: 800,
  SPRITE: BOSS_SPRITE,
};

// Effects
export const EFFECTS = {
  ATTACK_SLASH: ATTACK_SLASH_SPRITE,
  HEALTH_PICKUP: HEALTH_PICKUP_SPRITE,
};

// Room configuration
export const ROOMS = {
  TOTAL: 5,
  BOSS_ROOM: 5,
  ENEMIES_PER_ROOM: [0, 3, 5, 7, 10, 1],
  DIFFICULTY_MULTIPLIER: 0.25,
};

// Wave configuration
export const WAVES = {
  SPAWN_DELAY: 1000,
  ROOM_CLEAR_DELAY: 2000,
};

// Game states
export const GAME_STATES = {
  START: 'START',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER',
  VICTORY: 'VICTORY',
  ROOM_TRANSITION: 'ROOM_TRANSITION',
};

// Key bindings
export const KEYS = {
  UP: ['w', 'W', 'ArrowUp'],
  DOWN: ['s', 'S', 'ArrowDown'],
  LEFT: ['a', 'A', 'ArrowLeft'],
  RIGHT: ['d', 'D', 'ArrowRight'],
  ATTACK: [' '],
  PAUSE: ['Escape', 'p', 'P'],
};

// Colors for UI
export const UI_COLORS = {
  HEALTH_BAR: '#22c55e',
  HEALTH_BAR_LOW: '#ef4444',
  HEALTH_BAR_BACKGROUND: '#374151',
  TEXT_PRIMARY: '#ffffff',
  TEXT_SECONDARY: '#9ca3af',
  ROOM_INDICATOR: '#fbbf24',
};

// Game loop
export const GAME_LOOP = {
  FPS: 60,
  FRAME_TIME: 1000 / 60,
};

// ─── ITEMS ──────────────────────────────────────────────────────

export const ITEM_TYPES = {
  // Healing
  APPLE: 'APPLE',
  MEAT: 'MEAT',
  HEALTH_POTION: 'HEALTH_POTION',
  // Powerups
  SPEED_POTION: 'SPEED_POTION',
  STRENGTH_POTION: 'STRENGTH_POTION',
  SHIELD_POTION: 'SHIELD_POTION',
  // Weapons
  FIRE_SWORD: 'FIRE_SWORD',
  ICE_AXE: 'ICE_AXE',
  LIGHTNING_STAFF: 'LIGHTNING_STAFF',
};

export const ITEMS = {
  // Healing items
  [ITEM_TYPES.APPLE]: {
    type: ITEM_TYPES.APPLE,
    category: 'healing',
    name: 'Apple',
    description: 'A fresh apple',
    healAmount: 15,
    size: 20,
    rarity: 'common',
    dropChance: 0.15, // 15% chance on enemy kill
  },
  [ITEM_TYPES.MEAT]: {
    type: ITEM_TYPES.MEAT,
    category: 'healing',
    name: 'Cooked Meat',
    description: 'Hearty meal',
    healAmount: 30,
    size: 22,
    rarity: 'uncommon',
    dropChance: 0.08,
  },
  [ITEM_TYPES.HEALTH_POTION]: {
    type: ITEM_TYPES.HEALTH_POTION,
    category: 'healing',
    name: 'Health Potion',
    description: 'Restores health',
    healAmount: 50,
    size: 18,
    rarity: 'rare',
    dropChance: 0.04,
  },

  // Powerup items (temporary buffs)
  [ITEM_TYPES.SPEED_POTION]: {
    type: ITEM_TYPES.SPEED_POTION,
    category: 'powerup',
    name: 'Speed Potion',
    description: '+50% speed',
    duration: 5000, // 5 seconds
    multiplier: 1.5,
    stat: 'speed',
    size: 18,
    rarity: 'uncommon',
    dropChance: 0.06,
  },
  [ITEM_TYPES.STRENGTH_POTION]: {
    type: ITEM_TYPES.STRENGTH_POTION,
    category: 'powerup',
    name: 'Strength Potion',
    description: '+50% damage',
    duration: 5000,
    multiplier: 1.5,
    stat: 'damage',
    size: 18,
    rarity: 'uncommon',
    dropChance: 0.06,
  },
  [ITEM_TYPES.SHIELD_POTION]: {
    type: ITEM_TYPES.SHIELD_POTION,
    category: 'powerup',
    name: 'Shield Potion',
    description: '-50% damage taken',
    duration: 5000,
    multiplier: 0.5,
    stat: 'defense',
    size: 18,
    rarity: 'uncommon',
    dropChance: 0.05,
  },

  // Weapon items (permanent until replaced)
  [ITEM_TYPES.FIRE_SWORD]: {
    type: ITEM_TYPES.FIRE_SWORD,
    category: 'weapon',
    name: 'Fire Sword',
    description: 'Burns enemies',
    baseDamage: 20,
    effect: 'burn',
    effectDamage: 5,
    effectDuration: 3000, // 3 seconds of burn
    size: 24,
    rarity: 'rare',
    dropChance: 0.03,
  },
  [ITEM_TYPES.ICE_AXE]: {
    type: ITEM_TYPES.ICE_AXE,
    category: 'weapon',
    name: 'Ice Axe',
    description: 'Slows enemies',
    baseDamage: 22,
    effect: 'slow',
    effectMultiplier: 0.5, // 50% slower
    effectDuration: 2000,
    size: 24,
    rarity: 'rare',
    dropChance: 0.03,
  },
  [ITEM_TYPES.LIGHTNING_STAFF]: {
    type: ITEM_TYPES.LIGHTNING_STAFF,
    category: 'weapon',
    name: 'Lightning Staff',
    description: 'Chain lightning',
    baseDamage: 18,
    effect: 'chain',
    chainRange: 80,
    chainDamage: 10,
    maxChains: 2,
    size: 24,
    rarity: 'rare',
    dropChance: 0.025,
  },
};

// ─── OBSTACLES ──────────────────────────────────────────────────

export const OBSTACLE_TYPES = {
  FIRE_PIT: 'FIRE_PIT',
  SPIKE_TRAP: 'SPIKE_TRAP',
  POISON_POOL: 'POISON_POOL',
};

export const OBSTACLES = {
  [OBSTACLE_TYPES.FIRE_PIT]: {
    type: OBSTACLE_TYPES.FIRE_PIT,
    name: 'Fire Pit',
    damage: 8,
    damageInterval: 500, // Damage every 0.5s
    size: 50,
    affectsPlayer: true,
    affectsEnemies: true,
  },
  [OBSTACLE_TYPES.SPIKE_TRAP]: {
    type: OBSTACLE_TYPES.SPIKE_TRAP,
    name: 'Spike Trap',
    damage: 15,
    damageInterval: 1000, // Damage every 1s
    size: 40,
    affectsPlayer: true,
    affectsEnemies: false, // Only hurts player
  },
  [OBSTACLE_TYPES.POISON_POOL]: {
    type: OBSTACLE_TYPES.POISON_POOL,
    name: 'Poison Pool',
    damage: 3,
    damageInterval: 300,
    slowMultiplier: 0.6, // 40% slower
    size: 60,
    affectsPlayer: true,
    affectsEnemies: true,
  },
};

// How many obstacles per room (by room number)
export const OBSTACLES_PER_ROOM = [0, 0, 1, 2, 2, 3]; // Room 1 = 0, Room 5 = 3