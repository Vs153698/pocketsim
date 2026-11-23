# PocketSim Compatibility Strategy & Package Registry

## 1. Principles of Compatibility

1. **No Fake Claims**: A package is not considered supported merely because its JavaScript import succeeds without throwing an error. A package is only marked supported when its functional APIs execute correctly against test fixtures.
2. **Deterministic Classification**: Every native or community package is classified into one of six tiers:
   - **`FULLY_SUPPORTED`**: All major APIs implemented and verified against unit/runtime test suites.
   - **`PARTIALLY_SUPPORTED`**: Core mobile UI/logic APIs supported; advanced native hooks documented with graceful fallbacks.
   - **`MOCKED`**: Functional mock providing realistic dummy data and lifecycle events (e.g., Camera returning a test video feed or image fixture).
   - **`REQUIRES_NATIVE_RUNTIME`**: Features that strictly require real hardware/OS drivers (e.g., custom C++ Bluetooth peripheral stack).
   - **`UNSUPPORTED`**: Known incompatible or deprecated APIs.
   - **`NOT_YET_TESTED`**: Awaiting verification in the compatibility test suite.

---

## 2. Priority Package Compatibility Matrix

| Package | Status | PocketSim Implementation Strategy | Verified |
|---|---|---|---|
| `react-native` (Core) | `FULLY_SUPPORTED` | Virtual Fabric Reconciler + Yoga Layout WASM + TurboModule registry | Yes |
| `expo` (Core) | `FULLY_SUPPORTED` | Global `expo` runtime namespace, Asset resolution, Constants | Yes |
| `expo-router` | `FULLY_SUPPORTED` | File-system routing emulator, URL history stack, Screen containers | Yes |
| `expo-location` | `FULLY_SUPPORTED` | Hooked to Sensor Engine (live coordinates, GPX playback, geofencing) | Yes |
| `expo-device` | `FULLY_SUPPORTED` | Populated from active Device Profile (iPhone/Pixel dimensions, brand, OS) | Yes |
| `expo-battery` | `FULLY_SUPPORTED` | Hooked to Sensor Engine battery level & charging state | Yes |
| `expo-haptics` | `FULLY_SUPPORTED` | Visual & audio simulation pulses dispatched to Shell | Yes |
| `expo-status-bar` | `FULLY_SUPPORTED` | Controls Shell status bar styling and animation | Yes |
| `expo-image-picker` | `MOCKED` | Provides preset photo library & camera capture fixtures | Yes |
| `expo-camera` | `MOCKED` | Virtual camera viewfinder with test pattern / webcam stream | Yes |
| `expo-secure-store` | `FULLY_SUPPORTED` | AES-256 encrypted local SQLite / file-backed keychain mock | Yes |
| `expo-file-system` | `FULLY_SUPPORTED` | Sandboxed local virtual filesystem per project session | Yes |
| `react-navigation` | `FULLY_SUPPORTED` | Stack, Tabs, Drawer, and Native Stack transitions | Yes |
| `react-native-gesture-handler` | `FULLY_SUPPORTED` | Pointer event translation to Gesture Handler state machine | Yes |
| `react-native-reanimated` | `PARTIALLY_SUPPORTED`| Web worker / JS thread animation fallback with requestAnimationFrame | Yes |
| `react-native-safe-area-context`| `FULLY_SUPPORTED` | Dynamic safe area insets derived from device profile notch/island | Yes |
| `react-native-svg` | `FULLY_SUPPORTED` | Standard SVG rendering pipeline mapped to CanvasKit / Canvas2D | Yes |
| `react-native-mmkv` | `FULLY_SUPPORTED` | Fast in-memory synchronous key-value store with file persistence | Yes |

---

## 3. The `pocketsim compat` Command

PocketSim provides an automated CLI analyzer:
```bash
pocketsim compat
```
It reads the target project's `package.json`, detects all dependencies, cross-references with the PocketSim Native Compatibility Registry, and outputs:
- Compatible packages summary.
- Potential compatibility warnings.
- Required mock configurations.
- Recommended execution mode (iOS profile / Android profile).
