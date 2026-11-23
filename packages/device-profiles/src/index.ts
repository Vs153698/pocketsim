import { DeviceProfile } from '@pocketsim/shared-types';

export const IPHONE_15_PRO: DeviceProfile = {
  id: 'iphone-15-pro',
  name: 'iPhone 15 Pro',
  platform: 'ios',
  osVersion: '17.5',
  width: 393,
  height: 852,
  pixelRatio: 3.0,
  physicalWidth: 1179,
  physicalHeight: 2556,
  safeAreaInsets: {
    top: 59,
    bottom: 34,
    left: 0,
    right: 0
  },
  statusBarHeight: 54,
  navigationBarHeight: 34,
  screenCornerRadius: 55,
  cutout: {
    type: 'dynamic_island',
    width: 125,
    height: 37,
    top: 11,
    cornerRadius: 18.5
  },
  defaultTheme: 'dark',
  refreshRate: 120,
  defaultFontScale: 1.0
};

export const IPHONE_16_PRO_MAX: DeviceProfile = {
  id: 'iphone-16-pro-max',
  name: 'iPhone 16 Pro Max',
  platform: 'ios',
  osVersion: '18.0',
  width: 440,
  height: 956,
  pixelRatio: 3.0,
  physicalWidth: 1320,
  physicalHeight: 2868,
  safeAreaInsets: {
    top: 62,
    bottom: 34,
    left: 0,
    right: 0
  },
  statusBarHeight: 56,
  navigationBarHeight: 34,
  screenCornerRadius: 58,
  cutout: {
    type: 'dynamic_island',
    width: 125,
    height: 37,
    top: 13,
    cornerRadius: 18.5
  },
  defaultTheme: 'dark',
  refreshRate: 120,
  defaultFontScale: 1.0
};

export const IPHONE_SE: DeviceProfile = {
  id: 'iphone-se',
  name: 'iPhone SE (3rd Gen)',
  platform: 'ios',
  osVersion: '17.5',
  width: 375,
  height: 667,
  pixelRatio: 2.0,
  physicalWidth: 750,
  physicalHeight: 1334,
  safeAreaInsets: {
    top: 20,
    bottom: 0,
    left: 0,
    right: 0
  },
  statusBarHeight: 20,
  navigationBarHeight: 0,
  screenCornerRadius: 0,
  cutout: {
    type: 'none',
    width: 0,
    height: 0,
    top: 0
  },
  defaultTheme: 'light',
  refreshRate: 60,
  defaultFontScale: 1.0
};

export const PIXEL_8: DeviceProfile = {
  id: 'pixel-8',
  name: 'Google Pixel 8',
  platform: 'android',
  osVersion: '14.0 (API 34)',
  width: 412,
  height: 915,
  pixelRatio: 2.625,
  physicalWidth: 1080,
  physicalHeight: 2400,
  safeAreaInsets: {
    top: 48,
    bottom: 24,
    left: 0,
    right: 0
  },
  statusBarHeight: 48,
  navigationBarHeight: 24,
  screenCornerRadius: 36,
  cutout: {
    type: 'punch_hole',
    width: 24,
    height: 24,
    top: 12,
    cornerRadius: 12
  },
  defaultTheme: 'dark',
  refreshRate: 120,
  defaultFontScale: 1.0
};

export const GALAXY_S24: DeviceProfile = {
  id: 'galaxy-s24',
  name: 'Samsung Galaxy S24',
  platform: 'android',
  osVersion: '14.0 (One UI 6.1)',
  width: 412,
  height: 919,
  pixelRatio: 3.0,
  physicalWidth: 1080,
  physicalHeight: 2340,
  safeAreaInsets: {
    top: 44,
    bottom: 24,
    left: 0,
    right: 0
  },
  statusBarHeight: 44,
  navigationBarHeight: 24,
  screenCornerRadius: 40,
  cutout: {
    type: 'punch_hole',
    width: 22,
    height: 22,
    top: 11,
    cornerRadius: 11
  },
  defaultTheme: 'dark',
  refreshRate: 120,
  defaultFontScale: 1.0
};

export const ALL_DEVICE_PROFILES: Record<string, DeviceProfile> = {
  'iphone-15-pro': IPHONE_15_PRO,
  'iphone-16-pro-max': IPHONE_16_PRO_MAX,
  'iphone-se': IPHONE_SE,
  'pixel-8': PIXEL_8,
  'galaxy-s24': GALAXY_S24
};

export function getDeviceProfile(idOrAlias: string): DeviceProfile {
  const normalized = idOrAlias.toLowerCase().trim();
  if (ALL_DEVICE_PROFILES[normalized]) {
    return ALL_DEVICE_PROFILES[normalized];
  }
  if (normalized === 'iphone' || normalized === 'iphone-pro' || normalized === 'ios') {
    return IPHONE_15_PRO;
  }
  if (normalized === 'pixel' || normalized === 'android') {
    return PIXEL_8;
  }
  if (normalized === 'se') {
    return IPHONE_SE;
  }
  // Default fallback
  return IPHONE_15_PRO;
}

export function listDeviceProfiles(): DeviceProfile[] {
  return Object.values(ALL_DEVICE_PROFILES);
}

export function createCustomProfile(overrides: Partial<DeviceProfile> & { id: string; name: string }): DeviceProfile {
  const base = overrides.platform === 'android' ? PIXEL_8 : IPHONE_15_PRO;
  return {
    ...base,
    ...overrides,
    safeAreaInsets: {
      ...base.safeAreaInsets,
      ...(overrides.safeAreaInsets || {})
    },
    cutout: {
      ...base.cutout,
      ...(overrides.cutout || {})
    }
  };
}
