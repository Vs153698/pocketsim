import { describe, it, expect } from 'vitest';
import { IPHONE_15_PRO, PIXEL_8 } from '@pocketsim/device-profiles';
import { SensorEngine } from '@pocketsim/sensor-engine';
import { PermissionEngine } from '@pocketsim/permission-engine';
import { NativeModuleRegistry } from './index.js';

describe('NativeModuleRegistry', () => {
  it('registers and provides Platform module matching device profile', () => {
    const sensorEngine = new SensorEngine();
    const permissionEngine = new PermissionEngine();
    const registry = new NativeModuleRegistry(IPHONE_15_PRO, sensorEngine, permissionEngine);

    const platform = registry.getModule('Platform');
    expect(platform?.OS).toBe('ios');
    expect(platform?.Version).toBe('17.5');
    expect(platform?.select({ ios: 'apple', android: 'google' })).toBe('apple');
  });

  it('provides live Location from SensorEngine', async () => {
    const sensorEngine = new SensorEngine();
    const permissionEngine = new PermissionEngine();
    const registry = new NativeModuleRegistry(IPHONE_15_PRO, sensorEngine, permissionEngine);

    sensorEngine.setLocation({ latitude: 37.7749, longitude: -122.4194 });
    const locationModule = registry.getModule('ExpoLocation');
    const pos = await locationModule?.getCurrentPositionAsync();
    expect(pos.coords.latitude).toBeCloseTo(37.7749);
    expect(pos.coords.longitude).toBeCloseTo(-122.4194);
  });

  it('provides persistent AsyncLocalStorage simulation', async () => {
    const sensorEngine = new SensorEngine();
    const permissionEngine = new PermissionEngine();
    const registry = new NativeModuleRegistry(IPHONE_15_PRO, sensorEngine, permissionEngine);

    const storage = registry.getModule('AsyncLocalStorage');
    await storage?.setItem('user_token', 'jwt_abc_123');
    const val = await storage?.getItem('user_token');
    expect(val).toBe('jwt_abc_123');
  });

  it('installs globals and turboModuleProxy correctly', () => {
    const mockGlobal: any = {};
    const sensorEngine = new SensorEngine();
    const permissionEngine = new PermissionEngine();
    const registry = new NativeModuleRegistry(PIXEL_8, sensorEngine, permissionEngine);

    registry.installGlobals(mockGlobal);
    expect(mockGlobal.__turboModuleProxy).toBeDefined();
    expect(mockGlobal.Platform.OS).toBe('android');
    expect(mockGlobal.__turboModuleProxy('DeviceInfo').brand).toBe('Google');
  });
});
