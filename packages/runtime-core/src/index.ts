import {
  DeviceProfile,
  RenderTree,
  ScreenSnapshot,
  LogEntry,
  SensorState
} from '@pocketsim/shared-types';
import { SensorEngine } from '@pocketsim/sensor-engine';
import { PermissionEngine } from '@pocketsim/permission-engine';

export type ContextType = 'host' | 'tenant' | 'shell' | 'compositor';

export type MessageType =
  | 'INPUT_EVENT'
  | 'FRAME_TICK'
  | 'RENDER_TREE_COMMIT'
  | 'ACCESSIBILITY_SNAPSHOT'
  | 'SENSOR_SYNC'
  | 'PERMISSION_SYNC'
  | 'DEVICE_PROFILE_CHANGE'
  | 'CONSOLE_LOG'
  | 'RUNTIME_ERROR'
  | 'RELOAD_REQUEST'
  | 'WORKER_CRASH';

export interface RuntimeMessage<T = any> {
  id: string;
  source: ContextType;
  target: ContextType | 'all';
  type: MessageType;
  payload: T;
  timestamp: number;
}

export interface InputPointerEvent {
  type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel';
  x: number;
  y: number;
  pointerId: number;
  buttons: number;
  timestamp: number;
}

export interface InputKeyEvent {
  type: 'keydown' | 'keyup';
  key: string;
  code: string;
  shiftKey?: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
}

export type MessageHandler = (message: RuntimeMessage) => void;

/**
 * Message Bus for cross-context communication with RingBuffer and MessageChannel support.
 */
export class RuntimeMessageBus {
  private handlers: Map<MessageType | '*', Set<MessageHandler>> = new Map();
  private messageHistory: RuntimeMessage[] = [];
  private maxHistory: number = 200;

  public subscribe(type: MessageType | '*', handler: MessageHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  public dispatch(message: Omit<RuntimeMessage, 'id' | 'timestamp'>): RuntimeMessage {
    const fullMessage: RuntimeMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now()
    };

    this.messageHistory.push(fullMessage);
    if (this.messageHistory.length > this.maxHistory) {
      this.messageHistory.shift();
    }

    const specificHandlers = this.handlers.get(message.type);
    if (specificHandlers) {
      for (const handler of specificHandlers) {
        handler(fullMessage);
      }
    }

    const wildcardHandlers = this.handlers.get('*');
    if (wildcardHandlers) {
      for (const handler of wildcardHandlers) {
        handler(fullMessage);
      }
    }

    return fullMessage;
  }

  public getRecentMessages(): RuntimeMessage[] {
    return [...this.messageHistory];
  }

  public clear(): void {
    this.messageHistory = [];
  }
}

/**
 * Four-Context Coordinator: Manages Host, Tenant, Shell, and Compositor contexts.
 */
export class FourContextCoordinator {
  public readonly bus: RuntimeMessageBus;
  public readonly sensorEngine: SensorEngine;
  public readonly permissionEngine: PermissionEngine;
  private currentProfile: DeviceProfile;
  private isRunning: boolean = false;
  private latestRenderTree: RenderTree | null = null;
  private latestAccessibilitySnapshot: ScreenSnapshot | null = null;
  private logs: LogEntry[] = [];
  private framePacerTimer: NodeJS.Timeout | null = null;

  constructor(profile: DeviceProfile, sensorEngine?: SensorEngine, permissionEngine?: PermissionEngine) {
    this.currentProfile = profile;
    this.bus = new RuntimeMessageBus();
    this.sensorEngine = sensorEngine || new SensorEngine();
    this.permissionEngine = permissionEngine || new PermissionEngine();

    this.setupInternalHandlers();
  }

  private setupInternalHandlers(): void {
    // Sync sensor state to Tenant & Shell
    this.sensorEngine.subscribe((sensorState) => {
      this.bus.dispatch({
        source: 'host',
        target: 'all',
        type: 'SENSOR_SYNC',
        payload: sensorState
      });
    });

    // Sync permission state
    this.permissionEngine.subscribeChange((type, status, registry) => {
      this.bus.dispatch({
        source: 'host',
        target: 'all',
        type: 'PERMISSION_SYNC',
        payload: { type, status, registry }
      });
    });

    // Track RenderTree commits
    this.bus.subscribe('RENDER_TREE_COMMIT', (msg) => {
      this.latestRenderTree = msg.payload as RenderTree;
    });

    // Track Accessibility snapshots
    this.bus.subscribe('ACCESSIBILITY_SNAPSHOT', (msg) => {
      this.latestAccessibilitySnapshot = msg.payload as ScreenSnapshot;
    });

    // Track Logs
    this.bus.subscribe('CONSOLE_LOG', (msg) => {
      const entry: LogEntry = {
        level: msg.payload.level || 'info',
        category: msg.payload.category || 'runtime',
        message: msg.payload.message,
        details: msg.payload.details,
        timestamp: Date.now()
      };
      this.logs.push(entry);
      if (this.logs.length > 500) {
        this.logs.shift();
      }
    });
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Start 60 FPS display frame pacer (16.6ms intervals)
    const interval = Math.floor(1000 / (this.currentProfile.refreshRate || 60));
    this.framePacerTimer = setInterval(() => {
      if (!this.isRunning) return;
      this.bus.dispatch({
        source: 'compositor',
        target: 'all',
        type: 'FRAME_TICK',
        payload: { timestamp: Date.now() }
      });
    }, interval);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.framePacerTimer) {
      clearInterval(this.framePacerTimer);
      this.framePacerTimer = null;
    }
  }

  public setDeviceProfile(profile: DeviceProfile): void {
    this.currentProfile = profile;
    this.bus.dispatch({
      source: 'host',
      target: 'all',
      type: 'DEVICE_PROFILE_CHANGE',
      payload: profile
    });
  }

  public getDeviceProfile(): DeviceProfile {
    return this.currentProfile;
  }

  public dispatchPointerInput(event: InputPointerEvent): void {
    this.bus.dispatch({
      source: 'host',
      target: 'tenant',
      type: 'INPUT_EVENT',
      payload: event
    });
  }

  public dispatchKeyInput(event: InputKeyEvent): void {
    this.bus.dispatch({
      source: 'host',
      target: 'tenant',
      type: 'INPUT_EVENT',
      payload: event
    });
  }

  public requestReload(): void {
    this.bus.dispatch({
      source: 'host',
      target: 'tenant',
      type: 'RELOAD_REQUEST',
      payload: { reason: 'user_or_metro_hmr' }
    });
  }

  public getLatestRenderTree(): RenderTree | null {
    return this.latestRenderTree;
  }

  public getLatestAccessibilitySnapshot(): ScreenSnapshot | null {
    return this.latestAccessibilitySnapshot;
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }
}
