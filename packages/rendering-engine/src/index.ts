import {
  RenderTree,
  RenderNode,
  LayoutRect,
  DeviceProfile,
  ViewStyleProperties,
  TextStyleProperties
} from '@pocketsim/shared-types';
import { DeviceShellState } from '@pocketsim/device-shell';

export type DrawCommandType =
  | 'CLEAR'
  | 'CLIP_ROUNDED_RECT'
  | 'FILL_RECT'
  | 'STROKE_RECT'
  | 'FILL_TEXT'
  | 'DRAW_IMAGE'
  | 'LIQUID_GLASS_SURFACE'
  | 'DYNAMIC_ISLAND'
  | 'STATUS_BAR'
  | 'HOME_INDICATOR'
  | 'KEYBOARD';

export interface DrawCommand {
  type: DrawCommandType;
  rect: LayoutRect;
  style?: Record<string, any>;
  text?: string;
  sourceUrl?: string;
}

export class DamageTracker {
  private dirtyRects: LayoutRect[] = [];

  public markDirty(rect: LayoutRect): void {
    this.dirtyRects.push({ ...rect });
  }

  public getDamageRect(): LayoutRect | null {
    if (this.dirtyRects.length === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const r of this.dirtyRects) {
      if (r.x < minX) minX = r.x;
      if (r.y < minY) minY = r.y;
      if (r.x + r.width > maxX) maxX = r.x + r.width;
      if (r.y + r.height > maxY) maxY = r.y + r.height;
    }

    return {
      x: minX,
      y: minY,
      width: Math.max(0, maxX - minX),
      height: Math.max(0, maxY - minY)
    };
  }

  public reset(): void {
    this.dirtyRects = [];
  }
}

export class Compositor {
  public readonly damageTracker: DamageTracker = new DamageTracker();

  /**
   * Compiles the complete draw command list for the frame:
   * Layer 0: Background & Device Screen Clip
   * Layer 1: Application UI Render Tree
   * Layer 2: System UI Chrome (Dynamic Island / Cutout, Status Bar, Home Bar, Keyboard, Dialogs)
   */
  public compileFrame(
    renderTree: RenderTree | null,
    shellState: DeviceShellState
  ): DrawCommand[] {
    const commands: DrawCommand[] = [];
    const profile = shellState.profile;

    // 1. Base Screen Clipping
    commands.push({
      type: 'CLIP_ROUNDED_RECT',
      rect: { x: 0, y: 0, width: profile.width, height: profile.height },
      style: {
        radius: profile.screenCornerRadius,
        backgroundColor: shellState.theme === 'dark' ? '#000000' : '#FFFFFF'
      }
    });

    // 2. Application UI Hierarchy
    if (renderTree) {
      this.compileRenderTreeNodes(renderTree.rootId, renderTree.nodes, commands);
    }

    // 3. System UI Layer
    this.compileSystemUILayers(shellState, commands);

    return commands;
  }

  private compileRenderTreeNodes(
    nodeId: string,
    nodes: Record<string, RenderNode>,
    commands: DrawCommand[]
  ): void {
    const node = nodes[nodeId];
    if (!node || node.style.display === 'none') return;

    const style = node.style;
    const layout = node.layout;

    // Skip zero dimension nodes (unless root)
    if (layout.width > 0 && layout.height > 0) {
      // Background & Borders
      if (style.backgroundColor || style.borderWidth) {
        commands.push({
          type: 'FILL_RECT',
          rect: layout,
          style: {
            backgroundColor: style.backgroundColor,
            borderColor: style.borderColor,
            borderWidth: style.borderWidth,
            borderRadius: style.borderRadius || style.borderTopLeftRadius,
            opacity: style.opacity ?? 1.0,
            shadowColor: style.shadowColor,
            shadowRadius: style.shadowRadius
          }
        });
      }

      // Text nodes
      if (node.type === 'Text' && node.text) {
        const textStyle = style as TextStyleProperties;
        commands.push({
          type: 'FILL_TEXT',
          rect: layout,
          text: node.text,
          style: {
            color: textStyle.color || '#FFFFFF',
            fontSize: textStyle.fontSize || 14,
            fontWeight: textStyle.fontWeight || 'normal',
            textAlign: textStyle.textAlign || 'left',
            lineHeight: textStyle.lineHeight
          }
        });
      }

      // Image nodes
      if (node.type === 'Image' && node.props.source) {
        const src = typeof node.props.source === 'string' ? node.props.source : node.props.source.uri;
        commands.push({
          type: 'DRAW_IMAGE',
          rect: layout,
          sourceUrl: src,
          style: {
            resizeMode: node.props.resizeMode || 'cover',
            borderRadius: style.borderRadius
          }
        });
      }

      // TextInput nodes
      if (node.type === 'TextInput') {
        commands.push({
          type: 'FILL_TEXT',
          rect: {
            x: layout.x + 8,
            y: layout.y + 4,
            width: layout.width - 16,
            height: layout.height - 8
          },
          text: node.props.value || node.props.placeholder || '',
          style: {
            color: node.props.value ? (style as TextStyleProperties).color || '#FFFFFF' : '#8E8E93',
            fontSize: (style as TextStyleProperties).fontSize || 14
          }
        });
      }
    }

    // Render children
    for (const childId of node.children) {
      this.compileRenderTreeNodes(childId, nodes, commands);
    }
  }

  private compileSystemUILayers(
    shellState: DeviceShellState,
    commands: DrawCommand[]
  ): void {
    const profile = shellState.profile;

    // Status Bar
    commands.push({
      type: 'STATUS_BAR',
      rect: { x: 0, y: 0, width: profile.width, height: profile.statusBarHeight },
      style: {
        time: shellState.statusBar.time,
        style: shellState.statusBar.style,
        batteryLevel: shellState.statusBar.batteryLevel,
        isCharging: shellState.statusBar.isCharging,
        wifiLevel: shellState.statusBar.wifiLevel,
        cellularBars: shellState.statusBar.cellularBars
      }
    });

    // Dynamic Island / Cutout
    if (profile.cutout.type === 'dynamic_island') {
      const cutout = profile.cutout;
      const isExpanded = shellState.dynamicIsland.mode === 'expanded';
      const width = isExpanded ? Math.min(360, profile.width - 32) : cutout.width;
      const height = isExpanded ? 84 : cutout.height;
      const x = (profile.width - width) / 2;

      commands.push({
        type: 'DYNAMIC_ISLAND',
        rect: { x, y: cutout.top, width, height },
        style: {
          cornerRadius: isExpanded ? 36 : cutout.cornerRadius,
          mode: shellState.dynamicIsland.mode,
          state: shellState.dynamicIsland
        }
      });
    }

    // Home indicator bar (iOS) or Navigation pill (Android)
    if (profile.platform === 'ios' && profile.safeAreaInsets.bottom > 0) {
      const barWidth = 134;
      const barHeight = 5;
      commands.push({
        type: 'HOME_INDICATOR',
        rect: {
          x: (profile.width - barWidth) / 2,
          y: profile.height - 8 - barHeight,
          width: barWidth,
          height: barHeight
        },
        style: {
          color: shellState.theme === 'dark' ? '#FFFFFF' : '#000000',
          opacity: 0.6
        }
      });
    }

    // Virtual Software Keyboard
    if (shellState.keyboard.isOpen) {
      const kHeight = shellState.keyboard.height;
      commands.push({
        type: 'KEYBOARD',
        rect: {
          x: 0,
          y: profile.height - kHeight,
          width: profile.width,
          height: kHeight
        },
        style: {
          layout: shellState.keyboard.layout,
          theme: shellState.theme
        }
      });
    }
  }

  /**
   * Evaluates Liquid Glass styling for floating panels and navigation bars.
   */
  public createLiquidGlassSurface(rect: LayoutRect, opacity: number = 0.75): DrawCommand {
    return {
      type: 'LIQUID_GLASS_SURFACE',
      rect,
      style: {
        backgroundColor: `rgba(255, 255, 255, ${opacity * 0.15})`,
        backdropFilter: 'blur(24px) saturate(180%)',
        borderColor: 'rgba(255, 255, 255, 0.25)',
        borderWidth: 1,
        borderRadius: 20,
        specularHighlight: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 100%)'
      }
    };
  }
}
