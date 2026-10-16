// Moteur de rendu 2.5D isométrique minimal (canvas 2D).
// Monde : x vers la droite-bas, y vers la gauche-bas, z vers le haut.
const ISO = { TW: 64, TH: 32, ZH: 16 };

function isoProj(x, y, z) {
  return [(x - y) * ISO.TW / 2, (x + y) * ISO.TH / 2 - z * ISO.ZH];
}

// ---------- Couleurs ----------
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgb(r, g, b, a) {
  const c = v => Math.max(0, Math.min(255, Math.round(v)));
  return a === undefined ? `rgb(${c(r)},${c(g)},${c(b)})` : `rgba(${c(r)},${c(g)},${c(b)},${a})`;
}
// f > 0 éclaircit, f < 0 assombrit
function shade(hex, f, a) {
  const [r, g, b] = hexToRgb(hex);
  if (f >= 0) return rgb(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f, a);
  return rgb(r * (1 + f), g * (1 + f), b * (1 + f), a);
}
function mix(h1, h2, t, a) {
  const A = hexToRgb(h1), B = hexToRgb(h2);
  return rgb(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t, a);
}
// Bruit déterministe par case
function hash2(i, j) {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function rand(a, b) { return a + Math.random() * (b - a); }

// ---------- Scène ----------
class IsoScene {
  constructor(def) {
    this.def = def;
    this.w = def.w; this.h = def.h;
    this.base = def.base ?? -3;
    this.tiles = [];
    for (let i = 0; i < this.w; i++) {
      this.tiles.push([]);
      for (let j = 0; j < this.h; j++) this.tiles[i].push({ h: 0, c: '#555555' });
    }
    this.entities = [];
    this.particles = [];
    this.emitters = def.particles || [];
    this.t = 0;
    def.build(this);
  }
  tile(i, j) {
    if (i < 0 || j < 0 || i >= this.w || j >= this.h) return null;
    return this.tiles[i][j];
  }
  set(i, j, props) { const t = this.tile(i, j); if (t) Object.assign(t, props); }
  ground(x, y) {
    const t = this.tile(Math.floor(x), Math.floor(y));
    return t ? t.h : 0;
  }
  add(e) { this.entities.push(e); return e; }

  update(dt) {
    this.t += dt;
    for (const e of this.entities) if (e.update) e.update(dt, this.t, e, this);
    // émetteurs de particules
    for (const em of this.emitters) {
      em._acc = (em._acc || 0) + em.rate * dt;
      while (em._acc >= 1) { em._acc -= 1; this.particles.push(spawnParticle(em, this)); }
    }
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      if (p.type === 'rain' || p.type === 'fire' || p.type === 'hail') {
        if (p.z <= this.ground(p.x, p.y)) { p.life = Math.min(p.life, p.type === 'fire' ? 0.35 : 0.08); p.vz = 0; p.vx = 0; p.vy = 0; p.landed = true; }
      }
      if (p.type === 'wind') { p.vx += Math.sin(this.t * 2 + p.seed) * 0.5 * dt; }
    }
    this.particles = this.particles.filter(p => p.life > 0 && p.x > -2 && p.y > -2 && p.x < this.w + 2 && p.y < this.h + 2);
  }

  draw(ctx, cam, cw, ch) {
    const t = this.t;
    const d = this.def;
    // fond
    const g = ctx.createLinearGradient(0, 0, 0, ch);
    g.addColorStop(0, d.sky[0]); g.addColorStop(1, d.sky[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, cw, ch);
    if (d.drawBackground) d.drawBackground(ctx, cw, ch, t, cam, this);

    const k = cam.scale;
    const S = (x, y, z) => { const p = isoProj(x, y, z); return [p[0] * k + cam.ox, p[1] * k + cam.oy]; };
    this.S = S;

    // liste d'affichage triée par profondeur
    const items = [];
    for (let i = 0; i < this.w; i++) for (let j = 0; j < this.h; j++) {
      const tl = this.tiles[i][j];
      if (tl.hidden) continue;
      items.push({ key: i + j + 1, kind: 0, i, j, tl });
    }
    for (const e of this.entities) {
      if (e.hidden) continue;
      items.push({ key: e.x + e.y + (e.keyBias || 0.01), kind: 1, e });
    }
    items.sort((a, b) => a.key - b.key || a.kind - b.kind);

    for (const it of items) {
      if (it.kind === 0) this.drawTile(ctx, S, it.i, it.j, it.tl, t);
      else {
        const e = it.e;
        const z = (e.z !== undefined ? e.z : this.ground(e.x, e.y)) + (e.dz || 0);
        const [sx, sy] = S(e.x, e.y, z);
        e._sx = sx; e._sy = sy; e._k = k;
        e.draw(ctx, sx, sy, k, t, e, this);
      }
    }
    // particules
    for (const p of this.particles) drawParticle(ctx, p, S, k, t);

    if (d.overlay) d.overlay(ctx, cw, ch, t);
    // vignette
    const v = ctx.createRadialGradient(cw / 2, ch / 2, Math.min(cw, ch) * 0.35, cw / 2, ch / 2, Math.max(cw, ch) * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${d.vignette ?? 0.65})`);
    ctx.fillStyle = v; ctx.fillRect(0, 0, cw, ch);
  }

  drawTile(ctx, S, i, j, tl, t) {
    const top = tl.h, bot = tl.base ?? this.base;
    let col = tl.c;
    const n = hash2(i, j);
    let lift = (n - 0.5) * 0.12;
    if (tl.anim) lift += tileAnim(tl.anim, i, j, t);
    const topCol = lift >= 0 ? shade(col, lift) : shade(col, lift);
    const a = S(i, j, top), b = S(i + 1, j, top), c = S(i + 1, j + 1, top), d = S(i, j + 1, top);
    // face gauche (côté y+1)
    if (top > bot) {
      const d2 = S(i, j + 1, bot), c2 = S(i + 1, j + 1, bot), b2 = S(i + 1, j, bot);
      ctx.fillStyle = shade(tl.side || col, -0.45);
      ctx.beginPath(); ctx.moveTo(d[0], d[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(c2[0], c2[1]); ctx.lineTo(d2[0], d2[1]); ctx.closePath(); ctx.fill();
      ctx.fillStyle = shade(tl.side || col, -0.28);
      ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(b2[0], b2[1]); ctx.lineTo(c2[0], c2[1]); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = topCol;
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill();
    if (!tl.anim || tl.anim === 'sand' || tl.anim === 'ice') {
      ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 1; ctx.stroke();
    }
    if (tl.anim === 'ice') {
      // reflets
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath();
      const m = S(i + 0.3 + n * 0.3, j + 0.2, top), m2 = S(i + 0.6 + n * 0.3, j + 0.5, top);
      ctx.moveTo(m[0], m[1]); ctx.lineTo(m2[0], m2[1]); ctx.stroke();
    }
    if (tl.deco) tl.deco(ctx, S, i, j, top, t, n);
  }
}

function tileAnim(kind, i, j, t) {
  switch (kind) {
    case 'water': return Math.sin(t * 1.5 + i * 0.8 + j * 0.5) * 0.08;
    case 'blood': return Math.sin(t * 3 + i * 1.3 - j * 0.7) * 0.12 + Math.sin(t * 7 + i * j) * 0.04;
    case 'pitch': return Math.sin(t * 2.2 + i * 2.1 + j * 1.7) * 0.06;
    case 'lava': return 0.1 + Math.sin(t * 2 + i * 0.9 + j * 1.1) * 0.15;
    case 'mud': return Math.sin(t * 0.8 + i * 0.4 + j * 0.9) * 0.04;
    case 'sand': return Math.sin(t * 4 + i * 1.7 + j * 2.3) * 0.06;
    case 'ice': return Math.sin(t * 0.5 + i * 0.3 + j * 0.2) * 0.04;
    default: return 0;
  }
}

// ---------- Particules ----------
function spawnParticle(em, sc) {
  const r = em.region || [0, 0, sc.w, sc.h];
  const x = rand(r[0], r[2]), y = rand(r[1], r[3]);
  const p = { type: em.type, x, y, z: 0, vx: 0, vy: 0, vz: 0, life: 3, max: 3, seed: Math.random() * 10, color: em.color };
  switch (em.type) {
    case 'rain': p.z = rand(10, 16); p.vz = -rand(18, 24); p.vx = 1.2; p.life = 2; break;
    case 'hail': p.z = rand(10, 16); p.vz = -rand(14, 18); p.life = 2; break;
    case 'fire': p.z = rand(10, 16); p.vz = -rand(4, 6); p.vx = rand(-0.2, 0.2); p.life = 4; break;
    case 'snow': p.z = rand(0.5, 8); p.vx = rand(2, 4); p.vy = rand(-1, 1); p.vz = rand(-0.5, 0.2); p.life = rand(3, 6); break;
    case 'wind': p.z = rand(1, 7); p.vx = rand(3, 6) * (em.dir || 1); p.vy = -rand(1, 3) * (em.dir || 1); p.life = rand(1.5, 3); break;
    case 'ember': p.z = em.z ?? sc.ground(x, y) + 0.5; p.vz = rand(1.5, 3.5); p.vx = rand(-0.3, 0.3); p.vy = rand(-0.3, 0.3); p.life = rand(1, 2.2); break;
    case 'bubble': p.z = sc.ground(x, y); p.life = rand(0.6, 1.4); break;
    case 'sigh': p.z = rand(1.5, 2.5); p.vz = rand(0.4, 0.8); p.life = rand(2, 3); break;
    case 'wasp': p.z = rand(1, 2.5); p.life = rand(1, 2.5); p.vx = rand(-2, 2); p.vy = rand(-2, 2); break;
    case 'sparkle': p.z = sc.ground(x, y) + rand(0.2, em.zMax || 6); p.vz = rand(0.1, 0.5); p.life = rand(1.2, 2.8); break;
    case 'smoke': p.z = sc.ground(x, y) + 0.3; p.vz = rand(0.3, 0.7); p.vx = rand(-0.2, 0.2); p.life = rand(2, 4); break;
  }
  p.max = p.life;
  return p;
}

function drawParticle(ctx, p, S, k, t) {
  const [x, y] = S(p.x, p.y, p.z);
  const a = Math.max(0, Math.min(1, p.life / p.max));
  switch (p.type) {
    case 'rain': {
      if (p.landed) { ctx.strokeStyle = 'rgba(170,190,200,0.5)'; ctx.beginPath(); ctx.ellipse(x, y, 4 * k, 1.5 * k, 0, 0, Math.PI * 2); ctx.stroke(); break; }
      ctx.strokeStyle = p.color || 'rgba(160,175,170,0.55)'; ctx.lineWidth = 1.2 * k;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 3 * k, y - 16 * k); ctx.stroke(); break;
    }
    case 'hail': ctx.fillStyle = 'rgba(230,235,240,0.85)'; ctx.fillRect(x - 1.5 * k, y - 1.5 * k, 3 * k, 3 * k); break;
    case 'fire': {
      const r = (p.landed ? 5 : 3.5) * k;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.2);
      g.addColorStop(0, 'rgba(255,240,180,1)'); g.addColorStop(0.4, 'rgba(255,140,30,0.9)'); g.addColorStop(1, 'rgba(255,60,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.2, 0, Math.PI * 2); ctx.fill(); break;
    }
    case 'snow': ctx.fillStyle = `rgba(235,245,255,${0.8 * a})`; ctx.beginPath(); ctx.arc(x, y, 1.6 * k, 0, Math.PI * 2); ctx.fill(); break;
    case 'wind': {
      ctx.strokeStyle = `rgba(220,200,230,${0.35 * a})`; ctx.lineWidth = 1.2 * k;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - 14 * k, y - 4 * k, x - 30 * k, y + 2 * k); ctx.stroke(); break;
    }
    case 'ember': ctx.fillStyle = `rgba(255,${120 + 100 * a | 0},40,${a})`; ctx.fillRect(x - 1.2 * k, y - 1.2 * k, 2.4 * k, 2.4 * k); break;
    case 'bubble': {
      const r = (1 - a) * 5 * k + 1;
      ctx.strokeStyle = p.color || `rgba(150,170,150,${a})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.5, 0, 0, Math.PI * 2); ctx.stroke(); break;
    }
    case 'sigh': ctx.fillStyle = `rgba(220,230,255,${0.35 * a})`; ctx.font = `${10 * k}px serif`; ctx.fillText('…', x, y); break;
    case 'wasp': {
      const bx = x + Math.sin(t * 20 + p.seed) * 3 * k, by = y + Math.cos(t * 17 + p.seed) * 2 * k;
      ctx.fillStyle = '#e8c330'; ctx.beginPath(); ctx.ellipse(bx, by, 2 * k, 1.2 * k, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(bx - 1 * k, by - 2.5 * k, 2 * k, 1.2 * k); break;
    }
    case 'sparkle': {
      const tw = Math.sin((1 - a) * Math.PI) * (0.6 + 0.4 * Math.sin(t * 9 + p.seed));
      const r = 2.2 * k;
      ctx.strokeStyle = p.color || `rgba(255,248,220,${tw})`; ctx.globalAlpha = Math.max(0, tw); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x - r * 1.6, y); ctx.lineTo(x + r * 1.6, y); ctx.moveTo(x, y - r * 1.6); ctx.lineTo(x, y + r * 1.6); ctx.stroke();
      ctx.globalAlpha = 1; break;
    }
    case 'smoke': ctx.fillStyle = `rgba(120,140,90,${0.18 * a})`; ctx.beginPath(); ctx.arc(x, y, (8 - 5 * a) * k, 0, Math.PI * 2); ctx.fill(); break;
  }
}

// ---------- Personnages ----------
// Dessine une âme humaine stylisée, pieds au point (x, y).
function drawFigure(ctx, x, y, k, o = {}) {
  const body = o.color || '#d9d4c7';
  const skin = o.skin || shade(body, 0.15);
  const alpha = o.alpha ?? 0.92;
  const s = (o.size || 1) * k * 1.2;
  ctx.save();
  ctx.globalAlpha = alpha;
  if (o.sink) {
    // seule la partie au-dessus de la surface est visible
    ctx.beginPath(); ctx.rect(x - 40 * s, y - 80 * s, 80 * s, 80 * s); ctx.clip();
    y += o.sink * 28 * s;
  } else if (!o.noShadow) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(x, y, 6 * s, 2.4 * s, 0, 0, Math.PI * 2); ctx.fill();
  }
  if (o.flip) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); }
  if (o.rot) { ctx.translate(x, y - 12 * s); ctx.rotate(o.rot); ctx.translate(-x, -(y - 12 * s)); }
  const pose = o.pose || 'stand';
  const ph = o.phase || 0;

  if (pose === 'lie') {
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.ellipse(x - 2 * s, y - 2.5 * s, 10 * s, 3.4 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.arc(x + 9.5 * s, y - 3.5 * s, 3.6 * s, 0, Math.PI * 2); ctx.fill();
    if (o.writhe) { // bras qui se débattent
      ctx.strokeStyle = skin; ctx.lineWidth = 2 * s; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x + 3 * s, y - 4 * s); ctx.lineTo(x + 5 * s + Math.sin(ph) * 3 * s, y - 11 * s - Math.cos(ph) * 2 * s); ctx.stroke();
    }
    ctx.restore(); return;
  }
  if (pose === 'legs') { // tête en bas, seules les jambes dépassent
    ctx.strokeStyle = skin; ctx.lineWidth = 3 * s; ctx.lineCap = 'round';
    const kick = Math.sin(ph) * 3 * s;
    ctx.beginPath(); ctx.moveTo(x - 2 * s, y); ctx.lineTo(x - 3 * s + kick, y - 13 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 2 * s, y); ctx.lineTo(x + 3 * s - kick, y - 13 * s); ctx.stroke();
    ctx.restore(); return;
  }

  const sit = pose === 'sit';
  const legH = sit ? 4 : 10;
  const hip = y - legH * s;
  // jambes
  ctx.strokeStyle = shade(body, -0.1); ctx.lineWidth = 2.6 * s; ctx.lineCap = 'round';
  const stride = pose === 'run' ? Math.sin(ph) * 4 * s : pose === 'walk' ? Math.sin(ph) * 2.2 * s : 0;
  if (sit) {
    ctx.beginPath(); ctx.moveTo(x - 2 * s, hip); ctx.lineTo(x + 5 * s, hip + 1 * s); ctx.lineTo(x + 5 * s, y); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(x - 2 * s, hip); ctx.lineTo(x - 2 * s + stride, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 2 * s, hip); ctx.lineTo(x + 2 * s - stride, y); ctx.stroke();
  }
  // torse
  const lean = (o.lean || 0) * s;
  const sh = hip - 10 * s;
  if (o.cloak) {
    ctx.fillStyle = o.cloak;
    ctx.beginPath(); ctx.moveTo(x - 7 * s, y - 1 * s); ctx.lineTo(x - 5 * s + lean, sh - 2 * s); ctx.quadraticCurveTo(x + lean, sh - 8 * s, x + 5 * s + lean, sh - 2 * s); ctx.lineTo(x + 7 * s, y - 1 * s); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(80,60,20,0.6)'; ctx.lineWidth = 1; ctx.stroke();
  } else {
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.moveTo(x - 4 * s, hip); ctx.lineTo(x - 5 * s + lean, sh); ctx.lineTo(x + 5 * s + lean, sh); ctx.lineTo(x + 4 * s, hip); ctx.closePath(); ctx.fill();
  }
  if (o.split) { // entaille sanglante
    ctx.strokeStyle = '#b01010'; ctx.lineWidth = 1.6 * s;
    ctx.beginPath(); ctx.moveTo(x + lean, sh); ctx.lineTo(x, hip); ctx.stroke();
  }
  if (o.robe) {
    ctx.fillStyle = o.robe;
    ctx.beginPath(); ctx.moveTo(x - 4.5 * s + lean, sh); ctx.lineTo(x + 4.5 * s + lean, sh); ctx.lineTo(x + 6 * s, y - 1 * s); ctx.lineTo(x - 6 * s, y - 1 * s); ctx.closePath(); ctx.fill();
  }
  // bras
  if (!o.cloak) {
    ctx.strokeStyle = skin; ctx.lineWidth = 2.2 * s;
    const arms = o.arms || 'down';
    const sw = pose === 'run' || pose === 'walk' ? Math.sin(ph + Math.PI) * 3 * s : 0;
    const L = [x - 5 * s + lean, sh + 1 * s], R = [x + 5 * s + lean, sh + 1 * s];
    let le, re;
    if (arms === 'up') { le = [L[0] - 3 * s, sh - 9 * s + Math.sin(ph * 2) * 2 * s]; re = [R[0] + 3 * s, sh - 9 * s + Math.cos(ph * 2) * 2 * s]; }
    else if (arms === 'forward') { le = [L[0] + 8 * s, sh + 4 * s]; re = [R[0] + 8 * s, sh + 4 * s]; }
    else if (arms === 'fight') { le = [L[0] + 6 * s + Math.sin(ph * 3) * 4 * s, sh - 2 * s]; re = [R[0] + 7 * s - Math.sin(ph * 3) * 4 * s, sh + 2 * s]; }
    else if (arms === 'scratch') { le = [x + Math.sin(ph * 6) * 3 * s, sh + 5 * s]; re = [R[0] + 1 * s, sh + 7 * s]; }
    else { le = [L[0] - 1.5 * s + sw, hip + 1 * s]; re = [R[0] + 1.5 * s - sw, hip + 1 * s]; }
    ctx.beginPath(); ctx.moveTo(L[0], L[1]); ctx.lineTo(le[0], le[1]); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(R[0], R[1]); ctx.lineTo(re[0], re[1]); ctx.stroke();
  }
  // tête
  if (!o.noHead) {
    const hx = x + lean + (o.headBack ? -1 * s : 0), hy = sh - 4.5 * s;
    ctx.fillStyle = o.hood || skin;
    ctx.beginPath(); ctx.arc(hx, hy, 3.8 * s, 0, Math.PI * 2); ctx.fill();
    if (o.headBack) { // visage tourné vers le dos
      ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.arc(hx - 1.8 * s, hy, 1 * s, 0, Math.PI * 2); ctx.fill();
    }
    if (o.laurel) { ctx.strokeStyle = '#4f8a3a'; ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.arc(hx, hy - 0.5 * s, 3.9 * s, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); }
    if (o.spots) { ctx.fillStyle = '#7c8f3a'; for (let q = 0; q < 3; q++) { ctx.beginPath(); ctx.arc(hx - 2 * s + q * 2 * s, hy + (q % 2) * 1.5 * s, 0.8 * s, 0, 7); ctx.fill(); } }
  }
  if (o.carryHead) { // tête portée à la main
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(x + 9 * s, hip - 1 * s, 3.4 * s, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// Boîte isométrique dont le centre de la base est en (sx, sy). hw/hd : demi-largeurs (unités monde), h : hauteur.
function isoBox(ctx, sx, sy, k, hw, hd, h, col, zb = 0, topCol) {
  const P = (dx, dy, dz) => { const p = isoProj(dx, dy, dz + zb); return [sx + p[0] * k, sy + p[1] * k]; };
  const a = P(-hw, -hd, h), b = P(hw, -hd, h), c = P(hw, hd, h), d = P(-hw, hd, h);
  const b0 = P(hw, -hd, 0), c0 = P(hw, hd, 0), d0 = P(-hw, hd, 0);
  const poly = (pts, f) => { ctx.fillStyle = f; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) ctx.lineTo(p[0], p[1]); ctx.closePath(); ctx.fill(); };
  poly([d, c, c0, d0], shade(col, -0.45));
  poly([c, b, b0, c0], shade(col, -0.25));
  poly([a, b, c, d], topCol || col);
  return { a, b, c, d };
}

function wanderer(x0, y0, x1, y1, speed, ok) {
  return (dt, t, e) => {
    if (e.tx === undefined || Math.hypot(e.tx - e.x, e.ty - e.y) < 0.15) {
      for (let n = 0; n < 20; n++) {
        const tx = rand(x0, x1), ty = rand(y0, y1);
        if (!ok || ok(tx, ty)) { e.tx = tx; e.ty = ty; break; }
      }
      if (e.tx === undefined) { e.tx = e.x; e.ty = e.y; }
    }
    const dx = e.tx - e.x, dy = e.ty - e.y, L = Math.hypot(dx, dy) || 1;
    e.x += dx / L * speed * dt; e.y += dy / L * speed * dt;
    e.phase += dt * 10 * speed;
    if (e.fig) e.fig.flip = (dx - dy) < 0;
  };
}

// Âme générique errante dans une zone, avec comportement paramétrable
function makeSoul(sc, x, y, opts = {}) {
  const e = {
    x, y, name: opts.name, desc: opts.desc, fig: Object.assign({ pose: 'stand' }, opts.fig),
    hit: opts.hit || [9, 32], phase: Math.random() * 6,
    update: opts.update, draw(ctx, sx, sy, k, t, e) {
      e.fig.phase = e.phase;
      drawFigure(ctx, sx, sy, k, e.fig);
    }
  };
  Object.assign(e, opts.extra || {});
  return sc.add(e);
}

// Dante (robe rouge, contrôlé par le joueur) et Virgile (robe grise, laurier) qui le suit
const LIQUIDES = ['water', 'blood', 'pitch'];
const GUIDES = {
  virgile: { name: 'Virgile', desc: 'Le poète latin, guide de Dante, envoyé par Béatrice.', fig: { color: '#8a8f99', robe: '#9aa0aa', skin: '#e2c9a8', laurel: true } },
  beatrice: { name: 'Béatrice', desc: 'Béatrice Portinari, l\'aimée de Dante, figure de la foi et de la grâce. Son sourire devient plus éclatant à chaque ciel.', fig: { color: '#2f7a4a', robe: '#c0392b', skin: '#f0d8c0', hood: '#f4f1ea' } },
  bernard: { name: 'Saint Bernard', desc: 'Bernard de Clairvaux, le contemplatif dévoué à Marie, dernier guide de Dante vers la vision de Dieu.', fig: { color: '#e8e4da', robe: '#f2efe6', skin: '#e6cdb0' } },
};
function addPoets(sc, x, y, guideId = 'virgile') {
  const G = GUIDES[guideId];
  const dante = sc.add({ x, y, name: 'Dante', desc: 'Le poète florentin, pèlerin vivant guidé à travers l\'Enfer. C\'est vous !', hit: [9, 32], phase: 0, player: true, moving: false, flip: false,
    draw(ctx, sx, sy, k, t, e, scn) {
      const tl = scn.tile(Math.floor(e.x), Math.floor(e.y));
      const wade = tl && LIQUIDES.includes(tl.anim) ? 0.3 : 0;
      drawFigure(ctx, sx, sy, k, { color: '#a52a2a', robe: '#a52a2a', skin: '#e2c19a', hood: '#b8322e', laurel: true, alpha: 1, pose: e.moving ? 'walk' : 'stand', phase: e.phase, flip: e.flip, sink: wade });
      // halo pour repérer le joueur
      ctx.strokeStyle = `rgba(255,215,120,${0.45 + Math.sin(t * 4) * 0.2})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(sx, sy, 10 * k, 4 * k, 0, 0, Math.PI * 2); ctx.stroke();
    } });
  sc.player = dante;
  sc.add({ x: x + 0.6, y: y - 0.5, name: G.name, desc: G.desc, guide: true, hit: [9, 32], phase: 0, moving: false,
    update(dt, t, e) {
      const dx = dante.x - e.x, dy = dante.y - e.y, L = Math.hypot(dx, dy);
      e.moving = L > 0.9;
      if (e.moving) { const sp = Math.min(L - 0.8, 3 * dt); e.x += dx / L * sp; e.y += dy / L * sp; e.phase += dt * 9; e.flip = (dx - dy) < 0; }
    },
    draw(ctx, sx, sy, k, t, e, scn) {
      const tl = scn.tile(Math.floor(e.x), Math.floor(e.y));
      drawFigure(ctx, sx, sy, k, { ...G.fig, alpha: 1, size: 1.05, pose: e.moving ? 'walk' : 'stand', phase: e.phase, flip: e.flip, sink: tl && LIQUIDES.includes(tl.anim) ? 0.3 : 0 });
    } });
}

// Déplace le joueur de (dx, dy) en unités monde, en refusant de franchir les murs et les bords
function movePlayer(sc, dx, dy) {
  const p = sc.player; if (!p) return false;
  const here = sc.ground(p.x, p.y);
  const ok = (x, y) => { const t = sc.tile(Math.floor(x), Math.floor(y)); return t && !t.hidden && t.h - here < 0.95 && x > 0.15 && y > 0.15 && x < sc.w - 0.15 && y < sc.h - 0.15; };
  let moved = false;
  if (ok(p.x + dx, p.y + dy)) { p.x += dx; p.y += dy; moved = true; }
  else if (ok(p.x + dx, p.y)) { p.x += dx; moved = true; }
  else if (ok(p.x, p.y + dy)) { p.y += dy; moved = true; }
  if (moved) p.flip = (dx - dy) < 0;
  return moved;
}
