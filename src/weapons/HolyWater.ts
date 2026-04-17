import * as Phaser from 'phaser';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { WEAPONS } from '../config';
import { Enemy } from '../entities/Enemy';

export class HolyWater extends BaseWeapon {
  constructor() {
    super('Holy Water', 'Creates a damaging pool on the ground', WEAPONS.HOLY_WATER.DAMAGE, WEAPONS.HOLY_WATER.COOLDOWN);
  }

  fire(scene: Phaser.Scene, player: Player, enemies: Phaser.Physics.Arcade.Group): void {
    const range = 150;
    const x = player.x + Phaser.Math.Between(-range, range);
    const y = player.y + Phaser.Math.Between(-range, range);

    const radius = WEAPONS.HOLY_WATER.RADIUS + (this.level - 1) * 10;
    const pool = scene.add.sprite(x, y, 'holy_water');
    pool.setScale((radius * 2) / 80);
    pool.setAlpha(0.6);

    const damage = this.damage;
    let elapsed = 0;
    let tickTimer = 0;

    const timer = scene.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        elapsed += 16;
        tickTimer += 16;

        if (tickTimer >= WEAPONS.HOLY_WATER.TICK_INTERVAL) {
          tickTimer = 0;
          for (const child of enemies.getChildren()) {
            const enemy = child as Enemy;
            if (!enemy.active) continue;
            const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
            if (dist < radius) {
              enemy.takeDamage(damage);
            }
          }
        }

        if (elapsed >= WEAPONS.HOLY_WATER.DURATION) {
          timer.destroy();
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
}
