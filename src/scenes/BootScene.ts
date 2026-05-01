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
    this.generateGarlicTexture();
    this.generateFireProjectileTexture();
    this.generateFrostZoneTexture();
    this.generateGroundTextures();

    this.scene.start(this.registry.get('nextScene') ?? 'GameScene');
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

  private generateGarlicTexture(): void {
    const g = this.add.graphics();
    g.fillStyle(0xeeffee, 0.2);
    g.fillCircle(30, 30, 28);
    g.fillStyle(0xccffcc, 0.35);
    g.fillCircle(30, 30, 18);
    g.fillStyle(0xffffff, 0.25);
    g.fillCircle(30, 30, 8);
    g.generateTexture('garlic', 60, 60);
    g.destroy();
  }

  private generateFireProjectileTexture(): void {
    const g = this.add.graphics();
    g.fillStyle(0xff4400, 1);
    g.fillCircle(6, 6, 5);
    g.fillStyle(0xffaa00, 0.8);
    g.fillCircle(5, 5, 3);
    g.fillStyle(0xffff44, 0.6);
    g.fillCircle(4, 4, 1.5);
    g.generateTexture('fire_projectile', 12, 12);
    g.destroy();
  }

  private generateFrostZoneTexture(): void {
    const g = this.add.graphics();
    g.fillStyle(0x88bbff, 0.2);
    g.fillCircle(40, 40, 40);
    g.fillStyle(0xaaddff, 0.35);
    g.fillCircle(40, 40, 25);
    g.fillStyle(0xcceeff, 0.25);
    g.fillCircle(40, 40, 12);
    g.generateTexture('frost_zone', 80, 80);
    g.destroy();
  }

  private generateGroundTextures(): void {
    const T = 64; // tile size
    this.genGrassTiles(T);
    this.genPathTiles(T);
    this.genDecoTiles(T);
  }

  // --- Grass tiles (3 variants) ---
  private genGrassTiles(T: number): void {
    const bases = [
      { key: 'tile_grass1', base: 0x3a7a2a, patches: [0x358025, 0x3d8530, 0x44903a] },
      { key: 'tile_grass2', base: 0x367828, patches: [0x2e6e22, 0x3a7a2a, 0x4a9540] },
      { key: 'tile_grass3', base: 0x3e8230, patches: [0x44903a, 0x358025, 0x4a9540] },
    ];
    for (const { key, base, patches } of bases) {
      const g = this.add.graphics();
      g.fillStyle(base, 1);
      g.fillRect(0, 0, T, T);
      // Color variation patches
      for (let i = 0; i < 12; i++) {
        const cx = Math.random() * T;
        const cy = Math.random() * T;
        g.fillStyle(patches[i % patches.length], 0.4 + Math.random() * 0.3);
        g.fillCircle(cx, cy, 3 + Math.random() * 8);
      }
      // Grass blades
      for (let i = 0; i < 20; i++) {
        const bx = Math.random() * T;
        const by = Math.random() * T;
        const shade = [0x2d6b1e, 0x4da83a, 0x5cb849, 0x388c28][i % 4];
        g.lineStyle(1, shade, 0.5 + Math.random() * 0.3);
        g.lineBetween(bx, by, bx + (Math.random() - 0.5) * 5, by - 3 - Math.random() * 4);
      }
      g.generateTexture(key, T, T);
      g.destroy();
    }
  }

  // --- Path tiles (horizontal, vertical, crossroads, corners) ---
  private genPathTiles(T: number): void {
    const drawDirt = (g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number) => {
      g.fillStyle(0x8b7355, 1);
      g.fillRect(x, y, w, h);
      // Edge blend
      g.fillStyle(0x6b5a3e, 0.5);
      if (h < T) { g.fillRect(x, y - 2, w, 3); g.fillRect(x, y + h - 1, w, 3); }
      if (w < T) { g.fillRect(x - 2, y, 3, h); g.fillRect(x + w - 1, y, 3, h); }
      // Pebbles
      g.fillStyle(0x9a8565, 0.5);
      for (let i = 0; i < 8; i++) {
        g.fillCircle(x + Math.random() * w, y + Math.random() * h, 1 + Math.random());
      }
    };

    const grassBase = (g: Phaser.GameObjects.Graphics) => {
      g.fillStyle(0x3a7a2a, 1);
      g.fillRect(0, 0, T, T);
      for (let i = 0; i < 6; i++) {
        g.fillStyle([0x358025, 0x3d8530, 0x44903a][i % 3], 0.35);
        g.fillCircle(Math.random() * T, Math.random() * T, 3 + Math.random() * 6);
      }
    };

    const pw = 24; // path width
    const offset = (T - pw) / 2;

    // Horizontal path
    let g = this.add.graphics();
    grassBase(g);
    drawDirt(g, 0, offset, T, pw);
    g.generateTexture('tile_path_h', T, T);
    g.destroy();

    // Vertical path
    g = this.add.graphics();
    grassBase(g);
    drawDirt(g, offset, 0, pw, T);
    g.generateTexture('tile_path_v', T, T);
    g.destroy();

    // Crossroads
    g = this.add.graphics();
    grassBase(g);
    drawDirt(g, 0, offset, T, pw);
    drawDirt(g, offset, 0, pw, T);
    g.generateTexture('tile_path_cross', T, T);
    g.destroy();

    // Corner: top-right (path goes right and down)
    g = this.add.graphics();
    grassBase(g);
    drawDirt(g, offset, offset, T - offset, pw); // right
    drawDirt(g, offset, offset, pw, T - offset); // down
    g.generateTexture('tile_path_corner_rd', T, T);
    g.destroy();

    // Corner: top-left (path goes left and down)
    g = this.add.graphics();
    grassBase(g);
    drawDirt(g, 0, offset, T - offset, pw); // left
    drawDirt(g, offset, offset, pw, T - offset); // down
    g.generateTexture('tile_path_corner_ld', T, T);
    g.destroy();

    // Corner: bottom-right (path goes right and up)
    g = this.add.graphics();
    grassBase(g);
    drawDirt(g, offset, offset, T - offset, pw); // right
    drawDirt(g, offset, 0, pw, T - offset); // up
    g.generateTexture('tile_path_corner_ru', T, T);
    g.destroy();

    // Corner: bottom-left (path goes left and up)
    g = this.add.graphics();
    grassBase(g);
    drawDirt(g, 0, offset, T - offset, pw); // left
    drawDirt(g, offset, 0, pw, T - offset); // up
    g.generateTexture('tile_path_corner_lu', T, T);
    g.destroy();

    // Dead-end caps (path ends)
    // End right
    g = this.add.graphics();
    grassBase(g);
    drawDirt(g, 0, offset, T - 10, pw);
    g.fillStyle(0x3a7a2a, 1);
    g.fillRect(T - 10, offset - 2, 12, pw + 4);
    g.fillStyle(0x6b5a3e, 0.4);
    g.fillCircle(T - 12, T / 2, pw / 2 - 2);
    g.generateTexture('tile_path_end_r', T, T);
    g.destroy();

    // End left
    g = this.add.graphics();
    grassBase(g);
    drawDirt(g, 10, offset, T - 10, pw);
    g.fillStyle(0x3a7a2a, 1);
    g.fillRect(0, offset - 2, 12, pw + 4);
    g.fillStyle(0x6b5a3e, 0.4);
    g.fillCircle(12, T / 2, pw / 2 - 2);
    g.generateTexture('tile_path_end_l', T, T);
    g.destroy();
  }

  // --- Deco tiles: flowers, stones, bushes on grass ---
  private genDecoTiles(T: number): void {
    const grassBase = (g: Phaser.GameObjects.Graphics) => {
      g.fillStyle(0x3a7a2a, 1);
      g.fillRect(0, 0, T, T);
      for (let i = 0; i < 8; i++) {
        g.fillStyle([0x358025, 0x3d8530, 0x44903a][i % 3], 0.35);
        g.fillCircle(Math.random() * T, Math.random() * T, 3 + Math.random() * 7);
      }
      for (let i = 0; i < 10; i++) {
        const bx = Math.random() * T;
        const by = Math.random() * T;
        g.lineStyle(1, [0x2d6b1e, 0x4da83a, 0x388c28][i % 3], 0.5);
        g.lineBetween(bx, by, bx + (Math.random() - 0.5) * 4, by - 3 - Math.random() * 3);
      }
    };

    // Flower tile - yellow flowers
    let g = this.add.graphics();
    grassBase(g);
    const flowerPositions = [[16, 20], [40, 15], [28, 45], [50, 38], [12, 48]];
    for (const [fx, fy] of flowerPositions) {
      g.lineStyle(1, 0x2a6e1a, 0.8);
      g.lineBetween(fx, fy + 4, fx, fy);
      g.fillStyle(0xffee44, 0.9);
      g.fillCircle(fx, fy - 1, 2.5);
      g.fillCircle(fx - 2.5, fy + 1, 2);
      g.fillCircle(fx + 2.5, fy + 1, 2);
      g.fillStyle(0xffaa00, 1);
      g.fillCircle(fx, fy, 1.2);
    }
    g.generateTexture('tile_flowers_yellow', T, T);
    g.destroy();

    // Flower tile - mixed colors
    g = this.add.graphics();
    grassBase(g);
    const colors2 = [0xff6688, 0xdd88ff, 0xffffff, 0xff9944];
    const positions2 = [[12, 14], [45, 22], [22, 42], [52, 50], [34, 12]];
    for (let i = 0; i < positions2.length; i++) {
      const [fx, fy] = positions2[i];
      g.lineStyle(1, 0x2a6e1a, 0.8);
      g.lineBetween(fx, fy + 4, fx, fy);
      g.fillStyle(colors2[i % colors2.length], 0.9);
      g.fillCircle(fx, fy - 1, 2.5);
      g.fillCircle(fx - 2, fy + 1, 1.8);
      g.fillCircle(fx + 2, fy + 1, 1.8);
      g.fillStyle(0xffcc00, 1);
      g.fillCircle(fx, fy, 1);
    }
    g.generateTexture('tile_flowers_mixed', T, T);
    g.destroy();

    // Stone tile - scattered rocks
    g = this.add.graphics();
    grassBase(g);
    const stones = [[18, 22, 6], [42, 18, 5], [30, 44, 7], [52, 42, 4], [10, 50, 3]];
    for (const [sx, sy, sr] of stones) {
      g.fillStyle(0x777777, 0.8);
      g.fillEllipse(sx, sy, sr * 2, sr * 1.3);
      g.fillStyle(0x999999, 0.5);
      g.fillEllipse(sx - 1, sy - 1, sr * 1.4, sr * 0.9);
      g.fillStyle(0x555555, 0.3);
      g.fillEllipse(sx + 1, sy + 1, sr * 0.8, sr * 0.5);
    }
    g.generateTexture('tile_stones', T, T);
    g.destroy();

    // Bush tile - dark green bushes
    g = this.add.graphics();
    grassBase(g);
    const bushes = [[16, 32], [44, 20], [32, 50]];
    for (const [bx, by] of bushes) {
      // Shadow
      g.fillStyle(0x1a4a10, 0.4);
      g.fillEllipse(bx + 1, by + 3, 18, 8);
      // Bush body
      g.fillStyle(0x2a6e1a, 0.9);
      g.fillEllipse(bx, by, 16, 12);
      g.fillStyle(0x338822, 0.8);
      g.fillEllipse(bx - 3, by - 2, 10, 8);
      g.fillEllipse(bx + 4, by - 1, 10, 9);
      // Highlights
      g.fillStyle(0x4da83a, 0.5);
      g.fillCircle(bx - 2, by - 3, 3);
      g.fillCircle(bx + 3, by - 2, 2.5);
    }
    g.generateTexture('tile_bushes', T, T);
    g.destroy();

    // Tall grass / weeds tile
    g = this.add.graphics();
    grassBase(g);
    for (let i = 0; i < 30; i++) {
      const wx = 4 + Math.random() * (T - 8);
      const wy = 10 + Math.random() * (T - 14);
      const shade = [0x2d6b1e, 0x3d8530, 0x5cb849, 0x4a9540][i % 4];
      g.lineStyle(1.5, shade, 0.7 + Math.random() * 0.3);
      const h = 6 + Math.random() * 8;
      const lean = (Math.random() - 0.5) * 8;
      g.lineBetween(wx, wy, wx + lean * 0.3, wy - h * 0.5);
      g.lineBetween(wx + lean * 0.3, wy - h * 0.5, wx + lean, wy - h);
    }
    g.generateTexture('tile_tallgrass', T, T);
    g.destroy();

    // Mushroom tile
    g = this.add.graphics();
    grassBase(g);
    const mushrooms = [[20, 30], [46, 24], [30, 50]];
    for (const [mx, my] of mushrooms) {
      // Stem
      g.fillStyle(0xeeddcc, 0.9);
      g.fillRect(mx - 2, my, 4, 6);
      // Cap
      g.fillStyle(0xcc3322, 0.9);
      g.fillEllipse(mx, my - 1, 10, 7);
      // Spots
      g.fillStyle(0xffffff, 0.8);
      g.fillCircle(mx - 2, my - 2, 1.2);
      g.fillCircle(mx + 2, my - 1, 1);
    }
    g.generateTexture('tile_mushrooms', T, T);
    g.destroy();
  }
}
