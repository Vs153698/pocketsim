import {
  RenderNode,
  AccessibilityElement,
  ScreenSnapshot,
  LayoutRect
} from '@pocketsim/shared-types';
import { VirtualDOM } from './virtual-dom.js';

export function buildAccessibilityTree(
  vdom: VirtualDOM,
  viewportWidth: number,
  viewportHeight: number,
  pixelRatio: number,
  screenName?: string
): ScreenSnapshot {
  const root = vdom.getNode(vdom.getRootId());
  if (!root) {
    return {
      screenName: screenName || 'UnknownScreen',
      elements: [],
      activeKeyboard: false,
      metrics: { width: viewportWidth, height: viewportHeight, pixelRatio },
      timestamp: Date.now()
    };
  }

  const elements: AccessibilityElement[] = [];

  function traverse(node: RenderNode): AccessibilityElement | null {
    const isActionable =
      node.type === 'Pressable' ||
      node.type === 'TextInput' ||
      node.type === 'Switch' ||
      node.accessibilityRole === 'button' ||
      node.accessibilityRole === 'link' ||
      typeof node.props.onPress === 'function';

    const hasSemanticInfo =
      Boolean(node.testID) ||
      Boolean(node.accessibilityLabel) ||
      Boolean(node.text) ||
      isActionable;

    const childElements: AccessibilityElement[] = [];
    for (const childId of node.children) {
      const child = vdom.getNode(childId);
      if (child) {
        const item = traverse(child);
        if (item) childElements.push(item);
      }
    }

    if (hasSemanticInfo) {
      const bounds = node.layout;
      const normalizedBounds: LayoutRect = {
        x: viewportWidth > 0 ? bounds.x / viewportWidth : 0,
        y: viewportHeight > 0 ? bounds.y / viewportHeight : 0,
        width: viewportWidth > 0 ? bounds.width / viewportWidth : 0,
        height: viewportHeight > 0 ? bounds.height / viewportHeight : 0
      };

      return {
        id: node.id,
        role: node.accessibilityRole || (node.type === 'Pressable' ? 'button' : (node.type === 'TextInput' ? 'searchbox' : node.type.toLowerCase())),
        label: node.accessibilityLabel,
        text: node.text,
        value: node.props.value,
        testID: node.testID,
        bounds,
        normalizedBounds,
        isActionable,
        isEnabled: node.props.disabled !== true,
        isFocused: Boolean(node.props.focused),
        children: childElements.length > 0 ? childElements : undefined
      };
    }

    // If node has no direct semantic info but has semantic children, collapse up
    if (childElements.length === 1) {
      return childElements[0];
    }

    return null;
  }

  for (const childId of root.children) {
    const child = vdom.getNode(childId);
    if (child) {
      const elem = traverse(child);
      if (elem) elements.push(elem);
    }
  }

  return {
    screenName: screenName || 'MainScreen',
    elements,
    activeKeyboard: false,
    metrics: { width: viewportWidth, height: viewportHeight, pixelRatio },
    timestamp: Date.now()
  };
}
