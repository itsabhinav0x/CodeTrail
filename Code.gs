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
