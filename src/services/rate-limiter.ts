import { Logger } from '../utils/logger';

export class RateLimiter {
  private userCooldowns: Map<string, number> = new Map();
  private readonly cooldownMs: number;
  
  constructor(cooldownMs: number = 30000) { // 30 second cooldown by default
    this.cooldownMs = cooldownMs;
  }
  
  isRateLimited(userId: string): boolean {
    const lastUse = this.userCooldowns.get(userId);
    if (!lastUse) return false;
    
    const timeSinceLastUse = Date.now() - lastUse;
    return timeSinceLastUse < this.cooldownMs;
  }
  
  getRemainingCooldown(userId: string): number {
    const lastUse = this.userCooldowns.get(userId);
    if (!lastUse) return 0;
    
    const timeSinceLastUse = Date.now() - lastUse;
    const remaining = this.cooldownMs - timeSinceLastUse;
    return Math.max(0, remaining);
  }
  
  recordUsage(userId: string): void {
    this.userCooldowns.set(userId, Date.now());
    
    // Clean up old entries periodically
    if (this.userCooldowns.size > 1000) {
      this.cleanupOldEntries();
    }
  }
  
  private cleanupOldEntries(): void {
    const cutoff = Date.now() - this.cooldownMs;
    
    for (const [userId, lastUse] of this.userCooldowns.entries()) {
      if (lastUse < cutoff) {
        this.userCooldowns.delete(userId);
      }
    }
    
    Logger.debug('RateLimiter', `Cleaned up old entries, ${this.userCooldowns.size} entries remaining`);
  }
  
  getCooldownStats(): { activeUsers: number; totalEntries: number } {
    const now = Date.now();
    let activeUsers = 0;
    
    for (const lastUse of this.userCooldowns.values()) {
      if (now - lastUse < this.cooldownMs) {
        activeUsers++;
      }
    }
    
    return {
      activeUsers,
      totalEntries: this.userCooldowns.size
    };
  }
}