import * as Phaser from 'phaser';
import { GAME_WIDTH, COLORS } from '../config';
import { GameScene } from './GameScene';

export class HUDScene extends Phaser.Scene {
  private gameScene!: GameScene;
  private hpBar!: Phaser.GameObjects.Graphics;
  private xpBar!: Phaser.GameObjects.Graphics;
  private timerText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private killText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'HUDScene' });
  }

  create(data: { gameScene: GameScene }): void {
    this.gameScene = data.gameScene;

    this.hpBar = this.add.graphics();
    this.xpBar = this.add.graphics();

    this.timerText = this.add.text(GAME_WIDTH - 20, 20, '00:00', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(1, 0);

    this.levelText = this.add.text(GAME_WIDTH / 2, 20, 'Lv 1', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5, 0);

    this.killText = this.add.text(GAME_WIDTH - 20, 50, 'Kills: 0', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#aaaaaa',
    }).setOrigin(1, 0);
  }

  update(): void {
    if (!this.gameScene || !this.gameScene.player) return;

    const player = this.gameScene.player;

    // HP Bar
    this.hpBar.clear();
    this.hpBar.fillStyle(COLORS.HP_BAR_BG, 0.8);
    this.hpBar.fillRoundedRect(20, 20, 200, 16, 4);
    this.hpBar.fillStyle(COLORS.HP_BAR, 0.9);
    const hpWidth = Math.max(0, (player.hp / player.maxHp) * 196);
    this.hpBar.fillRoundedRect(22, 22, hpWidth, 12, 3);

    // XP Bar
    this.xpBar.clear();
    this.xpBar.fillStyle(0x222244, 0.8);
    this.xpBar.fillRect(0, 0, GAME_WIDTH, 6);
    this.xpBar.fillStyle(COLORS.XP_BAR, 0.9);
    const xpWidth = (player.xp / player.getXPThreshold()) * GAME_WIDTH;
    this.xpBar.fillRect(0, 0, xpWidth, 6);

    // Timer
    const totalSeconds = Math.floor(this.gameScene.gameTime / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    this.timerText.setText(`${minutes}:${seconds}`);

    // Level
    this.levelText.setText(`Lv ${player.level}`);

    // Kills
    this.killText.setText(`Kills: ${player.kills}`);
  }
}
