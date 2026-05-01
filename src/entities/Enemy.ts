import * as Phaser from 'phaser';
import type { ActiveEffect } from '../weapons/WeaponDefs';

export interface EnemyConfig {
  hp: number;
  speed: number;
  damage: number;
  xpValue: number;
  texture: string;
}

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  hp = 0;
  maxHp = 0;
  speed = 0;
  contactDamage = 0;
  xpValue = 0;
  activeEffects: ActiveEffect[] = [];
  speedMultiplier = 1;
  onDeathCallback?: (enemy: Enemy) => void;
  private target: Phaser.Physics.Arcade.Sprite | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
  }

  spawn(x: number, y: number, config: EnemyConfig, target: Phaser.Physics.Arcade.Sprite): void {
    this.setTexture(config.texture);
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.hp = config.hp;
    this.maxHp = config.hp;
    this.speed = config.speed;
    this.contactDamage = config.damage;
    this.xpValue = config.xpValue;
    this.target = target;
    this.setAlpha(1);
    this.clearTint();
    this.activeEffects = [];
    this.speedMultiplier = 1;

    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.enable = true;
      const r = Math.max(this.width, this.height) * 0.35;
      this.setCircle(r, (this.width / 2) - r, (this.height / 2) - r);
    }
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (!this.active || !this.target) return;

    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
    const effectiveSpeed = this.speed * this.speedMultiplier;
    this.setVelocity(Math.cos(angle) * effectiveSpeed, Math.sin(angle) * effectiveSpeed);
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;
    // Flash white on hit
    this.setTint(0xffffff);
    this.scene.time.delayedCall(80, () => {
      if (this.active) this.clearTint();
    });

    // Damage number popup
    const isCrit = this.hp <= 0;
    const txt = this.scene.add.text(this.x, this.y - 10, `${amount}`, {
      fontFamily: 'monospace',
      fontSize: isCrit ? '16px' : '12px',
      color: isCrit ? '#ff4444' : '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(50);

    this.scene.tweens.add({
      targets: txt,
      y: txt.y - 30,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => txt.destroy(),
    });

    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  die(): void {
    this.setActive(false);
    this.setVisible(false);
    this.setVelocity(0, 0);
    this.activeEffects = [];
    this.speedMultiplier = 1;
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).enable = false;
    }
    this.onDeathCallback?.(this);
  }
}
