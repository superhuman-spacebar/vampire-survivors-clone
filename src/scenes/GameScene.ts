import * as Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { ExperienceGem } from '../entities/ExperienceGem';
import { WeaponManager } from '../weapons/WeaponManager';
import { Whip } from '../weapons/Whip';
import { EnemySpawner } from '../systems/EnemySpawner';
import { LevelUpSystem } from '../systems/LevelUpSystem';
import { BackgroundScroller } from '../systems/BackgroundScroller';

export class GameScene extends Phaser.Scene {
  player!: Player;
  weaponManager!: WeaponManager;
  enemySpawner!: EnemySpawner;
  levelUpSystem!: LevelUpSystem;
  backgroundScroller!: BackgroundScroller;

  gemGroup!: Phaser.Physics.Arcade.Group;
  gameTime = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.gameTime = 0;

    // Background
    this.backgroundScroller = new BackgroundScroller(this);

    // Player
    this.player = new Player(this, 0, 0);

    // Camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Gems
    this.gemGroup = this.physics.add.group({
      classType: ExperienceGem,
      maxSize: 500,
      runChildUpdate: false,
    });

    // Enemy spawner
    this.enemySpawner = new EnemySpawner(this, this.player);

    // Weapons
    this.weaponManager = new WeaponManager();
    this.weaponManager.onEnemyKilled = (enemy) => this.onEnemyKilled(enemy as Enemy);
    this.weaponManager.addWeapon(new Whip());

    // Level up system
    this.levelUpSystem = new LevelUpSystem();

    // Collisions
    this.setupCollisions();

    // Launch HUD
    this.scene.launch('HUDScene', { gameScene: this });
  }

  private setupCollisions(): void {
    const enemyGroup = this.enemySpawner.getEnemyGroup();

    // Enemy vs Player
    this.physics.add.overlap(
      this.player,
      enemyGroup,
      (_player, enemy) => {
        const e = enemy as Enemy;
        if (!e.active) return;
        this.player.takeDamage(e.contactDamage);
      },
    );

    // Player vs Gem
    this.physics.add.overlap(
      this.player,
      this.gemGroup,
      (_player, gem) => {
        const g = gem as ExperienceGem;
        if (!g.active) return;
        g.collect();
        const leveledUp = this.player.addXP(g.value);
        if (leveledUp) {
          this.triggerLevelUp();
        }
      },
    );
  }

  private onEnemyKilled(enemy: Enemy): void {
    this.player.kills++;
    this.spawnGem(enemy.x, enemy.y, enemy.xpValue);
  }

  private spawnGem(x: number, y: number, value: number): void {
    let gem = this.gemGroup.getFirstDead(false) as ExperienceGem | null;
    if (!gem) {
      gem = new ExperienceGem(this, x, y);
      this.add.existing(gem);
      this.physics.add.existing(gem);
      this.gemGroup.add(gem);
    }
    gem.spawn(x, y, value);
  }

  private triggerLevelUp(): void {
    this.scene.pause();
    this.scene.launch('LevelUpScene', {
      gameScene: this,
      choices: this.levelUpSystem.generateChoices(this.player, this.weaponManager, this),
    });
  }

  update(time: number, delta: number): void {
    this.gameTime += delta;
    this.player.update(time, delta);
    this.backgroundScroller.update(this.cameras.main);
    this.enemySpawner.update(time, delta);
    this.weaponManager.update(time, delta, this, this.player, this.enemySpawner.getEnemyGroup());

    // Magnetic gem attraction
    for (const child of this.gemGroup.getChildren()) {
      const gem = child as ExperienceGem;
      if (!gem.active) continue;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, gem.x, gem.y);
      if (dist < this.player.magnetRange) {
        gem.magnetToward(this.player.x, this.player.y, 300);
      } else {
        gem.setVelocity(0, 0);
      }
    }

    // Check death
    if (this.player.isDead()) {
      this.scene.stop('HUDScene');
      this.scene.pause();
      this.scene.launch('GameOverScene', {
        time: this.gameTime,
        kills: this.player.kills,
        level: this.player.level,
      });
    }

    // Update enemy preUpdate (since runChildUpdate is off)
    for (const child of this.enemySpawner.getEnemyGroup().getChildren()) {
      const enemy = child as Enemy;
      if (enemy.active) {
        enemy.preUpdate(time, delta);
      }
    }
  }

  // Called when a new weapon with projectiles is added
  addProjectileCollision(group: Phaser.Physics.Arcade.Group): void {
    const enemyGroup = this.enemySpawner.getEnemyGroup();
    this.physics.add.overlap(
      group,
      enemyGroup,
      (proj, enemy) => {
        const projectile = proj as Phaser.Physics.Arcade.Sprite;
        const e = enemy as Enemy;
        if (!projectile.active || !e.active) return;

        const damage = projectile.getData('damage') as number;
        const killed = e.takeDamage(damage);

        projectile.setActive(false).setVisible(false);
        if (projectile.body) {
          (projectile.body as Phaser.Physics.Arcade.Body).enable = false;
        }

        if (killed) {
          this.onEnemyKilled(e);
        }
      },
    );
  }
}
