import { DeviceProfile, SensorState, BatteryState } from '@pocketsim/shared-types';

export type DynamicIslandState =
  | { mode: 'idle' }
  | { mode: 'compact'; leadingText?: string; trailingText?: string }
  | { mode: 'expanded'; title: string; content: string; progress?: number };

export interface StatusBarState {
  time: string;
  wifiLevel: number; // 0..3
  cellularBars: number; // 0..4
  batteryLevel: number; // 0..100
  isCharging: boolean;
  style: 'light-content' | 'dark-content';
}

export interface SoftwareKeyboardState {
  isOpen: boolean;
  height: number;
  layout: 'qwerty' | 'numeric' | 'email';
}

export interface SystemDialogState {
  isOpen: boolean;
  type: 'alert' | 'permission' | 'action_sheet';
  title: string;
  message?: string;
  actions: Array<{ label: string; actionId: string; style?: 'default' | 'cancel' | 'destructive' }>;
}

export interface DeviceShellState {
  profile: DeviceProfile;
  statusBar: StatusBarState;
  dynamicIsland: DynamicIslandState;
  keyboard: SoftwareKeyboardState;
  dialog: SystemDialogState;
  theme: 'light' | 'dark';
  orientation: 'portrait' | 'landscape';
}

export type ShellStateListener = (state: DeviceShellState) => void;

export class DeviceShellManager {
  private state: DeviceShellState;
  private listeners: Set<ShellStateListener> = new Set();
  private timeTimer: NodeJS.Timeout | null = null;

  constructor(profile: DeviceProfile) {
    this.state = {
      profile,
      statusBar: {
        time: this.formatCurrentTime(),
        wifiLevel: 3,
        cellularBars: 4,
        batteryLevel: 95,
        isCharging: false,
        style: profile.defaultTheme === 'dark' ? 'light-content' : 'dark-content'
      },
      dynamicIsland: { mode: 'idle' },
      keyboard: {
        isOpen: false,
        height: 290,
        layout: 'qwerty'
      },
      dialog: {
        isOpen: false,
        type: 'alert',
        title: '',
        actions: []
      },
      theme: profile.defaultTheme === 'light' ? 'light' : 'dark',
      orientation: 'portrait'
    };

    this.startTimeUpdater();
  }

  public getState(): Readonly<DeviceShellState> {
    return { ...this.state };
  }

  public subscribe(listener: ShellStateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const clone = this.getState();
    for (const listener of this.listeners) {
      listener(clone);
    }
  }

  private startTimeUpdater(): void {
    this.timeTimer = setInterval(() => {
      const newTime = this.formatCurrentTime();
      if (newTime !== this.state.statusBar.time) {
        this.state.statusBar.time = newTime;
        this.notify();
      }
    }, 10000);
  }

  private formatCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  public setProfile(profile: DeviceProfile): void {
    this.state.profile = profile;
    this.notify();
  }

  public syncSensorState(sensorState: SensorState): void {
    this.state.statusBar.batteryLevel = Math.round(sensorState.battery.level * 100);
    this.state.statusBar.isCharging = sensorState.battery.isCharging;

    if (sensorState.network.type === 'wifi') {
      this.state.statusBar.wifiLevel = 3;
      this.state.statusBar.cellularBars = 0;
    } else if (sensorState.network.type.startsWith('cellular')) {
      this.state.statusBar.wifiLevel = 0;
      this.state.statusBar.cellularBars = 4;
    } else {
      this.state.statusBar.wifiLevel = 0;
      this.state.statusBar.cellularBars = 0;
    }
    this.notify();
  }

  public setDynamicIsland(island: DynamicIslandState): void {
    this.state.dynamicIsland = island;
    this.notify();
  }

  public setStatusBarStyle(style: 'light-content' | 'dark-content'): void {
    this.state.statusBar.style = style;
    this.notify();
  }

  public openKeyboard(layout: 'qwerty' | 'numeric' | 'email' = 'qwerty'): void {
    this.state.keyboard = {
      isOpen: true,
      height: 290,
      layout
    };
    this.notify();
  }

  public closeKeyboard(): void {
    if (this.state.keyboard.isOpen) {
      this.state.keyboard.isOpen = false;
      this.notify();
    }
  }

  public showDialog(dialog: Omit<SystemDialogState, 'isOpen'>): void {
    this.state.dialog = {
      isOpen: true,
      ...dialog
    };
    this.notify();
  }

  public dismissDialog(): void {
    if (this.state.dialog.isOpen) {
      this.state.dialog.isOpen = false;
      this.notify();
    }
  }

  public toggleTheme(): void {
    this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
    this.state.statusBar.style = this.state.theme === 'dark' ? 'light-content' : 'dark-content';
    this.notify();
  }

  public destroy(): void {
    if (this.timeTimer) {
      clearInterval(this.timeTimer);
      this.timeTimer = null;
    }
  }
}
