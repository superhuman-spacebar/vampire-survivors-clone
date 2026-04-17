import * as Phaser from 'phaser';
import { BaseWeapon } from './BaseWeapon';
import { Player } from '../entities/Player';

export class WeaponManager {
  weapons: BaseWeapon[] = [];

  addWeapon(weapon: BaseWeapon): void {
    this.weapons.push(weapon);
  }

  getWeapon(name: string): BaseWeapon | undefined {
    return this.weapons.find(w => w.name === name);
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
