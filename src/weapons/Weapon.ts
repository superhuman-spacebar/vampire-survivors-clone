import * as Phaser from 'phaser';
import { WeaponDef } from './WeaponDefs';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { applyDamage } from './DamageSystem';

interface TargetResult {
  x: number;
  y: number;
  enemy?: Enemy;
}

export class Weapon {
  def: WeaponDef;
  level = 1;
  projectileGroup: Phaser.Physics.Arcade.Group | null = null;
  private fireTimer = 0;

  constructor(def: WeaponDef, scene: Phaser.Scene) {
    this.def = def;

    if (def.delivery === 'projectile') {
      this.projectileGroup = scene.physics.add.group({
        defaultKey: def.texture || 'projectile',
        maxSize: 50,
        runChildUpdate: false,
      });
    }
  }

  get name(): string { return this.def.name; }
  get description(): string { return this.def.description; }

  getCurrentDamage(): number {
    return Math.floor(this.def.damage * Math.pow(1.3, this.level - 1));
  }

  getCurrentCooldown(): number {
    return Math.max(200, this.def.cooldown * Math.pow(0.9, this.level - 1));
  }

  levelUp(): void {
    this.level++;
  }

  getDescription(): string {
    return `${this.name} Lv${this.level}: ${this.description}`;
  }

  update(_time: number, delta: number, scene: Phaser.Scene, player: Player, enemies: Phaser.Physics.Arcade.Group): void {
    this.fireTimer -= delta;
    if (this.fireTimer <= 0) {
      this.fire(scene, player, enemies);
      this.fireTimer = this.getCurrentCooldown();
    }
  }

  // === MAIN FIRE ===

  private fire(scene: Phaser.Scene, player: Player, enemies: Phaser.Physics.Arcade.Group): void {
    const target = this.resolveTarget(player, enemies);

    switch (this.def.delivery) {
      case 'projectile':
        if (target) this.deliverProjectile(scene, player, enemies, target);
        break;
      case 'melee_arc':
        this.deliverMeleeArc(scene, player, enemies);
        break;
      case 'aoe_zone':
        this.deliverAoeZone(scene, player, enemies, target);
        break;
      case 'aura':
        this.deliverAura(scene, player, enemies);
        break;
    }
  }

  // === TARGETING ===

  private resolveTarget(player: Player, enemies: Phaser.Physics.Arcade.Group): TargetResult | null {
    switch (this.def.targeting) {
      case 'nearest':
        return this.targetNearest(player, enemies);
      case 'directional':
        return { x: player.x + player.lastDirection.x * 50, y: player.y + player.lastDirection.y * 50 };
      case 'random_area':
        return { x: player.x + Phaser.Math.Between(-150, 150), y: player.y + Phaser.Math.Between(-150, 150) };
      case 'all_in_radius':
        return { x: player.x, y: player.y };
      case 'orbital':
        return { x: player.x, y: player.y };
      default:
        return null;
    }
  }

  private targetNearest(player: Player, enemies: Phaser.Physics.Arcade.Group): TargetResult | null {
    let nearest: Enemy | null = null;
    let minDist = Infinity;
    for (const child of enemies.getChildren()) {
      const e = child as Enemy;
      if (!e.active) continue;
      const dist = Phaser.Math.Distance.Between(player.x, player.y, e.x, e.y);
      if (dist < minDist) { minDist = dist; nearest = e; }
    }
    return nearest ? { x: nearest.x, y: nearest.y, enemy: nearest } : null;
  }

  // === DELIVERY: Projectile ===

  private deliverProjectile(scene: Phaser.Scene, player: Player, enemies: Phaser.Physics.Arcade.Group, _target: TargetResult): void {
    if (!this.projectileGroup) return;
    const count = Math.min(this.level, 3);

    for (let i = 0; i < count; i++) {
      scene.time.delayedCall(i * 100, () => {
        const t = this.targetNearest(player, enemies);
        if (!t) return;
        this.fireOneProjectile(scene, player, enemies, t);
      });
    }
  }

  private fireOneProjectile(scene: Phaser.Scene, player: Player, enemies: Phaser.Physics.Arcade.Group, target: TargetResult): void {
    if (!this.projectileGroup) return;

    const projectile = this.projectileGroup.get(player.x, player.y, this.def.texture || 'projectile') as Phaser.Physics.Arcade.Sprite;
    if (!projectile) return;

    projectile.setActive(true).setVisible(true);
    projectile.setData('weapon', this);
    projectile.setData('damage', this.getCurrentDamage());
    if (projectile.body) {
      (projectile.body as Phaser.Physics.Arcade.Body).enable = true;
    }

    const speed = this.def.speed || 350;
    const angle = Phaser.Math.Angle.Between(player.x, player.y, target.x, target.y);
    projectile.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    projectile.setRotation(angle);

    scene.time.delayedCall(2000, () => {
      if (projectile.active) {
        if (this.def.hooks?.onExpire) {
          this.def.hooks.onExpire({
            weapon: this, scene, player, enemies,
            x: projectile.x, y: projectile.y,
          });
        }
        projectile.setActive(false).setVisible(false);
        if (projectile.body) {
          (projectile.body as Phaser.Physics.Arcade.Body).enable = false;
        }
      }
    });
  }

  // === DELIVERY: Melee Arc ===

  private deliverMeleeArc(scene: Phaser.Scene, player: Player, enemies: Phaser.Physics.Arcade.Group): void {
    const dir = player.lastDirection;
    const sprite = scene.add.sprite(player.x + dir.x * 50, player.y + dir.y * 50, this.def.texture || 'whip');
    sprite.setRotation(Math.atan2(dir.y, dir.x));
    sprite.setAlpha(0.8);

    const scaleBonus = 1 + (this.level - 1) * 0.2;
    sprite.setScale(scaleBonus);

    const hitWidth = 80 * scaleBonus * (this.def.area || 1);
    const hitHeight = 20 * scaleBonus * (this.def.area || 1);
    const damage = this.getCurrentDamage();

    for (const child of enemies.getChildren()) {
      const enemy = child as Enemy;
      if (!enemy.active) continue;

      const dx = enemy.x - sprite.x;
      const dy = enemy.y - sprite.y;
      const cos = Math.cos(-sprite.rotation);
      const sin = Math.sin(-sprite.rotation);
      const localX = dx * cos - dy * sin;
      const localY = dx * sin + dy * cos;

      if (Math.abs(localX) < hitWidth / 2 + 12 && Math.abs(localY) < hitHeight / 2 + 12) {
        applyDamage({
          scene, target: enemy, damage,
          sourceX: sprite.x, sourceY: sprite.y,
          effects: this.def.effects,
          weapon: this, player, enemies,
        });
      }
    }

    scene.tweens.add({
      targets: sprite,
      alpha: 0,
      scaleX: scaleBonus * 1.3,
      duration: this.def.duration || 200,
      onComplete: () => sprite.destroy(),
    });
  }

  // === DELIVERY: AoE Zone ===

  private deliverAoeZone(scene: Phaser.Scene, player: Player, enemies: Phaser.Physics.Arcade.Group, target: TargetResult | null): void {
    const t = target || { x: player.x, y: player.y };
    const baseRadius = this.def.area || 40;
    const radius = baseRadius + (this.level - 1) * 10;

    const pool = scene.add.sprite(t.x, t.y, this.def.texture || 'holy_water');
    pool.setScale((radius * 2) / 80);
    pool.setAlpha(0.6);

    const damage = this.getCurrentDamage();
    const tickInterval = this.def.tickInterval || 300;
    const duration = this.def.duration || 2000;
    let elapsed = 0;
    let tickTimer = 0;

    const timer = scene.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        elapsed += 16;
        tickTimer += 16;

        if (tickTimer >= tickInterval) {
          tickTimer = 0;
          for (const child of enemies.getChildren()) {
            const enemy = child as Enemy;
            if (!enemy.active) continue;
            const dist = Phaser.Math.Distance.Between(t.x, t.y, enemy.x, enemy.y);
            if (dist < radius) {
              applyDamage({
                scene, target: enemy, damage,
                sourceX: t.x, sourceY: t.y,
                effects: this.def.effects,
                weapon: this, player, enemies,
              });
            }
          }
        }

        if (elapsed >= duration) {
          timer.destroy();
          if (this.def.hooks?.onExpire) {
            this.def.hooks.onExpire({
              weapon: this, scene, player, enemies,
              x: t.x, y: t.y,
            });
          }
          scene.tweens.add({
            targets: pool,
            alpha: 0,
            duration: 300,
            onComplete: () => pool.destroy(),
          });
        }
      },
    });
  }

  // === DELIVERY: Aura ===

  private deliverAura(scene: Phaser.Scene, player: Player, enemies: Phaser.Physics.Arcade.Group): void {
    const radius = (this.def.area || 50) + (this.level - 1) * 10;
    const damage = this.getCurrentDamage();

    // Visual pulse
    const pulse = scene.add.circle(player.x, player.y, radius, 0xffffff, 0.12);
    pulse.setStrokeStyle(1.5, 0xffffff, 0.3);
    scene.tweens.add({
      targets: pulse,
      alpha: 0,
      scale: 1.3,
      duration: 250,
      onComplete: () => pulse.destroy(),
    });

    for (const child of enemies.getChildren()) {
      const enemy = child as Enemy;
      if (!enemy.active) continue;
      const dist = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
      if (dist < radius) {
        applyDamage({
          scene, target: enemy, damage,
          sourceX: player.x, sourceY: player.y,
          effects: this.def.effects,
          weapon: this, player, enemies,
        });
      }
    }
  }
}
