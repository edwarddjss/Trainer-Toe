import { Config } from '../config';
import { Logger } from '../utils/logger';

export class VoiceService {
  private readonly apiKey: string;
  private readonly voiceId: string;
  
  constructor() {
    this.apiKey = Config.elevenlabsApiKey;
    this.voiceId = Config.elevenlabsVoiceId;
  }
  
  async generateSpeech(text: string): Promise<Buffer> {
    if (!text?.trim()) {
      throw new Error('Empty text provided to TTS');
    }
    
    const cleanText = this.sanitizeInput(text);
    
    return this.retryWithBackoff(async () => {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.8,
            style: 0.8,
            use_speaker_boost: true
          }
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`ElevenLabs API failed: ${response.status} ${response.statusText} - ${errorText}`);
        
        // Mark retriable errors
        if (response.status >= 500 || response.status === 429 || response.status === 408) {
          (error as any).retriable = true;
        }
        
        throw error;
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);
      
      if (audioBuffer.length === 0) {
        const error = new Error('ElevenLabs returned empty audio buffer');
        (error as any).retriable = true; // This could be a temporary issue
        throw error;
      }
      
      return audioBuffer;
    }, `generateSpeech("${cleanText.substring(0, 50)}...")`);
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries: number = 3,
    baseDelayMs: number = 1000
  ): Promise<T> {
    let lastError: Error = new Error('Unknown error');
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        const result = await operation();
        
        if (attempt > 1) {
          Logger.debug('Voice', `${operationName} succeeded on attempt ${attempt}`);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on the last attempt or for non-retriable errors
        if (attempt > maxRetries || !(error as any).retriable) {
          break;
        }
        
        const delayMs = baseDelayMs * Math.pow(2, attempt - 1); // Exponential backoff
        const jitterMs = Math.random() * 1000; // Add jitter to prevent thundering herd
        const totalDelay = delayMs + jitterMs;
        
        Logger.debug('Voice', `${operationName} failed (attempt ${attempt}/${maxRetries + 1}), retrying in ${Math.round(totalDelay)}ms`);
        
        await new Promise(resolve => setTimeout(resolve, totalDelay));
      }
    }
    
    Logger.error('Voice', `${operationName} failed after ${maxRetries + 1} attempts:`, lastError.message);
    throw lastError;
  }

  private sanitizeInput(text: string): string {
    // Remove potentially harmful characters and limit length
    const cleaned = text
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML/XML tags
      .replace(/[{}]/g, '') // Remove potential template injection
      .replace(/\0/g, '') // Remove null bytes
      .substring(0, 500); // Limit to 500 chars for TTS
    
    // Ensure we have safe content
    if (cleaned.length === 0) {
      throw new Error('Text contains no valid characters for TTS');
    }
    
    return cleaned;
  }
}