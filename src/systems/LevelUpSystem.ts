import * as Phaser from 'phaser';
import { Player } from '../entities/Player';
import { WeaponManager } from '../weapons/WeaponManager';
import { Weapon } from '../weapons/Weapon';
import { WEAPON_DEFS } from '../weapons/WeaponDefs';

export interface Upgrade {
  type: 'new_weapon' | 'upgrade_weapon' | 'stat_boost';
  name: string;
  description: string;
  apply: (player: Player, weaponManager: WeaponManager, scene: Phaser.Scene) => void;
}

export class LevelUpSystem {
  generateChoices(player: Player, weaponManager: WeaponManager, scene: Phaser.Scene): Upgrade[] {
    const pool: Upgrade[] = [];
    const ownedNames = weaponManager.getWeaponNames();

    // New weapons from WEAPON_DEFS
    for (const def of WEAPON_DEFS) {
      if (!ownedNames.includes(def.name)) {
        pool.push({
          type: 'new_weapon',
          name: def.name,
          description: def.description,
          apply: (_p, wm, s) => {
            wm.addWeapon(new Weapon(def, s));
          },
        });
      }
    }

    // Weapon upgrades
    for (const weapon of weaponManager.weapons) {
      if (weapon.level < 8) {
        pool.push({
          type: 'upgrade_weapon',
          name: `${weapon.name} +`,
          description: `Upgrade to Lv${weapon.level + 1}`,
          apply: () => weapon.levelUp(),
        });
      }
    }

    // Stat boosts
    pool.push({
      type: 'stat_boost',
      name: 'Max HP +20',
      description: 'Increases maximum HP',
      apply: (p) => { p.maxHp += 20; p.hp = Math.min(p.hp + 20, p.maxHp); },
    });
    pool.push({
      type: 'stat_boost',
      name: 'Speed +15%',
      description: 'Move faster',
      apply: (p) => { p.speed *= 1.15; },
    });
    pool.push({
      type: 'stat_boost',
      name: 'Magnet +50',
      description: 'Increases pickup range',
      apply: (p) => { p.magnetRange += 50; },
    });
    pool.push({
      type: 'stat_boost',
      name: 'Heal 30 HP',
      description: 'Restore health',
      apply: (p) => { p.heal(30); },
    });

    // Shuffle and pick 3
    Phaser.Utils.Array.Shuffle(pool);
    return pool.slice(0, 3);
  }
}
