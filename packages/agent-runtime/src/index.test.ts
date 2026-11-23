import { describe, it, expect } from 'vitest';
import { POCKETSIM_MCP_TOOLS, McpToolDispatcher } from './index.js';

describe('McpToolDispatcher', () => {
  it('registers all required PocketSim MCP tools', () => {
    const dispatcher = new McpToolDispatcher();
    const tools = dispatcher.getTools();
    const names = tools.map(t => t.name);

    expect(names).toContain('pocketsim_describe_screen');
    expect(names).toContain('pocketsim_get_accessibility_tree');
    expect(names).toContain('pocketsim_tap_element');
    expect(names).toContain('pocketsim_type_text');
    expect(names).toContain('pocketsim_set_sensor_value');
    expect(names).toContain('pocketsim_set_permission');
    expect(names).toContain('pocketsim_run_test_flow');
  });
});
