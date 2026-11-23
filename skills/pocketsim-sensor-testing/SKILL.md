---
name: pocketsim-sensor-testing
description: How to simulate GPS, GPX route playback, battery states, network throttling, and motion sensors in PocketSim.
---

# PocketSim Sensor & Hardware Simulation

## Sensor Testing Commands

1. **GPS & Location Coordinates**:
   ```bash
   pocketsim sensors gps 37.7749,-122.4194
   ```

2. **Battery & Power States**:
   ```bash
   pocketsim sensors battery 0.15
   ```

3. **Network Conditioning Presets**:
   ```bash
   pocketsim sensors network slow_2g
   pocketsim sensors network offline
   pocketsim sensors network wifi
   ```

4. **Accelerometer & Shake**:
   ```bash
   pocketsim sensors shake
   ```

5. **Permissions Management**:
   ```bash
   pocketsim permissions set location granted
   pocketsim permissions set camera denied
   ```
