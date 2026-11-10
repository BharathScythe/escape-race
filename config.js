// 1. Paste your Firebase web app config here (see README.md, "Set up Firebase").
//    Leave it as null to play in demo mode: everything stays in this one browser,
//    which is handy for testing with two tabs side by side.
window.FIREBASE_CONFIG = null;
/* Example:
window.FIREBASE_CONFIG = {
  apiKey: "AIza...",
  authDomain: "my-escape.firebaseapp.com",
  databaseURL: "https://my-escape-default-rtdb.firebaseio.com",
  projectId: "my-escape",
  appId: "1:123:web:abc"
};
*/

// 2. The host opens  https://<you>.github.io/<repo>/?host=<HOST_KEY>  to start and reset games.
//    Anyone who reads this file can find the key, so it only keeps casual players out.
window.HOST_KEY = 'change-me';

// 3. Game name shown at the top.
window.GAME_NAME = 'Escape Race';
