import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { LocalBridgeServer } from './index.js';

describe('LocalBridgeServer Integration', () => {
  const TEST_PORT = 7899;
  const bridge = new LocalBridgeServer('127.0.0.1', TEST_PORT);
  const baseUrl = `http://127.0.0.1:${TEST_PORT}`;

  beforeAll(async () => {
    await bridge.start();
  });

  afterAll(async () => {
    await bridge.stop();
  });

  it('responds to GET /health with status ok', async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(data.version).toBe('0.1.0');
  });

  it('creates a session and claims agent lease', async () => {
    const createRes = await fetch(`${baseUrl}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceProfileId: 'iphone-15-pro' })
    });
    expect(createRes.status).toBe(201);
    const { session } = await createRes.json();
    expect(session.id).toBeDefined();

    // Agent 1 claims session
    const claimRes = await fetch(`${baseUrl}/sessions/${session.id}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: 'agent-alpha', ttlMs: 30000 })
    });
    expect(claimRes.status).toBe(200);
    const claimData = await claimRes.json();
    expect(claimData.success).toBe(true);
    expect(claimData.leaseId).toBeDefined();

    // Agent 2 attempts claim while locked -> rejected with 409
    const conflictRes = await fetch(`${baseUrl}/sessions/${session.id}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: 'agent-beta', ttlMs: 30000 })
    });
    expect(conflictRes.status).toBe(409);

    // Agent 1 releases lease
    const releaseRes = await fetch(`${baseUrl}/sessions/${session.id}/release`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leaseId: claimData.leaseId })
    });
    expect(releaseRes.status).toBe(200);
  });

  it('inspects screen and modifies sensors over HTTP', async () => {
    const createRes = await fetch(`${baseUrl}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceProfileId: 'pixel-8' })
    });
    const { session } = await createRes.json();

    // Describe
    const descRes = await fetch(`${baseUrl}/sessions/${session.id}/describe`);
    expect(descRes.status).toBe(200);
    const desc = await descRes.json();
    expect(desc.metrics.width).toBe(412); // Pixel 8 width

    // Set Sensor
    const sensorRes = await fetch(`${baseUrl}/sessions/${session.id}/sensors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: { latitude: 28.6139, longitude: 77.2090 },
        battery: { level: 0.88, isCharging: true }
      })
    });
    expect(sensorRes.status).toBe(200);
    const sensorData = await sensorRes.json();
    expect(sensorData.state.location.latitude).toBe(28.6139);
    expect(sensorData.state.battery.level).toBe(0.88);
  });
});
