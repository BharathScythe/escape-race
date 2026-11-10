# Escape Race

A two-team escape room race for 10–15 players, hosted free on GitHub Pages.

- **Team Office** is locked in *The Manager's Office*; **Team Lab** is locked in *The Secret Lab*.
- Everyone on a team shares one room live. When a teammate finds something, it appears in the whole
  team's bag, and anyone who clicks the same spot sees "Already found by Priya".
- Wrong codes, finds and hints show up in the team feed, with a team chat beside it.
- Three hints per team.
- **The first team to escape wins.** The scoreboard at the top shows both teams' progress live.

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
