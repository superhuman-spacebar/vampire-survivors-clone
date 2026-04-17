import * as Phaser from 'phaser';
import { Player } from '../entities/Player';

export abstract class BaseWeapon {
  name: string;
  description: string;
  level = 1;
  damage: number;
  cooldown: number;
  onEnemyKilled?: (enemy: Phaser.Physics.Arcade.Sprite) => void;
  private fireTimer = 0;

  constructor(name: string, description: string, damage: number, cooldown: number) {
    this.name = name;
    this.description = description;
    this.damage = damage;
    this.cooldown = cooldown;
  }

  update(time: number, delta: number, scene: Phaser.Scene, player: Player, enemies: Phaser.Physics.Arcade.Group): void {
    this.fireTimer -= delta;
    if (this.fireTimer <= 0) {
      this.fire(scene, player, enemies);
      this.fireTimer = this.cooldown;
    }
  }

  abstract fire(scene: Phaser.Scene, player: Player, enemies: Phaser.Physics.Arcade.Group): void;

  levelUp(): void {
    this.level++;
    this.damage = Math.floor(this.damage * 1.3);
    this.cooldown = Math.max(200, this.cooldown * 0.9);
  }

  getDescription(): string {
    return `${this.name} Lv${this.level}: ${this.description}`;
  }
}
