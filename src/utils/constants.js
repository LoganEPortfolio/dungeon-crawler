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