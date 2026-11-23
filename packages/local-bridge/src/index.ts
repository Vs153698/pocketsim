import http from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import {
  BridgeSession,
  DeviceProfile,
  ScreenSnapshot,
  LogEntry
} from '@pocketsim/shared-types';
import { getDeviceProfile } from '@pocketsim/device-profiles';
import { SensorEngine } from '@pocketsim/sensor-engine';
import { PermissionEngine } from '@pocketsim/permission-engine';
import { ReactNativeRuntimeEngine } from '@pocketsim/react-native-runtime';
import { DeviceShellManager } from '@pocketsim/device-shell';
import { Compositor } from '@pocketsim/rendering-engine';

export interface ActiveSessionWrapper {
  session: BridgeSession;
  runtime: ReactNativeRuntimeEngine;
  shell: DeviceShellManager;
  compositor: Compositor;
  lease?: {
    agentId: string;
    leaseId: string;
    expiresAt: number;
  };
  eventTimeline: Array<{ type: string; summary: string; timestamp: number }>;
}

export class LocalBridgeServer {
  private server: http.Server | null = null;
  private wss: WebSocketServer | null = null;
  private sessions: Map<string, ActiveSessionWrapper> = new Map();
  private port: number;
  private host: string;
  private startTime: number = Date.now();

  constructor(host: string = '127.0.0.1', port: number = 7868) {
    this.host = host;
    this.port = port;
  }

  public getPort(): number {
    return this.port;
  }

  public getHost(): string {
    return this.host;
  }

  public createSession(options: {
    projectId?: string;
    projectPath?: string;
    deviceProfileId?: string;
    metroUrl?: string;
  }): ActiveSessionWrapper {
    const id = `session-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const profile = getDeviceProfile(options.deviceProfileId || 'iphone-15-pro');
    const sensorEngine = new SensorEngine();
    const permissionEngine = new PermissionEngine();

    const runtime = new ReactNativeRuntimeEngine({
      profile,
      sensorEngine,
      permissionEngine
    });

    const shell = new DeviceShellManager(profile);
    const compositor = new Compositor();

    const session: BridgeSession = {
      id,
      projectId: options.projectId || 'default-project',
      projectPath: options.projectPath || process.cwd(),
      deviceProfile: profile,
      metroUrl: options.metroUrl || 'http://127.0.0.1:8081',
      status: 'running',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const wrapper: ActiveSessionWrapper = {
      session,
      runtime,
      shell,
      compositor,
      eventTimeline: []
    };

    // Forward events to timeline and WebSocket
    runtime.coordinator.bus.subscribe('*', (msg) => {
      if (msg.type === 'INPUT_EVENT' || msg.type === 'RELOAD_REQUEST' || msg.type === 'DEVICE_PROFILE_CHANGE') {
        wrapper.eventTimeline.push({
          type: msg.type,
          summary: `Event ${msg.type} from ${msg.source}`,
          timestamp: Date.now()
        });
        if (wrapper.eventTimeline.length > 100) wrapper.eventTimeline.shift();
      }

      this.broadcastWebSocket({
        sessionId: id,
        event: msg.type,
        data: msg.payload
      });
    });

    this.sessions.set(id, wrapper);
    return wrapper;
  }

  public getSession(id: string): ActiveSessionWrapper | undefined {
    return this.sessions.get(id);
  }

  public listSessions(): BridgeSession[] {
    return Array.from(this.sessions.values()).map(w => w.session);
  }

  public closeSession(id: string): boolean {
    const s = this.sessions.get(id);
    if (s) {
      s.shell.destroy();
      this.sessions.delete(id);
      return true;
    }
    return false;
  }

  public claimSessionLease(sessionId: string, agentId: string, ttlMs: number = 60000): { success: boolean; leaseId?: string; error?: string } {
    const wrapper = this.sessions.get(sessionId);
    if (!wrapper) return { success: false, error: 'Session not found' };

    const now = Date.now();
    if (wrapper.lease && wrapper.lease.expiresAt > now && wrapper.lease.agentId !== agentId) {
      return { success: false, error: `Session is locked by agent "${wrapper.lease.agentId}" until ${new Date(wrapper.lease.expiresAt).toISOString()}` };
    }

    const leaseId = `lease-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    wrapper.lease = {
      agentId,
      leaseId,
      expiresAt: now + ttlMs
    };
    wrapper.session.activeLease = wrapper.lease;

    return { success: true, leaseId };
  }

  public releaseSessionLease(sessionId: string, leaseId: string): boolean {
    const wrapper = this.sessions.get(sessionId);
    if (!wrapper || !wrapper.lease) return false;
    if (wrapper.lease.leaseId === leaseId) {
      wrapper.lease = undefined;
      wrapper.session.activeLease = undefined;
      return true;
    }
    return false;
  }

  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleHttpRequest(req, res);
      });

      this.wss = new WebSocketServer({ server: this.server });
      this.wss.on('connection', (ws: WebSocket) => {
        ws.send(JSON.stringify({ type: 'WELCOME', message: 'Connected to PocketSim Local Bridge' }));
      });

      this.server.listen(this.port, this.host, () => {
        resolve();
      });

      this.server.on('error', (err) => {
        reject(err);
      });
    });
  }

  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      for (const wrapper of this.sessions.values()) {
        wrapper.shell.destroy();
      }
      this.sessions.clear();

      if (this.wss) {
        this.wss.close();
        this.wss = null;
      }
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

  private broadcastWebSocket(payload: any): void {
    if (!this.wss) return;
    const msg = JSON.stringify(payload);
    for (const client of this.wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    }
  }

  private async parseJsonBody(req: http.IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        if (!body) return resolve({});
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error('Invalid JSON'));
        }
      });
      req.on('error', reject);
    });
  }

  private sendJson(res: http.ServerResponse, statusCode: number, data: any): void {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Agent-ID, X-Lease-ID'
    });
    res.end(JSON.stringify(data, null, 2));
  }

  private async handleHttpRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const url = new URL(req.url || '/', `http://${this.host}:${this.port}`);
    const pathname = url.pathname;
    const method = req.method?.toUpperCase() || 'GET';

    if (method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Agent-ID, X-Lease-ID'
      });
      res.end();
      return;
    }

    try {
      // 1. Health
      if (pathname === '/health' && method === 'GET') {
        this.sendJson(res, 200, {
          status: 'ok',
          uptime: Math.floor((Date.now() - this.startTime) / 1000),
          version: '0.1.0',
          activeSessions: this.sessions.size
        });
        return;
      }

      // 2. List sessions / Create session
      if (pathname === '/sessions') {
        if (method === 'GET') {
          this.sendJson(res, 200, { sessions: this.listSessions() });
          return;
        }
        if (method === 'POST') {
          const body = await this.parseJsonBody(req);
          const wrapper = this.createSession(body);
          this.sendJson(res, 201, { session: wrapper.session });
          return;
        }
      }

      // Match /sessions/:id/...
      const sessionMatch = pathname.match(/^\/sessions\/([^/]+)(?:\/(.*))?$/);
      if (sessionMatch) {
        const sessionId = sessionMatch[1];
        const subPath = sessionMatch[2] || '';
        const wrapper = this.sessions.get(sessionId);

        if (!wrapper) {
          this.sendJson(res, 404, { error: `Session "${sessionId}" not found` });
          return;
        }

        // GET /sessions/:id
        if (!subPath && method === 'GET') {
          this.sendJson(res, 200, { session: wrapper.session, lease: wrapper.lease });
          return;
        }

        // POST /sessions/:id/claim
        if (subPath === 'claim' && method === 'POST') {
          const body = await this.parseJsonBody(req);
          const agentId = body.agentId || 'anonymous-agent';
          const ttlMs = body.ttlMs || 60000;
          const result = this.claimSessionLease(sessionId, agentId, ttlMs);
          this.sendJson(res, result.success ? 200 : 409, result);
          return;
        }

        // POST /sessions/:id/release
        if (subPath === 'release' && method === 'POST') {
          const body = await this.parseJsonBody(req);
          const released = this.releaseSessionLease(sessionId, body.leaseId);
          this.sendJson(res, released ? 200 : 400, { success: released });
          return;
        }

        // GET /sessions/:id/describe
        if (subPath === 'describe' && method === 'GET') {
          const snapshot = wrapper.runtime.getAccessibilitySnapshot();
          this.sendJson(res, 200, {
            screenName: snapshot.screenName,
            metrics: snapshot.metrics,
            interactiveElementsCount: snapshot.elements.filter(e => e.isActionable).length,
            elements: snapshot.elements,
            activeKeyboard: wrapper.shell.getState().keyboard.isOpen,
            statusBar: wrapper.shell.getState().statusBar
          });
          return;
        }

        // GET /sessions/:id/tree
        if (subPath === 'tree' && method === 'GET') {
          const snapshot = wrapper.runtime.getAccessibilitySnapshot();
          this.sendJson(res, 200, snapshot);
          return;
        }

        // POST /sessions/:id/tap
        if (subPath === 'tap' && method === 'POST') {
          const body = await this.parseJsonBody(req);
          const result = wrapper.runtime.tapElement(body);
          wrapper.eventTimeline.push({
            type: 'TAP',
            summary: `Tapped ${body.testID || body.text || 'coordinates'} (success=${result.success})`,
            timestamp: Date.now()
          });
          this.sendJson(res, result.success ? 200 : 400, result);
          return;
        }

        // POST /sessions/:id/type
        if (subPath === 'type' && method === 'POST') {
          const body = await this.parseJsonBody(req);
          const success = wrapper.runtime.typeText(body, body.text, body.clear);
          wrapper.eventTimeline.push({
            type: 'TYPE',
            summary: `Typed text into ${body.testID || body.text} (success=${success})`,
            timestamp: Date.now()
          });
          this.sendJson(res, success ? 200 : 400, { success });
          return;
        }

        // GET / POST /sessions/:id/sensors
        if (subPath === 'sensors') {
          if (method === 'GET') {
            this.sendJson(res, 200, wrapper.runtime.coordinator.sensorEngine.getState());
            return;
          }
          if (method === 'POST') {
            const body = await this.parseJsonBody(req);
            if (body.location) wrapper.runtime.coordinator.sensorEngine.setLocation(body.location);
            if (body.battery) wrapper.runtime.coordinator.sensorEngine.setBattery(body.battery);
            if (body.networkPreset) wrapper.runtime.coordinator.sensorEngine.applyNetworkPreset(body.networkPreset);
            wrapper.shell.syncSensorState(wrapper.runtime.coordinator.sensorEngine.getState());
            this.sendJson(res, 200, { success: true, state: wrapper.runtime.coordinator.sensorEngine.getState() });
            return;
          }
        }

        // GET / POST /sessions/:id/permissions
        if (subPath === 'permissions') {
          if (method === 'GET') {
            this.sendJson(res, 200, wrapper.runtime.coordinator.permissionEngine.getAll());
            return;
          }
          if (method === 'POST') {
            const body = await this.parseJsonBody(req);
            if (body.type && body.status) {
              wrapper.runtime.coordinator.permissionEngine.setPermission(body.type, body.status);
            }
            this.sendJson(res, 200, { success: true, permissions: wrapper.runtime.coordinator.permissionEngine.getAll() });
            return;
          }
        }

        // GET /sessions/:id/logs
        if (subPath === 'logs' && method === 'GET') {
          this.sendJson(res, 200, { logs: wrapper.runtime.coordinator.getLogs() });
          return;
        }

        // GET /sessions/:id/what-happened
        if (subPath === 'what-happened' && method === 'GET') {
          this.sendJson(res, 200, { events: wrapper.eventTimeline });
          return;
        }

        // POST /sessions/:id/reload
        if (subPath === 'reload' && method === 'POST') {
          wrapper.runtime.coordinator.requestReload();
          this.sendJson(res, 200, { success: true, message: 'Reload dispatched' });
          return;
        }
      }

      this.sendJson(res, 404, { error: `Not found: ${method} ${pathname}` });
    } catch (err: any) {
      this.sendJson(res, 500, { error: err?.message || 'Internal Server Error' });
    }
  }
}
