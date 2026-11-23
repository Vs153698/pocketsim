---
name: pocketsim-performance
description: How to profile frame rates, layout latency, and worker communication in PocketSim.
---

# PocketSim Performance Profiling

PocketSim provides lightweight performance telemetry:

1. **Frame Clock**: Target 60 / 120 FPS display pacer.
2. **Layout Latency**: Sub-millisecond Flexbox calculations via Yoga-compatible layout solver.
3. **Memory Footprint**: Target <120 MB RAM (fraction of iOS Simulator's 2.5 GB).
4. **Interaction Latency**: <50 ms touch-to-commit response.
