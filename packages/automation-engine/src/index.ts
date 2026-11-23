import {
  MaestroFlow,
  MaestroStep,
  ScreenSnapshot,
  AccessibilityElement
} from '@pocketsim/shared-types';
import { ReactNativeRuntimeEngine } from '@pocketsim/react-native-runtime';

export interface StepExecutionResult {
  stepIndex: number;
  stepName: string;
  success: boolean;
  durationMs: number;
  error?: string;
}

export interface FlowExecutionReport {
  flowName: string;
  totalSteps: number;
  passedSteps: number;
  failedSteps: number;
  durationMs: number;
  results: StepExecutionResult[];
  status: 'passed' | 'failed';
}

/**
 * Lightweight parser for Maestro YAML test flows without external heavy dependencies.
 */
export function parseMaestroYaml(yamlText: string): MaestroFlow {
  const lines = yamlText.split('\n');
  let flowName = 'Unnamed Flow';
  let device: string | undefined;
  const steps: MaestroStep[] = [];

  let inSteps = false;
  let currentStep: any = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) continue;

    if (!inSteps && line.startsWith('name:')) {
      flowName = line.replace('name:', '').trim().replace(/^["']|["']$/g, '');
      continue;
    }

    if (!inSteps && line.startsWith('device:')) {
      device = line.replace('device:', '').trim().replace(/^["']|["']$/g, '');
      continue;
    }

    if (line.startsWith('steps:')) {
      inSteps = true;
      continue;
    }

    if (inSteps) {
      if (line.startsWith('- launchApp')) {
        steps.push({ launchApp: true });
      } else if (line.startsWith('- tapOn:')) {
        currentStep = { tapOn: {} };
        steps.push(currentStep);
      } else if (line.startsWith('- assertVisible:')) {
        currentStep = { assertVisible: {} };
        steps.push(currentStep);
      } else if (line.startsWith('- assertNotVisible:')) {
        currentStep = { assertNotVisible: {} };
        steps.push(currentStep);
      } else if (line.startsWith('- inputText:')) {
        currentStep = { inputText: { text: '' } };
        steps.push(currentStep);
      } else if (line.startsWith('- waitFor:')) {
        currentStep = { waitFor: {} };
        steps.push(currentStep);
      } else if (line.startsWith('- takeScreenshot:')) {
        currentStep = { takeScreenshot: { name: 'screenshot' } };
        steps.push(currentStep);
      } else if (line.startsWith('text:') && currentStep) {
        const val = line.replace('text:', '').trim().replace(/^["']|["']$/g, '');
        if (currentStep.tapOn) currentStep.tapOn.text = val;
        else if (currentStep.assertVisible) currentStep.assertVisible.text = val;
        else if (currentStep.assertNotVisible) currentStep.assertNotVisible.text = val;
        else if (currentStep.inputText) currentStep.inputText.text = val;
        else if (currentStep.waitFor) currentStep.waitFor.text = val;
      } else if (line.startsWith('id:') && currentStep) {
        const val = line.replace('id:', '').trim().replace(/^["']|["']$/g, '');
        if (currentStep.tapOn) currentStep.tapOn.id = val;
        else if (currentStep.assertVisible) currentStep.assertVisible.id = val;
        else if (currentStep.assertNotVisible) currentStep.assertNotVisible.id = val;
        else if (currentStep.waitFor) currentStep.waitFor.id = val;
      } else if (line.startsWith('name:') && currentStep?.takeScreenshot) {
        currentStep.takeScreenshot.name = line.replace('name:', '').trim().replace(/^["']|["']$/g, '');
      }
    }
  }

  return { name: flowName, device, steps };
}

export class MaestroRunner {
  public async executeFlow(flow: MaestroFlow, runtime: ReactNativeRuntimeEngine): Promise<FlowExecutionReport> {
    const startTime = Date.now();
    const results: StepExecutionResult[] = [];

    for (let i = 0; i < flow.steps.length; i++) {
      const step = flow.steps[i];
      const stepStart = Date.now();
      let stepName = 'unknown';
      let success = true;
      let error: string | undefined;

      try {
        if (step.launchApp) {
          stepName = 'launchApp';
          runtime.recalculateAndCommit();
        } else if (step.tapOn) {
          stepName = `tapOn (${step.tapOn.text || step.tapOn.id})`;
          const tapResult = runtime.tapElement({
            testID: step.tapOn.id,
            text: step.tapOn.text
          });
          if (!tapResult.success) {
            success = false;
            error = `Element not found for tap: ${JSON.stringify(step.tapOn)}`;
          }
        } else if (step.inputText) {
          stepName = `inputText ("${step.inputText.text}")`;
          // Target focused element or first TextInput
          const snapshot = runtime.getAccessibilitySnapshot();
          const target = snapshot.elements.find(e => e.role === 'searchbox' || e.role === 'textinput');
          if (target) {
            runtime.typeText({ testID: target.testID || target.id }, step.inputText.text);
          } else {
            success = false;
            error = 'No active TextInput found for inputText';
          }
        } else if (step.assertVisible) {
          stepName = `assertVisible (${step.assertVisible.text || step.assertVisible.id})`;
          const snapshot = runtime.getAccessibilitySnapshot();
          const exists = this.findElementInSnapshot(snapshot, step.assertVisible.text, step.assertVisible.id);
          if (!exists) {
            success = false;
            error = `Assertion failed: element with ${JSON.stringify(step.assertVisible)} is not visible`;
          }
        } else if (step.assertNotVisible) {
          stepName = `assertNotVisible (${step.assertNotVisible.text || step.assertNotVisible.id})`;
          const snapshot = runtime.getAccessibilitySnapshot();
          const exists = this.findElementInSnapshot(snapshot, step.assertNotVisible.text, step.assertNotVisible.id);
          if (exists) {
            success = false;
            error = `Assertion failed: element with ${JSON.stringify(step.assertNotVisible)} is unexpectedly visible`;
          }
        } else if (step.waitFor) {
          stepName = `waitFor (${step.waitFor.text || step.waitFor.id})`;
          const snapshot = runtime.getAccessibilitySnapshot();
          const exists = this.findElementInSnapshot(snapshot, step.waitFor.text, step.waitFor.id);
          if (!exists) {
            success = false;
            error = `Wait condition failed for ${JSON.stringify(step.waitFor)}`;
          }
        } else if (step.takeScreenshot) {
          stepName = `takeScreenshot (${step.takeScreenshot.name})`;
          // Simulated screenshot success
        }
      } catch (err: any) {
        success = false;
        error = err?.message || 'Execution error';
      }

      const durationMs = Date.now() - stepStart;
      results.push({
        stepIndex: i + 1,
        stepName,
        success,
        durationMs,
        error
      });

      if (!success) {
        break; // Stop flow on failure
      }
    }

    const passedSteps = results.filter(r => r.success).length;
    const failedSteps = results.filter(r => !r.success).length;

    return {
      flowName: flow.name,
      totalSteps: flow.steps.length,
      passedSteps,
      failedSteps,
      durationMs: Date.now() - startTime,
      results,
      status: failedSteps === 0 ? 'passed' : 'failed'
    };
  }

  private findElementInSnapshot(snapshot: ScreenSnapshot, text?: string, id?: string): boolean {
    const textQuery = text?.toLowerCase().trim();

    function search(elem: AccessibilityElement): boolean {
      if (id && (elem.testID === id || elem.id === id)) return true;
      if (textQuery) {
        if (elem.text && elem.text.toLowerCase().includes(textQuery)) return true;
        if (elem.label && elem.label.toLowerCase().includes(textQuery)) return true;
      }
      if (elem.children) {
        for (const child of elem.children) {
          if (search(child)) return true;
        }
      }
      return false;
    }

    for (const elem of snapshot.elements) {
      if (search(elem)) return true;
    }
    return false;
  }
}
