import { describe, it, expect } from 'vitest';
import { getDeviceProfile, listDeviceProfiles, createCustomProfile, IPHONE_15_PRO, PIXEL_8 } from './index.js';

describe('Device Profiles', () => {
  it('retrieves iPhone 15 Pro by id and aliases', () => {
    expect(getDeviceProfile('iphone-15-pro').id).toBe('iphone-15-pro');
    expect(getDeviceProfile('iphone-pro').id).toBe('iphone-15-pro');
    expect(getDeviceProfile('ios').platform).toBe('ios');
  });

  it('retrieves Pixel 8 by id and alias', () => {
    expect(getDeviceProfile('pixel-8').id).toBe('pixel-8');
    expect(getDeviceProfile('pixel').platform).toBe('android');
    expect(getDeviceProfile('android').id).toBe('pixel-8');
  });

  it('lists all registered profiles', () => {
    const list = listDeviceProfiles();
    expect(list.length).toBeGreaterThanOrEqual(5);
    const ids = list.map(p => p.id);
    expect(ids).toContain('iphone-15-pro');
    expect(ids).toContain('pixel-8');
    expect(ids).toContain('iphone-se');
  });

  it('allows custom profile creation with safe overrides', () => {
    const custom = createCustomProfile({
      id: 'custom-tablet',
      name: 'Custom Tablet',
      width: 768,
      height: 1024,
      platform: 'ios'
    });

    expect(custom.id).toBe('custom-tablet');
    expect(custom.width).toBe(768);
    expect(custom.height).toBe(1024);
    expect(custom.platform).toBe('ios');
    expect(custom.safeAreaInsets.top).toBe(IPHONE_15_PRO.safeAreaInsets.top);
  });
});
