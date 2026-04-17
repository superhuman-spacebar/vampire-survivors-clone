import { Player } from '../entities/Player';
import { WeaponManager } from '../weapons/WeaponManager';
import { MagicMissile } from '../weapons/MagicMissile';
import { Whip } from '../weapons/Whip';
import { HolyWater } from '../weapons/HolyWater';

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

    // New weapons
    if (!ownedNames.includes('Magic Missile')) {
      pool.push({
        type: 'new_weapon',
        name: 'Magic Missile',
        description: 'Fires at nearest enemy',
        apply: (_p, wm, s) => wm.addWeapon(new MagicMissile(s)),
      });
    }
    if (!ownedNames.includes('Whip')) {
      pool.push({
        type: 'new_weapon',
        name: 'Whip',
        description: 'Slashes in front of you',
        apply: (_p, wm) => wm.addWeapon(new Whip()),
      });
    }
    if (!ownedNames.includes('Holy Water')) {
      pool.push({
        type: 'new_weapon',
        name: 'Holy Water',
        description: 'Damaging pool on the ground',
        apply: (_p, wm) => wm.addWeapon(new HolyWater()),
      });
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
