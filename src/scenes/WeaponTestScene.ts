import * as Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy, EnemyConfig } from '../entities/Enemy';
import { WeaponManager } from '../weapons/WeaponManager';
import { Weapon } from '../weapons/Weapon';
import { WeaponDef, WEAPON_DEFS } from '../weapons/WeaponDefs';
import { updateStatusEffects, applyDamage } from '../weapons/DamageSystem';
import { BackgroundScroller } from '../systems/BackgroundScroller';

const TEST_ENEMY_CONFIGS: Record<string, EnemyConfig> = {
  normal: { texture: 'enemy', hp: 15, speed: 60, damage: 10, xpValue: 1 },
  fast: { texture: 'enemy_fast', hp: 8, speed: 120, damage: 7, xpValue: 1 },
  big: { texture: 'enemy_big', hp: 50, speed: 36, damage: 20, xpValue: 3 },
};

export class WeaponTestScene extends Phaser.Scene {
  player!: Player;
  weaponManager!: WeaponManager;
  enemyGroup!: Phaser.Physics.Arcade.Group;
  backgroundScroller!: BackgroundScroller;
  invincible = true;
  killCount = 0;

  constructor() {
    super({ key: 'WeaponTestScene' });
  }

  create(): void {
    this.killCount = 0;
    this.backgroundScroller = new BackgroundScroller(this);
    this.player = new Player(this, 0, 0);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.enemyGroup = this.physics.add.group({
      classType: Enemy,
      maxSize: 500,
      runChildUpdate: false,
    });
    this.physics.add.collider(this.enemyGroup, this.enemyGroup);

    this.weaponManager = new WeaponManager();
    this.weaponManager.onProjectileGroupCreated = (group) => this.registerProjectileCollision(group);

    // Enemy vs Player
    this.physics.add.overlap(this.player, this.enemyGroup, (_p, enemy) => {
      const e = enemy as Enemy;
      if (!e.active || this.invincible) return;
      this.player.takeDamage(e.contactDamage);
    });

    this.physics.world.createDebugGraphic();
    this.physics.world.drawDebug = false;
    this.physics.world.debugGraphic.clear();
  }

  update(time: number, delta: number): void {
    this.player.update(time, delta);
    this.backgroundScroller.update(this.cameras.main);
    this.weaponManager.update(time, delta, this, this.player, this.enemyGroup);

    if (this.invincible) {
      this.player.hp = this.player.maxHp;
      this.player.invincible = false;
    }

    for (const child of this.enemyGroup.getChildren()) {
      const enemy = child as Enemy;
      if (enemy.active) {
        updateStatusEffects(enemy, delta);
        if (enemy.active) enemy.preUpdate(time, delta);
      }
    }
  }

  // === Public API ===

  addWeaponById(id: string): void {
    const def = WEAPON_DEFS.find(d => d.id === id);
    if (!def || this.weaponManager.hasWeapon(def.name)) return;
    this.weaponManager.addWeapon(new Weapon(def, this));
  }

  removeWeaponByName(name: string): void {
    this.weaponManager.removeWeapon(name);
  }

  addCustomWeapon(def: WeaponDef): void {
    this.weaponManager.removeWeapon(def.name);
    this.weaponManager.addWeapon(new Weapon(def, this));
  }

  levelUpWeapon(name: string): void {
    this.weaponManager.getWeapon(name)?.levelUp();
  }

  spawnEnemies(type: string, count: number): void {
    const config = TEST_ENEMY_CONFIGS[type] || TEST_ENEMY_CONFIGS.normal;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
      const dist = 150 + Math.random() * 150;
      const x = this.player.x + Math.cos(angle) * dist;
      const y = this.player.y + Math.sin(angle) * dist;

      let enemy = this.enemyGroup.getFirstDead(false) as Enemy | null;
      if (!enemy) {
        enemy = new Enemy(this, x, y, config.texture);
        this.add.existing(enemy);
        this.physics.add.existing(enemy);
        this.enemyGroup.add(enemy);
      }
      enemy.spawn(x, y, config, this.player);
      enemy.onDeathCallback = () => { this.killCount++; };
    }
  }

  clearEnemies(): void {
    for (const child of this.enemyGroup.getChildren()) {
      const enemy = child as Enemy;
      if (enemy.active) enemy.die();
    }
  }

  removeAllWeapons(): void {
    this.weaponManager.weapons = [];
  }

  toggleInvincible(): boolean {
    this.invincible = !this.invincible;
    return this.invincible;
  }

  toggleColliders(): boolean {
    const w = this.physics.world;
    w.drawDebug = !w.drawDebug;
    if (!w.drawDebug) w.debugGraphic.clear();
    return w.drawDebug;
  }

  resetPlayer(): void {
    this.player.hp = this.player.maxHp;
    this.player.setPosition(0, 0);
    this.player.invincible = false;
    this.player.setActive(true).setVisible(true);
    this.player.setAlpha(1);
  }

  getActiveEnemyCount(): number {
    return this.enemyGroup.getChildren().filter(e => e.active).length;
  }

  getWeaponList(): { name: string; level: number; id: string }[] {
    return this.weaponManager.weapons.map(w => ({ name: w.name, level: w.level, id: w.def.id }));
  }

  private registerProjectileCollision(group: Phaser.Physics.Arcade.Group): void {
    this.physics.add.overlap(group, this.enemyGroup, (proj, enemy) => {
      const projectile = proj as Phaser.Physics.Arcade.Sprite;
      const e = enemy as Enemy;
      if (!projectile.active || !e.active) return;

      const weapon = projectile.getData('weapon') as Weapon;
      const damage = projectile.getData('damage') as number;

      applyDamage({
        scene: this, target: e, damage,
        sourceX: projectile.x, sourceY: projectile.y,
        effects: weapon?.def.effects,
        weapon, player: this.player, enemies: this.enemyGroup,
      });

      projectile.setActive(false).setVisible(false);
      if (projectile.body) {
        (projectile.body as Phaser.Physics.Arcade.Body).enable = false;
      }
    });
  }
}
