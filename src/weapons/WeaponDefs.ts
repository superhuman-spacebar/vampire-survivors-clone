import type { Weapon } from './Weapon';
import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';

// === Block 1: Targeting ===
export type TargetingType = 'nearest' | 'directional' | 'random_area' | 'all_in_radius' | 'orbital';

// === Block 2: Delivery ===
export type DeliveryType = 'projectile' | 'melee_arc' | 'aoe_zone' | 'orbital' | 'aura';

// === Block 3: Effects ===
export type EffectDef =
  | { type: 'slow'; ratio: number; duration: number }
  | { type: 'burn'; damage: number; interval: number; duration: number }
  | { type: 'freeze'; duration: number }
  | { type: 'knockback'; force: number };

// === Block 4: Hooks ===
export interface HookContext {
  weapon: Weapon;
  scene: Phaser.Scene;
  player: Player;
  enemies: Phaser.Physics.Arcade.Group;
  enemy?: Enemy;
  x: number;
  y: number;
}

export interface WeaponHooks {
  onSpawn?: (ctx: HookContext) => void;
  onHit?: (ctx: HookContext) => void;
  onKill?: (ctx: HookContext) => void;
  onExpire?: (ctx: HookContext) => void;
}

// === Active Status Effect (used by Enemy) ===
export interface ActiveEffect {
  type: 'slow' | 'burn' | 'freeze' | 'knockback';
  remaining: number;
  ratio?: number;
  damage?: number;
  interval?: number;
  burnTimer?: number;
  force?: number;
  sourceX?: number;
  sourceY?: number;
  applied?: boolean;
}

// === Weapon Definition ===
export interface WeaponDef {
  id: string;
  name: string;
  description: string;
  targeting: TargetingType;
  delivery: DeliveryType;
  damage: number;
  cooldown: number;
  speed?: number;
  area?: number;
  duration?: number;
  tickInterval?: number;
  projectileCount?: number;
  effects?: EffectDef[];
  hooks?: WeaponHooks;
  texture?: string;
}

// === Built-in Weapon Definitions ===
export const WEAPON_DEFS: WeaponDef[] = [
  {
    id: 'whip',
    name: 'Whip',
    description: 'Slashes enemies in front of you',
    targeting: 'directional',
    delivery: 'melee_arc',
    damage: 15,
    cooldown: 1500,
    area: 1,
    duration: 200,
    texture: 'whip',
  },
  {
    id: 'magic_missile',
    name: 'Magic Missile',
    description: 'Fires at the nearest enemy',
    targeting: 'nearest',
    delivery: 'projectile',
    damage: 10,
    cooldown: 1200,
    speed: 350,
    projectileCount: 1,
    texture: 'projectile',
  },
  {
    id: 'holy_water',
    name: 'Holy Water',
    description: 'Creates a damaging pool on the ground',
    targeting: 'random_area',
    delivery: 'aoe_zone',
    damage: 5,
    cooldown: 3000,
    area: 40,
    duration: 2000,
    tickInterval: 300,
    texture: 'holy_water',
  },
  {
    id: 'garlic',
    name: 'Garlic',
    description: 'Damages nearby enemies and pushes them away',
    targeting: 'all_in_radius',
    delivery: 'aura',
    damage: 3,
    cooldown: 500,
    area: 50,
    effects: [{ type: 'knockback', force: 150 }],
    texture: 'garlic',
  },
  {
    id: 'fire_wand',
    name: 'Fire Wand',
    description: 'Shoots fireballs that ignite enemies',
    targeting: 'nearest',
    delivery: 'projectile',
    damage: 8,
    cooldown: 1400,
    speed: 300,
    projectileCount: 1,
    effects: [{ type: 'burn', damage: 2, interval: 500, duration: 3000 }],
    texture: 'fire_projectile',
  },
  {
    id: 'frozen_orb',
    name: 'Frozen Orb',
    description: 'Creates a freezing zone that immobilizes enemies',
    targeting: 'random_area',
    delivery: 'aoe_zone',
    damage: 3,
    cooldown: 3500,
    area: 35,
    duration: 2500,
    tickInterval: 400,
    effects: [{ type: 'freeze', duration: 1000 }],
    texture: 'frost_zone',
  },
];

export function getWeaponDef(id: string): WeaponDef | undefined {
  return WEAPON_DEFS.find(d => d.id === id);
}
