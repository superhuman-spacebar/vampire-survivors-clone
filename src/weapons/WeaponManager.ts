import * as Phaser from 'phaser';
import { Weapon } from './Weapon';
import { Player } from '../entities/Player';

export class WeaponManager {
  weapons: Weapon[] = [];
  onProjectileGroupCreated?: (group: Phaser.Physics.Arcade.Group) => void;

  addWeapon(weapon: Weapon): void {
    this.weapons.push(weapon);
    if (weapon.projectileGroup && this.onProjectileGroupCreated) {
      this.onProjectileGroupCreated(weapon.projectileGroup);
    }
  }

  getWeapon(name: string): Weapon | undefined {
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
