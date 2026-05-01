import * as Phaser from 'phaser';
import { Enemy, EnemyConfig } from '../entities/Enemy';
import { Player } from '../entities/Player';
import { ENEMY } from '../config';

export class EnemySpawner {
  private scene: Phaser.Scene;
  private enemyGroup: Phaser.Physics.Arcade.Group;
  private player: Player;
  private spawnTimer = 0;
  private gameTime = 0;
  private onEnemyDied?: (enemy: Enemy) => void;

  constructor(scene: Phaser.Scene, player: Player, onEnemyDied?: (enemy: Enemy) => void) {
    this.scene = scene;
    this.player = player;
    this.onEnemyDied = onEnemyDied;

    this.enemyGroup = scene.physics.add.group({
      classType: Enemy,
      maxSize: ENEMY.MAX_COUNT,
      runChildUpdate: false,
    });

    // Enemies collide with each other so they don't stack
    scene.physics.add.collider(this.enemyGroup, this.enemyGroup);

    // Pre-populate pool
    for (let i = 0; i < 50; i++) {
      const enemy = new Enemy(scene, -1000, -1000, 'enemy');
      scene.add.existing(enemy);
      scene.physics.add.existing(enemy);
      enemy.setActive(false).setVisible(false);
      if (enemy.body) {
        (enemy.body as Phaser.Physics.Arcade.Body).enable = false;
      }
      enemy.onDeathCallback = this.onEnemyDied;
      this.enemyGroup.add(enemy);
    }
  }

  update(_time: number, delta: number): void {
    this.gameTime += delta;
    this.spawnTimer -= delta;

    if (this.spawnTimer <= 0) {
      this.spawnEnemy();
      const interval = Math.max(
        ENEMY.SPAWN_INTERVAL_MIN,
        ENEMY.SPAWN_INTERVAL_BASE - (this.gameTime / 1000) * 15,
      );
      this.spawnTimer = interval;
    }
  }

  private spawnEnemy(): void {
    const count = this.getActiveCount();
    if (count >= ENEMY.MAX_COUNT) return;

    const spawnCount = this.gameTime > 60000 ? 3 : this.gameTime > 30000 ? 2 : 1;
    for (let i = 0; i < spawnCount; i++) {
      this.spawnOne();
    }
  }

  private spawnOne(): void {
    const pos = this.getSpawnPosition();
    const config = this.getEnemyConfig();
    this.spawnWithConfig(pos.x, pos.y, config);
  }

  private spawnWithConfig(x: number, y: number, config: EnemyConfig): void {
    let enemy = this.enemyGroup.getFirstDead(false) as Enemy | null;
    if (!enemy) {
      enemy = new Enemy(this.scene, x, y, config.texture);
      this.scene.add.existing(enemy);
      this.scene.physics.add.existing(enemy);
      this.enemyGroup.add(enemy);
    }
    enemy.spawn(x, y, config, this.player);
    enemy.onDeathCallback = this.onEnemyDied;
  }

  spawnByType(type: 'normal' | 'fast' | 'big'): void {
    const pos = this.getSpawnPosition();
    const config = this.getConfigByType(type);
    this.spawnWithConfig(pos.x, pos.y, config);
  }

  getConfigByType(type: 'normal' | 'fast' | 'big'): EnemyConfig {
    const minutes = this.gameTime / 60000;
    switch (type) {
      case 'fast':
        return {
          texture: 'enemy_fast',
          hp: Math.floor(ENEMY.BASE_HP * 0.6 * (1 + minutes * ENEMY.HP_SCALING)),
          speed: ENEMY.BASE_SPEED * 1.8 * (1 + minutes * ENEMY.SPEED_SCALING),
          damage: ENEMY.CONTACT_DAMAGE * 0.7,
          xpValue: ENEMY.XP_VALUE,
        };
      case 'big':
        return {
          texture: 'enemy_big',
          hp: Math.floor((ENEMY.BASE_HP * 3) * (1 + minutes * ENEMY.HP_SCALING)),
          speed: ENEMY.BASE_SPEED * 0.6,
          damage: ENEMY.CONTACT_DAMAGE * 2,
          xpValue: ENEMY.XP_VALUE * 3,
        };
      default:
        return {
          texture: 'enemy',
          hp: Math.floor(ENEMY.BASE_HP * (1 + minutes * ENEMY.HP_SCALING)),
          speed: ENEMY.BASE_SPEED * (1 + minutes * ENEMY.SPEED_SCALING),
          damage: ENEMY.CONTACT_DAMAGE,
          xpValue: ENEMY.XP_VALUE,
        };
    }
  }

  private getEnemyConfig(): EnemyConfig {
    const roll = Math.random();
    const minutes = this.gameTime / 60000;
    if (minutes >= 3 && roll < 0.1) return this.getConfigByType('big');
    if (minutes >= 1 && roll < 0.3) return this.getConfigByType('fast');
    return this.getConfigByType('normal');
  }

  private getSpawnPosition(): { x: number; y: number } {
    const angle = Math.random() * Math.PI * 2;
    return {
      x: this.player.x + Math.cos(angle) * ENEMY.SPAWN_RADIUS,
      y: this.player.y + Math.sin(angle) * ENEMY.SPAWN_RADIUS,
    };
  }

  getEnemyGroup(): Phaser.Physics.Arcade.Group {
    return this.enemyGroup;
  }

  getActiveCount(): number {
    return this.enemyGroup.getChildren().filter(e => e.active).length;
  }
}
