import * as Phaser from 'phaser';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';
import { WEAPONS } from '../config';
import { Enemy } from '../entities/Enemy';

export class Whip extends BaseWeapon {
  constructor() {
    super('Whip', 'Slashes enemies in front of you', WEAPONS.WHIP.DAMAGE, WEAPONS.WHIP.COOLDOWN);
  }

  fire(scene: Phaser.Scene, player: Player, enemies: Phaser.Physics.Arcade.Group): void {
    const dir = player.lastDirection;
    const offsetX = dir.x * 50;
    const offsetY = dir.y * 50;

    const whipSprite = scene.add.sprite(player.x + offsetX, player.y + offsetY, 'whip');
    whipSprite.setRotation(Math.atan2(dir.y, dir.x));
    whipSprite.setAlpha(0.8);

    const scaleBonus = 1 + (this.level - 1) * 0.2;
    whipSprite.setScale(scaleBonus, scaleBonus);

    // Check overlap with enemies manually
    const hitWidth = WEAPONS.WHIP.WIDTH * scaleBonus;
    const hitHeight = WEAPONS.WHIP.HEIGHT * scaleBonus;

    for (const child of enemies.getChildren()) {
      const enemy = child as Enemy;
      if (!enemy.active) continue;

      const dx = enemy.x - whipSprite.x;
      const dy = enemy.y - whipSprite.y;
      const cos = Math.cos(-whipSprite.rotation);
      const sin = Math.sin(-whipSprite.rotation);
      const localX = dx * cos - dy * sin;
      const localY = dx * sin + dy * cos;

      if (Math.abs(localX) < hitWidth / 2 + 12 && Math.abs(localY) < hitHeight / 2 + 12) {
        enemy.takeDamage(this.damage);
      }
    }

    // Animate and destroy
    scene.tweens.add({
      targets: whipSprite,
      alpha: 0,
      scaleX: scaleBonus * 1.3,
      duration: WEAPONS.WHIP.DURATION,
      onComplete: () => whipSprite.destroy(),
    });
  }
}
