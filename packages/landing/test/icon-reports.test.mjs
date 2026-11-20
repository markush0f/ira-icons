import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";

const store = new URL("../src/server/icon-reports.mjs", import.meta.url);
const comment = "The cup's steam looks clipped.\nTry a smaller offset.";

function saveReports(database) {
  execFileSync(process.execPath, ["--input-type=module", "-e", `
    import { saveIconReport } from ${JSON.stringify(store.href)};
    saveIconReport("coffee");
    saveIconReport("coffee-animated", ${JSON.stringify(comment)});
  `], { env: { ...process.env, IRA_REPORTS_DB: database }, stdio: "pipe" });
}

function assertReports(database, expected) {
  const db = new DatabaseSync(database, { readOnly: true });
  try {
    const rows = db.prepare("SELECT icon_name, comment, created_at FROM icon_reports ORDER BY id").all();
    assert.deepEqual(rows.map(({ icon_name, comment }) => [icon_name, comment]), expected);
    assert.ok(rows.every(({ created_at }) => Number.isFinite(Date.parse(created_at))));
  } finally {
    db.close();
  }
}

for (const legacy of [false, true]) {
  test(legacy ? "upgrades existing reports without losing rows" : "stores reports with or without comments in a new database", () => {
    const directory = mkdtempSync(join(tmpdir(), "ira-reports-"));
    const database = join(directory, "reports.sqlite");
    try {
      if (legacy) {
        const db = new DatabaseSync(database);
        try {
          db.exec(`
            CREATE TABLE icon_reports (
              id INTEGER PRIMARY KEY,
              icon_name TEXT NOT NULL,
              created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
            ) STRICT;
            INSERT INTO icon_reports (icon_name) VALUES ('bell');
          `);
        } finally {
          db.close();
        }
      }
      saveReports(database);
      assertReports(database, [
        ...(legacy ? [["bell", null]] : []),
        ["coffee", null],
        ["coffee-animated", comment],
      ]);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
}
