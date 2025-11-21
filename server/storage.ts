// Storage interface for Instagram video downloader
// Using in-memory storage as requested

export interface IStorage {
  storeDownloadToken(token: string, url: string): void;
  getDownloadUrl(token: string): string | undefined;
  deleteDownloadToken(token: string): void;
}

export class MemStorage implements IStorage {
  private downloadTokens: Map<string, { url: string; createdAt: number }>;

  constructor() {
    this.downloadTokens = new Map();
    
    setInterval(() => {
      const now = Date.now();
      const maxAge = 30 * 60 * 1000;
      
      for (const [token, data] of this.downloadTokens.entries()) {
        if (now - data.createdAt > maxAge) {
          this.downloadTokens.delete(token);
        }
      }
    }, 5 * 60 * 1000);
  }

  storeDownloadToken(token: string, url: string): void {
    this.downloadTokens.set(token, { url, createdAt: Date.now() });
  }

  getDownloadUrl(token: string): string | undefined {
    return this.downloadTokens.get(token)?.url;
  }

  deleteDownloadToken(token: string): void {
    this.downloadTokens.delete(token);
  }
}

export const storage = new MemStorage();
