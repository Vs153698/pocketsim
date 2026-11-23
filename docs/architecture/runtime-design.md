# PocketSim Runtime Design: Virtual React Native Execution Engine

## 1. The Runtime Challenge

In native iOS/Android React Native:
1. JavaScript runs in Hermes or JavaScriptCore.
2. React commits shadow nodes to Fabric C++.
3. Yoga C++ computes layout dimensions asynchronously.
4. Mounting transactions construct `UIView` / `android.view.View` hierarchies.
5. TurboModules map directly to Objective-C / Swift / Java / Kotlin classes via JSI.

In PocketSim, rather than emulating an entire Darwin or Linux kernel, we provide a **Virtual Native Host** inside a dedicated Web Worker (Tenant Worker) backed by Yoga compiled to WebAssembly.

---

## 2. Virtual React Native Pipeline

```
┌──────────────────────────────────────────────────────────┐
│ Metro / Expo JavaScript Bundle                          │
│ (React components, hooks, styles, navigation)           │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│ PocketSim Virtual Native Environment                    │
│ • global.Platform = { OS: 'ios', Version: '17.5', ... }  │
│ • global.__turboModuleProxy(name)                       │
│ • global.nativeFabricUIManager                          │
│ • global.expo = { modules: ... }                        │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│ Virtual React Native Reconciler                         │
│ • Mounts <View>, <Text>, <Image>, <ScrollView>, etc.    │
│ • Creates ShadowTree nodes                              │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│ Yoga WebAssembly Layout Engine                           │
│ • Computes Flexbox, absolute positioning, margins,       │
│   paddings, borders, flexGrow, flexShrink, aspect ratios │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│ Render Tree & Semantic Tree Generation                   │
│ 1. Render Tree (x, y, w, h, styles, draw commands)       │
│    ──► Sent to Compositor Worker for GPU rasterization   │
│ 2. Semantic Accessibility Tree                           │
│    ──► Sent to Host & Local Bridge for AI & automation   │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Core React Native Component Primitives

The runtime implements high-fidelity native primitives:
- **`View`**: Base container with full flexbox, border radius, background, shadow, opacity, clipping, and touch responder handling.
- **`Text`**: Intrinsic text measurement via text layout metrics, styling (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, color), nested text spans.
- **`Image`**: Resource resolution, resizeMode (`cover`, `contain`, `stretch`, `repeat`, `center`), loading and error states, tint colors.
- **`ScrollView` / `FlatList` / `SectionList`**: Native scroll physics (deceleration rate, bounce on iOS, overscroll indicator on Android), virtualization windowing, refresh control.
- **`TextInput`**: Virtual software keyboard integration, selection, placeholder, autoCapitalize, secureTextEntry, onChangeText, onSubmitEditing.
- **`Pressable` / `TouchableOpacity`**: Native feedback (opacity animation, ripple on Android, hitSlop, pressRetentionOffset).
- **`SafeAreaView`**: Dynamic insets matching the active device profile (notch, dynamic island, home indicator bar).
- **`Modal`**: Portal presentation, slide/fade animations, hardware back button dismissal on Android.
- **`ActivityIndicator` / `Switch` / `StatusBar`**: Authentic platform-specific appearances and animations.

---

## 4. Native Module Registry & TurboModule Emulation

When application code imports `react-native` or Expo packages, TurboModule calls (`NativeModules.X` or `TurboModuleRegistry.get('X')`) are intercepted by the PocketSim Native Module Registry:

| Module | Emulation Implementation |
|---|---|
| `PlatformConstants` | Emulates platform-specific constants, screen metrics, density, OS build |
| `DeviceInfo` | Returns model name, systemVersion, batteryLevel, isEmulator: false |
| `StatusBarManager` | Controls status bar visibility, style (`light-content`, `dark-content`), background |
| `Timing` | Maps native timer callbacks into microsecond precision clock |
| `AsyncLocalStorage` | In-memory key-value store with file-backed persistence per project session |
| `Networking` | Bridges `fetch` / `XMLHttpRequest` with network conditioning (throttling, latency) |
| `WebSocketModule` | Native WebSocket bridge with connection monitoring |
| `Haptics` | Emulates impact, notification, and selection feedback with visual/auditory pulse |
| `Location` | Hooks directly into PocketSim's real-time Sensor Engine |
| `Sensors` | Hooks into Accelerometer, Gyroscope, Magnetometer, Barometer streams |
