import { CoachPersonality, CoachProfile } from '../types/coach';

export class CoachPersonalityService {
  private coaches: Map<CoachPersonality, CoachProfile> = new Map();
  
  constructor() {
    this.initializeCoaches();
  }
  
  private initializeCoaches() {
    // ENCOURAGING COACH - Positive and supportive
    this.coaches.set(CoachPersonality.ENCOURAGING, {
      personality: CoachPersonality.ENCOURAGING,
      voiceLines: {
        welcome: [
          "Hey there champion! Ready for an amazing workout?",
          "Great to see you! Let's make today count!",
          "Welcome back, superstar! Time to shine!"
        ],
        countdown: [
          "Take your time to get ready... Starting in",
          "Find your position, we're beginning in",
          "Get comfortable, we'll start in"
        ],
        repCount: [
          "Beautiful form!",
          "You're doing great!",
          "Keep it up!",
          "That's perfect!"
        ],
        motivation: [
          "You're absolutely crushing this!",
          "Look at you go! Amazing work!",
          "Every rep makes you stronger!",
          "I'm so proud of your effort!",
          "You're inspiring! Keep pushing!"
        ],
        completion: [
          "Incredible job! You should be so proud!",
          "You did it! What an amazing workout!",
          "Fantastic work today, champion!"
        ],
        nextSession: [
          "Take time to recover, you've earned it! I'll check in with you in an hour!",
          "Rest up superstar! Can't wait to see you again in 60 minutes!",
          "Great session! Hydrate and relax, see you in an hour!"
        ]
      },
      timingProfile: {
        baseMultiplier: 1.1,     // Slightly slower for beginners
        restBetweenReps: 800,    // More rest between reps
        motivationFrequency: 3   // Motivate every 3 reps
      }
    });
    
    // DRILL SERGEANT - Tough and demanding
    this.coaches.set(CoachPersonality.DRILL_SERGEANT, {
      personality: CoachPersonality.DRILL_SERGEANT,
      voiceLines: {
        welcome: [
          "SOLDIER! Time to see what you're made of!",
          "Drop everything! It's training time, recruit!",
          "No excuses today! Let's move!"
        ],
        countdown: [
          "GET IN POSITION! We start in",
          "MOVE IT! Beginning in",
          "READY POSITION, NOW! Starting in"
        ],
        repCount: [
          "ONE!",
          "TWO!",
          "THREE!",
          "MOVE!"
        ],
        motivation: [
          "PAIN IS WEAKNESS LEAVING THE BODY!",
          "YOU THINK THIS IS HARD? KEEP GOING!",
          "NO QUITTING ON MY WATCH!",
          "DIG DEEPER! FIND THAT STRENGTH!",
          "WARRIORS DON'T STOP! MOVE!"
        ],
        completion: [
          "OUTSTANDING SOLDIER! YOU'VE EARNED YOUR REST!",
          "THAT'S HOW WE BUILD WARRIORS! DISMISSED!",
          "EXCELLENT EXECUTION! YOU'VE MADE THE CORPS PROUD!"
        ],
        nextSession: [
          "Take your break, soldier! Report back in 60 minutes sharp!",
          "Rest and refuel! I expect you back here in one hour!",
          "Recovery time granted! Be ready for round two in 60 minutes!"
        ]
      },
      timingProfile: {
        baseMultiplier: 0.85,    // Faster pace
        restBetweenReps: 400,    // Less rest
        motivationFrequency: 5   // Less frequent motivation
      }
    });
    
    // MOTIVATIONAL - Inspiring and philosophical
    this.coaches.set(CoachPersonality.MOTIVATIONAL, {
      personality: CoachPersonality.MOTIVATIONAL,
      voiceLines: {
        welcome: [
          "Today is your day to become extraordinary!",
          "Every champion was once a beginner who refused to give up!",
          "Your future self is counting on you right now!"
        ],
        countdown: [
          "Center yourself... We begin our journey in",
          "Focus your mind... Starting in",
          "Breathe and prepare... We start in"
        ],
        repCount: [
          "Rise!",
          "Grow!",
          "Evolve!",
          "Transform!"
        ],
        motivation: [
          "You're not just building muscle, you're building character!",
          "Each rep is a step toward your greatest self!",
          "The pain you feel today is the strength you'll have tomorrow!",
          "Champions are made in moments like these!",
          "Your only limit is the one you set yourself!"
        ],
        completion: [
          "You've just proven that limits exist only in the mind!",
          "Today you chose growth over comfort. That's true strength!",
          "Remember this feeling - this is what victory tastes like!"
        ],
        nextSession: [
          "Reflect on your achievement. I'll return in an hour to help you grow even more!",
          "Let your body recover and your spirit soar. See you in 60 minutes!",
          "Rest is part of the journey. We'll continue your transformation in an hour!"
        ]
      },
      timingProfile: {
        baseMultiplier: 1.0,
        restBetweenReps: 600,
        motivationFrequency: 4
      }
    });
    
    // CHILL - Relaxed and laid-back
    this.coaches.set(CoachPersonality.CHILL, {
      personality: CoachPersonality.CHILL,
      voiceLines: {
        welcome: [
          "Hey friend, ready to move our bodies a bit?",
          "What's up? Let's get a nice workout in!",
          "Good vibes only! Let's do some exercise!"
        ],
        countdown: [
          "No rush, get comfortable... Starting in",
          "Find your flow... We'll begin in",
          "Take your time... Starting in"
        ],
        repCount: [
          "Nice...",
          "Smooth...",
          "There you go...",
          "Easy does it..."
        ],
        motivation: [
          "You're in the zone, just cruise along!",
          "Feeling good? Just keep that rhythm!",
          "No pressure, you're doing awesome!",
          "Listen to your body, you've got this!",
          "Just breathe and flow with it!"
        ],
        completion: [
          "Right on! That was a solid session!",
          "Nice work! Hope you're feeling good!",
          "Awesome job! That was super chill!"
        ],
        nextSession: [
          "Take it easy, I'll swing by again in about an hour!",
          "Peace out! Catch you in 60 minutes for another round!",
          "Rest up friend! See you in an hour or so!"
        ]
      },
      timingProfile: {
        baseMultiplier: 1.2,     // Slower, relaxed pace
        restBetweenReps: 1000,   // Longer rest
        motivationFrequency: 6   // Less frequent
      }
    });
    
    // COMPETITIVE - Gaming-inspired, achievement-focused
    this.coaches.set(CoachPersonality.COMPETITIVE, {
      personality: CoachPersonality.COMPETITIVE,
      voiceLines: {
        welcome: [
          "Player One, ready? Let's beat your high score!",
          "Time to level up your fitness stats!",
          "Achievement unlocked: Showing up! Now let's earn more!"
        ],
        countdown: [
          "Loading workout... Starting in",
          "Initializing exercise protocol in",
          "Game starts in"
        ],
        repCount: [
          "Plus one!",
          "Combo!",
          "Score!",
          "XP gained!"
        ],
        motivation: [
          "COMBO MULTIPLIER ACTIVE! Don't break the chain!",
          "You're on fire! Streak bonus incoming!",
          "Critical hit! Maximum damage to those calories!",
          "Boss level performance! Keep grinding!",
          "New personal best incoming! Push for the record!"
        ],
        completion: [
          "VICTORY! You've defeated today's workout boss!",
          "GG! Experience points earned, level up achieved!",
          "Mission complete! All objectives cleared!"
        ],
        nextSession: [
          "Save your progress! Next raid begins in 60 minutes!",
          "Recovery phase initiated. Respawn timer: 1 hour!",
          "Great run! Daily quest refreshes in 60 minutes!"
        ]
      },
      timingProfile: {
        baseMultiplier: 0.9,     // Competitive pace
        restBetweenReps: 500,
        motivationFrequency: 5
      }
    });
  }
  
  getCoach(personality: CoachPersonality): CoachProfile {
    return this.coaches.get(personality) || this.coaches.get(CoachPersonality.ENCOURAGING)!;
  }
  
  getRandomVoiceLine(coach: CoachProfile, category: keyof CoachProfile['voiceLines']): string {
    const lines = coach.voiceLines[category];
    return lines[Math.floor(Math.random() * lines.length)];
  }
  
  getAllPersonalities(): CoachPersonality[] {
    return Array.from(this.coaches.keys());
  }
}