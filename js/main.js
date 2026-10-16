// Interface : Enfer et Paradis, vues d'ensemble, navigation entre cercles et cieux, panneau et infobulles.
(() => {
  const canvas = document.getElementById('view');
  const ctx = canvas.getContext('2d');
  const tooltip = document.getElementById('tooltip');
  const nav = document.getElementById('nav');
  const panel = document.getElementById('panel');

  let current = -1;      // -1 = vue d'ensemble
  let scene = null;
  let cam = { scale: 1, ox: 0, oy: 0 };
  let cw = 0, ch = 0;
  let mouse = { x: -1, y: -1, inside: false };
  let hoverRing = -1;
  let overT = 0;
  const keys = new Set();
  let clickTarget = null;           // destination d'un clic dans la scène
  const rencontres = {};            // id du cercle -> Set des noms rencontrés
  const hud = document.getElementById('hud');
  const encounter = document.getElementById('encounter');
  let lastNear = null;
  let realm = 'enfer';
  const R = () => REALMS[realm];

  // ---------- Navigation ----------
  function buildNav() {
    nav.innerHTML = '';
    const items = [{ label: 'Vue d\'ensemble', small: R().overviewLabel, color: R().accent }].concat(R().data.map(c => ({ label: c.nom, small: c.numero, color: c.couleur })));
    items.forEach((it, q) => {
      const b = document.createElement('button');
      b.innerHTML = `<small>${it.small}</small><span class="dot" style="background:${it.color}"></span>${it.label}`;
      b.onclick = () => go(q - 1);
      nav.appendChild(b);
    });
  }

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function renderPanel() {
    panel.innerHTML = current < 0 ? R().intro : R().panel(R().data[current]);
  }

  const INTRO_ENFER = `
        <div class="num">LA DIVINE COMÉDIE · CHANTS I À XXXIV</div>
        <h2>L'Inferno</h2>
        <h3>Le voyage</h3>
        <p>« Au milieu du chemin de notre vie, je me retrouvai par une forêt obscure… » Égaré la nuit du Vendredi saint de l'an 1300, Dante Alighieri est guidé par le poète Virgile à travers l'Enfer, gouffre en forme d'entonnoir creusé jusqu'au centre de la Terre par la chute de Lucifer.</p>
        <h3>La structure</h3>
        <p>Après un vestibule, neuf cercles concentriques descendent vers le fond. Plus on descend, plus la faute est grave : d'abord l'incontinence (cercles II à V), puis, derrière les murs de la cité de Dité, la violence (VII) et la fraude (VIII et IX).</p>
        <h3>Le contrapasso</h3>
        <p>Chaque peine reflète le péché, par analogie ou par contraste : c'est la loi du « contre-passement », la justice divine qui rend à chacun selon ses œuvres.</p>
        <h3>Explorer</h3>
        <p>Cliquez sur un anneau de l'entonnoir ou choisissez un cercle à gauche. Dans chaque cercle, déplacez Dante (robe rouge) et approchez les âmes pour lire leur histoire. Virgile (robe grise) vous suit.</p>`;

  const INTRO_PARADIS = `
        <div class="num">LA DIVINE COMÉDIE · PARADIS, CHANTS I À XXXIII</div>
        <h2>Le Paradiso</h2>
        <h3>L'ascension</h3>
        <p>Au sommet de la montagne du Purgatoire, le jour de Pâques 1300, Dante fixe Béatrice qui fixe le soleil, et s'élève avec elle à travers les cieux, attiré par Dieu comme le feu monte vers le haut. Virgile, païen, n'a pu aller plus loin.</p>
        <h3>La structure</h3>
        <p>Le Paradis suit le système de Ptolémée : neuf sphères tournent autour de la Terre (la Lune, Mercure, Vénus, le Soleil, Mars, Jupiter, Saturne, les Étoiles fixes et le Premier Mobile), mues par les neuf chœurs des anges. Au-delà, hors du temps et de l'espace, l'Empyrée, demeure de Dieu et de tous les bienheureux.</p>
        <h3>Les degrés de la béatitude</h3>
        <p>Toutes les âmes vivent dans l'Empyrée, mais elles viennent à la rencontre de Dante dans la sphère qui correspond à leur degré de gloire. Chacune est parfaitement heureuse : « En sa volonté est notre paix. » Plus on monte, plus la lumière, la musique et le sourire de Béatrice s'intensifient.</p>
        <h3>Explorer</h3>
        <p>Cliquez sur une sphère ou choisissez un ciel à gauche. Dans chaque ciel, déplacez Dante et approchez les lumières : chacune cache une âme. Béatrice vous guide, puis saint Bernard dans l'Empyrée.</p>`;

  function panelEnfer(c) {
    let subs = '';
    if (c.subdivisions) subs = `<h3>Subdivisions</h3>` + c.subdivisions.map(s => `<div class="sub"><b>${esc(s.nom)}</b><span>${esc(s.peche)}</span>${esc(s.chatiment)}</div>`).join('');
    return `
      <div class="num">${esc(c.numero.toUpperCase())}</div>
      <h2>${esc(c.nom)}</h2>
      <div class="chants">${esc(c.chants)}</div>
      <h3>Le lieu</h3><p>${esc(c.lieu)}</p>
      <h3>Le péché</h3><p>${esc(c.peche)}</p>
      <h3>Le châtiment</h3><p>${esc(c.chatiment)}</p>
      <h3>Le contrapasso</h3><p>${esc(c.contrapasso)}</p>
      <h3>Le gardien</h3><p>${esc(c.gardien)}</p>
      ${subs}
      <h3>Âmes rencontrées</h3><ul>${c.personnages.map(p => `<li>${esc(p)}</li>`).join('')}</ul>`;
  }

  function panelParadis(c) {
    return `
      <div class="num">${esc(c.numero.toUpperCase())}</div>
      <h2>${esc(c.nom)}</h2>
      <div class="chants">${esc(c.chants)}</div>
      <h3>Le lieu</h3><p>${esc(c.lieu)}</p>
      <h3>Les âmes</h3><p>${esc(c.ames)}</p>
      <h3>La béatitude</h3><p>${esc(c.beatitude)}</p>
      <h3>Le sens</h3><p>${esc(c.sens)}</p>
      <h3>L'intelligence motrice</h3><p>${esc(c.ange)}</p>
      <h3>Âmes rencontrées</h3><ul>${c.personnages.map(p => `<li>${esc(p)}</li>`).join('')}</ul>`;
  }

  function go(idx) {
    current = Math.max(-1, Math.min(R().data.length - 1, idx));
    [...nav.children].forEach((b, q) => b.classList.toggle('active', q - 1 === current));
    tooltip.hidden = true;
    clickTarget = null; lastNear = null; encounter.hidden = true;
    if (current >= 0) { scene = new IsoScene(R().scenes[R().data[current].id]); fitCamera(); rencontres[key()] = rencontres[key()] || new Set(); }
    else scene = null;
    renderPanel();
    try { history.replaceState(null, '', current >= 0 ? '#' + R().data[current].id : (realm === 'paradis' ? '#paradis' : '#')); } catch (e) { /* file:// */ }
  }

  function key() { return realm + ':' + R().data[current].id; }

  function setRealm(r, idx = -1) {
    realm = r;
    document.body.classList.toggle('paradis', r === 'paradis');
    document.querySelectorAll('#realms button').forEach(b => b.classList.toggle('active', b.dataset.realm === r));
    document.querySelector('header h1').textContent = R().title;
    document.querySelector('header .subtitle').textContent = R().subtitle;
    document.querySelector('header .pdf').href = R().pdf;
    buildNav();
    go(idx);
  }

  // ---------- Caméra ----------
  function fitCamera() {
    if (!scene) return;
    const pts = [];
    for (const [x, y] of [[0, 0], [scene.w, 0], [0, scene.h], [scene.w, scene.h]]) { pts.push(isoProj(x, y, scene.base)); pts.push(isoProj(x, y, scene.def.zTop || 7)); }
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const s = Math.min(cw / (maxX - minX), ch / (maxY - minY)) * 0.94;
    cam.scale = Math.min(s, 2.4);
    cam.ox = cw / 2 - (minX + maxX) / 2 * cam.scale;
    cam.oy = ch / 2 - (minY + maxY) / 2 * cam.scale;
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    cw = r.width; ch = r.height;
    canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fitCamera();
  }

  // ---------- Vue d'ensemble (l'entonnoir) ----------
  const E = 0.58; // aplatissement des ellipses (inclinaison de la vue)
  function ringGeom() {
    const n = CERCLES.length;
    const R = Math.min(cw * 0.47, (ch - 70) / (2 * E + 0.35));
    const band = R * 0.092 * E, D = band * 0.55;
    const cx = cw / 2, cy0 = ch / 2 - (n * D) / 2 + 20;
    const rings = [];
    for (let i = 0; i < n; i++) {
      const rOut = R * (1 - i * 0.092), rIn = i === n - 1 ? 0 : R * (1 - (i + 1) * 0.092);
      rings.push({ rOut, rIn, y: cy0 + i * D, yNext: cy0 + (i + 1) * D });
    }
    return { cx, rings, D, band };
  }

  function drawOverview(t) {
    if (realm === 'paradis') { drawParadisOverview(ctx, cw, ch, t, hoverRing); return; }
    const g = ctx.createLinearGradient(0, 0, 0, ch);
    g.addColorStop(0, '#1d120d'); g.addColorStop(1, '#050303');
    ctx.fillStyle = g; ctx.fillRect(0, 0, cw, ch);
    const { cx, rings, band } = ringGeom();
    const n = rings.length;
    for (let i = n - 1; i >= 0; i--) {
      const r = rings[i], c = CERCLES[i];
      const hot = hoverRing === i;
      // paroi intérieure (moitié arrière visible)
      if (r.rIn > 0) {
        const gw = ctx.createLinearGradient(0, r.y - r.rIn * E, 0, r.yNext);
        gw.addColorStop(0, shade(c.couleur, -0.55)); gw.addColorStop(1, shade(c.couleur, -0.85));
        ctx.fillStyle = gw;
        ctx.beginPath(); ctx.ellipse(cx, r.y, r.rIn, r.rIn * E, 0, Math.PI, TAU);
        ctx.ellipse(cx, r.yNext, r.rIn, r.rIn * E, 0, TAU, Math.PI, true); ctx.closePath(); ctx.fill();
      }
      // dessus de l'anneau
      const gt = ctx.createRadialGradient(cx, r.y - r.rOut * 0.2, r.rIn * 0.5, cx, r.y, r.rOut);
      gt.addColorStop(0, shade(c.couleur, hot ? 0.15 : -0.2)); gt.addColorStop(1, shade(c.couleur, hot ? 0.35 : 0.05));
      ctx.fillStyle = gt;
      ctx.beginPath(); ctx.ellipse(cx, r.y, r.rOut, r.rOut * E, 0, 0, TAU);
      if (r.rIn > 0) ctx.ellipse(cx, r.y, r.rIn, r.rIn * E, 0, 0, TAU);
      ctx.fill('evenodd');
      if (hot) { ctx.strokeStyle = '#ffd98a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx, r.y, r.rOut, r.rOut * E, 0, 0, TAU); ctx.stroke(); }
      // murailles de Dité entre le Ve et le VIe cercle
      if (c.id === 'heresie') { ctx.strokeStyle = `rgba(255,80,30,${0.6 + Math.sin(t * 3) * 0.2})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(cx, r.y, r.rOut - 2, r.rOut * E - 1, 0, 0, TAU); ctx.stroke(); }
      // âmes en mouvement sur l'anneau
      const count = Math.max(4, Math.round(r.rOut / 14));
      for (let q = 0; q < count; q++) {
        const a = q / count * TAU + t * (0.1 + i * 0.02) * (i % 2 ? -1 : 1);
        const rr = (r.rOut + Math.max(r.rIn, r.rOut * 0.3)) / 2;
        const px = cx + Math.cos(a) * rr, py = r.y + Math.sin(a) * rr * E;
        if (Math.sin(a) < -0.6) continue; // laisse la place aux étiquettes
        ctx.fillStyle = c.id === 'violence' || c.id === 'heresie' ? 'rgba(255,170,90,0.85)' : 'rgba(235,228,210,0.75)';
        ctx.beginPath(); ctx.arc(px, py - 2, 1.8, 0, TAU); ctx.fill();
      }
    }
    // Lucifer au fond
    const last = rings[n - 1];
    drawLucifer(ctx, cx, last.y - 4, Math.max(0.12, last.rOut / 260), t);
    // étiquettes, dessinées en dernier pour ne pas être masquées par les parois
    for (let i = 0; i < n; i++) {
      const r = rings[i], c = CERCLES[i], hot = hoverRing === i;
      const ly = r.rIn > 0 ? r.y - (r.rOut + r.rIn) / 2 * E : r.y + r.rOut * E * 0.75;
      ctx.font = `600 ${Math.max(10, Math.min(15, band * 0.62))}px Cinzel, serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 4;
      ctx.fillStyle = hot ? '#fff3d6' : 'rgba(255,240,215,0.92)';
      ctx.fillText(`${c.numero} · ${c.nom}`, cx, ly);
      ctx.shadowBlur = 0;
    }
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    // jupe extérieure
    const r0 = rings[0];
    ctx.fillStyle = '#1a110d';
    ctx.beginPath(); ctx.ellipse(cx, r0.y, r0.rOut, r0.rOut * E, 0, 0, Math.PI); ctx.ellipse(cx, r0.y + 26, r0.rOut, r0.rOut * E, 0, Math.PI, 0, true); ctx.closePath(); ctx.fill();
    // titre
    ctx.fillStyle = '#d6a65a'; ctx.font = '600 15px Cinzel, serif'; ctx.textAlign = 'center';
    ctx.fillText('« Per me si va ne la città dolente »', cx, Math.max(22, r0.y - r0.rOut * E - 14));
    ctx.textAlign = 'left';
    const v = ctx.createRadialGradient(cw / 2, ch / 2, Math.min(cw, ch) * 0.4, cw / 2, ch / 2, Math.max(cw, ch) * 0.8);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, cw, ch);
  }

  function ringAt(mx, my) {
    if (realm === 'paradis') return paradisRingAt(cw, ch, mx, my);
    const { cx, rings } = ringGeom();
    for (let i = 0; i < rings.length; i++) {
      const r = rings[i];
      const d = Math.hypot(mx - cx, (my - r.y) / E);
      if (d <= r.rOut && d >= r.rIn) return i;
    }
    return -1;
  }

  // ---------- Infobulles ----------
  function entityAt(mx, my) {
    if (!scene) return null;
    let best = null, bestKey = -Infinity;
    for (const e of scene.entities) {
      if (!e.name || e._sx === undefined) continue;
      const k = e._k, [hw, hh] = e.hit || [10, 30];
      if (Math.abs(mx - e._sx) < hw * k && my < e._sy + 5 * k && my > e._sy - hh * k) {
        const key = e.x + e.y + (e.keyBias || 0);
        if (key > bestKey) { bestKey = key; best = e; }
      }
    }
    return best;
  }

  function updateHover() {
    if (!mouse.inside || drag) { tooltip.hidden = true; return; }
    if (current < 0) {
      hoverRing = ringAt(mouse.x, mouse.y);
      canvas.style.cursor = hoverRing >= 0 ? 'pointer' : 'default';
      if (hoverRing >= 0) { const c = R().data[hoverRing]; showTip(c.numero + ' · ' + c.nom, c.peche || c.ames); }
      else tooltip.hidden = true;
      return;
    }
    canvas.style.cursor = '';
    const e = entityAt(mouse.x, mouse.y);
    if (e) showTip(e.name, e.desc || ''); else tooltip.hidden = true;
  }

  function showTip(title, body) {
    tooltip.innerHTML = `<b>${esc(title)}</b>${esc(body)}`;
    tooltip.hidden = false;
    const tw = tooltip.offsetWidth, th = tooltip.offsetHeight;
    let x = mouse.x + 16, y = mouse.y + 16;
    if (x + tw > cw - 6) x = mouse.x - tw - 12;
    if (y + th > ch - 6) y = mouse.y - th - 12;
    tooltip.style.left = x + 'px'; tooltip.style.top = y + 'px';
  }

  // ---------- Entrées ----------
  let drag = null, dragMoved = false;
  canvas.addEventListener('mousedown', ev => { if (current >= 0) { drag = { x: ev.offsetX, y: ev.offsetY, ox: cam.ox, oy: cam.oy }; dragMoved = false; canvas.classList.add('dragging'); } });
  window.addEventListener('mouseup', () => { drag = null; canvas.classList.remove('dragging'); });
  canvas.addEventListener('mousemove', ev => {
    mouse.x = ev.offsetX; mouse.y = ev.offsetY; mouse.inside = true;
    if (drag) { if (Math.hypot(ev.offsetX - drag.x, ev.offsetY - drag.y) > 4) dragMoved = true; if (dragMoved) { cam.ox = drag.ox + ev.offsetX - drag.x; cam.oy = drag.oy + ev.offsetY - drag.y; } }
  });
  canvas.addEventListener('mouseleave', () => { mouse.inside = false; tooltip.hidden = true; });
  canvas.addEventListener('click', ev => {
    if (current < 0) { const r = ringAt(ev.offsetX, ev.offsetY); if (r >= 0) go(r); return; }
    if (dragMoved) return;
    clickTarget = screenToWorld(ev.offsetX, ev.offsetY);
  });
  canvas.addEventListener('wheel', ev => {
    if (current < 0) return;
    ev.preventDefault();
    const f = Math.exp(-ev.deltaY * 0.0015);
    const ns = Math.max(0.3, Math.min(5, cam.scale * f));
    const ratio = ns / cam.scale;
    cam.ox = ev.offsetX - (ev.offsetX - cam.ox) * ratio;
    cam.oy = ev.offsetY - (ev.offsetY - cam.oy) * ratio;
    cam.scale = ns;
  }, { passive: false });
  // tactile : un doigt pour déplacer
  canvas.addEventListener('touchstart', ev => { const t = ev.touches[0], r = canvas.getBoundingClientRect(); drag = { x: t.clientX - r.left, y: t.clientY - r.top, ox: cam.ox, oy: cam.oy }; }, { passive: true });
  canvas.addEventListener('touchmove', ev => { if (!drag || current < 0) return; const t = ev.touches[0], r = canvas.getBoundingClientRect(); cam.ox = drag.ox + t.clientX - r.left - drag.x; cam.oy = drag.oy + t.clientY - r.top - drag.y; }, { passive: true });
  canvas.addEventListener('touchend', ev => {
    if (current < 0 && drag) { const r = ringAt(drag.x, drag.y); if (r >= 0) go(r); }
    else if (drag && scene && Math.abs(cam.ox - drag.ox) + Math.abs(cam.oy - drag.oy) < 6) clickTarget = screenToWorld(drag.x, drag.y);
    drag = null;
  });
  const MOVE_KEYS = { arrowup: [-1, -1], z: [-1, -1], w: [-1, -1], arrowdown: [1, 1], s: [1, 1], arrowleft: [-1, 1], q: [-1, 1], a: [-1, 1], arrowright: [1, -1], d: [1, -1] };
  window.addEventListener('keydown', ev => {
    const key = ev.key.toLowerCase();
    if (current < 0) { // vue d'ensemble : les flèches descendent dans l'Enfer
      if (key === 'arrowright' || key === 'arrowdown' || key === 'enter' || key === ' ') { go(0); ev.preventDefault(); }
      return;
    }
    if (MOVE_KEYS[key]) { keys.add(key); clickTarget = null; ev.preventDefault(); }
    else if (key === 'pagedown' || key === 'n' || key === 'enter') go(current + 1);
    else if (key === 'pageup' || key === 'p') go(current - 1);
    else if (key === 'escape') go(-1);
    else if (/^[0-9]$/.test(key)) go(Number(key));
  });
  window.addEventListener('keyup', ev => keys.delete(ev.key.toLowerCase()));
  window.addEventListener('blur', () => keys.clear());

  // écran -> monde, au niveau du sol du joueur
  function screenToWorld(mx, my) {
    const z = scene.player ? scene.ground(scene.player.x, scene.player.y) : 0;
    const px = (mx - cam.ox) / cam.scale, py = (my - cam.oy) / cam.scale + z * ISO.ZH;
    const a = px / (ISO.TW / 2), b = py / (ISO.TH / 2);
    return [(a + b) / 2, (b - a) / 2];
  }

  function updatePlayer(dt) {
    const p = scene && scene.player; if (!p) return;
    let vx = 0, vy = 0;
    for (const k of keys) { const v = MOVE_KEYS[k]; if (v) { vx += v[0]; vy += v[1]; } }
    if (!vx && !vy && clickTarget) {
      const dx = clickTarget[0] - p.x, dy = clickTarget[1] - p.y;
      if (Math.hypot(dx, dy) < 0.1) clickTarget = null; else { vx = dx; vy = dy; }
    }
    const L = Math.hypot(vx, vy);
    p.moving = false;
    if (L > 0) {
      const sp = 2.6 * dt;
      p.moving = movePlayer(scene, vx / L * sp, vy / L * sp);
      if (!p.moving) clickTarget = null;
      p.phase += dt * 10;
    }
    // rencontre : l'âme nommée la plus proche
    let near = null, best = 1.6;
    for (const e of scene.entities) {
      if (!e.name || e.player || e.guide) continue;
      const d = Math.hypot(e.x - p.x, e.y - p.y);
      if (d < best) { best = d; near = e; }
    }
    if (near !== lastNear) {
      lastNear = near;
      if (near) {
        encounter.innerHTML = `<b>${esc(near.name)}</b>${esc(near.desc || '')}`;
        encounter.hidden = false;
        rencontres[key()].add(near.name);
      } else encounter.hidden = true;
    }
  }

  function renderHud() {
    if (current < 0) {
      const vus = Object.keys(rencontres).filter(k => k.startsWith(realm + ':')).length;
      hud.textContent = vus ? `${R().visited} : ${vus} / ${R().data.length}` : R().start;
      return;
    }
    const total = new Set(scene.entities.filter(e => e.name && !e.player && !e.guide).map(e => e.name)).size;
    hud.textContent = `Âmes rencontrées : ${rencontres[key()].size} / ${total}`;
  }

  const REALMS = {
    enfer: { data: CERCLES, scenes: SCENES, intro: INTRO_ENFER, panel: panelEnfer, overviewLabel: 'L\'entonnoir', accent: '#d6a65a',
      title: 'L\'Enfer de Dante', subtitle: 'Simulation 2.5D des cercles de l\'Inferno', pdf: 'docs/Enfer_de_Dante.pdf',
      visited: 'Cercles visités', start: 'Cliquez sur un cercle ou appuyez sur Entrée pour descendre' },
    paradis: { data: CIELS, scenes: SCENES_PARADIS, intro: INTRO_PARADIS, panel: panelParadis, overviewLabel: 'Les sphères', accent: '#ecd9a8',
      title: 'Le Paradis de Dante', subtitle: 'Simulation 2.5D des cieux du Paradiso', pdf: 'docs/Paradis_de_Dante.pdf',
      visited: 'Cieux visités', start: 'Cliquez sur une sphère ou appuyez sur Entrée pour monter' },
  };
  document.querySelectorAll('#realms button').forEach(b => { b.onclick = () => setRealm(b.dataset.realm); });

  document.getElementById('prev').onclick = () => go(current - 1);
  document.getElementById('next').onclick = () => go(current + 1);
  document.getElementById('home').onclick = () => go(-1);
  window.addEventListener('resize', resize);

  // ---------- Boucle ----------
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (scene) { updatePlayer(dt); scene.update(dt); scene.draw(ctx, cam, cw, ch); }
    else { overT += dt; drawOverview(overT); }
    updateHover();
    renderHud();
    requestAnimationFrame(frame);
  }

  resize();
  const h = location.hash.slice(1);
  const ip = CIELS.findIndex(c => c.id === h);
  if (h === 'paradis' || ip >= 0) setRealm('paradis', ip);
  else setRealm('enfer', CERCLES.findIndex(c => c.id === h));
  requestAnimationFrame(frame);
})();
