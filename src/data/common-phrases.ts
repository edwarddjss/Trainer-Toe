// Pre-generate all these common phrases to save on API costs
export const COMMON_PHRASES = {
  // Numbers (most frequently used)
  numbers: [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
    '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
    '31', '32', '33', '34', '35', '36', '37', '38', '39', '40',
    '41', '42', '43', '44', '45', '46', '47', '48', '49', '50'
  ],
  
  // Countdowns
  countdowns: [
    'Get ready!',
    'Starting in',
    'GO!',
    'Time!'
  ],
  
  // Time announcements
  timeAnnouncements: [
    '30 seconds remaining!',
    '20 seconds remaining!',
    '15 seconds remaining!',
    '10 seconds remaining!',
    '5 seconds remaining!'
  ],
  
  // Milestone motivation
  milestones: [
    'Quarter way there!',
    'Halfway done!',
    'Almost there!',
    'Final quarter!',
    'Last few reps!',
    'Final stretch!'
  ],
  
  // Exercise announcements (reusable patterns)
  exerciseAnnouncements: [
    'Time for pushups!',
    'Time for squats!',
    'Time for jumping jacks!',
    'Time for burpees!',
    'Time for situps!',
    'Time for lunges!',
    'Time for wall sits!',
    'Time for plank!',
    'Time for mountain climbers!'
  ],
  
  // Common completion phrases
  completions: [
    'Outstanding work!',
    'Excellent job!',
    'Perfect execution!',
    'Great work!',
    'Well done!',
    'Fantastic!'
  ],
  
  // Form reminders (short, reusable)
  formReminders: [
    'Keep your form!',
    'Breathe steadily!',
    'Stay focused!',
    'Good pace!',
    'Perfect form!'
  ],
  
  // Personality-specific phrases (most common)
  encouraging: [
    'You are doing great!',
    'Keep it up!',
    'Awesome work!',
    'You have got this!',
    'Stay strong!'
  ],
  
  drillSergeant: [
    'Move it!',
    'No quitting!',
    'Push harder!',
    'Come on!',
    'Dig deeper!'
  ],
  
  motivational: [
    'Every rep counts!',
    'You are getting stronger!',
    'Feel the power!',
    'Mind over matter!',
    'Rise above!'
  ],
  
  chill: [
    'Nice work!',
    'Keep flowing!',
    'You are in the zone!',
    'Stay relaxed!',
    'Good vibes!'
  ],
  
  competitive: [
    'Level up!',
    'Combo streak!',
    'New record!',
    'Achievement unlocked!',
    'Bonus points!'
  ]
};

// Get all phrases as a flat array for pre-generation
export function getAllCommonPhrases(): string[] {
  const allPhrases: string[] = [];
  
  for (const category of Object.values(COMMON_PHRASES)) {
    allPhrases.push(...category);
  }
  
  return allPhrases;
}

// Check if a phrase is common (and thus should be cached)
export function isCommonPhrase(text: string): boolean {
  const cleanText = text.trim().toLowerCase();
  
  for (const category of Object.values(COMMON_PHRASES)) {
    if (category.some(phrase => phrase.toLowerCase() === cleanText)) {
      return true;
    }
  }
  
  return false;
}

// Get common phrase variations for dynamic text
export function getCommonPhraseFor(type: 'number' | 'milestone' | 'completion' | 'form', value?: any): string | null {
  switch (type) {
    case 'number':
      if (typeof value === 'number' && value >= 1 && value <= 50) {
        return COMMON_PHRASES.numbers[value - 1];
      }
      break;
      
    case 'milestone':
      const milestones = COMMON_PHRASES.milestones;
      return milestones[Math.floor(Math.random() * milestones.length)];
      
    case 'completion':
      const completions = COMMON_PHRASES.completions;
      return completions[Math.floor(Math.random() * completions.length)];
      
    case 'form':
      const forms = COMMON_PHRASES.formReminders;
      return forms[Math.floor(Math.random() * forms.length)];
  }
  
  return null;
}