---
name: pocketsim-ui-testing
description: How to execute the deterministic READ -> LOCATE -> ACT -> WAIT -> VERIFY -> REPORT UI testing workflow in PocketSim.
---

# PocketSim Deterministic UI Testing

All AI agent interactions MUST follow this 6-step state machine:

## The 6-Step Loop

1. **READ**:
   ```bash
   pocketsim describe
   ```
   Inspect active screen elements, testIDs, and inputs.

2. **LOCATE**:
   Locate targeted element by `--testID`, `--text`, or `--role`.

3. **ACT**:
   ```bash
   pocketsim tap --testID "login-button"
   pocketsim type "email-input" "test@example.com"
   ```

4. **WAIT**:
   ```bash
   pocketsim wait --text "Dashboard"
   ```

5. **VERIFY**:
   ```bash
   pocketsim describe
   ```
   Confirm that expected elements are visible and in correct actionable state.

6. **REPORT**:
   Emit concise markdown step results with evidence.
