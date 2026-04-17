import * as Phaser from 'phaser';
import { COLORS } from '../config';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    this.generatePlayerTexture();
    this.generateEnemyTexture();
    this.generateFastEnemyTexture();
    this.generateBigEnemyTexture();
    this.generateProjectileTexture();
    this.generateGemTexture();
    this.generateWhipTexture();
    this.generateHolyWaterTexture();
    this.generateGroundTexture();

    this.scene.start('GameScene');
  }

  private generatePlayerTexture(): void {
    const g = this.add.graphics();
    g.fillStyle(COLORS.PLAYER, 1);
    g.fillCircle(16, 16, 14);
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(12, 12, 4);
    g.generateTexture('player', 32, 32);
    g.destroy();
  }

  private generateEnemyTexture(): void {
    const g = this.add.graphics();
    g.fillStyle(COLORS.ENEMY, 1);
    g.fillCircle(12, 12, 10);
    g.fillStyle(0x000000, 0.5);
    g.fillCircle(9, 10, 3);
    g.fillCircle(15, 10, 3);
    g.generateTexture('enemy', 24, 24);
    g.destroy();
  }

  private generateFastEnemyTexture(): void {
    const g = this.add.graphics();
    g.fillStyle(COLORS.ENEMY_FAST, 1);
    g.fillCircle(10, 10, 8);
    g.generateTexture('enemy_fast', 20, 20);
    g.destroy();
  }

  private generateBigEnemyTexture(): void {
    const g = this.add.graphics();
    g.fillStyle(COLORS.ENEMY_BIG, 1);
    g.fillCircle(18, 18, 16);
    g.fillStyle(0x000000, 0.5);
    g.fillCircle(13, 14, 4);
    g.fillCircle(23, 14, 4);
    g.generateTexture('enemy_big', 36, 36);
    g.destroy();
  }

  private generateProjectileTexture(): void {
    const g = this.add.graphics();
    g.fillStyle(COLORS.PROJECTILE, 1);
    g.fillCircle(6, 6, 5);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(5, 5, 2);
    g.generateTexture('projectile', 12, 12);
    g.destroy();
  }

  private generateGemTexture(): void {
    const g = this.add.graphics();
    g.fillStyle(COLORS.GEM, 1);
    g.fillRect(4, 0, 8, 8);
    g.setRotation(Math.PI / 4);
    // Simple diamond shape
    g.fillStyle(COLORS.GEM, 1);
    g.beginPath();
    g.moveTo(8, 0);
    g.lineTo(16, 8);
    g.lineTo(8, 16);
    g.lineTo(0, 8);
    g.closePath();
    g.fillPath();
    g.generateTexture('gem', 16, 16);
    g.destroy();
  }

  private generateWhipTexture(): void {
    const g = this.add.graphics();
    g.fillStyle(COLORS.WHIP, 0.8);
    g.fillRoundedRect(0, 0, 80, 20, 4);
    g.generateTexture('whip', 80, 20);
    g.destroy();
  }

  private generateHolyWaterTexture(): void {
    const g = this.add.graphics();
    g.fillStyle(COLORS.HOLY_WATER, 0.3);
    g.fillCircle(40, 40, 40);
    g.fillStyle(COLORS.HOLY_WATER, 0.5);
    g.fillCircle(40, 40, 25);
    g.generateTexture('holy_water', 80, 80);
    g.destroy();
  }

  private generateGroundTexture(): void {
    const g = this.add.graphics();
    g.fillStyle(COLORS.GROUND, 1);
    g.fillRect(0, 0, 64, 64);
    g.lineStyle(1, COLORS.GROUND_LINE, 0.3);
    g.strokeRect(0, 0, 64, 64);
    g.lineBetween(32, 0, 32, 64);
    g.lineBetween(0, 32, 64, 32);
    g.generateTexture('ground', 64, 64);
    g.destroy();
  }
}
