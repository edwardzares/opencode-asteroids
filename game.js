'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = 800;
const H = 600;

// ── Input ─────────────────────────────────────────────────────────────────────
const keys = {};
const justPressed = {};

window.addEventListener('keydown', e => {
  justPressed[e.code] = !keys[e.code];
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code))
    e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function pressed(code) {
  const val = justPressed[code];
  justPressed[code] = false;
  return val;
}

// ── Utils ─────────────────────────────────────────────────────────────────────
const wrap  = (v, max) => ((v % max) + max) % max;
const dist  = (a, b)   => Math.hypot(a.x - b.x, a.y - b.y);
const rand  = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));

// ── Bullet ────────────────────────────────────────────────────────────────────
class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    const SPEED = 520;
    this.vx = Math.cos(angle) * SPEED;
    this.vy = Math.sin(angle) * SPEED;
    this.ttl  = 1.1;
    this.radius = 2;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Enemy bullet ──────────────────────────────────────────────────────────────
// Proyectil hostil. Aún no hay enemigos que lo disparen, pero cualquier
// entidad enemiga puede hacer `enemyBullets.push(new EnemyBullet(x, y, angle))`.
class EnemyBullet {
  constructor(x, y, angle, speed = 260) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.ttl    = 3;
    this.radius = 3;
    this.dead   = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 90, 90, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius + 3, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#f77';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ── Asteroid ──────────────────────────────────────────────────────────────────
const RADII  = [0, 16, 30, 50];   // por tamaño 1, 2, 3
const SPEEDS = [0, 85, 55, 32];   // velocidad base por tamaño
const POINTS = [0, 100, 50, 20];  // puntos por tamaño

class Asteroid {
  constructor(x, y, size = 3) {
    this.x    = x;
    this.y    = y;
    this.size = size;
    this.radius = RADII[size];
    this.dead = false;

    const angle = rand(0, Math.PI * 2);
    const speed = SPEEDS[size] + rand(-15, 15);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotSpeed = rand(-1.2, 1.2);
    this.rot = rand(0, Math.PI * 2);

    // Polígono irregular
    const n = randInt(8, 13);
    this.verts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = this.radius * rand(0.6, 1.0);
      this.verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
  }

  update(dt) {
    this.x   = wrap(this.x + this.vx * dt, W);
    this.y   = wrap(this.y + this.vy * dt, H);
    this.rot += this.rotSpeed * dt;
  }

  split() {
    if (this.size <= 1) return [];
    return [
      new Asteroid(this.x, this.y, this.size - 1),
      new Asteroid(this.x, this.y, this.size - 1),
    ];
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = this.color || '#fff';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(this.verts[0][0], this.verts[0][1]);
    for (let i = 1; i < this.verts.length; i++)
      ctx.lineTo(this.verts[i][0], this.verts[i][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// ── Estrella fugaz ────────────────────────────────────────────────────────────
const SHOOTING_STAR_SPEED  = 240;
const SHOOTING_STAR_TTL    = 7;    // segundos antes de desvanecerse
const SHOOTING_STAR_POINTS = 150;

class ShootingStar extends Asteroid {
  constructor(x, y, angle) {
    super(x, y, 1);
    this.isShootingStar = true;
    this.radius = 13;
    this.color  = '#bff';
    this.ttl    = SHOOTING_STAR_TTL;
    this.angle  = angle;
    this.vx     = Math.cos(angle) * SHOOTING_STAR_SPEED;
    this.vy     = Math.sin(angle) * SHOOTING_STAR_SPEED;
    this.rotSpeed = rand(-3, 3);

    // Núcleo más pequeño e irregular
    const n = randInt(6, 9);
    this.verts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = this.radius * rand(0.55, 1.0);
      this.verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
  }

  update(dt) {
    super.update(dt);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  split() {
    return [];
  }

  draw() {
    // Parpadeo antes de desaparecer
    if (this.ttl < 1.5 && Math.floor(this.ttl * 10) % 2 === 0) return;

    const speed = Math.hypot(this.vx, this.vy) || 1;
    const ux = this.vx / speed;
    const uy = this.vy / speed;

    // Estela
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(120, 220, 255, 0.25)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.x - ux * this.radius, this.y - uy * this.radius);
    ctx.lineTo(this.x - ux * 52, this.y - uy * 52);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(190, 245, 255, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(this.x - ux * this.radius, this.y - uy * this.radius);
    ctx.lineTo(this.x - ux * 40, this.y - uy * 40);
    ctx.stroke();
    ctx.restore();

    super.draw();

    // Halo del núcleo
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.strokeStyle = 'rgba(120, 220, 255, 0.65)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

// ── Ship ──────────────────────────────────────────────────────────────────────
class Ship {
  constructor() { this.reset(); }

  reset() {
    this.x      = W / 2;
    this.y      = H / 2;
    this.angle  = -Math.PI / 2;
    this.vx     = 0;
    this.vy     = 0;
    this.radius = 12;
    this.thrusting     = false;
    this.invincible    = 3;
    this.shootCooldown = 0;
    this.speedTimer    = 0;
    this.shieldTimer   = 0;
    this.shieldFlash   = 0;
    this.shieldPulse   = 0;
    this.dead          = false;
  }

  get shieldRadius() { return this.radius + 16; }

  update(dt) {
    if (this.dead) return;
    if (this.invincible    > 0) this.invincible    -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.speedTimer    > 0) this.speedTimer    -= dt;
    if (this.shieldTimer   > 0) this.shieldTimer   -= dt;
    if (this.shieldFlash   > 0) this.shieldFlash   -= dt;
    this.shieldPulse += dt * 3;

    const boosted = this.speedTimer > 0;
    const ROT     = 3.5;   // rad/s
    const THRUST  = boosted ? 260 * BOOST_THRUST_MULT : 260;  // px/s²
    const DRAG    = 0.987;

    if (keys['ArrowLeft'])  this.angle -= ROT * dt;
    if (keys['ArrowRight']) this.angle += ROT * dt;

    this.thrusting = !!keys['ArrowUp'];
    if (this.thrusting) {
      this.vx += Math.cos(this.angle) * THRUST * dt;
      this.vy += Math.sin(this.angle) * THRUST * dt;
    }

    this.vx *= DRAG;
    this.vy *= DRAG;

    // Tope alto solo durante el boost
    if (boosted) {
      const speed = Math.hypot(this.vx, this.vy);
      if (speed > BOOST_MAX_SPEED) {
        const k = BOOST_MAX_SPEED / speed;
        this.vx *= k;
        this.vy *= k;
      }
    }

    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
  }

  tryShoot() {
    if (this.shootCooldown > 0 || this.dead) return [];
    this.shootCooldown = 0.2;
    const NOSE = 21;
    const ox = this.x + Math.cos(this.angle) * NOSE;
    const oy = this.y + Math.sin(this.angle) * NOSE;
    return [new Bullet(ox, oy, this.angle)];
  }

  draw() {
    if (this.dead) return;
    // Parpadeo durante invencibilidad de reaparición
    const blinking = this.invincible > 0 && Math.floor(this.invincible * 8) % 2 === 0;

    if (!blinking) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth   = 1.5;
      ctx.lineJoin    = 'round';

      // Silueta clásica: triángulo con muesca trasera
      ctx.beginPath();
      ctx.moveTo( 20,  0);   // nariz
      ctx.lineTo(-12, -9);   // ala izquierda
      ctx.lineTo( -7,  0);   // muesca trasera
      ctx.lineTo(-12,  9);   // ala derecha
      ctx.closePath();
      ctx.stroke();

      // Llama del propulsor
      if (this.thrusting && Math.random() > 0.35) {
        const boosted = this.speedTimer > 0;
        const flameLen = boosted ? rand(10, 20) : rand(6, 14);
        ctx.beginPath();
        ctx.moveTo(-8, -4);
        ctx.lineTo(-8 - flameLen, 0);
        ctx.lineTo(-8,  4);
        ctx.strokeStyle = boosted ? 'rgba(80, 230, 255, 0.9)' : 'rgba(255, 130, 0, 0.85)';
        ctx.stroke();
      }

      ctx.restore();
    }

    this.drawShield();
  }

  drawShield() {
    if (this.shieldTimer <= 0) return;
    // Parpadeo de aviso cuando está por expirar
    if (this.shieldTimer < 2 && Math.floor(this.shieldTimer * 8) % 2 === 0) return;

    const r     = this.shieldRadius + Math.sin(this.shieldPulse * 2) * 2;
    const flash = Math.max(0, this.shieldFlash / 0.25);

    ctx.save();
    ctx.translate(this.x, this.y);

    // Relleno tenue
    ctx.fillStyle = `rgba(80, 180, 255, ${(0.05 + flash * 0.12).toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Aro principal
    ctx.strokeStyle = `rgba(130, 220, 255, ${(0.55 + flash * 0.45).toFixed(2)})`;
    ctx.lineWidth   = 1.5 + flash * 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();

    // Segmentos giratorios
    ctx.save();
    ctx.rotate(this.shieldPulse * 0.6);
    ctx.strokeStyle = `rgba(80, 200, 255, ${(0.35 + flash * 0.5).toFixed(2)})`;
    ctx.lineWidth   = 2;
    ctx.setLineDash([10, 14]);
    ctx.beginPath();
    ctx.arc(0, 0, r + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }
}

// ── Partículas (explosión) ────────────────────────────────────────────────────
class Particle {
  constructor(x, y, color = '255,255,255') {
    this.x  = x;
    this.y  = y;
    this.color = color;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(30, 130);
    this.vx   = Math.cos(angle) * speed;
    this.vy   = Math.sin(angle) * speed;
    this.life = rand(0.4, 1.1);
    this.ttl  = this.life;
    this.dead = false;
  }

  update(dt) {
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = this.ttl / this.life;
    ctx.strokeStyle = `rgba(${this.color},${alpha.toFixed(2)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.05, this.y - this.vy * 0.05);
    ctx.stroke();
  }
}

// ── Power-ups ─────────────────────────────────────────────────────────────────
const POWERUP_DURATION    = 5;    // segundos de efecto
const POWERUP_TTL         = 12;   // segundos en pantalla si no se recoge
const POWERUP_RADIUS      = 13;
const POWERUP_DROP_CHANCE = 0.12;
const BOOST_THRUST_MULT   = 2.5;
const BOOST_MAX_SPEED     = 850;  // px/s
const SHIELD_DURATION     = 8;    // segundos de protección

class PowerUp {
  constructor() {
    let x, y;
    const SAFE_DIST = 140;
    do {
      x = rand(0, W);
      y = rand(0, H);
    } while (Math.hypot(x - ship.x, y - ship.y) < SAFE_DIST);

    this.x = x;
    this.y = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(18, 40);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.radius = POWERUP_RADIUS;
    this.ttl    = POWERUP_TTL;
    this.pulse  = rand(0, Math.PI * 2);
    this.dead   = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.pulse += dt * 4;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  drawHalo(color) {
    const glow = 0.5 + 0.5 * Math.sin(this.pulse);

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.globalAlpha = 0.2 + glow * 0.35;
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 4 + glow * 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Parpadeo cuando está por desaparecer
  isExpiring() {
    return this.ttl < 3 && Math.floor(this.ttl * 8) % 2 === 0;
  }
}

class SpeedBoost extends PowerUp {
  apply(ship) { ship.speedTimer = POWERUP_DURATION; }

  draw() {
    if (this.isExpiring()) return;
    this.drawHalo('#4ff');

    // Rayo
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.strokeStyle = '#cff';
    ctx.lineWidth   = 2;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo( 3, -9);
    ctx.lineTo(-4,  1);
    ctx.lineTo( 1,  1);
    ctx.lineTo(-3,  9);
    ctx.lineTo( 5, -2);
    ctx.lineTo( 0, -2);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

class ShieldPowerup extends PowerUp {
  apply(ship) { ship.shieldTimer = SHIELD_DURATION; }

  draw() {
    if (this.isExpiring()) return;
    this.drawHalo('#8cf');

    // Burbuja de escudo
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.strokeStyle = '#cfeaff';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

// ── Estado del juego ──────────────────────────────────────────────────────────
let ship, bullets, enemyBullets, asteroids, particles, powerups;
let score, lives, level;
let state;      // 'playing' | 'dead' | 'gameover'
let deadTimer;
let shootingStarTimer;

function spawnAsteroids(count) {
  const SAFE_DIST = 130;
  for (let i = 0; i < count; i++) {
    let x, y;
    do {
      x = rand(0, W);
      y = rand(0, H);
    } while (Math.hypot(x - W / 2, y - H / 2) < SAFE_DIST);
    asteroids.push(new Asteroid(x, y, 3));
  }
}

function spawnShootingStar() {
  const edge = randInt(0, 3);
  let x, y, angle;

  if (edge === 0) {          // borde superior
    x = rand(0, W);
    y = 0;
    angle = Math.PI / 2 + rand(-0.5, 0.5);
  } else if (edge === 1) {   // borde derecho
    x = W;
    y = rand(0, H);
    angle = Math.PI + rand(-0.5, 0.5);
  } else if (edge === 2) {   // borde inferior
    x = rand(0, W);
    y = H;
    angle = -Math.PI / 2 + rand(-0.5, 0.5);
  } else {                   // borde izquierdo
    x = 0;
    y = rand(0, H);
    angle = rand(-0.5, 0.5);
  }

  asteroids.push(new ShootingStar(x, y, angle));
}

function initGame() {
  ship          = new Ship();
  bullets       = [];
  enemyBullets  = [];
  asteroids     = [];
  particles     = [];
  powerups      = [];
  score  = 0;
  lives  = 3;
  level  = 1;
  state  = 'playing';
  shootingStarTimer = rand(10, 18);
  spawnAsteroids(4);
}

function nextLevel() {
  level++;
  bullets      = [];
  enemyBullets = [];
  particles    = [];
  powerups     = [];
  ship.reset();
  shootingStarTimer = rand(15, 25);
  spawnAsteroids(3 + level);
}

function explode(x, y, count = 8, color = '255,255,255') {
  for (let i = 0; i < count; i++) particles.push(new Particle(x, y, color));
}

// Destruye un asteroide: puntos, explosión, posible power-up y fragmentos.
function destroyAsteroid(a) {
  a.dead = true;
  score += a.isShootingStar ? SHOOTING_STAR_POINTS : POINTS[a.size];
  explode(a.x, a.y, a.isShootingStar ? 12 : a.size * 5);
  if (powerups.length === 0 && Math.random() < POWERUP_DROP_CHANCE) {
    const PowerUpType = Math.random() < 0.5 ? SpeedBoost : ShieldPowerup;
    powerups.push(new PowerUpType());
  }
  return a.split();
}

function killShip() {
  explode(ship.x, ship.y, 14);
  ship.dead = true;
  ship.speedTimer  = 0;
  ship.shieldTimer = 0;
  ship.shieldFlash = 0;
  lives--;
  if (lives <= 0) {
    state = 'gameover';
  } else {
    state     = 'dead';
    deadTimer = 2;
  }
}

// ── Update ────────────────────────────────────────────────────────────────────
function update(dt) {
  if (state === 'gameover') {
    if (pressed('Space')) initGame();
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    enemyBullets.forEach(b => b.update(dt));
    enemyBullets = enemyBullets.filter(b => !b.dead);
    return;
  }

  if (state === 'dead') {
    deadTimer -= dt;
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    asteroids.forEach(a => a.update(dt));
    enemyBullets.forEach(b => b.update(dt));
    enemyBullets = enemyBullets.filter(b => !b.dead);
    powerups.forEach(p => p.update(dt));
    powerups = powerups.filter(p => !p.dead);
    if (deadTimer <= 0) { state = 'playing'; ship.reset(); }
    return;
  }

  // Disparar
  if (pressed('Space')) {
    bullets.push(...ship.tryShoot());
  }

  ship.update(dt);
  bullets.forEach(b => b.update(dt));
  enemyBullets.forEach(b => b.update(dt));
  asteroids.forEach(a => a.update(dt));
  particles.forEach(p => p.update(dt));
  powerups.forEach(p => p.update(dt));

  // Aparición periódica de la estrella fugaz
  shootingStarTimer -= dt;
  if (shootingStarTimer <= 0) {
    if (!asteroids.some(a => a.isShootingStar)) spawnShootingStar();
    shootingStarTimer = rand(15, 25);
  }

  // Estela del boost
  if (ship.speedTimer > 0 && Math.random() > 0.45) {
    const tail = new Particle(
      ship.x - Math.cos(ship.angle) * 14,
      ship.y - Math.sin(ship.angle) * 14,
      '80,230,255'
    );
    tail.life = tail.ttl = rand(0.2, 0.45);
    particles.push(tail);
  }

  bullets      = bullets.filter(b => !b.dead);
  enemyBullets = enemyBullets.filter(b => !b.dead);
  particles    = particles.filter(p => !p.dead);
  powerups     = powerups.filter(p => !p.dead);

  // Bala vs asteroide
  const newAsteroids = [];
  for (const b of bullets) {
    for (const a of asteroids) {
      if (!a.dead && !b.dead && dist(b, a) < a.radius) {
        b.dead = true;
        newAsteroids.push(...destroyAsteroid(a));
      }
    }
  }
  asteroids = asteroids.filter(a => !a.dead).concat(newAsteroids);
  bullets   = bullets.filter(b => !b.dead);

  // Nave vs power-up
  for (const p of powerups) {
    if (!p.dead && dist(ship, p) < ship.radius + p.radius) {
      p.dead = true;
      p.apply(ship);
      explode(p.x, p.y, 10, p instanceof ShieldPowerup ? '130,210,255' : '80,230,255');
    }
  }
  powerups = powerups.filter(p => !p.dead);

  // Nave vs proyectiles enemigos (el escudo los bloquea)
  for (const b of enemyBullets) {
    if (b.dead) continue;
    if (ship.shieldTimer > 0 && dist(ship, b) < ship.shieldRadius + b.radius) {
      b.dead = true;
      ship.shieldFlash = 0.25;
      explode(b.x, b.y, 5, '130,210,255');
    } else if (!ship.dead && ship.invincible <= 0 && dist(ship, b) < ship.radius + b.radius) {
      b.dead = true;
      killShip();
    }
  }
  enemyBullets = enemyBullets.filter(b => !b.dead);

  // Nave vs asteroide
  if (!ship.dead && ship.invincible <= 0) {
    const fragments = [];
    const hitRadius = ship.shieldTimer > 0 ? ship.shieldRadius : ship.radius;
    for (const a of asteroids) {
      if (dist(ship, a) < hitRadius + a.radius * 0.82) {
        if (ship.shieldTimer > 0) {
          // El escudo destruye el asteroide al tocar la burbuja.
          ship.shieldFlash = 0.25;
          fragments.push(...destroyAsteroid(a));
        } else {
          killShip();
          break;
        }
      }
    }
    asteroids = asteroids.filter(a => !a.dead).concat(fragments);
  }

  // Nivel completado
  if (asteroids.length === 0) nextLevel();
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function drawLifeIcon(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth   = 1.2;
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  ctx.moveTo( 9,  0);
  ctx.lineTo(-6, -5);
  ctx.lineTo(-3,  0);
  ctx.lineTo(-6,  5);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawHUD() {
  ctx.fillStyle = '#fff';
  ctx.font = '15px monospace';

  ctx.textAlign = 'left';
  ctx.fillText(`SCORE  ${score}`, 14, 26);

  // Indicadores de power-ups activos
  let hudY = 48;

  if (ship.speedTimer > 0) {
    const ratio = Math.max(0, ship.speedTimer / POWERUP_DURATION);
    ctx.fillStyle = '#4ff';
    ctx.fillText(`VELOCIDAD ${ship.speedTimer.toFixed(1)}s`, 14, hudY);
    ctx.fillStyle = 'rgba(80, 230, 255, 0.25)';
    ctx.fillRect(14, hudY + 7, 140, 4);
    ctx.fillStyle = '#4ff';
    ctx.fillRect(14, hudY + 7, 140 * ratio, 4);
    ctx.fillStyle = '#fff';
    hudY += 27;
  }

  if (ship.shieldTimer > 0) {
    const ratio = Math.max(0, ship.shieldTimer / SHIELD_DURATION);
    ctx.fillStyle = '#8cf';
    ctx.fillText(`ESCUDO ${ship.shieldTimer.toFixed(1)}s`, 14, hudY);
    ctx.fillStyle = 'rgba(130, 200, 255, 0.25)';
    ctx.fillRect(14, hudY + 7, 140, 4);
    ctx.fillStyle = '#8cf';
    ctx.fillRect(14, hudY + 7, 140 * ratio, 4);
    ctx.fillStyle = '#fff';
  }

  ctx.textAlign = 'center';
  ctx.fillText(`NIVEL ${level}`, W / 2, 26);

  for (let i = 0; i < lives; i++)
    drawLifeIcon(W - 16 - i * 22, 18);

}

function drawOverlay(title, sub) {
  ctx.textAlign   = 'center';
  ctx.fillStyle   = '#fff';
  ctx.font        = 'bold 46px monospace';
  ctx.fillText(title, W / 2, H / 2 - 18);
  ctx.font        = '18px monospace';
  ctx.fillStyle   = 'rgba(255,255,255,0.65)';
  ctx.fillText(sub, W / 2, H / 2 + 22);
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  particles.forEach(p => p.draw());
  asteroids.forEach(a => a.draw());
  powerups.forEach(p => p.draw());
  bullets.forEach(b => b.draw());
  enemyBullets.forEach(b => b.draw());
  ship.draw();

  drawHUD();

  if (state === 'gameover')
    drawOverlay('GAME OVER', `PUNTAJE: ${score}   —   ESPACIO PARA REINICIAR`);
}

// ── Loop principal ────────────────────────────────────────────────────────────
let lastTime = null;

function loop(ts) {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

initGame();
requestAnimationFrame(loop);
