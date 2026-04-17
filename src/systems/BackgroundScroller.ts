import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

const TILE_SIZE = 64;
const PADDING = 3; // extra tiles beyond viewport edge

// Seeded RNG for consistent tile placement
function seededRandom(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263 + 1013904223) | 0;
  h = ((h ^ (h >> 13)) * 1274126177) | 0;
  h = h ^ (h >> 16);
  return (h & 0x7fffffff) / 0x7fffffff;
}

// Path layout: deterministic grid-based path network
function isPathH(tileX: number, tileY: number): boolean {
  // Horizontal paths every 8 tiles with slight variation
  const row = Math.floor(tileY / 8);
  const targetY = row * 8 + Math.floor(seededRandom(0, row) * 3);
  return tileY === targetY;
}

function isPathV(tileX: number, _tileY: number): boolean {
  // Vertical paths every 10 tiles with slight variation
  const col = Math.floor(tileX / 10);
  const targetX = col * 10 + Math.floor(seededRandom(col, 0) * 3);
  return tileX === targetX;
}

type TileType = 'grass' | 'path_h' | 'path_v' | 'path_cross' | 'path_corner' | 'deco';

function getTileType(tx: number, ty: number): { type: TileType; texture: string } {
  const pH = isPathH(tx, ty);
  const pV = isPathV(tx, ty);

  if (pH && pV) {
    return { type: 'path_cross', texture: 'tile_path_cross' };
  }

  if (pH) {
    // Check if this is a corner piece
    const vAbove = isPathV(tx, ty - 1);
    const vBelow = isPathV(tx, ty + 1);
    const hLeft = isPathH(tx - 1, ty);
    const hRight = isPathH(tx + 1, ty);

    if (!hLeft && vAbove) return { type: 'path_corner', texture: 'tile_path_corner_ru' };
    if (!hLeft && vBelow) return { type: 'path_corner', texture: 'tile_path_corner_rd' };
    if (!hRight && vAbove) return { type: 'path_corner', texture: 'tile_path_corner_lu' };
    if (!hRight && vBelow) return { type: 'path_corner', texture: 'tile_path_corner_ld' };

    return { type: 'path_h', texture: 'tile_path_h' };
  }

  if (pV) {
    return { type: 'path_v', texture: 'tile_path_v' };
  }

  // Decoration tiles on grass
  const r = seededRandom(tx, ty);
  if (r < 0.05) return { type: 'deco', texture: 'tile_flowers_yellow' };
  if (r < 0.09) return { type: 'deco', texture: 'tile_flowers_mixed' };
  if (r < 0.12) return { type: 'deco', texture: 'tile_stones' };
  if (r < 0.16) return { type: 'deco', texture: 'tile_bushes' };
  if (r < 0.22) return { type: 'deco', texture: 'tile_tallgrass' };
  if (r < 0.25) return { type: 'deco', texture: 'tile_mushrooms' };

  // Regular grass variants
  const grassIdx = Math.floor(seededRandom(tx + 99, ty + 77) * 3) + 1;
  return { type: 'grass', texture: `tile_grass${grassIdx}` };
}

export class BackgroundScroller {
  private scene: Phaser.Scene;
  private activeTiles: Map<string, Phaser.GameObjects.Image> = new Map();
  private tilesW: number;
  private tilesH: number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.tilesW = Math.ceil(GAME_WIDTH / TILE_SIZE) + PADDING * 2;
    this.tilesH = Math.ceil(GAME_HEIGHT / TILE_SIZE) + PADDING * 2;
  }

  private tileKey(tx: number, ty: number): string {
    return `${tx},${ty}`;
  }

  update(camera: Phaser.Cameras.Scene2D.Camera): void {
    const startTX = Math.floor((camera.scrollX - PADDING * TILE_SIZE) / TILE_SIZE);
    const startTY = Math.floor((camera.scrollY - PADDING * TILE_SIZE) / TILE_SIZE);
    const endTX = startTX + this.tilesW;
    const endTY = startTY + this.tilesH;

    // Track which tiles should exist
    const neededKeys = new Set<string>();
    for (let tx = startTX; tx <= endTX; tx++) {
      for (let ty = startTY; ty <= endTY; ty++) {
        neededKeys.add(this.tileKey(tx, ty));
      }
    }

    // Remove tiles no longer visible
    for (const [key, img] of this.activeTiles) {
      if (!neededKeys.has(key)) {
        img.destroy();
        this.activeTiles.delete(key);
      }
    }

    // Add new tiles
    for (let tx = startTX; tx <= endTX; tx++) {
      for (let ty = startTY; ty <= endTY; ty++) {
        const key = this.tileKey(tx, ty);
        if (this.activeTiles.has(key)) continue;

        const { texture } = getTileType(tx, ty);
        const img = this.scene.add.image(
          tx * TILE_SIZE + TILE_SIZE / 2,
          ty * TILE_SIZE + TILE_SIZE / 2,
          texture,
        );
        img.setDepth(-1);
        this.activeTiles.set(key, img);
      }
    }
  }
}
