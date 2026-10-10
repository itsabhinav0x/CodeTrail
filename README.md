<div align="center">
  
<img src="icon-512.png" alt="CodeTrail logo" width="130" />

<img src="https://readme-typing-svg.demolab.com?font=Orbitron&weight=800&size=45&duration=2500&pause=1000&color=2DD4BF&center=true&vCenter=true&width=700&height=80&lines=CODETRAIL;TRACK+EVERY+PROBLEM;SOLVE.+REVISIT.+REPEAT." alt="CodeTrail" />

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=18&pause=1000&color=4F46E5&center=true&vCenter=true&width=600&lines=Your+coding+problem+tracker;Use+online+or+install+on+your+device;Auto-syncs+to+your+Google+Sheet" alt="Tagline" />

<br>

### 🌐 **Open CodeTrail Live → https://itsabhinav0x.github.io/CodeTrail**

<img src="https://img.shields.io/badge/Live-GitHub%20Pages-2ea44f?style=for-the-badge&logo=github" />
<img src="https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&logo=pwa" />
<img src="https://img.shields.io/badge/Sync-Google%20Sheets-34A853?style=for-the-badge&logo=googlesheets&logoColor=white" />
<img src="https://img.shields.io/badge/Works-Android%20%7C%20Windows%20%7C%20iOS-4f46e5?style=for-the-badge" />

</div>

---

## 📘 About

**CodeTrail** is a free problem tracker for students who solve lots of programming questions but have no way to track them.

Paste a question link, then mark what to do next: **solve**, **solve again** or **watch lecture**. CodeTrail saves it on your device and (optionally) sends it to **your own Google Sheet** automatically.

> No sign-up, no server, no payment. You own your data.

---

## ✨ Features

- 🔗 Paste a link, and the platform is auto-detected (LeetCode, Codeforces, CodeChef, AtCoder, GeeksforGeeks, HackerRank, CSES and more)
- ✅ Status: **To solve / Solved / Solve again**
- 🎥 Lecture: **Not needed / Watch lecture / Watched**
- 🎯 Difficulty, tags and notes
- 🔎 Search and filter
- 📊 Live stats at the top
- ☁️ Google Sheets sync, where edits update the same row instead of duplicating it
- 📴 Works offline, then press **Sync all** later
- 📥 CSV export
- 👥 Share one sheet with friends and study together

---

## 📑 Contents

1. [Use online (no install)](#1--use-online-no-install)
2. [Install on Android](#2--install-on-android)
3. [Install on Windows](#3--install-on-windows)
4. [Install on iPhone / iPad / Mac](#4--install-on-iphone--ipad--mac)
5. [Account setup and Google Sheet sync](#5--account-setup-and-google-sheet-sync)
6. [Study together with friends (shared sheet)](#6--study-together-with-friends-shared-sheet)
7. [How to use the app](#7--how-to-use-the-app)
8. [Troubleshooting](#8--troubleshooting)
9. [Privacy](#9--privacy-and-security)

---

## 1. 🌐 Use online (no install)

Just open the link in any modern browser (Chrome, Edge, Safari, Firefox):

**https://itsabhinav0x.github.io/CodeTrail**

Bookmark it and start adding questions. Your data stays in that browser on that device.

---

## 2. 📱 Install on Android

1. Open the live link in **Google Chrome**.
2. Tap the **⋮** menu (top right).
3. Tap **Install app** (or **Add to Home screen**).
4. Confirm. The CodeTrail icon now appears on your home screen and opens full screen like a normal app.

You can also tap the **Install** button inside the app if it shows up in the header.

---

## 3. 💻 Install on Windows

**With Microsoft Edge or Google Chrome**
1. Open the live link.
2. Click the **install icon** in the address bar (a small monitor with a down arrow), or open the **⋮ / … menu → Apps → Install CodeTrail** (Edge) / **Cast, save and share → Install page as app** (Chrome).
3. Click **Install**.
4. CodeTrail opens in its own window and can be pinned to the Start menu or taskbar.

Prefer not to install? Use it online (section 1).

---

## 4. 🍎 Install on iPhone / iPad / Mac

- **iPhone / iPad:** open the link in **Safari** → tap **Share** → **Add to Home Screen**.
- **Mac (Safari):** **File → Add to Dock**.

---

## 5. 🔐 Account setup and Google Sheet sync

CodeTrail has no login. Instead, **you connect your own Google Sheet**, so all your data is saved in your Google account. This takes about 10 minutes, once.

### Step 1: Create your sheet
1. Go to [sheets.google.com](https://sheets.google.com) and create a **Blank spreadsheet**.
2. Rename the bottom tab (Sheet1) to exactly **`Problems`**.
3. In row 1, type these headers, one per column (A to L):

`ID | Date | Student | Platform | Link | Title | Status | Lecture | Difficulty | Tags | Notes | Updated`

> Or import the ready-made `CodeTrail_Sheet.xlsx` from this repo (**File → Import → Upload**), which already has the headers, dropdowns and a Dashboard tab.

### Step 2: Add the script
1. In your sheet, click **Extensions → Apps Script**.
2. Delete everything in the editor and paste the code below.
3. Change `change-this-secret` to your own password-like text. **Remember it.**
4. Press **Ctrl+S** to save.

<details>
<summary><b>📋 Click to show Code.gs</b></summary>

```javascript
// CodeTrail - Google Apps Script backend. Paste in Extensions > Apps Script of your Google Sheet.
const SECRET = 'change-this-secret';   // must match "Secret key" in the app Settings
const SHEET  = 'Problems';             // tab name

function norm(u) {                     // same idea as the app: ignore tracking params, www, trailing slash
  try {
    const m = String(u).trim().match(/^https?:\/\/(?:www\.)?([^\/?#]+)([^?#]*)(?:\?([^#]*))?/i);
    if (!m) return String(u).trim().toLowerCase();
    let path = m[2].replace(/\/+$/, '');
    if (m[1].toLowerCase() === 'leetcode.com') { const p = path.match(/^\/problems\/[^\/]+/); if (p) path = p[0]; }
    const q = (m[3] || '').split('&').filter(x => x && !/^(utm_.*|ref|source|list|envtype|envid|favoriteslug|plan|fbclid|gclid)=/i.test(x)).sort().join('&');
    return (m[1] + path).toLowerCase() + (q ? '?' + q : '');
  } catch (e) { return String(u).trim().toLowerCase(); }
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.key !== SECRET) return out('unauthorized');
    const sh = SpreadsheetApp.getActive().getSheetByName(SHEET);
    const row = [d.id, d.date, d.user, d.platform, d.link, d.title, d.status,
                 d.lecture, d.difficulty, d.tags, d.notes, d.updated];
    const n = Math.max(sh.getLastRow() - 1, 1);
    const data = sh.getRange(2, 1, n, 5).getValues();      // A..E: id, date, user, platform, link
    let i = data.findIndex(r => r[0] === d.id);            // 1) same ID -> update
    if (i < 0) i = data.findIndex(r => r[4] && String(r[2]).trim().toLowerCase() === String(d.user).trim().toLowerCase() && norm(r[4]) === norm(d.link)); // 2) same link + student -> update (no duplicates)
    if (i >= 0) { row[0] = data[i][0]; row[1] = data[i][1]; sh.getRange(i + 2, 1, 1, row.length).setValues([row]); }
    else sh.appendRow(row);                                // 3) new
    return out('ok');
  } catch (err) { return out('error: ' + err); }
}
function doGet() { return out('CodeTrail is running'); }
function out(t) { return ContentService.createTextOutput(t); }
```

</details>

### Step 3: Deploy it
1. Click **Deploy → New deployment**.
2. Click the ⚙ gear next to "Select type" → **Web app**.
3. Set **Execute as: Me** and **Who has access: Anyone**.
4. Click **Deploy** → **Authorize access** → choose your Google account → **Advanced → Go to project (unsafe) → Allow**.
   (Google shows this warning because it is *your own* unverified script.)
5. Copy the **Web app URL**. It ends with `/exec`.
6. Test: paste the URL into a browser. You should see `CodeTrail is running`.

### Step 4: Connect the app
1. Open CodeTrail and expand **⚙ Settings**.
2. Fill in:
   - **Your name**
   - **Apps Script Web App URL** (the `/exec` link)
   - **Secret key** (the same text you put in `Code.gs`)
3. Tap **Save settings**.

### Step 5: Test the sync
Add any question. You should see **"Saved & sent to Sheet ✓"**, and a new row appears in your `Problems` tab within a few seconds.

- Changing a status (Solved, Solve again, Lecture ✓) updates the **same row**.
- Added questions while offline or before connecting? Press **Sync all to Sheet**.

> **Using it on more than one device?** Repeat Step 4 on each device with the same URL and secret. Entries from all devices go to the same sheet.

### Updating the script later
If you change `Code.gs`: **Deploy → Manage deployments → ✏ Edit → Version: New version → Deploy**. The URL stays the same.

---

## 6. 👥 Study together with friends (shared sheet)

You can share **one** Google Sheet with your friends so everyone's questions end up in the same place for group study.

**How it works:** the sheet owner shares the **Web App URL** and the **Secret key**. Each friend pastes them into **⚙ Settings** in their own CodeTrail app, using **their own name**. Every question they add is then synced into the same sheet, and the **Student** column shows who added it.

### Owner (one person)
1. Complete [section 5](#5--account-setup-and-google-sheet-sync) (sheet, script, deploy).
2. Send your friends:
   - the **CodeTrail link**: `https://YOUR_USERNAME.github.io/CodeTrail/`
   - the **Web App URL** (ends with `/exec`)
   - the **Secret key**
   Share these **privately** (WhatsApp or Telegram group), not on a public page.
3. In Google Sheets click **Share** and add your friends' emails as **Viewer** (to read) or **Editor** (to also edit). This lets them open the sheet and study from it. Syncing from the app works even without this, but they can't see the sheet unless you share it.

### Each friend
1. Open the CodeTrail link and [install it](#2--install-on-android) (optional).
2. Go to **⚙ Settings** and enter:
   - **Your name**: a **unique** name, like `Aryan` or `Ayush`
   - **Apps Script Web App URL**: the one the owner sent
   - **Secret key**: the one the owner sent
3. Tap **Save settings**, then add a question. It appears in the shared sheet.

### Studying together
- Use the filter on the **Student** column to see one person's list.
- Filter **Status = Solve again** to find hard questions everyone is revising.
- Filter **Lecture = Watch lecture** to find lectures the group should watch.
- Use the **Dashboard** tab for totals, or make your own chart.

### Good to know
- **Use different names.** Rows are matched by link **and name** (capital letters don't matter), so two friends with the same name would overwrite each other's rows. The app won't sync until a name is entered in Settings.
- **Each person's app shows only their own questions.** The combined list from everyone is in the Google Sheet.
- **Anyone with the URL and secret can add rows.** Only share them with people you trust. If someone misuses it, change `SECRET` in the script, deploy a new version, and send the new secret to your friends.
- Rows can be deleted from the sheet by editors. Keep a copy of the sheet (**File → Make a copy**) from time to time.

---

## 7. 🧭 How to use the app

1. Paste a **question link** (platform is detected for you).
2. Choose **Status**, **Lecture**, **Difficulty**, then add tags and notes.
3. Tap **Save**.
4. Use the buttons on each card: **Solved**, **Solve again**, **Lecture ✓**, **Delete**.
5. Search or filter by status at any time.
6. Tap **CSV** to download all your data.

---

## 8. 🛠️ Troubleshooting

| Problem | Fix |
|---|---|
| Nothing shows in the sheet | URL must end with `/exec`; access must be **Anyone**; tab must be named `Problems` |
| Row doesn't appear, no error | Secret in the app and in `Code.gs` must match exactly |
| Changed the script but nothing changed | Create a **New version** in Manage deployments |
| "Saved locally (sync failed)" | You're offline. Press **Sync all** later |
| No Install option | Use Chrome (Android) or Edge/Chrome (Windows) with the HTTPS link; on iPhone use Safari |
| Old icon or old version showing | Refresh with Ctrl+Shift+R, or uninstall and reinstall the app |
| A friend's questions replace mine | You both used the same name in Settings; use unique names |
| Friend can't see the sheet | Share the sheet with their email (**Share → Viewer/Editor**) |
| Data missing on another device | Data is stored per device. Connect the same sheet on each device |

---

## 9. 🔒 Privacy and Security

- Your questions are stored in your browser and in **your own** Google Sheet. There is no CodeTrail server.
- Anyone who has your Web app URL **and** secret can write to your sheet. Share them only with trusted friends (see [section 6](#6--study-together-with-friends-shared-sheet)) and never post them publicly.
- Clearing browser data removes local entries. Entries already synced stay in your sheet.

---

## 🛣️ Roadmap

- [ ] Streak counter
- [ ] Revision reminders
- [ ] Auto-import from Codeforces / LeetCode
- [ ] Import from the sheet back into the app

---

<div align="center">

**CodeTrail: Solve. Revisit. Repeat.** 🚀

</div>
