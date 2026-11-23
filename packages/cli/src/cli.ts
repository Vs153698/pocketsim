#!/usr/bin/env node

import {
  runDoctor,
  runInit,
  runDevices,
  runCompat,
  runDev,
  runDescribe,
  runTree,
  runTap,
  runType,
  runSensors,
  runTest,
  runQA
} from './commands.js';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  switch (command) {
    case 'doctor':
      await runDoctor();
      break;
    case 'init':
      runInit();
      break;
    case 'devices':
      runDevices();
      break;
    case 'compat':
      runCompat();
      break;
    case 'dev': {
      let device = 'iphone-15-pro';
      const devIdx = args.indexOf('--device');
      if (devIdx !== -1 && args[devIdx + 1]) {
        device = args[devIdx + 1];
      }
      await runDev({ device });
      break;
    }
    case 'describe':
      await runDescribe(args[1]);
      break;
    case 'tree':
      await runTree(args[1]);
      break;
    case 'tap': {
      const text = args[1]?.startsWith('--text') ? args[2] : undefined;
      const testID = args[1]?.startsWith('--testID') || args[1]?.startsWith('--id') ? args[2] : (text ? undefined : args[1]);
      await runTap({ text, testID });
      break;
    }
    case 'type': {
      const target = args[1];
      const text = args[2] || '';
      await runType({ testID: target }, text);
      break;
    }
    case 'sensors':
      await runSensors(args[1], args[2]);
      break;
    case 'test':
      if (!args[1]) {
        console.error('Usage: pocketsim test <flow.yaml>');
        process.exit(1);
      }
      await runTest(args[1]);
      break;
    case 'qa':
      await runQA();
      break;
    case 'help':
    default:
      console.log(`
PocketSim — Lightweight AI-Native React Native Simulator

Usage: pocketsim <command> [options]

Commands:
  dev             Start local bridge, Metro connection and virtual mobile device
  doctor          Verify system setup and environment
  init            Initialize pocketsim.config.json in project
  compat          Check package.json compatibility with native module registry
  devices         List available virtual device profiles
  describe        Inspect active mobile screen (AI agent semantic snapshot)
  tree            Print full accessibility element hierarchy
  tap             Tap on element by --text or --testID
  type            Type text into targeted input
  sensors         Inspect or update GPS, Battery, Network, and Motion
  test <file>     Run Maestro-compatible YAML automated UI test flow
  qa              Run complete 25-step QA suite with report generation
`);
      break;
  }
}

main().catch(err => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});
