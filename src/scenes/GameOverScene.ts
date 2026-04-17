import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: { time: number; kills: number; level: number }): void {
    // Overlay
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.8);

    // Game Over text
    this.add.text(GAME_WIDTH / 2, 180, 'GAME OVER', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: '#ff4444',
    }).setOrigin(0.5);

    // Stats
    const totalSeconds = Math.floor(data.time / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');

    const stats = [
      `Time Survived: ${minutes}:${seconds}`,
      `Enemies Killed: ${data.kills}`,
      `Level Reached: ${data.level}`,
    ];

    stats.forEach((stat, i) => {
      this.add.text(GAME_WIDTH / 2, 280 + i * 40, stat, {
        fontFamily: 'monospace',
        fontSize: '22px',
        color: '#ffffff',
      }).setOrigin(0.5);
    });

    // Restart button
    const btn = this.add.rectangle(GAME_WIDTH / 2, 480, 200, 50, 0x446644, 1);
    btn.setStrokeStyle(2, 0x66aa66);
    btn.setInteractive({ useHandCursor: true });

    this.add.text(GAME_WIDTH / 2, 480, 'RESTART', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5);

    btn.on('pointerover', () => btn.setFillStyle(0x558855));
    btn.on('pointerout', () => btn.setFillStyle(0x446644));
    btn.on('pointerdown', () => {
      this.scene.stop('GameScene');
      this.scene.stop();
      this.scene.start('GameScene');
    });
  }
}
