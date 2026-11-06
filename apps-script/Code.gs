/**
 * Speicher für die Fahrgemeinschaft.
 * Liegt als Apps Script in der Google-Tabelle und speichert alles im Blatt "Daten".
 * Jede Zeile ist ein Schlüssel mit einem JSON-Wert.
 *
 * GET  -> liefert alle Daten
 * POST -> {ops:[{op:'set'|'delete', key:'...', value:{...}}]} ändert Daten und liefert danach alle Daten
 */

var SHEET = 'Daten';
// Erlaubt sind Schlüssel der Form "bereich/name", z. B. entries/2026-11-06_0 oder settings/2.
// Bewusst allgemein gehalten, damit neue Funktionen der Seite keine neue Bereitstellung brauchen.
var KEY_RE = /^[a-z]{1,20}\/[A-Za-z0-9_\-]{1,40}$/;

function sheet_() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(SHEET);
  if (!sh) {
    sh = ss.insertSheet(SHEET);
    sh.getRange(1, 1, 1, 3).setValues([['Schlüssel', 'Wert', 'Geändert']]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function rows_() {
  var sh = sheet_();
  var n = sh.getLastRow() - 1;
  return n > 0 ? sh.getRange(2, 1, n, 2).getValues() : [];
}

function readAll_() {
  var out = {};
  rows_().forEach(function (r) {
    if (!r[0]) return;
    try { out[r[0]] = JSON.parse(r[1]); } catch (e) {}
  });
  return out;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return json_({ ok: true, data: readAll_() });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var req = JSON.parse(e.postData.contents);
    var ops = Array.isArray(req.ops) ? req.ops : [];
    if (ops.length > 20) throw new Error('Zu viele Änderungen auf einmal');
    ops.forEach(apply_);
    SpreadsheetApp.flush();
    return json_({ ok: true, data: readAll_() });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

function apply_(op) {
  if (!op || typeof op.key !== 'string' || !KEY_RE.test(op.key)) throw new Error('Ungültiger Schlüssel');
  var sh = sheet_();
  var keys = rows_().map(function (r) { return r[0]; });
  var idx = keys.indexOf(op.key);
  if (op.op === 'delete') {
    if (idx >= 0) sh.deleteRow(idx + 2);
    return;
  }
  if (op.op !== 'set') throw new Error('Unbekannte Aktion');
  var val = JSON.stringify(op.value);
  if (!val || val.length > 2000) throw new Error('Wert zu groß');
  var row = [op.key, val, new Date()];
  if (idx >= 0) sh.getRange(idx + 2, 1, 1, 3).setValues([row]);
  else sh.appendRow(row);
}
