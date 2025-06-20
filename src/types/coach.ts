export enum CoachPersonality {
  ENCOURAGING = 'encouraging',
  DRILL_SERGEANT = 'drill_sergeant',
  MOTIVATIONAL = 'motivational',
  CHILL = 'chill',
  COMPETITIVE = 'competitive'
}

export interface CoachProfile {
  personality: CoachPersonality;
  voiceLines: {
    welcome: string[];
    countdown: string[];
    repCount: string[];
    motivation: string[];
    completion: string[];
    nextSession: string[];
  };
  timingProfile: {
    baseMultiplier: number;  // How fast/slow this coach counts
    restBetweenReps: number; // Milliseconds between reps
    motivationFrequency: number; // How often to give motivation (every N reps)
  };
}

export interface ExerciseTiming {
  exerciseType: string;
  repDuration: number;      // Base time per rep in ms
  restBetweenReps: number;   // Pause between reps
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface ExercisePhase {
  name: string;
  duration: number; // milliseconds
  instruction?: string;
}

export interface RealisticExerciseTiming extends ExerciseTiming {
  phases: ExercisePhase[];
  breathingPattern: {
    inhale: number; // which phase to inhale
    exhale: number; // which phase to exhale
  };
  fatigueMultiplier: number; // How much timing increases as user gets tired
}