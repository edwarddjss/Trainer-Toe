import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import { Config } from './config';
import { Logger } from './utils/logger';
import { RATE_LIMITING, TIMEOUTS } from './constants';
import { DatabaseService } from './services/database';
import { ExerciseService } from './services/exercise';
import { OptimizedVoiceService } from './services/optimized-voice';
import { WorkoutScheduler } from './services/workout-scheduler';
import { RateLimiter } from './services/rate-limiter';
import { trainerToeCommand } from './commands/trainertoe';
import { setCoachCommand } from './commands/setcoach';
import { scheduleCommand } from './commands/schedule';
import { costStatsCommand } from './commands/coststats';
import { healthCommand } from './commands/health';

// Validate environment before doing anything
Config.validateEnvironment();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const db = new DatabaseService();
const exerciseService = new ExerciseService(db);
const voiceService = new OptimizedVoiceService();
const rateLimiter = new RateLimiter(RATE_LIMITING.COOLDOWN_MS);
let workoutScheduler: WorkoutScheduler;

client.once('ready', async () => {
  Logger.success(`Trainer Toe is ready! Logged in as ${client.user?.tag}`);
  
  await db.initialize();
  
  // Initialize workout scheduler
  workoutScheduler = new WorkoutScheduler(client, exerciseService, voiceService, db);
  
  Logger.info('TTS', 'Starting cache pre-warming in background...');
  voiceService.preWarmCache().then(() => {
    Logger.success('TTS cache pre-warming complete!');
  }).catch(error => {
    Logger.warn('TTS', 'Cache pre-warming failed:', error);
  });
  
  const rest = new REST({ version: '10' }).setToken(Config.discordToken);
  
  try {
    await rest.put(
      Routes.applicationCommands(Config.discordClientId),
      { body: [
        trainerToeCommand.data.toJSON(),
        setCoachCommand.data.toJSON(),
        scheduleCommand.data.toJSON(),
        costStatsCommand.data.toJSON(),
        healthCommand.data.toJSON()
      ] }
    );
    
    Logger.success('Commands registered successfully.');
  } catch (error) {
    Logger.error('Bot', 'Error registering commands:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  
  if (interaction.commandName === 'trainertoe') {
    // Check rate limiting
    if (rateLimiter.isRateLimited(interaction.user.id)) {
      const remainingMs = rateLimiter.getRemainingCooldown(interaction.user.id);
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      await interaction.reply({ 
        content: `⏰ Slow down there, soldier! You can use /trainertoe again in ${remainingSeconds} seconds.`, 
        ephemeral: true 
      });
      return;
    }
    
    // Record usage for rate limiting
    rateLimiter.recordUsage(interaction.user.id);
    
    await trainerToeCommand.execute(interaction, exerciseService, voiceService, db, workoutScheduler);
  } else if (interaction.commandName === 'setcoach') {
    await setCoachCommand.execute(interaction, db);
  } else if (interaction.commandName === 'schedule') {
    await scheduleCommand.execute(interaction, workoutScheduler);
  } else if (interaction.commandName === 'coststats') {
    await costStatsCommand.execute(interaction, voiceService);
  } else if (interaction.commandName === 'health') {
    await healthCommand.execute(interaction, voiceService, db);
  }
});

// Global error handlers
process.on('unhandledRejection', (error) => {
  Logger.error('Global', 'Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
  Logger.error('Global', 'Uncaught exception:', error);
  setTimeout(() => process.exit(1), TIMEOUTS.PROCESS_EXIT_DELAY);
});

client.login(Config.discordToken);