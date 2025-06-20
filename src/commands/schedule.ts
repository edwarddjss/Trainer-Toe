import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { WorkoutScheduler } from '../services/workout-scheduler';
import { Logger } from '../utils/logger';

export const scheduleCommand = {
  data: new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Manage your automatic workout schedule')
    .addSubcommand(subcommand =>
      subcommand
        .setName('start')
        .setDescription('Start automatic hourly workouts')
        .addIntegerOption(option =>
          option.setName('interval')
            .setDescription('How often to workout (in minutes)')
            .setRequired(false)
            .setMinValue(15)
            .setMaxValue(240)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('stop')
        .setDescription('Stop automatic workouts')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('status')
        .setDescription('Check your workout schedule')
    ),
    
  async execute(interaction: ChatInputCommandInteraction, workoutScheduler: WorkoutScheduler) {
    const member = interaction.member as GuildMember;
    const subcommand = interaction.options.getSubcommand();
    
    if (subcommand === 'start') {
      if (!member.voice.channel) {
        await interaction.reply({ 
          content: 'You need to be in a voice channel to start automatic workouts!', 
          ephemeral: true 
        });
        return;
      }
      
      const interval = interaction.options.getInteger('interval') || 60;
      
      try {
        await workoutScheduler.scheduleUserWorkout(member, member.voice.channel.id, interval);
        
        await interaction.reply({ 
          content: `🎯 **Automatic workouts activated!**\n\n` +
                  `⏰ **Interval:** Every ${interval} minutes\n` +
                  `📍 **Voice Channel:** ${member.voice.channel.name}\n` +
                  `🏋️ **Next Workout:** <t:${Math.floor((Date.now() + interval * 60 * 1000) / 1000)}:R>\n\n` +
                  `Trainer Toe will automatically join and guide you through workouts as long as you're in the voice channel!\n` +
                  `Use \`/schedule stop\` to cancel anytime.`,
          ephemeral: true 
        });
      } catch (error) {
        Logger.error('Schedule', 'Error starting schedule:', error);
        await interaction.reply({ 
          content: 'Sorry, I couldn\'t start your workout schedule. Please try again!', 
          ephemeral: true 
        });
      }
      
    } else if (subcommand === 'stop') {
      const existing = workoutScheduler.getUserSchedule(member.guild.id, member.id);
      
      if (!existing) {
        await interaction.reply({ 
          content: 'You don\'t have any scheduled workouts to cancel.', 
          ephemeral: true 
        });
        return;
      }
      
      workoutScheduler.cancelUserWorkout(member.guild.id, member.id);
      
      await interaction.reply({ 
        content: '✅ **Automatic workouts stopped!**\n\nYou can still use `/trainertoe` for manual workouts anytime.', 
        ephemeral: true 
      });
      
    } else if (subcommand === 'status') {
      const schedule = workoutScheduler.getUserSchedule(member.guild.id, member.id);
      
      if (!schedule) {
        await interaction.reply({ 
          content: '📅 **No scheduled workouts**\n\nUse `/schedule start` to begin automatic workouts!', 
          ephemeral: true 
        });
        return;
      }
      
      const channel = member.guild.channels.cache.get(schedule.channelId);
      const intervalMinutes = Math.round(schedule.intervalMs / 60000);
      
      await interaction.reply({ 
        content: `📅 **Your Workout Schedule**\n\n` +
                `⏰ **Interval:** Every ${intervalMinutes} minutes\n` +
                `📍 **Voice Channel:** ${channel?.name || 'Unknown'}\n` +
                `🏋️ **Next Workout:** <t:${Math.floor(schedule.nextWorkoutTime.getTime() / 1000)}:R>\n\n` +
                `💡 Make sure you're in the voice channel when it's time for your workout!\n` +
                `Use \`/schedule stop\` to cancel.`,
        ephemeral: true 
      });
    }
  }
};