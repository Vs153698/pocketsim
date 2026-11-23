import { describe, it, expect, vi } from 'vitest';
import { SensorEngine } from './index.js';

describe('SensorEngine', () => {
  it('initializes with default location and battery', () => {
    const engine = new SensorEngine();
    const state = engine.getState();
    expect(state.location.latitude).toBeCloseTo(37.7749);
    expect(state.battery.level).toBe(0.95);
    expect(state.network.isConnected).toBe(true);
  });

  it('notifies subscribers on location update', () => {
    const engine = new SensorEngine();
    const listener = vi.fn();
    const unsubscribe = engine.subscribe(listener);

    engine.setLocation({ latitude: 40.7128, longitude: -74.006 });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(engine.getState().location.latitude).toBe(40.7128);

    unsubscribe();
    engine.setLocation({ latitude: 51.5074 });
    expect(listener).toHaveBeenCalledTimes(1); // not called after unsubscribe
  });

  it('parses GPX tracks and sets route', () => {
    const engine = new SensorEngine();
    const sampleGpx = `<?xml version="1.0" encoding="UTF-8"?>
      <gpx version="1.1">
        <trk><trkseg>
          <trkpt lat="37.7749" lon="-122.4194"><ele>10.5</ele></trkpt>
          <trkpt lat="37.7752" lon="-122.4180"><ele>11.0</ele></trkpt>
        </trkseg></trk>
      </gpx>`;

    const route = engine.loadGpxRoute(sampleGpx);
    expect(route).toHaveLength(2);
    expect(route[0].latitude).toBe(37.7749);
    expect(route[0].altitude).toBe(10.5);
    expect(route[1].latitude).toBe(37.7752);
  });

  it('applies network presets and scenarios', () => {
    const engine = new SensorEngine();
    engine.applyNetworkPreset('offline');
    expect(engine.getState().network.isConnected).toBe(false);
    expect(engine.getState().network.packetLossPercent).toBe(100);

    engine.applyScenario('low_battery');
    expect(engine.getState().battery.level).toBe(0.08);
    expect(engine.getState().battery.lowPowerMode).toBe(true);
  });

  it('resets to clean state', () => {
    const engine = new SensorEngine();
    engine.setLocation({ latitude: 0, longitude: 0 });
    engine.applyNetworkPreset('offline');
    engine.reset();

    expect(engine.getState().location.latitude).toBeCloseTo(37.7749);
    expect(engine.getState().network.isConnected).toBe(true);
  });
});
