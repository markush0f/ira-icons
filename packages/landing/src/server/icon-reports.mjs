import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

let insert;

export function saveIconReport(name) {
  if (!insert) {
    const filename = resolve(process.env.IRA_REPORTS_DB || "data/icon-reports.sqlite");
    mkdirSync(dirname(filename), { recursive: true });
    const db = new DatabaseSync(filename);

    try {
      db.exec(`
        PRAGMA busy_timeout = 3000;
        CREATE TABLE IF NOT EXISTS icon_reports (
          id INTEGER PRIMARY KEY,
          icon_name TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        ) STRICT;
      `);
      insert = db.prepare("INSERT INTO icon_reports (icon_name) VALUES (?)");
    } catch (error) {
      db.close();
      throw error;
    }
  }

  insert.run(name);
}
