import { Client, VoiceChannel, GuildMember } from 'discord.js';
import { Logger } from '../utils/logger';
import { joinVoiceChannel } from '@discordjs/voice';
import { ExerciseService } from './exercise';
import { OptimizedVoiceService } from './optimized-voice';
import { DatabaseService } from './database';
import { EnhancedWorkoutSession } from './enhanced-workout-session';

interface ScheduledWorkout {
  userId: string;
  guildId: string;
  channelId: string;
  nextWorkoutTime: Date;
  intervalMs: number;
  timeoutId?: NodeJS.Timeout;
}

export class WorkoutScheduler {
  private scheduledWorkouts: Map<string, ScheduledWorkout> = new Map();
  private client: Client;
  private exerciseService: ExerciseService;
  private voiceService: OptimizedVoiceService;
  private databaseService: DatabaseService;
  
  constructor(
    client: Client,
    exerciseService: ExerciseService,
    voiceService: OptimizedVoiceService,
    databaseService: DatabaseService
  ) {
    this.client = client;
    this.exerciseService = exerciseService;
    this.voiceService = voiceService;
    this.databaseService = databaseService;
    
    // Load existing schedules from database on startup
    this.loadSchedules();
  }
  
  async scheduleUserWorkout(member: GuildMember, channelId: string, intervalMinutes: number = 60): Promise<void> {
    const key = `${member.guild.id}-${member.id}`;
    
    // Cancel existing schedule for this user
    this.cancelUserWorkout(member.guild.id, member.id);
    
    const intervalMs = intervalMinutes * 60 * 1000;
    const nextWorkoutTime = new Date(Date.now() + intervalMs);
    
    const scheduled: ScheduledWorkout = {
      userId: member.id,
      guildId: member.guild.id,
      channelId: channelId,
      nextWorkoutTime,
      intervalMs
    };
    
    // Schedule the next workout
    scheduled.timeoutId = setTimeout(() => {
      this.executeScheduledWorkout(scheduled);
    }, intervalMs);
    
    this.scheduledWorkouts.set(key, scheduled);
    
    // Save to database
    await this.saveSchedule(scheduled);
    
    Logger.info('Scheduler', `Scheduled workout for user ${member.user.tag} in ${intervalMinutes} minutes`);
  }
  
  private async executeScheduledWorkout(scheduled: ScheduledWorkout): Promise<void> {
    try {
      Logger.info('Scheduler', `Executing scheduled workout for user ${scheduled.userId}`);
      
      // Get the guild and member
      const guild = this.client.guilds.cache.get(scheduled.guildId);
      if (!guild) {
        Logger.warn('Scheduler', `Guild ${scheduled.guildId} not found, cancelling schedule`);
        this.cancelUserWorkout(scheduled.guildId, scheduled.userId);
        return;
      }
      
      // Get the member
      const member = await guild.members.fetch(scheduled.userId).catch(() => null);
      if (!member) {
        Logger.warn('Scheduler', `Member ${scheduled.userId} not found, cancelling schedule`);
        this.cancelUserWorkout(scheduled.guildId, scheduled.userId);
        return;
      }
      
      // Check if user is in the voice channel
      const voiceChannel = guild.channels.cache.get(scheduled.channelId) as VoiceChannel;
      if (!voiceChannel || !voiceChannel.members.has(scheduled.userId)) {
        Logger.debug('Scheduler', 'User not in voice channel, will retry next hour');
        // Reschedule for next hour
        this.rescheduleWorkout(scheduled);
        return;
      }
      
      // Join the voice channel
      const connection = joinVoiceChannel({
        channelId: scheduled.channelId,
        guildId: scheduled.guildId,
        adapterCreator: guild.voiceAdapterCreator,
      });
      
      // Wait for connection to be ready
      await new Promise<void>((resolve) => {
        if (connection.state.status === 'ready') {
          resolve();
        } else {
          connection.once('stateChange', (_, newState) => {
            if (newState.status === 'ready') resolve();
          });
        }
      });
      
      // Get next exercise
      const exercise = await this.exerciseService.getNextExercise(scheduled.guildId, scheduled.userId);
      
      // Start the workout session
      const workoutSession = new EnhancedWorkoutSession(
        connection,
        this.voiceService,
        this.exerciseService,
        this.databaseService
      );
      
      await workoutSession.startGuidedWorkout(exercise, scheduled.guildId, scheduled.userId);
      
      // Record the exercise
      await this.exerciseService.recordExercise(scheduled.guildId, scheduled.userId, exercise);
      
      // Schedule the next workout
      this.rescheduleWorkout(scheduled);
      
    } catch (error) {
      Logger.error('Scheduler', 'Error executing scheduled workout:', error);
      // Reschedule even on error
      this.rescheduleWorkout(scheduled);
    }
  }
  
  private rescheduleWorkout(scheduled: ScheduledWorkout): void {
    const key = `${scheduled.guildId}-${scheduled.userId}`;
    
    // Update next workout time
    scheduled.nextWorkoutTime = new Date(Date.now() + scheduled.intervalMs);
    
    // Set new timeout
    scheduled.timeoutId = setTimeout(() => {
      this.executeScheduledWorkout(scheduled);
    }, scheduled.intervalMs);
    
    this.scheduledWorkouts.set(key, scheduled);
    this.saveSchedule(scheduled);
    
    Logger.debug('Scheduler', `Rescheduled workout for user ${scheduled.userId}`);
  }
  
  cancelUserWorkout(guildId: string, userId: string): void {
    const key = `${guildId}-${userId}`;
    const scheduled = this.scheduledWorkouts.get(key);
    
    if (scheduled) {
      if (scheduled.timeoutId) {
        clearTimeout(scheduled.timeoutId);
      }
      this.scheduledWorkouts.delete(key);
      this.removeSchedule(guildId, userId);
      Logger.info('Scheduler', `Cancelled workout schedule for user ${userId}`);
    }
  }
  
  getUserSchedule(guildId: string, userId: string): ScheduledWorkout | null {
    const key = `${guildId}-${userId}`;
    return this.scheduledWorkouts.get(key) || null;
  }
  
  getAllSchedules(): ScheduledWorkout[] {
    return Array.from(this.scheduledWorkouts.values());
  }
  
  // Database operations
  private async saveSchedule(scheduled: ScheduledWorkout): Promise<void> {
    try {
      await this.databaseService.run(`
        INSERT OR REPLACE INTO workout_schedules 
        (user_id, guild_id, channel_id, next_workout_time, interval_ms)
        VALUES (?, ?, ?, ?, ?)
      `, [
        scheduled.userId,
        scheduled.guildId,
        scheduled.channelId,
        scheduled.nextWorkoutTime.toISOString(),
        scheduled.intervalMs
      ]);
    } catch (error) {
      Logger.error('Scheduler', 'Failed to save schedule:', error);
      // Don't throw - continue with in-memory scheduling
    }
  }
  
  private async removeSchedule(guildId: string, userId: string): Promise<void> {
    try {
      await this.databaseService.run(`
        DELETE FROM workout_schedules 
        WHERE guild_id = ? AND user_id = ?
      `, [guildId, userId]);
    } catch (error) {
      Logger.error('Scheduler', 'Failed to remove schedule:', error);
      // Don't throw - schedule is already removed from memory
    }
  }
  
  private async loadSchedules(): Promise<void> {
    try {
      // Create table if it doesn't exist
      await this.databaseService.run(`
        CREATE TABLE IF NOT EXISTS workout_schedules (
          user_id TEXT NOT NULL,
          guild_id TEXT NOT NULL,
          channel_id TEXT NOT NULL,
          next_workout_time TEXT NOT NULL,
          interval_ms INTEGER NOT NULL,
          PRIMARY KEY (user_id, guild_id)
        )
      `);
      
      // Load all schedules
      const schedules = await this.databaseService.all(`
        SELECT * FROM workout_schedules
      `);
      
      for (const schedule of schedules) {
        try {
          const nextWorkoutTime = new Date(schedule.next_workout_time);
        const now = new Date();
        
        // Calculate time until next workout
        let timeUntilNext = nextWorkoutTime.getTime() - now.getTime();
        
        // If the scheduled time has passed, schedule for next interval
        if (timeUntilNext <= 0) {
          timeUntilNext = schedule.interval_ms;
        }
        
        const scheduled: ScheduledWorkout = {
          userId: schedule.user_id,
          guildId: schedule.guild_id,
          channelId: schedule.channel_id,
          nextWorkoutTime: new Date(now.getTime() + timeUntilNext),
          intervalMs: schedule.interval_ms
        };
        
        // Schedule the workout
        scheduled.timeoutId = setTimeout(() => {
          this.executeScheduledWorkout(scheduled);
        }, timeUntilNext);
        
        const key = `${scheduled.guildId}-${scheduled.userId}`;
        this.scheduledWorkouts.set(key, scheduled);
        
        Logger.debug('Scheduler', `Loaded schedule for user ${scheduled.userId}`);
        } catch (scheduleError) {
          Logger.error('Scheduler', `Failed to load schedule for user ${schedule.user_id}:`, scheduleError);
          // Continue with next schedule
        }
      }
    } catch (error) {
      Logger.error('Scheduler', 'Error loading schedules:', error);
    }
  }
}