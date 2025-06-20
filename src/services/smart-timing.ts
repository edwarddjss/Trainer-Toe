import { ExerciseTiming, ExercisePhase, RealisticExerciseTiming } from '../types/coach';

export class SmartTimingService {
  private exerciseTimings: Map<string, RealisticExerciseTiming[]> = new Map();
  
  constructor() {
    this.initializeRealisticTimings();
  }
  
  private initializeRealisticTimings() {
    // PUSHUPS - 2-3 seconds down, 1 second pause, 1 second up = ~3-4 seconds total
    this.exerciseTimings.set('pushups', [
      { 
        exerciseType: 'pushups', 
        repDuration: 4000, 
        restBetweenReps: 800, 
        
        difficulty: 'beginner',
        phases: [
          { name: 'down', duration: 2500, instruction: 'Down' },
          { name: 'pause', duration: 500 },
          { name: 'up', duration: 1000, instruction: 'Up' }
        ],
        breathingPattern: { inhale: 0, exhale: 2 },
        fatigueMultiplier: 1.3
      },
      { 
        exerciseType: 'pushups', 
        repDuration: 3500, 
        restBetweenReps: 600, 
        
        difficulty: 'intermediate',
        phases: [
          { name: 'down', duration: 2000 },
          { name: 'pause', duration: 500 },
          { name: 'up', duration: 1000 }
        ],
        breathingPattern: { inhale: 0, exhale: 2 },
        fatigueMultiplier: 1.2
      },
      { 
        exerciseType: 'pushups', 
        repDuration: 3000, 
        restBetweenReps: 400, 
        
        difficulty: 'advanced',
        phases: [
          { name: 'down', duration: 1500 },
          { name: 'pause', duration: 500 },
          { name: 'up', duration: 1000 }
        ],
        breathingPattern: { inhale: 0, exhale: 2 },
        fatigueMultiplier: 1.1
      }
    ]);
    
    // SQUATS - 3 seconds down, 1 second pause, 2 seconds up = ~6 seconds total
    this.exerciseTimings.set('squats', [
      { 
        exerciseType: 'squats', 
        repDuration: 6500, 
        restBetweenReps: 1000, 
        
        difficulty: 'beginner',
        phases: [
          { name: 'down', duration: 3000, instruction: 'Down' },
          { name: 'pause', duration: 1000 },
          { name: 'up', duration: 2500, instruction: 'Up' }
        ],
        breathingPattern: { inhale: 0, exhale: 2 },
        fatigueMultiplier: 1.4
      },
      { 
        exerciseType: 'squats', 
        repDuration: 6000, 
        restBetweenReps: 800, 
        
        difficulty: 'intermediate',
        phases: [
          { name: 'down', duration: 3000 },
          { name: 'pause', duration: 1000 },
          { name: 'up', duration: 2000 }
        ],
        breathingPattern: { inhale: 0, exhale: 2 },
        fatigueMultiplier: 1.3
      },
      { 
        exerciseType: 'squats', 
        repDuration: 5500, 
        restBetweenReps: 600, 
        
        difficulty: 'advanced',
        phases: [
          { name: 'down', duration: 2500 },
          { name: 'pause', duration: 1000 },
          { name: 'up', duration: 2000 }
        ],
        breathingPattern: { inhale: 0, exhale: 2 },
        fatigueMultiplier: 1.2
      }
    ]);
    
    // JUMPING JACKS - Fast rhythm, ~1 second per rep
    this.exerciseTimings.set('jumping jacks', [
      { 
        exerciseType: 'jumping jacks', 
        repDuration: 1200, 
        restBetweenReps: 200, 
        
        difficulty: 'beginner',
        phases: [
          { name: 'out', duration: 600 },
          { name: 'in', duration: 600 }
        ],
        breathingPattern: { inhale: 0, exhale: 1 },
        fatigueMultiplier: 1.2
      },
      { 
        exerciseType: 'jumping jacks', 
        repDuration: 1000, 
        restBetweenReps: 150, 
        
        difficulty: 'intermediate',
        phases: [
          { name: 'out', duration: 500 },
          { name: 'in', duration: 500 }
        ],
        breathingPattern: { inhale: 0, exhale: 1 },
        fatigueMultiplier: 1.15
      },
      { 
        exerciseType: 'jumping jacks', 
        repDuration: 800, 
        restBetweenReps: 100, 
        
        difficulty: 'advanced',
        phases: [
          { name: 'out', duration: 400 },
          { name: 'in', duration: 400 }
        ],
        breathingPattern: { inhale: 0, exhale: 1 },
        fatigueMultiplier: 1.1
      }
    ]);
    
    // BURPEES - 6-8 seconds for full movement
    this.exerciseTimings.set('burpees', [
      { 
        exerciseType: 'burpees', 
        repDuration: 8000, 
        restBetweenReps: 2000, 
        
        difficulty: 'beginner',
        phases: [
          { name: 'squat', duration: 1500, instruction: 'Squat down' },
          { name: 'plank', duration: 1500, instruction: 'Plank position' },
          { name: 'pushup', duration: 2000 },
          { name: 'jump_back', duration: 1500, instruction: 'Jump back' },
          { name: 'jump_up', duration: 1500, instruction: 'Jump up' }
        ],
        breathingPattern: { inhale: 0, exhale: 4 },
        fatigueMultiplier: 1.5
      },
      { 
        exerciseType: 'burpees', 
        repDuration: 7000, 
        restBetweenReps: 1500, 
        
        difficulty: 'intermediate',
        phases: [
          { name: 'squat', duration: 1000 },
          { name: 'plank', duration: 1000 },
          { name: 'pushup', duration: 2000 },
          { name: 'jump_back', duration: 1500 },
          { name: 'jump_up', duration: 1500 }
        ],
        breathingPattern: { inhale: 0, exhale: 4 },
        fatigueMultiplier: 1.4
      },
      { 
        exerciseType: 'burpees', 
        repDuration: 6000, 
        restBetweenReps: 1000, 
        
        difficulty: 'advanced',
        phases: [
          { name: 'squat', duration: 800 },
          { name: 'plank', duration: 800 },
          { name: 'pushup', duration: 1500 },
          { name: 'jump_back', duration: 1200 },
          { name: 'jump_up', duration: 1700 }
        ],
        breathingPattern: { inhale: 0, exhale: 4 },
        fatigueMultiplier: 1.3
      }
    ]);
    
    // SITUPS - 2 seconds up, 1 second pause, 2 seconds down = ~5 seconds
    this.exerciseTimings.set('situps', [
      { 
        exerciseType: 'situps', 
        repDuration: 5500, 
        restBetweenReps: 800, 
        
        difficulty: 'beginner',
        phases: [
          { name: 'up', duration: 2500, instruction: 'Up' },
          { name: 'pause', duration: 500 },
          { name: 'down', duration: 2500, instruction: 'Down' }
        ],
        breathingPattern: { inhale: 2, exhale: 0 },
        fatigueMultiplier: 1.3
      },
      { 
        exerciseType: 'situps', 
        repDuration: 5000, 
        restBetweenReps: 600, 
        
        difficulty: 'intermediate',
        phases: [
          { name: 'up', duration: 2000 },
          { name: 'pause', duration: 500 },
          { name: 'down', duration: 2500 }
        ],
        breathingPattern: { inhale: 2, exhale: 0 },
        fatigueMultiplier: 1.25
      },
      { 
        exerciseType: 'situps', 
        repDuration: 4500, 
        restBetweenReps: 400, 
        
        difficulty: 'advanced',
        phases: [
          { name: 'up', duration: 1500 },
          { name: 'pause', duration: 500 },
          { name: 'down', duration: 2500 }
        ],
        breathingPattern: { inhale: 2, exhale: 0 },
        fatigueMultiplier: 1.2
      }
    ]);
    
    // LUNGES - Balance required, 3-4 seconds per rep
    this.exerciseTimings.set('lunges', [
      { 
        exerciseType: 'lunges', 
        repDuration: 4500, 
        restBetweenReps: 1000, 
        
        difficulty: 'beginner',
        phases: [
          { name: 'step', duration: 1000, instruction: 'Step forward' },
          { name: 'down', duration: 1500, instruction: 'Lower down' },
          { name: 'up', duration: 1000, instruction: 'Push up' },
          { name: 'return', duration: 1000, instruction: 'Step back' }
        ],
        breathingPattern: { inhale: 0, exhale: 2 },
        fatigueMultiplier: 1.4
      },
      { 
        exerciseType: 'lunges', 
        repDuration: 4000, 
        restBetweenReps: 800, 
        
        difficulty: 'intermediate',
        phases: [
          { name: 'step', duration: 800 },
          { name: 'down', duration: 1200 },
          { name: 'up', duration: 1000 },
          { name: 'return', duration: 1000 }
        ],
        breathingPattern: { inhale: 0, exhale: 2 },
        fatigueMultiplier: 1.3
      },
      { 
        exerciseType: 'lunges', 
        repDuration: 3500, 
        restBetweenReps: 600, 
        
        difficulty: 'advanced',
        phases: [
          { name: 'step', duration: 700 },
          { name: 'down', duration: 1000 },
          { name: 'up', duration: 800 },
          { name: 'return', duration: 1000 }
        ],
        breathingPattern: { inhale: 0, exhale: 2 },
        fatigueMultiplier: 1.2
      }
    ]);
    
    // Static exercises remain the same
    this.exerciseTimings.set('wall sits', [
      { 
        exerciseType: 'wall sits', 
        repDuration: 1000, 
        restBetweenReps: 0, 
        
        difficulty: 'beginner',
        phases: [{ name: 'hold', duration: 1000 }],
        breathingPattern: { inhale: 0, exhale: 0 },
        fatigueMultiplier: 1.0
      },
      { 
        exerciseType: 'wall sits', 
        repDuration: 1000, 
        restBetweenReps: 0, 
        
        difficulty: 'intermediate',
        phases: [{ name: 'hold', duration: 1000 }],
        breathingPattern: { inhale: 0, exhale: 0 },
        fatigueMultiplier: 1.0
      },
      { 
        exerciseType: 'wall sits', 
        repDuration: 1000, 
        restBetweenReps: 0, 
        
        difficulty: 'advanced',
        phases: [{ name: 'hold', duration: 1000 }],
        breathingPattern: { inhale: 0, exhale: 0 },
        fatigueMultiplier: 1.0
      }
    ]);
    
    this.exerciseTimings.set('plank', [
      { 
        exerciseType: 'plank', 
        repDuration: 1000, 
        restBetweenReps: 0, 
        
        difficulty: 'beginner',
        phases: [{ name: 'hold', duration: 1000 }],
        breathingPattern: { inhale: 0, exhale: 0 },
        fatigueMultiplier: 1.0
      },
      { 
        exerciseType: 'plank', 
        repDuration: 1000, 
        restBetweenReps: 0, 
        
        difficulty: 'intermediate',
        phases: [{ name: 'hold', duration: 1000 }],
        breathingPattern: { inhale: 0, exhale: 0 },
        fatigueMultiplier: 1.0
      },
      { 
        exerciseType: 'plank', 
        repDuration: 1000, 
        restBetweenReps: 0, 
        
        difficulty: 'advanced',
        phases: [{ name: 'hold', duration: 1000 }],
        breathingPattern: { inhale: 0, exhale: 0 },
        fatigueMultiplier: 1.0
      }
    ]);
    
    // MOUNTAIN CLIMBERS - Fast alternating movement
    this.exerciseTimings.set('mountain climbers', [
      { 
        exerciseType: 'mountain climbers', 
        repDuration: 1000, 
        restBetweenReps: 150, 
        
        difficulty: 'beginner',
        phases: [
          { name: 'left_knee', duration: 500 },
          { name: 'right_knee', duration: 500 }
        ],
        breathingPattern: { inhale: 0, exhale: 1 },
        fatigueMultiplier: 1.2
      },
      { 
        exerciseType: 'mountain climbers', 
        repDuration: 750, 
        restBetweenReps: 100, 
        
        difficulty: 'intermediate',
        phases: [
          { name: 'left_knee', duration: 375 },
          { name: 'right_knee', duration: 375 }
        ],
        breathingPattern: { inhale: 0, exhale: 1 },
        fatigueMultiplier: 1.15
      },
      { 
        exerciseType: 'mountain climbers', 
        repDuration: 500, 
        restBetweenReps: 50, 
        
        difficulty: 'advanced',
        phases: [
          { name: 'left_knee', duration: 250 },
          { name: 'right_knee', duration: 250 }
        ],
        breathingPattern: { inhale: 0, exhale: 1 },
        fatigueMultiplier: 1.1
      }
    ]);
    
    // HIGH KNEES - Fast cardio movement
    this.exerciseTimings.set('high knees', [
      { 
        exerciseType: 'high knees', 
        repDuration: 800, 
        restBetweenReps: 100, 
        
        difficulty: 'beginner',
        phases: [
          { name: 'left_knee', duration: 400 },
          { name: 'right_knee', duration: 400 }
        ],
        breathingPattern: { inhale: 0, exhale: 1 },
        fatigueMultiplier: 1.2
      },
      { 
        exerciseType: 'high knees', 
        repDuration: 600, 
        restBetweenReps: 75, 
        
        difficulty: 'intermediate',
        phases: [
          { name: 'left_knee', duration: 300 },
          { name: 'right_knee', duration: 300 }
        ],
        breathingPattern: { inhale: 0, exhale: 1 },
        fatigueMultiplier: 1.15
      },
      { 
        exerciseType: 'high knees', 
        repDuration: 400, 
        restBetweenReps: 50, 
        
        difficulty: 'advanced',
        phases: [
          { name: 'left_knee', duration: 200 },
          { name: 'right_knee', duration: 200 }
        ],
        breathingPattern: { inhale: 0, exhale: 1 },
        fatigueMultiplier: 1.1
      }
    ]);
    
    // CRUNCHES - Core focused movement
    this.exerciseTimings.set('crunches', [
      { 
        exerciseType: 'crunches', 
        repDuration: 4000, 
        restBetweenReps: 600, 
        
        difficulty: 'beginner',
        phases: [
          { name: 'up', duration: 1500, instruction: 'Crunch up' },
          { name: 'pause', duration: 500 },
          { name: 'down', duration: 2000, instruction: 'Control down' }
        ],
        breathingPattern: { inhale: 2, exhale: 0 },
        fatigueMultiplier: 1.3
      },
      { 
        exerciseType: 'crunches', 
        repDuration: 3500, 
        restBetweenReps: 500, 
        
        difficulty: 'intermediate',
        phases: [
          { name: 'up', duration: 1200 },
          { name: 'pause', duration: 300 },
          { name: 'down', duration: 2000 }
        ],
        breathingPattern: { inhale: 2, exhale: 0 },
        fatigueMultiplier: 1.25
      },
      { 
        exerciseType: 'crunches', 
        repDuration: 3000, 
        restBetweenReps: 400, 
        
        difficulty: 'advanced',
        phases: [
          { name: 'up', duration: 1000 },
          { name: 'pause', duration: 500 },
          { name: 'down', duration: 1500 }
        ],
        breathingPattern: { inhale: 2, exhale: 0 },
        fatigueMultiplier: 1.2
      }
    ]);
  }
  
  getTiming(exerciseType: string, userLevel: number): RealisticExerciseTiming {
    const timings = this.exerciseTimings.get(exerciseType);
    if (!timings) {
      // Default timing for unknown exercises
      return {
        exerciseType,
        repDuration: 3000,
        restBetweenReps: 600,
        difficulty: 'beginner',
        phases: [{ name: 'rep', duration: 3000 }],
        breathingPattern: { inhale: 0, exhale: 0 },
        fatigueMultiplier: 1.2
      };
    }
    
    // Determine difficulty based on user level
    let difficulty: 'beginner' | 'intermediate' | 'advanced';
    if (userLevel < 10) difficulty = 'beginner';
    else if (userLevel < 25) difficulty = 'intermediate';
    else difficulty = 'advanced';
    
    return timings.find(t => t.difficulty === difficulty) || timings[0];
  }
  
  // PERFECT TIMING CALCULATOR with progressive fatigue
  calculateRealisticTiming(timing: RealisticExerciseTiming, currentRep: number, totalReps: number): {
    repDuration: number;
    restBetweenReps: number;
    phases: ExercisePhase[];
  } {
    const progressRatio = currentRep / totalReps;
    
    // PROGRESSIVE FATIGUE SYSTEM - realistic and smooth
    const fatigueMultiplier = 1 + (progressRatio * (timing.fatigueMultiplier - 1));
    const adjustedRepDuration = Math.round(timing.repDuration * fatigueMultiplier);
    
    // INTELLIGENT REST PERIODS - increase naturally with fatigue
    let restMultiplier = 1;
    if (progressRatio > 0.9) {
      restMultiplier = 2.5; // Much more rest in final 10%
    } else if (progressRatio > 0.8) {
      restMultiplier = 2.0; // Double rest in final 20%
    } else if (progressRatio > 0.6) {
      restMultiplier = 1.6; // 60% more rest after 60%
    } else if (progressRatio > 0.4) {
      restMultiplier = 1.3; // 30% more rest after 40%
    } else if (progressRatio > 0.2) {
      restMultiplier = 1.1; // Slight increase after 20%
    }
    
    const adjustedRest = Math.round(timing.restBetweenReps * restMultiplier);
    
    // CLEAN PHASE TIMING - simplified for perfect flow
    const adjustedPhases = timing.phases.map(phase => ({
      ...phase,
      duration: Math.round((phase.duration / timing.repDuration) * adjustedRepDuration)
    }));
    
    return {
      repDuration: adjustedRepDuration,
      restBetweenReps: Math.max(adjustedRest, 400), // Minimum 400ms rest
      phases: adjustedPhases
    };
  }
  
  // Get breathing cue for current phase
  getBreathingCue(timing: RealisticExerciseTiming, phaseIndex: number): string | null {
    if (phaseIndex === timing.breathingPattern.inhale) {
      return 'Breathe in';
    } else if (phaseIndex === timing.breathingPattern.exhale) {
      return 'Breathe out';
    }
    return null;
  }
  
  // PERFECT MOTIVATION TIMING - Strategic break points only
  shouldGiveMotivation(currentRep: number, totalReps: number): boolean {
    // This method is now DEPRECATED - motivation is handled directly in the workout session
    // for perfect timing control. Kept for backwards compatibility.
    return false;
  }
  
  // Get form reminders for between-set coaching (NOT during reps)
  getFormReminderForBreak(exerciseType: string): string {
    const formReminders: { [key: string]: string[] } = {
      'pushups': [
        "Remember to keep your back straight and core engaged",
        "Focus on full range of motion - chest to the floor",
        "Keep your breathing steady throughout each rep"
      ],
      'squats': [
        "Make sure your knees track over your toes",
        "Keep your chest up and back straight",
        "Go deep and drive through your heels"
      ],
      'jumping jacks': [
        "Keep the full range of motion with arms overhead",
        "Stay light on your feet and maintain rhythm",
        "Engage your core for better control"
      ],
      'burpees': [
        "Make that jump explosive at the top",
        "Keep your chest touching the ground in the pushup",
        "Maintain steady breathing through the movement"
      ],
      'situps': [
        "Control the movement - don't use momentum",
        "Keep your hands behind your ears, don't pull your neck",
        "Focus on engaging your abs throughout"
      ],
      'lunges': [
        "Keep your balance and control the descent",
        "Aim for 90 degree angles in both knees",
        "Drive through your front heel to return"
      ],
      'wall sits': [
        "Keep your back flat against the wall",
        "Thighs should be parallel to the ground",
        "Breathe steadily and don't hold your breath"
      ],
      'plank': [
        "Maintain a straight line from head to heels",
        "Don't let your hips sag or pike up",
        "Engage your entire core and breathe normally"
      ],
      'mountain climbers': [
        "Keep your hips down and core engaged",
        "Drive those knees quickly to your chest",
        "Maintain plank position throughout"
      ],
      'high knees': [
        "Drive your knees up to waist level",
        "Stay on the balls of your feet",
        "Keep your core engaged and arms pumping"
      ],
      'crunches': [
        "Focus on your abs, not your neck",
        "Control the movement - no momentum",
        "Keep that core tight throughout"
      ]
    };
    
    const reminders = formReminders[exerciseType] || ["Focus on maintaining proper form"];
    return reminders[Math.floor(Math.random() * reminders.length)];
  }
}