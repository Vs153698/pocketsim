import {
  DeviceProfile,
  RenderTree,
  ScreenSnapshot,
  RenderNode,
  ComponentType,
  ViewStyleProperties,
  TextStyleProperties
} from '@pocketsim/shared-types';
import { SensorEngine } from '@pocketsim/sensor-engine';
import { PermissionEngine } from '@pocketsim/permission-engine';
import { NativeModuleRegistry } from '@pocketsim/native-module-registry';
import { FourContextCoordinator } from '@pocketsim/runtime-core';
import { VirtualDOM } from './virtual-dom.js';
import { computeTreeLayout } from './layout.js';
import { buildAccessibilityTree } from './accessibility.js';
import { MetroClient } from './metro-client.js';

export interface RuntimeInitOptions {
  profile: DeviceProfile;
  sensorEngine?: SensorEngine;
  permissionEngine?: PermissionEngine;
  metroHost?: string;
  metroPort?: number;
}

export class ReactNativeRuntimeEngine {
  public readonly vdom: VirtualDOM;
  public readonly nativeModules: NativeModuleRegistry;
  public readonly coordinator: FourContextCoordinator;
  public readonly metroClient: MetroClient;
  private profile: DeviceProfile;
  private screenTitle: string = 'PocketSim';
  private focusedNodeId: string | null = null;

  constructor(options: RuntimeInitOptions) {
    this.profile = options.profile;
    const sensorEngine = options.sensorEngine || new SensorEngine();
    const permissionEngine = options.permissionEngine || new PermissionEngine();

    this.coordinator = new FourContextCoordinator(this.profile, sensorEngine, permissionEngine);
    this.nativeModules = new NativeModuleRegistry(this.profile, sensorEngine, permissionEngine);
    this.metroClient = new MetroClient(options.metroHost || '127.0.0.1', options.metroPort || 8081);

    this.vdom = new VirtualDOM(this.profile.width, this.profile.height);
    this.nativeModules.installGlobals(globalThis);

    this.setupCoordinatorListeners();
  }

  private setupCoordinatorListeners(): void {
    // Listen for reload requests
    this.coordinator.bus.subscribe('RELOAD_REQUEST', () => {
      this.coordinator.bus.dispatch({
        source: 'tenant',
        target: 'host',
        type: 'CONSOLE_LOG',
        payload: { message: 'Fast Refresh triggered: reloading component tree', level: 'info' }
      });
      this.recalculateAndCommit();
    });

    // Handle input events from Host
    this.coordinator.bus.subscribe('INPUT_EVENT', (msg) => {
      const event = msg.payload;
      if (event.type === 'pointerdown' || event.type === 'click') {
        this.handlePointerDown(event.x, event.y);
      }
    });
  }

  public setScreenTitle(title: string): void {
    this.screenTitle = title;
  }

  public getScreenTitle(): string {
    return this.screenTitle;
  }

  public createElement(
    type: ComponentType,
    props: Record<string, any> = {},
    style: ViewStyleProperties | TextStyleProperties = {},
    text?: string
  ): RenderNode {
    return this.vdom.createNode(type, props, style, text);
  }

  public mountRootChild(childId: string): void {
    this.vdom.appendChild(this.vdom.getRootId(), childId);
    this.recalculateAndCommit();
  }

  public recalculateAndCommit(): RenderTree {
    computeTreeLayout(
      this.vdom.getRootId(),
      this.vdom.getAllNodes(),
      this.profile.width,
      this.profile.height
    );

    const renderTree: RenderTree = {
      rootId: this.vdom.getRootId(),
      nodes: this.vdom.getAllNodes(),
      viewport: {
        width: this.profile.width,
        height: this.profile.height,
        scale: this.profile.pixelRatio
      },
      timestamp: Date.now()
    };

    // Commit to Compositor
    this.coordinator.bus.dispatch({
      source: 'tenant',
      target: 'compositor',
      type: 'RENDER_TREE_COMMIT',
      payload: renderTree
    });

    // Commit Accessibility snapshot to Host
    const accessibilitySnapshot = this.getAccessibilitySnapshot();
    this.coordinator.bus.dispatch({
      source: 'tenant',
      target: 'host',
      type: 'ACCESSIBILITY_SNAPSHOT',
      payload: accessibilitySnapshot
    });

    return renderTree;
  }

  public getAccessibilitySnapshot(): ScreenSnapshot {
    return buildAccessibilityTree(
      this.vdom,
      this.profile.width,
      this.profile.height,
      this.profile.pixelRatio,
      this.screenTitle
    );
  }

  // --- Interaction Execution ---

  public handlePointerDown(x: number, y: number): RenderNode | null {
    const hit = this.vdom.hitTest(x, y);
    if (!hit) return null;

    if (hit.type === 'TextInput') {
      this.focusedNodeId = hit.id;
      hit.props.focused = true;
      if (typeof hit.props.onFocus === 'function') {
        hit.props.onFocus();
      }
    } else {
      if (this.focusedNodeId && this.focusedNodeId !== hit.id) {
        const prev = this.vdom.getNode(this.focusedNodeId);
        if (prev) {
          prev.props.focused = false;
          if (typeof prev.props.onBlur === 'function') {
            prev.props.onBlur();
          }
        }
        this.focusedNodeId = null;
      }
    }

    if (typeof hit.props.onPress === 'function') {
      hit.props.onPress();
    }

    this.recalculateAndCommit();
    return hit;
  }

  public tapElement(target: { testID?: string; text?: string; role?: string }): { success: boolean; element?: RenderNode } {
    let node: RenderNode | null = null;
    if (target.testID) {
      node = this.vdom.findByTestId(target.testID);
    } else if (target.text) {
      node = this.vdom.findByText(target.text);
    } else if (target.role) {
      const list = this.vdom.findByRole(target.role);
      node = list[0] || null;
    }

    if (!node) {
      return { success: false };
    }

    // Compute center coordinates
    const centerX = node.layout.x + node.layout.width / 2;
    const centerY = node.layout.y + node.layout.height / 2;
    this.handlePointerDown(centerX, centerY);

    return { success: true, element: node };
  }

  public typeText(target: { testID?: string; text?: string }, textToType: string, clear: boolean = false): boolean {
    let node: RenderNode | null = null;
    if (target.testID) {
      node = this.vdom.findByTestId(target.testID);
    } else if (target.text) {
      node = this.vdom.findByText(target.text);
    }

    if (!node || node.type !== 'TextInput') {
      return false;
    }

    const currentVal = clear ? '' : (node.props.value || '');
    const newVal = currentVal + textToType;
    node.props.value = newVal;

    if (typeof node.props.onChangeText === 'function') {
      node.props.onChangeText(newVal);
    }

    this.recalculateAndCommit();
    return true;
  }
}
