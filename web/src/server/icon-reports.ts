import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync, type StatementSync } from "node:sqlite";

let insert: StatementSync | undefined;

export function saveIconReport(name: string, comment: string | null = null) {
  if (!insert) {
    const filename = resolve(process.env.IRA_REPORTS_DB || "data/icon-reports.sqlite");
    mkdirSync(dirname(filename), { recursive: true });
    const db = new DatabaseSync(filename);

    try {
      db.exec(`
        PRAGMA busy_timeout = 3000;
        BEGIN IMMEDIATE;
        CREATE TABLE IF NOT EXISTS icon_reports (
          id INTEGER PRIMARY KEY,
          icon_name TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
          comment TEXT
        ) STRICT;
      `);
      // Upgrade databases created before reports supported comments.
      const columns = db.prepare("PRAGMA table_info(icon_reports)").all();
      if (!columns.some(({ name }) => name === "comment")) {
        db.exec("ALTER TABLE icon_reports ADD COLUMN comment TEXT");
      }
      const statement = db.prepare("INSERT INTO icon_reports (icon_name, comment) VALUES (?, ?)");
      db.exec("COMMIT");
      insert = statement;
    } catch (error) {
      db.close();
      throw error;
    }
  }

  insert.run(name, comment);
}
