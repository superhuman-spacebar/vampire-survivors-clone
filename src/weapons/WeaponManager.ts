import * as Phaser from 'phaser';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';

export class WeaponManager {
  weapons: BaseWeapon[] = [];
  onEnemyKilled?: (enemy: Phaser.Physics.Arcade.Sprite) => void;

  addWeapon(weapon: BaseWeapon): void {
    if (this.onEnemyKilled) {
      weapon.onEnemyKilled = this.onEnemyKilled;
    }
    this.weapons.push(weapon);
  }

  getWeapon(name: string): BaseWeapon | undefined {
    return this.weapons.find(w => w.name === name);
  }

  removeWeapon(name: string): void {
    this.weapons = this.weapons.filter(w => w.name !== name);
  }

  hasWeapon(name: string): boolean {
    return this.weapons.some(w => w.name === name);
  }

  update(time: number, delta: number, scene: Phaser.Scene, player: Player, enemies: Phaser.Physics.Arcade.Group): void {
    for (const weapon of this.weapons) {
      weapon.update(time, delta, scene, player, enemies);
    }
  }

  getWeaponNames(): string[] {
    return this.weapons.map(w => w.name);
  }
}
