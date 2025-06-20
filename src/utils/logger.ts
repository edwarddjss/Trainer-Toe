export class Logger {
  private static isDevelopment = process.env.NODE_ENV !== 'production';
  
  static info(service: string, message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`[${service}] ${message}`, ...args);
    }
  }
  
  static error(service: string, message: string, error?: any): void {
    console.error(`[${service}] ${message}`, error || '');
  }
  
  static debug(service: string, message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`[DEBUG:${service}] ${message}`, ...args);
    }
  }
  
  static success(message: string): void {
    console.log(`✅ ${message}`);
  }
  
  static warn(service: string, message: string, ...args: any[]): void {
    console.warn(`⚠️ [${service}] ${message}`, ...args);
  }
}