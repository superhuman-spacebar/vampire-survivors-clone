import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config';
import { GameScene } from './GameScene';
import { MagicMissile } from '../weapons/MagicMissile';
import { Whip } from '../weapons/Whip';
import { HolyWater } from '../weapons/HolyWater';

interface WeaponDef {
  name: string;
  create: (scene: Phaser.Scene) => { weapon: import('../weapons/BaseWeapon').BaseWeapon; projectileGroup?: Phaser.Physics.Arcade.Group };
}

const ALL_WEAPONS: WeaponDef[] = [
  {
    name: 'Whip',
    create: () => ({ weapon: new Whip() }),
  },
  {
    name: 'Magic Missile',
    create: (scene) => {
      const m = new MagicMissile(scene);
      return { weapon: m, projectileGroup: m.getProjectileGroup() };
    },
  },
  {
    name: 'Holy Water',
    create: () => ({ weapon: new HolyWater() }),
  },
];

export class HUDScene extends Phaser.Scene {
  private gameScene!: GameScene;
  private hpBar!: Phaser.GameObjects.Graphics;
  private xpBar!: Phaser.GameObjects.Graphics;
  private timerText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private killText!: Phaser.GameObjects.Text;

  private debugContainer!: Phaser.GameObjects.Container;
  private debugBg!: Phaser.GameObjects.Graphics;
  private weaponButtons: { bg: Phaser.GameObjects.Rectangle; label: Phaser.GameObjects.Text; def: WeaponDef }[] = [];

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

    this.createDebugPanel();
  }

  private createDebugPanel(): void {
    const panelW = 180;
    const btnH = 28;
    const padding = 8;
    const headerH = 24;
    const panelH = headerH + padding + ALL_WEAPONS.length * (btnH + 6) + padding;
    const panelX = 10;
    const panelY = GAME_HEIGHT - panelH - 10;

    this.debugContainer = this.add.container(panelX, panelY);

    // Background
    this.debugBg = this.add.graphics();
    this.debugBg.fillStyle(0x000000, 0.7);
    this.debugBg.fillRoundedRect(0, 0, panelW, panelH, 6);
    this.debugBg.lineStyle(1, 0x666666, 0.8);
    this.debugBg.strokeRoundedRect(0, 0, panelW, panelH, 6);
    this.debugContainer.add(this.debugBg);

    // Header
    const header = this.add.text(panelW / 2, padding, 'DEBUG: Weapons', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#ffaa00',
    }).setOrigin(0.5, 0);
    this.debugContainer.add(header);

    // Weapon toggle buttons
    this.weaponButtons = [];
    ALL_WEAPONS.forEach((def, i) => {
      const btnY = headerH + padding + i * (btnH + 6);

      const bg = this.add.rectangle(panelW / 2, btnY + btnH / 2, panelW - padding * 2, btnH, 0x333333, 0.9);
      bg.setStrokeStyle(1, 0x555555);
      bg.setInteractive({ useHandCursor: true });

      const label = this.add.text(panelW / 2, btnY + btnH / 2, def.name, {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#aaaaaa',
      }).setOrigin(0.5);

      bg.on('pointerover', () => {
        bg.setStrokeStyle(1, 0x8888ff);
      });
      bg.on('pointerout', () => {
        bg.setStrokeStyle(1, 0x555555);
      });
      bg.on('pointerdown', () => {
        this.toggleWeapon(def);
      });

      this.debugContainer.add(bg);
      this.debugContainer.add(label);
      this.weaponButtons.push({ bg, label, def });
    });
  }

  private toggleWeapon(def: WeaponDef): void {
    const wm = this.gameScene.weaponManager;
    if (wm.hasWeapon(def.name)) {
      wm.removeWeapon(def.name);
    } else {
      const { weapon, projectileGroup } = def.create(this.gameScene);
      wm.addWeapon(weapon);
      if (projectileGroup) {
        this.gameScene.addProjectileCollision(projectileGroup);
      }
    }
  }

  private updateDebugButtons(): void {
    const wm = this.gameScene.weaponManager;
    for (const btn of this.weaponButtons) {
      const owned = wm.hasWeapon(btn.def.name);
      const weapon = wm.getWeapon(btn.def.name);
      if (owned) {
        btn.bg.setFillStyle(0x224422, 0.9);
        btn.label.setColor('#44ff44');
        btn.label.setText(`${btn.def.name} Lv${weapon?.level ?? 1}`);
      } else {
        btn.bg.setFillStyle(0x333333, 0.9);
        btn.label.setColor('#aaaaaa');
        btn.label.setText(btn.def.name);
      }
    }
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

    // Debug
    this.updateDebugButtons();
  }
}
