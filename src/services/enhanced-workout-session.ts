import { VoiceConnection, AudioPlayer, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, StreamType } from '@discordjs/voice';
import { OptimizedVoiceService } from './optimized-voice';
import { Logger } from '../utils/logger';
import { EXERCISE_TIMINGS, TIMEOUTS } from '../constants';
import { Exercise, ExerciseService } from './exercise';
import { DatabaseService } from './database';
import { CoachPersonalityService } from './coach-personality';
import { SmartTimingService } from './smart-timing';
import { CoachPersonality, CoachProfile } from '../types/coach';
import { Readable } from 'stream';

export class EnhancedWorkoutSession {
  private connection: VoiceConnection;
  private voiceService: OptimizedVoiceService;
  private exerciseService: ExerciseService;
  private databaseService: DatabaseService;
  private coachService: CoachPersonalityService;
  private timingService: SmartTimingService;
  private player: AudioPlayer;
  private currentCoach: CoachProfile;
  private userLevel: number = 1;
  
  constructor(
    connection: VoiceConnection, 
    voiceService: OptimizedVoiceService, 
    exerciseService: ExerciseService,
    databaseService: DatabaseService
  ) {
    this.connection = connection;
    this.voiceService = voiceService;
    this.exerciseService = exerciseService;
    this.databaseService = databaseService;
    this.coachService = new CoachPersonalityService();
    this.timingService = new SmartTimingService();
    this.player = createAudioPlayer();
    
    // Initialize with default coach
    this.currentCoach = this.coachService.getCoach(CoachPersonality.ENCOURAGING);
    
    this.connection.subscribe(this.player);
  }
  
  async startGuidedWorkout(exercise: Exercise, guildId: string, userId: string): Promise<void> {
    Logger.info('Workout', `Starting guided workout: ${exercise.repetitions} ${exercise.type}`);
    
    try {
      // Validate connection state
      if (this.connection.state.status === 'destroyed') {
        throw new Error('Voice connection was destroyed before workout could start');
      }
      // Get user preferences and level
      const coachPersonality = await this.databaseService.getUserCoachPreference(guildId, userId);
      const userProgress = await this.databaseService.getUserProgress(guildId, userId);
      this.userLevel = userProgress.fitness_level || 1;
      
      // Set up coach
      this.currentCoach = this.coachService.getCoach(coachPersonality as CoachPersonality);
      Logger.debug('Workout', `Using ${coachPersonality} coach for level ${this.userLevel}`);
      
      // Simple, direct flow
      await this.wait(500);
      
      // 1. Simple welcome
      await this.playVoice("Let's get moving!");
      await this.wait(1500);
      
      // 2. Exercise announcement
      if (exercise.type.includes('plank') || exercise.type.includes('wall sit')) {
        await this.playVoice(`Time for a ${exercise.duration || exercise.repetitions} second ${exercise.type}!`);
      } else {
        await this.playVoice(`Time for ${exercise.repetitions} ${exercise.type}!`);
      }
      await this.wait(1500);
      
      // 3. Simple countdown
      await this.playVoice("Starting in 3... 2... 1... GO!");
      await this.wait(1000);
      
      // 4. Execute exercise
      if (exercise.type.includes('plank') || exercise.type.includes('wall sit')) {
        await this.guidedTimedExercise(exercise);
      } else {
        await this.guidedRepExercise(exercise);
      }
      
      // 5. Simple completion
      await this.wait(1500);
      await this.playVoice("Excellent work!");
      await this.wait(1500);
      
      // Final acknowledgment
      if (!exercise.type.includes('plank') && !exercise.type.includes('wall sit')) {
        await this.playVoice(`${exercise.repetitions} reps completed!`);
      }
      await this.wait(1000);
      
      // 6. Simple closing
      await this.playVoice("Great job! See you next time!");
      await this.wait(2000);
      
    } catch (error) {
      Logger.error('Workout', 'Error during workout:', error);
      
      // Try to play an apology message before disconnecting
      try {
        if (this.connection.state.status !== 'destroyed') {
          await this.playVoice('Sorry, Coach Toe encountered a technical issue. Keep up the great work!');
          await this.wait(2000);
        }
      } catch (recoveryError) {
        Logger.error('Workout', 'Could not play recovery message:', recoveryError);
      }
    } finally {
      this.disconnect();
    }
  }
  
  private async guidedRepExercise(exercise: Exercise): Promise<void> {
    Logger.debug('Workout', 'Starting rep counting exercise');
    
    const exerciseKey = exercise.type.toUpperCase().replace(/\s+/g, '_') as keyof typeof EXERCISE_TIMINGS;
    const exerciseTiming = EXERCISE_TIMINGS[exerciseKey] || EXERCISE_TIMINGS.DEFAULT;
    
    // Count reps properly - AFTER completion
    for (let rep = 1; rep <= exercise.repetitions; rep++) {
      Logger.debug('Workout', `Rep ${rep}/${exercise.repetitions}`);
      
      // 1. Motivation BEFORE the rep (only at key moments)
      if (rep === 1) {
        await this.playVoice("Here we go!");
        await this.wait(1000);
      } else if (rep === Math.floor(exercise.repetitions / 2) && exercise.repetitions >= 10) {
        await this.playVoice("Halfway there!");
        await this.wait(800);
      } else if (rep === exercise.repetitions && exercise.repetitions > 1) {
        await this.playVoice("Last one!");
        await this.wait(800);
      }
      
      // 2. Wait for rep execution
      await this.wait(exerciseTiming.repDuration);
      
      // 3. Count the completed rep
      await this.playOptimizedVoice(await this.voiceService.generateRepCount(rep));
      
      // 4. Rest between reps (with progressive fatigue)
      if (rep < exercise.repetitions) {
        const fatigueMultiplier = 1 + (rep / exercise.repetitions) * 0.5;
        const adjustedRest = Math.round(exerciseTiming.restDuration * fatigueMultiplier);
        await this.wait(adjustedRest);
      }
    }
    
    // Simple completion
    await this.wait(1000);
    await this.playVoice("Great set!");
  }
  
  private async guidedTimedExercise(exercise: Exercise): Promise<void> {
    Logger.debug('Workout', 'Starting timed exercise');
    
    const duration = exercise.duration || 30;
    await this.playVoice(`Hold for ${duration} seconds!`);
    await this.wait(2000);
    
    const startTime = Date.now();
    const keyIntervals = [60, 45, 30, 20, 15, 10, 5, 4, 3, 2, 1];
    const announcedTimes = new Set<number>();
    
    // Track next announcement
    let nextAnnouncementIdx = keyIntervals.findIndex(t => t < duration);
    if (nextAnnouncementIdx === -1) nextAnnouncementIdx = keyIntervals.length - 1;
    
    const endTime = startTime + (duration * 1000);
    let halfwayAnnounced = false;
    
    while (Date.now() < endTime) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = duration - elapsed;
      
      if (remaining <= 0) break;
      
      // Check for announcements
      if (nextAnnouncementIdx < keyIntervals.length && 
          remaining <= keyIntervals[nextAnnouncementIdx] && 
          !announcedTimes.has(remaining)) {
        
        announcedTimes.add(remaining);
        
        if (remaining > 10) {
          await this.playVoice(`${remaining} seconds!`);
        } else if (remaining > 0) {
          await this.playVoice(remaining.toString());
        }
        
        nextAnnouncementIdx++;
      }
      
      // Halfway point motivation
      if (!halfwayAnnounced && elapsed >= Math.floor(duration / 2) && duration > 20) {
        halfwayAnnounced = true;
        await this.playVoice("Halfway there! Stay strong!");
      }
      
      await this.wait(250);
    }
    
    await this.playVoice("Time!");
    await this.wait(1000);
    await this.playVoice("Great hold!");
  }
  
  private async playOptimizedVoice(audioBuffer: Buffer): Promise<void> {
    try {
      const audioStream = new Readable({
        read() {
          this.push(audioBuffer);
          this.push(null);
        }
      });
      
      const resource = createAudioResource(audioStream, { 
        inputType: StreamType.Arbitrary,
        inlineVolume: true 
      });
      resource.volume?.setVolume(0.9);
      
      return new Promise((resolve) => {
        let resolved = false;
        
        const cleanup = () => {
          if (!resolved) {
            resolved = true;
            resolve();
          }
        };
        
        this.player.play(resource);
        this.player.once(AudioPlayerStatus.Idle, cleanup);
        
        // Timeout safety - but only if not already resolved
        setTimeout(() => cleanup(), TIMEOUTS.AUDIO_PLAYBACK);
      });
    } catch (error) {
      Logger.error('Workout', 'Voice playback error:', error);
    }
  }

  private async playVoice(text: string): Promise<void> {
    try {
      Logger.debug('Workout', `Playing: "${text}"`);
      const audioBuffer = await this.voiceService.generateSpeech(text);
      await this.playOptimizedVoice(audioBuffer);
    } catch (error) {
      Logger.error('Workout', 'Voice playback failed:', error);
      
      // Graceful degradation - continue workout even if voice fails
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('Voice connection') || errorMessage.includes('destroyed')) {
        // Connection issues - stop the workout
        Logger.error('Workout', 'Voice connection lost - ending workout');
        throw error;
      } else {
        // API or other errors - continue silently with timing only
        Logger.debug('Workout', 'Continuing with timing only (no voice)');
        await this.wait(1000); // Give user time to keep up
      }
    }
  }
  
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private disconnect(): void {
    const timeoutId = setTimeout(() => {
      try {
        if (this.connection.state.status !== VoiceConnectionStatus.Destroyed) {
          this.connection.destroy();
        }
      } catch (error) {
        Logger.error('Workout', 'Error destroying connection:', error);
      }
    }, TIMEOUTS.DISCONNECT_DELAY);
    
    this.connection.on('stateChange', (oldState, newState) => {
      if (newState.status === VoiceConnectionStatus.Destroyed) {
        clearTimeout(timeoutId);
      }
    });
  }
}