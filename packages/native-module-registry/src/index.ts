import { DeviceProfile, PermissionStatus, LocationCoordinates } from '@pocketsim/shared-types';
import { SensorEngine } from '@pocketsim/sensor-engine';
import { PermissionEngine } from '@pocketsim/permission-engine';

export interface NativeModule {
  [methodName: string]: any;
}

export class NativeModuleRegistry {
  private modules: Map<string, NativeModule> = new Map();
  private sensorEngine: SensorEngine;
  private permissionEngine: PermissionEngine;
  private currentProfile: DeviceProfile;

  constructor(profile: DeviceProfile, sensorEngine: SensorEngine, permissionEngine: PermissionEngine) {
    this.currentProfile = profile;
    this.sensorEngine = sensorEngine;
    this.permissionEngine = permissionEngine;

    this.registerCoreModules();
  }

  public registerModule(name: string, impl: NativeModule): void {
    this.modules.set(name, impl);
  }

  public getModule<T = NativeModule>(name: string): T | undefined {
    return this.modules.get(name) as T | undefined;
  }

  public hasModule(name: string): boolean {
    return this.modules.has(name);
  }

  public listModules(): string[] {
    return Array.from(this.modules.keys());
  }

  public updateProfile(profile: DeviceProfile): void {
    this.currentProfile = profile;
    this.registerCoreModules();
  }

  private registerCoreModules(): void {
    const profile = this.currentProfile;

    // 1. Platform & PlatformConstants
    const platformModule: NativeModule = {
      OS: profile.platform,
      Version: profile.osVersion,
      isTesting: true,
      isTV: false,
      select: (spec: Record<string, any>) => {
        if (spec[profile.platform] !== undefined) return spec[profile.platform];
        if (spec.default !== undefined) return spec.default;
        return undefined;
      },
      constants: {
        isTesting: true,
        reactNativeVersion: { major: 0, minor: 76, patch: 0 },
        ServerHost: '127.0.0.1:8081',
        osVersion: profile.osVersion,
        interfaceOrientation: 'portrait'
      }
    };
    this.registerModule('PlatformConstants', platformModule);
    this.registerModule('Platform', platformModule);

    // 2. DeviceInfo
    const deviceInfoModule: NativeModule = {
      getConstants: () => ({
        Dimensions: {
          window: {
            width: profile.width,
            height: profile.height,
            scale: profile.pixelRatio,
            fontScale: profile.defaultFontScale
          },
          screen: {
            width: profile.physicalWidth,
            height: profile.physicalHeight,
            scale: profile.pixelRatio,
            fontScale: profile.defaultFontScale
          }
        },
        isIPhoneX_deprecated: profile.cutout.type === 'dynamic_island' || profile.cutout.type === 'notch'
      }),
      brand: profile.platform === 'ios' ? 'Apple' : 'Google',
      model: profile.name,
      systemName: profile.platform === 'ios' ? 'iOS' : 'Android',
      systemVersion: profile.osVersion,
      isDevice: true,
      supportedCpuArchitectures: ['arm64']
    };
    this.registerModule('DeviceInfo', deviceInfoModule);

    // 3. StatusBarManager
    let currentStatusBarStyle = 'dark-content';
    let isStatusBarHidden = false;
    const statusBarManager: NativeModule = {
      setStyle: (style: string) => {
        currentStatusBarStyle = style;
      },
      setHidden: (hidden: boolean) => {
        isStatusBarHidden = hidden;
      },
      getHeight: (callback: (data: { height: number }) => void) => {
        callback({ height: profile.statusBarHeight });
      },
      getStyle: () => currentStatusBarStyle,
      isHidden: () => isStatusBarHidden
    };
    this.registerModule('StatusBarManager', statusBarManager);

    // 4. AsyncLocalStorage
    const storageMap = new Map<string, string>();
    const asyncLocalStorage: NativeModule = {
      getItem: async (key: string) => storageMap.get(key) ?? null,
      setItem: async (key: string, value: string) => storageMap.set(key, value),
      removeItem: async (key: string) => storageMap.delete(key),
      clear: async () => storageMap.clear(),
      getAllKeys: async () => Array.from(storageMap.keys()),
      multiGet: async (keys: string[]) => keys.map(k => [k, storageMap.get(k) ?? null]),
      multiSet: async (pairs: [string, string][]) => pairs.forEach(([k, v]) => storageMap.set(k, v))
    };
    this.registerModule('AsyncLocalStorage', asyncLocalStorage);
    this.registerModule('RNC_AsyncSQLiteDBStorage', asyncLocalStorage);

    // 5. Haptics
    const hapticsModule: NativeModule = {
      notificationAsync: async (type: string = 'success') => {
        return { type, triggered: true, timestamp: Date.now() };
      },
      impactAsync: async (style: string = 'medium') => {
        return { style, triggered: true, timestamp: Date.now() };
      },
      selectionAsync: async () => {
        return { triggered: true, timestamp: Date.now() };
      }
    };
    this.registerModule('ExpoHaptics', hapticsModule);
    this.registerModule('Haptics', hapticsModule);

    // 6. Location (Expo & React Native)
    const locationModule: NativeModule = {
      getForegroundPermissionsAsync: async () => {
        const status = this.permissionEngine.getStatus('location');
        return {
          status,
          granted: status === 'granted',
          canAskAgain: status !== 'denied_permanently'
        };
      },
      requestForegroundPermissionsAsync: async () => {
        const status = await this.permissionEngine.requestPermission('location', true);
        return {
          status,
          granted: status === 'granted',
          canAskAgain: status !== 'denied_permanently'
        };
      },
      getCurrentPositionAsync: async () => {
        const loc = this.sensorEngine.getState().location;
        return {
          coords: {
            latitude: loc.latitude,
            longitude: loc.longitude,
            altitude: loc.altitude,
            accuracy: loc.accuracy,
            altitudeAccuracy: loc.altitudeAccuracy ?? 5,
            heading: loc.heading,
            speed: loc.speed
          },
          timestamp: loc.timestamp
        };
      },
      watchPositionAsync: (options: any, callback: (location: any) => void) => {
        return this.sensorEngine.subscribe((state) => {
          callback({
            coords: state.location,
            timestamp: state.location.timestamp
          });
        });
      }
    };
    this.registerModule('ExpoLocation', locationModule);
    this.registerModule('Location', locationModule);

    // 7. Battery (ExpoBattery)
    const batteryModule: NativeModule = {
      getBatteryLevelAsync: async () => this.sensorEngine.getState().battery.level,
      isBatteryChargingAsync: async () => this.sensorEngine.getState().battery.isCharging,
      isLowPowerModeEnabledAsync: async () => this.sensorEngine.getState().battery.lowPowerMode,
      getPowerStateAsync: async () => {
        const b = this.sensorEngine.getState().battery;
        return {
          batteryLevel: b.level,
          batteryState: b.isCharging ? 2 : 1,
          lowPowerMode: b.lowPowerMode
        };
      }
    };
    this.registerModule('ExpoBattery', batteryModule);

    // 8. Device (ExpoDevice)
    const deviceModule: NativeModule = {
      brand: profile.platform === 'ios' ? 'Apple' : 'Google',
      manufacturer: profile.platform === 'ios' ? 'Apple' : 'Google',
      modelName: profile.name,
      osName: profile.platform === 'ios' ? 'iOS' : 'Android',
      osVersion: profile.osVersion,
      platformApiLevel: profile.platform === 'android' ? 34 : null,
      deviceType: 1, // PHONE
      isDevice: true
    };
    this.registerModule('ExpoDevice', deviceModule);

    // 9. SafeAreaContext
    const safeAreaModule: NativeModule = {
      getConstants: () => ({
        initialWindowMetrics: {
          insets: profile.safeAreaInsets,
          frame: { x: 0, y: 0, width: profile.width, height: profile.height }
        }
      })
    };
    this.registerModule('RNCSafeAreaContext', safeAreaModule);
    this.registerModule('RNCSafeAreaProvider', safeAreaModule);
  }

  /**
   * Installs TurboModule & NativeModules shims into global namespace.
   */
  public installGlobals(targetGlobal: any = globalThis): void {
    const self = this;

    // __turboModuleProxy
    targetGlobal.__turboModuleProxy = (name: string) => {
      return self.getModule(name) || {};
    };

    // NativeModules
    if (!targetGlobal.NativeModules) {
      targetGlobal.NativeModules = new Proxy({}, {
        get(_target, prop: string) {
          return self.getModule(prop) || {};
        }
      });
    }

    // Platform
    targetGlobal.Platform = this.getModule('Platform');

    // Expo modules
    if (!targetGlobal.expo) {
      targetGlobal.expo = {};
    }
    targetGlobal.expo.modules = new Proxy({}, {
      get(_target, prop: string) {
        return self.getModule(prop) || self.getModule(`Expo${prop}`) || {};
      }
    });
  }
}
