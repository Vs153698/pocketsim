# Peach Architecture Analysis & Engineering Synthesis for PocketSim

## 1. Executive Summary

Peach Sim demonstrates a specialized multi-context virtualization strategy for React Native applications that avoids the heavy overhead of full OS emulation (QEMU/HVF/KVM) by emulating the React Native C++/JavaScript native platform boundary directly inside a web/desktop runtime environment.

This document analyzes the documented public architecture of Peach (https://peachsim.com/docs/peach) and synthesizes an independent, clean-room implementation strategy for **PocketSim**. PocketSim delivers an AI-native, lightweight React Native virtual mobile environment running on modern desktop (Tauri 2 / Web) without requiring Apple Xcode, iOS Simulator, or Android Studio/AVD.

---

## 2. The Four-Context Execution Architecture

Modern mobile OS architectures strictly isolate application logic, system chrome, compositor, and platform window management. Peach maps this into four distinct execution realms in the browser/desktop environment:

```
┌────────────────────────────────────────────────────────────────────────┐
│ HOST CONTEXT (Tauri / Electron / Browser Main Window)                  │
│ • Window lifecycle, Pointer/Keyboard event capture                    │
│ • Canvas & WebGL/WebGPU surface management, Local Bridge RPC           │
│ • Session management, Developer control panel                          │
└────────────┬─────────────────────────────┬─────────────────────────────┘
             │ MessageChannel              │ MessageChannel
             ▼                             ▼
┌───────────────────────────┐ ┌──────────────────────────────────────────┐
│ SHELL WORKER              │ │ COMPOSITOR WORKER                        │
│ • Device state & gestures │ │ • CanvasKit / Skia / WebGL rasterizer    │
│ • Dynamic Island / Notch  │ │ • Damage rectangle tracking              │
│ • Status & Navigation bar │ │ • Display frame clock (60/120 Hz)        │
│ • Keyboard & System Alerts│ │ • Layer tree compositing & clipping      │
│ • Scroll physics / Haptics│ └────────────────────▲─────────────────────┘
└────────────┬──────────────┘                      │
             │ Cross-Worker Channel                │ SharedArrayBuffer / Pipe
             ▼                                     │
┌──────────────────────────────────────────────────┴─────────────────────┐
│ TENANT / APPLICATION WORKER                                            │
│ • Metro / Expo JS Bundle Execution                                    │
│ • React 18/19 Runtime & Reconciler                                     │
│ • Layout Calculation (Yoga WebAssembly)                                │
│ • Native Module Registry & Fabric/TurboModule Proxies                  │
│ • Semantic Accessibility Tree Generator                                │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Context Isolation & Responsibilities

1. **Host Context (Main UI Thread)**:
   - Manages OS desktop window, device canvas container, high-DPI scaling.
   - Forwards raw user inputs (pointerdown/move/up, keydown/up, wheel) directly to the Shell and Tenant without blocking on DOM layout.
   - Hosts the local bridge client, performance monitors, and developer tooling.

2. **Tenant Worker (Application Execution Environment)**:
   - Dedicated Web Worker executing untrusted/developer application JavaScript.
   - Polyfills React Native global namespace (`global.nativeFabricUIManager`, `global.__turboModuleProxy`, `Platform`, `react-native`).
   - Runs the Yoga layout engine compiled to WebAssembly.
   - Computes layout geometries and emits a compact serializable Render Tree / Diff stream.
   - Maintains the semantic Accessibility & TestID Tree for AI inspection and automated testing.

3. **Shell Worker (System UI & Gestures)**:
   - Simulates OS-level behavior: iOS SpringBoard and Android SystemUI.
   - Tracks home gesture bars, dynamic island expansions, status bar time/wifi/battery state.
   - Handles virtual software keyboard animations and screen safe-area insets.
   - Processes touch physics (momentum scrolling, spring animations) independently of application JS thread stalls.

4. **Compositor Worker (Rasterization Pipeline)**:
   - Owns the `OffscreenCanvas` rendering context (using Skia / CanvasKit WASM or WebGL hardware acceleration).
   - Receives layer trees and damage rects from both the Tenant Worker (app UI) and Shell Worker (system UI).
   - Blends system UI layers over application layers with proper clipping (corner radii, camera cutouts, dynamic island).
   - Applies Liquid Glass / Material You shaders, blurs, and shadows.

---

## 3. Communication & Memory Architecture

### 3.1 Zero-Copy vs. Structured Cloning
- Where `SharedArrayBuffer` and `Atomics` are supported (requiring `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`), a shared ring buffer facilitates sub-millisecond input event delivery and frame timing synchronization.
- When `SharedArrayBuffer` is unavailable (e.g., standard browser hosting without special headers), PocketSim falls back smoothly to `MessageChannel` with `Transferable` `ArrayBuffer` payloads, avoiding serialization overhead.

### 3.2 Backpressure and Frame Pacing
- The Tenant Worker calculates layout in sync with `requestAnimationFrame` pulses driven by the Compositor.
- If application JS takes longer than 16.6ms (dropped frames), the Compositor continues rendering Shell animations (status bar time, gesture animations) while displaying the last valid application layer, mirroring native mobile behavior.

---

## 4. React Native Runtime & Fabric Emulation

### 4.1 Fabric & Bridgeless Architecture
In modern React Native (0.74+):
- **JSI (JavaScript Interface)**: C++ host objects are directly accessed from JS. PocketSim provides a TypeScript/JavaScript emulation layer mapping JSI calls to the Native Module Registry.
- **Fabric UI Manager**: In native iOS/Android, React commits ShadowNodes to C++, Yoga performs layout on a background thread, and mounting transactions are dispatched to the platform views. PocketSim replicates this flow:
  1. Reconciler commits mutations to a virtual Shadow Tree.
  2. Yoga WebAssembly computes flexbox layouts for the Shadow Tree.
  3. Calculated layout nodes (x, y, width, height, styles, props) are batched and transferred to the Compositor.

### 4.2 TurboModule Emulation
PocketSim implements a dynamic proxy `global.__turboModuleProxy(moduleName)`:
- Returns an implementation from `NativeModuleRegistry`.
- Implements core native modules: `DeviceInfo`, `PlatformConstants`, `StatusBarManager`, `Timing`, `AppState`, `AsyncLocalStorage`, `Networking`, `WebSocketModule`, `SoundManager`, etc.
- Seamlessly integrates with Expo Modules API (`global.expo.modules`).

---

## 5. Agent-Readable Accessibility & Semantic Inspection

A primary differentiator of Peach is its rich accessibility/semantic inspection pipeline for AI agents:
1. **Accessibility Tree Extraction**: Every React Native node with `accessible={true}`, `accessibilityLabel`, `accessibilityRole`, or `testID` is indexed.
2. **Normalized Coordinate System**: Elements report both local and screen-normalized bounding boxes `[x, y, width, height]`.
3. **Semantic Hierarchy**: Provides AI agents with a clean YAML or JSON snapshot of interactive elements (buttons, inputs, lists, headers), enabling `READ → LOCATE → ACT → WAIT → VERIFY → REPORT` without depending on brittle visual OCR.
4. **Action Dispatch**: The bridge translates high-level agent commands (`tap --text "Login"`, `type --testID "email-input" "test@example.com"`) into synthetic pointer and key events dispatched to the runtime.

---

## 6. PocketSim Clean-Room Implementation Plan

PocketSim synthesizes these insights into an open, modular, extensible architecture:
1. **Core Runtime (`@pocketsim/runtime-core`)**: Clean Four-Context message passing bus, ring buffer, worker coordinator.
2. **Layout & Reconciler (`@pocketsim/react-native-runtime`)**: Standalone virtual component tree, Yoga WASM layout, Metro bundle loader.
3. **Compositor (`@pocketsim/rendering-engine`)**: CanvasKit / 2D Canvas / WebGL compositor with damage rects, clipping, and glass shaders.
4. **Device Shell (`@pocketsim/device-shell`)**: Pixel-perfect iPhone 15/16 Pro and Pixel 8 frames, dynamic island, gestures, status bar.
5. **Hardware & Sensors (`@pocketsim/sensor-engine`)**: GPX route simulator, accelerometer, gyro, battery, network conditioning.
6. **Local Bridge (`@pocketsim/local-bridge`)**: HTTP + WebSocket server at `127.0.0.1:7868`.
7. **CLI (`@pocketsim/cli`)**: `pocketsim dev`, `pocketsim qa`, `pocketsim test`, agent interaction commands.
8. **AI Skills & MCP (`@pocketsim/agent-runtime`)**: Structured inspection tools, Maestro YAML runner, AI skills.
