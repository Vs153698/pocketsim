import { describe, it, expect, vi } from 'vitest';
import { IPHONE_15_PRO, PIXEL_8 } from '@pocketsim/device-profiles';
import { RuntimeMessageBus, FourContextCoordinator } from './index.js';

describe('RuntimeMessageBus', () => {
  it('dispatches and receives messages by type and wildcard', () => {
    const bus = new RuntimeMessageBus();
    const handler = vi.fn();
    const wildcard = vi.fn();

    bus.subscribe('INPUT_EVENT', handler);
    bus.subscribe('*', wildcard);

    const msg = bus.dispatch({
      source: 'host',
      target: 'tenant',
      type: 'INPUT_EVENT',
      payload: { x: 100, y: 200 }
    });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(msg);
    expect(wildcard).toHaveBeenCalledTimes(1);
    expect(bus.getRecentMessages()).toHaveLength(1);
  });
});

describe('FourContextCoordinator', () => {
  it('initializes and synchronizes sensor changes', () => {
    const coordinator = new FourContextCoordinator(IPHONE_15_PRO);
    const syncListener = vi.fn();
    coordinator.bus.subscribe('SENSOR_SYNC', syncListener);

    coordinator.sensorEngine.setLocation({ latitude: 12.9716, longitude: 77.5946 });
    expect(syncListener).toHaveBeenCalledTimes(1);
    expect(syncListener.mock.calls[0][0].payload.location.latitude).toBe(12.9716);
  });

  it('updates device profile and notifies contexts', () => {
    const coordinator = new FourContextCoordinator(IPHONE_15_PRO);
    const profileListener = vi.fn();
    coordinator.bus.subscribe('DEVICE_PROFILE_CHANGE', profileListener);

    coordinator.setDeviceProfile(PIXEL_8);
    expect(coordinator.getDeviceProfile().id).toBe('pixel-8');
    expect(profileListener).toHaveBeenCalledTimes(1);
  });

  it('records logs via CONSOLE_LOG message', () => {
    const coordinator = new FourContextCoordinator(IPHONE_15_PRO);
    coordinator.bus.dispatch({
      source: 'tenant',
      target: 'host',
      type: 'CONSOLE_LOG',
      payload: { message: 'React Native initialized', level: 'info' }
    });

    const logs = coordinator.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].message).toBe('React Native initialized');
  });
});
