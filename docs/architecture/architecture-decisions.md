# Architectural Decision Records (ADRs) - PocketSim

## ADR-001: Monorepo Architecture & Package Management
- **Status**: Accepted
- **Context**: PocketSim consists of runtime engines, UI shells, local daemons, CLI tools, and desktop/web applications that share data models, protocol definitions, and test utilities.
- **Decision**: Use `pnpm` workspaces combined with `Turborepo` for rapid caching, task orchestration, and clean package boundaries. Maintain strict package separation between `@pocketsim/shared-types`, `@pocketsim/runtime-core`, `@pocketsim/react-native-runtime`, `@pocketsim/rendering-engine`, `@pocketsim/device-shell`, `@pocketsim/sensor-engine`, `@pocketsim/permission-engine`, `@pocketsim/local-bridge`, and `@pocketsim/cli`.
- **Consequences**: Fast builds, shared types without code duplication, easy packaging into standalone CLI or Tauri desktop bundles.

## ADR-002: Four-Context Execution Model
- **Status**: Accepted
- **Context**: Executing React Native bundles directly on the main UI thread causes UI freezes during heavy layout or script execution. Conversely, full emulation (QEMU/AVD) takes gigabytes of RAM and minutes to boot.
- **Decision**: Adopt a Four-Context execution model:
  1. **Host Context**: Window management, input capture, UI dev panels, IPC router.
  2. **Tenant Worker**: React Native bundle execution, React reconciler, Yoga layout engine, virtual shadow tree.
  3. **Shell Worker**: Status bar, gestures, keyboard animation, system dialogs.
  4. **Compositor Worker**: OffscreenCanvas rasterization (Skia/CanvasKit with WebGL/Canvas2D fallback), layer compositing, damage rectangle tracking.
- **Consequences**: Near-instant boot (<2s), high responsiveness (60+ FPS UI even when JS thread is busy), and robust crash isolation (a crash in user JS does not bring down the simulator shell).

## ADR-003: Communication Protocol: Ring Buffer & MessageChannel Fallback
- **Status**: Accepted
- **Context**: High-frequency touch events and 60/120 Hz frame updates require low-latency inter-worker messaging.
- **Decision**: Support hybrid IPC:
  - If `SharedArrayBuffer` is available: Use atomic ring buffers for input coordinates and frame synchronization flags.
  - Universal fallback: Fast structured cloning via `MessageChannel` with transferable buffers for layout trees and pixel damage buffers.
- **Consequences**: Runs identically in security-hardened Tauri desktop contexts and in standard browser development servers.

## ADR-004: React Native Compatibility via Virtual Fabric/TurboModule Layer
- **Status**: Accepted
- **Context**: Developers need to run existing Expo and bare React Native projects without rewriting components for React Native Web.
- **Decision**: Provide a virtual Fabric/TurboModule layer:
  - Global `Platform` definition (`iOS` / `Android` switchable).
  - Virtual `nativeFabricUIManager` that pipes element creation and style mutations into a Yoga-backed shadow tree.
  - Dynamic `__turboModuleProxy` dispatching to an extensible `NativeModuleRegistry`.
  - First-class support for Expo Modules (`global.expo.modules`).
- **Consequences**: Authentic React Native component semantics, layout, safe-area handling, and event lifecycle.

## ADR-005: Local Bridge on 127.0.0.1:7868
- **Status**: Accepted
- **Context**: External tools, developer CLIs, IDE extensions, and AI testing agents need a fast, language-agnostic interface to inspect, control, and test running simulator sessions.
- **Decision**: Expose a REST and WebSocket local bridge on `http://127.0.0.1:7868`.
  - HTTP endpoints for discovery, status, screenshots, and logs.
  - WebSocket for bidirectional event streaming, remote input injection, and live accessibility tree updates.
  - Multi-agent session lease management to prevent split-brain interaction.
- **Consequences**: Enables autonomous AI testing (`READ → LOCATE → ACT → WAIT → VERIFY → REPORT`) and Maestro-compatible YAML test flows.

## ADR-006: Standalone Executable CLI (`pocketsim`)
- **Status**: Accepted
- **Context**: Developers expect a frictionless one-command experience (`pocketsim dev`, `pocketsim qa`, `pocketsim test`).
- **Decision**: Build the CLI in TypeScript, compiled to a fast Node CLI and packaged as a standalone executable. The CLI auto-detects Metro/Expo dev servers, orchestrates the local bridge, manages virtual devices, and renders rich terminal output.
- **Consequences**: Zero friction for developers and CI/CD pipelines.
