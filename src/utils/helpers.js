// src/utils/helpers.js
import { ARENA, PLAYER, ENEMY, BOSS, ROOMS } from './constants';
import { getEnemySpriteByDifficulty } from './sprites';

/**
 * Generate a unique ID for game entities
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Clamp a value between min and max
 */
export const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Calculate distance between two points
 */
export const getDistance = (x1, y1, x2, y2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Check if two rectangular entities are colliding
 */
export const checkCollision = (entity1, entity2) => {
  return (
    entity1.x < entity2.x + entity2.size &&
    entity1.x + entity1.size > entity2.x &&
    entity1.y < entity2.y + entity2.size &&
    entity1.y + entity1.size > entity2.y
  );
};

/**
 * Check if two circular entities are colliding
 */
export const checkCircleCollision = (entity1, entity2) => {
  const centerX1 = entity1.x + entity1.size / 2;
  const centerY1 = entity1.y + entity1.size / 2;
  const centerX2 = entity2.x + entity2.size / 2;
  const centerY2 = entity2.y + entity2.size / 2;
  
  const distance = getDistance(centerX1, centerY1, centerX2, centerY2);
  const minDistance = (entity1.size + entity2.size) / 2;
  
  return distance < minDistance;
};

/**
 * Check if player attack hits an enemy
 */
export const checkAttackHit = (player, enemy, attackRange = PLAYER.ATTACK_RANGE) => {
  const playerCenterX = player.x + player.size / 2;
  const playerCenterY = player.y + player.size / 2;
  const enemyCenterX = enemy.x + enemy.size / 2;
  const enemyCenterY = enemy.y + enemy.size / 2;
  
  const distance = getDistance(playerCenterX, playerCenterY, enemyCenterX, enemyCenterY);
  
  return distance <= attackRange + enemy.size / 2;
};

/**
 * Keep entity within arena bounds
 */
export const keepInBounds = (entity) => {
  return {
    ...entity,
    x: clamp(entity.x, 0, ARENA.WIDTH - entity.size),
    y: clamp(entity.y, 0, ARENA.HEIGHT - entity.size),
  };
};

/**
 * Get a random spawn position along arena edges (away from player)
 */
export const getRandomSpawnPosition = (playerX, playerY, entitySize, minDistanceFromPlayer = 150) => {
  let x, y;
  let attempts = 0;
  const maxAttempts = 50;
  
  do {
    // Randomly choose which edge to spawn from
    const edge = Math.floor(Math.random() * 4);
    
    switch (edge) {
      case 0: // Top
        x = Math.random() * (ARENA.WIDTH - entitySize);
        y = 0;
        break;
      case 1: // Right
        x = ARENA.WIDTH - entitySize;
        y = Math.random() * (ARENA.HEIGHT - entitySize);
        break;
      case 2: // Bottom
        x = Math.random() * (ARENA.WIDTH - entitySize);
        y = ARENA.HEIGHT - entitySize;
        break;
      case 3: // Left
        x = 0;
        y = Math.random() * (ARENA.HEIGHT - entitySize);
        break;
      default:
        x = 0;
        y = 0;
    }
    
    attempts++;
  } while (
    getDistance(x, y, playerX, playerY) < minDistanceFromPlayer &&
    attempts < maxAttempts
  );
  
  return { x, y };
};

/**
 * Get random position anywhere in arena (for items, etc.)
 */
export const getRandomArenaPosition = (entitySize, padding = 50) => {
  return {
    x: padding + Math.random() * (ARENA.WIDTH - entitySize - padding * 2),
    y: padding + Math.random() * (ARENA.HEIGHT - entitySize - padding * 2),
  };
};

/**
 * Calculate enemy stats based on room number
 */
export const getEnemyStatsForRoom = (room) => {
  const multiplier = 1 + (room - 1) * ROOMS.DIFFICULTY_MULTIPLIER;
  
  return {
    health: Math.round(ENEMY.BASE_HEALTH * multiplier),
    damage: Math.round(ENEMY.BASE_DAMAGE * multiplier),
    speed: ENEMY.BASE_SPEED + (room - 1) * 0.3,
  };
};

/**
 * Create a new enemy entity
 */
export const createEnemy = (playerX, playerY, room) => {
  const stats = getEnemyStatsForRoom(room);
  const position = getRandomSpawnPosition(playerX, playerY, ENEMY.SIZE);
  const sprite = getEnemySpriteByDifficulty(room);
  
  return {
    id: generateId(),
    type: 'enemy',
    x: position.x,
    y: position.y,
    size: ENEMY.SIZE,
    health: stats.health,
    maxHealth: stats.health,
    damage: stats.damage,
    speed: stats.speed,
    sprite: sprite,
    lastAttackTime: 0,
    isHit: false,
    hitTimer: 0,
  };
};

/**
 * Create the boss entity
 */
export const createBoss = (playerX, playerY) => {
  const position = getRandomSpawnPosition(playerX, playerY, BOSS.SIZE, 200);
  
  return {
    id: generateId(),
    type: 'boss',
    x: position.x,
    y: position.y,
    size: BOSS.SIZE,
    health: BOSS.HEALTH,
    maxHealth: BOSS.HEALTH,
    damage: BOSS.DAMAGE,
    speed: BOSS.SPEED,
    sprite: BOSS.SPRITE,
    lastAttackTime: 0,
    isHit: false,
    hitTimer: 0,
  };
};

/**
 * Create initial player state
 */
export const createPlayer = () => {
  return {
    id: generateId(),
    type: 'player',
    x: ARENA.WIDTH / 2 - PLAYER.SIZE / 2,
    y: ARENA.HEIGHT / 2 - PLAYER.SIZE / 2,
    size: PLAYER.SIZE,
    health: PLAYER.MAX_HEALTH,
    maxHealth: PLAYER.MAX_HEALTH,
    damage: PLAYER.ATTACK_DAMAGE,
    speed: PLAYER.SPEED,
    sprite: PLAYER.SPRITE,
    lastAttackTime: 0,
    isAttacking: false,
    attackTimer: 0,
    direction: 'right',
    isHit: false,
    hitTimer: 0,
  };
};

/**
 * Move enemy towards player
 */
export const moveTowardsPlayer = (enemy, playerX, playerY) => {
  const enemyCenterX = enemy.x + enemy.size / 2;
  const enemyCenterY = enemy.y + enemy.size / 2;
  const playerCenterX = playerX + PLAYER.SIZE / 2;
  const playerCenterY = playerY + PLAYER.SIZE / 2;
  
  const dx = playerCenterX - enemyCenterX;
  const dy = playerCenterY - enemyCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance === 0) return enemy;
  
  // Normalize and apply speed
  const normalizedX = dx / distance;
  const normalizedY = dy / distance;
  
  const newX = enemy.x + normalizedX * enemy.speed;
  const newY = enemy.y + normalizedY * enemy.speed;
  
  return keepInBounds({
    ...enemy,
    x: newX,
    y: newY,
  });
};

/**
 * Calculate player movement based on pressed keys
 */
export const calculatePlayerMovement = (player, keysPressed) => {
  let dx = 0;
  let dy = 0;
  let direction = player.direction;
  
  if (keysPressed.up) {
    dy -= player.speed;
    direction = 'up';
  }
  if (keysPressed.down) {
    dy += player.speed;
    direction = 'down';
  }
  if (keysPressed.left) {
    dx -= player.speed;
    direction = 'left';
  }
  if (keysPressed.right) {
    dx += player.speed;
    direction = 'right';
  }
  
  // Normalize diagonal movement
  if (dx !== 0 && dy !== 0) {
    const normalizer = 1 / Math.sqrt(2);
    dx *= normalizer;
    dy *= normalizer;
  }
  
  return keepInBounds({
    ...player,
    x: player.x + dx,
    y: player.y + dy,
    direction,
  });
};

/**
 * Apply damage to an entity
 */
export const applyDamage = (entity, damage) => {
  const newHealth = Math.max(0, entity.health - damage);
  return {
    ...entity,
    health: newHealth,
    isHit: true,
    hitTimer: 10, // frames to show hit effect
  };
};

/**
 * Check if entity is dead
 */
export const isDead = (entity) => {
  return entity.health <= 0;
};

/**
 * Get number of enemies for a specific room
 */
export const getEnemyCountForRoom = (room) => {
  if (room < 1 || room > ROOMS.TOTAL) return 0;
  return ROOMS.ENEMIES_PER_ROOM[room];
};

/**
 * Check if current room is the boss room
 */
export const isBossRoom = (room) => {
  return room === ROOMS.BOSS_ROOM;
};

/**
 * Format time in MM:SS
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Calculate health bar percentage
 */
export const getHealthPercentage = (current, max) => {
  return Math.max(0, Math.min(100, (current / max) * 100));
};

/**
 * Determine health bar color based on percentage
 */
export const getHealthBarColor = (percentage) => {
  if (percentage > 60) return '#22c55e'; // Green
  if (percentage > 30) return '#eab308'; // Yellow
  return '#ef4444'; // Red
};