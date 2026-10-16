// Scènes 2.5D du Paradis : une par ciel, plus la vue d'ensemble des sphères.

// ---------- Décors célestes ----------
const ETOILES_FOND = Array.from({ length: 160 }, (_, n) => [hash2(n, 1), hash2(n, 2), hash2(n, 3)]);
function cielEtoile(ctx, cw, ch, t, teinte = '255,250,235') {
  for (const [u, v, w] of ETOILES_FOND) {
    const a = 0.25 + 0.6 * w * (0.6 + 0.4 * Math.sin(t * (1 + w * 2) + u * 40));
    ctx.fillStyle = `rgba(${teinte},${a})`;
    ctx.fillRect(u * cw, v * ch, 1 + w * 1.6, 1 + w * 1.6);
  }
}
function rayons(ctx, x, y, r, t, col, n = 16) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.05);
  for (let q = 0; q < n; q++) {
    ctx.rotate(TAU / n);
    const g = ctx.createLinearGradient(0, 0, r, 0);
    g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r, -r * 0.05); ctx.lineTo(r, r * 0.05); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

// Une âme bienheureuse cachée dans sa lumière (au-dessus du point x, y)
function drawLumiere(ctx, x, y, k, t, o = {}) {
  const s = (o.size || 1) * k;
  const pulse = 1 + Math.sin(t * 3 + (o.seed || 0)) * 0.12;
  const col = o.color || '255,240,190';
  const g = ctx.createRadialGradient(x, y, 0, x, y, 22 * s * pulse);
  g.addColorStop(0, `rgba(255,255,255,${0.95 * (o.alpha ?? 1)})`);
  g.addColorStop(0.25, `rgba(${col},${0.75 * (o.alpha ?? 1)})`);
  g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 22 * s * pulse, 0, TAU); ctx.fill();
  if (o.figure) drawFigure(ctx, x, y + 9 * s, k * 0.7 * (o.size || 1), { color: '#ffffff', skin: '#fffaf0', alpha: 0.5, noShadow: true });
}

// Entité « lumière » : z au-dessus du sol, nom et description
function makeLumiere(sc, x, y, z, opts = {}) {
  return sc.add(Object.assign({
    x, y, z, name: opts.name, desc: opts.desc, hit: [14, 24], phase: Math.random() * 6, seed: Math.random() * 9,
    draw(ctx, sx, sy, k, t, e) { drawLumiere(ctx, sx, sy - 10 * k, k, t, { size: e.size, color: e.col, seed: e.seed, figure: e.figure, alpha: e.alpha }); },
  }, opts.extra || {}, { update: opts.update }));
}

function sol(sc, couleur, opts = {}) {
  forTiles(sc, (i, j, t) => { t.h = (opts.h ?? 0.3) + hash2(i, j) * (opts.var ?? 0.08); t.c = couleur; if (opts.anim) t.anim = opts.anim; });
}

const SCENES_PARADIS = {};

// ===== Ciel I : la Lune =====
SCENES_PARADIS.lune = {
  w: 16, h: 16, sky: ['#1a2236', '#06080f'], vignette: 0.45,
  particles: [{ type: 'sparkle', rate: 6, region: [0, 0, 16, 16], zMax: 4 }],
  drawBackground(ctx, cw, ch, t) { cielEtoile(ctx, cw, ch, t); },
  build(sc) {
    sol(sc, '#dfe6ec', { anim: 'water' });
    forTiles(sc, (i, j, t) => { if (hash2(i * 3, j * 2) > 0.86) { t.h = 0.7; t.c = '#c6ced6'; t.anim = undefined; } }); // « taches » de la Lune
    for (let n = 0; n < 16; n++) makeSoul(sc, rand(1, 15), rand(1, 15), { name: 'Âme inconstante', desc: 'Elle a manqué à ses vœux. Son visage est si pâle qu\'on le croirait un reflet dans l\'eau ou dans un verre poli.', fig: { pose: 'walk', color: '#ffffff', alpha: 0.42, noShadow: true }, update: wanderer(0.8, 0.8, 15.2, 15.2, 0.18) });
    makeSoul(sc, 6, 5, { name: 'Piccarda Donati', desc: '« En sa volonté est notre paix. » Arrachée à son couvent par son frère Corso, elle ne désire aucun ciel plus haut que le sien.', fig: { color: '#ffffff', alpha: 0.55, noShadow: true, arms: 'forward' } });
    makeSoul(sc, 7.2, 4.2, { name: 'L\'impératrice Constance', desc: 'Tirée du cloître, selon la légende, pour épouser l\'empereur Henri VI ; elle fut la mère de Frédéric II, « la grande Constance ».', fig: { color: '#fff7e6', alpha: 0.5, noShadow: true } });
    addPoets(sc, 11, 12, 'beatrice');
  }
};

// ===== Ciel II : Mercure =====
SCENES_PARADIS.mercure = {
  w: 16, h: 16, sky: ['#18213a', '#05070f'], vignette: 0.45,
  particles: [{ type: 'sparkle', rate: 10, region: [0, 0, 16, 16] }],
  drawBackground(ctx, cw, ch, t) { cielEtoile(ctx, cw, ch, t); },
  build(sc) {
    sol(sc, '#c3cde0', { anim: 'water' });
    // plus de mille splendeurs accourent vers Dante comme des poissons dans un vivier
    for (let n = 0; n < 34; n++) {
      const a0 = rand(0, TAU), r0 = rand(1.2, 3.5), sp = rand(0.3, 0.8) * (n % 2 ? 1 : -1);
      makeLumiere(sc, rand(1, 15), rand(1, 15), rand(1.2, 3.5), { name: 'Esprit actif', desc: 'Il a fait le bien, mais aussi pour la gloire. Il accourt vers Dante en criant : « Voici qui accroîtra nos amours ! »',
        update(dt, t, e, scn) { const p = scn.player; if (!p) return; const tx = p.x + Math.cos(a0 + t * sp) * r0, ty = p.y + Math.sin(a0 + t * sp) * r0; e.x += (tx - e.x) * Math.min(1, dt * 0.8); e.y += (ty - e.y) * Math.min(1, dt * 0.8); } });
    }
    makeLumiere(sc, 5, 5, 3, { name: 'Justinien', desc: '« César je fus, et je suis Justinien. » L\'empereur qui fit le Code des lois romaines raconte l\'histoire de l\'aigle impérial.', extra: { size: 1.6, col: '255,230,150' } });
    makeLumiere(sc, 3.5, 7, 1.8, { name: 'Romée de Villeneuve', desc: 'Ministre fidèle du comte de Provence, il maria ses quatre filles à quatre rois, puis fut calomnié et partit, pauvre et vieux, mendier son pain.', extra: { size: 1.1 } });
    sc.add({ x: 4.2, y: 3.6, name: 'L\'aigle impérial', desc: '« L\'oiseau sacré » de Rome, symbole de l\'Empire voulu par Dieu, dont Justinien retrace l\'histoire d\'Énée à Charlemagne.', hit: [26, 70],
      draw(ctx, x, y, k, t) {
        ctx.strokeStyle = '#8a7a4a'; ctx.lineWidth = 2 * k; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 70 * k); ctx.stroke();
        ctx.fillStyle = '#e8c24a'; const f = Math.sin(t * 2) * 3 * k;
        ctx.beginPath(); ctx.moveTo(x, y - 62 * k); ctx.lineTo(x - 18 * k, y - 76 * k - f); ctx.lineTo(x - 6 * k, y - 60 * k); ctx.lineTo(x, y - 50 * k); ctx.lineTo(x + 6 * k, y - 60 * k); ctx.lineTo(x + 18 * k, y - 76 * k - f); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.arc(x, y - 68 * k, 3.5 * k, 0, TAU); ctx.fill();
      } });
    addPoets(sc, 10, 11, 'beatrice');
  }
};

// ===== Ciel III : Vénus =====
SCENES_PARADIS.venus = {
  w: 16, h: 16, sky: ['#2a1a2e', '#0a0610'], vignette: 0.45,
  particles: [{ type: 'sparkle', rate: 10, region: [0, 0, 16, 16], color: 'rgba(255,200,220,0.9)' }],
  drawBackground(ctx, cw, ch, t) { cielEtoile(ctx, cw, ch, t, '255,225,235'); },
  build(sc) {
    sol(sc, '#e7c3cf', { anim: 'water' });
    const C = 8;
    // rondes de lumières plus ou moins rapides
    [[2.2, 0.9, 1.6, 8], [4, -0.6, 2.4, 12], [6, 0.4, 3.2, 16]].forEach(([r, sp, z, n], ring) => {
      for (let q = 0; q < n; q++) makeLumiere(sc, C, C, z, { name: 'Esprit aimant', desc: 'Son amour fut d\'abord terrestre, puis tourné vers Dieu. Il danse en chantant « Hosanna », avec les Principautés.', extra: { col: '255,190,210' },
        update(dt, t, e) { const a = q / n * TAU + t * sp; e.x = C + Math.cos(a) * r; e.y = C + Math.sin(a) * r; e.z = z + Math.sin(t * 2 + q) * 0.3; } });
    });
    [['Charles Martel', 'Roi de Hongrie mort à vingt-quatre ans, ami de Dante. Il explique pourquoi les fils ne ressemblent pas toujours à leurs pères.', 5, 6], ['Cunizza da Romano', 'Sœur du cruel Ezzelino, elle aima beaucoup : « Je fus vaincue par la lumière de cette étoile. »', 10.5, 5],
      ['Folquet de Marseille', 'Troubadour amoureux, devenu moine puis évêque de Toulouse. Il dénonce le florin, « la maudite fleur » de Florence.', 11, 10], ['Rahab', 'La courtisane de Jéricho qui aida Josué : la première âme que le Christ éleva au ciel de Vénus.', 5.5, 10.5]]
      .forEach(([n, d, x, y]) => makeLumiere(sc, x, y, 2, { name: n, desc: d, extra: { size: 1.35, col: '255,170,200', figure: true } }));
    addPoets(sc, 13, 13, 'beatrice');
  }
};

// ===== Ciel IV : le Soleil =====
const COURONNE_1 = [['Saint Thomas d\'Aquin', 'Le docteur dominicain, auteur de la Somme théologique. Il présente les onze sages de la couronne et fait l\'éloge de saint François.'], ['Albert le Grand', 'Maître de saint Thomas, philosophe et naturaliste.'], ['Gratien', 'Le juriste qui unit le droit civil et le droit canon.'], ['Pierre Lombard', 'Auteur des Sentences ; il offrit son trésor à l\'Église comme la pauvre veuve.'], ['Salomon', 'La plus belle lumière : le roi sage. Il explique la résurrection des corps.'], ['Denys l\'Aréopagite', 'Celui qui décrivit le mieux la nature des anges.'],
  ['Paul Orose', 'Historien chrétien, « avocat des temps chrétiens ».'], ['Boèce', 'Auteur de la Consolation de la Philosophie, martyr à Pavie.'], ['Isidore de Séville', 'Évêque et encyclopédiste.'], ['Bède le Vénérable', 'Moine historien de l\'Angleterre.'], ['Richard de Saint-Victor', 'Le mystique, « plus qu\'homme à contempler ».'], ['Siger de Brabant', 'Philosophe averroïste qui enseigna rue du Fouarre à Paris des vérités qui lui valurent la haine.']];
const COURONNE_2 = [['Saint Bonaventure', 'Le docteur franciscain. Il fait l\'éloge de saint Dominique, l\'« athlète » de la foi.'], ['Illuminato', 'L\'un des premiers compagnons de saint François.'], ['Augustin d\'Assise', 'Autre compagnon de la première heure de saint François.'], ['Hugues de Saint-Victor', 'Théologien mystique.'], ['Pierre le Mangeur', 'Auteur de l\'Histoire scolastique.'], ['Pierre d\'Espagne', 'Logicien, devenu le pape Jean XXI.'],
  ['Nathan', 'Le prophète qui reprocha son péché à David.'], ['Jean Chrysostome', 'Patriarche de Constantinople, prédicateur « à la bouche d\'or ».'], ['Anselme de Cantorbéry', 'Le théologien de la preuve ontologique.'], ['Donat', 'Le grammairien latin.'], ['Raban Maur', 'Abbé et encyclopédiste carolingien.'], ['Joachim de Flore', 'L\'abbé calabrais « doué d\'esprit prophétique ».']];
SCENES_PARADIS.soleil = {
  w: 16, h: 16, sky: ['#3a2a0e', '#100a02'], vignette: 0.35,
  particles: [{ type: 'sparkle', rate: 16, region: [0, 0, 16, 16] }],
  drawBackground(ctx, cw, ch, t) { rayons(ctx, cw / 2, ch * 0.45, Math.max(cw, ch) * 0.7, t, 'rgba(255,220,120,0.10)', 24); },
  build(sc) {
    sol(sc, '#a8792c', { anim: 'lava' });
    const C = 8;
    [[COURONNE_1, 2.6, 0.35, 2.2], [COURONNE_2, 4.4, -0.25, 1.7]].forEach(([liste, r, sp, z], c) => {
      liste.forEach(([n, d], q) => makeLumiere(sc, C, C, z, { name: n, desc: d + (c ? ' (deuxième couronne)' : ' (première couronne)'), extra: { size: 1.4, col: '255,235,170' },
        update(dt, t, e) { const a = q / 12 * TAU + t * sp; e.x = C + Math.cos(a) * r; e.y = C + Math.sin(a) * r; } }));
    });
    addPoets(sc, C - 0.3, C + 0.3, 'beatrice');
  }
};

// ===== Ciel V : Mars =====
SCENES_PARADIS.mars = {
  w: 16, h: 16, sky: ['#2a0c08', '#0a0302'], vignette: 0.45, zTop: 12,
  particles: [{ type: 'sparkle', rate: 8, region: [0, 0, 16, 16] }],
  drawBackground(ctx, cw, ch, t) { cielEtoile(ctx, cw, ch, t, '255,220,210'); },
  build(sc) {
    sol(sc, '#8a3326', { anim: 'lava', var: 0.05 });
    const Y = 3.5, X = 8, Z0 = 1, Zc = 8.5;
    // la croix de lumières (bras vertical de z=1 à 12, bras horizontal à z=8.5)
    const pts = [];
    for (let z = Z0; z <= 12; z += 0.55) pts.push([X, z]);
    for (let u = -2.6; u <= 2.6; u += 0.3) if (Math.abs(u) > 0.15) pts.push([X + u, Zc, Y - u]);
    sc.add({ x: X, y: Y, z: 0, keyBias: 0, draw(ctx, sx, sy, k, t, e, scn) {
      // halo de la croix et éclair du Christ au croisement
      for (const [x, z, y] of pts) { const p = scn.S(x, y ?? Y, z); drawGlow(ctx, p[0], p[1], 10 * k, 'rgba(255,250,235,0.55)'); }
      const c = scn.S(X, Y, Zc); const fl = 0.35 + 0.25 * Math.sin(t * 1.3);
      drawGlow(ctx, c[0], c[1], 90 * k, `rgba(255,255,240,${fl})`);
    } });
    // lumières qui courent le long de la croix
    for (let n = 0; n < 26; n++) {
      const vertical = n % 2 === 0, off = n * 0.37;
      makeLumiere(sc, X, Y, Z0, { name: 'Combattant de la foi', desc: 'Mort pour le Christ, il court le long de la croix en chantant un hymne dont Dante ne saisit que « Ressuscite » et « Vaincs ».', extra: { size: 0.7 },
        update(dt, t, e) { const u = tri(t * 0.05 + off); if (vertical) { e.x = X; e.y = Y; e.z = Z0 + u * 11; } else { const v = -2.6 + u * 5.2; e.x = X + v; e.y = Y - v; e.z = Zc; } } });
    }
    [['Josué', 0, 11.2], ['Judas Maccabée', 0, 10.1], ['Charlemagne', -2.2, Zc], ['Roland', -1.3, Zc], ['Guillaume d\'Orange', 1.3, Zc], ['Godefroy de Bouillon', 2.2, Zc], ['Robert Guiscard', 0, 5.5]]
      .forEach(([n, u, z]) => makeLumiere(sc, X + u, Y - u, z, { name: n, desc: 'Cacciaguida le nomme : à l\'appel de son nom, la lumière file le long de la croix comme un éclair dans la nuée.', extra: { size: 1.2 } }));
    makeLumiere(sc, X, Y + 0.6, 1.6, { name: 'Cacciaguida', desc: 'Le trisaïeul de Dante, mort à la deuxième croisade. Il prophétise l\'exil du poète : « Tu sauras combien a goût de sel le pain d\'autrui. »', extra: { size: 1.6, figure: true } });
    addPoets(sc, 9, 12, 'beatrice');
  }
};

// ===== Ciel VI : Jupiter =====
const DEVISE = 'DILIGITE IUSTITIAM QUI IUDICATIS TERRAM';
SCENES_PARADIS.jupiter = {
  w: 16, h: 16, sky: ['#1c2430', '#06080b'], vignette: 0.4, zTop: 10,
  particles: [{ type: 'sparkle', rate: 10, region: [0, 0, 16, 16] }],
  drawBackground(ctx, cw, ch, t) { cielEtoile(ctx, cw, ch, t); },
  build(sc) {
    sol(sc, '#9fb0c2', { anim: 'ice' });
    const C = 7;
    // l'aigle de lumières, qui parle d'une seule voix
    const aigle = [];
    for (let q = 0; q <= 40; q++) { const u = q / 20 - 1, a = Math.abs(u); if (a < 0.08) continue; aigle.push([u * 100, -30 - Math.sin(a * Math.PI * 0.85) * 46 + a * 10]); aigle.push([u * 100, -14 - Math.sin(a * Math.PI * 0.85) * 30 + a * 22]); } // ailes déployées
    for (let q = 0; q < 12; q++) aigle.push([0, -40 + q * 7]);          // corps
    for (let q = 0; q < 7; q++) aigle.push([-8 + q * 2.6, 44 + (q % 2) * 6]);  // queue
    for (let q = 0; q < 8; q++) { const a = q / 8 * TAU; aigle.push([Math.cos(a) * 8, -54 + Math.sin(a) * 8]); } // tête
    sc.add({ x: C, y: C, z: 3, name: 'L\'aigle de Jupiter', desc: 'Formé de mille lumières, il parle d\'une seule voix, disant « je » et « mien » quand il pense « nous » : la justice est une.', hit: [90, 120],
      draw(ctx, sx, sy, k, t) {
        const fl = Math.sin(t * 1.2) * 0.08;
        for (const [x, y] of aigle) { const px = sx + x * k, py = sy - 60 * k + y * k - (Math.abs(x) > 12 ? Math.abs(x) * fl * k : 0); drawGlow(ctx, px, py, 10 * k, 'rgba(255,240,190,0.75)'); ctx.fillStyle = '#ffffff'; ctx.fillRect(px - 1.2 * k, py - 1.2 * k, 2.4 * k, 2.4 * k); }
        // la devise s'écrit lettre après lettre
        const n = Math.floor((t * 4) % (DEVISE.length + 12));
        ctx.font = `600 ${11 * k}px Cinzel, serif`; ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(255,240,200,0.9)'; ctx.shadowBlur = 8 * k; ctx.fillStyle = '#fffaf0';
        ctx.fillText(DEVISE.slice(0, n), sx, sy - 150 * k);
        ctx.shadowBlur = 0; ctx.textAlign = 'left';
      } });
    [['David', 'La pupille de l\'œil de l\'aigle : le chantre de l\'Esprit saint, qui transporta l\'Arche.'], ['Trajan', 'L\'empereur païen sauvé par les prières de saint Grégoire, pour avoir rendu justice à une veuve.'], ['Ézéchias', 'Le roi de Juda qui obtint de Dieu quinze ans de vie de plus.'],
      ['Constantin', 'L\'empereur qui transféra l\'Empire à Byzance ; sa donation, faite de bonne intention, a corrompu l\'Église.'], ['Guillaume II de Sicile', 'Le « bon roi », pleuré par son royaume.'], ['Riphée le Troyen', 'Un Troyen juste, dont Virgile dit qu\'il était « le plus juste » ; Dieu lui révéla la Rédemption.']]
      .forEach(([n, d], q) => makeLumiere(sc, C + (q - 2.5) * 0.18, C - (q - 2.5) * 0.18, 3 + (60 + 54) / 16 + (q === 0 ? 0 : 0.6), { name: n, desc: d, extra: { size: q === 0 ? 1.3 : 1, col: '255,250,230' } }));
    for (let n = 0; n < 14; n++) makeLumiere(sc, rand(1, 15), rand(1, 15), rand(1.5, 3), { name: 'Esprit juste', desc: 'Prince ou juge équitable : comme un oiseau, il vole former les lettres de la devise.', extra: { size: 0.7 }, update: wanderer(1, 1, 15, 15, 1.2) });
    addPoets(sc, 12, 12, 'beatrice');
  }
};

// ===== Ciel VII : Saturne =====
SCENES_PARADIS.saturne = {
  w: 16, h: 16, sky: ['#1c1a14', '#060504'], vignette: 0.45, zTop: 12,
  drawBackground(ctx, cw, ch, t) { cielEtoile(ctx, cw, ch, t); },
  build(sc) {
    sol(sc, '#e8dfc2', { anim: 'ice' });
    const X = 7, Y = 6;
    sc.add({ x: X, y: Y, name: 'L\'échelle d\'or', desc: 'L\'échelle de Jacob, couleur d\'or traversé par un rayon, si haute que l\'œil ne peut la suivre.', hit: [24, 260],
      draw(ctx, sx, sy, k, t) {
        drawGlow(ctx, sx, sy - 120 * k, 140 * k, 'rgba(255,220,120,0.18)');
        const H = 900 * k;
        ctx.strokeStyle = '#e5b84a'; ctx.lineWidth = 3 * k;
        ctx.beginPath(); ctx.moveTo(sx - 14 * k, sy); ctx.lineTo(sx - 8 * k, sy - H); ctx.moveTo(sx + 14 * k, sy); ctx.lineTo(sx + 8 * k, sy - H); ctx.stroke();
        ctx.lineWidth = 2 * k;
        for (let y = 0; y < H; y += 14 * k) { const w = 14 * k - (y / H) * 6 * k; ctx.beginPath(); ctx.moveTo(sx - w, sy - y); ctx.lineTo(sx + w, sy - y); ctx.stroke(); }
      } });
    for (let n = 0; n < 22; n++) {
      const off = hash2(n, 6), sp = 0.03 + hash2(n, 7) * 0.05;
      makeLumiere(sc, X + 0.01, Y + 0.01, 0, { name: 'Esprit contemplatif', desc: 'Ermite ou moine, il monte et descend l\'échelle comme les choucas qui, au point du jour, s\'envolent et reviennent.', extra: { size: 0.8 },
        update(dt, t, e) { e.z = 0.5 + tri(t * sp + off) * 30; } });
    }
    makeLumiere(sc, X + 1.2, Y + 0.8, 1.5, { name: 'Saint Pierre Damien', desc: 'Il tourne sur lui-même comme une meule et dénonce le luxe des prélats, si gras qu\'il faut les soutenir de chaque côté.', extra: { size: 1.4, figure: true },
      update(dt, t, e) { e.size = 1.4 + Math.sin(t * 6) * 0.15; } });
    makeLumiere(sc, X - 0.6, Y + 1.6, 1.8, { name: 'Saint Benoît', desc: 'Le père du monachisme d\'Occident, qui fonda le Mont-Cassin. Il déplore que plus personne ne lève le pied pour gravir l\'échelle.', extra: { size: 1.5, figure: true } });
    makeLumiere(sc, X + 2.4, Y - 0.4, 2.2, { name: 'Saint Macaire', desc: 'Moine ermite d\'Égypte, compagnon de saint Benoît dans la contemplation.' });
    makeLumiere(sc, X + 0.4, Y + 2.6, 1.2, { name: 'Saint Romuald', desc: 'Fondateur des Camaldules, ordre d\'ermites.' });
    addPoets(sc, 11, 11.5, 'beatrice');
  }
};

// ===== Ciel VIII : les Étoiles fixes =====
SCENES_PARADIS.etoiles = {
  w: 16, h: 16, sky: ['#0d1430', '#020309'], vignette: 0.45, zTop: 11,
  particles: [{ type: 'sparkle', rate: 22, region: [0, 0, 16, 16], zMax: 9 }],
  drawBackground(ctx, cw, ch, t) {
    cielEtoile(ctx, cw, ch, t, '220,230,255');
    // les Gémeaux, signe de naissance de Dante
    const g = [[0.08, 0.15], [0.12, 0.22], [0.1, 0.3], [0.14, 0.38], [0.17, 0.14], [0.2, 0.21], [0.19, 0.3], [0.22, 0.37]];
    ctx.strokeStyle = 'rgba(180,200,255,0.25)'; ctx.lineWidth = 1;
    ctx.beginPath(); [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7], [1, 5]].forEach(([a, b]) => { ctx.moveTo(g[a][0] * cw, g[a][1] * ch); ctx.lineTo(g[b][0] * cw, g[b][1] * ch); }); ctx.stroke();
    for (const [x, y] of g) drawGlow(ctx, x * cw, y * ch, 5, 'rgba(220,230,255,0.9)');
    ctx.fillStyle = 'rgba(200,215,255,0.5)'; ctx.font = 'italic 12px "EB Garamond", serif'; ctx.fillText('Les Gémeaux', 0.07 * cw, 0.45 * ch);
    // la Terre, minuscule, vue d'en haut
    drawGlow(ctx, cw * 0.88, ch * 0.82, 14, 'rgba(120,170,220,0.5)'); ctx.fillStyle = '#4a7aa8'; ctx.beginPath(); ctx.arc(cw * 0.88, ch * 0.82, 4, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(200,215,255,0.5)'; ctx.fillText('« l\'aire qui nous rend si féroces »', cw * 0.74, ch * 0.88);
  },
  build(sc) {
    forTiles(sc, (i, j, t) => { t.h = 0.3; t.c = '#1e2b5a'; t.deco = (ctx, S, i2, j2, top, tt, n) => { if (n > 0.6) { const p = S(i2 + n, j2 + (1 - n), top); drawGlow(ctx, p[0], p[1], 5 * kFromS(S) * (0.7 + 0.3 * Math.sin(tt * 3 + n * 20)), 'rgba(230,240,255,0.9)'); } }; });
    sc.add({ x: 8, y: 8, z: 9, name: 'Le Christ triomphant', desc: 'Un soleil qui embrase mille lumières : Dante, ébloui, ne peut le regarder. Béatrice : « Voici les troupes du triomphe du Christ. »', hit: [60, 70], keyBias: 50,
      draw(ctx, sx, sy, k, t) { rayons(ctx, sx, sy, 160 * k, t, 'rgba(255,250,220,0.25)', 20); drawGlow(ctx, sx, sy, 60 * k, 'rgba(255,255,245,0.95)'); } });
    sc.add({ x: 5, y: 9, z: 4, name: 'La Vierge Marie', desc: 'La « rose » où le Verbe s\'est fait chair. L\'archange Gabriel, flamme circulaire, la couronne en chantant ; elle remonte vers l\'Empyrée.', hit: [30, 50],
      draw(ctx, sx, sy, k, t) { drawLumiere(ctx, sx, sy, k, t, { size: 1.7, color: '120,160,255', figure: true }); ctx.strokeStyle = `rgba(255,220,120,${0.7 + Math.sin(t * 4) * 0.2})`; ctx.lineWidth = 3 * k; ctx.beginPath(); ctx.ellipse(sx, sy - 26 * k, 18 * k, 6 * k, 0, 0, TAU); ctx.stroke(); } });
    [['Saint Pierre', 'Il examine Dante sur la Foi, « substance des choses espérées », puis tourne trois fois autour de lui en signe d\'approbation.', 7, 5], ['Saint Jacques', 'Il examine Dante sur l\'Espérance, « attente certaine de la gloire future ».', 9.5, 5.4], ['Saint Jean l\'Évangéliste', 'Il examine Dante sur la Charité ; son éclat aveugle un instant le poète.', 11, 7.5], ['Adam', 'Le premier homme : il ne resta que six heures au Paradis terrestre, et sa faute fut de « dépasser le signe ».', 10.5, 10]]
      .forEach(([n, d, x, y]) => makeLumiere(sc, x, y, 2.6, { name: n, desc: d, extra: { size: 1.5, figure: true } }));
    for (let n = 0; n < 24; n++) makeLumiere(sc, rand(1, 15), rand(1, 15), rand(2, 6), { name: 'Bienheureux', desc: 'L\'une des âmes qui forment la troupe du triomphe du Christ, comme les étoiles autour de la pleine lune.', extra: { size: 0.6 }, update: wanderer(1, 1, 15, 15, 0.4) });
    addPoets(sc, 12.5, 12.5, 'beatrice');
  }
};

// ===== Ciel IX : le Premier Mobile =====
const CHOEURS = [['Séraphins', 'Le cercle le plus proche du point : le plus rapide et le plus ardent, car il aime et connaît le plus.'], ['Chérubins', 'Deuxième cercle, qui meut le ciel des Étoiles fixes.'], ['Trônes', 'Troisième cercle, qui meut le ciel de Saturne.'], ['Dominations', 'Ils meuvent le ciel de Jupiter.'], ['Vertus', 'Elles meuvent le ciel de Mars.'], ['Puissances', 'Elles meuvent le ciel du Soleil.'], ['Principautés', 'Elles meuvent le ciel de Vénus.'], ['Archanges', 'Ils meuvent le ciel de Mercure.'], ['Anges', 'Le cercle le plus éloigné, le plus lent, qui meut le ciel de la Lune.']];
SCENES_PARADIS['premier-mobile'] = {
  w: 16, h: 16, sky: ['#0e1a22', '#020507'], vignette: 0.4,
  drawBackground(ctx, cw, ch, t) { cielEtoile(ctx, cw, ch, t * 3, '220,240,255'); },
  build(sc) {
    sol(sc, '#cfe5ee', { anim: 'ice', var: 0.02 });
    const C = 8, Z = 3.2;
    sc.add({ x: C, y: C, z: Z, name: 'Le Point', desc: 'Un point d\'une lumière si aiguë qu\'il brûle les yeux : « De ce point dépendent le ciel et toute la nature. » C\'est Dieu.', hit: [20, 30], keyBias: 40,
      draw(ctx, sx, sy, k, t, e, scn) {
        for (let i = 8; i >= 0; i--) {
          const r = (0.75 + i * 0.75) * ISO.TW / 2 * k * 1.41;
          const col = i < 3 ? '255,120,60' : i < 6 ? '255,190,90' : '255,240,180';
          ctx.strokeStyle = `rgba(${col},${0.85 - i * 0.06})`; ctx.lineWidth = (4 - i * 0.3) * k;
          ctx.beginPath(); ctx.ellipse(sx, sy, r, r / 2, 0, 0, TAU); ctx.stroke();
          const n = 18 + i * 4, sp = 1.6 / (i + 1);
          for (let q = 0; q < n; q++) { const a = q / n * TAU + t * sp; drawGlow(ctx, sx + Math.cos(a) * r, sy + Math.sin(a) * r / 2, 4 * k, `rgba(${col},0.9)`); }
        }
        drawGlow(ctx, sx, sy, 26 * k, 'rgba(255,255,255,1)');
      } });
    CHOEURS.forEach(([n, d], i) => {
      const r = (0.75 + i * 0.75) * 1.0, sp = 1.6 / (i + 1);
      sc.add({ x: C, y: C, z: Z, name: n, desc: d, hit: [12, 16], keyBias: 41, draw() {},
        update(dt, t, e) { const a = t * sp + i; e.x = C + Math.cos(a) * r; e.y = C + Math.sin(a) * r; } });
    });
    addPoets(sc, 13, 13, 'beatrice');
  }
};

// ===== L'Empyrée et la Rose céleste =====
SCENES_PARADIS.empyree = {
  w: 20, h: 20, sky: ['#fff6dc', '#f1d9a0'], vignette: 0.12, zTop: 13, base: -2,
  particles: [{ type: 'sparkle', rate: 30, region: [0, 0, 20, 20], zMax: 8, color: 'rgba(255,200,90,0.9)' }],
  drawBackground(ctx, cw, ch, t) { rayons(ctx, cw / 2, ch * 0.1, Math.max(cw, ch), t, 'rgba(255,255,255,0.35)', 28); },
  build(sc) {
    const C = 10;
    forTiles(sc, (i, j, t) => {
      const d = Math.hypot(i + 0.5 - C, j + 0.5 - C);
      if (d < 2.4) { t.h = 0.2; t.c = '#fff3c0'; t.anim = 'lava'; }
      else { const tier = Math.floor((d - 2.4) / 0.9); t.h = 0.5 + tier * 0.55; t.c = tier % 2 ? '#fbf3e4' : '#f1e3c8'; t.side = '#e6cfa0'; }
      if (d > 9.8) t.hidden = true;
    });
    // les bienheureux assis sur les gradins de la Rose
    const okSiege = (x, y) => { const d = Math.hypot(x - C, y - C); return d > 3 && d < 9.4; };
    for (let n = 0; n < 70; n++) {
      let x, y; do { x = rand(1, 19); y = rand(1, 19); } while (!okSiege(x, y));
      const ancien = Math.atan2(y - C, x - C) > 0;
      makeSoul(sc, x, y, { name: ancien ? 'Bienheureux de l\'Ancienne Loi' : 'Bienheureux de la Nouvelle Loi', desc: ancien ? 'Il a cru au Christ à venir. Une moitié de la Rose est réservée à ceux qui ont espéré la venue du Christ.' : 'Il a cru au Christ venu. Les sièges libres de cette moitié attendent encore les élus.', fig: { pose: 'sit', color: '#ffffff', skin: '#fff6e6', alpha: 0.95 } });
    }
    [['La Vierge Marie', 'Au plus haut de la Rose, « la reine à qui ce royaume est soumis et dévoué ». Saint Bernard la prie pour Dante.', 3.6, 4.2, 'stand'], ['Béatrice', 'Elle a repris sa place au troisième rang, à côté de Rachel. Dante la remercie : « Tu m\'as tiré de la servitude à la liberté. »', 5, 3.2, 'sit'],
      ['Ève', 'Assise aux pieds de Marie, « celle qui ouvrit la plaie que Marie referma ».', 4.4, 5, 'sit'], ['Saint Jean-Baptiste', 'Face à Marie, de l\'autre côté de la Rose, au-dessus de saint François, saint Benoît et saint Augustin.', 16, 15.4, 'sit'],
      ['Adam', 'À gauche de Marie, « le père par qui l\'espèce humaine goûta tant d\'amertume ».', 2.6, 6, 'sit'], ['Saint Pierre', 'À droite de Marie, le « père antique de la sainte Église ».', 6, 2.4, 'sit']]
      .forEach(([n, d, x, y, pose]) => makeSoul(sc, x, y, { name: n, desc: d, fig: { pose, color: n === 'Béatrice' ? '#2f7a4a' : '#fffaf0', robe: n === 'Béatrice' ? '#c0392b' : n === 'La Vierge Marie' ? '#5b7fd1' : undefined, skin: '#f6e2c8', alpha: 1, size: 1.15 }, extra: { draw(ctx, x, y, k, t, e) { drawGlow(ctx, x, y - 16 * k, 30 * k, 'rgba(255,220,120,0.45)'); drawFigure(ctx, x, y, k, e.fig); } } }));
    // les anges, comme des abeilles entre la fleur et Dieu
    for (let n = 0; n < 12; n++) {
      const a0 = rand(0, TAU), r = rand(3, 8), sp = rand(0.2, 0.5);
      makeLumiere(sc, C, C, 4, { name: 'Ange', desc: 'Visage de flamme vive, ailes d\'or, le reste plus blanc que neige : les anges descendent dans la fleur comme des abeilles et remontent vers Dieu.', extra: { size: 0.8, col: '255,200,120' },
        update(dt, t, e) { const a = a0 + t * sp; e.x = C + Math.cos(a) * r; e.y = C + Math.sin(a) * r; e.z = 5 + Math.sin(t * 0.7 + n) * 4; } });
    }
    // la lumière de Dieu : trois cercles de trois couleurs (la Trinité)
    sc.add({ x: C, y: C, z: 12, name: 'La Lumière éternelle', desc: '« Trois cercles de trois couleurs et d\'une même dimension » : la Trinité. Dans le deuxième, Dante voit une image humaine. « L\'Amour qui meut le soleil et les autres étoiles. »', hit: [60, 60], keyBias: 100,
      draw(ctx, sx, sy, k, t) {
        drawGlow(ctx, sx, sy, 120 * k, 'rgba(255,255,255,0.95)');
        [['#e8c35a', -1], ['#7fb3e8', 0], ['#e86a5a', 1]].forEach(([c, q]) => { ctx.strokeStyle = c; ctx.lineWidth = 4 * k; ctx.beginPath(); ctx.arc(sx + q * 10 * k * Math.cos(t * 0.5), sy + q * 6 * k * Math.sin(t * 0.5), 34 * k, 0, TAU); ctx.stroke(); });
        drawFigure(ctx, sx, sy + 14 * k, k * 0.8, { color: '#e8c08a', skin: '#f2d2a8', alpha: 0.5, noShadow: true });
      } });
    addPoets(sc, 14.5, 14.5, 'bernard');
  }
};

// ---------- Vue d'ensemble : les sphères célestes autour de la Terre ----------
const PE = 0.5; // aplatissement
function paradisGeom(cw, ch) {
  const R = Math.min(cw * 0.47, (ch - 60) / (2 * PE + 0.1));
  const cx = cw / 2, cy = ch / 2 + 16;
  const bands = CIELS.map((c, i) => ({ rIn: R * (0.15 + i * 0.085), rOut: R * (0.15 + (i + 1) * 0.085) }));
  return { cx, cy, R, bands };
}
const ASTRES = ['#d8dee6', '#b9c4d6', '#f0b6c8', '#ffd45a', '#e0553a', '#f2f2ea', '#d8c07a'];
function drawParadisOverview(ctx, cw, ch, t, hover) {
  const g = ctx.createRadialGradient(cw / 2, ch * 0.1, 10, cw / 2, ch / 2, Math.max(cw, ch));
  g.addColorStop(0, '#3a3048'); g.addColorStop(0.5, '#141226'); g.addColorStop(1, '#05040c');
  ctx.fillStyle = g; ctx.fillRect(0, 0, cw, ch);
  cielEtoile(ctx, cw, ch, t);
  const { cx, cy, R, bands } = paradisGeom(cw, ch);
  for (let i = bands.length - 1; i >= 0; i--) {
    const b = bands[i], c = CIELS[i], hot = hover === i;
    ctx.fillStyle = shade(c.couleur, hot ? -0.1 : -0.55, hot ? 0.55 : 0.32 + i * 0.02);
    ctx.beginPath(); ctx.ellipse(cx, cy, b.rOut, b.rOut * PE, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = shade(c.couleur, 0.2, hot ? 0.95 : 0.45); ctx.lineWidth = hot ? 2 : 1;
    ctx.beginPath(); ctx.ellipse(cx, cy, b.rOut, b.rOut * PE, 0, 0, TAU); ctx.stroke();
  }
  // Empyrée : halo d'or
  const last = bands[bands.length - 1];
  ctx.strokeStyle = `rgba(255,225,150,${0.5 + Math.sin(t * 2) * 0.2})`; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.ellipse(cx, cy, last.rOut, last.rOut * PE, 0, 0, TAU); ctx.stroke();
  // planètes et chœurs en mouvement
  bands.forEach((b, i) => {
    const rr = (b.rIn + b.rOut) / 2;
    if (i < 7) {
      const a = t * (0.5 / (i + 1)) + i * 1.3;
      const px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr * PE;
      drawGlow(ctx, px, py, 12, shade(ASTRES[i], 0, 0.6)); ctx.fillStyle = ASTRES[i]; ctx.beginPath(); ctx.arc(px, py, i === 3 ? 6 : 3.5, 0, TAU); ctx.fill();
    } else if (i === 7) {
      for (let q = 0; q < 40; q++) { const a = q / 40 * TAU + t * 0.02; ctx.fillStyle = `rgba(230,240,255,${0.4 + 0.5 * Math.sin(t * 3 + q)})`; ctx.fillRect(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * PE, 1.6, 1.6); }
    } else if (i === 8) {
      for (let q = 0; q < 24; q++) { const a = q / 24 * TAU + t * 0.6; drawGlow(ctx, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * PE, 4, 'rgba(255,200,120,0.8)'); }
    }
  });
  // la Terre au centre, avec la montagne du Purgatoire
  const er = bands[0].rIn * 0.85;
  const ge = ctx.createRadialGradient(cx - er * 0.3, cy - er * 0.3 * PE, 1, cx, cy, er);
  ge.addColorStop(0, '#6f9a6a'); ge.addColorStop(1, '#2a4a5a');
  ctx.fillStyle = ge; ctx.beginPath(); ctx.ellipse(cx, cy, er, er * PE, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#8a7a5a'; ctx.beginPath(); ctx.moveTo(cx + er * 0.2, cy); ctx.lineTo(cx + er * 0.45, cy - er * 0.7); ctx.lineTo(cx + er * 0.7, cy); ctx.closePath(); ctx.fill();
  // étiquettes sur l'arrière de chaque sphère
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  bands.forEach((b, i) => {
    const c = CIELS[i], hot = hover === i;
    const fs = Math.max(10, Math.min(14, (b.rOut - b.rIn) * PE * 0.75));
    ctx.font = `600 ${fs}px Cinzel, serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 4;
    ctx.fillStyle = hot ? '#fff6dc' : 'rgba(255,245,225,0.9)';
    ctx.fillText(`${c.numero} · ${c.nom.replace(/^Le Ciel (de la |de |du |des )/, '')}`, cx, cy - (b.rIn + b.rOut) / 2 * PE);
    ctx.shadowBlur = 0;
  });
  ctx.fillStyle = 'rgba(220,235,255,0.75)'; ctx.font = 'italic 12px "EB Garamond", serif';
  ctx.fillText('La Terre et la montagne du Purgatoire', cx, cy + er * PE + 12);
  ctx.fillStyle = '#ecd9a8'; ctx.font = '600 15px Cinzel, serif';
  ctx.fillText('« La gloria di colui che tutto move »', cx, Math.max(20, cy - R * PE - 22));
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
}
function paradisRingAt(cw, ch, mx, my) {
  const { cx, cy, bands } = paradisGeom(cw, ch);
  const d = Math.hypot(mx - cx, (my - cy) / PE);
  return bands.findIndex(b => d >= b.rIn && d < b.rOut);
}
