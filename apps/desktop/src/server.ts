import http from 'node:http';
import { listDeviceProfiles } from '@pocketsim/device-profiles';
import { LocalBridgeServer } from '@pocketsim/local-bridge';
import { renderDesktopHtml } from './html-template.js';

export interface DesktopServerOptions {
  port?: number;
  bridgePort?: number;
}

export class DesktopServer {
  private server: http.Server | null = null;
  private bridgeServer: LocalBridgeServer | null = null;
  private port: number;
  private bridgePort: number;

  constructor(options: DesktopServerOptions = {}) {
    this.port = options.port || 7869;
    this.bridgePort = options.bridgePort || 7868;
  }

  public async start(): Promise<void> {
    try {
      this.bridgeServer = new LocalBridgeServer('127.0.0.1', this.bridgePort);
      await this.bridgeServer.start();
      this.bridgeServer.createSession({ deviceProfileId: 'iphone-15-pro' });
    } catch {
      // Bridge might already be running
    }

    return new Promise((resolve, reject) => {
      const devices = listDeviceProfiles().map(d => ({
        id: d.id,
        name: d.name,
        platform: d.platform,
        width: d.width,
        height: d.height
      }));

      const html = renderDesktopHtml({
        bridgePort: this.bridgePort,
        devices
      });

      this.server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
      });

      this.server.listen(this.port, '127.0.0.1', () => {
        resolve();
      });

      this.server.on('error', reject);
    });
  }

  public async stop(): Promise<void> {
    if (this.bridgeServer) {
      await this.bridgeServer.stop();
      this.bridgeServer = null;
    }

    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.server = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  public getUrl(): string {
    return `http://127.0.0.1:${this.port}`;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const desktop = new DesktopServer();
  desktop.start().then(() => {
    console.log(`PocketSim Desktop UI running at ${desktop.getUrl()}`);
  });
}
