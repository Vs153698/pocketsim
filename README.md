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

## 3. Quick Start & How to Run Your Real Apps

### Setup & Build

```bash
# Clone repository
git clone https://github.com/Vs153698/pocketsim.git
cd pocketsim

# Install dependencies and build all packages
pnpm install
pnpm build

# Run full test suite (15 packages, 46 tests green)
pnpm test
```

### Starting the Simulator & Desktop UI

```bash
# Start the Desktop Simulator UI (served on http://127.0.0.1:7869)
node apps/desktop/dist/server.js
# Or with pnpm:
pnpm --filter @pocketsim/desktop start
```

### How to Run Your Real React Native or Expo App

PocketSim connects directly to your existing React Native or Expo project via Metro Bundler:

1. **Start your React Native or Expo development server** in your project root:
   ```bash
   # In your Expo or React Native app directory:
   npx expo start
   # or
   npm start
   # Metro will start listening on port 8081 (or custom port)
   ```

2. **Verify Project Compatibility**:
   ```bash
   pocketsim compat --project /path/to/my-react-native-app
   ```
   PocketSim's project detector inspects your `package.json` against the Native Module Registry and reports TurboModule / Fabric readiness.

3. **Connect PocketSim to Metro**:
   ```bash
   pocketsim dev --metro 8081 --device iphone-16-pro
   ```
   PocketSim fetches the development bundle directly via Metro's WebSocket interface (`ws://localhost:8081/hot`), binds virtual NativeModules and JSI TurboModules, and boots your real app inside the lightweight virtual runtime without booting Xcode or Android Studio.

4. **Testing in the Desktop UI**:
   - Open [http://127.0.0.1:7869](http://127.0.0.1:7869) in your browser.
   - Switch between **iPhone 16 Pro**, **Pixel 9 Pro**, **Galaxy S24 Ultra**, **Galaxy Z Fold 6**, or **iPhone Duo**.
   - Test **KeyboardAvoidingView**: Switch between Virtual Phone Keyboard and Hardware PC Keyboard.
   - Test **Responsive Multi-Screen Matrix**: Select `iOS Matrix (All 5)` or `Android Matrix (All 6)` to preview responsive breakpoints across all target devices simultaneously.
   - Test **Sensors**: Mock GPS search, ambient temperature/weather condition for APIs, battery levels, network conditioning (5G, LTE, Slow 2G, Airplane Mode), and accelerometer shake.

---

## 4. Automation for AI Coding Agents

AI Coding Agents (Claude Code, Cursor, Codex, Gemini CLI) can operate PocketSim headlessly or interactively via the **Local Bridge HTTP & WebSocket RPC** on `http://127.0.0.1:7868`:

| HTTP Endpoint | Method | Description | Payload Example |
|---|---|---|---|
| `/health` | `GET` | Health check & engine status | Returns `{ status: "ok", version: "0.1.0" }` |
| `/session` | `POST` | Allocate isolated agent session | `{ "agentId": "agent-1", "device": "iphone-16-pro" }` |
| `/inspect` | `GET` | Dump semantic accessibility tree | Returns normalized hierarchy with `testID`, `role`, bounds `[x,y,w,h]` |
| `/interact` | `POST` | Dispatch atomic UI event | `{ "action": "tap", "target": "login-button" }` |
| `/interact` | `POST` | Enter text into native input | `{ "action": "type", "target": "email-input", "text": "user@example.com" }` |
| `/sensors` | `POST` | Mock device hardware states | `{ "gps": { "lat": 37.7749, "lon": -122.4194 }, "battery": 80 }` |
| `/screenshot` | `GET` | Capture PNG buffer of active screen | Returns binary image buffer |

### Running Automated Test Flows (Maestro-Compatible)

Coding agents can execute automated YAML test scripts in one command:

```bash
pocketsim test tests/e2e/auth-flow.yaml
```

Example Maestro flow (`auth-flow.yaml`):
```yaml
appId: com.pocketsim.app
name: Authentication Conformance Flow
device: iphone-16-pro
---
- tapOn: "Sign In"
- assertVisible: "Email Address"
- inputText: "user@pocketsim.dev"
- tapOn: "Password"
- inputText: "SecurePassword123"
- tapOn: "Submit"
- assertVisible: "Welcome Back"
```

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
