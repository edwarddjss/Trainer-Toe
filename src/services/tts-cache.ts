import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as zlib from 'zlib';
import { promisify } from 'util';
import { Logger } from '../utils/logger';

export class TTSCache {
  private cacheDir: string;
  private memoryCache: Map<string, Buffer> = new Map();
  private maxMemoryItems: number = 100; // Keep 100 most used items in memory
  private compress = promisify(zlib.gzip);
  private decompress = promisify(zlib.gunzip);
  
  constructor() {
    this.cacheDir = path.join(process.cwd(), 'tts_cache');
    this.ensureCacheDirectory();
  }
  
  private ensureCacheDirectory(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }
  
  private getTextHash(text: string): string {
    return crypto.createHash('md5').update(text.toLowerCase().trim()).digest('hex');
  }
  
  private getCacheFilePath(hash: string): string {
    return path.join(this.cacheDir, `${hash}.mp3.gz`);
  }
  
  async get(text: string): Promise<Buffer | null> {
    const hash = this.getTextHash(text);
    
    // Check memory cache first (fastest)
    if (this.memoryCache.has(hash)) {
      Logger.debug('Cache', `Memory hit: "${text}"`);
      return this.memoryCache.get(hash)!;
    }
    
    // Check disk cache
    const filePath = this.getCacheFilePath(hash);
    if (fs.existsSync(filePath)) {
      try {
        const compressedData = fs.readFileSync(filePath);
        const audioBuffer = await this.decompress(compressedData) as Buffer;
        
        // Add to memory cache for next time
        this.addToMemoryCache(hash, audioBuffer);
        
        Logger.debug('Cache', `Disk hit: "${text}"`);
        return audioBuffer;
      } catch (error) {
        Logger.error('Cache', 'Error reading cached file:', error);
        // Remove corrupted cache file
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkError) {
          Logger.error('Cache', 'Error removing corrupted file:', unlinkError);
        }
      }
    }
    
    Logger.debug('Cache', `Cache miss: "${text}"`);
    return null;
  }
  
  async set(text: string, audioBuffer: Buffer): Promise<void> {
    const hash = this.getTextHash(text);
    const filePath = this.getCacheFilePath(hash);
    
    try {
      // Compress and save to disk
      const compressedData = await this.compress(audioBuffer);
      fs.writeFileSync(filePath, compressedData);
      
      // Add to memory cache (uncompressed for fast access)
      this.addToMemoryCache(hash, audioBuffer);
      
      const compressionRatio = ((1 - compressedData.length / audioBuffer.length) * 100).toFixed(1);
      Logger.debug('Cache', `Cached: "${text}" (${compressionRatio}% compression)`);
    } catch (error) {
      Logger.error('Cache', 'Error saving to cache:', error);
    }
  }
  
  private addToMemoryCache(hash: string, audioBuffer: Buffer): void {
    // Remove oldest items if memory cache is full
    if (this.memoryCache.size >= this.maxMemoryItems) {
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) {
        this.memoryCache.delete(firstKey);
      }
    }
    
    this.memoryCache.set(hash, audioBuffer);
  }
  
  // Pre-warm cache with common phrases
  async preWarmCache(phrases: string[], generateFunction: (text: string) => Promise<Buffer>): Promise<void> {
    Logger.info('Cache', `Pre-warming with ${phrases.length} phrases...`);
    
    for (const phrase of phrases) {
      const cached = await this.get(phrase);
      if (!cached) {
        try {
          const audioBuffer = await generateFunction(phrase);
          await this.set(phrase, audioBuffer);
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          Logger.error('Cache', `Error pre-generating "${phrase}":`, error);
        }
      }
    }
    
    Logger.success('Cache pre-warming complete');
  }
  
  getCacheStats(): { memoryItems: number, diskItems: number, totalSize: number } {
    const diskItems = fs.readdirSync(this.cacheDir).filter(f => f.endsWith('.mp3.gz')).length;
    
    let totalSize = 0;
    try {
      const files = fs.readdirSync(this.cacheDir);
      for (const file of files) {
        if (file.endsWith('.mp3.gz')) {
          const stats = fs.statSync(path.join(this.cacheDir, file));
          totalSize += stats.size;
        }
      }
    } catch (error) {
      Logger.error('Cache', 'Error calculating cache size:', error);
    }
    
    return {
      memoryItems: this.memoryCache.size,
      diskItems,
      totalSize
    };
  }
  
  clearCache(): void {
    this.memoryCache.clear();
    
    try {
      const files = fs.readdirSync(this.cacheDir);
      for (const file of files) {
        if (file.endsWith('.mp3.gz')) {
          fs.unlinkSync(path.join(this.cacheDir, file));
        }
      }
      Logger.info('Cache', 'Cache cleared');
    } catch (error) {
      Logger.error('Cache', 'Error clearing cache:', error);
    }
  }
}