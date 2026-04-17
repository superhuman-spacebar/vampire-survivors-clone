import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

export class BackgroundScroller {
  private tileSprite: Phaser.GameObjects.TileSprite;

  constructor(scene: Phaser.Scene) {
    this.tileSprite = scene.add.tileSprite(0, 0, GAME_WIDTH * 3, GAME_HEIGHT * 3, 'ground');
    this.tileSprite.setDepth(-1);
  }

  update(camera: Phaser.Cameras.Scene2D.Camera): void {
    this.tileSprite.setPosition(camera.scrollX + camera.width / 2, camera.scrollY + camera.height / 2);
    this.tileSprite.setTilePosition(camera.scrollX, camera.scrollY);
  }
}
