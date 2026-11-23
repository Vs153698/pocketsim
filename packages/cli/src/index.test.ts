import { describe, it, expect } from 'vitest';
import { detectProject } from './detector.js';
import { checkProjectCompatibility } from './compat-checker.js';
import { QARunner } from './qa-runner.js';

describe('PocketSim CLI Core', () => {
  it('detects current monorepo project info', () => {
    const info = detectProject();
    expect(info.projectName).toBeDefined();
    expect(info.packageManager).toBe('pnpm');
    expect(info.dependencies).toBeDefined();
  });

  it('runs compatibility check against known React Native / Expo packages', () => {
    const mockProject = {
      isReactNative: true,
      isExpo: true,
      packageManager: 'pnpm' as const,
      projectName: 'TestApp',
      projectPath: '/tmp/test',
      metroPort: 8081,
      entryPoint: 'App',
      dependencies: {
        'react-native': '0.76.0',
        'expo': '^51.0.0',
        'expo-location': '^17.0.0',
        'expo-battery': '^8.0.0',
        'react-native-safe-area-context': '^4.10.0'
      }
    };

    const report = checkProjectCompatibility(mockProject);
    expect(report.compatibleCount).toBe(5);
    expect(report.nativeRequiredCount).toBe(0);
    expect(report.packages).toHaveLength(5);
  });

  it('runs full QA suite producing a 25-step verification report', async () => {
    const runner = new QARunner();
    const report = await runner.runFullQA();

    expect(report.coverageSummary.overallStatus).toBe('PASSED');
    expect(report.hardwareSimulation.gpsVerified).toBe(true);
    expect(report.hardwareSimulation.batteryVerified).toBe(true);
    expect(report.hardwareSimulation.networkConditioningVerified).toBe(true);
    expect(report.runtimeChecks.initialRender).toBe(true);
  });
});
