import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config';
import { GameScene } from './GameScene';
import { MagicMissile } from '../weapons/MagicMissile';
import { Whip } from '../weapons/Whip';
import { HolyWater } from '../weapons/HolyWater';
import { Upgrade } from '../systems/LevelUpSystem';

interface WeaponDef {
  name: string;
  create: (scene: Phaser.Scene) => { weapon: import('../weapons/BaseWeapon').BaseWeapon; projectileGroup?: Phaser.Physics.Arcade.Group };
}

const ALL_WEAPONS: WeaponDef[] = [
  { name: 'Whip', create: () => ({ weapon: new Whip() }) },
  {
    name: 'Magic Missile',
    create: (scene) => {
      const m = new MagicMissile(scene);
      return { weapon: m, projectileGroup: m.getProjectileGroup() };
    },
  },
  { name: 'Holy Water', create: () => ({ weapon: new HolyWater() }) },
];

export class HUDScene extends Phaser.Scene {
  private gameScene!: GameScene;
  private hpBar!: Phaser.GameObjects.Graphics;
  private xpBar!: Phaser.GameObjects.Graphics;
  private timerText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private killText!: Phaser.GameObjects.Text;

  // Debug
  private debugContainer!: Phaser.GameObjects.Container;
  private debugBg!: Phaser.GameObjects.Graphics;
  private weaponButtons: { bg: Phaser.GameObjects.Rectangle; label: Phaser.GameObjects.Text; def: WeaponDef }[] = [];

  // Level-up overlay
  private levelUpContainer: Phaser.GameObjects.Container | null = null;

  constructor() {
    super({ key: 'HUDScene' });
  }

  create(data: { gameScene: GameScene }): void {
    this.gameScene = data.gameScene;

    this.hpBar = this.add.graphics();
    this.xpBar = this.add.graphics();

    this.timerText = this.add.text(GAME_WIDTH - 20, 20, '00:00', {
      fontFamily: 'monospace', fontSize: '24px', color: '#ffffff',
    }).setOrigin(1, 0);

    this.levelText = this.add.text(GAME_WIDTH / 2, 20, 'Lv 1', {
      fontFamily: 'monospace', fontSize: '20px', color: '#ffffff',
    }).setOrigin(0.5, 0);

    this.killText = this.add.text(GAME_WIDTH - 20, 50, 'Kills: 0', {
      fontFamily: 'monospace', fontSize: '16px', color: '#aaaaaa',
    }).setOrigin(1, 0);

    this.createDebugPanel();
  }

  // ──────────────── Level-Up Overlay ────────────────

  showLevelUp(choices: Upgrade[]): void {
    if (this.levelUpContainer) return;

    this.levelUpContainer = this.add.container(0, 0);
    this.levelUpContainer.setDepth(100);

    // Dim overlay
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6);
    overlay.setInteractive();
    this.levelUpContainer.add(overlay);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, 120, 'LEVEL UP!', {
      fontFamily: 'monospace', fontSize: '36px', color: '#ffff44',
    }).setOrigin(0.5);
    this.levelUpContainer.add(title);

    const subtitle = this.add.text(GAME_WIDTH / 2, 170, 'Choose an upgrade:', {
      fontFamily: 'monospace', fontSize: '18px', color: '#ffffff',
    }).setOrigin(0.5);
    this.levelUpContainer.add(subtitle);

    // Cards
    const cardWidth = 260;
    const cardHeight = 140;
    const gap = 30;
    const totalWidth = choices.length * cardWidth + (choices.length - 1) * gap;
    const startX = (GAME_WIDTH - totalWidth) / 2 + cardWidth / 2;

    choices.forEach((choice, i) => {
      const x = startX + i * (cardWidth + gap);
      const y = GAME_HEIGHT / 2 + 20;

      const card = this.add.rectangle(x, y, cardWidth, cardHeight, 0x333366, 0.9);
      card.setStrokeStyle(2, 0x6666aa);
      card.setInteractive({ useHandCursor: true });

      const typeColor = choice.type === 'new_weapon' ? '#44ff44' :
                        choice.type === 'upgrade_weapon' ? '#4488ff' : '#ffaa44';
      const typeLabel = choice.type === 'new_weapon' ? 'NEW' :
                        choice.type === 'upgrade_weapon' ? 'UPGRADE' : 'STAT';

      const typeTxt = this.add.text(x, y - 40, typeLabel, {
        fontFamily: 'monospace', fontSize: '12px', color: typeColor,
      }).setOrigin(0.5);

      const nameTxt = this.add.text(x, y - 10, choice.name, {
        fontFamily: 'monospace', fontSize: '18px', color: '#ffffff',
      }).setOrigin(0.5);

      const descTxt = this.add.text(x, y + 25, choice.description, {
        fontFamily: 'monospace', fontSize: '13px', color: '#aaaaaa',
        wordWrap: { width: cardWidth - 20 },
      }).setOrigin(0.5);

      this.levelUpContainer!.add([card, typeTxt, nameTxt, descTxt]);

      card.on('pointerover', () => {
        card.setFillStyle(0x444488, 1);
        card.setStrokeStyle(2, 0x8888ff);
      });
      card.on('pointerout', () => {
        card.setFillStyle(0x333366, 0.9);
        card.setStrokeStyle(2, 0x6666aa);
      });
      card.on('pointerdown', () => {
        choice.apply(this.gameScene.player, this.gameScene.weaponManager, this.gameScene);
        this.hideLevelUp();
        this.gameScene.scene.resume();
      });
    });
  }

  private hideLevelUp(): void {
    if (this.levelUpContainer) {
      this.levelUpContainer.destroy();
      this.levelUpContainer = null;
    }
  }

  // ──────────────── Debug Panel ────────────────

  private makeButton(
    panelW: number, padding: number, btnH: number, y: number,
    text: string, color: number, onClick: () => void,
  ): { bg: Phaser.GameObjects.Rectangle; label: Phaser.GameObjects.Text } {
    const bg = this.add.rectangle(panelW / 2, y + btnH / 2, panelW - padding * 2, btnH, color, 0.9);
    bg.setStrokeStyle(1, 0x555555);
    bg.setInteractive({ useHandCursor: true });
    const label = this.add.text(panelW / 2, y + btnH / 2, text, {
      fontFamily: 'monospace', fontSize: '13px', color: '#ffffff',
    }).setOrigin(0.5);
    bg.on('pointerover', () => bg.setStrokeStyle(1, 0x8888ff));
    bg.on('pointerout', () => bg.setStrokeStyle(1, 0x555555));
    bg.on('pointerdown', onClick);
    this.debugContainer.add(bg);
    this.debugContainer.add(label);
    return { bg, label };
  }

  private createDebugPanel(): void {
    const panelW = 180;
    const btnH = 28;
    const padding = 8;
    const headerH = 24;
    const sectionGap = 14;
    const weaponSectionH = ALL_WEAPONS.length * (btnH + 6);
    const xpSectionH = headerH + 2 * (btnH + 6);
    const panelH = headerH + padding + weaponSectionH + sectionGap + xpSectionH + padding;
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

    // --- Weapons section ---
    const weaponHeader = this.add.text(panelW / 2, padding, 'Weapons', {
      fontFamily: 'monospace', fontSize: '11px', color: '#ffaa00',
    }).setOrigin(0.5, 0);
    this.debugContainer.add(weaponHeader);

    this.weaponButtons = [];
    ALL_WEAPONS.forEach((def, i) => {
      const btnY = headerH + padding + i * (btnH + 6);
      const { bg, label } = this.makeButton(panelW, padding, btnH, btnY, def.name, 0x333333, () => this.toggleWeapon(def));
      this.weaponButtons.push({ bg, label, def });
    });

    // --- XP / Level section ---
    const xpTop = headerH + padding + weaponSectionH + sectionGap;
    const xpHeader = this.add.text(panelW / 2, xpTop, 'XP / Level', {
      fontFamily: 'monospace', fontSize: '11px', color: '#ffaa00',
    }).setOrigin(0.5, 0);
    this.debugContainer.add(xpHeader);

    const row1Y = xpTop + headerH;
    this.makeButton(panelW, padding, btnH, row1Y, '+10 XP', 0x2a4466, () => {
      const leveled = this.gameScene.player.addXP(10);
      if (leveled) this.gameScene.triggerLevelUp();
    });

    const row2Y = row1Y + btnH + 6;
    this.makeButton(panelW, padding, btnH, row2Y, 'Level Up', 0x44336a, () => {
      const p = this.gameScene.player;
      const needed = p.getXPThreshold() - p.xp;
      p.addXP(needed);
      this.gameScene.triggerLevelUp();
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

  // ──────────────── Update ────────────────

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
