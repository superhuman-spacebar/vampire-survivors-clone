import * as Phaser from 'phaser';

export class ExperienceGem extends Phaser.Physics.Arcade.Sprite {
  value = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'gem');
  }

  spawn(x: number, y: number, value: number): void {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.value = value;
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).enable = true;
    }
  }

  collect(): void {
    this.setActive(false);
    this.setVisible(false);
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).enable = false;
    }
  }

  magnetToward(targetX: number, targetY: number, strength: number): void {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
    this.setVelocity(Math.cos(angle) * strength, Math.sin(angle) * strength);
  }
}
