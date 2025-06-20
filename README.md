# Trainer Toe - Discord Fitness Bot

<div align="center">

<img src="assets/trainer-toe-discord-fitness-bot-preview.png" alt="Trainer Toe Discord Fitness Bot" width="200">

*Voice-guided workouts for Discord servers*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-5865F2?style=flat&logo=discord&logoColor=white)](https://discord.js.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

---

A Discord bot that provides voice-guided workouts in voice channels.

## Features

- Voice-guided workouts using text-to-speech
- Multiple coach personalities
- Automatic workout scheduling
- Progress tracking
- Exercise history

## Quick Setup

### Prerequisites
- Node.js 18+
- Discord Bot Token
- ElevenLabs API Key

### Installation
```bash
git clone https://github.com/your-username/trainertoe.git
cd trainertoe
npm install
```

### Configuration
```bash
cp .env.example .env
# Edit .env with your credentials
```

### Run
```bash
npm run build
npm start
```

## Commands

- `/trainertoe` - Start a workout session
- `/setcoach [personality]` - Set your coach personality
- `/schedule [start|stop|status]` - Manage workout schedules
- `/health` - Check bot health status
- `/coststats` - View TTS cost optimization stats

## Coach Personalities

- Encouraging
- Drill Sergeant
- Motivational
- Chill
- Competitive

## Deployment

Set environment variables and run:
```bash
npm run build
npm start
```

## TTS Caching

The bot caches common phrases to reduce API usage.

## Structure

- `src/commands/` - Discord commands
- `src/services/` - Core logic
- `src/types/` - TypeScript types

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use in your own projects!

## Troubleshooting

- Ensure bot has voice channel permissions
- Check ElevenLabs API key is valid
- Copy `.env.example` to `.env` and fill in values
- Run `/health` to test connection

---

