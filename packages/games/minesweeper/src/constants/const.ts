import difficulties from "../data/difficulties.json";

export const DEFAULT_DIFFICULTY: keyof typeof difficulties = "1";

export const TILE_REVEAL_DELAY = 100;
export const SPEED_MULTIPLIER = 0.1;
export const PARTICLE_LIFETIME = 3000;
export const GRAVITY = 0.05;
export const TERMINAL_VELOCITY = 15;
