import * as Phaser from 'phaser';
import { PLAYER, COLORS } from '../config';

export class Player extends Phaser.Physics.Arcade.Sprite {
  hp: number;
  maxHp: number;
  speed: number;
  xp = 0;
  level = 1;
  kills = 0;
  invincible = false;
  lastDirection: Phaser.Math.Vector2;
  magnetRange: number;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private invincibilityTimer = 0;
  private hpBar: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.hp = PLAYER.MAX_HP;
    this.maxHp = PLAYER.MAX_HP;
    this.speed = PLAYER.SPEED;
    this.magnetRange = PLAYER.MAGNET_RANGE;
    this.lastDirection = new Phaser.Math.Vector2(1, 0);

    this.setCircle(14, 2, 2);

    this.hpBar = scene.add.graphics();
    this.hpBar.setDepth(10);

    const keyboard = scene.input.keyboard!;
    this.cursors = keyboard.createCursorKeys();
    this.wasd = {
      W: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  update(_time: number, delta: number): void {
    const vx = (this.cursors.left.isDown || this.wasd.A.isDown ? -1 : 0) + (this.cursors.right.isDown || this.wasd.D.isDown ? 1 : 0);
    const vy = (this.cursors.up.isDown || this.wasd.W.isDown ? -1 : 0) + (this.cursors.down.isDown || this.wasd.S.isDown ? 1 : 0);

    if (vx !== 0 || vy !== 0) {
      const len = Math.sqrt(vx * vx + vy * vy);
      this.setVelocity((vx / len) * this.speed, (vy / len) * this.speed);
      this.lastDirection.set(vx, vy).normalize();
    } else {
      this.setVelocity(0, 0);
    }

    // HP bar below player
    const barWidth = 30;
    const barHeight = 4;
    const barX = this.x - barWidth / 2;
    const barY = this.y + 20;
    this.hpBar.clear();
    this.hpBar.fillStyle(COLORS.HP_BAR_BG, 0.8);
    this.hpBar.fillRect(barX, barY, barWidth, barHeight);
    this.hpBar.fillStyle(COLORS.HP_BAR, 0.9);
    this.hpBar.fillRect(barX, barY, barWidth * (this.hp / this.maxHp), barHeight);

    if (this.invincible) {
      this.invincibilityTimer -= delta;
      this.setAlpha(Math.sin(this.invincibilityTimer * 0.02) > 0 ? 1 : 0.3);
      if (this.invincibilityTimer <= 0) {
        this.invincible = false;
        this.setAlpha(1);
      }
    }
  }

  takeDamage(amount: number): void {
    if (this.invincible) return;
    this.hp = Math.max(0, this.hp - amount);
    this.invincible = true;
    this.invincibilityTimer = PLAYER.INVINCIBILITY_DURATION;
    this.scene.cameras.main.shake(100, 0.01);
  }

  addXP(amount: number): boolean {
    this.xp += amount;
    const threshold = this.getXPThreshold();
    if (this.xp >= threshold) {
      this.xp -= threshold;
      this.level++;
      return true;
    }
    return false;
  }

  getXPThreshold(): number {
    return 10 + this.level * 5;
  }

  heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  isDead(): boolean {
    return this.hp <= 0;
  }

  destroy(fromScene?: boolean): void {
    this.hpBar.destroy();
    super.destroy(fromScene);
  }
}
