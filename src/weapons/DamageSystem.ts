import * as Phaser from 'phaser';
import type { Enemy } from '../entities/Enemy';
import type { Player } from '../entities/Player';
import type { Weapon } from './Weapon';
import type { EffectDef, HookContext, ActiveEffect } from './WeaponDefs';

// === Unified Damage Pipeline ===

export interface DamageParams {
  scene: Phaser.Scene;
  target: Enemy;
  damage: number;
  sourceX: number;
  sourceY: number;
  effects?: EffectDef[];
  weapon?: Weapon;
  player?: Player;
  enemies?: Phaser.Physics.Arcade.Group;
}

export function applyDamage(params: DamageParams): boolean {
  const { target, damage, sourceX, sourceY, effects } = params;

  const killed = target.takeDamage(damage);

  if (effects) {
    for (const effect of effects) {
      applyStatusEffect(target, effect, sourceX, sourceY);
    }
  }

  if (params.weapon?.def.hooks) {
    const ctx: HookContext = {
      weapon: params.weapon,
      scene: params.scene,
      player: params.player!,
      enemies: params.enemies!,
      enemy: target,
      x: target.x,
      y: target.y,
    };
    params.weapon.def.hooks.onHit?.(ctx);
    if (killed) {
      params.weapon.def.hooks.onKill?.(ctx);
    }
  }

  return killed;
}

// === Status Effect Application ===

export function applyStatusEffect(
  enemy: Enemy,
  effectDef: EffectDef,
  sourceX: number,
  sourceY: number,
): void {
  enemy.activeEffects = enemy.activeEffects.filter(e => e.type !== effectDef.type);

  switch (effectDef.type) {
    case 'slow':
      enemy.activeEffects.push({
        type: 'slow',
        ratio: effectDef.ratio,
        remaining: effectDef.duration,
      });
      break;
    case 'burn':
      enemy.activeEffects.push({
        type: 'burn',
        damage: effectDef.damage,
        interval: effectDef.interval,
        remaining: effectDef.duration,
        burnTimer: 0,
      });
      break;
    case 'freeze':
      enemy.activeEffects.push({
        type: 'freeze',
        remaining: effectDef.duration,
      });
      break;
    case 'knockback':
      enemy.activeEffects.push({
        type: 'knockback',
        force: effectDef.force,
        sourceX,
        sourceY,
        remaining: 300,
        applied: false,
      });
      break;
  }
}

// === Status Effect Update (called each frame from GameScene) ===

export function updateStatusEffects(enemy: Enemy, delta: number): void {
  if (enemy.activeEffects.length === 0) {
    enemy.speedMultiplier = 1;
    return;
  }

  let speedMultiplier = 1;
  const toRemove: number[] = [];

  for (let i = 0; i < enemy.activeEffects.length; i++) {
    const effect = enemy.activeEffects[i];
    effect.remaining -= delta;

    if (effect.remaining <= 0) {
      toRemove.push(i);
      continue;
    }

    switch (effect.type) {
      case 'slow':
        speedMultiplier *= 1 - (effect.ratio ?? 0.5);
        break;
      case 'freeze':
        speedMultiplier = 0;
        break;
      case 'burn':
        effect.burnTimer = (effect.burnTimer ?? 0) + delta;
        if (effect.burnTimer >= (effect.interval ?? 500)) {
          effect.burnTimer = 0;
          enemy.takeDamage(effect.damage ?? 1);
          if (!enemy.active) return;
        }
        break;
      case 'knockback':
        if (!effect.applied && effect.sourceX !== undefined && effect.sourceY !== undefined) {
          const angle = Phaser.Math.Angle.Between(effect.sourceX, effect.sourceY, enemy.x, enemy.y);
          const force = effect.force ?? 200;
          enemy.setVelocity(Math.cos(angle) * force, Math.sin(angle) * force);
          effect.applied = true;
        }
        break;
    }
  }

  enemy.speedMultiplier = speedMultiplier;

  for (let i = toRemove.length - 1; i >= 0; i--) {
    enemy.activeEffects.splice(toRemove[i], 1);
  }

  // Visual tinting
  if (!enemy.active) return;
  const hasFreeze = enemy.activeEffects.some(e => e.type === 'freeze');
  const hasBurn = enemy.activeEffects.some(e => e.type === 'burn');
  const hasSlow = enemy.activeEffects.some(e => e.type === 'slow');

  if (hasFreeze) enemy.setTint(0x8888ff);
  else if (hasBurn) enemy.setTint(0xff8844);
  else if (hasSlow) enemy.setTint(0x88ccff);
}
