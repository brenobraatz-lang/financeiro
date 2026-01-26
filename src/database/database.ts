import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../financeiro.db');

class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
      }
      
      console.log('Conectado ao banco de dados SQLite');
      
      // Timeout para operações bloqueadas ANTES de WAL
      this.db.configure('busyTimeout', 5000);
      
      // Configurar WAL mode para melhor concorrência
      this.db.run('PRAGMA journal_mode = WAL', (err) => {
        if (err) console.warn('Aviso ao ativar WAL:', err);
        else console.log('✅ WAL mode ativado');
      });
    });
  }

  getDatabase(): sqlite3.Database {
    return this.db;
  }

  async run(sql: string, params: any[] = []): Promise<{ lastID?: number; changes: number }> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close(): void {
    this.db.close((err) => {
      if (err) {
        console.error('Erro ao fechar banco de dados:', err);
      } else {
        console.log('Banco de dados fechado');
      }
    });
  }
}

export const database = new Database();

