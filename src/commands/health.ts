import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { DatabaseService } from '../services/database';
import { OptimizedVoiceService } from '../services/optimized-voice';

export const healthCommand = {
  data: new SlashCommandBuilder()
    .setName('health')
    .setDescription('Check bot health and status'),
    
  async execute(interaction: CommandInteraction, voiceService: OptimizedVoiceService, db: DatabaseService) {
    await interaction.deferReply({ ephemeral: true });
    
    const checks = [];
    let allHealthy = true;
    
    // Database check
    try {
      await db.get('SELECT 1');
      checks.push('✅ Database: Connected');
    } catch (error) {
      checks.push('❌ Database: Failed');
      allHealthy = false;
    }
    
    // TTS API check (basic validation only - no actual call)
    try {
      const stats = voiceService.getCostStats();
      if (stats.totalRequests > 0) {
        checks.push('✅ ElevenLabs API: Operational');
      } else {
        checks.push('⚠️ ElevenLabs API: Not yet used');
      }
    } catch (error) {
      checks.push('❌ ElevenLabs API: Service unavailable');
      allHealthy = false;
    }
    
    // Cache stats
    const cacheStats = voiceService.getCostStats();
    const memUsage = process.memoryUsage();
    
    const embed = {
      color: allHealthy ? 0x00ff00 : 0xff0000,
      title: allHealthy ? '🟢 Bot Health: Operational' : '🔴 Bot Health: Issues Detected',
      fields: [
        {
          name: '🔍 System Checks',
          value: checks.join('\n'),
          inline: false
        },
        {
          name: '📊 Cache Performance',
          value: `Hit Rate: ${cacheStats.cacheHitRate}\nTotal Requests: ${cacheStats.totalRequests}`,
          inline: true
        },
        {
          name: '💾 Memory Usage',
          value: `Used: ${Math.round(memUsage.heapUsed / 1024 / 1024)} MB\nTotal: ${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
          inline: true
        }
      ],
      timestamp: new Date().toISOString()
    };
    
    await interaction.editReply({ embeds: [embed] });
  }
};