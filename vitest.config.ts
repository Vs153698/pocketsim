import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@pocketsim/shared-types': path.resolve(__dirname, 'packages/shared-types/src/index.ts'),
      '@pocketsim/device-profiles': path.resolve(__dirname, 'packages/device-profiles/src/index.ts'),
      '@pocketsim/sensor-engine': path.resolve(__dirname, 'packages/sensor-engine/src/index.ts'),
      '@pocketsim/permission-engine': path.resolve(__dirname, 'packages/permission-engine/src/index.ts'),
      '@pocketsim/runtime-core': path.resolve(__dirname, 'packages/runtime-core/src/index.ts'),
      '@pocketsim/native-module-registry': path.resolve(__dirname, 'packages/native-module-registry/src/index.ts'),
      '@pocketsim/react-native-runtime': path.resolve(__dirname, 'packages/react-native-runtime/src/index.ts'),
      '@pocketsim/device-shell': path.resolve(__dirname, 'packages/device-shell/src/index.ts'),
      '@pocketsim/rendering-engine': path.resolve(__dirname, 'packages/rendering-engine/src/index.ts'),
      '@pocketsim/visual-diff': path.resolve(__dirname, 'packages/visual-diff/src/index.ts'),
      '@pocketsim/local-bridge': path.resolve(__dirname, 'packages/local-bridge/src/index.ts'),
      '@pocketsim/automation-engine': path.resolve(__dirname, 'packages/automation-engine/src/index.ts'),
      '@pocketsim/agent-runtime': path.resolve(__dirname, 'packages/agent-runtime/src/index.ts'),
      '@pocketsim/cli': path.resolve(__dirname, 'packages/cli/src/index.ts')
    }
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**']
  }
});
