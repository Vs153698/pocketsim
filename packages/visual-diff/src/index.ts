import { ScreenSnapshot, AccessibilityElement, DeviceProfile } from '@pocketsim/shared-types';

export interface LayoutAnomaly {
  type: 'SAFE_AREA_VIOLATION' | 'OVERFLOW' | 'CLIPPED_TEXT' | 'MISALIGNED';
  elementId: string;
  description: string;
  severity: 'warning' | 'error';
}

export interface StructuralDiffResult {
  hasDifferences: boolean;
  addedElements: string[];
  removedElements: string[];
  movedElements: Array<{ id: string; oldBounds: any; newBounds: any; deltaY: number }>;
  anomalies: LayoutAnomaly[];
}

export class VisualDiffEngine {
  /**
   * Compares two semantic snapshots and detects layout drift and anomalies.
   */
  public compareSnapshots(
    baseline: ScreenSnapshot,
    current: ScreenSnapshot,
    profile?: DeviceProfile
  ): StructuralDiffResult {
    const baseMap = new Map<string, AccessibilityElement>();
    this.flattenElements(baseline.elements, baseMap);

    const currMap = new Map<string, AccessibilityElement>();
    this.flattenElements(current.elements, currMap);

    const addedElements: string[] = [];
    const removedElements: string[] = [];
    const movedElements: Array<{ id: string; oldBounds: any; newBounds: any; deltaY: number }> = [];

    for (const [id, currElem] of currMap) {
      const baseElem = baseMap.get(id);
      if (!baseElem) {
        addedElements.push(currElem.testID || id);
      } else {
        const dy = Math.abs(currElem.bounds.y - baseElem.bounds.y);
        const dx = Math.abs(currElem.bounds.x - baseElem.bounds.x);
        if (dy > 2 || dx > 2) {
          movedElements.push({
            id: currElem.testID || id,
            oldBounds: baseElem.bounds,
            newBounds: currElem.bounds,
            deltaY: dy
          });
        }
      }
    }

    for (const [id, baseElem] of baseMap) {
      if (!currMap.has(id)) {
        removedElements.push(baseElem.testID || id);
      }
    }

    const anomalies: LayoutAnomaly[] = [];
    if (profile) {
      anomalies.push(...this.checkSafeAreaViolations(current, profile));
    }

    const hasDifferences = addedElements.length > 0 || removedElements.length > 0 || movedElements.length > 0 || anomalies.length > 0;

    return {
      hasDifferences,
      addedElements,
      removedElements,
      movedElements,
      anomalies
    };
  }

  public checkSafeAreaViolations(snapshot: ScreenSnapshot, profile: DeviceProfile): LayoutAnomaly[] {
    const anomalies: LayoutAnomaly[] = [];
    const insets = profile.safeAreaInsets;
    const allElements = new Map<string, AccessibilityElement>();
    this.flattenElements(snapshot.elements, allElements);

    for (const [id, elem] of allElements) {
      // If actionable button or input intrudes into top notch/dynamic island area without being a header
      if (elem.isActionable && elem.bounds.y < insets.top && elem.bounds.height > 0) {
        anomalies.push({
          type: 'SAFE_AREA_VIOLATION',
          elementId: elem.testID || id,
          description: `Actionable element "${elem.label || elem.testID || id}" (y=${elem.bounds.y}) is clipped by top safe area inset (${insets.top}px).`,
          severity: 'error'
        });
      }

      // Check bottom safe area inset violation
      const bottomLimit = profile.height - insets.bottom;
      if (elem.isActionable && (elem.bounds.y + elem.bounds.height) > bottomLimit && elem.bounds.y < bottomLimit) {
        anomalies.push({
          type: 'SAFE_AREA_VIOLATION',
          elementId: elem.testID || id,
          description: `Actionable element "${elem.label || elem.testID || id}" extends into home indicator bottom safe area.`,
          severity: 'warning'
        });
      }

      // Check screen edge horizontal overflow
      if (elem.bounds.x + elem.bounds.width > profile.width + 1) {
        anomalies.push({
          type: 'OVERFLOW',
          elementId: elem.testID || id,
          description: `Element "${elem.testID || id}" overflows screen width (${elem.bounds.x + elem.bounds.width}px > ${profile.width}px).`,
          severity: 'error'
        });
      }
    }

    return anomalies;
  }

  private flattenElements(elements: AccessibilityElement[], map: Map<string, AccessibilityElement>): void {
    for (const elem of elements) {
      map.set(elem.testID || elem.id, elem);
      if (elem.children) {
        this.flattenElements(elem.children, map);
      }
    }
  }
}
