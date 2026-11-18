// Puzzle logic for both rooms. Edit freely.
//
// Code answers are stored as SHA-256 hashes of "escape-race|ANSWER" so players can't
// just read them from the page source. To change an answer, hash the new one:
//   node -e "console.log(require('crypto').createHash('sha256').update('escape-race|NEWCODE').digest('hex'))"
//
// Each target is something players can click:
//   inspect(h)       -> what clicking says: a string, or {title, msg, prompt, table}
//   use[itemId](h)   -> what happens when a team item is used on it
//   code             -> {kind:'digits'|'letters', len, hashes:[...], open(h), solve(h)}
// h helps with shared team state:
//   h.done(flag)      true once anyone on the team has done it
//   h.by(flag)        who did it ("Priya")
//   h.set(flag, txt)  mark done and post "<name> txt" to the team feed
//   h.give(id) / h.take(id) / h.has(id)   the shared team bag
//   h.escape()        the team is out

(function () {
  const already = (h, flag, extra) => `Already found by ${h.by(flag)}.${extra ? ' ' + extra : ''}`;

  const PC_TEXT = 'A note on the desktop: "Filing cabinet = how many RED books, then BLUE books, then GREEN books are on the shelf."';
  const MEMO = '"Exit code = the time the boss walked out. The wall clock stopped at that exact moment." Enter it as four digits.';

  window.PUZZLES = {
    office: {
      title: "The Manager's Office",
      intro: 'The manager locked you in before a long weekend. Find the exit code before the cleaners arrive.',
      walls: ['Exit door', 'Desk', 'Bookshelf', 'Window corner'],
      steps: ['key', 'drawer', 'uv', 'pc', 'cabinet', 'escaped'],
      hints: {
        key: 'Plants can hide more than roots. Look in the window corner.',
        drawer: 'The brass key\'s tag says DESK. Tap the key in your bag, then tap the desk drawer.',
        uv: 'Some ink only shows under UV light. Use the flashlight on the painting.',
        pc: 'The painting gave you a five-letter word. Where would you type a password?',
        cabinet: 'Count the books on the shelf by colour: red, then blue, then green. That is the 3-digit cabinet code.',
        escaped: 'The memo points at the wall clock by the door. Read its time as four digits.',
      },
      items: {
        brasskey: { name: 'Brass key', desc: 'A small brass key. The paper tag reads "DESK".' },
        uvlight: { name: 'UV flashlight', desc: 'A pocket flashlight with a purple bulb. Some inks only show under it.' },
        memo: { name: 'Memo', desc: MEMO },
      },
      targets: {
        plant: {
          inspect: h => {
            if (h.done('key')) return already(h, 'key', 'Only soil left in the pot.');
            h.give('brasskey');
            h.set('key', 'dug a brass key out of the plant pot.');
            return { title: 'Found: Brass key', msg: 'Something glints in the soil. You pull out a small brass key. It is now in your team\'s bag.' };
          },
        },
        drawer: {
          inspect: h => h.done('drawer') ? already(h, 'drawer', 'The drawer is empty now.') : 'The top drawer is locked. It has a small brass keyhole.',
          use: {
            brasskey: h => {
              h.take('brasskey');
              h.give('uvlight');
              h.set('drawer', 'unlocked the desk drawer and found a UV flashlight.');
              return { title: 'Found: UV flashlight', msg: 'The brass key turns. Inside the drawer: a UV flashlight.' };
            },
          },
        },
        painting: {
          inspect: h => h.done('uv') ? 'Under UV light the sky spells M A P L E.' : 'An oil painting of a harbour at dusk. The sky looks oddly blotchy.',
          use: {
            uvlight: h => {
              if (h.done('uv')) return already(h, 'uv', 'The sky spells M A P L E.');
              h.set('uv', 'shone the UV light on the painting. Letters appeared!');
              return { title: 'Hidden letters', msg: 'Glowing letters appear across the sky: M A P L E' };
            },
          },
        },
        computer: {
          inspect: h => h.done('pc')
            ? { title: `Unlocked by ${h.by('pc')}`, msg: PC_TEXT }
            : { msg: 'The computer is locked. It asks for a password.', prompt: true },
          code: {
            kind: 'letters', len: 5,
            hashes: ['ae9e7da0a075fc1657b384e668b905a976dca311c6e7262a329f2a609dd59fae'],
            open: h => !h.done('pc'),
            solve: h => { h.set('pc', 'logged into the computer.'); return { title: 'Logged in', msg: PC_TEXT }; },
          },
        },
        shelf: { inspect: () => 'Rows of hardcovers. Someone tried to sort them by colour and gave up.' },
        cabinet: {
          inspect: h => h.done('cabinet')
            ? already(h, 'cabinet', 'The memo is in your team\'s bag.')
            : { msg: 'A filing cabinet with a 3-digit combination lock.', prompt: true },
          code: {
            kind: 'digits', len: 3,
            hashes: ['06aa2db06aa32a1b6d7d49298cd7d6053d53dadf9d4845601a853bce1c0080ed'],
            open: h => !h.done('cabinet'),
            solve: h => {
              h.give('memo');
              h.set('cabinet', 'opened the filing cabinet and found a memo.');
              return { title: 'Found: Memo', msg: MEMO };
            },
          },
        },
        clock: { inspect: () => 'The wall clock has stopped. The second hand does not move.' },
        bin: { inspect: () => 'Coffee receipts and a broken pencil. Nothing useful.' },
        window: { inspect: () => 'Fourth floor. Not an exit.' },
        door: {
          inspect: () => ({ msg: 'The exit door has a 4-digit keypad.', prompt: true }),
          code: {
            kind: 'digits', len: 4,
            hashes: [
              '55319b4b2dccf29636d8d474825fc6b13a726c1f603a3bf89917fe4ac0fdcecf',
              'd5139350eee9c2f2d481be673346dffdeb66d0c2b4d1dce0b61bd7ffc4569698',
            ],
            open: () => true,
            solve: h => { h.escape(); return { title: 'You escaped!', msg: 'The keypad beeps green and the door swings open.' }; },
          },
        },
      },
    },

    lab: {
      title: 'The Secret Lab',
      intro: 'A power cut sealed the lab doors. Get the lights back on and work out the exit word.',
      walls: ['Exit door', 'Lab bench', 'Fridge wall', 'Whiteboard'],
      steps: ['fuse', 'power', 'scope', 'fridge', 'board', 'escaped'],
      hints: {
        fuse: 'Check the pockets of anything hanging up on the whiteboard wall.',
        power: 'The lab has no power. Tap the fuse in your bag, then tap the fuse box.',
        scope: 'With the lights on, look through the microscope on the lab bench.',
        fridge: 'Look up each tube\'s atomic number on the periodic table poster, then follow the colour order from the slide.',
        board: 'The reagent spray reveals erased marker. Where was something wiped off?',
        escaped: 'Ne + O + N: read the element symbols as letters, in order.',
      },
      items: {
        fuse: { name: 'Fuse', desc: 'A 10-amp glass fuse. It looks unused.' },
        reagent: { name: 'Reagent spray', desc: 'A spray bottle labelled "Ink developer: reveals erased marker".' },
      },
      targets: {
        coat: {
          inspect: h => {
            if (h.done('fuse')) return already(h, 'fuse', 'The pockets are empty.');
            h.give('fuse');
            h.set('fuse', 'found a fuse in a lab coat pocket.');
            return { title: 'Found: Fuse', msg: 'In the coat pocket: a small glass fuse. It is now in your team\'s bag.' };
          },
        },
        fusebox: {
          inspect: h => h.done('power') ? `Fixed by ${h.by('power')}. All switches up.` : 'The fuse box has one empty slot. Only the emergency light works.',
          use: {
            fuse: h => {
              h.take('fuse');
              h.set('power', 'fixed the fuse box. The lights are on!');
              return { title: 'Power restored', msg: 'The fuse clicks in. The lab lights flicker on.' };
            },
          },
        },
        microscope: {
          inspect: h => {
            if (!h.done('power')) return 'The microscope lamp is dead. No power.';
            h.set('scope', 'read the slide under the microscope.');
            return { title: 'Under the microscope', msg: 'Tiny handwriting on the slide: "Fridge code = the atomic numbers of the tubes, in the order RED, YELLOW, GREEN, BLUE."' };
          },
        },
        tubes: { inspect: h => h.done('power') ? 'Four test tubes, each labelled with an element symbol.' : 'Too dark to read the labels.' },
        poster: { inspect: () => ({ title: 'Periodic table', table: true, msg: 'The first ten elements, with their atomic numbers.' }) },
        fridge: {
          inspect: h => h.done('fridge')
            ? already(h, 'fridge', 'The reagent spray is in your team\'s bag.')
            : { msg: 'A sample fridge with a 4-digit lock.', prompt: true },
          code: {
            kind: 'digits', len: 4,
            hashes: ['b8ed4483ac93889e5af4b0b1c057c8aee3f9b494a4cae9ea52f91a7f5a30b89c'],
            open: h => !h.done('fridge'),
            solve: h => {
              h.give('reagent');
              h.set('fridge', 'opened the sample fridge and found a reagent spray.');
              return { title: 'Found: Reagent spray', msg: 'Inside, next to old samples: a spray bottle labelled "Ink developer".' };
            },
          },
        },
        whiteboard: {
          inspect: h => h.done('board') ? 'The developed writing reads: Ne + O + N = the way out.' : 'Wiped clean, but faint smudges remain where someone wrote something.',
          use: {
            reagent: h => {
              if (h.done('board')) return already(h, 'board', 'It reads: Ne + O + N = the way out.');
              h.set('board', 'sprayed the whiteboard. Hidden writing appeared!');
              return { title: 'Hidden writing', msg: 'Ghostly marker appears: "Ne + O + N = the way out".' };
            },
          },
        },
        sink: { inspect: () => 'A deep steel sink. The tap drips.' },
        door: {
          inspect: () => ({ msg: 'The exit door has a 4-letter lock.', prompt: true }),
          code: {
            kind: 'letters', len: 4,
            hashes: ['770bddee273119ddf2856ba7ff05417f1f4f24aa9dfd357c2ad1e58fcb1ebabc'],
            open: () => true,
            solve: h => { h.escape(); return { title: 'You escaped!', msg: 'The letter wheels click into place and the door slides open.' }; },
          },
        },
      },
    },

    // ------------------------------------------------------------------
    // Co-op mode: one big building (the office and the lab joined by a corridor)
    // for up to ~20 players. Four trails run in parallel; each ends in a note with
    // one digit of the exit code. Exit code: 7 8 3 4.
    building: {
      title: 'The Locked Building',
      intro: 'The whole building went into lockdown with all of you inside. Split up: four trails each hide one digit of the exit code. Share what you find in the chat.',
      walls: ['Office · Exit door', 'Office · Desk', 'Office · Bookshelf', 'Office · Window corner',
              'Lab · Storage locker', 'Lab · Bench', 'Lab · Fridge wall', 'Lab · Whiteboard'],
      maxHints: 6,
      trails: [
        { id: 'desk', name: 'Desk trail', color: '#e3a857', steps: ['key', 'drawer', 'uv', 'pc', 'cabinet'], item: 'memo' },
        { id: 'lab', name: 'Lab trail', color: '#4cc4b2', steps: ['fuse', 'power', 'scope', 'fridge', 'board', 'locker'], item: 'labcard' },
        { id: 'coffee', name: 'Coffee trail', color: '#d9826b', steps: ['receipt', 'note', 'safe'], item: 'safenote' },
        { id: 'log', name: 'Safety-log trail', color: '#9b8cf0', steps: ['magnet', 'usb', 'log'], item: 'printout' },
      ],
      steps: ['key', 'drawer', 'uv', 'pc', 'cabinet', 'fuse', 'power', 'scope', 'fridge', 'board', 'locker',
              'receipt', 'note', 'safe', 'magnet', 'usb', 'log', 'escaped'],
      hints: {
        key: 'Plants can hide more than roots. Look in the office window corner.',
        drawer: 'The brass key\'s tag says DESK. Tap the key in the bag, then tap the desk drawer.',
        uv: 'Some ink only shows under UV light. Use the flashlight on the painting.',
        pc: 'The painting gave you a five-letter word. Type it into the office computer.',
        cabinet: 'Count the books by colour: red, then blue, then green. That is the filing cabinet code.',
        fuse: 'Check the pockets of the lab coat on the whiteboard wall.',
        power: 'The lab has no power. Use the fuse on the fuse box.',
        scope: 'With the lights on, look through the microscope on the lab bench.',
        fridge: 'Look up each tube\'s atomic number on the poster, in the colour order from the slide.',
        board: 'The reagent spray reveals erased marker. Try the whiteboard.',
        locker: 'Ne + O + N spells a word. Try it on the lab storage locker.',
        receipt: 'Rubbish can be useful. Check the bin in the office window corner.',
        note: 'Something is stuck to the office window glass.',
        safe: 'Put the drinks from the window note in order and read their numbers off the receipt. The safe is behind the framed certificate next to the exit.',
        magnet: 'Look behind the eye-wash station sign next to the lab storage locker.',
        usb: 'Something small fell down the lab sink. A magnet on a string could fish it out.',
        log: 'Plug the USB stick into the office computer. It has to be unlocked first (Desk trail).',
        escaped: 'You need four digits, one from each note in your bag. Each note says where to look.',
      },
      items: {
        brasskey: { name: 'Brass key', desc: 'A small brass key. The paper tag reads "DESK".' },
        uvlight: { name: 'UV flashlight', desc: 'A pocket flashlight with a purple bulb. Some inks only show under it.' },
        memo: { name: 'Note 1', desc: 'EXIT CODE, 1st digit = the hour on the stopped wall clock by the exit.' },
        fuse: { name: 'Fuse', desc: 'A 10-amp glass fuse. It looks unused.' },
        reagent: { name: 'Reagent spray', desc: 'A spray bottle labelled "Ink developer: reveals erased marker".' },
        labcard: { name: 'Note 2', desc: 'EXIT CODE, 2nd digit = the atomic number of the GREEN test tube.' },
        receipt: { name: 'Receipt', desc: 'Café receipt. BAGELS 2 · COFFEE 6 · MUFFIN 1 · TEA 5.' },
        safenote: { name: 'Note 3', desc: 'EXIT CODE, 3rd digit = how many drawers the filing cabinet has.' },
        magnet: { name: 'Magnet on a string', desc: 'A strong little magnet tied to a long string.' },
        usb: { name: 'USB stick', desc: 'A wet USB stick labelled "SAFETY LOG".' },
        printout: { name: 'Note 4', desc: 'EXIT CODE, 4th digit = the temperature of the sample fridge, in °C.' },
      },
      targets: {
        // ---- desk trail ----
        plant: {
          inspect: h => {
            if (h.done('key')) return already(h, 'key', 'Only soil left in the pot.');
            h.give('brasskey');
            h.set('key', 'dug a brass key out of the plant pot. [Desk trail]');
            return { title: 'Found: Brass key', msg: 'Something glints in the soil: a small brass key. It is now in everyone\'s bag.' };
          },
        },
        drawer: {
          inspect: h => h.done('drawer') ? already(h, 'drawer', 'The drawer is empty now.') : 'The top drawer is locked. It has a small brass keyhole.',
          use: {
            brasskey: h => {
              h.take('brasskey'); h.give('uvlight');
              h.set('drawer', 'unlocked the desk drawer and found a UV flashlight. [Desk trail]');
              return { title: 'Found: UV flashlight', msg: 'The brass key turns. Inside the drawer: a UV flashlight.' };
            },
          },
        },
        painting: {
          inspect: h => h.done('uv') ? 'Under UV light the sky spells M A P L E.' : 'An oil painting of a harbour at dusk. The sky looks oddly blotchy.',
          use: {
            uvlight: h => {
              if (h.done('uv')) return already(h, 'uv', 'The sky spells M A P L E.');
              h.set('uv', 'shone the UV light on the painting. Letters appeared! [Desk trail]');
              return { title: 'Hidden letters', msg: 'Glowing letters appear across the sky: M A P L E' };
            },
          },
        },
        computer: {
          inspect: h => h.done('pc')
            ? { title: `Unlocked by ${h.by('pc')}`, msg: 'A note on the desktop: "Filing cabinet = how many RED books, then BLUE books, then GREEN books are on the shelf." There is a free USB port on the side.' }
            : { msg: 'The computer is locked. It asks for a password.', prompt: true },
          code: {
            kind: 'letters', len: 5,
            hashes: ['ae9e7da0a075fc1657b384e668b905a976dca311c6e7262a329f2a609dd59fae'],
            open: h => !h.done('pc'),
            solve: h => {
              h.set('pc', 'logged into the office computer. [Desk trail]');
              return { title: 'Logged in', msg: 'A note on the desktop: "Filing cabinet = how many RED books, then BLUE books, then GREEN books are on the shelf."' };
            },
          },
          use: {
            usb: h => {
              if (!h.done('pc')) return 'The computer is locked, so it won\'t read the USB stick. Someone needs to log in first (Desk trail).';
              h.take('usb'); h.give('printout');
              h.set('log', 'read the safety log from the USB stick. Note 4 is in the bag! [Safety-log trail]');
              return { title: 'Found: Note 4', msg: 'The safety log opens. Its last line: "EXIT CODE, 4th digit = the temperature of the sample fridge, in °C." You print it out.' };
            },
          },
        },
        shelf: { inspect: () => 'Rows of hardcovers. Someone tried to sort them by colour and gave up.' },
        cabinet: {
          inspect: h => h.done('cabinet')
            ? already(h, 'cabinet', 'Note 1 is in the bag.')
            : { msg: 'A filing cabinet with three drawers and a 3-digit combination lock.', prompt: true },
          code: {
            kind: 'digits', len: 3,
            hashes: ['06aa2db06aa32a1b6d7d49298cd7d6053d53dadf9d4845601a853bce1c0080ed'],
            open: h => !h.done('cabinet'),
            solve: h => {
              h.give('memo');
              h.set('cabinet', 'opened the filing cabinet. Note 1 is in the bag! [Desk trail]');
              return { title: 'Found: Note 1', msg: 'Inside: "EXIT CODE, 1st digit = the hour on the stopped wall clock by the exit."' };
            },
          },
        },
        clock: { inspect: () => 'The wall clock has stopped. The second hand does not move.' },

        // ---- coffee trail ----
        bin: {
          inspect: h => {
            if (h.done('receipt')) return already(h, 'receipt', 'Just a broken pencil left.');
            h.give('receipt');
            h.set('receipt', 'found a café receipt in the bin. [Coffee trail]');
            return { title: 'Found: Receipt', msg: 'A crumpled café receipt: BAGELS 2 · COFFEE 6 · MUFFIN 1 · TEA 5.' };
          },
        },
        window: {
          inspect: h => {
            h.set('note', 'read the sticky note on the window. [Coffee trail]');
            return { title: 'Sticky note', msg: 'Stuck to the glass: "Safe = my usual order: TEA, COFFEE, BAGELS, MUFFIN".' };
          },
        },
        certificate: {
          inspect: h => h.done('safe')
            ? already(h, 'safe', 'Note 3 is in the bag.')
            : { msg: '"Employee of the Month". The frame swings out on a hinge. Behind it: a small wall safe with a 4-digit lock.', prompt: true },
          code: {
            kind: 'digits', len: 4,
            hashes: ['51d0aa5b97d6061928da965abeb4d3d8698f94157c16c4802e31ed1f4bccb23c'],
            open: h => !h.done('safe'),
            solve: h => {
              h.give('safenote');
              h.set('safe', 'cracked the wall safe. Note 3 is in the bag! [Coffee trail]');
              return { title: 'Found: Note 3', msg: 'Inside the safe: "EXIT CODE, 3rd digit = how many drawers the filing cabinet has."' };
            },
          },
        },

        // ---- lab trail ----
        coat: {
          inspect: h => {
            if (h.done('fuse')) return already(h, 'fuse', 'The pockets are empty.');
            h.give('fuse');
            h.set('fuse', 'found a fuse in a lab coat pocket. [Lab trail]');
            return { title: 'Found: Fuse', msg: 'In the coat pocket: a small glass fuse.' };
          },
        },
        fusebox: {
          inspect: h => h.done('power') ? `Fixed by ${h.by('power')}. All switches up.` : 'The fuse box has one empty slot. Only the emergency light works.',
          use: {
            fuse: h => {
              h.take('fuse');
              h.set('power', 'fixed the fuse box. The lab lights are on! [Lab trail]');
              return { title: 'Power restored', msg: 'The fuse clicks in. The lab lights flicker on.' };
            },
          },
        },
        microscope: {
          inspect: h => {
            if (!h.done('power')) return 'The microscope lamp is dead. No power.';
            h.set('scope', 'read the slide under the microscope. [Lab trail]');
            return { title: 'Under the microscope', msg: 'Tiny handwriting on the slide: "Fridge code = the atomic numbers of the tubes, in the order RED, YELLOW, GREEN, BLUE."' };
          },
        },
        tubes: { inspect: h => h.done('power') ? 'Four test tubes, each labelled with an element symbol.' : 'Too dark to read the labels.' },
        poster: { inspect: () => ({ title: 'Periodic table', table: true, msg: 'The first ten elements, with their atomic numbers.' }) },
        fridge: {
          inspect: h => h.done('fridge')
            ? already(h, 'fridge', 'The reagent spray is in the bag. The display reads 4 °C.')
            : { msg: 'A sample fridge with a 4-digit lock. The display reads 4 °C.', prompt: true },
          code: {
            kind: 'digits', len: 4,
            hashes: ['b8ed4483ac93889e5af4b0b1c057c8aee3f9b494a4cae9ea52f91a7f5a30b89c'],
            open: h => !h.done('fridge'),
            solve: h => {
              h.give('reagent');
              h.set('fridge', 'opened the sample fridge and found a reagent spray. [Lab trail]');
              return { title: 'Found: Reagent spray', msg: 'Inside, next to old samples: a spray bottle labelled "Ink developer".' };
            },
          },
        },
        whiteboard: {
          inspect: h => h.done('board') ? 'The developed writing reads: Ne + O + N = locker code.' : 'Wiped clean, but faint smudges remain where someone wrote something.',
          use: {
            reagent: h => {
              if (h.done('board')) return already(h, 'board', 'It reads: Ne + O + N = locker code.');
              h.set('board', 'sprayed the whiteboard. Hidden writing appeared! [Lab trail]');
              return { title: 'Hidden writing', msg: 'Ghostly marker appears: "Ne + O + N = locker code".' };
            },
          },
        },
        locker: {
          inspect: h => h.done('locker')
            ? already(h, 'locker', 'Note 2 is in the bag.')
            : { msg: 'A tall storage locker with a 4-letter combination lock.', prompt: true },
          code: {
            kind: 'letters', len: 4,
            hashes: ['770bddee273119ddf2856ba7ff05417f1f4f24aa9dfd357c2ad1e58fcb1ebabc'],
            open: h => !h.done('locker'),
            solve: h => {
              h.give('labcard');
              h.set('locker', 'opened the storage locker. Note 2 is in the bag! [Lab trail]');
              return { title: 'Found: Note 2', msg: 'Taped inside the locker door: "EXIT CODE, 2nd digit = the atomic number of the GREEN test tube."' };
            },
          },
        },

        // ---- safety-log trail ----
        eyewash: {
          inspect: h => {
            if (h.done('magnet')) return already(h, 'magnet', 'Nothing else behind the sign.');
            h.give('magnet');
            h.set('magnet', 'found a magnet on a string behind the eye-wash sign. [Safety-log trail]');
            return { title: 'Found: Magnet on a string', msg: 'Behind the eye-wash sign hangs a strong magnet tied to a long string.' };
          },
        },
        sink: {
          inspect: h => h.done('usb') ? already(h, 'usb', 'The drain is clear now.') : 'A deep steel sink. Something small and metal glints far down the drain, out of reach.',
          use: {
            magnet: h => {
              if (h.done('usb')) return already(h, 'usb', 'The drain is clear now.');
              h.give('usb');
              h.set('usb', 'fished a USB stick out of the sink drain. [Safety-log trail]');
              return { title: 'Found: USB stick', msg: 'The magnet clicks onto something. You pull up a wet USB stick labelled "SAFETY LOG".' };
            },
          },
        },

        // ---- the exit ----
        door: {
          inspect: () => ({ msg: 'The building\'s exit door has a 4-digit keypad. One digit comes from each of the four notes.', prompt: true }),
          code: {
            kind: 'digits', len: 4,
            hashes: ['160bc901a53d36e5086f3570b65344ab120a56122bf346e12dc8fbb164bd75fb'],
            open: () => true,
            solve: h => { h.escape(); return { title: 'You escaped!', msg: 'The keypad beeps green and the doors open. Everyone is out!' }; },
          },
        },
      },
    },

    // ------------------------------------------------------------------
    // Co-op: The Haunted Mansion. Four trails each end with one of the ghost's notes:
    // a symbol drawn beside a letter. The front door has the four symbols carved above
    // four letter wheels (RAVEN, CANDLE, MOON, KEY), which spells the ghost's name: ROSE.
    mansion: {
      title: 'The Haunted Mansion',
      intro: 'You stayed one night too long at Ashworth Manor, and every door has slammed shut. The ghost of the house left four notes hidden around the mansion. Find them all to learn her name.',
      walls: ['Hall · Front door', 'Hall · Portrait gallery', 'Library · Bookshelf', 'Library · Fireplace',
              'Parlour · Piano', 'Kitchen', 'Attic', 'Cellar'],
      maxHints: 6,
      trails: [
        { id: 'diary', name: 'Diary trail', color: '#e8b04a', steps: ['book', 'ironbox', 'candles', 'diary'], item: 'note_candle' },
        { id: 'piano', name: 'Piano trail', color: '#8fb3ff', steps: ['sheet', 'melody', 'piano'], item: 'note_key' },
        { id: 'potion', name: 'Potion trail', color: '#7fd18b', steps: ['recipe', 'ladle', 'brew'], item: 'note_raven' },
        { id: 'attic', name: 'Attic trail', color: '#c48bff', steps: ['lantern', 'oil', 'light', 'trunk'], item: 'note_moon' },
      ],
      steps: ['book', 'ironbox', 'candles', 'diary', 'sheet', 'melody', 'piano', 'recipe', 'ladle', 'brew',
              'lantern', 'oil', 'light', 'trunk', 'escaped'],
      hints: {
        book: 'One book on the library shelf does not sit flush. Pull it.',
        ironbox: 'The silver key fits something in the fireplace.',
        candles: 'Light the candelabra on the library reading desk with the matches.',
        diary: 'Now that the desk is lit, read the diary.',
        sheet: 'Portraits can hide things. Check behind the girl\'s portrait in the gallery.',
        melody: 'Put the sheet music on the piano in the parlour.',
        piano: 'The sheet numbers the notes. Play them in order, 1 to 4.',
        recipe: 'Read the cookbook on the kitchen shelf.',
        ladle: 'Every cauldron needs a ladle. Try the old crate in the cellar.',
        brew: 'With the ladle in the bag, use the cauldron: how many ladles of red, then green, then blue?',
        lantern: 'An empty lantern hangs on a hook in the kitchen.',
        oil: 'The barrel in the cellar holds lamp oil. Use the lantern on it.',
        light: 'The attic is pitch black. Use the lit lantern on the trunk up there.',
        trunk: 'The trunk belongs to R.A. Her portrait plaque in the gallery shows the year she died.',
        escaped: 'Match each note\'s symbol to the symbols carved above the front door\'s letter wheels.',
      },
      items: {
        silverkey: { name: 'Silver key', desc: 'A small tarnished silver key.' },
        matches: { name: 'Matches', desc: 'A box of long fireplace matches.' },
        sheet: { name: 'Sheet music', desc: 'A lullaby. The notes are numbered: 3:A  1:B  4:D  2:E.' },
        ladle: { name: 'Ladle', desc: 'A long iron ladle.' },
        lantern: { name: 'Empty lantern', desc: 'An oil lantern with a dry wick. It needs oil.' },
        lanternlit: { name: 'Lit lantern', desc: 'A lantern full of oil, burning brightly.' },
        note_candle: { name: 'Ghost note: Candle', desc: 'A page in faded ink: a CANDLE drawn beside the letter O.' },
        note_key: { name: 'Ghost note: Key', desc: 'A page in faded ink: a KEY drawn beside the letter E.' },
        note_raven: { name: 'Ghost note: Raven', desc: 'A singed page: a RAVEN drawn beside the letter R.' },
        note_moon: { name: 'Ghost note: Moon', desc: 'A page wrapped in a shawl: a MOON drawn beside the letter S.' },
      },
      targets: {
        // ---- diary trail ----
        book: {
          inspect: h => {
            if (h.done('book')) return already(h, 'book', 'The gap on the shelf is empty.');
            h.give('silverkey');
            h.set('book', 'pulled a loose book. A silver key fell out! [Diary trail]');
            return { title: 'Found: Silver key', msg: 'The red book slides out and a small silver key drops to the floor.' };
          },
        },
        ironbox: {
          inspect: h => h.done('ironbox') ? already(h, 'ironbox', 'The iron box is empty.') : 'An iron box sits in the cold grate. Its little lock is silver.',
          use: {
            silverkey: h => {
              h.take('silverkey'); h.give('matches');
              h.set('ironbox', 'opened the iron box in the fireplace and found matches. [Diary trail]');
              return { title: 'Found: Matches', msg: 'The silver key turns. Inside the box: long fireplace matches.' };
            },
          },
        },
        candles: {
          inspect: h => h.done('candles') ? `Lit by ${h.by('candles')}. The candles light up the reading desk.` : 'A candelabra with three unlit candles.',
          use: {
            matches: h => {
              h.take('matches');
              h.set('candles', 'lit the candelabra in the library. [Diary trail]');
              return { title: 'Candles lit', msg: 'Warm light spreads across the reading desk. Now you can see the open diary.' };
            },
          },
        },
        diary: {
          inspect: h => {
            if (!h.done('candles')) return 'An open diary, but it is too dark to read the faded ink.';
            if (h.done('diary')) return already(h, 'diary', 'The Candle note is in the bag.');
            h.give('note_candle');
            h.set('diary', 'read the diary. A ghost note fell out! [Diary trail]');
            return { title: 'Found: Ghost note', msg: 'The last entry reads: "If you find all my notes, you will know my name." A loose page falls out: a CANDLE drawn beside the letter O.' };
          },
        },

        // ---- piano trail ----
        portrait: {
          inspect: h => {
            if (h.done('sheet')) return already(h, 'sheet', 'Nothing else behind the portrait.');
            h.give('sheet');
            h.set('sheet', 'found sheet music behind Rose\'s portrait. [Piano trail]');
            return { title: 'Found: Sheet music', msg: 'The portrait swings away from the wall. Tucked behind it: a lullaby. The notes are numbered: 3:A  1:B  4:D  2:E.' };
          },
        },
        portraits: { inspect: () => 'Lord and Lady Ashworth. Their eyes seem to follow you around the room.' },
        piano: {
          inspect: h => {
            if (h.done('piano')) return already(h, 'piano', 'The Key note is in the bag.');
            if (!h.done('melody')) return 'The music stand is empty. Someone scratched "play my lullaby" into the lid.';
            return { msg: 'The sheet on the stand reads: 3:A  1:B  4:D  2:E. Play the four notes.', prompt: true };
          },
          use: {
            sheet: h => {
              h.take('sheet');
              h.set('melody', 'put the sheet music on the piano. [Piano trail]');
              return { title: 'Sheet on the stand', msg: 'The notes are numbered: 3:A  1:B  4:D  2:E. Tap the piano to play them.' };
            },
          },
          code: {
            kind: 'letters', len: 4,
            hashes: ['3a28436973e1d6007dc8422d15e63a00eaa1195ad91aecc8dc604abb3b43a87f'],
            open: h => h.done('melody') && !h.done('piano'),
            solve: h => {
              h.give('note_key');
              h.set('piano', 'played the lullaby. A ghost note appeared in the piano! [Piano trail]');
              return { title: 'Found: Ghost note', msg: 'The lullaby rings through the house and the piano lid creaks open. Inside: a page with a KEY drawn beside the letter E.' };
            },
          },
        },

        // ---- potion trail ----
        cookbook: {
          inspect: h => {
            h.set('recipe', 'read the ghost-calming recipe in the cookbook. [Potion trail]');
            return { title: 'Cookbook', msg: '"Ghost-calming brew: 2 ladles of RED, 1 of GREEN, 3 of BLUE. Add the colours in that order and stir."' };
          },
        },
        crate: {
          inspect: h => {
            if (h.done('ladle')) return already(h, 'ladle', 'Only straw left in the crate.');
            h.give('ladle');
            h.set('ladle', 'found a ladle in the cellar crate. [Potion trail]');
            return { title: 'Found: Ladle', msg: 'Under the straw: a long iron ladle.' };
          },
        },
        cauldron: {
          inspect: h => {
            if (h.done('brew')) return already(h, 'brew', 'The Raven note is in the bag.');
            if (!h.has('ladle')) return 'A cauldron on the stove, with red, green and blue bottles beside it. You need something to ladle with.';
            return { msg: 'How many ladles of RED, then GREEN, then BLUE?', prompt: true };
          },
          code: {
            kind: 'digits', len: 3,
            hashes: ['48df6c7ea542cc51f30e792ae8a52da18abd3c5aa0c3696081a34405658f03f7'],
            open: h => h.has('ladle') && !h.done('brew'),
            solve: h => {
              h.give('note_raven');
              h.set('brew', 'brewed the potion. A ghost note rose from the steam! [Potion trail]');
              return { title: 'Found: Ghost note', msg: 'The brew glows and a singed page drifts out of the steam: a RAVEN drawn beside the letter R.' };
            },
          },
        },

        // ---- attic trail ----
        lanternhook: {
          inspect: h => {
            if (h.done('lantern')) return already(h, 'lantern', 'The hook is empty.');
            h.give('lantern');
            h.set('lantern', 'took the empty lantern from the kitchen. [Attic trail]');
            return { title: 'Found: Empty lantern', msg: 'An oil lantern. The wick is dry: it needs oil.' };
          },
        },
        barrel: {
          inspect: h => h.done('oil') ? already(h, 'oil', 'The lantern is already full.') : 'A barrel marked LAMP OIL.',
          use: {
            lantern: h => {
              h.take('lantern'); h.give('lanternlit');
              h.set('oil', 'filled and lit the lantern. [Attic trail]');
              return { title: 'Lit lantern', msg: 'You fill the lantern and light it. It burns brightly.' };
            },
          },
        },
        trunk: {
          inspect: h => {
            if (!h.done('light')) return 'Pitch black. The floorboards creak, but you can\'t see a thing. You need a light up here.';
            if (h.done('trunk')) return already(h, 'trunk', 'The Moon note is in the bag.');
            return { msg: 'An old trunk with "R.A." painted on the lid and a 4-digit lock.', prompt: true };
          },
          use: {
            lanternlit: h => {
              if (h.done('light')) return 'The attic is already lit.';
              h.set('light', 'lit up the attic with the lantern. [Attic trail]');
              return { title: 'Attic lit', msg: 'Light spills across the attic. In the corner: an old trunk marked "R.A." with a 4-digit lock.' };
            },
          },
          code: {
            kind: 'digits', len: 4,
            hashes: ['04f841c0bc77e8ec7a7c646d7dca9853884d7160ce38a5b29b611be89cca5293'],
            open: h => h.done('light') && !h.done('trunk'),
            solve: h => {
              h.give('note_moon');
              h.set('trunk', 'opened Rose\'s trunk. A ghost note was inside! [Attic trail]');
              return { title: 'Found: Ghost note', msg: 'Inside, wrapped in a shawl: a page with a MOON drawn beside the letter S.' };
            },
          },
        },
        chair: { inspect: () => 'An old rocking chair. It is rocking gently, all by itself.' },
        winerack: { inspect: () => 'Dusty bottles. The oldest label says 1885.' },
        clock: { inspect: () => 'A grandfather clock, stopped at midnight.' },

        // ---- the exit ----
        door: {
          inspect: () => ({ msg: 'The front door has four symbols carved above four letter wheels: RAVEN, CANDLE, MOON, KEY. Say the ghost\'s name.', prompt: true }),
          code: {
            kind: 'letters', len: 4,
            hashes: ['93e311acfbd42791a81882b1601d64a464e1aa5d37a3d07eda4ebf318d9ad613'],
            open: () => true,
            solve: h => { h.escape(); return { title: 'You escaped!', msg: 'You whisper "Rose" as the wheels click into place. The door swings open and a cold breeze carries a quiet "thank you". Everyone is free!' }; },
          },
        },
      },
    },
  };

  // The exit only takes a password once these clues are found (see the rule in index.html).
  window.PUZZLES.office.exitNeeds = ['cabinet'];
  window.PUZZLES.lab.exitNeeds = ['board'];
})();
