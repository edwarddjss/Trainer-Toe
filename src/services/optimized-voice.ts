import { VoiceService } from './voice';
import { TTSCache } from './tts-cache';
import { Logger } from '../utils/logger';
import { getAllCommonPhrases, isCommonPhrase, getCommonPhraseFor } from '../data/common-phrases';

export class OptimizedVoiceService {
  private baseVoiceService: VoiceService;
  private cache: TTSCache;
  private isPreWarmed: boolean = false;
  
  // Track API usage for cost monitoring
  private apiCallsThisSession: number = 0;
  private totalCharactersGenerated: number = 0;
  private cacheHitRate: number = 0;
  private totalRequests: number = 0;
  
  constructor() {
    this.baseVoiceService = new VoiceService();
    this.cache = new TTSCache();
  }
  
  async generateSpeech(text: string): Promise<Buffer> {
    this.totalRequests++;
    
    // Try cache first
    const cached = await this.cache.get(text);
    if (cached) {
      this.updateCacheHitRate(true);
      Logger.debug('Voice', `Cache hit: "${text}"`);
      return cached;
    }
    
    // Cache miss - need to call API
    this.updateCacheHitRate(false);
    this.apiCallsThisSession++;
    this.totalCharactersGenerated += text.length;
    
    Logger.debug('Voice', `API call ${this.apiCallsThisSession}: "${text}"`);
    
    try {
      const audioBuffer = await this.baseVoiceService.generateSpeech(text);
      
      // Cache the result for future use
      await this.cache.set(text, audioBuffer);
      
      return audioBuffer;
    } catch (error) {
      Logger.error('Voice', 'API call failed:', error);
      throw error;
    }
  }
  
  // Pre-warm cache with common phrases on bot startup
  async preWarmCache(): Promise<void> {
    if (this.isPreWarmed) {
      Logger.debug('Voice', 'Cache already pre-warmed');
      return;
    }
    
    Logger.info('Voice', 'Pre-warming cache to save API costs...');
    
    const commonPhrases = getAllCommonPhrases();
    let newPhrases = 0;
    
    for (const phrase of commonPhrases) {
      const cached = await this.cache.get(phrase);
      if (!cached) {
        try {
          Logger.debug('Voice', `Pre-generating: "${phrase}"`);
          const audioBuffer = await this.baseVoiceService.generateSpeech(phrase);
          await this.cache.set(phrase, audioBuffer);
          newPhrases++;
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          Logger.error('Voice', `Error pre-generating "${phrase}":`, error);
        }
      }
    }
    
    this.isPreWarmed = true;
    Logger.success(`Pre-warming complete! Generated ${newPhrases} new phrases`);
    this.logCostSavings();
  }
  
  // Optimized method for rep counting (uses cached numbers)
  async generateRepCount(repNumber: number): Promise<Buffer> {
    const commonPhrase = getCommonPhraseFor('number', repNumber);
    if (commonPhrase) {
      return this.generateSpeech(commonPhrase);
    } else {
      // For numbers > 50, fall back to regular generation
      return this.generateSpeech(repNumber.toString());
    }
  }
  
  // Optimized method for milestone motivation
  async generateMilestoneMotivation(): Promise<Buffer> {
    const commonPhrase = getCommonPhraseFor('milestone');
    return this.generateSpeech(commonPhrase || 'Keep it up!');
  }
  
  // Optimized method for completion phrases
  async generateCompletionPhrase(): Promise<Buffer> {
    const commonPhrase = getCommonPhraseFor('completion');
    return this.generateSpeech(commonPhrase || 'Great job!');
  }
  
  // Smart text optimization - break down complex text into cacheable parts
  async generateOptimizedSpeech(text: string): Promise<Buffer> {
    // Try to use common phrases when possible
    if (isCommonPhrase(text)) {
      return this.generateSpeech(text);
    }
    
    // For exercise announcements, try to use pattern matching
    const exerciseMatch = text.match(/Time for (\d+) (\w+)!/);
    if (exerciseMatch) {
      const [, count, exercise] = exerciseMatch;
      const commonCount = getCommonPhraseFor('number', parseInt(count));
      
      if (commonCount) {
        // Build from cached components if possible
        const exerciseAnnouncement = `Time for ${exercise}!`;
        if (isCommonPhrase(exerciseAnnouncement)) {
          // We could combine cached audio here, but for simplicity, 
          // we'll generate the full phrase and cache it
          return this.generateSpeech(text);
        }
      }
    }
    
    // Fall back to regular generation
    return this.generateSpeech(text);
  }
  
  private updateCacheHitRate(hit: boolean): void {
    if (this.totalRequests === 1) {
      this.cacheHitRate = hit ? 100 : 0;
    } else {
      const currentHits = Math.round((this.cacheHitRate / 100) * (this.totalRequests - 1));
      const newHits = currentHits + (hit ? 1 : 0);
      this.cacheHitRate = (newHits / this.totalRequests) * 100;
    }
  }
  
  // Get cost savings statistics
  getCostStats(): {
    apiCalls: number;
    cacheHits: number;
    cacheHitRate: string;
    charactersGenerated: number;
    estimatedCostSaved: string;
    totalRequests: number;
  } {
    const cacheHits = this.totalRequests - this.apiCallsThisSession;
    const estimatedCostPerChar = 0.000015; // Rough estimate for ElevenLabs
    const savedCharacters = cacheHits * 20; // Assume avg 20 chars per cached phrase
    const estimatedCostSaved = savedCharacters * estimatedCostPerChar;
    
    return {
      apiCalls: this.apiCallsThisSession,
      cacheHits,
      cacheHitRate: `${this.cacheHitRate.toFixed(1)}%`,
      charactersGenerated: this.totalCharactersGenerated,
      estimatedCostSaved: `$${estimatedCostSaved.toFixed(4)}`,
      totalRequests: this.totalRequests
    };
  }
  
  logCostSavings(): void {
    const stats = this.getCostStats();
    const cacheStats = this.cache.getCacheStats();
    
    Logger.info('Voice', '=== COST OPTIMIZATION STATS ===');
    Logger.info('Voice', `Cache Hit Rate: ${stats.cacheHitRate}`);
    Logger.info('Voice', `Cache Hits: ${stats.cacheHits} / ${stats.totalRequests} requests`);
    Logger.info('Voice', `API Calls This Session: ${stats.apiCalls}`);
    Logger.info('Voice', `Characters Generated: ${stats.charactersGenerated}`);
    Logger.info('Voice', `Estimated Cost Saved: ${stats.estimatedCostSaved}`);
    Logger.info('Voice', `Cached Items: ${cacheStats.memoryItems} in memory, ${cacheStats.diskItems} on disk`);
    Logger.info('Voice', `Cache Size: ${(cacheStats.totalSize / 1024 / 1024).toFixed(2)} MB`);
    Logger.info('Voice', '=====================================');
  }
  
  // Method to clear cache if needed
  clearCache(): void {
    this.cache.clearCache();
    this.isPreWarmed = false;
  }
}