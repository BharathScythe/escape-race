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
  };
})();
