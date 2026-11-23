export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
}

export const POCKETSIM_MCP_TOOLS: McpToolDefinition[] = [
  {
    name: 'pocketsim_describe_screen',
    description: 'Returns a structured semantic overview of the active virtual mobile screen.',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', description: 'Target session ID (optional if only 1 active session)' }
      }
    }
  },
  {
    name: 'pocketsim_get_accessibility_tree',
    description: 'Retrieves the complete hierarchical accessibility tree with normalized coordinates.',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', description: 'Target session ID' }
      }
    }
  },
  {
    name: 'pocketsim_tap_element',
    description: 'Dispatches an authentic native tap touch event sequence onto an element by testID, text or coordinates.',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string' },
        testID: { type: 'string' },
        text: { type: 'string' },
        coordinates: {
          type: 'object',
          properties: { x: { type: 'number' }, y: { type: 'number' } }
        }
      }
    }
  },
  {
    name: 'pocketsim_type_text',
    description: 'Types text into a focused or targeted TextInput element.',
    inputSchema: {
      type: 'object',
      required: ['text'],
      properties: {
        sessionId: { type: 'string' },
        testID: { type: 'string' },
        text: { type: 'string' },
        clearBefore: { type: 'boolean' }
      }
    }
  },
  {
    name: 'pocketsim_set_sensor_value',
    description: 'Updates simulated hardware sensors (GPS coordinates, battery level, network condition).',
    inputSchema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string' },
        location: {
          type: 'object',
          properties: { latitude: { type: 'number' }, longitude: { type: 'number' } }
        },
        battery: {
          type: 'object',
          properties: { level: { type: 'number' }, isCharging: { type: 'boolean' } }
        },
        networkPreset: {
          type: 'string',
          enum: ['wifi', 'cellular_5g', 'cellular_4g', 'slow_2g', 'offline']
        }
      }
    }
  },
  {
    name: 'pocketsim_set_permission',
    description: 'Modifies permission status (granted, denied, etc.) for a specified mobile capability.',
    inputSchema: {
      type: 'object',
      required: ['type', 'status'],
      properties: {
        sessionId: { type: 'string' },
        type: { type: 'string' },
        status: { type: 'string', enum: ['granted', 'denied', 'denied_permanently', 'not_requested'] }
      }
    }
  },
  {
    name: 'pocketsim_run_test_flow',
    description: 'Executes a Maestro-compatible YAML test flow on the active virtual device.',
    inputSchema: {
      type: 'object',
      required: ['yamlContent'],
      properties: {
        sessionId: { type: 'string' },
        yamlContent: { type: 'string' }
      }
    }
  }
];

export class McpToolDispatcher {
  private bridgeBaseUrl: string;

  constructor(bridgeBaseUrl: string = 'http://127.0.0.1:7868') {
    this.bridgeBaseUrl = bridgeBaseUrl;
  }

  public getTools(): McpToolDefinition[] {
    return POCKETSIM_MCP_TOOLS;
  }

  public async callTool(name: string, args: Record<string, any>): Promise<any> {
    const sessionId = args.sessionId || (await this.resolveDefaultSessionId());

    switch (name) {
      case 'pocketsim_describe_screen': {
        const res = await fetch(`${this.bridgeBaseUrl}/sessions/${sessionId}/describe`);
        return await res.json();
      }
      case 'pocketsim_get_accessibility_tree': {
        const res = await fetch(`${this.bridgeBaseUrl}/sessions/${sessionId}/tree`);
        return await res.json();
      }
      case 'pocketsim_tap_element': {
        const res = await fetch(`${this.bridgeBaseUrl}/sessions/${sessionId}/tap`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args)
        });
        return await res.json();
      }
      case 'pocketsim_type_text': {
        const res = await fetch(`${this.bridgeBaseUrl}/sessions/${sessionId}/type`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args)
        });
        return await res.json();
      }
      case 'pocketsim_set_sensor_value': {
        const res = await fetch(`${this.bridgeBaseUrl}/sessions/${sessionId}/sensors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args)
        });
        return await res.json();
      }
      case 'pocketsim_set_permission': {
        const res = await fetch(`${this.bridgeBaseUrl}/sessions/${sessionId}/permissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args)
        });
        return await res.json();
      }
      default:
        throw new Error(`Unknown PocketSim MCP tool: ${name}`);
    }
  }

  private async resolveDefaultSessionId(): Promise<string> {
    const res = await fetch(`${this.bridgeBaseUrl}/sessions`);
    const data = await res.json();
    if (!data.sessions || data.sessions.length === 0) {
      throw new Error('No active PocketSim session found. Start PocketSim with "pocketsim dev"');
    }
    return data.sessions[0].id;
  }
}
