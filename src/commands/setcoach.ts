import { SlashCommandBuilder, CommandInteraction, GuildMember, ChatInputCommandInteraction } from 'discord.js';
import { DatabaseService } from '../services/database';
import { CoachPersonality } from '../types/coach';
import { Logger } from '../utils/logger';

export const setCoachCommand = {
  data: new SlashCommandBuilder()
    .setName('setcoach')
    .setDescription('Choose your coach personality!')
    .addStringOption(option =>
      option.setName('personality')
        .setDescription('Select your preferred coach style')
        .setRequired(true)
        .addChoices(
          { name: '🤗 Encouraging - Positive and supportive', value: CoachPersonality.ENCOURAGING },
          { name: '💪 Drill Sergeant - Tough and demanding', value: CoachPersonality.DRILL_SERGEANT },
          { name: '🧘 Motivational - Inspiring and philosophical', value: CoachPersonality.MOTIVATIONAL },
          { name: '😎 Chill - Relaxed and laid-back', value: CoachPersonality.CHILL },
          { name: '🎮 Competitive - Gaming-inspired achievements', value: CoachPersonality.COMPETITIVE }
        )
    ),
    
  async execute(interaction: ChatInputCommandInteraction, databaseService: DatabaseService) {
    const member = interaction.member as GuildMember;
    const personality = interaction.options.getString('personality', true);
    
    try {
      await databaseService.setUserCoachPreference(member.guild.id, member.id, personality);
      
      const responses: Record<string, string> = {
        [CoachPersonality.ENCOURAGING]: "Great choice! I'll be your supportive cheerleader from now on! 🤗",
        [CoachPersonality.DRILL_SERGEANT]: "EXCELLENT CHOICE, SOLDIER! PREPARE FOR REAL TRAINING! 💪",
        [CoachPersonality.MOTIVATIONAL]: "A wise decision. Together, we'll unlock your true potential! 🧘",
        [CoachPersonality.CHILL]: "Cool choice, friend. We'll keep things nice and relaxed! 😎",
        [CoachPersonality.COMPETITIVE]: "Player selected! Ready to grind for those fitness achievements! 🎮"
      };
      
      await interaction.reply({ 
        content: responses[personality] || "Coach personality updated!",
        ephemeral: true 
      });
      
    } catch (error) {
      Logger.error('SetCoach', 'Error updating preference:', error);
      await interaction.reply({ 
        content: 'Sorry, I couldn\'t update your coach preference. Try again later!',
        ephemeral: true 
      });
    }
  }
};