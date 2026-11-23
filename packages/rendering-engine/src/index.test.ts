import { describe, it, expect } from 'vitest';
import { IPHONE_15_PRO } from '@pocketsim/device-profiles';
import { DeviceShellManager } from '@pocketsim/device-shell';
import { RenderTree } from '@pocketsim/shared-types';
import { Compositor, DamageTracker } from './index.js';

describe('DamageTracker', () => {
  it('aggregates dirty bounding rectangles', () => {
    const tracker = new DamageTracker();
    tracker.markDirty({ x: 10, y: 20, width: 50, height: 50 });
    tracker.markDirty({ x: 40, y: 60, width: 80, height: 30 });

    const damage = tracker.getDamageRect();
    expect(damage).toBeDefined();
    expect(damage?.x).toBe(10);
    expect(damage?.y).toBe(20);
    expect(damage?.width).toBe(110); // 10 to 120
    expect(damage?.height).toBe(70);  // 20 to 90
  });
});

describe('Compositor', () => {
  it('compiles multi-layer draw command stream', () => {
    const compositor = new Compositor();
    const shellManager = new DeviceShellManager(IPHONE_15_PRO);

    const mockRenderTree: RenderTree = {
      rootId: 'root',
      nodes: {
        root: {
          id: 'root',
          type: 'Root',
          parentId: null,
          children: ['btn'],
          layout: { x: 0, y: 0, width: 393, height: 852 },
          style: { backgroundColor: '#121212' },
          props: {}
        },
        btn: {
          id: 'btn',
          type: 'Pressable',
          parentId: 'root',
          children: [],
          layout: { x: 20, y: 100, width: 120, height: 44 },
          style: { backgroundColor: '#007AFF', borderRadius: 8 },
          props: {}
        }
      },
      viewport: { width: 393, height: 852, scale: 3 },
      timestamp: Date.now()
    };

    const commands = compositor.compileFrame(mockRenderTree, shellManager.getState());

    expect(commands.length).toBeGreaterThanOrEqual(4);
    const types = commands.map(c => c.type);
    expect(types).toContain('CLIP_ROUNDED_RECT');
    expect(types).toContain('FILL_RECT');
    expect(types).toContain('STATUS_BAR');
    expect(types).toContain('DYNAMIC_ISLAND');
    expect(types).toContain('HOME_INDICATOR');

    shellManager.destroy();
  });

  it('generates liquid glass draw command with highlights and backdrop filter', () => {
    const compositor = new Compositor();
    const glass = compositor.createLiquidGlassSurface({ x: 16, y: 700, width: 361, height: 64 });
    expect(glass.type).toBe('LIQUID_GLASS_SURFACE');
    expect(glass.style?.backdropFilter).toContain('blur');
    expect(glass.style?.specularHighlight).toBeDefined();
  });
});
