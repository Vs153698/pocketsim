---
name: pocketsim-debug
description: How to debug React Native runtime exceptions, render failures, and console logs in PocketSim.
---

# PocketSim Debugging Guide

When an application fails to render or behaves unexpectedly:

## 1. Inspect Recent Semantic Events
```bash
pocketsim what-happened
```
Returns recent taps, navigation pushes, and hardware state changes leading up to the issue.

## 2. Inspect Runtime and Console Logs
```bash
pocketsim logs
```
Inspects uncaught React exceptions, redbox stack traces, and Metro compiler errors.

## 3. Invalidate & Trigger Fast Refresh
```bash
pocketsim reload
```
Forces an immediate bundle re-evaluation and shadow tree layout refresh.
