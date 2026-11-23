# PocketSim System Design & Technical Specification

## 1. System Overview

PocketSim is a lightweight, AI-native virtual mobile development and automated testing environment for React Native and Expo. It eliminates the startup latency and memory overhead of Xcode iOS Simulator and Android Studio AVD while preserving mobile platform fidelity, sensor APIs, touch physics, and accessibility semantics.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               DEVELOPER / AI AGENT                              │
│                                                                                 │
│    npx pocketsim dev        pocketsim tap       pocketsim qa      Maestro YAML  │
└───────────┬───────────────────────┬───────────────────┬─────────────────┬───────┘
            │                       │                   │                 │
            ▼                       ▼                   ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ POCKETSIM CLI & LOCAL BRIDGE (127.0.0.1:7868)                                   │
│ • Project Detection (Expo / Bare RN, Metro Port 8081/8082, Package Manager)    │
│ • Session Lease Manager (Multi-Agent Safe)                                      │
│ • Fast Refresh & Bundle Proxy                                                   │
│ • Semantic Inspection & Accessibility Query Engine                              │
│ • Test Runner & Visual Regression Engine                                        │
└───────────────────────────────────────┬─────────────────────────────────────────┘
                                        │ WebSocket / IPC
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ POCKETSIM RUNTIME ENGINE (Tauri 2 Desktop / Web)                                │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │ HOST CONTEXT (Window, Input Router, Dev Inspector Panels)               │   │
│   └───────────────┬─────────────────────────────────────────┬───────────────┘   │
│                   │                                         │                   │
│                   ▼                                         ▼                   │
│   ┌───────────────────────────────┐         ┌───────────────────────────────┐   │
│   │ SHELL WORKER                  │         │ COMPOSITOR WORKER             │   │
│   │ • Device Frame (iPhone/Pixel) │         │ • OffscreenCanvas / Skia WASM │   │
│   │ • Dynamic Island & Notch      │         │ • Damage Rect Pipeline        │   │
│   │ • Status Bar & Nav Gestures   │◄───────►│ • Glass Shaders & Blurs       │   │
│   │ • Virtual Keyboard & Alerts   │         │ • High-DPI Display Clock      │   │
│   └───────────────┬───────────────┘         └───────────────▲───────────────┘   │
│                   │                                         │                   │
│                   ▼                                         │                   │
│   ┌─────────────────────────────────────────────────────────┴───────────────┐   │
│   │ TENANT WORKER (Application Runtime)                                     │   │
│   │ • React 18/19 & Virtual Reconciler                                      │   │
│   │ • Yoga Layout WASM (Flexbox)                                            │   │
│   │ • Native Module Registry (Platform, TurboModules, Expo Modules)        │   │
│   │ • Sensor Simulation Engine (GPS, Accelerometer, Gyro, Battery, Net)     │   │
│   │ • Permission Engine (Location, Camera, Microphone, Notifications)       │   │
│   │ • Semantic Accessibility Tree Builder                                   │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Subsystems

### 2.1 Project Detector & Metro Connector
- Inspects `package.json`, `app.json`, `app.config.js`, and lockfiles (`pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`, `bun.lockb`).
- Detects whether Metro is already running on port 8081 or starts it without creating duplicate processes.
- Fetches the bundle (`http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false`).
- Establishes a WebSocket connection to Metro's HMR server to support Fast Refresh and reload triggers.

### 2.2 Device Shell & System UI
- **Device Profiles**: Fully parametric metrics for iPhone SE, iPhone 15 Pro, iPhone 16 Pro Max, Google Pixel 8, and Samsung Galaxy S24 (physical & logical resolution, DPR, corner radii, cutouts, dynamic island dimensions, safe area insets).
- **iOS System UI**: Authentic Dynamic Island with live states (idle, compact leading/trailing, expanded), status bar with carrier/wifi/battery, home indicator gesture bar, and iOS system keyboard with realistic layout.
- **Android System UI**: Material You status bar, punch-hole camera cutout, gesture navigation pill or classic 3-button navigation, and Material 3 dialogs/sheets.

### 2.3 Sensor Engine
- **Location / GPS**: Configurable latitude, longitude, altitude, accuracy, speed, heading. Real-time GPX route playback with variable speed multipliers.
- **Motion Sensors**: 3-axis Accelerometer ($m/s^2$ with simulated gravitational bias), Gyroscope (angular velocity), and Magnetometer (compass heading).
- **Environment & Battery**: Battery charge percentage, AC/Wireless charging state, low-power mode, proximity sensor, ambient lux.
- **Network Conditioning**: Presets for 5G, 4G LTE, 3G, Slow 2G, Offline, variable latency (0–2000ms), and packet loss percentage.

### 2.4 Permission Engine
- Tracks permission lifecycle: `NOT_REQUESTED`, `GRANTED`, `DENIED`, `DENIED_PERMANENTLY`, `RESTRICTED`.
- Renders simulated platform-native permission dialogs (iOS Alert sheet or Android Material dialog).
- Supports programmatic overriding via CLI: `pocketsim permissions set location granted`.

### 2.5 AI Inspection & Interaction Engine
- Generates a real-time semantic accessibility tree combining accessibility props, testIDs, roles, bounding boxes, and text contents.
- Executes discrete atomic actions (`tap`, `type`, `swipe`, `scroll`, `wait`, `assert`).
- Exposes session locking/leasing so parallel AI agents never interfere with each other.
