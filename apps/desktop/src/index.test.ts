import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { DesktopServer } from './server.js';

describe('DesktopServer', () => {
  const server = new DesktopServer({ port: 7891 });

  beforeAll(async () => {
    await server.start();
  });

  afterAll(async () => {
    await server.stop();
  });

  it('serves the PocketSim Dark-first desktop HTML application', async () => {
    const res = await fetch(server.getUrl());
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('PocketSim — Virtual Mobile Development Environment');
    expect(html).toContain('device-frame');
    expect(html).toContain('dynamic-island');
  });
});
