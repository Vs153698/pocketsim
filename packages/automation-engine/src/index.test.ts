import { describe, it, expect, vi } from 'vitest';
import { IPHONE_15_PRO } from '@pocketsim/device-profiles';
import { ReactNativeRuntimeEngine } from '@pocketsim/react-native-runtime';
import { parseMaestroYaml, MaestroRunner } from './index.js';

describe('Maestro Automation Engine', () => {
  it('parses Maestro YAML workflow into structured steps', () => {
    const yaml = `
name: Login Flow
device: iphone-15-pro

steps:
  - launchApp
  - waitFor:
      text: Welcome
  - tapOn:
      text: Sign in
  - inputText:
      text: test@example.com
  - assertVisible:
      text: Dashboard
  - takeScreenshot:
      name: dashboard
`;

    const flow = parseMaestroYaml(yaml);
    expect(flow.name).toBe('Login Flow');
    expect(flow.device).toBe('iphone-15-pro');
    expect(flow.steps).toHaveLength(6);
    expect(flow.steps[0].launchApp).toBe(true);
    expect(flow.steps[1].waitFor?.text).toBe('Welcome');
    expect(flow.steps[2].tapOn?.text).toBe('Sign in');
    expect(flow.steps[3].inputText?.text).toBe('test@example.com');
  });

  it('executes flow against running runtime engine and asserts screen elements', async () => {
    const runtime = new ReactNativeRuntimeEngine({ profile: IPHONE_15_PRO });

    // Mount initial welcome screen
    const welcomeText = runtime.createElement('Text', {}, {}, 'Welcome');
    runtime.mountRootChild(welcomeText.id);

    const btn = runtime.createElement('Pressable', {
      testID: 'signin-btn',
      onPress: () => {
        // Upon click, mount Dashboard
        const dash = runtime.createElement('Text', {}, {}, 'Dashboard');
        runtime.mountRootChild(dash.id);
      }
    }, {}, 'Sign in');
    runtime.mountRootChild(btn.id);
    runtime.recalculateAndCommit();

    const yaml = `
name: Successful Auth
steps:
  - launchApp
  - assertVisible:
      text: Welcome
  - tapOn:
      text: Sign in
  - assertVisible:
      text: Dashboard
`;

    const flow = parseMaestroYaml(yaml);
    const runner = new MaestroRunner();
    const report = await runner.executeFlow(flow, runtime);

    expect(report.status).toBe('passed');
    expect(report.passedSteps).toBe(4);
    expect(report.failedSteps).toBe(0);
  });
});
