import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { OptimizedVoiceService } from '../services/optimized-voice';
import { Logger } from '../utils/logger';

export const costStatsCommand = {
  data: new SlashCommandBuilder()
    .setName('coststats')
    .setDescription('View TTS cost optimization statistics'),
    
  async execute(interaction: CommandInteraction, voiceService: OptimizedVoiceService) {
    try {
      const stats = voiceService.getCostStats();
      
      const embed = {
        color: 0x00ff00,
        title: '💰 Cost Optimization Statistics',
        fields: [
          {
            name: '📊 Cache Performance',
            value: `**Hit Rate:** ${stats.cacheHitRate}\n**Cache Hits:** ${stats.cacheHits}\n**Total Requests:** ${stats.totalRequests}`,
            inline: true
          },
          {
            name: '💸 API Usage',
            value: `**API Calls:** ${stats.apiCalls}\n**Characters Generated:** ${stats.charactersGenerated}`,
            inline: true
          },
          {
            name: '💵 Cost Savings',
            value: `**Estimated Saved:** ${stats.estimatedCostSaved}`,
            inline: true
          }
        ],
        footer: {
          text: 'Cache optimization reduces ElevenLabs API costs by reusing common phrases'
        },
        timestamp: new Date().toISOString()
      };
      
      await interaction.reply({ embeds: [embed], ephemeral: true });
      
      // Also log detailed stats to console
      voiceService.logCostSavings();
      
    } catch (error) {
      Logger.error('CostStats', 'Error:', error);
      await interaction.reply({ 
        content: 'Error retrieving cost statistics. Check console for details.', 
        ephemeral: true 
      });
    }
  }
};