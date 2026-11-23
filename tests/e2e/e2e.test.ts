import { describe, it, expect } from 'vitest';
import { IPHONE_15_PRO, PIXEL_8 } from '@pocketsim/device-profiles';
import { ReactNativeRuntimeEngine } from '@pocketsim/react-native-runtime';
import { MaestroRunner, parseMaestroYaml } from '@pocketsim/automation-engine';
import { LocalBridgeServer } from '@pocketsim/local-bridge';
import { QARunner } from '@pocketsim/cli';
import fs from 'node:fs';

describe('End-to-End PocketSim Verification', () => {
  it('executes Maestro YAML authentication test flow', async () => {
    const yaml = fs.readFileSync('tests/e2e/auth-flow.yaml', 'utf8');
    const flow = parseMaestroYaml(yaml);
    expect(flow.name).toBe('Complex App Authentication & Dashboard Test');

    const runtime = new ReactNativeRuntimeEngine({ profile: IPHONE_15_PRO });

    // Mount Auth screen
    const header = runtime.createElement('Text', {}, {}, 'Sign In to Dashboard');
    runtime.mountRootChild(header.id);

    const input = runtime.createElement('TextInput', { testID: 'email-input' }, { width: 300, height: 44 });
    runtime.mountRootChild(input.id);

    const continueBtn = runtime.createElement('Pressable', {
      testID: 'continue-btn',
      onPress: () => {
        // Transition to Dashboard
        const dash = runtime.createElement('Text', {}, {}, 'Dashboard');
        runtime.mountRootChild(dash.id);

        const product = runtime.createElement('Text', {}, {}, 'PocketSim Cloud Suite');
        runtime.mountRootChild(product.id);
      }
    }, {}, 'Continue');
    runtime.mountRootChild(continueBtn.id);

    runtime.recalculateAndCommit();

    const runner = new MaestroRunner();
    const report = await runner.executeFlow(flow, runtime);

    expect(report.status).toBe('passed');
    expect(report.passedSteps).toBe(flow.steps.length);
    expect(report.failedSteps).toBe(0);
  });

  it('runs complete 25-step QA suite with zero failures', async () => {
    const qa = new QARunner();
    const report = await qa.runFullQA();

    expect(report.coverageSummary.overallStatus).toBe('PASSED');
    expect(report.hardwareSimulation.gpsVerified).toBe(true);
    expect(report.hardwareSimulation.batteryVerified).toBe(true);
    expect(report.hardwareSimulation.networkConditioningVerified).toBe(true);
    expect(report.hardwareSimulation.permissionsVerified).toBe(true);
  });
});
