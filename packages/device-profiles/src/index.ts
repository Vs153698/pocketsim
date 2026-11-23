import { DeviceProfile } from '@pocketsim/shared-types';

export const IPHONE_16_PRO: DeviceProfile = {
  id: 'iphone-16-pro',
  name: 'iPhone 16 Pro',
  platform: 'ios',
  osVersion: '18.2',
  width: 402,
  height: 874,
  pixelRatio: 3.0,
  physicalWidth: 1206,
  physicalHeight: 2622,
  safeAreaInsets: { top: 62, bottom: 34, left: 0, right: 0 },
  statusBarHeight: 56,
  navigationBarHeight: 34,
  screenCornerRadius: 56,
  cutout: { type: 'dynamic_island', width: 125, height: 37, top: 13, cornerRadius: 18.5 },
  defaultTheme: 'dark',
  refreshRate: 120,
  defaultFontScale: 1.0
};

export const IPHONE_16_PRO_MAX: DeviceProfile = {
  id: 'iphone-16-pro-max',
  name: 'iPhone 16 Pro Max',
  platform: 'ios',
  osVersion: '18.2',
  width: 440,
  height: 956,
  pixelRatio: 3.0,
  physicalWidth: 1320,
  physicalHeight: 2868,
  safeAreaInsets: { top: 62, bottom: 34, left: 0, right: 0 },
  statusBarHeight: 56,
  navigationBarHeight: 34,
  screenCornerRadius: 58,
  cutout: { type: 'dynamic_island', width: 125, height: 37, top: 13, cornerRadius: 18.5 },
  defaultTheme: 'dark',
  refreshRate: 120,
  defaultFontScale: 1.0
};

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
  safeAreaInsets: { top: 59, bottom: 34, left: 0, right: 0 },
  statusBarHeight: 54,
  navigationBarHeight: 34,
  screenCornerRadius: 55,
  cutout: { type: 'dynamic_island', width: 125, height: 37, top: 11, cornerRadius: 18.5 },
  defaultTheme: 'dark',
  refreshRate: 120,
  defaultFontScale: 1.0
};

export const IPHONE_DUO: DeviceProfile = {
  id: 'iphone-duo',
  name: 'iPhone Duo (Dual Concept)',
  platform: 'ios',
  osVersion: '18.2',
  width: 786,
  height: 852,
  pixelRatio: 3.0,
  physicalWidth: 2358,
  physicalHeight: 2556,
  safeAreaInsets: { top: 59, bottom: 34, left: 0, right: 0 },
  statusBarHeight: 54,
  navigationBarHeight: 34,
  screenCornerRadius: 44,
  cutout: { type: 'dynamic_island', width: 125, height: 37, top: 11, cornerRadius: 18.5 },
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
  safeAreaInsets: { top: 20, bottom: 0, left: 0, right: 0 },
  statusBarHeight: 20,
  navigationBarHeight: 0,
  screenCornerRadius: 0,
  cutout: { type: 'none', width: 0, height: 0, top: 0 },
  defaultTheme: 'light',
  refreshRate: 60,
  defaultFontScale: 1.0
};

export const GALAXY_Z_FOLD_6: DeviceProfile = {
  id: 'galaxy-z-fold-6',
  name: 'Samsung Galaxy Z Fold 6 (Inner 7.6")',
  platform: 'android',
  osVersion: '14.0 (One UI 6.1)',
  width: 748,
  height: 896,
  pixelRatio: 2.6,
  physicalWidth: 1856,
  physicalHeight: 2160,
  safeAreaInsets: { top: 40, bottom: 24, left: 0, right: 0 },
  statusBarHeight: 40,
  navigationBarHeight: 24,
  screenCornerRadius: 24,
  cutout: { type: 'punch_hole', width: 18, height: 18, top: 11, cornerRadius: 9 },
  defaultTheme: 'dark',
  refreshRate: 120,
  defaultFontScale: 1.0
};

export const PIXEL_9_PRO_FOLD: DeviceProfile = {
  id: 'pixel-9-pro-fold',
  name: 'Google Pixel 9 Pro Fold (8.0")',
  platform: 'android',
  osVersion: '15.0 (API 35)',
  width: 824,
  height: 856,
  pixelRatio: 2.625,
  physicalWidth: 2076,
  physicalHeight: 2152,
  safeAreaInsets: { top: 44, bottom: 24, left: 0, right: 0 },
  statusBarHeight: 44,
  navigationBarHeight: 24,
  screenCornerRadius: 28,
  cutout: { type: 'punch_hole', width: 20, height: 20, top: 12, cornerRadius: 10 },
  defaultTheme: 'dark',
  refreshRate: 120,
  defaultFontScale: 1.0
};

export const SURFACE_DUO: DeviceProfile = {
  id: 'surface-duo',
  name: 'Surface Duo (Dual 5.6")',
  platform: 'android',
  osVersion: '12.0',
  width: 1080,
  height: 720,
  pixelRatio: 2.5,
  physicalWidth: 2700,
  physicalHeight: 1800,
  safeAreaInsets: { top: 32, bottom: 16, left: 0, right: 0 },
  statusBarHeight: 32,
  navigationBarHeight: 16,
  screenCornerRadius: 8,
  cutout: { type: 'none', width: 0, height: 0, top: 0 },
  defaultTheme: 'dark',
  refreshRate: 90,
  defaultFontScale: 1.0
};

export const PIXEL_9_PRO: DeviceProfile = {
  id: 'pixel-9-pro',
  name: 'Google Pixel 9 Pro',
  platform: 'android',
  osVersion: '15.0 (API 35)',
  width: 412,
  height: 924,
  pixelRatio: 2.7,
  physicalWidth: 1280,
  physicalHeight: 2856,
  safeAreaInsets: { top: 48, bottom: 24, left: 0, right: 0 },
  statusBarHeight: 48,
  navigationBarHeight: 24,
  screenCornerRadius: 38,
  cutout: { type: 'punch_hole', width: 24, height: 24, top: 12, cornerRadius: 12 },
  defaultTheme: 'dark',
  refreshRate: 120,
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
  safeAreaInsets: { top: 48, bottom: 24, left: 0, right: 0 },
  statusBarHeight: 48,
  navigationBarHeight: 24,
  screenCornerRadius: 36,
  cutout: { type: 'punch_hole', width: 24, height: 24, top: 12, cornerRadius: 12 },
  defaultTheme: 'dark',
  refreshRate: 120,
  defaultFontScale: 1.0
};

export const GALAXY_S24_ULTRA: DeviceProfile = {
  id: 'galaxy-s24-ultra',
  name: 'Samsung Galaxy S24 Ultra',
  platform: 'android',
  osVersion: '14.0 (One UI 6.1)',
  width: 412,
  height: 915,
  pixelRatio: 3.5,
  physicalWidth: 1440,
  physicalHeight: 3120,
  safeAreaInsets: { top: 44, bottom: 24, left: 0, right: 0 },
  statusBarHeight: 44,
  navigationBarHeight: 24,
  screenCornerRadius: 28,
  cutout: { type: 'punch_hole', width: 22, height: 22, top: 11, cornerRadius: 11 },
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
  safeAreaInsets: { top: 44, bottom: 24, left: 0, right: 0 },
  statusBarHeight: 44,
  navigationBarHeight: 24,
  screenCornerRadius: 40,
  cutout: { type: 'punch_hole', width: 22, height: 22, top: 11, cornerRadius: 11 },
  defaultTheme: 'dark',
  refreshRate: 120,
  defaultFontScale: 1.0
};

export const ALL_DEVICE_PROFILES: Record<string, DeviceProfile> = {
  'iphone-16-pro': IPHONE_16_PRO,
  'iphone-16-pro-max': IPHONE_16_PRO_MAX,
  'iphone-15-pro': IPHONE_15_PRO,
  'iphone-duo': IPHONE_DUO,
  'iphone-se': IPHONE_SE,
  'galaxy-z-fold-6': GALAXY_Z_FOLD_6,
  'pixel-9-pro-fold': PIXEL_9_PRO_FOLD,
  'surface-duo': SURFACE_DUO,
  'pixel-9-pro': PIXEL_9_PRO,
  'pixel-8': PIXEL_8,
  'galaxy-s24-ultra': GALAXY_S24_ULTRA,
  'galaxy-s24': GALAXY_S24
};

export function getDeviceProfile(idOrAlias: string): DeviceProfile {
  const normalized = idOrAlias.toLowerCase().trim();
  if (ALL_DEVICE_PROFILES[normalized]) {
    return ALL_DEVICE_PROFILES[normalized];
  }
  if (normalized === 'iphone-pro') return IPHONE_15_PRO;
  if (normalized === 'android') return PIXEL_8;
  if (normalized === 'pixel') return PIXEL_8;
  if (normalized.includes('fold')) return GALAXY_Z_FOLD_6;
  if (normalized.includes('duo')) return IPHONE_DUO;
  if (normalized.includes('16') && normalized.includes('max')) return IPHONE_16_PRO_MAX;
  if (normalized.includes('16')) return IPHONE_16_PRO;
  if (normalized === 'iphone' || normalized === 'ios') return IPHONE_16_PRO;
  if (normalized.includes('pixel-9') || normalized === 'pixel9') return PIXEL_9_PRO;
  if (normalized.includes('ultra')) return GALAXY_S24_ULTRA;
  if (normalized === 'se') return IPHONE_SE;
  return IPHONE_16_PRO;
}

export function listDeviceProfiles(): DeviceProfile[] {
  return Object.values(ALL_DEVICE_PROFILES);
}

export function createCustomProfile(overrides: Partial<DeviceProfile> & { id: string; name: string; width: number; height: number; platform: 'ios' | 'android' }): DeviceProfile {
  const base = overrides.platform === 'android' ? PIXEL_8 : IPHONE_15_PRO;
  return {
    ...base,
    ...overrides,
    safeAreaInsets: overrides.safeAreaInsets || base.safeAreaInsets
  };
}
