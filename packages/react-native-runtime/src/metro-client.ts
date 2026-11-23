export interface MetroStatus {
  isRunning: boolean;
  version?: string;
  url: string;
  error?: string;
}

export class MetroClient {
  private baseUrl: string;

  constructor(host: string = '127.0.0.1', port: number = 8081) {
    this.baseUrl = `http://${host}:${port}`;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public async checkHealth(): Promise<MetroStatus> {
    try {
      const res = await fetch(`${this.baseUrl}/status`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const text = await res.text();
        return { isRunning: true, url: this.baseUrl, version: text };
      }
      return { isRunning: false, url: this.baseUrl, error: `HTTP ${res.status}` };
    } catch (err: any) {
      return { isRunning: false, url: this.baseUrl, error: err?.message || 'Connection refused' };
    }
  }

  public async fetchBundle(
    entryPoint: string = 'index',
    platform: 'ios' | 'android' = 'ios',
    dev: boolean = true
  ): Promise<string> {
    const url = `${this.baseUrl}/${entryPoint}.bundle?platform=${platform}&dev=${dev}&minify=false`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch Metro bundle from ${url}: HTTP ${res.status}`);
    }
    return await res.text();
  }
}
