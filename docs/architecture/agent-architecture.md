# PocketSim AI Agent Architecture & Protocol Specification

## 1. Overview

PocketSim is built from the ground up to be **AI-Native**. AI coding agents (such as Claude Code, Codex, Cursor, Gemini CLI, or custom autonomous test agents) interact with mobile applications not by brittle coordinate guesses or OCR on screenshots, but via **structured semantic inspection** and **deterministic atomic action commands**.

---

## 2. The Core Interaction Paradigm: READ → LOCATE → ACT → WAIT → VERIFY → REPORT

Every AI interaction follows a deterministic state machine:

```
┌─────────┐      ┌──────────┐      ┌────────┐      ┌────────┐      ┌──────────┐      ┌──────────┐
│  READ   │ ───► │  LOCATE  │ ───► │  ACT   │ ───► │  WAIT  │ ───► │  VERIFY  │ ───► │  REPORT  │
└─────────┘      └──────────┘      └────────┘      └────────┘      └──────────┘      └──────────┘
Inspect           Find element     Dispatch         Wait for        Check new         Output step
semantic tree    by role/testID   tap/type/swipe   render idle     accessibility     results &
& state          or text query    action           & animations    tree assertion    evidence
```

### 2.1 Atomic Commands
1. **`pocketsim describe`**: Outputs a structured overview of the active screen: screen title, interactive elements, text inputs, alerts, navigation header, and error counts.
2. **`pocketsim tree`**: Dumps the complete semantic accessibility tree with testIDs, roles, labels, and normalized bounding boxes `[x, y, w, h]`.
3. **`pocketsim find <selector>`**: Query elements by `--testID`, `--text`, `--role`, or regex.
4. **`pocketsim tap <target>`**: Synthesizes a native touch down/up event sequence on the matched element or coordinate.
5. **`pocketsim type <target> <text>`**: Focuses the input element, opens the virtual keyboard, types characters with simulated keystroke timing, and dispatches `onChangeText`.
6. **`pocketsim swipe / scroll <direction>`**: Simulates momentum swipe or drag gestures with realistic physics.
7. **`pocketsim wait <condition>`**: Waits for `idle`, `--text <value>`, `--testID <value>`, or timeout.
8. **`pocketsim assert visible <text/testID>`**: Verifies UI state and exits with non-zero code if violated.
9. **`pocketsim screenshot`**: Saves a clean PNG snapshot of the device screen.
10. **`pocketsim what-happened`**: Returns the semantic event timeline (recent taps, navigation transitions, network requests, errors).

---

## 3. Multi-Agent Session Isolation & Leases

To support multi-agent swarms without collision:
- **Session Leasing**: Any agent performing state-changing actions (`tap`, `type`, `set-sensor`) must acquire a lease (`pocketsim claim <session-id> --ttl 60s`).
- **Read-Only Sharing**: Multiple agents can inspect the screen, read the tree, and view logs concurrently without taking a lock.
- **Heartbeat & Auto-Expiry**: Leases automatically expire if the agent disconnects or crashes, preventing deadlock.

---

## 4. Model Context Protocol (MCP) Server

PocketSim provides an integrated MCP server exposing all simulator controls as standard MCP tools:
- `pocketsim_describe_screen`
- `pocketsim_get_accessibility_tree`
- `pocketsim_tap_element`
- `pocketsim_type_text`
- `pocketsim_scroll_view`
- `pocketsim_set_sensor_value`
- `pocketsim_set_permission`
- `pocketsim_capture_screenshot`
- `pocketsim_get_logs`
- `pocketsim_run_test_flow`

This allows AI agents in MCP-enabled environments (such as Antigravity, Claude Desktop, Cursor) to interact directly via function calls.
