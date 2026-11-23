import { describe, it, expect, vi } from 'vitest';
import { PermissionEngine } from './index.js';

describe('PermissionEngine', () => {
  it('initializes with not_requested default state', () => {
    const engine = new PermissionEngine();
    expect(engine.getStatus('location')).toBe('not_requested');
    expect(engine.getStatus('camera')).toBe('not_requested');
  });

  it('sets permission and fires change listeners', () => {
    const engine = new PermissionEngine();
    const listener = vi.fn();
    engine.subscribeChange(listener);

    engine.setPermission('camera', 'granted');
    expect(engine.getStatus('camera')).toBe('granted');
    expect(listener).toHaveBeenCalledWith('camera', 'granted', expect.any(Object));
  });

  it('resolves interactive prompt', async () => {
    const engine = new PermissionEngine();
    let capturedPromptId = '';

    engine.subscribePrompt((prompt) => {
      capturedPromptId = prompt.id;
      // Simulate user clicking "Allow While Using App"
      setTimeout(() => {
        engine.resolvePrompt(capturedPromptId, 'while_using');
      }, 10);
    });

    const status = await engine.requestPermission('location');
    expect(status).toBe('granted');
    expect(engine.getStatus('location')).toBe('granted');
  });

  it('resets permissions back to not_requested', () => {
    const engine = new PermissionEngine();
    engine.setPermission('microphone', 'granted');
    engine.resetAll();
    expect(engine.getStatus('microphone')).toBe('not_requested');
  });
});
