import * as Phaser from 'phaser';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { WEAPONS } from '../config';

export class MagicMissile extends BaseWeapon {
  private projectileGroup: Phaser.Physics.Arcade.Group;
  private projectileSpeed: number;

  constructor(scene: Phaser.Scene) {
    super('Magic Missile', 'Fires at the nearest enemy', WEAPONS.MAGIC_MISSILE.DAMAGE, WEAPONS.MAGIC_MISSILE.COOLDOWN);
    this.projectileSpeed = WEAPONS.MAGIC_MISSILE.SPEED;

    this.projectileGroup = scene.physics.add.group({
      defaultKey: 'projectile',
      maxSize: 50,
      runChildUpdate: false,
    });
  }

  fire(scene: Phaser.Scene, player: Player, enemies: Phaser.Physics.Arcade.Group): void {
    const nearest = this.findNearestEnemy(player, enemies);
    if (!nearest) return;

    const projectileCount = Math.min(this.level, 3);
    for (let i = 0; i < projectileCount; i++) {
      scene.time.delayedCall(i * 100, () => {
        this.fireOne(player, enemies);
      });
    }
  }

  private fireOne(player: Player, enemies: Phaser.Physics.Arcade.Group): void {
    const nearest = this.findNearestEnemy(player, enemies);
    if (!nearest) return;

    const projectile = this.projectileGroup.get(player.x, player.y, 'projectile') as Phaser.Physics.Arcade.Sprite;
    if (!projectile) return;

    projectile.setActive(true).setVisible(true);
    projectile.setData('damage', this.damage);
    if (projectile.body) {
      (projectile.body as Phaser.Physics.Arcade.Body).enable = true;
    }

    const angle = Phaser.Math.Angle.Between(player.x, player.y, nearest.x, nearest.y);
    projectile.setVelocity(
      Math.cos(angle) * this.projectileSpeed,
      Math.sin(angle) * this.projectileSpeed,
    );
    projectile.setRotation(angle);

    // Auto-destroy after 2 seconds
    player.scene.time.delayedCall(2000, () => {
      if (projectile.active) {
        projectile.setActive(false).setVisible(false);
        if (projectile.body) {
          (projectile.body as Phaser.Physics.Arcade.Body).enable = false;
        }
      }
    });
  }

  private findNearestEnemy(player: Player, enemies: Phaser.Physics.Arcade.Group): Phaser.Physics.Arcade.Sprite | null {
    let nearest: Phaser.Physics.Arcade.Sprite | null = null;
    let minDist = Infinity;

    for (const enemy of enemies.getChildren()) {
      const e = enemy as Phaser.Physics.Arcade.Sprite;
      if (!e.active) continue;
      const dist = Phaser.Math.Distance.Between(player.x, player.y, e.x, e.y);
      if (dist < minDist) {
        minDist = dist;
        nearest = e;
      }
    }
    return nearest;
  }

  getProjectileGroup(): Phaser.Physics.Arcade.Group {
    return this.projectileGroup;
  }
}
