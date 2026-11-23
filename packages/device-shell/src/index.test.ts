import { describe, it, expect } from 'vitest';
import { IPHONE_15_PRO } from '@pocketsim/device-profiles';
import { SensorEngine } from '@pocketsim/sensor-engine';
import { DeviceShellManager } from './index.js';

describe('DeviceShellManager', () => {
  it('initializes with device profile and status bar', () => {
    const manager = new DeviceShellManager(IPHONE_15_PRO);
    const state = manager.getState();
    expect(state.profile.id).toBe('iphone-15-pro');
    expect(state.statusBar.batteryLevel).toBe(95);
    expect(state.keyboard.isOpen).toBe(false);
    manager.destroy();
  });

  it('syncs battery and network from SensorEngine', () => {
    const manager = new DeviceShellManager(IPHONE_15_PRO);
    const sensorEngine = new SensorEngine();

    sensorEngine.setBattery({ level: 0.42, isCharging: true });
    sensorEngine.applyNetworkPreset('cellular_5g');

    manager.syncSensorState(sensorEngine.getState());
    const state = manager.getState();
    expect(state.statusBar.batteryLevel).toBe(42);
    expect(state.statusBar.isCharging).toBe(true);
    expect(state.statusBar.cellularBars).toBe(4);
    manager.destroy();
  });

  it('controls dynamic island and software keyboard', () => {
    const manager = new DeviceShellManager(IPHONE_15_PRO);
    manager.setDynamicIsland({
      mode: 'expanded',
      title: 'Call in progress',
      content: '01:23'
    });
    expect(manager.getState().dynamicIsland.mode).toBe('expanded');

    manager.openKeyboard('email');
    expect(manager.getState().keyboard.isOpen).toBe(true);
    expect(manager.getState().keyboard.layout).toBe('email');

    manager.closeKeyboard();
    expect(manager.getState().keyboard.isOpen).toBe(false);
    manager.destroy();
  });

  it('opens and dismisses system dialogs', () => {
    const manager = new DeviceShellManager(IPHONE_15_PRO);
    manager.showDialog({
      type: 'alert',
      title: 'Test Alert',
      message: 'Hello world',
      actions: [{ label: 'OK', actionId: 'ok' }]
    });

    expect(manager.getState().dialog.isOpen).toBe(true);
    expect(manager.getState().dialog.title).toBe('Test Alert');

    manager.dismissDialog();
    expect(manager.getState().dialog.isOpen).toBe(false);
    manager.destroy();
  });
});
