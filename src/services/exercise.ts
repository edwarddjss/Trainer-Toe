import { DatabaseService } from './database';
import { Logger } from '../utils/logger';

export interface Exercise {
  type: string;
  repetitions: number;
  duration?: number;
}

const EXERCISE_CATALOG = [
  { type: 'pushups', minReps: 10, maxReps: 30 },
  { type: 'situps', minReps: 15, maxReps: 40 },
  { type: 'jumping jacks', minReps: 20, maxReps: 50 },
  { type: 'burpees', minReps: 5, maxReps: 15 },
  { type: 'squats', minReps: 15, maxReps: 35 },
  { type: 'lunges', minReps: 10, maxReps: 25 },
  { type: 'mountain climbers', minReps: 10, maxReps: 20 },
  { type: 'plank', minReps: 30, maxReps: 60, unit: 'seconds' },
  { type: 'wall sits', minReps: 30, maxReps: 60, unit: 'seconds' },
  { type: 'high knees', minReps: 15, maxReps: 30 }
];

export class ExerciseService {
  constructor(private db: DatabaseService) {}
  
  async getNextExercise(guildId: string, userId: string): Promise<Exercise> {
    const recentExercises = await this.db.getRecentExercises(guildId, userId, 5);
    const userProgress = await this.db.getUserProgress(guildId, userId);
    
    const recentTypes = recentExercises.map(e => e.exercise_type);
    const availableExercises = EXERCISE_CATALOG.filter(e => !recentTypes.includes(e.type));
    
    if (availableExercises.length === 0) {
      availableExercises.push(...EXERCISE_CATALOG);
    }
    
    const selectedExercise = availableExercises[Math.floor(Math.random() * availableExercises.length)];
    
    const difficultyMultiplier = 1 + (userProgress.fitness_level - 1) * 0.2;
    const baseReps = selectedExercise.minReps + 
      Math.floor((selectedExercise.maxReps - selectedExercise.minReps) * 0.5);
    const adjustedReps = Math.floor(baseReps * difficultyMultiplier);
    
    const finalReps = Math.max(
      selectedExercise.minReps,
      Math.min(selectedExercise.maxReps, adjustedReps)
    );
    
    return {
      type: selectedExercise.type,
      repetitions: finalReps,
      duration: selectedExercise.unit === 'seconds' ? finalReps : undefined
    };
  }
  
  
  async recordExercise(guildId: string, userId: string, exercise: Exercise) {
    try {
      await this.db.recordExercise(guildId, userId, exercise.type, exercise.repetitions);
      
      const progress = await this.db.getUserProgress(guildId, userId);
      
      if (progress.total_exercises > 0 && progress.total_exercises % 10 === 0) {
        const newLevel = Math.min(10, progress.fitness_level + 1);
        await this.db.updateFitnessLevel(guildId, userId, newLevel);
      }
    } catch (error) {
      Logger.error('Exercise', 'Failed to record exercise:', error);
    }
  }
}