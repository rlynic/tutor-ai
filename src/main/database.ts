import Database from 'better-sqlite3';
import * as path from 'path';
import { app, ipcMain } from 'electron';

let db: Database.Database;

/**
 * 初始化 SQLite 数据库并建表
 */
export function initDatabase(): void {
  const dbPath = path.join(app.getPath('userData'), 'tutor-ai.db');
  db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      question_text TEXT NOT NULL,
      question_type TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS knowledge_points (
      id TEXT PRIMARY KEY,
      topic TEXT NOT NULL,
      concept TEXT NOT NULL,
      mastery_level INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS error_questions (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      question TEXT NOT NULL,
      error_type TEXT,
      note TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  console.log('[DB] Database initialized at', dbPath);
}

/**
 * 注册所有 IPC handlers
 */
export function registerIpcHandlers(): void {
  // ── Sessions ──────────────────────────────────

  ipcMain.handle('db:saveSession', (_event, session: any) => {
    const stmt = db.prepare(`
      INSERT INTO sessions (id, question_text, question_type, created_at, updated_at)
      VALUES (@id, @question_text, @question_type, @created_at, @updated_at)
      ON CONFLICT(id) DO UPDATE SET
        question_text = excluded.question_text,
        question_type = excluded.question_type,
        updated_at = excluded.updated_at
    `);
    stmt.run({
      id: session.id,
      question_text: session.questionText || '',
      question_type: session.questionType || null,
      created_at: session.createdAt || Date.now(),
      updated_at: Date.now(),
    });

    // Save messages
    if (session.messages && session.messages.length > 0) {
      const msgStmt = db.prepare(`
        INSERT INTO messages (id, session_id, role, content, timestamp)
        VALUES (@id, @session_id, @role, @content, @timestamp)
        ON CONFLICT(id) DO UPDATE SET content = excluded.content
      `);
      const saveMessages = db.transaction((msgs: any[]) => {
        for (const msg of msgs) {
          msgStmt.run({
            id: msg.id || `${session.id}_${Date.now()}_${Math.random()}`,
            session_id: session.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp || Date.now(),
          });
        }
      });
      saveMessages(session.messages);
    }
    return { success: true };
  });

  ipcMain.handle('db:getSession', (_event, sessionId: string) => {
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as any;
    if (!session) return null;
    const messages = db.prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC').all(sessionId);
    return {
      id: session.id,
      questionText: session.question_text,
      questionType: session.question_type,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      messages,
    };
  });

  ipcMain.handle('db:getAllSessions', () => {
    const sessions = db.prepare('SELECT * FROM sessions ORDER BY updated_at DESC').all() as any[];
    return sessions.map(s => ({
      id: s.id,
      questionText: s.question_text,
      questionType: s.question_type,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    }));
  });

  ipcMain.handle('db:deleteSession', (_event, sessionId: string) => {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
    db.prepare('DELETE FROM messages WHERE session_id = ?').run(sessionId);
    return { success: true };
  });

  // ── Config ────────────────────────────────────

  ipcMain.handle('db:saveConfig', (_event, config: Record<string, any>) => {
    const stmt = db.prepare('INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
    const save = db.transaction((cfg: Record<string, any>) => {
      for (const [key, value] of Object.entries(cfg)) {
        stmt.run(key, JSON.stringify(value));
      }
    });
    save(config);
    return { success: true };
  });

  ipcMain.handle('db:getConfig', () => {
    const rows = db.prepare('SELECT key, value FROM config').all() as any[];
    const config: Record<string, any> = {};
    for (const row of rows) {
      try {
        config[row.key] = JSON.parse(row.value);
      } catch {
        config[row.key] = row.value;
      }
    }
    return config;
  });

  // ── Knowledge Points ──────────────────────────

  ipcMain.handle('db:saveKnowledgePoint', (_event, kp: any) => {
    db.prepare(`
      INSERT INTO knowledge_points (id, topic, concept, mastery_level, updated_at)
      VALUES (@id, @topic, @concept, @mastery_level, @updated_at)
      ON CONFLICT(id) DO UPDATE SET mastery_level = excluded.mastery_level, updated_at = excluded.updated_at
    `).run({ ...kp, updated_at: Date.now() });
    return { success: true };
  });

  ipcMain.handle('db:getAllKnowledgePoints', () => {
    return db.prepare('SELECT * FROM knowledge_points ORDER BY mastery_level ASC').all();
  });

  // ── Error Questions ────────────────────────────

  ipcMain.handle('db:saveErrorQuestion', (_event, eq: any) => {
    db.prepare(`
      INSERT INTO error_questions (id, session_id, question, error_type, note, created_at)
      VALUES (@id, @session_id, @question, @error_type, @note, @created_at)
    `).run({ ...eq, created_at: Date.now() });
    return { success: true };
  });

  ipcMain.handle('db:getAllErrorQuestions', () => {
    return db.prepare('SELECT * FROM error_questions ORDER BY created_at DESC').all();
  });
}
