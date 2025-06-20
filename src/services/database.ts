import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { Logger } from '../utils/logger';

export interface ExerciseRecord {
  id?: number;
  guild_id: string;
  user_id: string;
  exercise_type: string;
  repetitions: number;
  timestamp: Date;
}

export class DatabaseService {
  private db!: sqlite3.Database;
  public run: any;
  public get: any;
  public all: any;
  
  async initialize() {
    try {
      this.db = new sqlite3.Database('./trainertoe.db');
      
      this.run = promisify(this.db.run.bind(this.db));
      this.get = promisify(this.db.get.bind(this.db));
      this.all = promisify(this.db.all.bind(this.db));
      
      await this.createTables();
    } catch (error) {
      Logger.error('Database', 'Failed to initialize:', error);
      throw new Error('Database initialization failed');
    }
  }
  
  private async createTables() {
    await this.run(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id TEXT,
        guild_id TEXT,
        coach_personality TEXT DEFAULT 'encouraging',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, guild_id)
      )
    `);
    
    await this.run(`
      CREATE TABLE IF NOT EXISTS exercise_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        exercise_type TEXT NOT NULL,
        repetitions INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await this.run(`
      CREATE TABLE IF NOT EXISTS user_progress (
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        fitness_level INTEGER DEFAULT 1,
        last_exercise_time DATETIME,
        total_exercises INTEGER DEFAULT 0,
        PRIMARY KEY (guild_id, user_id)
      )
    `);
    
    await this.run(`
      CREATE TABLE IF NOT EXISTS workout_schedules (
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        next_workout_time TEXT NOT NULL,
        interval_ms INTEGER NOT NULL,
        PRIMARY KEY (user_id, guild_id)
      )
    `);
  }
  
  async recordExercise(guildId: string, userId: string, exerciseType: string, repetitions: number) {
    try {
      await this.run(
        'INSERT INTO exercise_history (guild_id, user_id, exercise_type, repetitions) VALUES (?, ?, ?, ?)',
        [guildId, userId, exerciseType, repetitions]
      );
      
      await this.run(`
        INSERT INTO user_progress (guild_id, user_id, last_exercise_time, total_exercises, fitness_level)
        VALUES (?, ?, CURRENT_TIMESTAMP, 1, 1)
        ON CONFLICT(guild_id, user_id) DO UPDATE SET
          last_exercise_time = CURRENT_TIMESTAMP,
          total_exercises = total_exercises + 1
      `, [guildId, userId]);
    } catch (error) {
      Logger.error('Database', 'Failed to record exercise:', error);
    }
  }
  
  async getRecentExercises(guildId: string, userId: string, limit: number = 10): Promise<ExerciseRecord[]> {
    try {
      return await this.all(
        'SELECT * FROM exercise_history WHERE guild_id = ? AND user_id = ? ORDER BY timestamp DESC LIMIT ?',
        [guildId, userId, limit]
      );
    } catch (error) {
      Logger.error('Database', 'Failed to get recent exercises:', error);
      return [];
    }
  }
  
  async getUserProgress(guildId: string, userId: string) {
    try {
      const progress = await this.get(
        'SELECT * FROM user_progress WHERE guild_id = ? AND user_id = ?',
        [guildId, userId]
      );
      
      return progress || { fitness_level: 1, total_exercises: 0 };
    } catch (error) {
      Logger.error('Database', 'Failed to get user progress:', error);
      return { fitness_level: 1, total_exercises: 0 };
    }
  }
  
  async updateFitnessLevel(guildId: string, userId: string, level: number) {
    try {
      await this.run(
        'UPDATE user_progress SET fitness_level = ? WHERE guild_id = ? AND user_id = ?',
        [level, guildId, userId]
      );
    } catch (error) {
      Logger.error('Database', 'Failed to update fitness level:', error);
    }
  }
  
  async getUserCoachPreference(guildId: string, userId: string): Promise<string> {
    try {
      const pref = await this.get(
        'SELECT coach_personality FROM user_preferences WHERE guild_id = ? AND user_id = ?',
        [guildId, userId]
      );
      
      return pref?.coach_personality || 'encouraging';
    } catch (error) {
      Logger.error('Database', 'Failed to get coach preference:', error);
      return 'encouraging';
    }
  }
  
  async setUserCoachPreference(guildId: string, userId: string, personality: string) {
    try {
      await this.run(`
        INSERT OR REPLACE INTO user_preferences (user_id, guild_id, coach_personality, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `, [userId, guildId, personality]);
    } catch (error) {
      Logger.error('Database', 'Failed to set coach preference:', error);
      throw error;
    }
  }
}