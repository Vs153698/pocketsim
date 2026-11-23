# PocketSim — Lightweight AI-Native React Native Simulator

> **"Develop, preview, and test React Native applications without booting a heavyweight mobile emulator."**

PocketSim is a lightweight virtual mobile development and automated testing environment for React Native and Expo. It eliminates the startup latency (booting in under 2 seconds) and memory overhead (under 120 MB vs. 2.5 GB for iOS Simulator) while preserving mobile platform fidelity, sensor APIs, touch physics, and accessibility semantics.

---

## 1. Key Features

- **Four-Context Architecture**: Clean separation between Host Window, Tenant Worker (JS/React/Yoga), Shell Worker (Dynamic Island, Gestures, Status Bar), and Compositor Worker (OffscreenCanvas/Skia rasterizer with Damage Rect optimization).
- **Virtual Native Host**: Emulates React Native's Fabric UI Manager and TurboModule runtime directly inside a dedicated worker.
- **Parametric Device Profiles**: Pixel-perfect iPhone 15 Pro, iPhone 16 Pro Max, iPhone SE, Google Pixel 8, and Samsung Galaxy S24 with authentic safe-area insets, corner radii, and cutouts.
- **Hardware & Sensor Engine**: Real-time simulation of live GPS coordinates, GPX route playback, 3-axis accelerometer, gyroscope, battery levels/charging states, and network conditioning (Wi-Fi, 5G, 4G, Slow 2G, Offline).
- **Liquid Glass & Material You**: Translucent frosted glass effects, layered highlights, and adaptive Material You dynamic color themes.
- **AI-Native Testing**: Structured semantic inspection tree (`describe`, `tree`) with normalized bounding boxes `[x, y, w, h]`, atomic interaction commands (`tap`, `type`, `swipe`), and session leases for multi-agent isolation.
- **Maestro-Compatible Runner**: Execute automated YAML test flows with assertions, waits, and screenshot captures.
- **One-Command CLI**: Standalone executable `pocketsim` providing `dev`, `doctor`, `compat`, `devices`, `qa`, and `test`.

---

## 2. Architecture Overview

```text
┌────────────────────────────────────────────────────────────────────────┐
│ HOST CONTEXT (Desktop UI / Browser Main Thread)                        │
│ • Window lifecycle, pointer & keyboard event routing                   │
│ • Local Bridge HTTP & WebSocket RPC (127.0.0.1:7868)                   │
└────────────┬─────────────────────────────┬─────────────────────────────┘
             │ MessageChannel              │ MessageChannel
             ▼                             ▼
┌───────────────────────────┐ ┌──────────────────────────────────────────┐
│ SHELL WORKER              │ │ COMPOSITOR WORKER                        │
│ • Dynamic Island & Notch  │ │ • OffscreenCanvas / Skia rasterizer      │
│ • Status & Navigation bar │ │ • Damage rectangle tracking (dirty rect) │
│ • Keyboard & Alerts       │ │ • Display frame clock (60/120 Hz)        │
│ • Scroll physics & Haptics│ └────────────────────▲─────────────────────┘
└────────────┬──────────────┘                      │
             │ Cross-Worker Channel                │ Layer Tree
             ▼                                     │
┌──────────────────────────────────────────────────┴─────────────────────┐
│ TENANT WORKER (Application Runtime)                                    │
│ • Metro / Expo JavaScript Bundle Execution                             │
│ • Virtual Fabric Reconciler & Yoga Layout WebAssembly                  │
│ • Native Module Registry (Platform, TurboModules, Expo Modules)        │
│ • Sensor Simulation Engine & Semantic Accessibility Tree Builder       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Quick Start

### Installation

```bash
# Clone repository
git clone https://github.com/vaibhavsingh/pocketsim.git
cd pocketsim

# Install dependencies and build monorepo packages
pnpm install
pnpm build
```

### Starting the Simulator

```bash
# Start PocketSim in any React Native or Expo project
pocketsim dev

# Or specify a device profile
pocketsim dev --device iphone-15-pro
pocketsim dev --device pixel-8
```

### Launch Desktop Developer UI

```bash
pnpm --filter @pocketsim/desktop start
# Open http://127.0.0.1:7869 in your browser
```

---

## 4. CLI Command Reference

| Command | Description | Example |
|---|---|---|
| `pocketsim dev` | One-command start: detects project, connects Metro, launches simulator | `pocketsim dev --device iphone-15-pro` |
| `pocketsim doctor` | Diagnostics for Node, package manager, and bridge health | `pocketsim doctor` |
| `pocketsim compat` | Analyze `package.json` against PocketSim Native Module Registry | `pocketsim compat` |
| `pocketsim devices` | List all available iOS and Android device profiles | `pocketsim devices` |
| `pocketsim describe` | Structured screen overview for AI coding agents | `pocketsim describe` |
| `pocketsim tree` | Dump complete semantic accessibility tree with coordinates | `pocketsim tree` |
| `pocketsim tap` | Tap interactive element by text or testID | `pocketsim tap --text "Sign In"` |
| `pocketsim type` | Type text into targeted input element | `pocketsim type email-input "test@example.com"` |
| `pocketsim sensors` | Inspect or update simulated hardware sensors | `pocketsim sensors gps 37.7749,-122.4194` |
| `pocketsim test` | Run Maestro-compatible YAML automated test flow | `pocketsim test tests/e2e/auth-flow.yaml` |
| `pocketsim qa` | Run complete 25-step QA suite with JSON report | `pocketsim qa` |

---

## 5. AI Agent & MCP Integration

PocketSim exposes a standardized Model Context Protocol (MCP) server for Claude Code, Codex, Cursor, and Gemini CLI.

### Available MCP Tools:
- `pocketsim_describe_screen`: Returns structured summary of active screen.
- `pocketsim_get_accessibility_tree`: Returns normalized accessibility bounds.
- `pocketsim_tap_element`: Dispatches atomic tap event.
- `pocketsim_type_text`: Enters text into focused or targeted input.
- `pocketsim_set_sensor_value`: Modifies GPS coordinates, battery level, network condition.
- `pocketsim_set_permission`: Grants or revokes platform permissions.
- `pocketsim_run_test_flow`: Executes Maestro YAML flow.

### Deterministic Agent Loop:
```
READ ──► LOCATE ──► ACT ──► WAIT ──► VERIFY ──► REPORT
```

---

## 6. Testing & Quality Assurance

Run the test suite across all 15 monorepo packages:

```bash
pnpm test
```

Execute the comprehensive 25-step QA suite:

```bash
./packages/cli/dist/cli.js qa
```
