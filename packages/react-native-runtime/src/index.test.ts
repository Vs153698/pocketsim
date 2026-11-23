import { describe, it, expect, vi } from 'vitest';
import { IPHONE_15_PRO } from '@pocketsim/device-profiles';
import { ReactNativeRuntimeEngine } from './index.js';

describe('ReactNativeRuntimeEngine', () => {
  it('mounts components and computes flexbox layout', () => {
    const runtime = new ReactNativeRuntimeEngine({ profile: IPHONE_15_PRO });

    // Build container
    const container = runtime.createElement(
      'View',
      { testID: 'main-container' },
      { flex: 1, flexDirection: 'column', padding: 20, backgroundColor: '#1E1E1E' }
    );
    runtime.mountRootChild(container.id);

    // Build header text
    const header = runtime.createElement(
      'Text',
      { testID: 'header-title' },
      { fontSize: 24, color: '#FFFFFF', marginBottom: 16 },
      'Welcome to PocketSim'
    );
    runtime.vdom.appendChild(container.id, header.id);

    // Build button
    const onPressMock = vi.fn();
    const button = runtime.createElement(
      'Pressable',
      { testID: 'action-btn', onPress: onPressMock },
      { width: 200, height: 48, backgroundColor: '#007AFF', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }
    );
    runtime.vdom.appendChild(container.id, button.id);

    const buttonText = runtime.createElement(
      'Text',
      {},
      { color: '#FFFFFF', fontSize: 16 },
      'Get Started'
    );
    runtime.vdom.appendChild(button.id, buttonText.id);

    const renderTree = runtime.recalculateAndCommit();
    expect(renderTree).toBeDefined();

    // Verify layout coordinates
    const btnNode = runtime.vdom.getNode(button.id);
    expect(btnNode?.layout.width).toBe(200);
    expect(btnNode?.layout.height).toBe(48);
    expect(btnNode?.layout.x).toBe(20); // padding 20
  });

  it('generates semantic accessibility tree for AI inspection', () => {
    const runtime = new ReactNativeRuntimeEngine({ profile: IPHONE_15_PRO });
    runtime.setScreenTitle('LoginScreen');

    const input = runtime.createElement(
      'TextInput',
      { testID: 'email-input', accessibilityLabel: 'Email Address', value: '' },
      { width: 300, height: 44 }
    );
    runtime.mountRootChild(input.id);

    const snapshot = runtime.getAccessibilitySnapshot();
    expect(snapshot.screenName).toBe('LoginScreen');
    expect(snapshot.elements.length).toBeGreaterThanOrEqual(1);

    const found = snapshot.elements.find(e => e.testID === 'email-input');
    expect(found).toBeDefined();
    expect(found?.label).toBe('Email Address');
    expect(found?.isActionable).toBe(true);
    expect(found?.bounds.width).toBe(300);
    expect(found?.normalizedBounds.width).toBeCloseTo(300 / IPHONE_15_PRO.width);
  });

  it('simulates tap interaction and executes onPress handler', () => {
    const runtime = new ReactNativeRuntimeEngine({ profile: IPHONE_15_PRO });
    const onPressMock = vi.fn();

    const button = runtime.createElement(
      'Pressable',
      { testID: 'submit-btn', onPress: onPressMock },
      { width: 150, height: 40 }
    );
    runtime.mountRootChild(button.id);
    runtime.recalculateAndCommit();

    const result = runtime.tapElement({ testID: 'submit-btn' });
    expect(result.success).toBe(true);
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('simulates text input and dispatches onChangeText', () => {
    const runtime = new ReactNativeRuntimeEngine({ profile: IPHONE_15_PRO });
    const onChangeMock = vi.fn();

    const input = runtime.createElement(
      'TextInput',
      { testID: 'username-input', onChangeText: onChangeMock, value: '' },
      { width: 250, height: 40 }
    );
    runtime.mountRootChild(input.id);
    runtime.recalculateAndCommit();

    const success = runtime.typeText({ testID: 'username-input' }, 'vaibhav');
    expect(success).toBe(true);
    expect(onChangeMock).toHaveBeenCalledWith('vaibhav');

    const inputNode = runtime.vdom.getNode(input.id);
    expect(inputNode?.props.value).toBe('vaibhav');
  });
});
