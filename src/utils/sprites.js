// src/utils/sprites.js

// Player - A warrior/knight figure
export const PLAYER_SPRITE = `
<svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
  <!-- Body -->
  <rect x="10" y="12" width="10" height="12" fill="#4ade80" rx="2"/>
  <!-- Head -->
  <circle cx="15" cy="8" r="6" fill="#4ade80"/>
  <!-- Helmet -->
  <path d="M9 8 L15 2 L21 8" fill="none" stroke="#22c55e" stroke-width="2"/>
  <!-- Eyes -->
  <circle cx="13" cy="7" r="1" fill="#1a1a2e"/>
  <circle cx="17" cy="7" r="1" fill="#1a1a2e"/>
  <!-- Sword -->
  <rect x="22" y="8" width="3" height="14" fill="#9ca3af"/>
  <rect x="20" y="10" width="7" height="2" fill="#9ca3af"/>
  <!-- Shield -->
  <ellipse cx="6" cy="16" rx="4" ry="5" fill="#3b82f6"/>
  <ellipse cx="6" cy="16" rx="2" ry="3" fill="#60a5fa"/>
</svg>
`;

// Basic Enemy - Slime creature
export const ENEMY_SLIME_SPRITE = `
<svg viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
  <!-- Body -->
  <ellipse cx="12.5" cy="16" rx="11" ry="8" fill="#ef4444"/>
  <ellipse cx="12.5" cy="14" rx="9" ry="6" fill="#f87171"/>
  <!-- Eyes -->
  <ellipse cx="8" cy="13" rx="3" ry="4" fill="white"/>
  <ellipse cx="17" cy="13" rx="3" ry="4" fill="white"/>
  <circle cx="9" cy="14" r="2" fill="#1a1a2e"/>
  <circle cx="18" cy="14" r="2" fill="#1a1a2e"/>
  <!-- Angry eyebrows -->
  <line x1="5" y1="9" x2="11" y2="11" stroke="#7f1d1d" stroke-width="2"/>
  <line x1="20" y1="9" x2="14" y2="11" stroke="#7f1d1d" stroke-width="2"/>
</svg>
`;

// Skeleton Enemy
export const ENEMY_SKELETON_SPRITE = `
<svg viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
  <!-- Skull -->
  <circle cx="12.5" cy="7" r="6" fill="#e5e5e5"/>
  <!-- Eye sockets -->
  <circle cx="10" cy="6" r="2" fill="#1a1a2e"/>
  <circle cx="15" cy="6" r="2" fill="#1a1a2e"/>
  <!-- Nose -->
  <polygon points="12.5,8 11,11 14,11" fill="#1a1a2e"/>
  <!-- Teeth -->
  <rect x="9" y="11" width="7" height="2" fill="#1a1a2e"/>
  <line x1="10" y1="11" x2="10" y2="13" stroke="#e5e5e5" stroke-width="1"/>
  <line x1="12.5" y1="11" x2="12.5" y2="13" stroke="#e5e5e5" stroke-width="1"/>
  <line x1="15" y1="11" x2="15" y2="13" stroke="#e5e5e5" stroke-width="1"/>
  <!-- Spine -->
  <rect x="11" y="13" width="3" height="8" fill="#e5e5e5"/>
  <!-- Ribs -->
  <rect x="6" y="14" width="13" height="2" fill="#e5e5e5" rx="1"/>
  <rect x="7" y="17" width="11" height="2" fill="#e5e5e5" rx="1"/>
  <!-- Arms -->
  <rect x="2" y="14" width="4" height="2" fill="#e5e5e5"/>
  <rect x="19" y="14" width="4" height="2" fill="#e5e5e5"/>
</svg>
`;

// Ghost Enemy
export const ENEMY_GHOST_SPRITE = `
<svg viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
  <!-- Body -->
  <path d="M4 12 Q4 3 12.5 3 Q21 3 21 12 L21 22 L18 19 L15 22 L12.5 19 L10 22 L7 19 L4 22 Z" fill="#a78bfa" opacity="0.8"/>
  <path d="M6 12 Q6 5 12.5 5 Q19 5 19 12 L19 18" fill="#c4b5fd" opacity="0.6"/>
  <!-- Eyes -->
  <ellipse cx="9" cy="11" rx="2.5" ry="3" fill="white"/>
  <ellipse cx="16" cy="11" rx="2.5" ry="3" fill="white"/>
  <circle cx="10" cy="12" r="1.5" fill="#1a1a2e"/>
  <circle cx="17" cy="12" r="1.5" fill="#1a1a2e"/>
  <!-- Mouth -->
  <ellipse cx="12.5" cy="17" rx="2" ry="1.5" fill="#1a1a2e"/>
</svg>
`;

// Demon Enemy (tougher)
export const ENEMY_DEMON_SPRITE = `
<svg viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
  <!-- Horns -->
  <polygon points="3,8 6,2 8,10" fill="#7f1d1d"/>
  <polygon points="22,8 19,2 17,10" fill="#7f1d1d"/>
  <!-- Head -->
  <circle cx="12.5" cy="11" r="8" fill="#dc2626"/>
  <!-- Eyes -->
  <polygon points="7,9 10,7 10,11" fill="#fbbf24"/>
  <polygon points="18,9 15,7 15,11" fill="#fbbf24"/>
  <!-- Mouth -->
  <path d="M8 15 Q12.5 19 17 15" fill="none" stroke="#1a1a2e" stroke-width="2"/>
  <!-- Fangs -->
  <polygon points="9,15 10,18 11,15" fill="white"/>
  <polygon points="14,15 15,18 16,15" fill="white"/>
  <!-- Body -->
  <rect x="8" y="19" width="9" height="5" fill="#dc2626" rx="1"/>
</svg>
`;

// Boss - Dragon
export const BOSS_SPRITE = `
<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Wings -->
  <path d="M5 25 L0 10 L10 15 L15 5 L18 20 L25 25" fill="#7c3aed" opacity="0.8"/>
  <path d="M55 25 L60 10 L50 15 L45 5 L42 20 L35 25" fill="#7c3aed" opacity="0.8"/>
  <!-- Body -->
  <ellipse cx="30" cy="38" rx="18" ry="14" fill="#8b5cf6"/>
  <ellipse cx="30" cy="35" rx="14" ry="10" fill="#a78bfa"/>
  <!-- Head -->
  <ellipse cx="30" cy="18" rx="12" ry="10" fill="#8b5cf6"/>
  <!-- Snout -->
  <ellipse cx="30" cy="24" rx="6" ry="4" fill="#7c3aed"/>
  <!-- Nostrils -->
  <circle cx="27" cy="24" r="1" fill="#1a1a2e"/>
  <circle cx="33" cy="24" r="1" fill="#1a1a2e"/>
  <!-- Eyes -->
  <ellipse cx="24" cy="15" rx="4" ry="3" fill="#fbbf24"/>
  <ellipse cx="36" cy="15" rx="4" ry="3" fill="#fbbf24"/>
  <circle cx="25" cy="15" r="2" fill="#1a1a2e"/>
  <circle cx="37" cy="15" r="2" fill="#1a1a2e"/>
  <!-- Horns -->
  <polygon points="20,10 16,0 22,8" fill="#6d28d9"/>
  <polygon points="40,10 44,0 38,8" fill="#6d28d9"/>
  <!-- Spikes on head -->
  <polygon points="30,8 28,2 32,2" fill="#6d28d9"/>
  <!-- Belly scales -->
  <ellipse cx="30" cy="40" rx="8" ry="10" fill="#c4b5fd"/>
  <!-- Tail -->
  <path d="M45 45 Q55 50 58 42 Q60 38 55 40" fill="#8b5cf6" stroke="#7c3aed" stroke-width="2"/>
  <!-- Legs -->
  <ellipse cx="20" cy="50" rx="5" ry="6" fill="#7c3aed"/>
  <ellipse cx="40" cy="50" rx="5" ry="6" fill="#7c3aed"/>
  <!-- Claws -->
  <circle cx="17" cy="54" r="2" fill="#1a1a2e"/>
  <circle cx="23" cy="54" r="2" fill="#1a1a2e"/>
  <circle cx="37" cy="54" r="2" fill="#1a1a2e"/>
  <circle cx="43" cy="54" r="2" fill="#1a1a2e"/>
</svg>
`;

// Attack effect - Slash
export const ATTACK_SLASH_SPRITE = `
<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 35 Q20 20 35 5" fill="none" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
  <path d="M10 30 Q22 22 30 10" fill="none" stroke="#fcd34d" stroke-width="2" stroke-linecap="round"/>
  <path d="M8 25 Q18 18 25 8" fill="none" stroke="#fef3c7" stroke-width="1" stroke-linecap="round"/>
</svg>
`;

// Health pickup
export const HEALTH_PICKUP_SPRITE = `
<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
  <!-- Heart shape -->
  <path d="M10 18 Q0 10 2 5 Q4 0 10 4 Q16 0 18 5 Q20 10 10 18" fill="#ef4444"/>
  <path d="M10 15 Q3 9 5 6 Q6 3 10 6" fill="#f87171"/>
</svg>
`;

// Collection of enemy sprites for variety
export const ENEMY_SPRITES = [
  ENEMY_SLIME_SPRITE,
  ENEMY_SKELETON_SPRITE,
  ENEMY_GHOST_SPRITE,
  ENEMY_DEMON_SPRITE,
];

// Export a helper to get random enemy sprite
export const getRandomEnemySprite = () => {
  const index = Math.floor(Math.random() * ENEMY_SPRITES.length);
  return ENEMY_SPRITES[index];
};

// Export enemy sprite by difficulty (0-3, higher = tougher looking)
export const getEnemySpriteByDifficulty = (room) => {
  const index = Math.min(room - 1, ENEMY_SPRITES.length - 1);
  return ENEMY_SPRITES[index];
};