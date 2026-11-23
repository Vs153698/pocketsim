---
name: pocketsim-visual-review
description: How to perform visual regression review, layout checks, and safe-area compliance testing in PocketSim.
---

# PocketSim Visual Review

Teaches AI agents how to inspect visual fidelity, detect safe-area violations, and catch layout overflow anomalies.

## Workflow

1. **Dump Semantic Tree & Coordinates**:
   ```bash
   pocketsim tree
   ```
   Inspect element bounds (`x`, `y`, `width`, `height`) against device physical metrics.

2. **Check Safe-Area Inset Violations**:
   Verify that headers, floating action buttons, and bottom tab bars respect:
   - Dynamic Island / Notch safe area (`top: 59px` on iPhone 15 Pro)
   - Home indicator bar (`bottom: 34px`)

3. **Take Snapshot for Verification**:
   ```bash
   pocketsim screenshot
   ```
