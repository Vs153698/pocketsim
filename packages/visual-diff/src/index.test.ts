import { describe, it, expect } from 'vitest';
import { IPHONE_15_PRO } from '@pocketsim/device-profiles';
import { ScreenSnapshot } from '@pocketsim/shared-types';
import { VisualDiffEngine } from './index.js';

describe('VisualDiffEngine', () => {
  it('detects added, removed, and moved elements between snapshots', () => {
    const engine = new VisualDiffEngine();

    const baseline: ScreenSnapshot = {
      screenName: 'TestScreen',
      elements: [
        {
          id: 'btn-1',
          testID: 'btn-1',
          role: 'button',
          bounds: { x: 20, y: 100, width: 100, height: 40 },
          normalizedBounds: { x: 0, y: 0, width: 0, height: 0 },
          isActionable: true,
          isEnabled: true,
          isFocused: false
        },
        {
          id: 'btn-delete',
          testID: 'btn-delete',
          role: 'button',
          bounds: { x: 20, y: 200, width: 100, height: 40 },
          normalizedBounds: { x: 0, y: 0, width: 0, height: 0 },
          isActionable: true,
          isEnabled: true,
          isFocused: false
        }
      ],
      activeKeyboard: false,
      metrics: { width: 393, height: 852, pixelRatio: 3 },
      timestamp: Date.now()
    };

    const current: ScreenSnapshot = {
      screenName: 'TestScreen',
      elements: [
        {
          id: 'btn-1',
          testID: 'btn-1',
          role: 'button',
          bounds: { x: 20, y: 140, width: 100, height: 40 }, // moved down 40px
          normalizedBounds: { x: 0, y: 0, width: 0, height: 0 },
          isActionable: true,
          isEnabled: true,
          isFocused: false
        },
        {
          id: 'btn-new',
          testID: 'btn-new',
          role: 'button',
          bounds: { x: 20, y: 250, width: 100, height: 40 }, // new
          normalizedBounds: { x: 0, y: 0, width: 0, height: 0 },
          isActionable: true,
          isEnabled: true,
          isFocused: false
        }
      ],
      activeKeyboard: false,
      metrics: { width: 393, height: 852, pixelRatio: 3 },
      timestamp: Date.now()
    };

    const diff = engine.compareSnapshots(baseline, current, IPHONE_15_PRO);
    expect(diff.hasDifferences).toBe(true);
    expect(diff.addedElements).toContain('btn-new');
    expect(diff.removedElements).toContain('btn-delete');
    expect(diff.movedElements[0].id).toBe('btn-1');
    expect(diff.movedElements[0].deltaY).toBe(40);
  });

  it('detects safe area violations when actionable element intrudes top notch', () => {
    const engine = new VisualDiffEngine();

    const snapshot: ScreenSnapshot = {
      screenName: 'ViolatingScreen',
      elements: [
        {
          id: 'clipped-btn',
          testID: 'clipped-btn',
          role: 'button',
          bounds: { x: 20, y: 30, width: 120, height: 40 }, // y=30 is inside safe area top 59px!
          normalizedBounds: { x: 0, y: 0, width: 0, height: 0 },
          isActionable: true,
          isEnabled: true,
          isFocused: false
        }
      ],
      activeKeyboard: false,
      metrics: { width: 393, height: 852, pixelRatio: 3 },
      timestamp: Date.now()
    };

    const anomalies = engine.checkSafeAreaViolations(snapshot, IPHONE_15_PRO);
    expect(anomalies).toHaveLength(1);
    expect(anomalies[0].type).toBe('SAFE_AREA_VIOLATION');
    expect(anomalies[0].elementId).toBe('clipped-btn');
  });
});
