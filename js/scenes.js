// Définition des scènes 2.5D : une par cercle.
const TAU = Math.PI * 2;

function forTiles(sc, f) { for (let i = 0; i < sc.w; i++) for (let j = 0; j < sc.h; j++) f(i, j, sc.tiles[i][j]); }
function tri(x) { const f = x - Math.floor(x); return f < 0.5 ? f * 2 : 2 - f * 2; }
function kFromS(S) { return (S(1, 0, 0)[0] - S(0, 0, 0)[0]) / (ISO.TW / 2); }

// ---------- Créatures et décors ----------
function drawBoat(ctx, x, y, k, t, rower, lantern) {
  const bob = Math.sin(t * 2) * 1.5 * k;
  y += bob;
  ctx.fillStyle = '#3b2716';
  ctx.beginPath(); ctx.moveTo(x - 26 * k, y - 6 * k); ctx.lineTo(x + 26 * k, y - 6 * k); ctx.lineTo(x + 18 * k, y + 4 * k); ctx.lineTo(x - 18 * k, y + 4 * k); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#5a3d22'; ctx.fillRect(x - 26 * k, y - 8 * k, 52 * k, 3 * k);
  if (rower) {
    drawFigure(ctx, x + 10 * k, y - 6 * k, k, { color: rower.color, robe: rower.robe, skin: rower.skin, size: 1.15, noShadow: true, alpha: 1 });
    ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 2 * k;
    const sw = Math.sin(t * 1.5) * 6 * k;
    ctx.beginPath(); ctx.moveTo(x + 4 * k + sw, y - 26 * k); ctx.lineTo(x - 6 * k - sw, y + 8 * k); ctx.stroke();
    if (rower.eyes) { ctx.fillStyle = '#ff5a1a'; ctx.beginPath(); ctx.arc(x + 9 * k, y - 34 * k, 1.2 * k, 0, TAU); ctx.arc(x + 12 * k, y - 34 * k, 1.2 * k, 0, TAU); ctx.fill(); }
  }
  if (lantern) {
    const g = ctx.createRadialGradient(x - 20 * k, y - 22 * k, 0, x - 20 * k, y - 22 * k, 22 * k);
    g.addColorStop(0, 'rgba(255,190,90,0.6)'); g.addColorStop(1, 'rgba(255,190,90,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x - 20 * k, y - 22 * k, 22 * k, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#2a1a0e'; ctx.lineWidth = 1.5 * k; ctx.beginPath(); ctx.moveTo(x - 20 * k, y - 6 * k); ctx.lineTo(x - 20 * k, y - 20 * k); ctx.stroke();
    ctx.fillStyle = '#ffcf6b'; ctx.fillRect(x - 22 * k, y - 24 * k, 4 * k, 5 * k);
  }
}

function drawDemon(ctx, x, y, k, t, o = {}) {
  const ph = (o.phase || 0) + t * 4;
  ctx.save();
  if (o.flip) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); }
  // ailes
  ctx.fillStyle = 'rgba(40,10,10,0.9)';
  const fl = Math.sin(ph) * 4 * k;
  ctx.beginPath(); ctx.moveTo(x - 2 * k, y - 22 * k); ctx.lineTo(x - 16 * k, y - 34 * k - fl); ctx.lineTo(x - 12 * k, y - 20 * k); ctx.lineTo(x - 18 * k, y - 22 * k - fl); ctx.closePath(); ctx.fill();
  drawFigure(ctx, x, y, k, { color: o.color || '#5a1414', skin: o.color || '#6e1a1a', pose: o.pose || 'stand', phase: ph, arms: 'forward', size: 1.1, alpha: 1 });
  // cornes
  ctx.strokeStyle = '#e8d8b0'; ctx.lineWidth = 1.5 * k;
  ctx.beginPath(); ctx.moveTo(x - 2 * k, y - 32 * k); ctx.lineTo(x - 4 * k, y - 37 * k); ctx.moveTo(x + 2 * k, y - 32 * k); ctx.lineTo(x + 4 * k, y - 37 * k); ctx.stroke();
  ctx.fillStyle = '#ffd040'; ctx.fillRect(x + 1 * k, y - 30 * k, 1.5 * k, 1.2 * k);
  // outil
  ctx.strokeStyle = o.tool === 'whip' ? '#2a1a10' : '#888'; ctx.lineWidth = 1.6 * k;
  ctx.beginPath();
  if (o.tool === 'whip') { ctx.moveTo(x + 13 * k, y - 18 * k); ctx.quadraticCurveTo(x + 24 * k, y - 32 * k + Math.sin(ph * 2) * 10 * k, x + 34 * k, y - 10 * k + Math.cos(ph * 2) * 8 * k); }
  else if (o.tool === 'hook') { ctx.moveTo(x + 10 * k, y - 4 * k); ctx.lineTo(x + 18 * k, y - 34 * k); ctx.arc(x + 15 * k, y - 34 * k, 3 * k, 0, Math.PI, true); }
  else if (o.tool === 'sword') { const a = Math.sin(ph * 0.8) * 1.2; ctx.moveTo(x + 13 * k, y - 18 * k); ctx.lineTo(x + 13 * k + Math.cos(a - 1) * 20 * k, y - 18 * k + Math.sin(a - 1) * 20 * k); ctx.strokeStyle = '#ccc'; ctx.lineWidth = 2.2 * k; }
  ctx.stroke();
  ctx.restore();
}

function drawFlame(ctx, x, y, k, t, size = 1, seed = 0) {
  const s = k * size;
  const f = Math.sin(t * 9 + seed) * 2 * s;
  const g = ctx.createLinearGradient(x, y, x, y - 30 * s);
  g.addColorStop(0, 'rgba(255,240,170,0.95)'); g.addColorStop(0.5, 'rgba(255,130,20,0.9)'); g.addColorStop(1, 'rgba(200,30,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(x - 7 * s, y);
  ctx.quadraticCurveTo(x - 9 * s, y - 14 * s, x + f, y - 30 * s);
  ctx.quadraticCurveTo(x + 9 * s, y - 14 * s, x + 7 * s, y); ctx.closePath(); ctx.fill();
}

function drawGlow(ctx, x, y, r, col) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
}

function drawSnake(ctx, x, y, k, t, seed = 0, len = 18) {
  ctx.strokeStyle = '#3f8a3a'; ctx.lineWidth = 2.2 * k; ctx.lineCap = 'round';
  ctx.beginPath();
  for (let q = 0; q <= 10; q++) {
    const u = q / 10;
    const px = x - len / 2 * k + u * len * k, py = y + Math.sin(u * 9 + t * 6 + seed) * 2.5 * k;
    q ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.stroke();
  ctx.fillStyle = '#2c6a2a'; ctx.beginPath(); ctx.arc(x + len / 2 * k, y + Math.sin(9 + t * 6 + seed) * 2.5 * k, 2 * k, 0, TAU); ctx.fill();
}

function drawTree(ctx, x, y, k, seed) {
  ctx.strokeStyle = '#2b1f18'; ctx.lineCap = 'round';
  const br = (x0, y0, a, len, w, d) => {
    if (d === 0) return;
    const x1 = x0 + Math.cos(a) * len * k, y1 = y0 + Math.sin(a) * len * k;
    ctx.lineWidth = w * k; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    // épines
    ctx.lineWidth = 0.8 * k; ctx.beginPath(); ctx.moveTo((x0 + x1) / 2, (y0 + y1) / 2); ctx.lineTo((x0 + x1) / 2 + 3 * k, (y0 + y1) / 2 - 2 * k); ctx.stroke();
    const j = hash2(seed + d, len) - 0.5;
    br(x1, y1, a - 0.5 + j * 0.6, len * 0.7, w * 0.65, d - 1);
    br(x1, y1, a + 0.45 + j * 0.6, len * 0.68, w * 0.65, d - 1);
  };
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x, y, 10 * k, 4 * k, 0, 0, TAU); ctx.fill();
  br(x, y, -Math.PI / 2 + (hash2(seed, 1) - 0.5) * 0.4, 18, 4.5, 4);
}

function drawHarpy(ctx, x, y, k, t, seed) {
  const fl = Math.sin(t * 5 + seed) * 5 * k;
  ctx.fillStyle = '#3a2d26';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 12 * k, y - 6 * k - fl); ctx.lineTo(x - 4 * k, y + 2 * k); ctx.lineTo(x + 4 * k, y + 2 * k); ctx.lineTo(x + 12 * k, y - 6 * k - fl); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#4b3a30'; ctx.beginPath(); ctx.ellipse(x, y + 2 * k, 4 * k, 6 * k, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#d8b9a0'; ctx.beginPath(); ctx.arc(x, y - 5 * k, 3 * k, 0, TAU); ctx.fill();
  ctx.fillStyle = '#1a1210'; ctx.fillRect(x - 3 * k, y - 8.5 * k, 6 * k, 2 * k);
}

function drawCentaur(ctx, x, y, k, t, flip, ph) {
  ctx.save();
  if (flip) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); }
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x, y, 14 * k, 4 * k, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#5a3b22'; ctx.lineWidth = 2.6 * k;
  const st = Math.sin(ph) * 3 * k;
  for (const lx of [-9, -5, 6, 10]) { ctx.beginPath(); ctx.moveTo(x + lx * k, y - 10 * k); ctx.lineTo(x + lx * k + (lx < 0 ? st : -st), y); ctx.stroke(); }
  ctx.fillStyle = '#6e4a2b'; ctx.beginPath(); ctx.ellipse(x, y - 12 * k, 13 * k, 5 * k, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 13 * k, y - 13 * k); ctx.quadraticCurveTo(x - 20 * k, y - 10 * k, x - 18 * k, y - 4 * k); ctx.strokeStyle = '#3a2614'; ctx.lineWidth = 2 * k; ctx.stroke();
  // buste humain
  ctx.fillStyle = '#c99a72';
  ctx.beginPath(); ctx.moveTo(x + 7 * k, y - 14 * k); ctx.lineTo(x + 8 * k, y - 26 * k); ctx.lineTo(x + 15 * k, y - 26 * k); ctx.lineTo(x + 14 * k, y - 14 * k); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 11.5 * k, y - 30 * k, 3.6 * k, 0, TAU); ctx.fill();
  // arc
  ctx.strokeStyle = '#3a2614'; ctx.lineWidth = 1.5 * k;
  ctx.beginPath(); ctx.arc(x + 20 * k, y - 22 * k, 8 * k, -1.2, 1.2); ctx.stroke();
  ctx.strokeStyle = '#ddd'; ctx.lineWidth = 0.8 * k; ctx.beginPath(); ctx.moveTo(x + 14 * k, y - 22 * k); ctx.lineTo(x + 30 * k, y - 22 * k); ctx.stroke();
  ctx.restore();
}

function drawGiant(ctx, x, y, k, t, o) {
  const s = k * 3.6;
  drawFigure(ctx, x, y, s / 1, { color: o.color || '#7a6a5a', skin: o.skin || '#9a8470', alpha: 1, arms: o.arms || 'down', phase: t });
  // chaînes
  ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 2 * k; ctx.setLineDash([3 * k, 2 * k]);
  ctx.beginPath(); ctx.moveTo(x - 20 * k, y - 60 * k); ctx.lineTo(x + 20 * k, y - 45 * k); ctx.moveTo(x - 20 * k, y - 45 * k); ctx.lineTo(x + 20 * k, y - 62 * k); ctx.stroke();
  ctx.setLineDash([]);
  if (o.horn) { ctx.fillStyle = '#d8c79a'; ctx.beginPath(); ctx.moveTo(x + 10 * k, y - 80 * k); ctx.lineTo(x + 26 * k, y - 88 * k); ctx.lineTo(x + 24 * k, y - 78 * k); ctx.closePath(); ctx.fill(); }
}

function drawLucifer(ctx, x, y, k, t) {
  const s = k;
  const flap = Math.sin(t * 1.4);
  // ailes de chauve-souris (6, deux sous chaque visage)
  const wing = (side, lift, sc) => {
    ctx.save(); ctx.translate(x + side * 26 * s, y - 70 * s); ctx.scale(side, 1); ctx.rotate(-lift - flap * 0.25 * sc);
    ctx.fillStyle = 'rgba(25,20,30,0.95)';
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.lineTo(70 * s * sc, -40 * s * sc); ctx.lineTo(95 * s * sc, -10 * s * sc);
    ctx.quadraticCurveTo(80 * s * sc, 0, 75 * s * sc, 12 * s * sc);
    ctx.quadraticCurveTo(60 * s * sc, 6 * s * sc, 52 * s * sc, 20 * s * sc);
    ctx.quadraticCurveTo(38 * s * sc, 10 * s * sc, 30 * s * sc, 24 * s * sc);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(80,70,90,0.8)'; ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(75 * s * sc, 12 * s * sc); ctx.moveTo(0, 0); ctx.lineTo(52 * s * sc, 20 * s * sc); ctx.moveTo(0, 0); ctx.lineTo(95 * s * sc, -10 * s * sc); ctx.stroke();
    ctx.restore();
  };
  for (const side of [-1, 1]) { wing(side, 0.6, 1.1); wing(side, 0.05, 1.25); wing(side, -0.5, 0.9); }
  // torse
  ctx.fillStyle = '#3a2c36';
  ctx.beginPath(); ctx.moveTo(x - 38 * s, y); ctx.lineTo(x - 34 * s, y - 70 * s); ctx.quadraticCurveTo(x, y - 84 * s, x + 34 * s, y - 70 * s); ctx.lineTo(x + 38 * s, y); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 2 * s;
  ctx.beginPath(); ctx.moveTo(x, y - 74 * s); ctx.lineTo(x, y - 10 * s); ctx.moveTo(x - 20 * s, y - 52 * s); ctx.quadraticCurveTo(x, y - 46 * s, x + 20 * s, y - 52 * s); ctx.stroke();
  // bras
  ctx.strokeStyle = '#3a2c36'; ctx.lineWidth = 11 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 34 * s, y - 64 * s); ctx.lineTo(x - 52 * s, y - 20 * s); ctx.moveTo(x + 34 * s, y - 64 * s); ctx.lineTo(x + 52 * s, y - 20 * s); ctx.stroke();
  // trois visages
  const face = (fx, fy, col, r, victim) => {
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(fx, fy, r, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffde59'; ctx.beginPath(); ctx.arc(fx - r * 0.35, fy - r * 0.15, r * 0.12, 0, TAU); ctx.arc(fx + r * 0.35, fy - r * 0.15, r * 0.12, 0, TAU); ctx.fill();
    // larmes et bave sanglante
    ctx.fillStyle = 'rgba(160,210,255,0.8)'; ctx.fillRect(fx - r * 0.4, fy, r * 0.08, r * 0.5 + Math.sin(t * 3) * 2 * s);
    const chew = (Math.sin(t * 4) + 1) * 0.5;
    ctx.fillStyle = '#1a0606'; ctx.beginPath(); ctx.ellipse(fx, fy + r * 0.45, r * 0.45, r * (0.12 + chew * 0.15), 0, 0, TAU); ctx.fill();
    // le damné broyé
    ctx.strokeStyle = '#d7cdb8'; ctx.lineWidth = 2.4 * s;
    if (victim === 'legs') {
      ctx.beginPath(); ctx.moveTo(fx - 2 * s, fy + r * 0.45); ctx.lineTo(fx - 5 * s + chew * 3 * s, fy + r * 0.45 + 14 * s); ctx.moveTo(fx + 2 * s, fy + r * 0.45); ctx.lineTo(fx + 5 * s - chew * 3 * s, fy + r * 0.45 + 14 * s); ctx.stroke();
    } else {
      ctx.fillStyle = '#d7cdb8'; ctx.beginPath(); ctx.arc(fx + (victim === 'left' ? -1 : 1) * r * 0.45, fy + r * 0.62, 3 * s, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(fx, fy + r * 0.5); ctx.lineTo(fx + (victim === 'left' ? -1 : 1) * r * 0.7, fy + r * 0.9); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(150,0,0,0.7)'; ctx.fillRect(fx - 1 * s, fy + r * 0.55, 2 * s, 6 * s * chew + 2 * s);
  };
  face(x - 26 * s, y - 88 * s, '#151212', 13 * s, 'left');
  face(x + 26 * s, y - 88 * s, '#cfc27a', 13 * s, 'right');
  face(x, y - 96 * s, '#9e1b1b', 16 * s, 'legs');
  // cornes
  ctx.fillStyle = '#2a1e22';
  ctx.beginPath(); ctx.moveTo(x - 10 * s, y - 108 * s); ctx.lineTo(x - 18 * s, y - 128 * s); ctx.lineTo(x - 4 * s, y - 110 * s); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 10 * s, y - 108 * s); ctx.lineTo(x + 18 * s, y - 128 * s); ctx.lineTo(x + 4 * s, y - 110 * s); ctx.fill();
}

// ---------- Les scènes ----------
const SCENES = {};

// ===== Vestibule =====
SCENES.vestibule = {
  w: 16, h: 16, sky: ['#2b2a28', '#0f0e0d'],
  particles: [{ type: 'wasp', rate: 18, region: [3, 3, 10, 11] }],
  build(sc) {
    forTiles(sc, (i, j, t) => { t.h = 0.4 + hash2(i, j) * 0.15; t.c = '#6b675c'; });
    for (let j = 0; j < 16; j++) {
      for (let i = 12; i < 15; i++) sc.set(i, j, { h: 0.1, c: '#3b4a4f', anim: 'water' });
      sc.set(15, j, { h: 0.35, c: '#4f4b44' });
    }
    // porte de l'Enfer
    sc.add({ x: 1.2, y: 1.2, name: 'La porte de l\'Enfer', desc: '« Par moi l\'on va dans la cité dolente… Vous qui entrez, laissez toute espérance. » (Chant III)', hit: [40, 90],
      draw(ctx, x, y, k) {
        isoBox(ctx, x - 26 * k, y + 13 * k, k, 0.3, 0.3, 5, '#3a3530');
        isoBox(ctx, x + 26 * k, y - 13 * k, k, 0.3, 0.3, 5, '#3a3530');
        isoBox(ctx, x, y, k, 0.4, 1.4, 1, '#2e2a26', 5);
        ctx.fillStyle = '#d6a65a'; ctx.font = `bold ${7 * k}px Cinzel, serif`; ctx.textAlign = 'center';
        ctx.fillText('LASCIATE OGNE SPERANZA', x - 1 * k, y - 88 * k); ctx.textAlign = 'left';
      } });
    // bannière qui tourne sans cesse
    const cx = 6.5, cy = 7.5;
    sc.add({ x: cx, y: cy, name: 'La bannière', desc: 'Une enseigne qui court en tournant si vite qu\'elle semble indigne de tout repos.', hit: [12, 60],
      update(dt, t, e) { e.a = t * 0.9; e.x = cx + Math.cos(e.a) * 4.2; e.y = cy + Math.sin(e.a) * 4.2; },
      draw(ctx, x, y, k, t) {
        ctx.strokeStyle = '#2a1e12'; ctx.lineWidth = 2 * k; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 55 * k); ctx.stroke();
        ctx.fillStyle = '#d9d2c0';
        ctx.beginPath(); ctx.moveTo(x, y - 55 * k);
        for (let q = 0; q <= 8; q++) ctx.lineTo(x + q * 3 * k, y - 55 * k + Math.sin(t * 10 + q) * 2 * k);
        for (let q = 8; q >= 0; q--) ctx.lineTo(x + q * 3 * k, y - 40 * k + Math.sin(t * 10 + q) * 2 * k);
        ctx.closePath(); ctx.fill();
      } });
    for (let n = 0; n < 22; n++) {
      const off = 0.25 + n * 0.17, rr = 4.2 + (hash2(n, 3) - 0.5) * 1.6;
      makeSoul(sc, cx, cy, { name: n === 7 ? 'Celui qui fit le grand refus' : 'Âme tiède', desc: n === 7 ? 'Dante reconnaît « l\'ombre de celui qui fit par lâcheté le grand refus ».' : 'Elle n\'a vécu ni dans l\'infamie ni dans la gloire. Elle court derrière la bannière, piquée par les guêpes.',
        fig: { pose: 'run', color: '#cfc8b8' },
        update(dt, t, e) { const a = t * 0.9 - off; e.x = cx + Math.cos(a) * rr; e.y = cy + Math.sin(a) * rr; e.phase = t * 14 + n; const dx = -Math.sin(a), dy = Math.cos(a); e.fig.flip = (dx - dy) < 0; } });
    }
    // âmes attendant Charon sur la rive
    for (let n = 0; n < 8; n++) makeSoul(sc, 11.3 + hash2(n, 1) * 0.6, 3 + n * 1.3, { name: 'Damné en attente', desc: 'Les âmes se pressent sur la rive de l\'Achéron, avides de passer : la justice divine les aiguillonne.', fig: { color: '#bdb6a6', arms: n % 2 ? 'up' : 'down' } });
    sc.add({ x: 13.5, y: 8, name: 'Charon', desc: '« Malheur à vous, âmes perverses ! » Le vieux nocher aux yeux de braise frappe de sa rame les âmes qui traînent.', hit: [30, 50],
      update(dt, t, e) { e.y = 8 + Math.sin(t * 0.25) * 5; }, draw(ctx, x, y, k, t) { drawBoat(ctx, x, y, k, t, { color: '#6d6d64', robe: '#55524a', skin: '#c9c2b0', eyes: true }, true); } });
    addPoets(sc, 3, 13);
  }
};

// ===== Cercle I : Limbes =====
SCENES.limbes = {
  w: 16, h: 16, sky: ['#2a3440', '#0e1418'],
  particles: [{ type: 'sigh', rate: 3, region: [0, 0, 16, 16] }],
  build(sc) {
    const C = 8;
    forTiles(sc, (i, j, t) => {
      const d = Math.max(Math.abs(i + 0.5 - C), Math.abs(j + 0.5 - C));
      t.h = 0.4; t.c = '#56784d';
      const gate = Math.abs(j + 0.5 - C) < 1 && i + 0.5 > C; // passage vers l'entrée
      if (d < 1) { t.h = 4.5; t.c = '#a9a294'; }
      else if (Math.abs(d - 2.5) < 0.5 && !gate) { t.h = 2.6; t.c = '#9c9585'; }
      else if (Math.abs(d - 4.5) < 0.5 && !gate) { t.h = 1.6; t.c = '#8f887a'; }
      else if (Math.abs(d - 5.5) < 0.5) { t.h = gate ? 0.6 : 0.15; t.c = gate ? '#7a7466' : '#3d5d6a'; if (!gate) t.anim = 'water'; }
      else if (d < 4) { t.c = '#6a8c5a'; }
    });
    sc.add({ x: C + 0.01, y: C + 0.01, z: 4.5, name: 'Le noble château', desc: 'Un château entouré sept fois de hautes murailles et défendu par un beau ruisseau : la demeure des grands esprits de l\'Antiquité.', hit: [20, 60], keyBias: 0.5,
      draw(ctx, x, y, k, t) { isoBox(ctx, x, y, k, 0.35, 0.35, 3, '#bdb5a5'); ctx.fillStyle = '#7a2d2d'; ctx.beginPath(); ctx.moveTo(x - 12 * k, y - 48 * k); ctx.lineTo(x, y - 70 * k); ctx.lineTo(x + 12 * k, y - 48 * k); ctx.fill(); drawGlow(ctx, x, y - 30 * k, 70 * k, 'rgba(255,240,200,0.15)'); } });
    const sages = [['Homère', 'Le poète souverain, l\'épée à la main.'], ['Horace', 'Le satiriste.'], ['Ovide', 'Le poète des Métamorphoses.'], ['Lucain', 'Le poète de la Pharsale.'],
      ['Socrate', 'Philosophe, près d\'Aristote.'], ['Platon', 'Philosophe, près d\'Aristote.'], ['Aristote', '« Le maître de ceux qui savent ».'], ['Euclide', 'Le géomètre.'], ['Avicenne', 'Médecin et philosophe persan.'], ['Averroès', '« Qui fit le grand commentaire ».'], ['Saladin', 'Seul, à l\'écart.']];
    const okLimbes = (x, y) => { const d = Math.max(Math.abs(x - C), Math.abs(y - C)); return (d > 1.2 && d < 2) || (d > 3.2 && d < 4); };
    sages.forEach(([n, d], q) => {
      const a = q / sages.length * TAU, r = q < 6 ? 1.6 : 3.6;
      makeSoul(sc, C + Math.cos(a) * r, C + Math.sin(a) * r, { name: n, desc: d, fig: { pose: 'walk', color: '#e7e1d2', robe: '#d8d0bd', laurel: q < 4 }, update: wanderer(5, 5, 11, 11, 0.25, okLimbes) });
    });
    const okOut = (x, y) => Math.max(Math.abs(x - C), Math.abs(y - C)) > 6.2;
    for (let n = 0; n < 16; n++) {
      let x, y; do { x = rand(0.5, 15.5); y = rand(0.5, 15.5); } while (!okOut(x, y));
      makeSoul(sc, x, y, { name: n % 3 ? 'Païen vertueux' : 'Enfant non baptisé', desc: n % 3 ? 'Sans péché, mais né avant le Christ : il vit dans le désir, sans espérance.' : 'Mort avant le baptême : il soupire sans souffrance, privé de Dieu.',
        fig: { pose: 'walk', color: '#cfd6dc', size: n % 3 ? 1 : 0.65, alpha: 0.75 }, update: wanderer(0.5, 0.5, 15.5, 15.5, 0.2, okOut) });
    }
    addPoets(sc, 14, 8.2);
  }
};

// ===== Cercle II : Luxure =====
SCENES.luxure = {
  w: 16, h: 16, sky: ['#2a1622', '#0b0509'],
  particles: [{ type: 'wind', rate: 40, region: [0, 0, 16, 16] }],
  build(sc) {
    forTiles(sc, (i, j, t) => { t.h = 0.4 + hash2(i, j) * 0.4; t.c = '#4a3a42'; if (i < 2 || j < 2) { t.h = 3 + hash2(j, i) * 3; t.c = '#3a2c33'; } });
    const C = 8.5;
    for (let n = 0; n < 34; n++) {
      const r = 2 + hash2(n, 9) * 4.2, sp = 0.6 + hash2(n, 4) * 0.5, a0 = hash2(n, 2) * TAU, z0 = 2 + hash2(n, 5) * 5;
      makeSoul(sc, C, C, { name: 'Âme luxurieuse', desc: 'Emportée par la tourmente infernale qui jamais ne s\'arrête, elle est heurtée contre les parois.',
        fig: { pose: 'stand', arms: 'up', color: '#e2c8d2', noShadow: true },
        update(dt, t, e) { const a = a0 + t * sp; e.x = C + Math.cos(a) * r; e.y = C + Math.sin(a) * r; e.z = z0 + Math.sin(t * 1.3 + n) * 1.2; e.fig.rot = Math.sin(t * 2 + n) * 0.9 + a; e.phase = t * 3; } });
    }
    makeSoul(sc, C, C, { name: 'Francesca et Paolo', desc: '« Amour, qui ne pardonne à nul aimé d\'aimer… » Francesca da Rimini et Paolo Malatesta, tués par le mari de Francesca, volent ensemble dans le vent.', hit: [20, 34],
      update(dt, t, e) { const a = t * 0.5; e.x = C + Math.cos(a) * 3; e.y = C + Math.sin(a) * 3; e.z = 4 + Math.sin(t) * 0.6; },
      extra: { draw(ctx, x, y, k, t) { drawFigure(ctx, x - 5 * k, y, k, { color: '#f0c0c8', noShadow: true, rot: Math.sin(t) * 0.4, arms: 'forward' }); drawFigure(ctx, x + 5 * k, y + 2 * k, k, { color: '#c8b8e0', noShadow: true, rot: Math.sin(t) * 0.4 - 0.2, flip: true, arms: 'forward' }); drawGlow(ctx, x, y - 14 * k, 26 * k, 'rgba(255,170,190,0.25)'); } } });
    const famous = [['Sémiramis', 'Reine d\'Assyrie qui rendit la luxure licite par ses lois.'], ['Didon', 'Elle se tua par amour et rompit sa foi envers les cendres de Sichée.'], ['Cléopâtre', 'La reine d\'Égypte.'], ['Hélène', 'Pour qui tant d\'années de malheur s\'écoulèrent.'], ['Achille', 'Qui combattit par amour jusqu\'à la fin.'], ['Tristan', 'Le chevalier de la légende.']];
    famous.forEach(([n, d], q) => {
      const a0 = q * 1.1, r = 4.8;
      makeSoul(sc, C, C, { name: n, desc: d, fig: { arms: 'up', color: '#f2d6c0', noShadow: true },
        update(dt, t, e) { const a = a0 + t * 0.7; e.x = C + Math.cos(a) * r; e.y = C + Math.sin(a) * r; e.z = 5 + Math.sin(t + q) * 1.5; e.fig.rot = a + 1.4; } });
    });
    sc.add({ x: 13.5, y: 3.5, name: 'Minos', desc: 'Le juge horrible grince des dents. Il examine les fautes et ceint sa queue autour de lui autant de fois que l\'âme doit descendre de degrés.', hit: [30, 80],
      draw(ctx, x, y, k, t) {
        isoBox(ctx, x, y, k, 0.6, 0.6, 1.2, '#2a2024');
        drawFigure(ctx, x, y - 19 * k, k, { color: '#4d3a2c', skin: '#7a5a44', size: 2.1, pose: 'sit', alpha: 1, noShadow: true });
        ctx.strokeStyle = '#3d5a2a'; ctx.lineWidth = 4 * k; ctx.beginPath();
        for (let q = 0; q < 60; q++) { const a = q / 60 * TAU * 3 + t, r = (8 + q * 0.25) * k; const px = x + Math.cos(a) * r * 1.3, py = y - 26 * k + Math.sin(a) * r * 0.5; q ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
        ctx.stroke();
      } });
    addPoets(sc, 13, 12);
  }
};

// ===== Cercle III : Gourmandise =====
SCENES.gourmandise = {
  w: 16, h: 16, sky: ['#1f2522', '#0a0c0b'],
  particles: [{ type: 'rain', rate: 220, region: [0, 0, 16, 16] }, { type: 'hail', rate: 40, region: [0, 0, 16, 16] }],
  build(sc) {
    forTiles(sc, (i, j, t) => { const p = hash2(i * 3, j * 7) > 0.7; t.h = p ? 0.2 : 0.35 + hash2(i, j) * 0.2; t.c = p ? '#3a3a2c' : '#4a4634'; t.anim = 'mud'; });
    for (let n = 0; n < 30; n++) {
      let x = rand(0.5, 15.5), y = rand(0.5, 15.5);
      if (Math.hypot(x - 8, y - 8) < 2) x += 3;
      makeSoul(sc, x, y, { name: 'Glouton', desc: 'Couché dans la fange, sous la pluie éternelle, maudite, froide et lourde. Les damnés se tournent sans cesse d\'un flanc sur l\'autre.',
        fig: { pose: 'lie', writhe: true, color: '#b7ad98', flip: n % 2 === 0 }, update(dt, t, e) { e.phase = t * 2 + n; } });
    }
    makeSoul(sc, 11, 10, { name: 'Ciacco', desc: 'Florentin surnommé « le Pourceau ». Il se dresse pour prédire à Dante les luttes sanglantes qui déchireront Florence.', fig: { pose: 'sit', color: '#c2b8a4', arms: 'forward' } });
    sc.add({ x: 8, y: 8, name: 'Cerbère', desc: 'Bête cruelle et monstrueuse : trois gueules, yeux rouges, barbe grasse et noire, ventre large et griffes aux mains. Il écorche les esprits.', hit: [40, 60],
      draw(ctx, x, y, k, t) {
        ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(x, y, 30 * k, 10 * k, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#1e1714'; ctx.lineWidth = 6 * k; ctx.lineCap = 'round';
        for (const lx of [-18, -10, 10, 18]) { ctx.beginPath(); ctx.moveTo(x + lx * k, y - 18 * k); ctx.lineTo(x + lx * k, y - 2 * k); ctx.stroke(); }
        ctx.fillStyle = '#2b211c'; ctx.beginPath(); ctx.ellipse(x, y - 24 * k, 26 * k, 12 * k, 0, 0, TAU); ctx.fill();
        [-1, 0, 1].forEach((h, q) => {
          const hx = x + h * 16 * k, hy = y - 44 * k - (h === 0 ? 6 * k : 0) + Math.sin(t * 3 + q * 2) * 2 * k;
          ctx.strokeStyle = '#2b211c'; ctx.lineWidth = 9 * k; ctx.beginPath(); ctx.moveTo(x + h * 8 * k, y - 28 * k); ctx.lineTo(hx, hy); ctx.stroke();
          ctx.fillStyle = '#33271f'; ctx.beginPath(); ctx.ellipse(hx, hy, 9 * k, 7 * k, 0, 0, TAU); ctx.fill();
          ctx.beginPath(); ctx.ellipse(hx + h * 4 * k, hy + 4 * k, 7 * k, 4 * k, 0, 0, TAU); ctx.fill();
          const open = (Math.sin(t * 6 + q * 1.7) + 1) * 2 * k;
          ctx.fillStyle = '#7a0b0b'; ctx.fillRect(hx + h * 4 * k - 5 * k, hy + 5 * k, 10 * k, open);
          ctx.fillStyle = '#ff2a10'; ctx.beginPath(); ctx.arc(hx - 3 * k, hy - 2 * k, 1.6 * k, 0, TAU); ctx.arc(hx + 3 * k, hy - 2 * k, 1.6 * k, 0, TAU); ctx.fill();
          ctx.fillStyle = '#1a1210'; ctx.beginPath(); ctx.moveTo(hx - 7 * k, hy - 5 * k); ctx.lineTo(hx - 5 * k, hy - 12 * k); ctx.lineTo(hx - 2 * k, hy - 6 * k); ctx.moveTo(hx + 7 * k, hy - 5 * k); ctx.lineTo(hx + 5 * k, hy - 12 * k); ctx.lineTo(hx + 2 * k, hy - 6 * k); ctx.fill();
        });
      } });
    addPoets(sc, 3, 13);
  }
};

// ===== Cercle IV : Avarice et prodigalité =====
SCENES.avarice = {
  w: 16, h: 16, sky: ['#2b2618', '#0d0b06'],
  build(sc) {
    const C = 8;
    forTiles(sc, (i, j, t) => { const d = Math.hypot(i + 0.5 - C, j + 0.5 - C); t.h = 0.4 + hash2(i, j) * 0.1; t.c = Math.abs(d - 5) < 0.9 ? '#7d6b3c' : '#5f5434'; if (d < 1.5) { t.h = 1.2; t.c = '#6e5c2e'; } });
    const R = 5, N = 9;
    const half = (group, n) => {
      const sign = group ? 1 : -1;
      const pos = t => { const s = tri(t * 0.07); return -Math.PI / 2 + sign * (s * (Math.PI - 0.35) + 0.12 + n * 0.3); };
      // le poids
      const boulder = sc.add({ x: C, y: C, name: 'Le poids', desc: 'Un énorme fardeau poussé à force de poitrine.', hit: [12, 22],
        update(dt, t, e) { const s0 = tri(t * 0.07), s1 = tri((t + 0.1) * 0.07); const dir = Math.sign(s1 - s0) || 1; const a = pos(t) + sign * dir * 0.13; e.x = C + Math.cos(a) * R; e.y = C + Math.sin(a) * R; e.rot = (e.rot || 0) + dt * dir * 2; },
        draw(ctx, x, y, k, t, e) { ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(x, y, 11 * k, 4 * k, 0, 0, TAU); ctx.fill(); const g = ctx.createRadialGradient(x - 3 * k, y - 14 * k, 2 * k, x, y - 10 * k, 12 * k); g.addColorStop(0, group ? '#c9a94a' : '#9b9b9b'); g.addColorStop(1, group ? '#5a4614' : '#3a3a3a'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - 10 * k, 11 * k, 0, TAU); ctx.fill(); } });
      makeSoul(sc, C, C, { name: group ? 'Prodigue' : 'Avare', desc: group ? 'Il a dilapidé ses biens. Il crie : « Pourquoi jettes-tu ? » en heurtant les avares.' : 'Clerc tonsuré, pape ou cardinal, rongé par l\'avarice. Il crie : « Pourquoi gardes-tu ? »',
        fig: { pose: 'walk', lean: 4, color: group ? '#c8b98e' : '#a7a7a0', hood: group ? undefined : '#6a6a64' },
        update(dt, t, e) { const a = pos(t); e.x = C + Math.cos(a) * R; e.y = C + Math.sin(a) * R; const s0 = tri(t * 0.07), s1 = tri((t + 0.1) * 0.07); const dir = (Math.sign(s1 - s0) || 1) * sign; const dx = -Math.sin(a) * dir, dy = Math.cos(a) * dir; e.fig.flip = (dx - dy) < 0; e.phase = t * 6; } });
      return boulder;
    };
    for (let n = 0; n < N; n++) { half(0, n); half(1, n); }
    sc.add({ x: C, y: C, name: 'Plutus', desc: '« Pape Satàn, pape Satàn aleppe ! » glousse Plutus, le « maudit loup », gardien du quatrième cercle.', hit: [20, 50],
      draw(ctx, x, y, k, t) {
        drawFigure(ctx, x, y, k, { color: '#4d3d1e', skin: '#6a5a3a', size: 1.7, arms: 'up', phase: t, alpha: 1 });
        ctx.fillStyle = '#6a5a3a'; ctx.beginPath(); ctx.moveTo(x - 4 * k, y - 52 * k); ctx.lineTo(x + 10 * k, y - 48 * k); ctx.lineTo(x, y - 44 * k); ctx.fill();
        ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.arc(x + 2 * k, y - 50 * k, 1.4 * k, 0, TAU); ctx.fill();
        for (let q = 0; q < 6; q++) { ctx.fillStyle = '#e2b93b'; ctx.beginPath(); ctx.ellipse(x - 14 * k + q * 5 * k, y + 2 * k - (q % 2) * 2 * k, 3 * k, 1.4 * k, 0, 0, TAU); ctx.fill(); }
      } });
    addPoets(sc, 13.5, 13.5);
  }
};

// ===== Cercle V : Colère et acédie (le Styx) =====
SCENES.colere = {
  w: 16, h: 16, sky: ['#1a1f26', '#06080a'],
  particles: [{ type: 'bubble', rate: 30, region: [3, 3, 16, 16], color: 'rgba(120,150,130,0.7)' }],
  build(sc) {
    forTiles(sc, (i, j, t) => {
      t.h = 0.25; t.c = '#2a3632'; t.anim = 'water';
      if (hash2(i * 2, j * 5) > 0.82) { t.h = 0.45; t.c = '#3a3326'; t.anim = 'mud'; }
      if (i < 2 || j < 2) { t.h = 6 + (i + j) % 2 * 1.5; t.c = '#5a1e18'; t.side = '#4a1612'; t.anim = undefined;
        t.deco = (ctx, S, i2, j2, top, tt, nn) => { if (nn > 0.5) { const p = S(i2 + 0.5, j2 + 0.5, top); drawGlow(ctx, p[0], p[1], 18 * kFromS(S), `rgba(255,90,30,${0.35 + Math.sin(tt * 3 + nn * 9) * 0.15})`); } }; }
    });
    // pairs de coléreux qui se battent
    for (let n = 0; n < 12; n++) {
      const x = 3 + hash2(n, 1) * 12, y = 3 + hash2(n, 2) * 12;
      for (const side of [-1, 1]) {
        makeSoul(sc, x + side * 0.25, y - side * 0.25, { name: 'Coléreux', desc: 'Nu dans la vase du Styx, il frappe avec les mains, la tête, la poitrine et les pieds, et déchire les autres à belles dents.',
          fig: { pose: 'stand', arms: 'fight', sink: 0.35, color: '#9a8a7a', flip: side < 0 },
          update(dt, t, e) { e.phase = t * 3 + n; e.dz = Math.abs(Math.sin(t * 5 + n)) * 0.25; } });
      }
    }
    sc.add({ x: 9, y: 9, name: 'Phlégyas', desc: '« Te voilà, âme félonne ! » Le passeur du Styx conduit Dante et Virgile vers la cité de Dité.', hit: [30, 50],
      update(dt, t, e) { e.x = 6 + tri(t * 0.04) * 8; e.y = 13 - tri(t * 0.04) * 8; }, draw(ctx, x, y, k, t) { drawBoat(ctx, x, y, k, t, { color: '#4a2e22', robe: '#3a2418', skin: '#a07858' }); } });
    makeSoul(sc, 11, 7, { name: 'Filippo Argenti', desc: 'Le Florentin coléreux tend les mains vers la barque ; les autres damnés se jettent sur lui en criant « Sus à Filippo Argenti ! ».', fig: { arms: 'up', sink: 0.45, color: '#8a7a6a' }, update(dt, t, e) { e.phase = t * 4; } });
    sc.add({ x: 0.6, y: 0.6, name: 'La cité de Dité', desc: 'Murailles de fer rougies par le feu éternel, gardées par plus de mille démons tombés du ciel et par les trois Furies.', hit: [80, 120], draw() {} });
    addPoets(sc, 13.5, 13.5);
  }
};

// ===== Cercle VI : Hérésie =====
SCENES.heresie = {
  w: 16, h: 16, sky: ['#2a0e08', '#0a0302'],
  particles: [],
  build(sc) {
    forTiles(sc, (i, j, t) => { t.h = 0.4 + hash2(i, j) * 0.1; t.c = '#4a2a20'; if (i < 1 || j < 1) { t.h = 5; t.c = '#5a1e18'; } });
    const tombs = [];
    for (let i = 2; i < 15; i += 3) for (let j = 2; j < 15; j += 3) tombs.push([i + 0.5 + (hash2(i, j) - 0.5) * 0.6, j + 0.5 + (hash2(j, i) - 0.5) * 0.6]);
    tombs.forEach(([x, y], q) => {
      const named = q === 12 ? ['Farinata degli Uberti', 'Chef gibelin. Il se dresse « de la ceinture en haut », hautain, « comme s\'il avait l\'Enfer en grand mépris ».'] : q === 7 ? ['Cavalcante dei Cavalcanti', 'Père de Guido, l\'ami de Dante : il se soulève à genoux et demande où est son fils.'] : q === 3 ? ['Frédéric II', 'L\'empereur, parmi plus de mille hérétiques.'] : null;
      sc.emitters.push({ type: 'ember', rate: 5, region: [x - 0.3, y - 0.3, x + 0.3, y + 0.3], z: 1.3 });
      sc.add({ x, y, name: named ? named[0] : 'Tombeau ardent', desc: named ? named[1] : 'Les hérétiques et leurs disciples sont ensevelis par secte ; les tombeaux sont plus ou moins brûlants.', hit: [26, 50], seed: q * 1.7,
        draw(ctx, sx, sy, k, t, e) {
          drawGlow(ctx, sx, sy - 10 * k, 40 * k, 'rgba(255,90,20,0.35)');
          isoBox(ctx, sx, sy, k, 0.45, 0.32, 1, '#6b5e55', 0, '#2a0a02');
          // flammes à l'intérieur
          drawFlame(ctx, sx - 6 * k, sy - 14 * k, k, t, 0.8, e.seed); drawFlame(ctx, sx + 6 * k, sy - 16 * k, k, t, 0.9, e.seed + 2);
          if (named) drawFigure(ctx, sx, sy - 12 * k, k, { color: '#c9b8a0', noShadow: true, arms: q === 12 ? 'down' : 'up', alpha: 1, phase: t });
          else if (q % 3 === 0) { ctx.save(); ctx.globalAlpha = 0.7; ctx.strokeStyle = '#c9b8a0'; ctx.lineWidth = 2 * k; ctx.beginPath(); ctx.moveTo(sx, sy - 16 * k); ctx.lineTo(sx + Math.sin(t * 3 + q) * 4 * k, sy - 26 * k); ctx.stroke(); ctx.restore(); }
          // couvercle soulevé
          ctx.save(); ctx.translate(sx + 20 * k, sy - 6 * k); ctx.rotate(-0.5);
          ctx.fillStyle = '#7a6c62'; ctx.fillRect(-4 * k, -22 * k, 8 * k, 26 * k); ctx.restore();
        } });
    });
    // les Furies sur les murailles
    ['Mégère', 'Alecto', 'Tisiphone'].forEach((n, q) => sc.add({ x: 0.5, y: 4 + q * 4, name: n, desc: 'L\'une des trois Furies, teintes de sang, ceintes d\'hydres vertes, des serpents pour cheveux.', hit: [12, 36],
      draw(ctx, x, y, k, t) { drawFigure(ctx, x, y, k, { color: '#5a1a1a', skin: '#9a6a5a', arms: 'up', phase: t + q, alpha: 1 }); for (let s = 0; s < 4; s++) drawSnake(ctx, x - 6 * k + s * 4 * k, y - 32 * k - s % 2 * 2 * k, k * 0.35, t, s + q); } }));
    addPoets(sc, 13.5, 13.5);
  }
};

// ===== Cercle VII : Violence =====
SCENES.violence = {
  w: 18, h: 14, sky: ['#2a0a08', '#080202'],
  particles: [{ type: 'fire', rate: 40, region: [12, 0, 18, 14] }, { type: 'bubble', rate: 25, region: [1, 0, 5, 14], color: 'rgba(255,120,100,0.7)' }],
  build(sc) {
    forTiles(sc, (i, j, t) => {
      if (i === 0 || i === 5) { t.h = 0.8; t.c = '#4a2a22'; }
      else if (i < 5) { t.h = 0.3; t.c = '#8a1010'; t.anim = 'blood'; }
      else if (i < 12) { t.h = 0.6 + hash2(i, j) * 0.15; t.c = '#2e2a22'; }
      else { t.h = 0.5; t.c = '#b8823a'; t.anim = 'sand'; }
    });
    // 1er giron : Phlégéthon
    for (let n = 0; n < 18; n++) {
      const deep = hash2(n, 4);
      makeSoul(sc, 1.3 + hash2(n, 1) * 3.4, 0.5 + hash2(n, 2) * 13, { name: deep > 0.7 ? 'Tyran' : 'Meurtrier', desc: deep > 0.7 ? 'Tyran plongé jusqu\'aux sourcils dans le sang bouillant : Alexandre, Denys de Syracuse, Attila…' : 'Homicide ou brigand, plongé dans le Phlégéthon jusqu\'à la gorge ou à la poitrine.',
        fig: { sink: 0.5 + deep * 0.4, color: '#c8a090', arms: deep > 0.7 ? 'down' : 'up' }, update(dt, t, e) { e.phase = t * 3 + n; } });
    }
    for (let n = 0; n < 3; n++) sc.add({ x: 5.5, y: 2 + n * 4, name: n === 0 ? 'Chiron' : n === 1 ? 'Nessus' : 'Pholus', desc: 'Les Centaures courent par milliers autour du fleuve, criblant de flèches les âmes qui sortent du sang plus que leur faute ne le permet.', hit: [20, 36], phase: 0,
      update(dt, t, e) { const p = tri(t * 0.04 + n * 0.3); const ny = 1 + p * 12; e.dir = ny > (e.y ?? ny) ? 1 : -1; e.y = ny; e.phase = t * 8; }, draw(ctx, x, y, k, t, e) { drawCentaur(ctx, x, y, k, t, e.dir > 0, e.phase); } });
    sc.add({ x: 6.2, y: 0.6, name: 'Le Minotaure', desc: 'L\'« infamie de Crète », né de la fausse vache : en voyant les poètes il se mord lui-même, fou de rage.', hit: [20, 50],
      draw(ctx, x, y, k, t) { drawFigure(ctx, x, y, k, { color: '#4a3020', skin: '#3a2416', size: 1.6, arms: 'fight', phase: t, alpha: 1 }); ctx.strokeStyle = '#e8dcc0'; ctx.lineWidth = 2.5 * k; ctx.beginPath(); ctx.moveTo(x - 5 * k, y - 50 * k); ctx.quadraticCurveTo(x - 12 * k, y - 54 * k, x - 10 * k, y - 62 * k); ctx.moveTo(x + 5 * k, y - 50 * k); ctx.quadraticCurveTo(x + 12 * k, y - 54 * k, x + 10 * k, y - 62 * k); ctx.stroke(); } });
    // 2e giron : forêt des suicidés
    const trees = [];
    for (let i = 6; i < 12; i++) for (let j = 0; j < 14; j++) if (hash2(i * 5, j * 3) > 0.55) trees.push([i + 0.5, j + 0.5]);
    trees.forEach(([x, y], q) => sc.add({ x, y, name: q === 4 ? 'Pier della Vigna' : 'Arbre-suicidé', desc: q === 4 ? 'Chancelier de Frédéric II. Quand Dante brise un rameau, le tronc saigne et crie : « Pourquoi me déchires-tu ? »' : 'Une âme qui s\'est arraché la vie, jetée par Minos dans la forêt où elle germe comme un grain d\'épeautre. Les Harpies dévorent ses feuilles.', hit: [16, 50],
      draw(ctx, sx, sy, k, t) { drawTree(ctx, sx, sy, k, q * 3.1); if (q % 3 === 0) { drawHarpy(ctx, sx + 6 * k, sy - 40 * k, k, t, q); } if (q === 4) { ctx.fillStyle = '#9a0a0a'; ctx.fillRect(sx + 4 * k, sy - 30 * k, 2 * k, 6 * k + Math.sin(t * 2) * 2 * k); } } }));
    // dissipateurs poursuivis par les chiennes
    const path = (t, off) => { const a = t * 0.6 - off; return [9 + Math.cos(a) * 2.4, 7 + Math.sin(a) * 5.5, a]; };
    makeSoul(sc, 9, 7, { name: 'Dissipateur', desc: 'Lano de Sienne et Jacopo da Sant\'Andrea fuient, nus et griffés, poursuivis par des chiennes noires qui les mettent en pièces.', fig: { pose: 'run', color: '#c9b8a0' },
      update(dt, t, e) { const [x, y, a] = path(t, 0); e.x = x; e.y = y; e.phase = t * 16; e.fig.flip = (-Math.sin(a) * 2.4 - Math.cos(a) * 5.5) < 0; } });
    for (let n = 0; n < 3; n++) sc.add({ x: 9, y: 7, name: 'Chienne noire', desc: 'Avide et rapide comme un lévrier détaché.', hit: [14, 16],
      update(dt, t, e) { const [x, y, a] = path(t, 0.35 + n * 0.12); e.x = x; e.y = y; e.flip = (-Math.sin(a) * 2.4 - Math.cos(a) * 5.5) < 0; e.ph = t * 18 + n; },
      draw(ctx, x, y, k, t, e) { ctx.save(); if (e.flip) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); } ctx.strokeStyle = '#111'; ctx.lineWidth = 2 * k; for (const lx of [-6, -3, 4, 7]) { ctx.beginPath(); ctx.moveTo(x + lx * k, y - 7 * k); ctx.lineTo(x + lx * k + Math.sin(e.ph + lx) * 2 * k, y); ctx.stroke(); } ctx.fillStyle = '#121010'; ctx.beginPath(); ctx.ellipse(x, y - 9 * k, 9 * k, 3.5 * k, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(x + 10 * k, y - 12 * k, 4 * k, 3 * k, -0.3, 0, TAU); ctx.fill(); ctx.fillStyle = '#ff3010'; ctx.fillRect(x + 11 * k, y - 13 * k, 1.2 * k, 1.2 * k); ctx.restore(); } });
    // 3e giron : désert de sable brûlant
    for (let n = 0; n < 24; n++) {
      const kind = n % 3, x = 12.5 + hash2(n, 7) * 5, y = 0.5 + hash2(n, 8) * 13;
      const fig = kind === 0 ? { pose: 'lie', writhe: true, color: '#d0a888' } : kind === 1 ? { pose: 'run', color: '#d0a888' } : { pose: 'sit', color: '#c8a080', arms: 'scratch' };
      const desc = ['Blasphémateur couché sur le dos, face au ciel qui le brûle.', 'Violent contre la nature : il court sans jamais s\'arrêter sous la pluie de feu (Brunetto Latini est parmi eux).', 'Usurier assis, les yeux fixés sur la bourse armoriée pendue à son cou ; ses mains chassent les flammes comme un chien les mouches.'][kind];
      makeSoul(sc, x, y, { name: ['Blasphémateur', 'Violent contre nature', 'Usurier'][kind], desc, fig,
        update: kind === 1 ? wanderer(12.3, 0.3, 17.7, 13.7, 1.2) : (dt, t, e) => { e.phase = t * 4 + n; },
        extra: kind === 2 ? { draw(ctx, x, y, k, t, e) { drawFigure(ctx, x, y, k, Object.assign(e.fig, { phase: t * 4 + n })); ctx.fillStyle = ['#d4af37', '#2a5caa', '#c0392b'][n % 3]; ctx.fillRect(x - 2.5 * k, y - 12 * k, 5 * k, 5 * k); } } : undefined });
    }
    makeSoul(sc, 15, 6.5, { name: 'Capanée', desc: 'L\'un des sept rois contre Thèbes. Couché, dédaigneux, il défie encore Jupiter : « Tel je fus vivant, tel je suis mort. »', fig: { pose: 'lie', color: '#e0b090', size: 1.3 } });
    addPoets(sc, 6.5, 12.5);
  }
};

// ===== Cercle VIII : Malebolge =====
const BOLGE_COLORS = ['#4a4448', '#4a3a1a', '#4a4448', '#4a4448', '#111014', '#4a4448', '#4a4448', '#4a4448', '#4a4448', '#3e4a32'];
SCENES.fraude = {
  w: 21, h: 12, sky: ['#1a181e', '#060508'],
  particles: [{ type: 'bubble', rate: 14, region: [9, 0, 10, 12], color: 'rgba(200,200,200,0.5)' }, { type: 'smoke', rate: 8, region: [19, 0, 20, 12] }],
  build(sc) {
    forTiles(sc, (i, j, t) => {
      if (i % 2 === 0) { t.h = 0.9; t.c = '#5e5866'; }
      else {
        const b = (i - 1) / 2; t.h = 0.2; t.c = BOLGE_COLORS[b];
        if (b === 1) { t.h = 0.5; t.anim = 'mud'; }
        if (b === 4) { t.h = 0.5; t.anim = 'pitch'; }
      }
    });
    // ponts rocheux
    for (let b = 0; b < 10; b++) sc.add({ x: 2 * b + 1.5, y: 4.5, z: 0.9, keyBias: 0.3, draw(ctx, x, y, k) { isoBox(ctx, x, y, k, 0.55, 0.35, 0.35, '#6a6472', -0.1); } });
    const D = CERCLES.find(c => c.id === 'fraude').subdivisions;
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    for (let b = 0; b < 10; b++) {
      const X = 2 * b + 1.5;
      sc.add({ x: X, y: 11.7, name: D[b].nom, desc: D[b].chatiment, hit: [10, 14], draw(ctx, x, y, k) { ctx.fillStyle = '#d8c48a'; ctx.font = `bold ${8 * k}px Cinzel, serif`; ctx.textAlign = 'center'; ctx.fillText(roman[b], x, y + 4 * k); ctx.textAlign = 'left'; } });
      const walkY = (n, sp, off) => (dt, t, e) => { const p = ((t * sp + off) % 12 + 12) % 12; e.y = sp > 0 ? p : p; e.phase = t * 8; e.fig.flip = sp > 0; };
      for (let n = 0; n < 5; n++) {
        const y0 = n * 2.3 + 0.6, title = D[b].nom.split(' : ')[1];
        const nm = title.charAt(0).toUpperCase() + title.slice(1);
        const base = { name: nm, desc: D[b].chatiment };
        switch (b) {
          case 0: makeSoul(sc, X + (n % 2 ? 0.2 : -0.2), y0, Object.assign(base, { fig: { pose: 'walk', color: '#c9b9a8' }, update: walkY(n, n % 2 ? 0.6 : -0.6, y0) })); break;
          case 1: makeSoul(sc, X + (hash2(n, b) - 0.5) * 0.5, y0, Object.assign(base, { fig: { sink: 0.65, color: '#8a7050', arms: 'up' }, update(dt, t, e) { e.phase = t * 3 + n; } })); break;
          case 2: makeSoul(sc, X, y0, Object.assign(base, { fig: { pose: 'legs', color: '#c9b9a8' }, update(dt, t, e) { e.phase = t * 6 + n; }, extra: { draw(ctx, x, y, k, t, e) { ctx.fillStyle = '#111'; ctx.beginPath(); ctx.ellipse(x, y, 6 * k, 2.5 * k, 0, 0, TAU); ctx.fill(); drawFigure(ctx, x, y, k, Object.assign(e.fig, { phase: t * 6 + n })); drawFlame(ctx, x - 3 * k, y - 12 * k, k, t, 0.35, n); drawFlame(ctx, x + 3 * k, y - 12 * k, k, t, 0.35, n + 1); } } })); break;
          case 3: makeSoul(sc, X, y0, Object.assign(base, { name: n === 0 ? 'Tirésias' : nm, fig: { pose: 'walk', headBack: true, color: '#b8b0c0' }, update: (dt, t, e) => { e.y = ((y0 + t * 0.25) % 12); e.phase = t * 3; e.fig.flip = false; } })); break;
          case 4: makeSoul(sc, X + (hash2(n, 4) - 0.5) * 0.4, y0, Object.assign(base, { fig: { sink: 0.6 + Math.sin(n) * 0.2, color: '#2a2a2a', skin: '#3a3a3a', arms: 'up' }, update(dt, t, e) { e.fig.sink = 0.55 + Math.sin(t * 1.5 + n) * 0.35; e.phase = t * 4; } })); break;
          case 5: makeSoul(sc, X, y0, Object.assign(base, { fig: { pose: 'walk', cloak: '#c9a227', color: '#c9a227' }, update: (dt, t, e) => { e.y = ((y0 + t * 0.12) % 12); e.phase = t; } })); break;
          case 6: makeSoul(sc, X + (n % 2 ? 0.2 : -0.2), y0, Object.assign(base, { name: n === 2 ? 'Vanni Fucci' : nm, fig: { pose: 'run', color: '#b0a890' }, update: walkY(n, n % 2 ? 1.2 : -0.9, y0), extra: { draw(ctx, x, y, k, t, e) { const burn = Math.sin(t * 0.7 + n * 2) > 0.85; drawFigure(ctx, x, y, k, Object.assign(e.fig, { alpha: burn ? 0.3 : 0.92 })); if (burn) drawFlame(ctx, x, y, k, t, 1.1, n); drawSnake(ctx, x + 2 * k, y - 16 * k, k * 0.8, t, n); } } })); break;
          case 7: sc.add({ x: X, y: y0, name: n === 1 ? 'Ulysse et Diomède' : 'Conseiller perfide', desc: n === 1 ? 'La flamme à deux cornes : Ulysse raconte son dernier voyage au-delà des colonnes d\'Hercule.' : D[b].chatiment, hit: [10, 32],
            update(dt, t, e) { e.y = (y0 + t * 0.2) % 12; }, draw(ctx, x, y, k, t) { drawGlow(ctx, x, y - 12 * k, 26 * k, 'rgba(255,140,40,0.3)'); if (n === 1) { drawFlame(ctx, x - 4 * k, y, k, t, 1.1, n); drawFlame(ctx, x + 4 * k, y, k, t, 0.9, n + 3); } else drawFlame(ctx, x, y, k, t, 1.1, n); } }); break;
          case 8: makeSoul(sc, X, y0, Object.assign(base, { name: n === 3 ? 'Bertran de Born' : nm, fig: { pose: 'walk', split: true, color: '#c9b0a0', noHead: n === 3, carryHead: n === 3 }, update: walkY(n, 0.5, y0) })); break;
          case 9: makeSoul(sc, X + (n % 2 ? 0.2 : -0.2), y0, Object.assign(base, { name: n === 1 ? 'Maître Adam' : nm, fig: n % 2 ? { pose: 'lie', color: '#9aa070', writhe: true } : { pose: 'sit', arms: 'scratch', spots: true, color: '#a8a880' }, update(dt, t, e) { e.phase = t * 3 + n; } })); break;
        }
      }
    }
    // démons fouetteurs et Malebranche
    sc.add({ x: 0.5, y: 3, name: 'Démon cornu', desc: 'Il fouette les ruffians « sur les reins », les faisant lever les talons dès le premier coup.', hit: [14, 40], draw(ctx, x, y, k, t) { drawDemon(ctx, x, y, k, t, { tool: 'whip' }); } });
    ['Malacoda', 'Scarmiglione', 'Barbariccia'].forEach((n, q) => sc.add({ x: q % 2 ? 10.5 : 8.5, y: 2 + q * 3.5, name: n, desc: 'L\'un des Malebranche, les démons aux crocs qui harponnent les prévaricateurs dans la poix.', hit: [14, 40], draw(ctx, x, y, k, t) { drawDemon(ctx, x, y, k, t, { tool: 'hook', phase: q, flip: q % 2 === 1 }); } }));
    sc.add({ x: 16.5, y: 8, name: 'Démon à l\'épée', desc: 'Il fend les semeurs de discorde au fil de l\'épée, chaque fois qu\'ils achèvent le tour de la fosse.', hit: [14, 40], draw(ctx, x, y, k, t) { drawDemon(ctx, x, y, k, t, { tool: 'sword' }); } });
    sc.add({ x: 11.5, y: 6, name: 'Caïphe', desc: 'Le grand prêtre qui conseilla de sacrifier un seul homme pour le peuple : crucifié au sol par trois pieux, il est piétiné par tous les hypocrites.', hit: [16, 12], keyBias: -0.4,
      draw(ctx, x, y, k) { ctx.strokeStyle = '#4a3020'; ctx.lineWidth = 2 * k; ctx.beginPath(); ctx.moveTo(x - 12 * k, y); ctx.lineTo(x + 12 * k, y); ctx.moveTo(x, y - 5 * k); ctx.lineTo(x, y + 5 * k); ctx.stroke(); drawFigure(ctx, x, y, k, { pose: 'lie', color: '#c9b8a0' }); } });
    sc.add({ x: 3, y: -1.5, z: 7, name: 'Géryon', desc: 'L\'image de la fraude : visage d\'homme juste, corps de serpent bariolé, pattes velues et queue fourchue de scorpion. Il porte les poètes jusqu\'à Malebolge.', hit: [50, 40],
      update(dt, t, e) { e.x = 3 + Math.sin(t * 0.3) * 4; e.z = 7 + Math.sin(t) * 0.5; },
      draw(ctx, x, y, k, t) {
        ctx.strokeStyle = '#6a5a2a'; ctx.lineWidth = 9 * k; ctx.lineCap = 'round'; ctx.beginPath();
        for (let q = 0; q <= 20; q++) { const px = x - 50 * k + q * 4 * k, py = y + Math.sin(q * 0.6 + t * 3) * 6 * k; q ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke();
        ctx.strokeStyle = '#a08a3a'; ctx.lineWidth = 2 * k; ctx.setLineDash([3 * k, 4 * k]); ctx.stroke(); ctx.setLineDash([]);
        ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 3 * k; ctx.beginPath(); ctx.moveTo(x - 50 * k, y); ctx.lineTo(x - 60 * k, y - 10 * k); ctx.lineTo(x - 56 * k, y - 16 * k); ctx.stroke();
        ctx.fillStyle = '#e2c8a0'; ctx.beginPath(); ctx.arc(x + 32 * k, y - 2 * k, 6 * k, 0, TAU); ctx.fill();
        ctx.fillStyle = '#5a4a3a'; ctx.beginPath(); ctx.ellipse(x + 30 * k, y - 8 * k, 6 * k, 3 * k, 0, 0, TAU); ctx.fill();
      } });
    addPoets(sc, 0.5, 9);
  }
};

// ===== Cercle IX : Cocyte =====
SCENES.trahison = {
  w: 18, h: 18, sky: ['#1c2a36', '#05090d'],
  particles: [{ type: 'snow', rate: 50, region: [0, 0, 18, 18] }],
  build(sc) {
    const C = 9;
    const zone = (x, y) => { const d = Math.hypot(x - C, y - C); return d > 7 ? 0 : d > 5 ? 1 : d > 3 ? 2 : 3; };
    forTiles(sc, (i, j, t) => {
      const d = Math.hypot(i + 0.5 - C, j + 0.5 - C);
      t.h = 0.3; t.anim = 'ice'; t.c = ['#a9c6dc', '#9dbdd6', '#8fb2cf', '#7ea5c6'][zone(i + 0.5, j + 0.5)];
      if (d > 8.6) { t.h = i + j < 18 ? 2.5 + hash2(i, j) : 0.7; t.c = '#3e4650'; t.anim = undefined; }
      if (zone(i + 0.5, j + 0.5) === 3 && d > 1.6 && hash2(i * 7, j * 3) > 0.35) {
        const seed = hash2(i, j * 11);
        t.deco = (ctx, S, i2, j2, top, tt) => { const p = S(i2 + 0.5, j2 + 0.5, top); drawFigure(ctx, p[0], p[1] + 6, kFromS(S) * 0.8, { color: '#5f86a8', alpha: 0.45, noShadow: true, rot: seed * TAU }); };
      }
    });
    for (let n = 0; n < 44; n++) {
      let x, y, z; do { x = rand(1, 17); y = rand(1, 17); z = zone(x, y); } while (z === 3 || Math.hypot(x - C, y - C) > 8.3);
      const names = ['Traître à ses parents', 'Traître à sa patrie', 'Traître à ses hôtes'];
      const descs = ['Caïne : pris jusqu\'au cou, il baisse le visage ; ses larmes gèlent et lui scellent les yeux.', 'Anténora : la tête hors de la glace, il claque des dents comme une cigogne.', 'Ptolomée : couché sur le dos, ses larmes forment une visière de cristal sur ses orbites.'];
      makeSoul(sc, x, y, { name: names[z], desc: descs[z], fig: z === 2 ? { pose: 'lie', color: '#e4ecf2', size: 1.2, noShadow: true } : { sink: z === 0 ? 0.62 : 0.55, color: '#e4ecf2', size: 1.25, lean: z === 0 ? 3 : 0 }, update(dt, t, e) { e.dz = Math.sin(t * 30 + n) * 0.02; } });
    }
    sc.add({ x: 13.6, y: 8.2, name: 'Ugolin et Ruggieri', desc: 'Le comte Ugolin, emmuré avec ses enfants dans la tour de la Faim, ronge pour l\'éternité le crâne de l\'archevêque Ruggieri qui l\'avait trahi.', hit: [16, 24],
      draw(ctx, x, y, k, t) { drawFigure(ctx, x + 4 * k, y, k, { sink: 0.6, color: '#d8e2ea', size: 1.25 }); drawFigure(ctx, x - 4 * k, y - 2 * k + Math.sin(t * 5) * 1 * k, k, { sink: 0.5, color: '#e8d8c4', size: 1.25, lean: 3 }); ctx.fillStyle = 'rgba(150,0,0,0.6)'; ctx.fillRect(x - 1 * k, y - 8 * k, 3 * k, 2 * k); } });
    sc.add({ x: C, y: C, name: 'Lucifer', desc: '« L\'empereur du royaume douloureux », pris dans la glace jusqu\'à mi-poitrine. Trois faces : rouge, jaunâtre, noire. Ses six ailes de chauve-souris soufflent le vent qui gèle le Cocyte. Il broie Judas (tête dans la gueule centrale), Brutus et Cassius.', hit: [100, 200], keyBias: 0.2,
      draw(ctx, x, y, k, t) { drawGlow(ctx, x, y - 60 * k, 140 * k, 'rgba(120,170,220,0.12)'); drawLucifer(ctx, x, y, k * 1.5, t); ctx.fillStyle = 'rgba(200,225,240,0.75)'; ctx.beginPath(); ctx.ellipse(x, y, 66 * k, 20 * k, 0, 0, TAU); ctx.fill(); } });
    [['Nemrod', 1.2, 4, true], ['Éphialte', 3.5, 1.2, false], ['Antée', 6.5, 0.8, false]].forEach(([n, x, y, horn]) => sc.add({ x, y, z: 3, name: n, desc: n === 'Nemrod' ? '« Raphèl maì amèche zabì almi ! » Le bâtisseur de Babel, cor de chasse au cou, ne parle aucune langue compréhensible.' : n === 'Éphialte' ? 'Géant qui défia Jupiter : enchaîné, un bras devant, un bras derrière.' : 'Le seul géant non enchaîné : il dépose Dante et Virgile au fond du puits, sur le Cocyte.', hit: [30, 130],
      draw(ctx, sx, sy, k, t) { drawGiant(ctx, sx, sy, k, t, { horn, color: n === 'Antée' ? '#6a5848' : '#5a5050' }); } }));
    addPoets(sc, 13, 12);
  }
};
