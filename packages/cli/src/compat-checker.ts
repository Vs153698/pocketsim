import { ProjectInfo } from './detector.js';

export interface PackageCompatResult {
  packageName: string;
  version: string;
  status: 'FULLY_SUPPORTED' | 'PARTIALLY_SUPPORTED' | 'MOCKED' | 'REQUIRES_NATIVE_RUNTIME' | 'UNSUPPORTED';
  notes: string;
}

export interface ProjectCompatReport {
  compatibleCount: number;
  partiallySupportedCount: number;
  mockedCount: number;
  nativeRequiredCount: number;
  packages: PackageCompatResult[];
  recommendedPlatform: 'ios' | 'android';
}

const COMPAT_REGISTRY: Record<string, { status: PackageCompatResult['status']; notes: string }> = {
  'react-native': { status: 'FULLY_SUPPORTED', notes: 'Virtual Fabric Reconciler + Yoga Layout WASM' },
  'expo': { status: 'FULLY_SUPPORTED', notes: 'Core Expo runtime globals and constants' },
  'expo-router': { status: 'FULLY_SUPPORTED', notes: 'File-system router & navigation container' },
  'expo-location': { status: 'FULLY_SUPPORTED', notes: 'PocketSim Sensor Engine live GPS & GPX simulation' },
  'expo-battery': { status: 'FULLY_SUPPORTED', notes: 'PocketSim Battery level and charging state' },
  'expo-device': { status: 'FULLY_SUPPORTED', notes: 'Populated from active Device Profile metrics' },
  'expo-haptics': { status: 'FULLY_SUPPORTED', notes: 'Haptic feedback pulses dispatched to shell' },
  'expo-status-bar': { status: 'FULLY_SUPPORTED', notes: 'Status bar style and visibility controls' },
  'expo-image-picker': { status: 'MOCKED', notes: 'Supplies test fixture images' },
  'expo-camera': { status: 'MOCKED', notes: 'Provides test pattern camera viewfinder' },
  'expo-secure-store': { status: 'FULLY_SUPPORTED', notes: 'Local sandboxed encrypted keystore' },
  'expo-file-system': { status: 'FULLY_SUPPORTED', notes: 'Isolated virtual project directory filesystem' },
  'react-native-safe-area-context': { status: 'FULLY_SUPPORTED', notes: 'Dynamic safe-area insets matching device notch/island' },
  'react-native-screens': { status: 'FULLY_SUPPORTED', notes: 'Screen containers and stack transitions' },
  'react-navigation': { status: 'FULLY_SUPPORTED', notes: 'Stack, Tabs, and Drawer navigators' },
  '@react-navigation/native': { status: 'FULLY_SUPPORTED', notes: 'Navigation container and deep linking' },
  '@react-navigation/native-stack': { status: 'FULLY_SUPPORTED', notes: 'Native stack navigator animations' },
  'react-native-gesture-handler': { status: 'FULLY_SUPPORTED', notes: 'Pointer events mapped to gesture state machine' },
  'react-native-reanimated': { status: 'PARTIALLY_SUPPORTED', notes: 'Standard JS/Worker animation loop fallback' },
  'react-native-svg': { status: 'FULLY_SUPPORTED', notes: 'Vector graphics rasterization' },
  'react-native-mmkv': { status: 'FULLY_SUPPORTED', notes: 'Fast in-memory key-value store' }
};

export function checkProjectCompatibility(project: ProjectInfo): ProjectCompatReport {
  const results: PackageCompatResult[] = [];

  for (const [name, version] of Object.entries(project.dependencies)) {
    if (COMPAT_REGISTRY[name]) {
      const entry = COMPAT_REGISTRY[name];
      results.push({
        packageName: name,
        version,
        status: entry.status,
        notes: entry.notes
      });
    }
  }

  const compatibleCount = results.filter(r => r.status === 'FULLY_SUPPORTED').length;
  const partiallySupportedCount = results.filter(r => r.status === 'PARTIALLY_SUPPORTED').length;
  const mockedCount = results.filter(r => r.status === 'MOCKED').length;
  const nativeRequiredCount = results.filter(r => r.status === 'REQUIRES_NATIVE_RUNTIME').length;

  return {
    compatibleCount,
    partiallySupportedCount,
    mockedCount,
    nativeRequiredCount,
    packages: results,
    recommendedPlatform: 'ios'
  };
}
