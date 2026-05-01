import * as Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { WeaponTestScene } from './scenes/WeaponTestScene';
import { WEAPON_DEFS, WeaponDef, EffectDef } from './weapons/WeaponDefs';

// === Phaser Game ===

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 600,
  physics: { default: 'arcade', arcade: { debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [BootScene, WeaponTestScene],
});
game.registry.set('nextScene', 'WeaponTestScene');

// === Wait for scene ===

let scene: WeaponTestScene | null = null;
const readyCheck = setInterval(() => {
  const s = game.scene.getScene('WeaponTestScene') as WeaponTestScene;
  if (s?.player) {
    scene = s;
    clearInterval(readyCheck);
    initUI();
    startUpdater();
  }
}, 100);

// === Helpers ===

function el(id: string) { return document.getElementById(id)!; }

function btn(text: string, cls: string, onclick: () => void): HTMLButtonElement {
  const b = document.createElement('button');
  b.textContent = text;
  b.className = cls;
  b.addEventListener('click', onclick);
  return b;
}

function labeledInput(label: string, id: string, type: string, value: string | number, extra?: Partial<HTMLInputElement>): HTMLDivElement {
  const row = document.createElement('div');
  row.className = 'field';
  const lbl = document.createElement('label');
  lbl.textContent = label;
  lbl.htmlFor = id;
  const inp = document.createElement('input');
  inp.type = type;
  inp.id = id;
  inp.value = String(value);
  if (extra) Object.assign(inp, extra);
  row.appendChild(lbl);
  row.appendChild(inp);
  return row;
}

function selectField(label: string, id: string, options: { value: string; text: string }[]): HTMLDivElement {
  const row = document.createElement('div');
  row.className = 'field';
  const lbl = document.createElement('label');
  lbl.textContent = label;
  lbl.htmlFor = id;
  const sel = document.createElement('select');
  sel.id = id;
  for (const opt of options) {
    const o = document.createElement('option');
    o.value = opt.value;
    o.textContent = opt.text;
    sel.appendChild(o);
  }
  row.appendChild(lbl);
  row.appendChild(sel);
  return row;
}

// === UI Init ===

function initUI() {
  buildWeaponToggles();
  buildEnemyControls();
  buildControls();
  buildCustomBuilder();
}

// --- Weapon Toggles ---

function buildWeaponToggles() {
  const container = el('weapon-toggles');
  for (const def of WEAPON_DEFS) {
    const b = btn(def.name, 'weapon-btn', () => {
      if (!scene) return;
      if (scene.weaponManager.hasWeapon(def.name)) {
        scene.removeWeaponByName(def.name);
      } else {
        scene.addWeaponById(def.id);
      }
    });
    b.dataset.weaponName = def.name;
    b.title = `${def.targeting} + ${def.delivery}${def.effects?.length ? ' + ' + def.effects.map(e => e.type).join(', ') : ''}`;
    container.appendChild(b);
  }

  el('remove-all-btn').addEventListener('click', () => scene?.removeAllWeapons());
}

// --- Enemy Controls ---

function buildEnemyControls() {
  const container = el('enemy-controls');
  const types = [
    { type: 'normal', label: 'Normal', color: '#ff4444' },
    { type: 'fast', label: 'Fast', color: '#ff8800' },
    { type: 'big', label: 'Big', color: '#cc0000' },
  ];

  // Count input
  const countRow = document.createElement('div');
  countRow.className = 'field';
  const countLabel = document.createElement('label');
  countLabel.textContent = 'Count';
  const countInput = document.createElement('input');
  countInput.type = 'number';
  countInput.id = 'spawn-count';
  countInput.value = '5';
  countInput.min = '1';
  countInput.max = '100';
  countRow.appendChild(countLabel);
  countRow.appendChild(countInput);
  container.appendChild(countRow);

  // Spawn buttons
  const btnRow = document.createElement('div');
  btnRow.className = 'btn-row';
  for (const { type, label } of types) {
    btnRow.appendChild(btn(`+ ${label}`, 'spawn-btn', () => {
      const count = parseInt((document.getElementById('spawn-count') as HTMLInputElement).value) || 5;
      scene?.spawnEnemies(type, count);
    }));
  }
  container.appendChild(btnRow);

  // Wave button
  container.appendChild(btn('Spawn Wave (all types)', 'action-btn', () => {
    const count = parseInt((document.getElementById('spawn-count') as HTMLInputElement).value) || 5;
    scene?.spawnEnemies('normal', count);
    scene?.spawnEnemies('fast', Math.ceil(count / 2));
    scene?.spawnEnemies('big', Math.ceil(count / 4));
  }));

  container.appendChild(btn('Clear All Enemies', 'danger-btn', () => scene?.clearEnemies()));
}

// --- Controls ---

function buildControls() {
  const container = el('controls');

  const invBtn = btn('Invincible: ON', 'toggle-btn active', () => {
    if (!scene) return;
    const on = scene.toggleInvincible();
    invBtn.textContent = `Invincible: ${on ? 'ON' : 'OFF'}`;
    invBtn.classList.toggle('active', on);
  });
  container.appendChild(invBtn);

  const colBtn = btn('Colliders: OFF', 'toggle-btn', () => {
    if (!scene) return;
    const on = scene.toggleColliders();
    colBtn.textContent = `Colliders: ${on ? 'ON' : 'OFF'}`;
    colBtn.classList.toggle('active', on);
  });
  container.appendChild(colBtn);

  container.appendChild(btn('Reset Player', 'action-btn', () => scene?.resetPlayer()));
}

// --- Custom Builder ---

function buildCustomBuilder() {
  const container = el('builder');

  container.appendChild(labeledInput('Name', 'cw-name', 'text', 'Custom Weapon'));

  container.appendChild(selectField('Targeting', 'cw-targeting', [
    { value: 'nearest', text: 'Nearest enemy' },
    { value: 'directional', text: 'Facing direction' },
    { value: 'random_area', text: 'Random area' },
    { value: 'all_in_radius', text: 'All in radius' },
  ]));

  container.appendChild(selectField('Delivery', 'cw-delivery', [
    { value: 'projectile', text: 'Projectile' },
    { value: 'melee_arc', text: 'Melee arc' },
    { value: 'aoe_zone', text: 'AoE zone' },
    { value: 'aura', text: 'Aura' },
  ]));

  const statsGrid = document.createElement('div');
  statsGrid.className = 'stats-grid';
  statsGrid.appendChild(labeledInput('Damage', 'cw-damage', 'number', '10'));
  statsGrid.appendChild(labeledInput('Cooldown', 'cw-cooldown', 'number', '1000'));
  statsGrid.appendChild(labeledInput('Speed', 'cw-speed', 'number', '300'));
  statsGrid.appendChild(labeledInput('Area', 'cw-area', 'number', '40'));
  statsGrid.appendChild(labeledInput('Duration', 'cw-duration', 'number', '2000'));
  statsGrid.appendChild(labeledInput('Tick Int.', 'cw-tick', 'number', '300'));
  container.appendChild(statsGrid);

  // Effects
  const effectsLabel = document.createElement('div');
  effectsLabel.className = 'section-label';
  effectsLabel.textContent = 'Effects';
  container.appendChild(effectsLabel);

  const effectsDefs = [
    { type: 'slow', label: 'Slow', fields: [
      { key: 'ratio', label: 'Ratio', value: '0.5', step: '0.1' },
      { key: 'duration', label: 'Dur(ms)', value: '2000', step: '100' },
    ]},
    { type: 'burn', label: 'Burn', fields: [
      { key: 'damage', label: 'Dmg', value: '2', step: '1' },
      { key: 'interval', label: 'Int(ms)', value: '500', step: '100' },
      { key: 'duration', label: 'Dur(ms)', value: '3000', step: '100' },
    ]},
    { type: 'freeze', label: 'Freeze', fields: [
      { key: 'duration', label: 'Dur(ms)', value: '1000', step: '100' },
    ]},
    { type: 'knockback', label: 'Knockback', fields: [
      { key: 'force', label: 'Force', value: '200', step: '50' },
    ]},
  ];

  for (const eff of effectsDefs) {
    const row = document.createElement('div');
    row.className = 'effect-row';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.id = `eff-${eff.type}`;
    const cbLabel = document.createElement('label');
    cbLabel.htmlFor = cb.id;
    cbLabel.textContent = eff.label;
    cbLabel.className = 'effect-label';
    row.appendChild(cb);
    row.appendChild(cbLabel);

    const params = document.createElement('div');
    params.className = 'effect-params';
    for (const f of eff.fields) {
      const inp = document.createElement('input');
      inp.type = 'number';
      inp.id = `eff-${eff.type}-${f.key}`;
      inp.value = f.value;
      inp.step = f.step;
      inp.title = f.label;
      inp.placeholder = f.label;
      params.appendChild(inp);
    }
    row.appendChild(params);

    cb.addEventListener('change', () => {
      row.classList.toggle('active', cb.checked);
    });

    container.appendChild(row);
  }

  // Create button
  container.appendChild(btn('Create & Equip', 'create-btn', () => {
    if (!scene) return;
    const name = (document.getElementById('cw-name') as HTMLInputElement).value || 'Custom Weapon';
    const targeting = (document.getElementById('cw-targeting') as HTMLSelectElement).value;
    const delivery = (document.getElementById('cw-delivery') as HTMLSelectElement).value;
    const damage = parseInt((document.getElementById('cw-damage') as HTMLInputElement).value) || 10;
    const cooldown = parseInt((document.getElementById('cw-cooldown') as HTMLInputElement).value) || 1000;
    const speed = parseInt((document.getElementById('cw-speed') as HTMLInputElement).value) || 300;
    const area = parseInt((document.getElementById('cw-area') as HTMLInputElement).value) || 40;
    const duration = parseInt((document.getElementById('cw-duration') as HTMLInputElement).value) || 2000;
    const tickInterval = parseInt((document.getElementById('cw-tick') as HTMLInputElement).value) || 300;

    const effects: EffectDef[] = [];
    if ((document.getElementById('eff-slow') as HTMLInputElement).checked) {
      effects.push({
        type: 'slow',
        ratio: parseFloat((document.getElementById('eff-slow-ratio') as HTMLInputElement).value) || 0.5,
        duration: parseInt((document.getElementById('eff-slow-duration') as HTMLInputElement).value) || 2000,
      });
    }
    if ((document.getElementById('eff-burn') as HTMLInputElement).checked) {
      effects.push({
        type: 'burn',
        damage: parseInt((document.getElementById('eff-burn-damage') as HTMLInputElement).value) || 2,
        interval: parseInt((document.getElementById('eff-burn-interval') as HTMLInputElement).value) || 500,
        duration: parseInt((document.getElementById('eff-burn-duration') as HTMLInputElement).value) || 3000,
      });
    }
    if ((document.getElementById('eff-freeze') as HTMLInputElement).checked) {
      effects.push({
        type: 'freeze',
        duration: parseInt((document.getElementById('eff-freeze-duration') as HTMLInputElement).value) || 1000,
      });
    }
    if ((document.getElementById('eff-knockback') as HTMLInputElement).checked) {
      effects.push({
        type: 'knockback',
        force: parseInt((document.getElementById('eff-knockback-force') as HTMLInputElement).value) || 200,
      });
    }

    const textureMap: Record<string, string> = {
      projectile: 'projectile', melee_arc: 'whip', aoe_zone: 'holy_water', aura: 'garlic',
    };

    const def: WeaponDef = {
      id: 'custom_' + Date.now(),
      name,
      description: 'Custom weapon',
      targeting: targeting as WeaponDef['targeting'],
      delivery: delivery as WeaponDef['delivery'],
      damage, cooldown, speed, area, duration, tickInterval,
      effects: effects.length > 0 ? effects : undefined,
      texture: textureMap[delivery] || 'projectile',
    };

    scene.addCustomWeapon(def);
  }));
}

// === Info Updater ===

let prevWeaponJson = '';

function startUpdater() {
  setInterval(() => {
    if (!scene) return;

    // Update weapon toggle buttons
    const btns = document.querySelectorAll('#weapon-toggles .weapon-btn') as NodeListOf<HTMLButtonElement>;
    btns.forEach(b => {
      const name = b.dataset.weaponName || '';
      const owned = scene!.weaponManager.hasWeapon(name);
      b.classList.toggle('active', owned);
    });

    // Update active weapons list
    const weapons = scene.getWeaponList();
    const json = JSON.stringify(weapons);
    if (json !== prevWeaponJson) {
      prevWeaponJson = json;
      const container = el('active-weapons');
      container.innerHTML = '';
      if (weapons.length === 0) {
        container.innerHTML = '<div class="empty">No weapons equipped</div>';
      }
      for (const w of weapons) {
        const row = document.createElement('div');
        row.className = 'active-weapon-row';
        const info = document.createElement('span');
        info.className = 'weapon-info';
        info.textContent = `${w.name} Lv${w.level}`;
        row.appendChild(info);

        const lvlBtn = document.createElement('button');
        lvlBtn.textContent = '↑';
        lvlBtn.className = 'small-btn lvl';
        lvlBtn.title = 'Level Up';
        lvlBtn.addEventListener('click', () => scene?.levelUpWeapon(w.name));
        row.appendChild(lvlBtn);

        const rmBtn = document.createElement('button');
        rmBtn.textContent = '✕';
        rmBtn.className = 'small-btn rm';
        rmBtn.title = 'Remove';
        rmBtn.addEventListener('click', () => scene?.removeWeaponByName(w.name));
        row.appendChild(rmBtn);

        container.appendChild(row);
      }
    }

    // Update info
    el('info-enemies').textContent = String(scene.getActiveEnemyCount());
    el('info-weapons').textContent = String(weapons.length);
    el('info-kills').textContent = String(scene.killCount);
    el('info-hp').textContent = `${scene.player.hp} / ${scene.player.maxHp}`;
  }, 150);
}
