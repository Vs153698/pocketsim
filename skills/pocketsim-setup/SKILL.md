---
name: pocketsim-setup
description: How to start, initialize, and attach PocketSim to React Native and Expo projects.
---

# PocketSim Setup & Project Attachment

This skill instructs an AI coding agent how to detect and launch a React Native or Expo project using PocketSim.

## Workflow

1. **Verify Environment**:
   ```bash
   pocketsim doctor
   ```
   Ensures Node.js, Metro ports, and the PocketSim Local Bridge daemon are operating correctly.

2. **Check Compatibility**:
   ```bash
   pocketsim compat
   ```
   Inspects `package.json` against the PocketSim Native Compatibility Registry to ensure zero native build blockers.

3. **Launch Virtual Development Environment**:
   ```bash
   pocketsim dev
   ```
   Or targeting a specific platform/device:
   ```bash
   pocketsim dev --device iphone-15-pro
   pocketsim dev --device pixel-8
   ```

4. **Verify Session Readiness**:
   ```bash
   pocketsim describe
   ```
   Confirms that the initial screen rendered with valid accessibility nodes.
