import {
  PermissionType,
  PermissionStatus,
  PermissionRegistry
} from '@pocketsim/shared-types';

export interface PermissionPromptRequest {
  id: string;
  type: PermissionType;
  title: string;
  message: string;
  options: Array<{
    id: string;
    label: string;
    resultingStatus: PermissionStatus;
    isDefault?: boolean;
    isDestructive?: boolean;
  }>;
}

export type PermissionChangeListener = (
  type: PermissionType,
  status: PermissionStatus,
  registry: PermissionRegistry
) => void;

export type PermissionPromptListener = (prompt: PermissionPromptRequest) => void;

export class PermissionEngine {
  private registry: PermissionRegistry;
  private changeListeners: Set<PermissionChangeListener> = new Set();
  private promptListeners: Set<PermissionPromptListener> = new Set();
  private pendingPrompts: Map<string, (status: PermissionStatus) => void> = new Map();

  constructor(initialRegistry?: Partial<PermissionRegistry>) {
    this.registry = {
      location: 'not_requested',
      location_background: 'not_requested',
      camera: 'not_requested',
      microphone: 'not_requested',
      notifications: 'not_requested',
      contacts: 'not_requested',
      photos: 'not_requested',
      media_library: 'not_requested',
      bluetooth: 'not_requested',
      motion: 'not_requested',
      ...(initialRegistry || {})
    };
  }

  public getStatus(type: PermissionType): PermissionStatus {
    return this.registry[type] || 'not_requested';
  }

  public getAll(): PermissionRegistry {
    return { ...this.registry };
  }

  public setPermission(type: PermissionType, status: PermissionStatus): void {
    const old = this.registry[type];
    if (old !== status) {
      this.registry[type] = status;
      this.notifyChange(type, status);
    }
  }

  public subscribeChange(listener: PermissionChangeListener): () => void {
    this.changeListeners.add(listener);
    return () => this.changeListeners.delete(listener);
  }

  public subscribePrompt(listener: PermissionPromptListener): () => void {
    this.promptListeners.add(listener);
    return () => this.promptListeners.delete(listener);
  }

  private notifyChange(type: PermissionType, status: PermissionStatus): void {
    const reg = this.getAll();
    for (const listener of this.changeListeners) {
      listener(type, status, reg);
    }
  }

  public async requestPermission(type: PermissionType, autoGrantIfMocked: boolean = false): Promise<PermissionStatus> {
    const current = this.getStatus(type);
    if (current === 'granted' || current === 'denied_permanently' || current === 'restricted') {
      return current;
    }

    if (autoGrantIfMocked) {
      this.setPermission(type, 'granted');
      return 'granted';
    }

    const promptId = `prompt-${type}-${Date.now()}`;
    const prompt = this.createPromptFor(promptId, type);

    return new Promise<PermissionStatus>((resolve) => {
      this.pendingPrompts.set(promptId, resolve);
      for (const listener of this.promptListeners) {
        listener(prompt);
      }
    });
  }

  public resolvePrompt(promptId: string, optionId: string): boolean {
    const resolver = this.pendingPrompts.get(promptId);
    if (!resolver) return false;

    let resultingStatus: PermissionStatus = 'denied';
    if (optionId.includes('allow') || optionId.includes('grant') || optionId === 'while_using') {
      resultingStatus = 'granted';
    } else if (optionId.includes('never') || optionId.includes('permanent')) {
      resultingStatus = 'denied_permanently';
    } else {
      resultingStatus = 'denied';
    }

    // Extract type from promptId
    const match = promptId.match(/^prompt-([a-z_]+)-\d+$/);
    if (match) {
      const type = match[1] as PermissionType;
      this.setPermission(type, resultingStatus);
    }

    resolver(resultingStatus);
    this.pendingPrompts.delete(promptId);
    return true;
  }

  public resetAll(): void {
    for (const key of Object.keys(this.registry) as PermissionType[]) {
      this.registry[key] = 'not_requested';
      this.notifyChange(key, 'not_requested');
    }
  }

  private createPromptFor(id: string, type: PermissionType): PermissionPromptRequest {
    const titleMap: Record<PermissionType, string> = {
      location: 'Allow "PocketSim App" to access your location?',
      location_background: 'Allow "PocketSim App" to access location in background?',
      camera: 'Allow "PocketSim App" to access the camera?',
      microphone: 'Allow "PocketSim App" to access the microphone?',
      notifications: '"PocketSim App" Would Like to Send You Notifications',
      contacts: 'Allow "PocketSim App" to access your contacts?',
      photos: 'Allow "PocketSim App" to access your photos?',
      media_library: 'Allow "PocketSim App" to access media library?',
      bluetooth: '"PocketSim App" Would Like to Use Bluetooth',
      motion: 'Allow "PocketSim App" to access Motion & Fitness?'
    };

    return {
      id,
      type,
      title: titleMap[type] || `Allow permission for ${type}?`,
      message: 'This allows the application to utilize device hardware capabilities.',
      options: [
        {
          id: 'while_using',
          label: 'Allow While Using App',
          resultingStatus: 'granted',
          isDefault: true
        },
        {
          id: 'deny',
          label: "Don't Allow",
          resultingStatus: 'denied',
          isDestructive: true
        }
      ]
    };
  }
}
