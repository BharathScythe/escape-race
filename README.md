# Escape Race

A multiplayer escape room, hosted free on GitHub Pages.

**The host chooses the game** from the **Game** menu on the host page, before clicking Start game:

| Game | Trails | Exit | Hints |
|---|---|---|---|
| The Haunted Mansion · Normal | 4 | 4-letter name | 6 |
| The Haunted Mansion · Hard | 5 | 5-letter name | 4 |
| The Locked Building · Normal | 4 | 4-digit code | 6 |
| The Locked Building · Hard | 5 | 5-digit code | 4 |

Everyone plays together, up to about 20 players. Switching games clears the old game's progress but
keeps the players. `COOP_ROOM` in `config.js` sets what shows before the host picks.

**What Hard adds:** a 5th trail (the Séance trail in the mansion, the Security trail in the
building), longer trails, codes that must be worked out instead of copied (mirror writing, counting
only some shelves, sorting and reversing, atomic numbers to element symbols), clues spread across
more rooms, red herrings, only 4 hints, and **jamming locks**: three wrong codes on a lock jam it
for 30 seconds for the whole team, so guessing doesn't pay.

The two-team race and the small Office and Lab games are still in the code. To offer them again, add
them back to `GAMES` near the top of the script in `index.html` (the lines are there, commented out).

**Everyone together: the two big games**
- *The Haunted Mansion*: hall, portrait gallery, library, fireplace, parlour, kitchen, attic and
  cellar. Four trails (Diary, Piano, Potion, Attic) each end in one of the ghost's notes: a symbol
  beside a letter. The symbols carved on the front door put the letters in order to spell her name.
- *The Locked Building*: the office and the lab joined together, 8 walls. Four trails (Desk, Lab,
  Coffee, Safety log) each end in a note with one digit of the exit code. The Safety-log trail needs
  the office computer, which the Desk trail unlocks.

Both have one shared bag, one chat for everyone, and six hints, which players ask for per trail.

**The exit rule:** the exit refuses any password until every clue note is found ("found 2 of 4"), so
nobody can guess their way out early. In the race rooms, the exit opens for codes once the room's last
clue is found.

**Practise without touching the live game:** add `?demo` to the link (for example
`.../escape-race/?demo&host=<key>` in one tab and `.../escape-race/?demo` in another). Everything
then stays inside that one browser.

**Race (`'race'`): two teams, two rooms, first team out wins**
- **Team Office** is locked in *The Manager's Office*; **Team Lab** is locked in *The Secret Lab*.
- Three hints per team. The scoreboard at the top shows both teams' progress live.

In both modes, everything a player finds appears in everyone's bag on their team, and anyone who
clicks the same spot sees "Already found by Priya". Finds, wrong codes and hints show up in the feed.

Files: `index.html` (the game), `puzzles.js` (room logic, clues and hints), `config.js` (your settings).
`serve.js` is only for testing on your own computer.

## 1. Set up Firebase (free, about 5 minutes)

GitHub Pages only serves files, so the players' shared state lives in a free Firebase Realtime Database.

1. Go to https://console.firebase.google.com and click **Create a project** (Google Analytics: off).
2. In the left menu, open **Build → Realtime Database → Create database**. Pick a location and
   choose **Start in test mode**.
3. Open the **Rules** tab, paste this and click **Publish**:
   ```json
   {
     "rules": {
       "escape-race": { ".read": true, ".write": true }
     }
   }
   ```
4. Go to **Project settings** (gear icon) → **Your apps** → the **Web** icon `</>`. Register an app
   (no Firebase Hosting needed), and copy the `firebaseConfig` object it shows.
5. Paste it into `config.js` as `window.FIREBASE_CONFIG = { ... };`. Make sure it includes
   `databaseURL`. If it doesn't, copy the URL shown at the top of the Realtime Database page.
6. Change `window.HOST_KEY` in `config.js` to a word only you know.

The Firebase web config is meant to be public. The rules above let anyone with your page change the
game data, which is fine for a party game; delete the database afterwards if you like.

## 2. Put it on GitHub Pages

1. Create a new repository on GitHub, for example `escape-race`, and upload `index.html`,
   `puzzles.js`, `config.js` and `README.md` (**Add file → Upload files**).
2. Open **Settings → Pages**, set **Source** to *Deploy from a branch*, choose `main` and `/ (root)`,
   then **Save**.
3. After a minute the game is live at `https://<your-username>.github.io/escape-race/`.

## 3. Run a game

1. Open the host page on your laptop or the projector:
   `https://<your-username>.github.io/escape-race/?host=<your HOST_KEY>`
2. Share the player link (`https://<your-username>.github.io/escape-race/`). Each player types a
   name and picks a team. Aim for 5–8 per team.
3. When everyone is in, click **Start game** on the host page. Both clocks start together.
4. The host page shows both teams, who is online, and each team's live feed.
5. **Reset rooms** sets up a rematch with the same players.
   **Reset rooms and remove players** starts completely fresh.

Players should keep the tab open. If someone closes it, they rejoin as the same person when they
come back on the same device.

## Test on your own computer first

With `config.js` left as `null`, the game runs in demo mode, shared between tabs of one browser only:

```
node serve.js
```

Open http://localhost:8080/?host=change-me in one tab and http://localhost:8080 in another.

## Spoilers: the solutions

<details><summary>Hard: The Haunted Mansion (exit password EDITH)</summary>

- **Diary trail:** red book → silver key → iron box → matches → candelabra → diary clasp **HMR**
  (Henry, Margaret, Rose, eldest first, from the gallery plaques) → CANDLE = **D**.
- **Piano trail:** left half of the lullaby behind Rose's portrait (1:F 3:C 5:D) + right half in a wine
  bottle in the cellar (2:A 4:A 6:E) → both on the piano → **FACADE** → KEY = **T**.
- **Potion trail:** cookbook → crowbar in the kitchen stove → open the nailed crate → ladle → cauldron
  **332** (3 candles, 3 faces in the gallery, 2 clock hands) → RAVEN = **E**.
- **Attic trail:** lantern → lamp oil → light the attic → trunk **5881** (born 1885, backwards) →
  MOON = **I**.
- **Séance trail:** hall mirror → clock key in the parlour vase → wind the grandfather clock →
  planchette → spirit board **VIOLET** (Rose's plaque: "forever among the violets") → HOURGLASS = **H**.
- **Front door:** RAVEN, CANDLE, MOON, KEY, HOURGLASS → **EDITH**.
</details>

<details><summary>Hard: The Locked Building (exit code 47545)</summary>

- **Desk trail:** plant → key → drawer → UV light → painting shows ELPAM (mirrored) → computer **MAPLE** →
  top two shelves only: 2 red, 6 blue, 1 green → cabinet **261** → Note 1: tens digit of 7:40 = **4**.
- **Lab trail:** fuse → fuse box → microscope (yellow, blue, red, green) → fridge **7618** → reagent →
  whiteboard 10 · 8 · 7 = Ne O N → locker **NEON** → Note 2: the yellow tube is nitrogen = **7**.
- **Coffee trail:** receipt + sticky note (alphabetical, then backwards: TEA, MUFFIN, COFFEE, BAGELS) →
  safe **5162** → Note 3: books on the bottom shelf = **5**.
- **Safety-log trail:** magnet → sink → USB stick → office computer → Note 4: test tubes = **4**.
- **Security trail:** staff badge under the desk lamp → Q3 poster shows FY 2031 → badge reader on
  the lab fridge wall **2031** → Note 5: letters in MAPLE = **5**.
- **Exit door:** **47545**.
</details>

<details><summary>Co-op: The Haunted Mansion (exit password ROSE)</summary>

- **Diary trail:** loose red book → silver key → iron box in the fireplace → matches → light the
  candelabra → read the diary → note: CANDLE = **O**.
- **Piano trail:** behind Rose's portrait → sheet music (3:A 1:B 4:D 2:E) → put it on the piano →
  play BEAD → note: KEY = **E**.
- **Potion trail:** cookbook (2 red, 1 green, 3 blue) → ladle from the cellar crate → cauldron 213 →
  note: RAVEN = **R**.
- **Attic trail:** empty lantern in the kitchen → fill it at the lamp-oil barrel → use it on the attic
  trunk → trunk 1897 (Rose's plaque: 1885–1897) → note: MOON = **S**.
- **Front door:** the carved symbols read RAVEN, CANDLE, MOON, KEY → **ROSE**.
</details>

<details><summary>Co-op: The Locked Building (exit code 7834)</summary>

- **Desk trail:** plant pot → brass key → desk drawer → UV flashlight → painting shows MAPLE → computer
  MAPLE → books 3 red, 7 blue, 2 green → filing cabinet 372 → Note 1: the hour on the stopped clock = **7**.
- **Lab trail:** lab coat → fuse → fuse box → microscope → tubes red H=1, yellow N=7, green O=8, blue C=6 →
  fridge 1786 → reagent spray → whiteboard Ne + O + N → storage locker NEON → Note 2: the green tube is
  oxygen = **8**.
- **Coffee trail:** bin → receipt (BAGELS 2, COFFEE 6, MUFFIN 1, TEA 5) + window sticky note (TEA, COFFEE,
  BAGELS, MUFFIN) → safe behind the certificate 5621 → Note 3: the filing cabinet has **3** drawers.
- **Safety-log trail:** eye-wash sign → magnet → sink → USB stick → office computer (after MAPLE) →
  Note 4: the fridge is at **4** °C.
- **Exit door:** 7834.
</details>

<details><summary>Team Office</summary>

Plant pot → brass key → desk drawer → UV flashlight → painting shows MAPLE → computer password MAPLE →
count the books: 3 red, 7 blue, 2 green → cabinet 372 → memo → stopped clock shows 7:40 → door 0740.
</details>

<details><summary>Team Lab</summary>

Lab coat → fuse → fuse box (lights on) → microscope: atomic numbers in order red, yellow, green, blue →
tubes red H=1, yellow N=7, green O=8, blue C=6 → fridge 1786 → reagent spray → whiteboard shows
Ne + O + N → door NEON.
</details>

To change a clue or code, edit `puzzles.js`. The comment at the top shows how to hash a new answer.
If you change a code, also change the clue drawn in `index.html` (the clock, books or tubes).

After editing `config.js` or `puzzles.js`, bump the `?v=` number on their `<script>` tags near the
bottom of `index.html`, so players' browsers load the new copy instead of a cached one.
