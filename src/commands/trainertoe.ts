import { SlashCommandBuilder, CommandInteraction, GuildMember } from 'discord.js';
import { joinVoiceChannel } from '@discordjs/voice';
import { Logger } from '../utils/logger';
import { ExerciseService } from '../services/exercise';
import { OptimizedVoiceService } from '../services/optimized-voice';
import { DatabaseService } from '../services/database';
import { WorkoutScheduler } from '../services/workout-scheduler';
import { EnhancedWorkoutSession } from '../services/enhanced-workout-session';

export const trainerToeCommand = {
  data: new SlashCommandBuilder()
    .setName('trainertoe')
    .setDescription('Summon Trainer Toe to motivate you with exercises!'),
    
  async execute(interaction: CommandInteraction, exerciseService: ExerciseService, voiceService: OptimizedVoiceService, databaseService: DatabaseService, workoutScheduler: WorkoutScheduler) {
    const member = interaction.member as GuildMember;
    
    if (!member.voice.channel) {
      await interaction.reply({ content: 'You need to be in a voice channel first, soldier!', ephemeral: true });
      return;
    }
    
    // Check bot permissions in voice channel
    const permissions = member.voice.channel.permissionsFor(interaction.client.user!);
    if (!permissions?.has(['Connect', 'Speak'])) {
      await interaction.reply({ 
        content: '❌ I need **Connect** and **Speak** permissions in that voice channel!', 
        ephemeral: true 
      });
      return;
    }
    
    await interaction.reply({ content: 'Trainer Toe incoming...', ephemeral: true });
    
    try {
      const exercise = await exerciseService.getNextExercise(member.guild.id, member.id);
      
      const connection = joinVoiceChannel({
        channelId: member.voice.channel.id,
        guildId: member.guild.id,
        adapterCreator: member.guild.voiceAdapterCreator,
      });
      
      // Wait for connection to be ready
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Voice connection timeout'));
        }, 10000);
        
        connection.on('stateChange', (oldState, newState) => {
          if (newState.status === 'ready') {
            clearTimeout(timeout);
            resolve();
          }
        });
        
        if (connection.state.status === 'ready') {
          clearTimeout(timeout);
          resolve();
        }
      });
      
      const workoutSession = new EnhancedWorkoutSession(connection, voiceService, exerciseService, databaseService);
      await workoutSession.startGuidedWorkout(exercise, member.guild.id, member.id);
      await exerciseService.recordExercise(member.guild.id, member.id, exercise);
      
      // Check if user doesn't have a schedule yet, and if so, start one
      const existingSchedule = workoutScheduler.getUserSchedule(member.guild.id, member.id);
      if (!existingSchedule) {
        try {
          await workoutScheduler.scheduleUserWorkout(member, member.voice.channel.id, 60);
          
          // Send a follow-up message about automatic scheduling
          setTimeout(async () => {
            try {
              await interaction.followUp({
                content: `🎯 **Great workout!** I've automatically scheduled hourly workouts for you.\n\n` +
                        `⏰ **Next workout:** <t:${Math.floor((Date.now() + 60 * 60 * 1000) / 1000)}:R>\n` +
                        `📍 **Voice Channel:** ${member.voice.channel?.name}\n\n` +
                        `As long as you're in the voice channel, I'll join automatically!\n` +
                        `Use \`/schedule stop\` to cancel or \`/schedule status\` to check timing.`,
                ephemeral: true
              });
            } catch (e) {
              Logger.error('TrainerToe', 'Could not send follow-up about scheduling:', e);
            }
          }, 5000);
        } catch (error) {
          Logger.error('TrainerToe', 'Could not auto-schedule workout:', error);
        }
      }
      
    } catch (error) {
      Logger.error('TrainerToe', 'Workout error:', error);
      
      let userMessage = 'Trainer Toe encountered an issue. Stand by for the next drill!';
      
      // Provide more specific error messages for common issues
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage?.includes('Voice connection timeout')) {
        userMessage = 'Could not connect to voice channel. Please try again in a moment!';
      } else if (errorMessage?.includes('ElevenLabs API failed')) {
        userMessage = 'Voice service temporarily unavailable. Your workout was logged silently!';
      } else if (errorMessage?.includes('Voice connection was destroyed')) {
        userMessage = 'Lost connection to voice channel. Make sure you stay in the channel during workouts!';
      } else if (errorMessage?.includes('fetch')) {
        userMessage = 'Network connectivity issue. Please check your connection and try again!';
      }
      
      try {
        await interaction.followUp({ content: userMessage, ephemeral: true });
      } catch (followUpError) {
        Logger.error('TrainerToe', 'Could not send follow-up message:', followUpError);
      }
    }
  }
};