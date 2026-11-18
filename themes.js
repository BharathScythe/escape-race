// Four more co-op themes, each with a Normal and a Hard version:
// The Museum, The Spaceship, The Pirate Ship and The Temple.
// Same shape as puzzles.js (read its header). Loaded after puzzles.js.
// Code answers are SHA-256 hashes of "escape-race|ANSWER"; the solutions are in README.md.

(function () {
  const P = window.PUZZLES;
  const already = (h, flag, extra) => `Already found by ${h.by(flag)}.${extra ? ' ' + extra : ''}`;
  const H = s => s; // marks a hash, for readability

  // ---- small builders for the common kinds of target ----
  // pick something up
  const find = (flag, item, feed, title, msg, doneMsg) => ({
    inspect: h => {
      if (h.done(flag)) return already(h, flag, doneMsg);
      h.give(item); h.set(flag, feed);
      return { title, msg };
    },
  });
  // read a clue (marks the step done the first time anyone reads it)
  const read = (flag, feed, title, msg, need, locked) => ({
    inspect: h => {
      if (need && !need(h)) return locked;
      h.set(flag, feed);
      return { title, msg };
    },
  });
  // a lock that takes a code
  const lock = o => ({
    inspect: h => {
      if (h.done(o.flag)) return already(h, o.flag, o.doneMsg);
      if (o.need && !o.need(h)) return typeof o.locked === 'function' ? o.locked(h) : o.locked;
      return { msg: o.prompt, prompt: true };
    },
    code: {
      kind: o.kind, len: o.len, hashes: [o.hash],
      open: h => (!o.need || o.need(h)) && !h.done(o.flag),
      solve: h => { if (o.give) h.give(o.give); h.set(o.flag, o.feed); return { title: o.title, msg: o.msg }; },
    },
  });
  // use an item on something
  const useOn = (flag, item, o) => ({
    inspect: h => h.done(flag) ? already(h, flag, o.doneMsg) : o.before,
    use: {
      [item]: h => {
        if (h.done(flag)) return already(h, flag, o.doneMsg);
        if (o.need && !o.need(h)) return o.locked;
        if (!o.keep) h.take(item);
        if (o.give) h.give(o.give);
        h.set(flag, o.feed);
        return { title: o.title, msg: o.msg };
      },
    },
  });
  const flavor = msg => ({ inspect: () => msg });
  const exitDoor = (kind, len, hash, prompt, win) => ({
    inspect: () => ({ msg: prompt, prompt: true }),
    code: { kind, len, hashes: [hash], open: () => true, solve: h => { h.escape(); return { title: 'You escaped!', msg: win }; } },
  });
  const derive = (base, o) => Object.assign({}, base, o, {
    items: Object.assign({}, base.items, o.items || {}),
    targets: Object.assign({}, base.targets, o.targets || {}),
    hints: Object.assign({}, base.hints, o.hints || {}),
  });
  const stepsOf = (trails) => trails.flatMap(t => t.steps).concat('escaped');

  // =====================================================================
  // THE MUSEUM: locked in the Grand City Museum after hours. Exit: 4 digits (4334).
  // =====================================================================
  const museumTrails = [
    { id: 'pharaoh', name: 'Pharaoh trail', color: '#e3b04b', steps: ['glyphs', 'jars', 'sarcophagus'], item: 'noteA' },
    { id: 'art', name: 'Art trail', color: '#e07a8a', steps: ['magnifier', 'signature', 'plinth'], item: 'noteB' },
    { id: 'dino', name: 'Dinosaur trail', color: '#8cc96b', steps: ['brush', 'fossil', 'skeleton'], item: 'noteC' },
    { id: 'security', name: 'Security trail', color: '#7aa7e8', steps: ['cctv', 'keycard', 'cabinet'], item: 'noteD' },
  ];
  P.museum = {
    title: 'The Museum',
    intro: 'The Grand City Museum locked down for the night with all of you inside. The security door opens with a 4-digit code, and the night guard hid one digit in each wing.',
    walls: ['Lobby · Security door', 'Egyptian gallery · Hieroglyphs', 'Egyptian gallery · Canopic jars', 'Art hall · Paintings',
            'Art hall · Sculpture', 'Dinosaur hall', 'Archive', 'Security office'],
    maxHints: 6,
    trails: museumTrails,
    steps: stepsOf(museumTrails),
    hints: {
      glyphs: 'Read the hieroglyph key carved beside the sarcophagus.',
      jars: 'Look at the lids of the canopic jars.',
      sarcophagus: 'Turn each jar lid\'s glyph into a number with the hieroglyph key, left to right.',
      magnifier: 'The night guard left something on the chair in the art hall.',
      signature: 'Use the magnifying glass on the paintings.',
      plinth: 'Take the last digit of each painting\'s year, A to C.',
      brush: 'Archaeologists brush, they don\'t dig. Check the lost-and-found at the lobby desk.',
      fossil: 'Use the brush on the dig pit in the dinosaur hall.',
      skeleton: 'Count the T-rex\'s teeth: top jaw plus bottom jaw.',
      cctv: 'Watch the monitors in the security office.',
      keycard: 'The camera showed which archive box hides the keycard.',
      cabinet: 'Use the keycard on the key cabinet in the security office.',
      escaped: 'Four notes, four digits, in order. Each note says what to count.',
    },
    items: {
      brush: { name: 'Soft brush', desc: 'An archaeologist\'s brush with soft bristles.' },
      magnifier: { name: 'Magnifying glass', desc: 'A big brass magnifying glass.' },
      keycard: { name: 'Keycard', desc: 'A security keycard marked KEY CABINET.' },
      noteA: { name: 'Note A', desc: 'MUSEUM NOTE A: 1st digit = how many canopic jars stand in the Egyptian gallery.' },
      noteB: { name: 'Note B', desc: 'MUSEUM NOTE B: 2nd digit = how many paintings hang in the art hall.' },
      noteC: { name: 'Note C', desc: 'MUSEUM NOTE C: 3rd digit = how many toes are on the T-rex\'s foot.' },
      noteD: { name: 'Note D', desc: 'MUSEUM NOTE D: 4th digit = how many monitors are in the security office.' },
    },
    targets: {
      door: exitDoor('digits', 4, H('850154cab92be05cde7fc854534bf8233403f2754cf29b5b7f45f97d2544d659'),
        'The security door has a 4-digit keypad. One digit comes from each of the four notes.',
        'The keypad beeps, the shutters roll up and the night air rushes in. Everyone is out!'),
      desk: find('brush', 'brush', 'found a soft brush in the lost-and-found box. [Dinosaur trail]', 'Found: Soft brush',
        'The lost-and-found box behind the desk holds an umbrella, one glove and an archaeologist\'s soft brush.', 'Just an umbrella and one glove now.'),
      glyphs: read('glyphs', 'read the hieroglyph key. [Pharaoh trail]', 'Hieroglyph key',
        'Carved into the wall: EYE = 1, BIRD = 2, ANKH = 3, SUN = 4, SNAKE = 5.'),
      sarcophagus: lock({ flag: 'sarcophagus', kind: 'digits', len: 4, hash: H('7e8621d1e03030dba43f8dc0bddd1bc8ab3219ac5e499a5cc7fd99d275590576'),
        prompt: 'The sarcophagus lid has four number dials. A plaque: "Read the jar lids from left to right."',
        give: 'noteA', feed: 'opened the sarcophagus. Note A is in the bag! [Pharaoh trail]', title: 'Found: Note A',
        msg: 'The lid grinds open. Inside, on the mummy\'s chest: "MUSEUM NOTE A: 1st digit = how many canopic jars stand in the Egyptian gallery."', doneMsg: 'Note A is in the bag.' }),
      jars: read('jars', 'read the canopic jar lids. [Pharaoh trail]', 'Canopic jars', 'Four jars in a row. Their lids, left to right: SUN, BIRD, SNAKE, EYE.'),
      scarabs: flavor('A glass case of jewelled scarabs. Locked tight and wired to an alarm.'),
      paintings: useOn('signature', 'magnifier', { keep: true,
        before: 'Three paintings with brass plaques: A "Harbour" 1888, B "Orchard" 1907, C "City at Night" 1931.',
        feed: 'found tiny writing on painting B. [Art trail]', title: 'Tiny writing',
        msg: 'Under the magnifying glass, the corner of painting B says: "Plinth = the last digit of each painting\'s year, A to C."',
        doneMsg: 'Painting B: "Plinth = the last digit of each painting\'s year, A to C."' }),
      chair: find('magnifier', 'magnifier', 'found a magnifying glass on the guard\'s chair. [Art trail]', 'Found: Magnifying glass',
        'On the night guard\'s chair: a big brass magnifying glass.', 'The chair is empty now.'),
      plinth: lock({ flag: 'plinth', kind: 'digits', len: 3, hash: H('0d5ec0792f8727afefa7ac012997e8b2b9832f6d4f66e1ce2c93ba17317b7371'),
        prompt: 'A marble statue on a plinth. The plinth has a 3-digit lock.',
        give: 'noteB', feed: 'opened the statue\'s plinth. Note B is in the bag! [Art trail]', title: 'Found: Note B',
        msg: 'A drawer slides out of the plinth: "MUSEUM NOTE B: 2nd digit = how many paintings hang in the art hall."', doneMsg: 'Note B is in the bag.' }),
      pit: useOn('fossil', 'brush', {
        before: 'A sandy dig pit. Something is buried here, but it needs to be uncovered gently.',
        feed: 'brushed the sand off a fossil plaque. [Dinosaur trail]', title: 'A fossil plaque',
        msg: 'Under the sand: a stone plaque. "The display panel wants my teeth: top jaw PLUS bottom jaw."',
        doneMsg: 'The plaque says: "top jaw PLUS bottom jaw".' }),
      skeleton: lock({ flag: 'skeleton', kind: 'digits', len: 2, hash: H('630a1574dc27cc0aef592b61c4b464b04ad7c668d96a06d9531a4cde347e472d'),
        need: h => h.done('fossil'), locked: 'A huge T-rex skeleton. The display panel beside it is locked. The dig pit might explain it.',
        prompt: 'The display panel asks for a 2-digit number.',
        give: 'noteC', feed: 'solved the T-rex display. Note C is in the bag! [Dinosaur trail]', title: 'Found: Note C',
        msg: 'The panel flips open: "MUSEUM NOTE C: 3rd digit = how many toes are on the T-rex\'s foot."', doneMsg: 'Note C is in the bag.' }),
      cctv: read('cctv', 'watched the CCTV recording. [Security trail]', 'CCTV',
        'Four monitors. Camera 3, earlier tonight: the guard tucks a keycard into the archive box marked 1987.'),
      shelves: {
        inspect: h => {
          if (h.done('keycard')) return already(h, 'keycard', 'Box 1987 is empty now.');
          if (!h.done('cctv')) return 'Shelves of archive boxes labelled by year, 1961 to 2019. Which one could matter?';
          h.give('keycard'); h.set('keycard', 'found the keycard in archive box 1987. [Security trail]');
          return { title: 'Found: Keycard', msg: 'In box 1987, under old tickets: a keycard marked KEY CABINET.' };
        },
      },
      microfilm: flavor('A microfilm reader showing newspaper headlines from 1931: "MUSEUM OPENS ITS DOORS".'),
      keycabinet: useOn('cabinet', 'keycard', {
        before: 'A locked key cabinet with a card slot.', give: 'noteD',
        feed: 'opened the key cabinet. Note D is in the bag! [Security trail]', title: 'Found: Note D',
        msg: 'The cabinet clicks open. Inside: "MUSEUM NOTE D: 4th digit = how many monitors are in the security office."', doneMsg: 'Note D is in the bag.' }),
    },
  };

  // ---- Museum · Hard: a 5th trail (Gem), reversed and multiplied codes, a PIN on the cabinet.
  // Exit: 43345.
  const museumHardTrails = museumTrails.concat([
    { id: 'gem', name: 'Gem trail', color: '#c9a0ff', steps: ['guestbook', 'gemkey', 'gemcase'], item: 'noteE' },
  ]);
  P.museum_hard = derive(P.museum, {
    title: 'The Museum · Hard',
    intro: 'The museum again, with the alarm on its strictest setting. Five digits, five wings, codes that need working out, and every lock jams for 30 seconds after three wrong tries.',
    hard: true, maxHints: 4,
    trails: museumHardTrails,
    steps: stepsOf(museumHardTrails),
    hints: {
      sarcophagus: 'Turn each lid glyph into a number, but read the jars from RIGHT to left, as the plaque says.',
      plinth: 'Last digit of each painting\'s year, newest painting first.',
      skeleton: 'Count the teeth: top jaw TIMES bottom jaw.',
      cabinet: 'Put the keycard in the key cabinet, then type the time shown on camera 3.',
      guestbook: 'Read the visitor book on the lobby desk.',
      gemkey: 'The visitor book says which canopic jar to check.',
      gemcase: 'Use the gem key on the diamond case in the art hall.',
      escaped: 'Five notes, five digits, in order. Each note says what to count.',
    },
    items: {
      gemkey: { name: 'Scarab key', desc: 'A small gold key shaped like a scarab beetle.' },
      noteE: { name: 'Note E', desc: 'MUSEUM NOTE E: 5th digit = how many glyphs are in the hieroglyph key.' },
    },
    targets: {
      door: exitDoor('digits', 5, H('c67bc74b7ad25553bb6695b3a6380eda1d2beceecd13b82f51ac235c8e3cd085'),
        'The security door has a 5-digit keypad. One digit comes from each of the five notes.',
        'The keypad beeps, the shutters roll up and the night air rushes in. Everyone is out!'),
      sarcophagus: lock({ flag: 'sarcophagus', kind: 'digits', len: 4, hash: H('4d2749ffd7213b34c4cba4202c58bf522930d94d0eb61ce465a8878fd2040bf5'),
        prompt: 'The sarcophagus lid has four number dials. A plaque: "Read the jar lids as this tomb was written: right to left."',
        give: 'noteA', feed: 'opened the sarcophagus. Note A is in the bag! [Pharaoh trail]', title: 'Found: Note A',
        msg: 'The lid grinds open. Inside, on the mummy\'s chest: "MUSEUM NOTE A: 1st digit = how many canopic jars stand in the Egyptian gallery."', doneMsg: 'Note A is in the bag.' }),
      paintings: useOn('signature', 'magnifier', { keep: true,
        before: 'Three paintings with brass plaques: A "Harbour" 1888, B "Orchard" 1907, C "City at Night" 1931.',
        feed: 'found tiny writing on painting B. [Art trail]', title: 'Tiny writing',
        msg: 'Under the magnifying glass, the corner of painting B says: "Plinth = the last digit of each painting\'s year, newest painting first."',
        doneMsg: 'Painting B: "Plinth = the last digit of each year, newest painting first."' }),
      plinth: lock({ flag: 'plinth', kind: 'digits', len: 3, hash: H('9e5da6a85762de55a0d3e48381e3e8116d6fa082a2a78f3595819ce836ad1308'),
        prompt: 'A marble statue on a plinth. The plinth has a 3-digit lock.',
        give: 'noteB', feed: 'opened the statue\'s plinth. Note B is in the bag! [Art trail]', title: 'Found: Note B',
        msg: 'A drawer slides out of the plinth: "MUSEUM NOTE B: 2nd digit = how many paintings hang in the art hall."', doneMsg: 'Note B is in the bag.' }),
      pit: useOn('fossil', 'brush', {
        before: 'A sandy dig pit. Something is buried here, but it needs to be uncovered gently.',
        feed: 'brushed the sand off a fossil plaque. [Dinosaur trail]', title: 'A fossil plaque',
        msg: 'Under the sand: a stone plaque. "The display panel wants my teeth: top jaw TIMES bottom jaw."',
        doneMsg: 'The plaque says: "top jaw TIMES bottom jaw".' }),
      skeleton: lock({ flag: 'skeleton', kind: 'digits', len: 2, hash: H('c4a72ed8bfb160882421359ecbd690fc087e755a8eaa2e8732554e129889e68b'),
        need: h => h.done('fossil'), locked: 'A huge T-rex skeleton. The display panel beside it is locked. The dig pit might explain it.',
        prompt: 'The display panel asks for a 2-digit number.',
        give: 'noteC', feed: 'solved the T-rex display. Note C is in the bag! [Dinosaur trail]', title: 'Found: Note C',
        msg: 'The panel flips open: "MUSEUM NOTE C: 3rd digit = how many toes are on the T-rex\'s foot."', doneMsg: 'Note C is in the bag.' }),
      cctv: read('cctv', 'watched the CCTV recording. [Security trail]', 'CCTV',
        'Four monitors. Camera 3, timestamp 21:47: the guard tucks a keycard into the archive box marked 1987, then types the time on the screen into the key cabinet.'),
      keycabinet: {
        inspect: h => {
          if (h.done('cabinet')) return already(h, 'cabinet', 'Note D is in the bag.');
          if (!h.done('cardin')) return 'A locked key cabinet with a card slot and a keypad.';
          return { msg: 'Card accepted. ENTER PIN.', prompt: true };
        },
        use: { keycard: h => { h.take('keycard'); h.set('cardin'); return 'The card clicks in and the keypad lights up: ENTER PIN. Tap the cabinet to type it.'; } },
        code: {
          kind: 'digits', len: 4, hashes: [H('6e71df21a47ca7554a9fd06929a93e857a8dcf57d34c16085b2efc416fee9b0f')],
          open: h => h.done('cardin') && !h.done('cabinet'),
          solve: h => { h.give('noteD'); h.set('cabinet', 'opened the key cabinet. Note D is in the bag! [Security trail]'); return { title: 'Found: Note D', msg: 'The cabinet clicks open: "MUSEUM NOTE D: 4th digit = how many monitors are in the security office."' }; },
        },
      },
      guestbook: read('guestbook', 'read the visitor book. [Gem trail]', 'Visitor book',
        'The last entry, in the curator\'s handwriting: "Hid the scarab key in the THIRD canopic jar from the left."'),
      jars: {
        inspect: h => {
          h.set('jars', 'read the canopic jar lids. [Pharaoh trail]');
          if (h.done('guestbook') && !h.done('gemkey')) {
            h.give('gemkey'); h.set('gemkey', 'found the scarab key in the third canopic jar. [Gem trail]');
            return { title: 'Found: Scarab key', msg: 'Lids, left to right: SUN, BIRD, SNAKE, EYE. Inside the third jar: a small gold key shaped like a scarab.' };
          }
          return { title: 'Canopic jars', msg: 'Four jars in a row. Their lids, left to right: SUN, BIRD, SNAKE, EYE.' };
        },
      },
      gemcase: useOn('gemcase', 'gemkey', {
        before: 'A glass case holding the Star of Cairo diamond. Its lock is shaped like a scarab.', give: 'noteE',
        feed: 'opened the diamond case. Note E is in the bag! [Gem trail]', title: 'Found: Note E',
        msg: 'The case opens without a sound. Under the diamond: "MUSEUM NOTE E: 5th digit = how many glyphs are in the hieroglyph key."', doneMsg: 'Note E is in the bag.' }),
    },
  });

  // =====================================================================
  // THE SPACESHIP: stranded on the research ship SOLACE. Exit: escape pod, 4 letters (SAFE).
  // =====================================================================
  const shipTrails = [
    { id: 'power', name: 'Power trail', color: '#ffb347', steps: ['wrench', 'coolant', 'reactor'], item: 'noteA' },
    { id: 'nav', name: 'Navigation trail', color: '#7ad0ff', steps: ['chart', 'log', 'course'], item: 'noteB' },
    { id: 'crew', name: 'Crew trail', color: '#ff7aa8', steps: ['photo', 'locker', 'medcab'], item: 'noteC' },
    { id: 'oxygen', name: 'Oxygen trail', color: '#7ee08a', steps: ['valve', 'water', 'soil'], item: 'noteD' },
  ];
  P.ship = {
    title: 'The Spaceship',
    intro: 'A meteor hit the research ship SOLACE and its computer sealed every hatch. The escape pod launches with a 4-letter code, split across four maintenance tags.',
    walls: ['Airlock · Escape pod', 'Bridge · Star chart', 'Bridge · Navigation', 'Engine room · Reactor',
            'Engine room · Tool wall', 'Crew quarters', 'Med bay', 'Greenhouse'],
    maxHints: 6,
    trails: shipTrails,
    steps: stepsOf(shipTrails),
    hints: {
      wrench: 'There is a tool wall in the engine room.',
      coolant: 'Use the wrench on the jammed coolant valves.',
      reactor: 'Enter the gauge readings in the order the restart panel asks for.',
      chart: 'Study the star chart on the bridge.',
      log: 'The captain left a log on the captain\'s chair.',
      course: 'The captain\'s log says which star to aim for. The chart gives its sector number.',
      photo: 'Look at the crew photo by the bunks.',
      locker: 'The locker is for the engineer only. The crew photo says who that is.',
      medcab: 'Use the med bay keycard on the medicine cabinet.',
      valve: 'A valve wheel is stored in the spacesuit locker by the airlock.',
      water: 'Use the valve wheel on the greenhouse water tank.',
      soil: 'Once the water flows, check the plants.',
      escaped: 'Four tags, four letters. Each tag says where to look on the ship.',
    },
    items: {
      wrench: { name: 'Wrench', desc: 'A heavy adjustable wrench.' },
      medcard: { name: 'Med bay keycard', desc: 'A blue keycard marked MED BAY.' },
      valvewheel: { name: 'Valve wheel', desc: 'A red valve wheel with a square hole in the middle.' },
      noteA: { name: 'Tag A', desc: 'LAUNCH CODE, 1st letter = the first letter of the ship\'s name.' },
      noteB: { name: 'Tag B', desc: 'LAUNCH CODE, 2nd letter = the letter on the captain\'s chair badge.' },
      noteC: { name: 'Tag C', desc: 'LAUNCH CODE, 3rd letter = the first letter of the plant growing beside the water tank.' },
      noteD: { name: 'Tag D', desc: 'LAUNCH CODE, 4th letter = the last letter of the ship\'s name.' },
    },
    targets: {
      door: exitDoor('letters', 4, H('d14a5eb90328c24546201f9dab1a594be2082dfca6b636fc714d42598d5ed44c'),
        'The escape pod hatch asks for a 4-letter launch code. One letter comes from each maintenance tag.',
        'The pod hatch hisses shut behind you, the engines roar, and the SOLACE shrinks behind you. Everyone made it!'),
      suitlocker: find('valve', 'valvewheel', 'found a valve wheel in the spacesuit locker. [Oxygen trail]', 'Found: Valve wheel',
        'Between two spacesuits: a red valve wheel with a tag, "GREENHOUSE SPARE".', 'Just spacesuits now.'),
      tools: find('wrench', 'wrench', 'took a wrench from the tool wall. [Power trail]', 'Found: Wrench',
        'One outline on the tool wall still has its tool: a heavy adjustable wrench.', 'Every outline on the tool wall is empty now.'),
      valves: useOn('coolant', 'wrench', { keep: true,
        before: 'Three coolant valves, jammed shut. The gauges above them read RED 3, BLUE 1, GREEN 4.',
        feed: 'opened the coolant valves. The reactor is cooling! [Power trail]', title: 'Coolant flowing',
        msg: 'The valves turn. Coolant hisses through the pipes, the reactor stops glowing red, and its restart panel wakes up.',
        doneMsg: 'The gauges read RED 3, BLUE 1, GREEN 4.' }),
      reactor: lock({ flag: 'reactor', kind: 'digits', len: 3, hash: H('bc55bb39921a0398a33dbde31cf6434ef1d8414fd8f14c2f1f22abacdcc16620'),
        need: h => h.done('coolant'), locked: 'The reactor is overheating. Its restart panel stays dark until the coolant flows.',
        prompt: 'RESTART SEQUENCE: enter the coolant gauge readings in the order RED, GREEN, BLUE.',
        give: 'noteA', feed: 'restarted the reactor. Tag A is in the bag! [Power trail]', title: 'Found: Tag A',
        msg: 'Power returns across the ship. A maintenance tag drops from the panel: "LAUNCH CODE, 1st letter = the first letter of the ship\'s name."', doneMsg: 'Tag A is in the bag.' }),
      chart: read('chart', 'studied the star chart. [Navigation trail]', 'Star chart',
        'Stars marked with sector numbers. The biggest and brightest: VEGA · 482. Then DENEB · 375. The faintest: ALTAIR · 129.'),
      chair: read('log', 'read the captain\'s log. [Navigation trail]', 'Captain\'s log',
        '"If we lose power, set course for the brightest star on the chart. The autopilot will do the rest." There is a badge with a big letter A on the chair.'),
      nav: lock({ flag: 'course', kind: 'digits', len: 3, hash: H('636896543de6f59fba42c29748c11fc2e89ae71888bae9d83207a2a8a8dd17bf'),
        need: h => h.done('log'), locked: 'NAVIGATION OFFLINE. Awaiting the captain\'s orders.',
        prompt: 'ENTER DESTINATION SECTOR.',
        give: 'noteB', feed: 'set the ship\'s course. Tag B is in the bag! [Navigation trail]', title: 'Found: Tag B',
        msg: 'Course set. The screen prints a tag: "LAUNCH CODE, 2nd letter = the letter on the captain\'s chair badge."', doneMsg: 'Tag B is in the bag.' }),
      photo: read('photo', 'looked at the crew photo. [Crew trail]', 'Crew photo',
        'Four smiling crew, names on their suits: ADE (captain), LIN (medic), SATO (pilot), PARK (engineer).'),
      crewlocker: lock({ flag: 'locker', kind: 'letters', len: 4, hash: H('7af419591e8a6cf46381225aa53a42f16974e299f0aecd6c751a537e8f99ef56'),
        prompt: 'A personal locker with a sticky note: "Engineer only." It has a 4-letter lock.',
        give: 'medcard', feed: 'opened the engineer\'s locker and found a med bay keycard. [Crew trail]', title: 'Found: Med bay keycard',
        msg: 'Inside, next to a spare uniform: a blue keycard marked MED BAY.', doneMsg: 'The med bay keycard was inside.' }),
      bunks: flavor('Four bunks, neatly made. One has a stack of comics.'),
      medcab: useOn('medcab', 'medcard', {
        before: 'A locked medicine cabinet with a card slot.', give: 'noteC',
        feed: 'opened the medicine cabinet. Tag C is in the bag! [Crew trail]', title: 'Found: Tag C',
        msg: 'The cabinet slides open. Taped inside: "LAUNCH CODE, 3rd letter = the first letter of the plant growing beside the water tank."', doneMsg: 'Tag C is in the bag.' }),
      scanner: flavor('A medical scanner bed. Its screen shows a steady heartbeat line.'),
      tank: useOn('water', 'valvewheel', {
        before: 'The water tank\'s valve wheel is missing, and the plants beside it are wilting.',
        feed: 'fixed the greenhouse water tank. [Oxygen trail]', title: 'Water flowing',
        msg: 'Water rushes into the planters. The plants perk up, and something in the soil glints.', doneMsg: 'The water is flowing.' }),
      plants: {
        inspect: h => {
          if (!h.done('water')) return 'Wilting plants in dry soil. The label on the planter says FERN.';
          if (h.done('soil')) return already(h, 'soil', 'Tag D is in the bag.');
          h.give('noteD'); h.set('soil', 'found a capsule in the wet soil. Tag D is in the bag! [Oxygen trail]');
          return { title: 'Found: Tag D', msg: 'In the wet soil: a sealed capsule. "LAUNCH CODE, 4th letter = the last letter of the ship\'s name."' };
        },
      },
    },
  };

  // ---- Spaceship · Hard: 5th trail (Comms), different orders and crew member. Exit: SAFER.
  const shipHardTrails = shipTrails.concat([
    { id: 'comms', name: 'Comms trail', color: '#d7a8ff', steps: ['antenna', 'radio', 'relay'], item: 'noteE' },
  ]);
  P.ship_hard = derive(P.ship, {
    title: 'The Spaceship · Hard',
    intro: 'The SOLACE again, and now its computer is hostile. A 5-letter launch code, five tags, codes that need working out, and every lock jams for 30 seconds after three wrong tries.',
    hard: true, maxHints: 4,
    trails: shipHardTrails,
    steps: stepsOf(shipHardTrails),
    hints: {
      reactor: 'Gauge readings in the order GREEN, BLUE, RED.',
      course: 'The log says the SECOND brightest star. Check the chart for its sector.',
      locker: 'This locker is for the PILOT. The crew photo says who that is.',
      antenna: 'A spare antenna is in a drawer in the crew quarters.',
      radio: 'Use the antenna on the bridge radio.',
      relay: 'The radio said the relay code is the reactor temperature. The reactor shows it.',
      escaped: 'Five tags, five letters. Each tag says where to look on the ship.',
    },
    items: {
      antenna: { name: 'Antenna', desc: 'A spare telescopic radio antenna.' },
      noteE: { name: 'Tag E', desc: 'LAUNCH CODE, 5th letter = the first letter of the medicine shown on the med bay scanner.' },
    },
    targets: {
      door: exitDoor('letters', 5, H('d85b49151252c15188885e9f69f3961d95d420cccf581817f7c51cf34dcc6b65'),
        'The escape pod hatch asks for a 5-letter launch code. One letter comes from each maintenance tag.',
        'The pod hatch hisses shut, the engines roar, and the SOLACE shrinks behind you. Everyone made it!'),
      reactor: lock({ flag: 'reactor', kind: 'digits', len: 3, hash: H('e57825589802f2e7b9ce2d3f247668b4843ddd6dc66a75c040b61f2edac34c7f'),
        need: h => h.done('coolant'), locked: 'The reactor is overheating. Its restart panel stays dark until the coolant flows.',
        prompt: 'RESTART SEQUENCE: enter the coolant gauge readings in the order GREEN, BLUE, RED.',
        give: 'noteA', feed: 'restarted the reactor. Tag A is in the bag! [Power trail]', title: 'Found: Tag A',
        msg: 'Power returns across the ship. A maintenance tag drops from the panel: "LAUNCH CODE, 1st letter = the first letter of the ship\'s name."', doneMsg: 'Tag A is in the bag.' }),
      chair: read('log', 'read the captain\'s log. [Navigation trail]', 'Captain\'s log',
        '"If we lose power, set course for the SECOND brightest star on the chart. The brightest is too close to the meteor field." There is a badge with a big letter A on the chair.'),
      nav: lock({ flag: 'course', kind: 'digits', len: 3, hash: H('6ab96a38f3c701730f554ea66906d435bccadaee57a65b18ba0556f3cb1ea5b4'),
        need: h => h.done('log'), locked: 'NAVIGATION OFFLINE. Awaiting the captain\'s orders.',
        prompt: 'ENTER DESTINATION SECTOR.',
        give: 'noteB', feed: 'set the ship\'s course. Tag B is in the bag! [Navigation trail]', title: 'Found: Tag B',
        msg: 'Course set. The screen prints a tag: "LAUNCH CODE, 2nd letter = the letter on the captain\'s chair badge."', doneMsg: 'Tag B is in the bag.' }),
      crewlocker: lock({ flag: 'locker', kind: 'letters', len: 4, hash: H('1d9713212693807b99f06bb84ad45c37485db9966e6a9b94749ebcce696404c6'),
        prompt: 'A personal locker with a sticky note: "Pilot only." It has a 4-letter lock.',
        give: 'medcard', feed: 'opened the pilot\'s locker and found a med bay keycard. [Crew trail]', title: 'Found: Med bay keycard',
        msg: 'Inside, next to a flight jacket: a blue keycard marked MED BAY.', doneMsg: 'The med bay keycard was inside.' }),
      scanner: flavor('A medical scanner bed. Its screen reads: "LAST DOSE: RESTORA 20 mg".'),
      drawer: find('antenna', 'antenna', 'found a spare antenna in a bunk drawer. [Comms trail]', 'Found: Antenna',
        'Under some socks in a bunk drawer: a spare telescopic antenna.', 'Just socks now.'),
      radio: useOn('radio', 'antenna', {
        before: 'The bridge radio hisses static. Its antenna socket is empty.',
        feed: 'got the radio working and heard from base. [Comms trail]', title: 'Base calling',
        msg: 'The static clears: "...SOLACE, this is base. Your distress relay code is your reactor temperature. Repeat, your reactor temperature..."',
        doneMsg: 'Base said: the relay code is the reactor temperature.' }),
      relay: lock({ flag: 'relay', kind: 'digits', len: 3, hash: H('f3a19f656a621b5baff9e935b662129a2f2feec83562b164751972344b3a3a2e'),
        need: h => h.done('radio'), locked: 'The distress relay is waiting for a code. Maybe the radio knows it.',
        prompt: 'DISTRESS RELAY: ENTER CODE.',
        give: 'noteE', feed: 'sent the distress signal. Tag E is in the bag! [Comms trail]', title: 'Found: Tag E',
        msg: 'Relay online. It prints a tag: "LAUNCH CODE, 5th letter = the first letter of the medicine shown on the med bay scanner."', doneMsg: 'Tag E is in the bag.' }),
    },
  });

  // =====================================================================
  // THE PIRATE SHIP: locked below deck on Captain Blackfin's ship. Exit: 4 letters (FREE).
  // =====================================================================
  const pirateTrails = [
    { id: 'treasure', name: 'Treasure trail', color: '#ffd166', steps: ['parrot', 'balls', 'map', 'chest'], item: 'noteA' },
    { id: 'galley', name: 'Galley trail', color: '#ef8354', steps: ['flint', 'fire', 'stew'], item: 'noteB' },
    { id: 'cargo', name: 'Cargo trail', color: '#7fc8a9', steps: ['hook', 'crate', 'telescope', 'globe'], item: 'noteC' },
    { id: 'cannon', name: 'Cannon trail', color: '#b8a1ff', steps: ['rope', 'fuse', 'boom', 'cell'], item: 'noteD' },
  ];
  P.pirate = {
    title: 'The Pirate Ship',
    intro: 'Captain Blackfin locked you below deck. The hatch opens with a 4-letter word, and the old crew hid one letter in every corner of the ship.',
    walls: ['Lower deck · Hatch', 'Captain\'s cabin · Desk', 'Captain\'s cabin · Map', 'Cargo hold · Crates',
            'Cargo hold · Cannon', 'Galley', 'Map room', 'The brig'],
    maxHints: 6,
    trails: pirateTrails,
    steps: stepsOf(pirateTrails),
    hints: {
      parrot: 'Parrots repeat what they hear. Talk to the one in the captain\'s cabin.',
      balls: 'Count the cannonballs in the cargo hold.',
      map: 'Look at the ship drawn on the captain\'s map.',
      chest: 'The parrot gave the order: pieces of eight, then cannonballs, then masts.',
      flint: 'Something to make sparks is on the galley shelf.',
      fire: 'Use the flint on the galley stove.',
      stew: 'Once the stove is lit, look at the pot.',
      hook: 'The skeleton in the brig is holding something useful.',
      crate: 'Use the hook on the crates stacked too high to reach.',
      telescope: 'The crate held a lens. Fit it to the telescope in the map room.',
      globe: 'The globe opens with the lighthouse\'s flashes, in order.',
      rope: 'There is a coil of tarred rope on the lower deck.',
      fuse: 'The cannon has no fuse. Use the rope on it.',
      boom: 'A fuse needs a spark. The flint from the galley will do.',
      cell: 'After the blast, check the cell in the brig.',
      escaped: 'Four notes, four letters, in order. It\'s what every prisoner dreams of.',
    },
    items: {
      flint: { name: 'Flint striker', desc: 'A flint and steel for making sparks. It doesn\'t wear out.' },
      hook: { name: 'Boat hook', desc: 'A long pole with a rusty iron hook.' },
      lens: { name: 'Telescope lens', desc: 'A brass-rimmed glass lens.' },
      rope: { name: 'Tarred rope', desc: 'A coil of rope soaked in tar. It burns slowly.' },
      noteA: { name: 'Note A', desc: '"HATCH WORD, 1st letter: F."' },
      noteB: { name: 'Note B', desc: '"HATCH WORD, 2nd letter: R."' },
      noteC: { name: 'Note C', desc: '"HATCH WORD, 3rd letter: E."' },
      noteD: { name: 'Note D', desc: '"HATCH WORD, 4th letter: E."' },
    },
    targets: {
      door: exitDoor('letters', 4, H('84c847d2f0d5842b11293fb41479bc6ce47b4336a105b7028a75257420d4fad1'),
        'The hatch is barred with an iron lock of four letter wheels. Carved above: "Speak what every prisoner dreams of being."',
        'The hatch flies open onto the deck. Salt air, open sea, and a rowing boat waiting. Everyone is free!'),
      rope: find('rope', 'rope', 'took a coil of tarred rope. [Cannon trail]', 'Found: Tarred rope', 'A coil of rope soaked in tar. It would burn slowly.', 'The coil is gone.'),
      parrot: read('parrot', 'listened to the parrot. [Treasure trail]', 'The parrot',
        '"SQUAWK! Chest code! Pieces of eight! Then the cannonballs! Then the masts! SQUAWK!"'),
      balls: read('balls', 'counted the cannonballs. [Treasure trail]', 'Cannonballs',
        'A neat pyramid of cannonballs: 3 on the bottom, 2 in the middle, 1 on top.'),
      map: read('map', 'studied the captain\'s map. [Treasure trail]', 'Treasure map',
        'A map of the islands, with a drawing of this very ship in the corner: three masts and a skull flag.'),
      chest: lock({ flag: 'chest', kind: 'digits', len: 3, hash: H('a2873817f1335ff6331a75957834302e020884eb61b8e2186fd9d12eeff56078'),
        need: h => h.done('parrot'), locked: 'A heavy treasure chest with a 3-digit lock. Someone on this ship must know the code.',
        prompt: 'The chest has three number wheels.',
        give: 'noteA', feed: 'opened the treasure chest. Note A is in the bag! [Treasure trail]', title: 'Found: Note A',
        msg: 'Gold coins, and a folded note: "HATCH WORD, 1st letter: F."', doneMsg: 'Note A is in the bag.' }),
      desk: flavor('The captain\'s desk: quills, an inkpot and a half-eaten ship\'s biscuit.'),
      shelf: find('flint', 'flint', 'found a flint striker on the galley shelf. [Galley trail]', 'Found: Flint striker',
        'Behind the salt jar: a flint and steel striker.', 'The flint is gone from the shelf.'),
      rum: flavor('Seven empty rum bottles in a row.'),
      stove: useOn('fire', 'flint', { keep: true,
        before: 'A cold iron stove with a pot of old stew on top.',
        feed: 'lit the galley stove. [Galley trail]', title: 'Fire!',
        msg: 'Sparks catch the kindling. The stove roars and the stew starts to bubble.', doneMsg: 'The stove is burning.' }),
      pot: {
        inspect: h => {
          if (!h.done('fire')) return 'Cold, lumpy stew. Something hard is stuck at the bottom.';
          if (h.done('stew')) return already(h, 'stew', 'Note B is in the bag.');
          h.give('noteB'); h.set('stew', 'found a note in the bubbling stew. Note B is in the bag! [Galley trail]');
          return { title: 'Found: Note B', msg: 'As the stew bubbles, a waxed tube floats to the top: "HATCH WORD, 2nd letter: R."' };
        },
      },
      skeleton: find('hook', 'hook', 'took a boat hook from the skeleton in the brig. [Cargo trail]', 'Found: Boat hook',
        'The skeleton\'s bony fingers are wrapped round a rusty boat hook. You take it, carefully.', 'The skeleton has nothing left to give.'),
      crates: useOn('crate', 'hook', {
        before: 'Crates stacked to the ceiling. The top one is just out of reach.', give: 'lens',
        feed: 'hooked down a crate and found a telescope lens. [Cargo trail]', title: 'Found: Telescope lens',
        msg: 'You hook the top crate down. It splits open: a brass-rimmed telescope lens.', doneMsg: 'The crate is empty now.' }),
      barrels: flavor('Barrels of salted fish. They smell exactly as you\'d expect.'),
      telescope: useOn('telescope', 'lens', {
        before: 'A telescope pointed out of a porthole, but its lens is missing.',
        feed: 'fixed the telescope and spotted a lighthouse. [Cargo trail]', title: 'The lighthouse',
        msg: 'Through the telescope: a distant lighthouse. It flashes 3 times, pauses, 1 time, pauses, 4 times.',
        doneMsg: 'The lighthouse flashes 3, then 1, then 4.' }),
      globe: lock({ flag: 'globe', kind: 'digits', len: 3, hash: H('0c8ec559cbd9115e8113bca94ad9a7b9454920613df6b18b7ec008452a3b95df'),
        need: h => h.done('telescope'), locked: 'A globe with a 3-digit lock around its equator. Engraved: "As the lighthouse speaks." What lighthouse?',
        prompt: 'A globe with a 3-digit lock. Engraved: "As the lighthouse speaks."',
        give: 'noteC', feed: 'opened the globe. Note C is in the bag! [Cargo trail]', title: 'Found: Note C',
        msg: 'The globe splits along the equator. Inside: "HATCH WORD, 3rd letter: E."', doneMsg: 'Note C is in the bag.' }),
      cannon: {
        inspect: h => {
          if (h.done('boom')) return already(h, 'boom', 'The cannon is still smoking.');
          return h.done('fuse') ? 'The cannon has a fuse now. It needs a spark.' : 'A cannon aimed at the brig wall. Its fuse is missing.';
        },
        use: {
          rope: h => {
            if (h.done('fuse')) return 'There is already a fuse.';
            h.take('rope'); h.set('fuse', 'fitted a rope fuse to the cannon. [Cannon trail]');
            return { title: 'Fuse fitted', msg: 'You twist the tarred rope into the touch-hole. Now it needs a spark.' };
          },
          flint: h => {
            if (!h.done('fuse')) return 'There is no fuse to light.';
            if (h.done('boom')) return already(h, 'boom', 'The cannon is still smoking.');
            h.set('boom', 'fired the cannon at the brig! [Cannon trail]');
            return { title: 'BOOM!', msg: 'The fuse fizzes... BOOM! The cannonball smashes through the wall into the brig\'s locked cell.' };
          },
        },
      },
      cell: {
        inspect: h => {
          if (!h.done('boom')) return 'A locked cell. Something is pinned to the back wall, far out of reach.';
          if (h.done('cell')) return already(h, 'cell', 'Note D is in the bag.');
          h.give('noteD'); h.set('cell', 'climbed into the blasted cell. Note D is in the bag! [Cannon trail]');
          return { title: 'Found: Note D', msg: 'Through the smoking hole you reach the back wall: "HATCH WORD, 4th letter: E."' };
        },
      },
    },
  };

  // ---- Pirate Ship · Hard: 5th trail (Mutiny), harder counts, reversed lighthouse. Exit: FREED.
  const pirateHardTrails = pirateTrails.concat([
    { id: 'mutiny', name: 'Mutiny trail', color: '#ff8fa3', steps: ['logbook', 'rumcount', 'bell'], item: 'noteE' },
  ]);
  P.pirate_hard = derive(P.pirate, {
    title: 'The Pirate Ship · Hard',
    intro: 'Blackfin\'s ship again, and the crew mutinied. A 5-letter hatch word, codes that need working out, and every lock jams for 30 seconds after three wrong tries.',
    hard: true, maxHints: 4,
    trails: pirateHardTrails,
    steps: stepsOf(pirateHardTrails),
    hints: {
      chest: 'Pieces of eight, then only the cannonballs in the TOP TWO rows, then the masts.',
      globe: 'The globe wants the lighthouse flashes in reverse order.',
      logbook: 'Read the captain\'s logbook on the desk.',
      rumcount: 'Count the rum bottles on the galley shelf.',
      bell: 'Rum bottles plus skulls in the brig. Ring the bell that many times.',
      escaped: 'Five notes, five letters, in order.',
    },
    items: {
      noteE: { name: 'Note E', desc: '"HATCH WORD, 5th letter: D."' },
    },
    targets: {
      door: exitDoor('letters', 5, H('d1710d63d8a58d495ee99ca8b3b19f99699042a5815b0ae7a8ff5528e579eb5d'),
        'The hatch is barred with an iron lock of five letter wheels. Carved above: "Speak what you will be when you escape."',
        'The hatch flies open onto the deck. Salt air, open sea, and a rowing boat waiting. Everyone is free!'),
      parrot: read('parrot', 'listened to the parrot. [Treasure trail]', 'The parrot',
        '"SQUAWK! Chest code! Pieces of eight! Then the cannonballs, TOP TWO ROWS ONLY! Then the masts! SQUAWK!"'),
      chest: lock({ flag: 'chest', kind: 'digits', len: 3, hash: H('4bfba5713419379e88823b00c177fa1a86eaeb9c929923e838930c8b3e603524'),
        need: h => h.done('parrot'), locked: 'A heavy treasure chest with a 3-digit lock. Someone on this ship must know the code.',
        prompt: 'The chest has three number wheels.',
        give: 'noteA', feed: 'opened the treasure chest. Note A is in the bag! [Treasure trail]', title: 'Found: Note A',
        msg: 'Gold coins, and a folded note: "HATCH WORD, 1st letter: F."', doneMsg: 'Note A is in the bag.' }),
      globe: lock({ flag: 'globe', kind: 'digits', len: 3, hash: H('e57825589802f2e7b9ce2d3f247668b4843ddd6dc66a75c040b61f2edac34c7f'),
        need: h => h.done('telescope'), locked: 'A globe with a 3-digit lock around its equator. Engraved: "As the lighthouse speaks, but backwards." What lighthouse?',
        prompt: 'A globe with a 3-digit lock. Engraved: "As the lighthouse speaks, but backwards."',
        give: 'noteC', feed: 'opened the globe. Note C is in the bag! [Cargo trail]', title: 'Found: Note C',
        msg: 'The globe splits along the equator. Inside: "HATCH WORD, 3rd letter: E."', doneMsg: 'Note C is in the bag.' }),
      logbook: read('logbook', 'read the captain\'s logbook. [Mutiny trail]', 'Captain\'s logbook',
        '"The mutineers signal each other by ringing the bell: once for every rum bottle on the galley shelf, and once more for every skull in the brig."'),
      rum: read('rumcount', 'counted the rum bottles. [Mutiny trail]', 'Rum shelf', 'Seven empty rum bottles in a row.'),
      bell: lock({ flag: 'bell', kind: 'digits', len: 1, hash: H('39762a51a35808a3377272412076400648042553f0bd87cc968e15e038d496a9'),
        need: h => h.done('logbook'), locked: 'The ship\'s bell. Ringing it at random seems like a bad idea.',
        prompt: 'How many times do you ring the bell?',
        give: 'noteE', feed: 'rang the mutineers\' signal. Note E is in the bag! [Mutiny trail]', title: 'Found: Note E',
        msg: 'On the last ring, a note drops from inside the bell: "HATCH WORD, 5th letter: D."', doneMsg: 'Note E is in the bag.' }),
    },
  });

  // =====================================================================
  // THE TEMPLE: sealed in the Temple of the Jaguar. Exit: 4 digits (7396), written on the
  // tablets as dot-and-bar numbers (a dot is one, a bar is five).
  // =====================================================================
  const templeTrails = [
    { id: 'idol', name: 'Idol trail', color: '#f2c14e', steps: ['sandbag', 'swap', 'jaguar'], item: 'tabletA' },
    { id: 'stars', name: 'Star trail', color: '#9ad1ff', steps: ['torch', 'stars', 'sundial'], item: 'tabletB' },
    { id: 'trap', name: 'Trap trail', color: '#f28f6b', steps: ['carvings', 'plates', 'pit'], item: 'tabletC' },
    { id: 'crypt', name: 'Crypt trail', color: '#7ed6a5', steps: ['knife', 'vines', 'arrows', 'levers', 'crypt'], item: 'tabletD' },
  ];
  P.temple = {
    title: 'The Temple',
    intro: 'The stone door of the Temple of the Jaguar slammed shut behind you. It opens with four numbers, carved on four hidden tablets in the temple\'s own way of counting.',
    walls: ['Entrance · Stone door', 'Idol chamber', 'Idol chamber · Carvings', 'Trap corridor',
            'Star chamber · Sundial', 'Star chamber · Torches', 'Flooded crypt', 'Flooded crypt · Lever wall'],
    maxHints: 6,
    trails: templeTrails,
    steps: stepsOf(templeTrails),
    hints: {
      sandbag: 'There is a sandbag lying in the trap corridor.',
      swap: 'Use the sandbag on the idol, so the pedestal keeps its weight.',
      jaguar: 'The jaguar statue by the door has an idol-shaped hollow.',
      torch: 'Take a burning torch from the wall in the star chamber.',
      stars: 'The star chamber ceiling is too dark to see. Use the torch on it.',
      sundial: 'The sundial dials are jaguar, eagle and serpent. Count each constellation\'s stars.',
      carvings: 'Read the carvings in the idol chamber.',
      plates: 'The carvings say which plates are safe. Enter their numbers, lowest first.',
      pit: 'With the plates set, look in the spike pit.',
      knife: 'A floor tile in the star chamber is loose.',
      vines: 'Cut the vines on the crypt wall with the knife.',
      arrows: 'Look at the sarcophagus lid in the crypt.',
      levers: 'Set the levers to match the arrows on the sarcophagus: U for up, D for down.',
      crypt: 'With the water drained, open the sarcophagus.',
      escaped: 'Each tablet shows a number in dots and bars. The carvings explain: a dot is one, a bar is five.',
    },
    items: {
      sandbag: { name: 'Sandbag', desc: 'A heavy bag of sand, about as heavy as a small gold statue.' },
      idol: { name: 'Golden idol', desc: 'A golden jaguar idol. It is very heavy.' },
      torch: { name: 'Torch', desc: 'A burning wooden torch.' },
      knife: { name: 'Obsidian knife', desc: 'A black glass blade, still sharp.' },
      tabletA: { name: 'Tablet A', desc: 'Stone tablet: "1st number". Below it, a bar with two dots above it.' },
      tabletB: { name: 'Tablet B', desc: 'Stone tablet: "2nd number". Below it, three dots in a row.' },
      tabletC: { name: 'Tablet C', desc: 'Stone tablet: "3rd number". Below it, a bar with four dots above it.' },
      tabletD: { name: 'Tablet D', desc: 'Stone tablet: "4th number". Below it, a bar with one dot above it.' },
    },
    targets: {
      door: exitDoor('digits', 4, H('0e1da1ddaa7dd56540add7d0baf3d7c4f2bfb5b968a607502142e41e98803b35'),
        'The stone door has four number dials. The tablets you find are written in the temple\'s dot-and-bar numbers.',
        'The stone door rumbles aside and jungle light pours in. Everyone is out!'),
      sandbag: find('sandbag', 'sandbag', 'picked up a sandbag in the trap corridor. [Idol trail]', 'Found: Sandbag',
        'A heavy bag of sand, left by some earlier explorer.', 'The sandbag is gone.'),
      idol: useOn('swap', 'sandbag', {
        before: 'A golden jaguar idol on a pressure pedestal. Lift it and the temple will not be pleased, unless you replace its weight.',
        give: 'idol', feed: 'swapped the golden idol for a sandbag. [Idol trail]', title: 'Found: Golden idol',
        msg: 'You swap the idol for the sandbag in one smooth move. Dust trickles from the ceiling... and stops. The golden idol is yours.',
        doneMsg: 'The sandbag sits on the pedestal now.' }),
      jaguar: useOn('jaguar', 'idol', {
        before: 'A stone jaguar statue beside the door. Its mouth is shut, and there is an idol-shaped hollow between its paws.',
        give: 'tabletA', feed: 'fed the jaguar statue its idol. Tablet A is in the bag! [Idol trail]', title: 'Found: Tablet A',
        msg: 'The idol clicks into place and the jaguar\'s jaw drops open. Inside: a stone tablet marked "1st number", with a bar and two dots.',
        doneMsg: 'Tablet A is in the bag.' }),
      torches: find('torch', 'torch', 'took a burning torch from the wall. [Star trail]', 'Found: Torch',
        'You lift a burning torch from its bracket.', 'One bracket is empty now.'),
      stars: useOn('stars', 'torch', { keep: true,
        before: 'The ceiling is lost in darkness. Something glints up there.',
        feed: 'lit up the star carvings on the ceiling. [Star trail]', title: 'Star carvings',
        msg: 'Torchlight reveals constellations carved in the ceiling: the JAGUAR has 3 stars, the EAGLE has 1 star, the SERPENT has 4 stars.',
        doneMsg: 'Jaguar 3 stars, eagle 1, serpent 4.' }),
      sundial: lock({ flag: 'sundial', kind: 'digits', len: 3, hash: H('0c8ec559cbd9115e8113bca94ad9a7b9454920613df6b18b7ec008452a3b95df'),
        need: h => h.done('stars'), locked: 'A stone sundial with three number dials marked with a jaguar, an eagle and a serpent. The ceiling above is too dark to see.',
        prompt: 'Three dials, marked JAGUAR, EAGLE, SERPENT.',
        give: 'tabletB', feed: 'solved the sundial. Tablet B is in the bag! [Star trail]', title: 'Found: Tablet B',
        msg: 'The sundial sinks into the floor, revealing a stone tablet marked "2nd number", with three dots.', doneMsg: 'Tablet B is in the bag.' }),
      carvings: read('carvings', 'read the temple carvings. [Trap trail]', 'Wall carvings',
        '"Count as the jaguar people count: a dot is one, a bar is five." Below, a warning about the corridor: "Walk only where the SUN shines."'),
      plates: lock({ flag: 'plates', kind: 'digits', len: 3, hash: H('f3fb4e22f8373b245c5908b4c85e865f615e822e4b93d9be7cfacaabd4eca560'),
        need: h => h.done('carvings'), locked: 'Six pressure plates, each carved with a sun or a moon. Step on the wrong one and spikes shoot up. The carvings might say which are safe.',
        prompt: 'Six numbered pressure plates. Enter the numbers of the plates you step on, lowest first.',
        feed: 'crossed the pressure plates safely. [Trap trail]', title: 'Spikes retract',
        msg: 'Click, click, click. The spikes slide back into the pit floor.', doneMsg: 'The spikes are retracted.' }),
      pit: {
        inspect: h => {
          if (!h.done('plates')) return 'A spike pit blocks the corridor. A stone tablet lies at the bottom, between the spikes.';
          if (h.done('pit')) return already(h, 'pit', 'Tablet C is in the bag.');
          h.give('tabletC'); h.set('pit', 'climbed into the pit. Tablet C is in the bag! [Trap trail]');
          return { title: 'Found: Tablet C', msg: 'With the spikes gone, you climb down and pick up a tablet marked "3rd number", with a bar and four dots.' };
        },
      },
      mosaic: find('knife', 'knife', 'pried an obsidian knife from a loose floor tile. [Crypt trail]', 'Found: Obsidian knife',
        'One mosaic tile rocks under your foot. Underneath: a black obsidian knife.', 'The tile is loose, but empty.'),
      vines: useOn('vines', 'knife', { keep: true,
        before: 'Thick vines cover the crypt wall.',
        feed: 'cut away the vines in the crypt. [Crypt trail]', title: 'Levers!',
        msg: 'You hack through the vines. Behind them: three stone levers.', doneMsg: 'The vines are cut away.' }),
      sarcophagus: {
        inspect: h => {
          if (h.done('crypt')) return already(h, 'crypt', 'Tablet D is in the bag.');
          if (h.done('levers')) {
            h.give('tabletD'); h.set('crypt', 'opened the drained sarcophagus. Tablet D is in the bag! [Crypt trail]');
            return { title: 'Found: Tablet D', msg: 'With the water gone, the lid slides off. Inside: a tablet marked "4th number", with a bar and one dot.' };
          }
          h.set('arrows', 'read the arrows on the sarcophagus lid. [Crypt trail]');
          return { title: 'Sarcophagus', msg: 'A sarcophagus half under water. Carved on the lid, left to right: three arrows, UP, UP, DOWN. The lid won\'t budge while the crypt is flooded.' };
        },
      },
      levers: lock({ flag: 'levers', kind: 'letters', len: 3, hash: H('3f4d92f45a1606ff1b6a6648b5a93b8f12c2d213fa86996df2df19200db562fd'),
        need: h => h.done('vines') && h.done('arrows'), locked: h => h.done('vines') ? 'Three stone levers. Which way should each one go? Something in this crypt must say.' : 'Thick vines cover this wall.',
        prompt: 'Three stone levers. Set each one UP (U) or DOWN (D), left to right.',
        feed: 'set the levers. The crypt is draining! [Crypt trail]', title: 'Draining',
        msg: 'Gears grind deep in the walls and the water gurgles away down a hidden drain.', doneMsg: 'The crypt is drained.' }),
    },
  };

  // ---- Temple · Hard: 5th trail (Waterfall), reversed dials and moon plates. Exit: 73968.
  const templeHardTrails = templeTrails.concat([
    { id: 'water', name: 'Waterfall trail', color: '#c3a6ff', steps: ['rope', 'medallion', 'altar'], item: 'tabletE' },
  ]);
  P.temple_hard = derive(P.temple, {
    title: 'The Temple · Hard',
    intro: 'The Temple of the Jaguar again, deeper this time. Five tablets, codes that need working out, and every lock jams for 30 seconds after three wrong tries.',
    hard: true, maxHints: 4,
    trails: templeHardTrails,
    steps: stepsOf(templeHardTrails),
    hints: {
      sundial: 'This time the dials read SERPENT, EAGLE, JAGUAR. Count each constellation\'s stars.',
      plates: 'This time the carvings say walk where the MOON shines. Enter those plates, lowest first.',
      levers: 'The lid says read the arrows from the water up: reverse their order. U for up, D for down.',
      rope: 'A vine rope hangs by the idol pedestal.',
      medallion: 'Something glints in the crypt pool. Use the rope to fish it out.',
      altar: 'Put the medallion on the small altar in the star chamber.',
      escaped: 'Five tablets in dots and bars. A dot is one, a bar is five.',
    },
    items: {
      rope: { name: 'Vine rope', desc: 'A long rope of woven vines with a loop at one end.' },
      medallion: { name: 'Golden medallion', desc: 'A round gold medallion with a jaguar face.' },
      tabletE: { name: 'Tablet E', desc: 'Stone tablet: "5th number". Below it, a bar with three dots above it.' },
    },
    targets: {
      door: exitDoor('digits', 5, H('722c9d67c09de75a821c2461b07ec4db882d194001105bb3d4b9d537f48c5da2'),
        'The stone door has five number dials. The tablets you find are written in the temple\'s dot-and-bar numbers.',
        'The stone door rumbles aside and jungle light pours in. Everyone is out!'),
      sundial: lock({ flag: 'sundial', kind: 'digits', len: 3, hash: H('e57825589802f2e7b9ce2d3f247668b4843ddd6dc66a75c040b61f2edac34c7f'),
        need: h => h.done('stars'), locked: 'A stone sundial with three number dials marked with a serpent, an eagle and a jaguar. The ceiling above is too dark to see.',
        prompt: 'Three dials, marked SERPENT, EAGLE, JAGUAR.',
        give: 'tabletB', feed: 'solved the sundial. Tablet B is in the bag! [Star trail]', title: 'Found: Tablet B',
        msg: 'The sundial sinks into the floor, revealing a stone tablet marked "2nd number", with three dots.', doneMsg: 'Tablet B is in the bag.' }),
      carvings: read('carvings', 'read the temple carvings. [Trap trail]', 'Wall carvings',
        '"Count as the jaguar people count: a dot is one, a bar is five." Below, a warning about the corridor: "Walk only where the MOON shines."'),
      plates: lock({ flag: 'plates', kind: 'digits', len: 3, hash: H('db589cab0a745aa2a1a53489d720eea956dd1b47bb36255ade87cf8e97ad9baa'),
        need: h => h.done('carvings'), locked: 'Six pressure plates, each carved with a sun or a moon. Step on the wrong one and spikes shoot up. The carvings might say which are safe.',
        prompt: 'Six numbered pressure plates. Enter the numbers of the plates you step on, lowest first.',
        feed: 'crossed the pressure plates safely. [Trap trail]', title: 'Spikes retract',
        msg: 'Click, click, click. The spikes slide back into the pit floor.', doneMsg: 'The spikes are retracted.' }),
      sarcophagus: {
        inspect: h => {
          if (h.done('crypt')) return already(h, 'crypt', 'Tablet D is in the bag.');
          if (h.done('levers')) {
            h.give('tabletD'); h.set('crypt', 'opened the drained sarcophagus. Tablet D is in the bag! [Crypt trail]');
            return { title: 'Found: Tablet D', msg: 'With the water gone, the lid slides off. Inside: a tablet marked "4th number", with a bar and one dot.' };
          }
          h.set('arrows', 'read the arrows on the sarcophagus lid. [Crypt trail]');
          return { title: 'Sarcophagus', msg: 'A sarcophagus half under water. Carved on the lid, left to right: UP, UP, DOWN. Beneath them: "Read me from the water up." The lid won\'t budge while the crypt is flooded.' };
        },
      },
      levers: lock({ flag: 'levers', kind: 'letters', len: 3, hash: H('5ec99b1c6cef66c0c477548b2a1f704f9c1ce5e84822372dad03424de51aef72'),
        need: h => h.done('vines') && h.done('arrows'), locked: h => h.done('vines') ? 'Three stone levers. Which way should each one go? Something in this crypt must say.' : 'Thick vines cover this wall.',
        prompt: 'Three stone levers. Set each one UP (U) or DOWN (D), left to right.',
        feed: 'set the levers. The crypt is draining! [Crypt trail]', title: 'Draining',
        msg: 'Gears grind deep in the walls and the water gurgles away down a hidden drain.', doneMsg: 'The crypt is drained.' }),
      rope: find('rope', 'rope', 'took a vine rope from the idol chamber. [Waterfall trail]', 'Found: Vine rope',
        'A long rope of woven vines hangs by the pedestal, with a loop at one end.', 'The rope is gone.'),
      pool: useOn('medallion', 'rope', {
        before: 'Deep, still water. Something golden glints at the bottom.', give: 'medallion',
        feed: 'fished a golden medallion out of the pool. [Waterfall trail]', title: 'Found: Golden medallion',
        msg: 'You lower the looped rope and snag a round golden medallion with a jaguar face.', doneMsg: 'The pool is empty now.' }),
      altar: useOn('altar', 'medallion', {
        before: 'A small stone altar with a round hollow in its top.', give: 'tabletE',
        feed: 'placed the medallion on the altar. Tablet E is in the bag! [Waterfall trail]', title: 'Found: Tablet E',
        msg: 'The medallion fits perfectly. The altar grinds open: a tablet marked "5th number", with a bar and three dots.',
        doneMsg: 'Tablet E is in the bag.' }),
    },
  });
})();
