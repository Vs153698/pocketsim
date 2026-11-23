import { LayoutRect, ViewStyleProperties, RenderNode } from '@pocketsim/shared-types';

/**
 * High-performance pure-TypeScript Flexbox Layout Solver (Yoga-compatible semantics).
 * Resolves width, height, margin, padding, flexGrow, flexShrink, flexDirection,
 * justifyContent, and alignItems for hierarchical render trees.
 */
export function computeTreeLayout(
  rootId: string,
  nodes: Record<string, RenderNode>,
  viewportWidth: number,
  viewportHeight: number
): void {
  const root = nodes[rootId];
  if (!root) return;

  // Root layout matches viewport
  root.layout = {
    x: 0,
    y: 0,
    width: parseDimension(root.style.width, viewportWidth, viewportWidth),
    height: parseDimension(root.style.height, viewportHeight, viewportHeight)
  };

  computeNodeChildrenLayout(root, nodes);
}

function parseDimension(val: number | string | undefined, parentSize: number, defaultVal: number): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string' && val.endsWith('%')) {
    const pct = parseFloat(val) / 100;
    return isNaN(pct) ? defaultVal : parentSize * pct;
  }
  return defaultVal;
}

function computeNodeChildrenLayout(parent: RenderNode, nodes: Record<string, RenderNode>): void {
  const style = parent.style as ViewStyleProperties;
  const isRow = style.flexDirection === 'row' || style.flexDirection === 'row-reverse';
  const isReverse = style.flexDirection === 'row-reverse' || style.flexDirection === 'column-reverse';

  const paddingLeft = style.paddingLeft ?? style.paddingHorizontal ?? style.padding ?? 0;
  const paddingRight = style.paddingRight ?? style.paddingHorizontal ?? style.padding ?? 0;
  const paddingTop = style.paddingTop ?? style.paddingVertical ?? style.padding ?? 0;
  const paddingBottom = style.paddingBottom ?? style.paddingVertical ?? style.padding ?? 0;

  const contentWidth = Math.max(0, parent.layout.width - paddingLeft - paddingRight);
  const contentHeight = Math.max(0, parent.layout.height - paddingTop - paddingBottom);

  const mainAxisLength = isRow ? contentWidth : contentHeight;
  const crossAxisLength = isRow ? contentHeight : contentWidth;

  // Separate absolute and flow children
  const flowChildren: RenderNode[] = [];
  const absoluteChildren: RenderNode[] = [];

  for (const childId of parent.children) {
    const child = nodes[childId];
    if (!child) continue;
    if (child.style.position === 'absolute') {
      absoluteChildren.push(child);
    } else {
      flowChildren.push(child);
    }
  }

  // Handle absolute positioned children
  for (const child of absoluteChildren) {
    const cStyle = child.style;
    const w = parseDimension(cStyle.width, contentWidth, contentWidth);
    const h = parseDimension(cStyle.height, contentHeight, 50);

    let x = parent.layout.x + paddingLeft;
    let y = parent.layout.y + paddingTop;

    if (cStyle.left !== undefined) {
      x = parent.layout.x + cStyle.left;
    } else if (cStyle.right !== undefined) {
      x = parent.layout.x + parent.layout.width - w - cStyle.right;
    }

    if (cStyle.top !== undefined) {
      y = parent.layout.y + cStyle.top;
    } else if (cStyle.bottom !== undefined) {
      y = parent.layout.y + parent.layout.height - h - cStyle.bottom;
    }

    child.layout = { x, y, width: w, height: h };
    computeNodeChildrenLayout(child, nodes);
  }

  if (flowChildren.length === 0) return;

  // Calculate base sizes and total flex
  let totalFlexGrow = 0;
  let fixedMainAxisOccupied = 0;

  const childSizes: Array<{ main: number; cross: number }> = [];

  for (const child of flowChildren) {
    const cStyle = child.style;
    const flex = cStyle.flexGrow ?? cStyle.flex ?? 0;
    totalFlexGrow += Math.max(0, flex);

    const mLeft = cStyle.marginLeft ?? cStyle.marginHorizontal ?? cStyle.margin ?? 0;
    const mRight = cStyle.marginRight ?? cStyle.marginHorizontal ?? cStyle.margin ?? 0;
    const mTop = cStyle.marginTop ?? cStyle.marginVertical ?? cStyle.margin ?? 0;
    const mBottom = cStyle.marginBottom ?? cStyle.marginVertical ?? cStyle.margin ?? 0;

    const childMainMargin = isRow ? (mLeft + mRight) : (mTop + mBottom);
    const childCrossMargin = isRow ? (mTop + mBottom) : (mLeft + mRight);

    let baseMain = isRow
      ? (typeof cStyle.width === 'number' ? cStyle.width : (cStyle.width ? parseDimension(cStyle.width, contentWidth, 50) : 0))
      : (typeof cStyle.height === 'number' ? cStyle.height : (cStyle.height ? parseDimension(cStyle.height, contentHeight, 30) : 0));

    // Text elements without explicit dimension default to intrinsic text estimation
    if (child.type === 'Text' && baseMain === 0) {
      baseMain = isRow ? Math.min(200, (child.text?.length || 5) * 8) : 24;
    }

    let baseCross = isRow
      ? (typeof cStyle.height === 'number' ? cStyle.height : (cStyle.height ? parseDimension(cStyle.height, contentHeight, contentHeight) : contentHeight))
      : (typeof cStyle.width === 'number' ? cStyle.width : (cStyle.width ? parseDimension(cStyle.width, contentWidth, contentWidth) : contentWidth));

    if (child.type === 'Text' && !isRow && typeof cStyle.height !== 'number') {
      baseCross = Math.min(contentWidth, (child.text?.length || 5) * 8);
    }

    childSizes.push({ main: baseMain + childMainMargin, cross: baseCross + childCrossMargin });
    fixedMainAxisOccupied += (flex === 0 ? baseMain + childMainMargin : 0);
  }

  const remainingMainAxis = Math.max(0, mainAxisLength - fixedMainAxisOccupied);

  // Distribute flex
  for (let i = 0; i < flowChildren.length; i++) {
    const child = flowChildren[i];
    const flex = child.style.flexGrow ?? child.style.flex ?? 0;
    if (flex > 0 && totalFlexGrow > 0) {
      childSizes[i].main = (flex / totalFlexGrow) * remainingMainAxis;
    }
  }

  // Positioning along main axis (justifyContent)
  const totalOccupied = childSizes.reduce((acc, s) => acc + s.main, 0);
  let mainOffset = 0;
  let spacing = 0;

  const justify = style.justifyContent || 'flex-start';
  if (justify === 'center') {
    mainOffset = Math.max(0, (mainAxisLength - totalOccupied) / 2);
  } else if (justify === 'flex-end') {
    mainOffset = Math.max(0, mainAxisLength - totalOccupied);
  } else if (justify === 'space-between' && flowChildren.length > 1) {
    spacing = Math.max(0, (mainAxisLength - totalOccupied) / (flowChildren.length - 1));
  } else if (justify === 'space-around') {
    spacing = Math.max(0, (mainAxisLength - totalOccupied) / flowChildren.length);
    mainOffset = spacing / 2;
  } else if (justify === 'space-evenly') {
    spacing = Math.max(0, (mainAxisLength - totalOccupied) / (flowChildren.length + 1));
    mainOffset = spacing;
  }

  let currentMain = (isReverse ? (mainAxisLength - mainOffset) : mainOffset);

  for (let i = 0; i < flowChildren.length; i++) {
    const child = flowChildren[i];
    const size = childSizes[i];
    const cStyle = child.style;

    const mLeft = cStyle.marginLeft ?? cStyle.marginHorizontal ?? cStyle.margin ?? 0;
    const mTop = cStyle.marginTop ?? cStyle.marginVertical ?? cStyle.margin ?? 0;

    // Cross-axis alignment (alignItems)
    const align = cStyle.alignSelf || style.alignItems || 'stretch';
    let crossOffset = 0;
    let actualCross = size.cross;

    if (align === 'center') {
      crossOffset = Math.max(0, (crossAxisLength - actualCross) / 2);
    } else if (align === 'flex-end') {
      crossOffset = Math.max(0, crossAxisLength - actualCross);
    } else if (align === 'stretch' && (!cStyle.width || !isRow) && (!cStyle.height || isRow)) {
      actualCross = crossAxisLength;
    }

    let nodeX: number;
    let nodeY: number;
    let nodeW: number;
    let nodeH: number;

    if (isRow) {
      nodeW = Math.max(0, size.main);
      nodeH = Math.max(0, actualCross);
      nodeX = parent.layout.x + paddingLeft + currentMain + mLeft;
      nodeY = parent.layout.y + paddingTop + crossOffset + mTop;
      currentMain += nodeW + spacing;
    } else {
      nodeW = Math.max(0, actualCross);
      nodeH = Math.max(0, size.main);
      nodeX = parent.layout.x + paddingLeft + crossOffset + mLeft;
      nodeY = parent.layout.y + paddingTop + currentMain + mTop;
      currentMain += nodeH + spacing;
    }

    child.layout = { x: nodeX, y: nodeY, width: nodeW, height: nodeH };
    computeNodeChildrenLayout(child, nodes);
  }
}
