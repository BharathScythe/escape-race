// Room art for the four themes in themes.js: 8 walls each, drawn as SVG (viewBox 0 0 800 450).
// Each wall is (flags, room) => svg. Hard games use the same walls; extras check isHard(room).
// Every clickable thing is wrapped in hot(target, svg, label); target must match themes.js.
// Loaded after index.html's main script defines SCENES and ICONS (see initThemeArt there).

window.initThemeArt = function (api) {
  const { SCENES, ICONS, PZ, hot } = api;
  const isHard = r => String(r).endsWith('_hard');
  const R = (x, y, w, h, fill, ex) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${ex || ''}/>`;
  const T = (x, y, s, size, fill, ex) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Figtree, sans-serif" font-size="${size}" fill="${fill}" ${ex || ''}>${s}</text>`;
  const M = (x, y, s, size, fill, ex) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="${size}" fill="${fill}" ${ex || ''}>${s}</text>`;
  const defs = '<defs><filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
  const base = o => defs + R(0, 0, 800, 360, o.wall) + (o.top || '') + R(0, 350, 800, 12, o.skirt) + R(0, 360, 800, 90, o.floor) + (o.lines || '');
  const notes = (f, room) => PZ[room].trails.filter(tr => f[tr.steps[tr.steps.length - 1]]).length;

  // The exit: n wheels showing ? (or ✓ once out), sealed with chains and a count until every note is found.
  function exitLock(f, room, cx, y, color) {
    const n = PZ[room].targets.door.code.len; const w = 30, gap = 6, total = n * w + (n - 1) * gap; const x0 = cx - total / 2;
    return R(x0 - 8, y - 6, total + 16, 42, '#15171c', 'rx="5"') + Array.from({ length: n }, (_, i) =>
      R(x0 + i * (w + gap), y, w, 30, color || '#e8e2d0') + M(x0 + i * (w + gap) + w / 2, y + 21, f.escaped ? '✓' : '?', 16, '#15171c')).join('');
  }
  function seal(f, room, x, y, w, h, textColor, textY) {
    if (f.escaped) return '';
    const k = notes(f, room), N = PZ[room].trails.length;
    if (k === N) return '';
    return `<path d="M${x} ${y}L${x + w} ${y + h}M${x + w} ${y}L${x} ${y + h}" stroke="#9aa0a8" stroke-width="8" stroke-dasharray="14 6" opacity=".9"/>` +
      R(x + w / 2 - 16, y + h / 2 - 14, 32, 28, '#6d7179', 'rx="4"') + T(x + w / 2, textY || (y + h + 22), `Sealed · ${k} of ${N} notes found`, 13, textColor || '#e8e2d0');
  }
  const cobweb = (x, y, flip) => `<path d="M${x} ${y}l${flip ? -60 : 60} 0M${x} ${y}l0 60M${x} ${y}l${flip ? -45 : 45} 45M${x + (flip ? -20 : 20)} ${y}q${flip ? 8 : -8} 12 ${flip ? 20 : -20} 20M${x + (flip ? -40 : 40)} ${y}q${flip ? 16 : -16} 26 ${flip ? 40 : -40} 40" stroke="#c9c2b0" stroke-width="1" fill="none" opacity=".45"/>`;
  const dark = (on, label) => on ? `<g pointer-events="none"><rect width="800" height="450" fill="#03050a" opacity=".72"/>${label ? T(400, 430, label, 14, '#b9c3d9') : ''}</g>` : '';

  // little glyph pictures (centred on 0,0)
  const G = {
    eye: '<path d="M-14 0q14-12 28 0q-14 12-28 0z" fill="none" stroke="currentColor" stroke-width="3"/><circle r="4" fill="currentColor"/>',
    bird: '<path d="M-12 6q2-12 14-12l5-4 2 4 6 1-6 3q-2 9-13 9z" fill="currentColor"/>',
    ankh: '<ellipse cx="0" cy="-8" rx="6" ry="8" fill="none" stroke="currentColor" stroke-width="3"/><path d="M0 0v16M-9 3h18" stroke="currentColor" stroke-width="3"/>',
    sun: '<circle r="7" fill="currentColor"/><path d="M0-14v5M0 9v5M-14 0h5M9 0h5M-10-10l4 4M6 6l4 4M-10 10l4-4M6-6l4-4" stroke="currentColor" stroke-width="2.5"/>',
    snake: '<path d="M-14 8q7-14 14 0t14-4" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="14" cy="4" r="3" fill="currentColor"/>',
    moon: '<path d="M2-12A12 12 0 1 0 2 12A7 12 0 0 1 2-12Z" fill="currentColor"/>',
    skull: '<path d="M-10 2q-2-14 10-14t10 14v6h-20z" fill="currentColor"/><circle cx="-4" cy="0" r="3" fill="#000"/><circle cx="4" cy="0" r="3" fill="#000"/>',
  };
  const glyph = (name, x, y, color, s) => `<g transform="translate(${x} ${y}) scale(${s || 1})" style="color:${color}">${G[name]}</g>`;

  // =================================================================== MUSEUM
  const museumBase = o => base(Object.assign({ wall: '#d8d2c4', skirt: '#9a9385', floor: '#7d828c',
    lines: Array.from({ length: 9 }, (_, i) => `<path d="M${i * 100 - 50} 450L${i * 100 + 20} 360" stroke="#6b7079" stroke-width="2"/>`).join('') + '<path d="M0 400H800" stroke="#6b7079"/>',
    top: R(0, 0, 800, 22, '#c4bdae') }, o || {}));
  SCENES.museum = [
    // 0 lobby: security door, info desk (+ visitor book in Hard)
    (f, room) => museumBase() + T(400, 52, 'GRAND CITY MUSEUM', 22, '#6b6253', 'font-weight="800" letter-spacing="4"') +
      hot('door', R(310, 80, 180, 270, '#6f7680') + (f.escaped ? R(322, 92, 156, 258, '#101418') : R(322, 92, 156, 258, '#8b939e') + `<path d="M400 92v258" stroke="#5f6670" stroke-width="4"/>`) +
        exitLock(f, room, 400, 200) + seal(f, room, 310, 80, 180, 270, '#3a3326'), 'Security door') +
      hot('desk', R(60, 250, 200, 100, '#7a5a3a') + R(50, 240, 220, 14, '#5a3e26') + R(80, 214, 60, 26, '#b9a888') + T(110, 232, 'LOST+FOUND', 8, '#3a2e20', 'font-weight="700"') +
        '<path d="M180 240l10-40" stroke="#333" stroke-width="3"/><path d="M178 200q12-12 24 0" fill="none" stroke="#333" stroke-width="3"/>', 'Information desk') +
      (isHard(room) ? hot('guestbook', R(600, 250, 140, 100, '#7a5a3a') + R(590, 240, 160, 14, '#5a3e26') + '<path d="M630 236l40-6 40 6v4h-80z" fill="#efe6d2"/><path d="M670 230v10" stroke="#999"/>' + T(670, 300, 'VISITORS', 10, '#efe6d2', 'font-weight="700"'), 'Visitor book') : ''),
    // 1 Egyptian: hieroglyph key wall, standing sarcophagus
    (f, room) => museumBase({ wall: '#d9c39a', skirt: '#a88a5a' }) +
      hot('glyphs', R(60, 70, 300, 200, '#c9ad7d') + R(70, 80, 280, 180, '#bfa070') +
        ['eye', 'bird', 'ankh', 'sun', 'snake'].map((g, i) => glyph(g, 100 + i * 55, 140, '#5a3e1e', 1.2)).join('') +
        '<path d="M80 190h260M80 220h260" stroke="#a88a5a" stroke-width="2"/>' + T(210, 250, '— the scribe\'s numbers —', 12, '#5a3e1e', 'font-style="italic"'), 'Hieroglyph wall') +
      hot('sarcophagus', `<path d="M480 350V120q70-70 140 0v230z" fill="${f.sarcophagus ? '#2a1d10' : '#c9a24a'}"/>` +
        (f.sarcophagus ? `<path d="M480 350V120q70-70 140 0v230" fill="none" stroke="#c9a24a" stroke-width="6"/><path d="M620 120l50 20v220l-50-10z" fill="#c9a24a"/>`
          : `<ellipse cx="550" cy="130" rx="34" ry="40" fill="#e3c26a"/><path d="M520 170h60v150h-60z" fill="#2f5da8" opacity=".6"/>` + [0, 1, 2, 3].map(i => R(508 + i * 22, 300, 18, 24, '#3a2e20') + M(517 + i * 22, 317, '·', 14, '#e3c26a')).join('')), 'Sarcophagus'),
    // 2 Egyptian: canopic jars (lids: sun, bird, snake, eye), scarab case
    (f, room) => museumBase({ wall: '#d9c39a', skirt: '#a88a5a' }) + R(80, 260, 400, 16, '#7a5a3a') + R(90, 276, 380, 74, '#6a4a2a') +
      hot('jars', ['sun', 'bird', 'snake', 'eye'].map((g, i) => {
        const x = 120 + i * 90;
        return `<path d="M${x} 260q-10-60 6-90h48q16 30 6 90z" fill="#d8c8a0" stroke="#8a7650" stroke-width="2"/>` + R(x + 4, 152, 46, 22, '#b89a5a', 'rx="8"') + glyph(g, x + 27, 210, '#5a3e1e', .9);
      }).join(''), 'Canopic jars') +
      hot('scarabs', R(560, 170, 180, 120, '#bcd7e0', 'opacity=".55"') + R(550, 290, 200, 60, '#5a3e26') + [0, 1, 2, 3, 4].map(i => `<ellipse cx="${590 + i * 30}" cy="250" rx="9" ry="12" fill="${['#2f9e7a', '#c9a24a', '#2f5da8', '#b13030', '#2f9e7a'][i]}"/>`).join(''), 'Scarab case'),
    // 3 art hall: three paintings with year plaques
    (f, room) => museumBase({ wall: '#7a2a35', skirt: '#4a1a20', top: R(0, 0, 800, 22, '#5a1f28') }) +
      hot('paintings', [['A', 1888, '#5a7aa8', '#e3c26a'], ['B', 1907, '#6a9a4a', '#d0702a'], ['C', 1931, '#1a2240', '#f0e070']].map(([l, y, c1, c2], i) => {
        const x = 60 + i * 245;
        return R(x, 80, 190, 150, '#c9a24a') + R(x + 10, 90, 170, 130, c1) + `<circle cx="${x + 120}" cy="${130}" r="22" fill="${c2}"/>` + R(x + 10, 170, 170, 50, c2, 'opacity=".35"') +
          R(x + 50, 245, 90, 32, '#c9a24a') + M(x + 95, 266, `${l} · ${y}`, 13, '#3a2e10');
      }).join(''), 'Paintings'),
    // 4 art hall: statue on a plinth, guard's chair (+ diamond case in Hard)
    (f, room) => museumBase({ wall: '#7a2a35', skirt: '#4a1a20', top: R(0, 0, 800, 22, '#5a1f28') }) +
      hot('plinth', `<ellipse cx="330" cy="110" rx="26" ry="30" fill="#e8e4dc"/><path d="M300 140h60l12 120h-84z" fill="#e8e4dc"/>` + R(270, 260, 120, 90, '#bdb6a8') +
        (f.plinth ? R(290, 290, 80, 24, '#2a2622') : R(318, 296, 24, 14, '#7a7268')), 'Statue on a plinth') +
      hot('chair', `<path d="M90 350v-80h80v80M90 270v-60h10v60M160 270v-60h10v60M85 262h90" stroke="#3a2a1a" stroke-width="7" fill="none"/>` +
        (f.magnifier ? '' : '<circle cx="130" cy="252" r="12" fill="none" stroke="#c9a24a" stroke-width="4"/><path d="M138 260l14 10" stroke="#5a3a1a" stroke-width="5"/>'), 'Guard\'s chair') +
      (isHard(room) ? hot('gemcase', R(560, 170, 140, 110, '#bcd7e0', 'opacity=".5"') + R(550, 280, 160, 70, '#3a2a2a') +
        (f.gemcase ? '' : '<polygon points="630,205 650,225 630,260 610,225" fill="#e8f6ff" filter="url(#glow)"/>') + R(620, 295, 20, 14, '#c9a24a'), 'Diamond case') : ''),
    // 5 dinosaur hall: T-rex skull (6 upper, 5 lower teeth), 3-toed foot, dig pit
    (f, room) => museumBase({ wall: '#b9c4b0', skirt: '#7e8a74' }) +
      hot('skeleton', `<path d="M60 120q70-50 160-10l40 20-20 20h-150z" fill="#efe8d6" stroke="#9a907a" stroke-width="3"/>` +
        Array.from({ length: 6 }, (_, i) => `<path d="M${90 + i * 22} 150l6 14 6-14z" fill="#fff" stroke="#9a907a"/>`).join('') +
        `<path d="M70 180h150l-10 20h-130z" fill="#efe8d6" stroke="#9a907a" stroke-width="3"/>` +
        Array.from({ length: 5 }, (_, i) => `<path d="M${95 + i * 24} 180l6-14 6 14z" fill="#fff" stroke="#9a907a"/>`).join('') +
        `<circle cx="120" cy="125" r="9" fill="#5a5040"/><path d="M220 200q60 30 120 20q40-6 60 30v100" stroke="#efe8d6" stroke-width="16" fill="none"/>` +
        `<path d="M392 344L356 360M400 346V368M408 344L444 360" stroke="#efe8d6" stroke-width="9" stroke-linecap="round"/>` +
        `<path d="M356 360l-8 4M400 368v8M444 360l8 4" stroke="#9a907a" stroke-width="4" stroke-linecap="round"/>` +
        R(440, 250, 90, 56, '#2c2f36', 'rx="4"') + R(450, 260, 70, 20, f.skeleton ? '#73d38a' : '#5c2a2a'), 'T-rex skeleton') +
      hot('pit', `<ellipse cx="640" cy="390" rx="130" ry="36" fill="#c9a86a"/><ellipse cx="640" cy="390" rx="110" ry="26" fill="#d9bd85"/>` +
        (f.fossil ? R(605, 372, 70, 30, '#8a8270', 'rx="3"') : '<path d="M610 386q30-12 60 0" stroke="#b49460" stroke-width="3" fill="none"/>'), 'Dig pit'),
    // 6 archive: shelves of year boxes (1987 among them), microfilm reader
    (f, room) => museumBase({ wall: '#c9c1ae', skirt: '#8a8170' }) +
      hot('shelves', R(50, 60, 420, 290, '#5a4430') + [0, 1, 2].map(r => R(60, 150 + r * 90, 400, 8, '#3a2a1a') +
        [1961, 1974, 1987, 1999, 2008, 2019].map((yr, c) => R(70 + c * 64, 92 + r * 90, 56, 56, (r === 1 && yr === 1987 && f.keycard) ? '#a89a7a' : '#d9c9a3') + M(98 + c * 64, 126 + r * 90, r === 1 ? yr : yr - 10 + r * 20, 11, '#3a2e20')).join('')).join(''), 'Archive shelves') +
      hot('microfilm', R(560, 200, 180, 150, '#3a3f46') + R(580, 120, 140, 90, '#20242a') + R(590, 130, 120, 70, '#d9d4b0') + `<path d="M600 150h100M600 165h80M600 180h90" stroke="#555" stroke-width="3"/>`, 'Microfilm reader'),
    // 7 security office: 4 CCTV monitors, key cabinet
    (f, room) => museumBase({ wall: '#2e333b', skirt: '#1c1f24', floor: '#3a3f46', top: '' }) +
      hot('cctv', R(60, 70, 400, 220, '#1c1f24') + [0, 1, 2, 3].map(i => R(75 + (i % 2) * 190, 85 + Math.floor(i / 2) * 100, 180, 90, '#0d1a14') +
        M(165 + (i % 2) * 190, 135 + Math.floor(i / 2) * 100, `CAM ${i + 1}`, 14, '#5ad17a')).join('') + R(80, 300, 380, 20, '#3a3f46'), 'CCTV monitors') +
      hot('keycabinet', R(560, 110, 160, 220, '#7a8088') + R(572, 122, 136, 196, f.cabinet ? '#2a2e34' : '#9aa0a8') +
        (f.cabinet ? [0, 1, 2].map(i => `<circle cx="${600 + i * 40}" cy="180" r="6" fill="#c9a24a"/>`).join('') : '') +
        R(690, 200, 12, 30, '#2c2f36') + (isHard(room) ? [0, 1, 2].map(i => R(668, 240 + i * 14, 34, 10, '#c9ccd3')).join('') : ''), 'Key cabinet'),
  ];

  // =================================================================== SPACESHIP
  const shipBase = o => base(Object.assign({ wall: '#1f2b3d', skirt: '#11182a', floor: '#2a3448',
    top: Array.from({ length: 6 }, (_, i) => R(20 + i * 135, 30, 115, 300, '#26344a', 'rx="6"')).join('') + R(0, 0, 800, 16, '#3a4a66'),
    lines: Array.from({ length: 16 }, (_, i) => `<path d="M${i * 52} 360v90" stroke="#1d2536" stroke-width="3"/>`).join('') }, o || {}));
  SCENES.ship = [
    // 0 airlock: escape pod hatch, spacesuit locker (+ distress relay in Hard)
    (f, room) => shipBase() +
      hot('door', `<circle cx="400" cy="200" r="120" fill="#3a4a66"/><circle cx="400" cy="200" r="104" fill="${f.escaped ? '#05070c' : '#5a6a88'}"/>` +
        (f.escaped ? '<circle cx="440" cy="170" r="4" fill="#fff"/><circle cx="370" cy="230" r="3" fill="#fff"/>' : `<path d="M300 200h200M400 100v200" stroke="#3a4a66" stroke-width="6"/>`) +
        T(400, 44, 'ESCAPE POD', 16, '#ffb347', 'font-weight="800" letter-spacing="3"') + exitLock(f, room, 400, 322, '#cfe3ff') + seal(f, room, 290, 90, 220, 220, '#cfe3ff', 70), 'Escape pod hatch') +
      hot('suitlocker', R(60, 90, 150, 260, '#3a4a66') + R(70, 100, 130, 240, '#4a5c7c') + (f.valve ? '' : '<circle cx="135" cy="300" r="16" fill="none" stroke="#e05a4a" stroke-width="6"/>') +
        `<ellipse cx="135" cy="140" rx="26" ry="28" fill="#e8ecf2"/><path d="M110 170h50v100h-50z" fill="#e8ecf2"/>` + R(118, 128, 34, 18, '#7ad0ff', 'opacity=".6"'), 'Spacesuit locker') +
      (isHard(room) ? hot('relay', R(600, 140, 140, 160, '#2c3e55', 'rx="6"') + R(615, 155, 110, 40, f.relay ? '#1e5a3a' : '#0c1220') + M(670, 182, f.relay ? 'SENT' : 'RELAY', 14, f.relay ? '#7ee08a' : '#7ad0ff') +
        [0, 1, 2].map(r => [0, 1, 2].map(c => R(625 + c * 32, 210 + r * 26, 26, 20, '#c9d2e0', 'rx="3"')).join('')).join(''), 'Distress relay') : ''),
    // 1 bridge: ship's name, star chart (+ radio in Hard)
    (f, room) => shipBase() + T(400, 66, 'ISV SOLACE', 34, '#cfe3ff', 'font-weight="800" letter-spacing="8"') +
      hot('chart', R(160, 100, 480, 220, '#0a1020', 'rx="8"') + Array.from({ length: 40 }, (_, i) => `<circle cx="${180 + (i * 97) % 440}" cy="${115 + (i * 53) % 190}" r="1.3" fill="#8aa"/>`).join('') +
        `<circle cx="280" cy="180" r="16" fill="#fff" filter="url(#glow)"/>` + M(280, 220, 'VEGA · 482', 13, '#cfe3ff') +
        `<circle cx="470" cy="150" r="10" fill="#dfe" filter="url(#glow)"/>` + M(470, 182, 'DENEB · 375', 12, '#cfe3ff') +
        `<circle cx="560" cy="260" r="5" fill="#bcd"/>` + M(560, 284, 'ALTAIR · 129', 11, '#cfe3ff'), 'Star chart') +
      (isHard(room) ? hot('radio', R(660, 220, 110, 110, '#3a4a66', 'rx="6"') + R(672, 232, 86, 40, '#0c1220') + `<path d="M680 252q8-10 16 0t16 0 16 0 16 0" stroke="#7ad0ff" stroke-width="2" fill="none"/>` +
        (f.radio ? '<path d="M740 220l20-80" stroke="#c9d2e0" stroke-width="3"/>' : '') + `<circle cx="690" cy="300" r="12" fill="#c9d2e0"/><circle cx="740" cy="300" r="12" fill="#c9d2e0"/>`, 'Radio') : ''),
    // 2 bridge: navigation screen, captain's chair with badge A
    (f, room) => shipBase() +
      hot('nav', R(90, 80, 360, 200, '#0a1020', 'rx="8"') + R(90, 280, 360, 30, '#3a4a66') +
        (f.course ? `<path d="M140 240Q260 120 400 140" stroke="#7ee08a" stroke-width="3" fill="none" stroke-dasharray="8 6"/>` + M(270, 120, 'COURSE SET', 16, '#7ee08a') : M(270, 185, f.log ? 'ENTER SECTOR' : 'NAV OFFLINE', 18, '#ff7a7a')), 'Navigation screen') +
      hot('chair', `<path d="M540 350v-60h150v60" stroke="#11182a" stroke-width="10" fill="none"/>` + R(545, 140, 140, 160, '#3a4a66', 'rx="18"') + R(530, 260, 170, 30, '#4a5c7c', 'rx="10"') +
        `<circle cx="615" cy="190" r="22" fill="#ffb347"/>` + T(615, 199, 'A', 24, '#1f2b3d', 'font-weight="800"'), 'Captain\'s chair'),
    // 3 engine room: reactor (TEMP 612), coolant valves with gauges
    (f, room) => shipBase({ wall: '#2b2a35' }) +
      hot('reactor', `<ellipse cx="250" cy="330" rx="130" ry="20" fill="#11182a"/>` + R(150, 120, 200, 210, '#3a4a66', 'rx="20"') +
        `<circle cx="250" cy="210" r="60" fill="${f.reactor ? '#7ad0ff' : (f.coolant ? '#5a6a88' : '#ff5a3a')}" filter="url(#glow)" opacity=".85"/>` +
        R(190, 80, 120, 34, '#0a1020', 'rx="4"') + M(250, 103, 'TEMP 612', 15, f.coolant ? '#7ad0ff' : '#ff7a5a'), 'Reactor') +
      hot('valves', [['RED', 3, '#e05a4a'], ['BLUE', 1, '#4a8ae0'], ['GREEN', 4, '#4ac07a']].map(([n, v, c], i) => {
        const x = 470 + i * 100;
        return `<circle cx="${x}" cy="130" r="30" fill="#e8ecf2"/>` + M(x, 140, v, 26, '#1f2b3d') + T(x, 180, n, 12, c, 'font-weight="700"') +
          R(x - 8, 190, 16, 120, '#5a6a88') + `<circle cx="${x}" cy="250" r="${f.coolant ? 22 : 18}" fill="none" stroke="${c}" stroke-width="7"/>`;
      }).join(''), 'Coolant valves'),
    // 4 engine room: tool wall
    (f, room) => shipBase({ wall: '#2b2a35' }) +
      hot('tools', R(120, 70, 560, 260, '#3a3f4a', 'rx="6"') + Array.from({ length: 24 }, (_, i) => `<circle cx="${140 + (i % 12) * 46}" cy="${90 + Math.floor(i / 12) * 220}" r="3" fill="#222"/>`).join('') +
        ['M180 130l40 140', 'M260 130h80v20h-80z', 'M400 120v150', 'M470 130l60 120', 'M600 130q30 70 0 140'].map((d, i) =>
          `<path d="${d}" stroke="#1d2230" stroke-width="10" fill="none" opacity=".6"/>` + (i === 2 && !f.wrench ? `<path d="M400 120v150M388 120h24v-14h-24z" stroke="#c9d2e0" stroke-width="10" fill="#c9d2e0"/>` : '')).join(''), 'Tool wall'),
    // 5 crew quarters: bunks, crew photo, engineer's locker (+ drawer in Hard)
    (f, room) => shipBase({ wall: '#2a3247' }) +
      hot('bunks', R(40, 120, 260, 230, '#3a4a66') + R(50, 140, 240, 50, '#5a6a88') + R(50, 240, 240, 50, '#5a6a88') + R(60, 150, 60, 30, '#e8ecf2', 'rx="6"') + R(60, 250, 60, 30, '#e8ecf2', 'rx="6"'), 'Bunks') +
      hot('photo', R(340, 90, 150, 100, '#e8ecf2') + [0, 1, 2, 3].map(i => `<circle cx="${365 + i * 33}" cy="130" r="11" fill="#d8bfa3"/><path d="M${352 + i * 33} 175q13-30 26 0z" fill="${['#ffb347', '#ff7aa8', '#7ad0ff', '#7ee08a'][i]}"/>`).join(''), 'Crew photo') +
      hot('crewlocker', R(560, 90, 130, 260, '#4a5c7c') + R(570, 100, 110, 240, f.locker ? '#1d2536' : '#5a6c8c') + R(590, 200, 70, 40, '#f3e46a') + T(625, 224, isHard(room) ? 'PILOT ONLY' : 'ENGINEER', 10, '#3a3a10', 'font-weight="700"') +
        R(660, 150, 14, 30, '#2c2f36'), 'Personal locker') +
      (isHard(room) ? hot('drawer', R(340, 270, 150, 80, '#3a4a66') + R(350, 280, 130, 26, f.antenna ? '#2a3448' : '#4a5c7c') + R(400, 289, 30, 6, '#c9d2e0'), 'Bunk drawer') : ''),
    // 6 med bay: medicine cabinet, scanner bed (Hard: RESTORA on screen)
    (f, room) => shipBase({ wall: '#2c3f4a' }) +
      hot('medcab', R(80, 80, 220, 200, '#e8ecf2') + R(92, 92, 196, 176, f.medcab ? '#cfe3ff' : '#c9d2e0') + `<path d="M190 130v60M160 160h60" stroke="#e05a4a" stroke-width="14"/>` + R(270, 170, 12, 28, '#2c2f36'), 'Medicine cabinet') +
      hot('scanner', R(400, 270, 340, 30, '#e8ecf2', 'rx="10"') + R(420, 300, 20, 50, '#5a6a88') + R(700, 300, 20, 50, '#5a6a88') + R(460, 90, 240, 130, '#0a1020', 'rx="6"') +
        (isHard(room) ? M(580, 145, 'LAST DOSE:', 14, '#7ad0ff') + M(580, 175, 'RESTORA 20mg', 18, '#7ee08a') : `<path d="M480 160h50l12-30 16 60 14-40 10 10h98" stroke="#7ee08a" stroke-width="3" fill="none"/>`), 'Scanner bed'),
    // 7 greenhouse: water tank, fern planter
    (f, room) => shipBase({ wall: '#1d3a2e' }) +
      hot('tank', R(80, 70, 180, 260, '#7ad0ff', 'opacity=".35" rx="10"') + R(80, 70, 180, 260, 'none', 'stroke="#c9d2e0" stroke-width="6" rx="10"') +
        R(90, f.water ? 200 : 290, 160, f.water ? 125 : 35, '#4a8ae0', 'opacity=".7"') + R(260, 280, 80, 14, '#c9d2e0') +
        (f.water ? '<circle cx="300" cy="287" r="16" fill="none" stroke="#e05a4a" stroke-width="6"/>' : '<circle cx="300" cy="287" r="6" fill="#555"/>'), 'Water tank') +
      hot('plants', R(400, 270, 340, 80, '#5a3a22') + R(400, 262, 340, 14, '#7a5a32') + R(530, 300, 80, 26, '#e8ecf2') + T(570, 318, 'FERN', 14, '#1d3a2e', 'font-weight="800"') +
        Array.from({ length: 6 }, (_, i) => `<path d="M${430 + i * 55} 262q-${f.water ? 6 : 24} -${f.water ? 70 : 30} ${f.water ? -24 : 10} -${f.water ? 90 : 40}" stroke="${f.water ? '#4ac07a' : '#8a8a4a'}" stroke-width="6" fill="none"/>`).join(''), 'Fern planter'),
  ];

  // =================================================================== PIRATE SHIP
  const pirateBase = o => base(Object.assign({ wall: '#5a3a22', skirt: '#3a2414', floor: '#6a4426',
    top: Array.from({ length: 9 }, (_, i) => `<path d="M0 ${i * 40}H800" stroke="#4a2e18" stroke-width="3"/>`).join('') + Array.from({ length: 5 }, (_, i) => R(i * 200 + 90, 0, 20, 360, '#3a2414')).join(''),
    lines: Array.from({ length: 6 }, (_, i) => `<path d="M0 ${370 + i * 15}H800" stroke="#4a2e18" stroke-width="2"/>`).join('') }, o || {}));
  SCENES.pirate = [
    // 0 lower deck: barred hatch, rope coil (+ ship's bell in Hard)
    (f, room) => pirateBase() +
      hot('door', R(300, 70, 200, 280, '#3a2414') + R(312, 82, 176, 256, f.escaped ? '#9cc6df' : '#7a5232') +
        (f.escaped ? '' : '<path d="M312 150h176M312 270h176" stroke="#2a1a0c" stroke-width="10"/>') + exitLock(f, room, 400, 196, '#e8d9b0') + seal(f, room, 300, 70, 200, 280, '#f3e6c8'), 'Barred hatch') +
      hot('rope', f.rope ? '' : Array.from({ length: 5 }, (_, i) => `<ellipse cx="150" cy="${335 - i * 9}" rx="${60 - i * 6}" ry="14" fill="none" stroke="#c9a86a" stroke-width="7"/>`).join(''), 'Coil of rope') +
      (isHard(room) ? hot('bell', `<path d="M650 90v20" stroke="#3a2414" stroke-width="6"/><path d="M610 200q0-90 40-90t40 90z" fill="#c9a24a"/>` + R(600, 196, 100, 10, '#a9822f') + `<circle cx="650" cy="214" r="8" fill="#a9822f"/>`, 'Ship\'s bell') : ''),
    // 1 captain's cabin: treasure chest, desk (+ logbook in Hard)
    (f, room) => pirateBase() +
      hot('desk', R(80, 230, 300, 20, '#3a2414') + R(95, 250, 20, 100, '#3a2414') + R(345, 250, 20, 100, '#3a2414') + `<path d="M140 228l10-30" stroke="#e8e0c8" stroke-width="3"/>` + `<circle cx="180" cy="220" r="10" fill="#1a1a2a"/>`, 'Captain\'s desk') +
      (isHard(room) ? hot('logbook', '<path d="M240 226l40-8 40 8v6h-80z" fill="#7a2a1a"/><path d="M245 224l35-6v8z" fill="#efe6d2"/><path d="M280 218l35 6-35 2z" fill="#e2d7bf"/>', 'Logbook') : '') +
      hot('chest', `<path d="M460 350v-90h240v90z" fill="#7a4a22"/>` + (f.chest ? `<polygon points="460,260 700,260 680,200 480,200" fill="#8a5a2a"/>` + Array.from({ length: 8 }, (_, i) => `<circle cx="${490 + i * 26}" cy="255" r="9" fill="#e3c26a"/>`).join('')
        : `<path d="M460 260q120-60 240 0z" fill="#8a5a2a"/>`) + `<path d="M460 290h240M520 260v90M640 260v90" stroke="#c9a24a" stroke-width="6"/>` + R(560, 280, 40, 34, '#c9a24a') + [0, 1, 2].map(i => R(565 + i * 11, 292, 8, 12, '#3a2414')).join(''), 'Treasure chest'),
    // 2 captain's cabin: the map (ship with 3 masts), parrot perch
    (f, room) => pirateBase() +
      hot('map', R(80, 70, 380, 250, '#e8d9b0') + `<path d="M120 140q60-30 100 10t80 0M300 240q40-50 100-20" stroke="#8a6a3a" stroke-width="3" fill="none"/>` + M(360, 200, 'X', 30, '#b13030') +
        `<path d="M130 290h120l-14 18h-92z" fill="#5a3a22"/>` + [150, 190, 230].map(x => `<path d="M${x} 290v-60" stroke="#3a2414" stroke-width="3"/><path d="M${x} 236l18 10-18 10z" fill="#efe6d2"/>`).join('') + glyph('skull', 190, 222, '#1a1a1a', .6), 'Captain\'s map') +
      hot('parrot', `<path d="M600 350v-200M560 150h80" stroke="#3a2414" stroke-width="8"/><ellipse cx="610" cy="120" rx="22" ry="32" fill="#2fa04a"/><circle cx="618" cy="96" r="14" fill="#2fa04a"/>` +
        `<path d="M628 94l14 6-12 8z" fill="#f2c14e"/><circle cx="622" cy="92" r="3" fill="#000"/><path d="M596 140l-10 40 20-10z" fill="#d04040"/>`, 'Parrot'),
    // 3 cargo hold: crates (one high up), barrels
    (f, room) => pirateBase({ wall: '#4a3020' }) +
      hot('crates', R(80, 250, 120, 100, '#9a7a4a') + R(200, 250, 120, 100, '#8a6a3a') + R(130, 150, 120, 100, '#9a7a4a') +
        (f.crate ? '' : R(170, 50, 110, 100, '#a8885a')) + ['M80 250l120 100M200 250l120 100M130 150l120 100'].map(d => `<path d="${d}" stroke="#6a4a22" stroke-width="5"/>`).join(''), 'Stacked crates') +
      hot('barrels', [460, 580, 520].map((x, i) => `<path d="M${x - 50} ${i === 2 ? 250 : 350}q-10-50 0-100h100q10 50 0 100z" fill="#7a4a22"/><path d="M${x - 54} ${i === 2 ? 200 : 300}h108" stroke="#3a3a3a" stroke-width="5"/>`).join(''), 'Barrels'),
    // 4 cargo hold: cannon, cannonball pyramid (3-2-1)
    (f, room) => pirateBase({ wall: '#4a3020' }) + R(300, 120, 120, 90, '#1a1410', 'rx="40"') +
      hot('cannon', `<path d="M140 300l220-60 10 40-220 60z" fill="#2a2a2e"/><circle cx="170" cy="320" r="34" fill="#5a3a22"/><circle cx="170" cy="320" r="10" fill="#2a2a2e"/>` +
        (f.fuse ? `<path d="M200 288q-6-24 10-34" stroke="#c9a86a" stroke-width="4" fill="none"/>` : '') + (f.boom ? '<circle cx="380" cy="250" r="30" fill="#bbb" opacity=".5"/>' : ''), 'Cannon') +
      hot('balls', [[0, 3], [1, 2], [2, 1]].map(([row, n]) => Array.from({ length: n }, (_, i) => `<circle cx="${600 + i * 40 + row * 20}" cy="${330 - row * 34}" r="19" fill="#2a2a2e"/>`).join('')).join(''), 'Cannonballs'),
    // 5 galley: stove with pot, flint shelf, 7 rum bottles
    (f, room) => pirateBase() +
      hot('stove', R(300, 220, 220, 130, '#2a2a2e') + R(320, 270, 80, 60, f.fire ? '#ff8a3a' : '#121214') + (f.fire ? '<path d="M340 330q10-40 20-10q10-30 20 10z" fill="#ffd166"/>' : ''), 'Stove') +
      hot('pot', `<path d="M370 220q0-60 70-60t70 60z" fill="#3a3a40"/><ellipse cx="440" cy="162" rx="70" ry="10" fill="${f.fire ? '#8a6a3a' : '#5a4a2a'}"/>` +
        (f.fire ? '<path d="M420 150q-8-20 6-34M460 150q8-20-6-34" stroke="#ddd" stroke-width="5" fill="none" opacity=".5"/>' : ''), 'Pot of stew') +
      R(40, 120, 220, 12, '#3a2414') +
      hot('shelf', R(50, 90, 40, 30, '#e8e0c8') + T(70, 110, 'SALT', 9, '#3a2414', 'font-weight="700"') + (f.flint ? '' : R(100, 104, 26, 16, '#7a7a80')), 'Galley shelf') +
      R(560, 120, 220, 12, '#3a2414') +
      hot('rum', Array.from({ length: 7 }, (_, i) => `<path d="M${572 + i * 30} 120v-36q0-8 6-10v-14h8v14q6 2 6 10v36z" fill="#3a6a3a" opacity=".85"/>`).join(''), 'Rum bottles'),
    // 6 map room: globe, telescope at a porthole
    (f, room) => pirateBase() + `<circle cx="600" cy="140" r="60" fill="#3a2414"/><circle cx="600" cy="140" r="48" fill="#1a2a4a"/>` + (f.telescope ? '<circle cx="620" cy="130" r="5" fill="#fff6b0" filter="url(#glow)"/>' : '') +
      hot('globe', `<path d="M240 350v-30h80v30M280 320v-20" stroke="#3a2414" stroke-width="8"/><circle cx="280" cy="220" r="80" fill="#3a6aa0"/>` +
        `<path d="M230 190q30 20 40-10t50 10M240 260q40-20 70 0" stroke="#7aa05a" stroke-width="12" fill="none"/>` + `<path d="M200 220h160" stroke="#c9a24a" stroke-width="5"/>` +
        (f.globe ? '<path d="M200 214h160" stroke="#000" stroke-width="3"/>' : [0, 1, 2].map(i => R(258 + i * 15, 212, 12, 16, '#e8d9b0')).join('')), 'Globe') +
      hot('telescope', `<path d="M470 350l40-90 40 90M510 260v-30" stroke="#3a2414" stroke-width="6"/><path d="M480 240l110-80 14 18-110 80z" fill="#c9a24a"/>` +
        (f.telescope ? '<circle cx="597" cy="168" r="9" fill="#9cc6df"/>' : '<circle cx="597" cy="168" r="9" fill="#1a1410"/>'), 'Telescope'),
    // 7 the brig: cell (with the note on the back wall), skeleton with boat hook (one skull)
    (f, room) => pirateBase({ wall: '#3a2a1e' }) +
      hot('cell', R(300, 70, 440, 280, '#24180f') + R(640, 140, 40, 50, '#e8d9b0', f.cell ? 'opacity="0"' : '') +
        (f.boom ? '<path d="M560 70l40 60-30 40 50 30-20 60h90V70z" fill="#5a3a22"/>' : '') +
        Array.from({ length: 9 }, (_, i) => (f.boom && (i === 6 || i === 7)) ? '' : `<path d="M${320 + i * 48} 70v280" stroke="#5a5a60" stroke-width="8"/>`).join('') + `<path d="M300 90h440M300 330h440" stroke="#5a5a60" stroke-width="8"/>`, 'Cell') +
      hot('skeleton', glyph('skull', 140, 230, '#efe8d6', 1.6) + `<path d="M140 250v60M110 270h60M140 310l-20 40M140 310l20 40" stroke="#efe8d6" stroke-width="6"/>` +
        (f.hook ? '' : '<path d="M180 270v-150" stroke="#7a5a32" stroke-width="5"/><path d="M180 120q20-6 14-24" stroke="#7a8088" stroke-width="5" fill="none"/>'), 'Skeleton'),
  ];

  // =================================================================== TEMPLE
  const templeBase = o => base(Object.assign({ wall: '#6b6352', skirt: '#4a4436', floor: '#5a5444',
    top: Array.from({ length: 9 }, (_, r) => Array.from({ length: 9 }, (_, c) => R(c * 96 + (r % 2) * 48 - 40, r * 40, 92, 36, '#736a58', 'rx="3"')).join('')).join('') +
      '<path d="M0 30q40 30 20 70M780 20q-30 40-10 90" stroke="#4a7a3a" stroke-width="6" fill="none"/>',
    lines: Array.from({ length: 10 }, (_, i) => `<path d="M${i * 90} 360l-30 90" stroke="#4a4436" stroke-width="2"/>`).join('') }, o || {}));
  const dial = (x, y, done) => `<circle cx="${x}" cy="${y}" r="18" fill="#4a4436" stroke="#c9a24a" stroke-width="3"/>` + `<path d="M${x} ${y}v-12" stroke="#c9a24a" stroke-width="3"/>` + (done ? `<circle cx="${x}" cy="${y}" r="5" fill="#7ed6a5"/>` : '');
  SCENES.temple = [
    // 0 entrance: stone door, jaguar statue
    (f, room) => templeBase() +
      hot('door', R(290, 60, 220, 290, '#4a4436') + R(305, 75, 190, 275, f.escaped ? '#9cc6a0' : '#8a806a') +
        (f.escaped ? '' : `<path d="M330 120h140M330 300h140" stroke="#5a5444" stroke-width="5"/>` + glyph('sun', 400, 105, '#c9a24a', 1.2)) +
        exitLock(f, room, 400, 196, '#d9cfb0') + seal(f, room, 290, 60, 220, 290, '#f3ead0'), 'Stone door') +
      hot('jaguar', R(600, 260, 140, 90, '#5a5444') + `<path d="M620 260q0-90 50-110q50 20 50 110z" fill="#7a705c"/><circle cx="650" cy="190" r="5" fill="#c9a24a"/><circle cx="690" cy="190" r="5" fill="#c9a24a"/>` +
        `<path d="M650 215q20 ${f.jaguar ? 28 : 10} 40 0" stroke="#3a3426" stroke-width="5" fill="${f.jaguar ? '#2a2620' : 'none'}"/>` + (f.jaguar ? '' : `<ellipse cx="670" cy="255" rx="18" ry="8" fill="#3a3426"/>`), 'Jaguar statue'),
    // 1 idol chamber: idol on a pressure pedestal (+ vine rope in Hard)
    (f, room) => templeBase({ wall: '#5f5848' }) +
      hot('idol', R(330, 230, 140, 120, '#7a705c') + R(320, 220, 160, 16, '#8a806a') +
        (f.swap ? `<path d="M370 220q0-40 30-40t30 40z" fill="#c9b07a"/>` : `<path d="M370 220l6-50q24-30 48 0l6 50z" fill="#e3c26a" filter="url(#glow)"/><circle cx="392" cy="186" r="3" fill="#7a5a1a"/><circle cx="408" cy="186" r="3" fill="#7a5a1a"/>`), 'Golden idol') +
      `<path d="M120 0q30 160-20 360M690 0q-40 140 30 360" stroke="#4a7a3a" stroke-width="10" fill="none"/>` +
      (isHard(room) ? hot('rope', f.rope ? '' : `<path d="M560 120q20 80-10 230" stroke="#6a8a3a" stroke-width="9" fill="none"/><ellipse cx="550" cy="345" rx="16" ry="8" fill="none" stroke="#6a8a3a" stroke-width="6"/>`, 'Vine rope') : ''),
    // 2 idol chamber: carvings (dot-and-bar numbers, sun and moon)
    (f, room) => templeBase({ wall: '#5f5848' }) +
      hot('carvings', R(100, 60, 600, 260, '#8a806a') + R(115, 75, 570, 230, '#9a907a') +
        `<circle cx="180" cy="130" r="8" fill="#4a4436"/>` + R(230, 124, 70, 14, '#4a4436', 'rx="6"') +
        T(165, 165, 'one', 14, '#3a3426', 'font-style="italic"') + T(265, 165, 'five', 14, '#3a3426', 'font-style="italic"') +
        [0, 1].map(i => `<circle cx="${370 + i * 22}" cy="118" r="7" fill="#4a4436"/>`).join('') + R(355, 132, 52, 12, '#4a4436', 'rx="5"') + T(381, 165, 'seven', 14, '#3a3426', 'font-style="italic"') +
        glyph('sun', 520, 128, '#e3b23c', 1.4) + glyph('moon', 600, 128, '#1e2140', 1.4) +
        `<path d="M140 210h520" stroke="#6a6048" stroke-width="3"/>` + Array.from({ length: 6 }, (_, i) => R(160 + i * 85, 235, 60, 50, '#6a6048', 'rx="4"')).join(''), 'Wall carvings'),
    // 3 trap corridor: six pressure plates (1 moon, 2 sun, 3 moon, 4 sun, 5 sun, 6 moon), spike pit, sandbag
    (f, room) => templeBase() +
      hot('plates', ['moon', 'sun', 'moon', 'sun', 'sun', 'moon'].map((g, i) => {
        const x = 90 + i * 100;
        return `<path d="M${x} 440l20-60h70l20 60z" fill="${f.plates ? '#6a6048' : '#7a705c'}" stroke="#4a4436" stroke-width="3"/>` + glyph(g, x + 55, 402, g === 'sun' ? '#f0c040' : '#1e2140', 1) + M(x + 55, 437, i + 1, 15, '#1a1712');
      }).join(''), 'Pressure plates') +
      hot('pit', R(260, 250, 280, 80, '#1a1712') + (f.plates ? '' : Array.from({ length: 9 }, (_, i) => `<path d="M${275 + i * 30} 330l8-50 8 50z" fill="#9a9a9a"/>`).join('')) +
        (f.pit ? '' : R(380, 300, 40, 26, '#8a806a')), 'Spike pit') +
      hot('sandbag', f.sandbag ? '' : `<path d="M640 340q-10-50 30-56q40 6 30 56z" fill="#c9b07a"/><path d="M660 288l10-10 10 10" stroke="#7a6a4a" stroke-width="4" fill="none"/>`, 'Sandbag'),
    // 4 star chamber: ceiling stars (dark until the torch), sundial with three dials
    (f, room) => templeBase({ wall: '#4a4436' }) +
      hot('stars', R(60, 20, 680, 140, '#2a2620', 'rx="10"') + (f.stars ?
        [[120, 60], [150, 90], [180, 60]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#f2e6a0" filter="url(#glow)"/>`).join('') + T(150, 130, 'JAGUAR', 13, '#f2e6a0', 'font-weight="700"') +
        `<circle cx="400" cy="70" r="6" fill="#f2e6a0" filter="url(#glow)"/>` + T(400, 130, 'EAGLE', 13, '#f2e6a0', 'font-weight="700"') +
        [[600, 50], [630, 75], [660, 55], [690, 85]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#f2e6a0" filter="url(#glow)"/>`).join('') + T(645, 130, 'SERPENT', 13, '#f2e6a0', 'font-weight="700"')
        : T(400, 95, 'darkness…', 16, '#5a5444', 'font-style="italic"')), 'Ceiling') +
      hot('sundial', R(300, 250, 200, 100, '#7a705c') + `<ellipse cx="400" cy="250" rx="120" ry="30" fill="#9a907a"/><path d="M400 250l40-60v60z" fill="#5a5444"/>` +
        dial(340, 300, f.sundial) + dial(400, 300, f.sundial) + dial(460, 300, f.sundial), 'Sundial'),
    // 5 star chamber: wall torches, mosaic floor (+ altar in Hard)
    (f, room) => templeBase({ wall: '#4a4436' }) +
      hot('torches', [150, 650].map((x, i) => `<path d="M${x} 210v-60" stroke="#5a3a22" stroke-width="10"/>` + R(x - 14, 200, 28, 10, '#3a3426') +
        ((i === 0 && f.torch) ? '' : `<path d="M${x} 150q16-20 0-50q-16 30 0 50z" fill="#ffb347" filter="url(#glow)"/>`)).join(''), 'Wall torches') +
      hot('mosaic', Array.from({ length: 30 }, (_, i) => R(220 + (i % 10) * 36, 372 + Math.floor(i / 10) * 24, 32, 20, ['#c9a24a', '#2f8a7a', '#a8402a'][i % 3], (i === 14 && !f.knife) ? 'transform="rotate(6 ' + (220 + 4 * 36 + 16) + ' 406)"' : '')).join(''), 'Mosaic floor') +
      (isHard(room) ? hot('altar', R(350, 220, 100, 120, '#7a705c') + R(340, 210, 120, 16, '#8a806a') + `<circle cx="400" cy="218" r="${f.altar ? 14 : 12}" fill="${f.altar ? '#e3c26a' : '#3a3426'}"/>`, 'Small altar') : ''),
    // 6 flooded crypt: sarcophagus with arrows (up, up, down), water (+ pool in Hard)
    (f, room) => templeBase({ wall: '#4a5048' }) +
      hot('sarcophagus', R(220, 220, 360, 110, '#7a705c') + (f.crypt ? `<path d="M220 220l360 0-20-40h-320z" fill="#8a806a" transform="rotate(-6 400 200)"/>` : R(210, 200, 380, 24, '#8a806a')) +
        (f.crypt ? '' : ['↑', '↑', '↓'].map((a, i) => T(330 + i * 70, 218, a, 22, '#3a3426', 'font-weight="800"')).join('')), 'Sarcophagus') +
      (f.levers ? '' : R(0, 300, 800, 150, '#2a5a6a', 'opacity=".65" pointer-events="none"')) +
      (isHard(room) ? hot('pool', `<ellipse cx="680" cy="400" rx="100" ry="30" fill="#1f4a5a"/>` + (f.medallion ? '' : `<circle cx="690" cy="404" r="9" fill="#e3c26a" filter="url(#glow)"/>`), 'Deep pool') : ''),
    // 7 flooded crypt: vines hiding three levers
    (f, room) => templeBase({ wall: '#4a5048' }) +
      hot('levers', R(220, 120, 360, 180, '#5a5444') + [0, 1, 2].map(i => R(290 + i * 100, 170, 20, 90, '#3a3426') +
        `<circle cx="${300 + i * 100}" cy="${f.levers ? (i === 2 ? 270 : 160) : 215}" r="14" fill="#8a806a"/>`).join(''), 'Lever wall') +
      hot('vines', f.vines ? '' : Array.from({ length: 12 }, (_, i) => `<path d="M${210 + i * 33} 100q${i % 2 ? 20 : -20} 100 0 220" stroke="#3a7a2a" stroke-width="12" fill="none"/>`).join(''), 'Vines'),
  ];

  SCENES.museum_hard = SCENES.museum; SCENES.ship_hard = SCENES.ship; SCENES.pirate_hard = SCENES.pirate; SCENES.temple_hard = SCENES.temple;

  // A few item pictures; anything without one gets a lettered token from index.html.
  Object.assign(ICONS, {
    magnifier: '<svg viewBox="0 0 40 40"><circle cx="17" cy="17" r="9" fill="#bfe6f2" stroke="#c9a24a" stroke-width="4"/><path d="M24 24l9 9" stroke="#5a3a1a" stroke-width="5"/></svg>',
    wrench: '<svg viewBox="0 0 40 40"><path d="M10 30l14-14" stroke="#c9d2e0" stroke-width="6"/><circle cx="27" cy="13" r="7" fill="none" stroke="#c9d2e0" stroke-width="5"/></svg>',
    valvewheel: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="12" fill="none" stroke="#e05a4a" stroke-width="5"/><path d="M20 8v24M8 20h24" stroke="#e05a4a" stroke-width="3"/></svg>',
    idol: '<svg viewBox="0 0 40 40"><path d="M12 34l3-20q5-8 10 0l3 20z" fill="#e3c26a"/><circle cx="17" cy="15" r="1.5" fill="#7a5a1a"/><circle cx="23" cy="15" r="1.5" fill="#7a5a1a"/></svg>',
    torch: '<svg viewBox="0 0 40 40"><path d="M20 36V18" stroke="#5a3a22" stroke-width="5"/><path d="M20 18q8-8 0-14q-8 6 0 14z" fill="#ffb347"/></svg>',
  });
};
