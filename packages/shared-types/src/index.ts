// -------------------------------------------------------------
// PocketSim Shared Types & Protocol Specification
// -------------------------------------------------------------

// ==========================================
// 1. Device Profiles & Dimensions
// ==========================================

export type DevicePlatform = 'ios' | 'android';

export interface EdgeInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface DeviceCutout {
  type: 'notch' | 'dynamic_island' | 'punch_hole' | 'none';
  width: number;
  height: number;
  top: number;
  cornerRadius?: number;
}

export interface DeviceProfile {
  id: string;
  name: string;
  platform: DevicePlatform;
  osVersion: string;
  // Logical dimensions
  width: number;
  height: number;
  // Screen density
  pixelRatio: number;
  // Physical dimensions
  physicalWidth: number;
  physicalHeight: number;
  // Safe area insets
  safeAreaInsets: EdgeInsets;
  statusBarHeight: number;
  navigationBarHeight: number;
  screenCornerRadius: number;
  cutout: DeviceCutout;
  defaultTheme: 'light' | 'dark' | 'system';
  refreshRate: number; // e.g. 60 or 120
  defaultFontScale: number;
}

// ==========================================
// 2. Sensor Engine Types
// ==========================================

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  altitude: number;
  accuracy: number;
  altitudeAccuracy?: number;
  heading: number;
  speed: number;
  timestamp: number;
}

export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface GyroscopeData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface MagnetometerData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface BatteryState {
  level: number; // 0.0 to 1.0
  isCharging: boolean;
  lowPowerMode: boolean;
}

export type NetworkType = 'wifi' | 'cellular_5g' | 'cellular_4g' | 'cellular_3g' | 'slow_2g' | 'offline';

export interface NetworkCondition {
  type: NetworkType;
  isConnected: boolean;
  isInternetReachable: boolean;
  latencyMs: number;
  packetLossPercent: number;
  downloadSpeedKbps?: number;
}

export interface SensorState {
  location: LocationCoordinates;
  accelerometer: AccelerometerData;
  gyroscope: GyroscopeData;
  magnetometer: MagnetometerData;
  battery: BatteryState;
  network: NetworkCondition;
  proximity: boolean; // near / far
  ambientLightLux: number;
  orientation: 'portrait' | 'landscape_left' | 'landscape_right' | 'portrait_upside_down';
}

// ==========================================
// 3. Permission Engine Types
// ==========================================

export type PermissionType =
  | 'location'
  | 'location_background'
  | 'camera'
  | 'microphone'
  | 'notifications'
  | 'contacts'
  | 'photos'
  | 'media_library'
  | 'bluetooth'
  | 'motion';

export type PermissionStatus =
  | 'not_requested'
  | 'granted'
  | 'denied'
  | 'denied_permanently'
  | 'restricted';

export type PermissionRegistry = Record<PermissionType, PermissionStatus>;

// ==========================================
// 4. Virtual Shadow Tree & Render Tree
// ==========================================

export type NodeId = string;

export interface LayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ViewStyleProperties {
  display?: 'flex' | 'none';
  flex?: number;
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  flexWrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: number | string;
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
  margin?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  marginHorizontal?: number;
  marginVertical?: number;
  padding?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  position?: 'absolute' | 'relative';
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  zIndex?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
  opacity?: number;
  overflow?: 'visible' | 'hidden' | 'scroll';
  elevation?: number;
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  transform?: Array<Record<string, any>>;
}

export interface TextStyleProperties extends ViewStyleProperties {
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  fontStyle?: 'normal' | 'italic';
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  textDecorationLine?: 'none' | 'underline' | 'line-through' | 'underline line-through';
}

export type ComponentType =
  | 'View'
  | 'Text'
  | 'Image'
  | 'ScrollView'
  | 'TextInput'
  | 'Pressable'
  | 'Modal'
  | 'ActivityIndicator'
  | 'Switch'
  | 'SafeAreaView'
  | 'Root';

export interface RenderNode {
  id: NodeId;
  type: ComponentType;
  parentId: NodeId | null;
  children: NodeId[];
  layout: LayoutRect;
  style: ViewStyleProperties | TextStyleProperties;
  props: Record<string, any>;
  text?: string;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityRole?: string;
  accessible?: boolean;
}

export interface RenderTree {
  rootId: NodeId;
  nodes: Record<NodeId, RenderNode>;
  viewport: { width: number; height: number; scale: number };
  timestamp: number;
}

// ==========================================
// 5. Semantic Accessibility Tree (for AI & Automation)
// ==========================================

export interface AccessibilityElement {
  id: NodeId;
  role: string;
  label?: string;
  text?: string;
  value?: string;
  testID?: string;
  bounds: LayoutRect; // screen coordinates
  normalizedBounds: LayoutRect; // 0.0 to 1.0 coords
  isActionable: boolean;
  isEnabled: boolean;
  isFocused: boolean;
  children?: AccessibilityElement[];
}

export interface ScreenSnapshot {
  screenName?: string;
  elements: AccessibilityElement[];
  focusedElementId?: NodeId;
  activeKeyboard: boolean;
  activeDialog?: {
    type: 'alert' | 'permission' | 'action_sheet';
    title: string;
    message?: string;
    actions: Array<{ label: string; actionId: string; style?: 'default' | 'cancel' | 'destructive' }>;
  };
  navigationBar?: {
    title?: string;
    canGoBack: boolean;
  };
  metrics: {
    width: number;
    height: number;
    pixelRatio: number;
  };
  timestamp: number;
}

// ==========================================
// 6. Automation & Agent Protocol
// ==========================================

export type ActionType =
  | 'tap'
  | 'type'
  | 'clear'
  | 'swipe'
  | 'scroll'
  | 'pressKey'
  | 'goBack'
  | 'wait'
  | 'assert'
  | 'setSensor'
  | 'setPermission'
  | 'screenshot';

export interface TapCommand {
  type: 'tap';
  selector?: {
    testID?: string;
    text?: string;
    role?: string;
  };
  coordinates?: { x: number; y: number };
}

export interface TypeCommand {
  type: 'type';
  selector?: {
    testID?: string;
    text?: string;
  };
  text: string;
  clearBefore?: boolean;
  submit?: boolean;
}

export interface SwipeCommand {
  type: 'swipe';
  direction: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  durationMs?: number;
}

export interface ScrollCommand {
  type: 'scroll';
  direction: 'up' | 'down';
  amount: number;
}

export interface WaitCommand {
  type: 'wait';
  condition: 'idle' | 'visible' | 'timeout';
  target?: {
    testID?: string;
    text?: string;
  };
  timeoutMs?: number;
}

export interface AssertCommand {
  type: 'assert';
  assertion: 'visible' | 'notVisible' | 'textEquals' | 'enabled' | 'disabled';
  target: {
    testID?: string;
    text?: string;
    expectedText?: string;
  };
}

export interface AutomationResult {
  success: boolean;
  action: ActionType;
  stepDescription: string;
  executionTimeMs: number;
  matchedElement?: AccessibilityElement;
  error?: string;
  screenshotBase64?: string;
}

export interface MaestroStep {
  launchApp?: boolean;
  tapOn?: { text?: string; id?: string };
  inputText?: { text: string };
  eraseText?: boolean;
  scroll?: { direction: 'down' | 'up' };
  swipe?: { direction: 'down' | 'up' | 'left' | 'right' };
  back?: boolean;
  assertVisible?: { text?: string; id?: string };
  assertNotVisible?: { text?: string; id?: string };
  waitFor?: { text?: string; id?: string; timeout?: number };
  takeScreenshot?: { name: string };
}

export interface MaestroFlow {
  name: string;
  device?: string;
  steps: MaestroStep[];
}

// ==========================================
// 7. Local Bridge & Daemon API
// ==========================================

export interface BridgeSession {
  id: string;
  projectId: string;
  projectPath: string;
  deviceProfile: DeviceProfile;
  metroUrl: string;
  status: 'initializing' | 'running' | 'reloading' | 'paused' | 'error';
  activeLease?: {
    agentId: string;
    leaseId: string;
    expiresAt: number;
  };
  createdAt: number;
  updatedAt: number;
}

export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  category: 'runtime' | 'metro' | 'render' | 'agent' | 'bridge';
  message: string;
  details?: any;
  timestamp: number;
}
