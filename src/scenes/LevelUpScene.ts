import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { GameScene } from './GameScene';
import { Upgrade } from '../systems/LevelUpSystem';

export class LevelUpScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelUpScene' });
  }

  create(data: { gameScene: GameScene; choices: Upgrade[] }): void {
    const { gameScene, choices } = data;

    // Dim overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6);
    overlay.setInteractive();

    // Title
    this.add.text(GAME_WIDTH / 2, 120, 'LEVEL UP!', {
      fontFamily: 'monospace',
      fontSize: '36px',
      color: '#ffff44',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 170, 'Choose an upgrade:', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Choice cards
    const cardWidth = 260;
    const cardHeight = 140;
    const gap = 30;
    const totalWidth = choices.length * cardWidth + (choices.length - 1) * gap;
    const startX = (GAME_WIDTH - totalWidth) / 2 + cardWidth / 2;

    choices.forEach((choice, i) => {
      const x = startX + i * (cardWidth + gap);
      const y = GAME_HEIGHT / 2 + 20;

      // Card background
      const card = this.add.rectangle(x, y, cardWidth, cardHeight, 0x333366, 0.9);
      card.setStrokeStyle(2, 0x6666aa);
      card.setInteractive({ useHandCursor: true });

      // Type icon color
      const typeColor = choice.type === 'new_weapon' ? '#44ff44' :
                        choice.type === 'upgrade_weapon' ? '#4488ff' : '#ffaa44';

      // Type label
      const typeLabel = choice.type === 'new_weapon' ? 'NEW' :
                       choice.type === 'upgrade_weapon' ? 'UPGRADE' : 'STAT';
      this.add.text(x, y - 40, typeLabel, {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: typeColor,
      }).setOrigin(0.5);

      // Name
      this.add.text(x, y - 10, choice.name, {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffffff',
      }).setOrigin(0.5);

      // Description
      this.add.text(x, y + 25, choice.description, {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#aaaaaa',
        wordWrap: { width: cardWidth - 20 },
      }).setOrigin(0.5);

      // Hover effect
      card.on('pointerover', () => {
        card.setFillStyle(0x444488, 1);
        card.setStrokeStyle(2, 0x8888ff);
      });
      card.on('pointerout', () => {
        card.setFillStyle(0x333366, 0.9);
        card.setStrokeStyle(2, 0x6666aa);
      });

      // Click
      card.on('pointerdown', () => {
        if (this.scene.isPaused()) return;
        choice.apply(gameScene.player, gameScene.weaponManager, gameScene);
        gameScene.scene.resume();
        this.scene.stop();
      });
    });
  }
}
