import * as dotenv from 'dotenv';
import { Logger } from './utils/logger';

dotenv.config();

export class Config {
  static validateEnvironment(): void {
    const required = [
      'DISCORD_TOKEN',
      'DISCORD_CLIENT_ID', 
      'ELEVENLABS_API_KEY',
      'ELEVENLABS_VOICE_ID'
    ];

    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      Logger.error('Config', 'Missing required environment variables:', missing.join(', '));
      Logger.error('Config', 'Please create a .env file with all required values');
      Logger.error('Config', 'Check README.md for setup instructions');
      process.exit(1);
    }

    Logger.success('Environment configuration validated');
  }

  static get discordToken(): string {
    return process.env.DISCORD_TOKEN!;
  }

  static get discordClientId(): string {
    return process.env.DISCORD_CLIENT_ID!;
  }

  static get elevenlabsApiKey(): string {
    return process.env.ELEVENLABS_API_KEY!;
  }

  static get elevenlabsVoiceId(): string {
    return process.env.ELEVENLABS_VOICE_ID!;
  }
}