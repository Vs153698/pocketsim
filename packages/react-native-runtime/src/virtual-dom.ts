import { NodeId, ComponentType, RenderNode, ViewStyleProperties, TextStyleProperties, LayoutRect } from '@pocketsim/shared-types';

export class VirtualDOM {
  private nodes: Map<NodeId, RenderNode> = new Map();
  private rootId: NodeId;
  private idCounter: number = 0;

  constructor(viewportWidth: number, viewportHeight: number) {
    this.rootId = 'root';
    const rootNode: RenderNode = {
      id: this.rootId,
      type: 'Root',
      parentId: null,
      children: [],
      layout: { x: 0, y: 0, width: viewportWidth, height: viewportHeight },
      style: { width: viewportWidth, height: viewportHeight, backgroundColor: '#000000' },
      props: {}
    };
    this.nodes.set(this.rootId, rootNode);
  }

  public getRootId(): NodeId {
    return this.rootId;
  }

  public getNode(id: NodeId): RenderNode | undefined {
    return this.nodes.get(id);
  }

  public getAllNodes(): Record<NodeId, RenderNode> {
    const res: Record<NodeId, RenderNode> = {};
    for (const [id, node] of this.nodes) {
      res[id] = node;
    }
    return res;
  }

  public createNode(
    type: ComponentType,
    props: Record<string, any> = {},
    style: ViewStyleProperties | TextStyleProperties = {},
    text?: string
  ): RenderNode {
    const id = props.id || props.testID || `node-${++this.idCounter}`;
    const node: RenderNode = {
      id,
      type,
      parentId: null,
      children: [],
      layout: { x: 0, y: 0, width: 0, height: 0 },
      style: { ...style },
      props: { ...props },
      text: text ?? props.children,
      testID: props.testID,
      accessibilityLabel: props.accessibilityLabel || props['aria-label'],
      accessibilityRole: props.accessibilityRole || props.role,
      accessible: props.accessible !== false
    };
    this.nodes.set(id, node);
    return node;
  }

  public appendChild(parentId: NodeId, childId: NodeId): void {
    const parent = this.nodes.get(parentId);
    const child = this.nodes.get(childId);
    if (!parent || !child) return;

    if (child.parentId) {
      this.removeChild(child.parentId, childId);
    }

    child.parentId = parentId;
    if (!parent.children.includes(childId)) {
      parent.children.push(childId);
    }
  }

  public removeChild(parentId: NodeId, childId: NodeId): void {
    const parent = this.nodes.get(parentId);
    const child = this.nodes.get(childId);
    if (parent) {
      parent.children = parent.children.filter(id => id !== childId);
    }
    if (child && child.parentId === parentId) {
      child.parentId = null;
    }
  }

  public removeNodeRecursive(nodeId: NodeId): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;
    for (const childId of [...node.children]) {
      this.removeNodeRecursive(childId);
    }
    if (node.parentId) {
      this.removeChild(node.parentId, nodeId);
    }
    this.nodes.delete(nodeId);
  }

  /**
   * Hit test: finds the innermost interactive or visual node containing (x, y)
   */
  public hitTest(x: number, y: number): RenderNode | null {
    return this.hitTestRecursive(this.rootId, x, y);
  }

  private hitTestRecursive(nodeId: NodeId, x: number, y: number): RenderNode | null {
    const node = this.nodes.get(nodeId);
    if (!node) return null;

    const { x: nx, y: ny, width: nw, height: nh } = node.layout;
    const inside = x >= nx && x <= (nx + nw) && y >= ny && y <= (ny + nh);
    if (!inside && nodeId !== this.rootId) {
      return null;
    }

    // Check children in reverse order (top to bottom in z-stack)
    for (let i = node.children.length - 1; i >= 0; i--) {
      const childHit = this.hitTestRecursive(node.children[i], x, y);
      if (childHit) {
        return childHit;
      }
    }

    return inside ? node : null;
  }

  public findByTestId(testID: string): RenderNode | null {
    for (const node of this.nodes.values()) {
      if (node.testID === testID) {
        return node;
      }
    }
    return null;
  }

  public findByText(text: string, exact: boolean = false): RenderNode | null {
    const query = text.toLowerCase().trim();
    for (const node of this.nodes.values()) {
      if (node.text) {
        const t = node.text.toLowerCase().trim();
        if (exact ? t === query : t.includes(query)) {
          return node;
        }
      }
    }
    return null;
  }

  public findByRole(role: string): RenderNode[] {
    const results: RenderNode[] = [];
    for (const node of this.nodes.values()) {
      if (node.accessibilityRole === role) {
        results.push(node);
      }
    }
    return results;
  }

  public clear(): void {
    const root = this.nodes.get(this.rootId);
    this.nodes.clear();
    if (root) {
      root.children = [];
      this.nodes.set(this.rootId, root);
    }
  }
}
