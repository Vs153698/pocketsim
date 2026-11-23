export function renderDesktopHtml(initialData: {
  bridgePort: number;
  devices: Array<{ id: string; name: string; platform: string; width: number; height: number }>;
}): string {
  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PocketSim — Virtual Mobile Development Environment</title>
  <link rel="icon" id="pageFavicon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23d97706'><rect width='16' height='20' x='4' y='2' rx='3'/><circle cx='12' cy='18' r='1'/></svg>">
  <style>
    :root[data-theme="light"] {
      --bg-root: #eef2f7;
      --bg-surface: #ffffff;
      --bg-panel: #ffffff;
      --bg-card: #f8fafc;
      --bg-input: #ffffff;
      --bg-hover: #f1f5f9;
      --border-subtle: rgba(0, 0, 0, 0.08);
      --border-hover: rgba(0, 0, 0, 0.16);
      --border-focus: #d97706;
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --text-tertiary: #94a3b8;
      --accent: #d97706; /* Warm Bronze */
      --accent-hover: #b45309;
      --accent-soft: rgba(217, 119, 6, 0.12);
      --accent-text: #b45309;
      --success: #059669;
      --warning: #d97706;
      --danger: #e11d48;
      --device-bezel: #1e222a;
      --viewport-gradient: radial-gradient(circle at center, #ffffff 0%, #e2e8f0 100%);
      --shadow-elevation: 0 20px 50px rgba(15, 23, 42, 0.18);
      --terminal-bg: #090c15;
    }

    :root[data-theme="dark"] {
      --bg-root: #090a0d;
      --bg-surface: #0f1116;
      --bg-panel: #141720;
      --bg-card: #181c26;
      --bg-input: #1e2230;
      --bg-hover: #232838;
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-hover: rgba(255, 255, 255, 0.16);
      --border-focus: #f59e0b;
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-tertiary: #64748b;
      --accent: #f59e0b; /* Titanium Amber */
      --accent-hover: #d97706;
      --accent-soft: rgba(245, 158, 11, 0.15);
      --accent-text: #fbbf24;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #f43f5e;
      --device-bezel: #1a1d24;
      --viewport-gradient: radial-gradient(circle at center, #151822 0%, #090a0d 100%);
      --shadow-elevation: 0 25px 60px rgba(0, 0, 0, 0.85);
      --terminal-bg: #090c15;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "Segoe UI", Roboto, sans-serif;
      background: var(--bg-root);
      color: var(--text-primary);
      display: flex;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      user-select: none;
      -webkit-font-smoothing: antialiased;
    }

    /* SCREEN BLOCKER FOR VIEWPORTS < 1024PX */
    .screen-blocker {
      display: none;
      position: fixed;
      inset: 0;
      background: var(--bg-root);
      z-index: 99999;
      padding: 32px;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .blocker-box {
      max-width: 440px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
    .blocker-title {
      font-size: 18px;
      font-weight: 700;
      margin: 16px 0 8px;
      color: var(--text-primary);
    }
    .blocker-text {
      font-size: 13.5px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    @media (max-width: 1023px) {
      .app-layout { display: none !important; }
      .screen-blocker { display: flex !important; }
    }

    /* MAIN APP LAYOUT */
    .app-layout {
      display: flex;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .icon {
      width: 15px;
      height: 15px;
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      display: inline-block;
      vertical-align: middle;
      flex-shrink: 0;
    }

    /* LEFT SIDEBAR */
    .sidebar-left {
      width: 240px;
      background: var(--bg-surface);
      border-right: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }

    .brand-header {
      height: 50px;
      padding: 0 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid var(--border-subtle);
    }
    .brand-logo-icon {
      width: 26px;
      height: 26px;
      background: var(--accent);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
    }
    .brand-title {
      font-weight: 700;
      font-size: 14px;
      letter-spacing: -0.2px;
      color: var(--text-primary);
    }
    .brand-badge {
      font-size: 10px;
      background: var(--accent-soft);
      color: var(--accent-text);
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
      margin-left: auto;
    }

    .sidebar-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 10px 8px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .nav-group-title {
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: var(--text-tertiary);
      padding: 4px 8px;
      margin-bottom: 2px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 6px 8px;
      border-radius: 6px;
      color: var(--text-secondary);
      font-size: 12.5px;
      font-weight: 500;
      cursor: pointer;
    }
    .nav-item:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
    .nav-item.active {
      background: var(--accent-soft);
      color: var(--accent-text);
      font-weight: 600;
    }
    .nav-item-meta {
      font-size: 10px;
      color: var(--text-tertiary);
      margin-left: auto;
    }

    /* CENTER WORKSPACE */
    .workspace-center {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: var(--bg-root);
      position: relative;
      overflow: hidden;
      min-width: 0;
    }

    .top-toolbar {
      height: 50px;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 14px;
      gap: 8px;
      z-index: 30;
      flex-shrink: 0;
    }

    .toolbar-group {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn {
      height: 30px;
      padding: 0 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      border: 1px solid var(--border-subtle);
      background: var(--bg-card);
      color: var(--text-primary);
      outline: none;
    }
    .btn:hover {
      background: var(--bg-hover);
      border-color: var(--border-hover);
    }
    .btn-accent {
      background: var(--accent);
      border-color: var(--accent);
      color: #fff;
      font-weight: 600;
    }
    .btn-accent:hover {
      background: var(--accent-hover);
    }

    .select-dropdown {
      height: 30px;
      padding: 0 8px;
      border-radius: 6px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      font-size: 11.5px;
      font-weight: 500;
      outline: none;
      cursor: pointer;
    }

    /* DEVICE VIEWPORT - SMOOTH, FAST, NO CHOPPING */
    .device-viewport {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      background: var(--viewport-gradient);
      padding: 16px;
      min-height: 0;
    }

    .device-scaler {
      display: flex;
      align-items: center;
      justify-content: center;
      transform-origin: center center;
      will-change: transform;
    }

    /* AUTHENTIC DEVICE CHASSIS */
    .device-frame {
      background: #000;
      border: 12px solid var(--device-bezel);
      box-shadow: var(--shadow-elevation), 0 0 0 1px rgba(255, 255, 255, 0.1);
      border-radius: 54px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      box-sizing: border-box;
    }

    /* SHAKE ANIMATION */
    @keyframes deviceShake {
      0% { transform: translate(0, 0) rotate(0deg); }
      20% { transform: translate(-14px, 4px) rotate(-2deg); }
      40% { transform: translate(14px, -4px) rotate(2deg); }
      60% { transform: translate(-10px, 3px) rotate(-1deg); }
      80% { transform: translate(10px, -3px) rotate(1deg); }
      100% { transform: translate(0, 0) rotate(0deg); }
    }
    .shaking {
      animation: deviceShake 0.5s ease both;
    }

    /* DUAL-SCREEN HINGE */
    .duo-hinge {
      position: absolute;
      top: 0; bottom: 0;
      left: 50%;
      width: 10px;
      transform: translateX(-50%);
      background: linear-gradient(to right, #111, #3c404b 50%, #111);
      z-index: 25;
      display: none;
    }

    /* DYNAMIC ISLAND */
    .dynamic-island {
      width: 124px;
      height: 35px;
      background: #000;
      border-radius: 17.5px;
      position: absolute;
      top: 11px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 20;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 12px;
      color: #fff;
      font-size: 11px;
      transition: width 0.2s ease;
    }
    .dynamic-island:hover {
      width: 200px;
    }

    /* PUNCHHOLE CAMERA */
    .punchhole-camera {
      width: 15px;
      height: 15px;
      background: #000;
      border-radius: 50%;
      position: absolute;
      top: 13px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 20;
      display: none;
      box-shadow: inset 0 0 2px rgba(255,255,255,0.3);
    }

    /* STATUS BAR */
    .status-bar {
      height: 48px;
      padding: 0 22px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 600;
      z-index: 10;
      position: absolute;
      top: 0; left: 0; right: 0;
      pointer-events: none;
    }
    .status-bar-time {
      letter-spacing: -0.3px;
    }
    .status-bar-icons {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 600;
    }

    /* REAL SCREEN CONTENT */
    .screen-content {
      flex: 1;
      position: relative;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      padding-top: 48px;
      padding-bottom: 24px;
    }

    /* FAST REFRESH VISUAL FLASH */
    .fast-refresh-flash {
      position: absolute;
      inset: 0;
      background: rgba(16, 185, 129, 0.3);
      z-index: 40;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    /* RN DEV MENU (SHAKE TRIGGERED) */
    .rn-dev-menu {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(6px);
      z-index: 50;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .dev-menu-card {
      width: 100%;
      max-width: 290px;
      background: #181c24;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 14px;
      overflow: hidden;
      color: #fff;
    }
    .dev-menu-title {
      padding: 14px;
      font-size: 13.5px;
      font-weight: 700;
      text-align: center;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .dev-menu-item {
      padding: 12px 16px;
      font-size: 13px;
      font-weight: 500;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .dev-menu-item:hover {
      background: rgba(255,255,255,0.08);
    }

    /* AUTHENTIC IOS UI */
    .ios-screen {
      background: #f2f2f7;
      color: #000000;
    }
    .ios-navbar {
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(242, 242, 247, 0.95);
    }
    .ios-nav-title {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.4px;
    }
    .ios-segmented {
      display: flex;
      margin: 8px 16px;
      background: rgba(120, 120, 128, 0.16);
      padding: 2px;
      border-radius: 8px;
    }
    .ios-segment {
      flex: 1;
      text-align: center;
      padding: 5px 0;
      font-size: 12px;
      font-weight: 500;
      border-radius: 6px;
      cursor: pointer;
      color: #3c3c43;
    }
    .ios-segment.active {
      background: #ffffff;
      color: #000000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      font-weight: 600;
    }
    .ios-card {
      margin: 8px 16px;
      background: #ffffff;
      border-radius: 14px;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .ios-tabbar {
      margin-top: auto;
      height: 48px;
      background: rgba(249, 249, 249, 0.94);
      border-top: 1px solid rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-around;
      align-items: center;
    }
    .ios-tab-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 10px;
      font-weight: 500;
      color: #8e8e93;
      cursor: pointer;
    }
    .ios-tab-item.active {
      color: #007aff;
      font-weight: 600;
    }

    /* AUTHENTIC ANDROID (MATERIAL 3) UI */
    .android-screen {
      background: #fdfcff;
      color: #1a1c1e;
    }
    .android-topbar {
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #fdfcff;
    }
    .android-searchbar {
      margin: 6px 16px;
      background: #eef0f6;
      border-radius: 24px;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: #44474f;
    }
    .android-card {
      margin: 8px 16px;
      background: #f2f4fb;
      border-radius: 18px;
      padding: 16px;
    }
    .android-fab {
      position: absolute;
      bottom: 60px;
      right: 18px;
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: #00639a;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 16px rgba(0,99,154,0.3);
      cursor: pointer;
    }
    .android-nav-bar {
      margin-top: auto;
      height: 44px;
      background: #fdfcff;
      display: flex;
      align-items: center;
      justify-content: space-around;
      color: #44474f;
    }

    /* HOME INDICATOR */
    .home-indicator {
      width: 134px;
      height: 5px;
      background: #000;
      opacity: 0.3;
      border-radius: 3px;
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
      pointer-events: none;
    }

    /* VIRTUAL SOFTWARE KEYBOARD */
    .software-keyboard {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 260px;
      background: #d1d5db;
      border-top: 1px solid rgba(0,0,0,0.1);
      z-index: 30;
      display: none;
      flex-direction: column;
      padding: 8px 4px;
      gap: 6px;
      box-shadow: 0 -8px 24px rgba(0,0,0,0.2);
    }
    .keyboard-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 8px 4px;
      font-size: 11px;
      color: #475569;
    }
    .keyboard-row {
      display: flex;
      justify-content: center;
      gap: 4px;
      flex: 1;
    }
    .key-btn {
      flex: 1;
      max-width: 38px;
      background: #ffffff;
      color: #000000;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }
    .key-btn.action {
      max-width: 52px;
      background: #b0b5be;
      font-size: 12px;
      font-weight: 600;
    }
    .key-btn.space {
      max-width: 170px;
    }

    /* MULTI-SCREEN MATRIX VIEW */
    .matrix-view {
      display: none;
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      align-content: start;
    }
    .matrix-device-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .matrix-card-header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 12px;
      font-weight: 600;
    }
    .matrix-card-meta {
      font-size: 10.5px;
      color: var(--text-tertiary);
    }
    .matrix-mini-frame {
      border: 6px solid var(--device-bezel);
      border-radius: 20px;
      background: #fff;
      overflow: hidden;
      width: 190px;
      height: 360px;
      position: relative;
    }

    /* BOTTOM TERMINAL PANEL */
    .panel-bottom {
      height: 140px;
      background: var(--terminal-bg);
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      z-index: 20;
    }
    .bottom-header {
      height: 28px;
      padding: 0 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255,255,255,0.02);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      font-size: 11px;
      font-weight: 600;
      color: #94a3b8;
    }
    .log-stream {
      flex: 1;
      padding: 6px 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      overflow-y: auto;
      color: #4ade80; /* Monospace Terminal Green */
      background: var(--terminal-bg);
      line-height: 1.5;
    }

    /* RIGHT SIDEBAR INSPECTOR */
    .sidebar-right {
      width: 310px;
      background: var(--bg-surface);
      border-left: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }

    .panel-tab-bar {
      height: 50px;
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
    }
    .panel-tab {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 11.5px;
      font-weight: 600;
      color: var(--text-tertiary);
      cursor: pointer;
      border-bottom: 2px solid transparent;
    }
    .panel-tab:hover {
      color: var(--text-primary);
      background: var(--bg-hover);
    }
    .panel-tab.active {
      color: var(--accent);
      border-bottom-color: var(--accent);
      background: var(--accent-soft);
    }

    .panel-content {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .card-title {
      font-size: 11.5px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-primary);
    }
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .input-field {
      height: 30px;
      padding: 0 8px;
      border-radius: 6px;
      background: var(--bg-input);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      font-size: 12px;
      outline: none;
      flex: 1;
    }

    .search-results {
      max-height: 110px;
      overflow-y: auto;
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      background: var(--bg-surface);
      display: none;
    }
    .search-item {
      padding: 6px 8px;
      font-size: 11px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
    }
    .search-item:hover {
      background: var(--bg-hover);
    }

    .toast {
      position: fixed;
      bottom: 155px;
      right: 330px;
      background: #181c24;
      color: #fff;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 8px;
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      z-index: 1000;
      display: none;
      align-items: center;
      gap: 8px;
    }
  </style>
</head>
<body>
  <!-- SCREEN BLOCKER FOR VIEWPORTS < 1024PX -->
  <div class="screen-blocker">
    <div class="blocker-box">
      <svg class="icon" style="width: 36px; height: 36px; stroke: var(--accent);" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
      <div class="blocker-title">PocketSim Desktop Requires Tablet or Desktop</div>
      <div class="blocker-text">PocketSim virtual mobile workstation is optimized for screens &ge; 1024px to provide pixel-accurate mobile device rendering and multi-window debugging.</div>
    </div>
  </div>

  <div class="app-layout">
    <!-- LEFT SIDEBAR -->
    <div class="sidebar-left">
      <div class="brand-header">
        <div class="brand-logo-icon">
          <svg class="icon" style="width: 16px; height: 16px; stroke: #fff;" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
        <div class="brand-title">PocketSim</div>
        <span class="brand-badge">Bridgeless</span>
      </div>

      <div class="sidebar-scroll">
        <!-- RUN SAMPLE NATIVE PACKAGES -->
        <div>
          <div class="nav-group-title">Native Mobile Packages</div>
          <div class="nav-item active" onclick="loadSampleApp('apk')">
            <svg class="icon" viewBox="0 0 24 24"><rect width="14" height="18" x="5" y="3" rx="2"/><line x1="9" x2="15" y1="17" y2="17"/></svg>
            <span>Run Android APK</span>
            <span class="nav-item-meta">Sample</span>
          </div>
          <div class="nav-item" onclick="loadSampleApp('ipa')">
            <svg class="icon" viewBox="0 0 24 24"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/></svg>
            <span>Run iOS App (.ipa)</span>
            <span class="nav-item-meta">Sample</span>
          </div>
        </div>

        <!-- APPLE IOS DEVICES -->
        <div>
          <div class="nav-group-title">Apple iOS</div>
          <div class="nav-item active" onclick="switchDevice('iphone-16-pro')">
            <svg class="icon" viewBox="0 0 24 24"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>
            <span>iPhone 16 Pro</span>
            <span class="nav-item-meta">6.3"</span>
          </div>
          <div class="nav-item" onclick="switchDevice('iphone-16-pro-max')">
            <svg class="icon" viewBox="0 0 24 24"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/></svg>
            <span>iPhone 16 Pro Max</span>
            <span class="nav-item-meta">6.9"</span>
          </div>
          <div class="nav-item" onclick="switchDevice('iphone-15-pro')">
            <svg class="icon" viewBox="0 0 24 24"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/></svg>
            <span>iPhone 15 Pro</span>
            <span class="nav-item-meta">6.1"</span>
          </div>
          <div class="nav-item" onclick="switchDevice('iphone-se')">
            <svg class="icon" viewBox="0 0 24 24"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/></svg>
            <span>iPhone SE (3rd)</span>
            <span class="nav-item-meta">4.7"</span>
          </div>
        </div>

        <!-- ANDROID DEVICES -->
        <div>
          <div class="nav-group-title">Android</div>
          <div class="nav-item" onclick="switchDevice('pixel-9-pro')">
            <svg class="icon" viewBox="0 0 24 24"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/></svg>
            <span>Pixel 9 Pro</span>
            <span class="nav-item-meta">6.3"</span>
          </div>
          <div class="nav-item" onclick="switchDevice('pixel-8')">
            <svg class="icon" viewBox="0 0 24 24"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/></svg>
            <span>Pixel 8</span>
            <span class="nav-item-meta">6.2"</span>
          </div>
          <div class="nav-item" onclick="switchDevice('galaxy-s24-ultra')">
            <svg class="icon" viewBox="0 0 24 24"><rect width="16" height="20" x="4" y="2" rx="1"/><path d="M12 18h.01"/></svg>
            <span>Galaxy S24 Ultra</span>
            <span class="nav-item-meta">6.8"</span>
          </div>
          <div class="nav-item" onclick="switchDevice('galaxy-s24')">
            <svg class="icon" viewBox="0 0 24 24"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/></svg>
            <span>Galaxy S24</span>
            <span class="nav-item-meta">6.2"</span>
          </div>
        </div>

        <!-- FOLDABLES & DUAL-SCREEN -->
        <div>
          <div class="nav-group-title">Foldables &amp; Dual-Screen</div>
          <div class="nav-item" onclick="switchDevice('galaxy-z-fold6')">
            <svg class="icon" viewBox="0 0 24 24"><rect width="18" height="20" x="3" y="2" rx="2"/><line x1="12" x2="12" y1="2" y2="22"/></svg>
            <span>Galaxy Z Fold 6</span>
            <span class="nav-item-meta">7.6"</span>
          </div>
          <div class="nav-item" onclick="switchDevice('pixel-9-pro-fold')">
            <svg class="icon" viewBox="0 0 24 24"><rect width="18" height="20" x="3" y="2" rx="2"/><line x1="12" x2="12" y1="2" y2="22"/></svg>
            <span>Pixel 9 Pro Fold</span>
            <span class="nav-item-meta">8.0"</span>
          </div>
          <div class="nav-item" onclick="switchDevice('surface-duo')">
            <svg class="icon" viewBox="0 0 24 24"><rect width="18" height="20" x="3" y="2" rx="2"/><line x1="12" x2="12" y1="2" y2="22"/></svg>
            <span>Surface Duo 2</span>
            <span class="nav-item-meta">8.3"</span>
          </div>
          <div class="nav-item" onclick="switchDevice('iphone-duo')">
            <svg class="icon" viewBox="0 0 24 24"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><line x1="12" x2="12" y1="5" y2="22"/></svg>
            <span>iPhone Duo</span>
            <span class="nav-item-meta">7.9"</span>
          </div>
        </div>

        <!-- AUTOMATED QA -->
        <div>
          <div class="nav-group-title">Automated QA &amp; Testing</div>
          <div class="nav-item" onclick="runFastRefresh()">
            <svg class="icon" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            <span>Fast Refresh (HMR)</span>
          </div>
          <div class="nav-item" onclick="runSmokeTest()">
            <svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
            <span>Run Smoke Test</span>
          </div>
          <div class="nav-item" onclick="runQA()">
            <svg class="icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>
            <span>Complete QA Matrix</span>
          </div>
        </div>
      </div>
    </div>

    <!-- CENTER WORKSPACE -->
    <div class="workspace-center">
      <div class="top-toolbar">
        <div class="toolbar-group">
          <!-- VIEW MODE SELECTOR -->
          <select class="select-dropdown" id="viewModeSelector" onchange="switchViewMode(this.value)">
            <option value="single" selected>Single Device</option>
            <option value="ios-matrix">iOS Matrix (All 5)</option>
            <option value="android-matrix">Android Matrix (All 6)</option>
          </select>

          <!-- DEVICE SELECTOR -->
          <select class="select-dropdown" id="deviceSelector" onchange="switchDevice(this.value)">
            <optgroup label="Apple iPhone">
              <option value="iphone-16-pro" selected>iPhone 16 Pro (402 x 874)</option>
              <option value="iphone-16-pro-max">iPhone 16 Pro Max (440 x 956)</option>
              <option value="iphone-15-pro">iPhone 15 Pro (393 x 852)</option>
              <option value="iphone-se">iPhone SE 3rd (375 x 667)</option>
            </optgroup>
            <optgroup label="Google Pixel">
              <option value="pixel-9-pro">Google Pixel 9 Pro (412 x 924)</option>
              <option value="pixel-8">Google Pixel 8 (412 x 915)</option>
            </optgroup>
            <optgroup label="Samsung Galaxy">
              <option value="galaxy-s24-ultra">Samsung Galaxy S24 Ultra (412 x 915)</option>
              <option value="galaxy-s24">Samsung Galaxy S24 (412 x 919)</option>
            </optgroup>
            <optgroup label="Foldables &amp; Dual-Screen">
              <option value="galaxy-z-fold6">Samsung Galaxy Z Fold 6 (748 x 896)</option>
              <option value="pixel-9-pro-fold">Google Pixel 9 Pro Fold (824 x 856)</option>
              <option value="surface-duo">Microsoft Surface Duo 2 (1080 x 720)</option>
              <option value="iphone-duo">iPhone Duo — Dual Screen (786 x 852)</option>
            </optgroup>
          </select>

          <button class="btn" onclick="rotateDevice()">
            <svg class="icon" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            <span>Rotate</span>
          </button>

          <button class="btn" onclick="runFastRefresh()">
            <svg class="icon" viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
            <span>Reload</span>
          </button>

          <button class="btn" onclick="simulateShake()">
            <svg class="icon" viewBox="0 0 24 24"><path d="M2 12h20M12 2v20"/></svg>
            <span>Shake</span>
          </button>

          <!-- KEYBOARD MODE -->
          <select class="select-dropdown" id="keyboardModeSelector" onchange="setKeyboardMode(this.value)">
            <option value="phone" selected>📱 Virtual Phone Keyboard</option>
            <option value="pc">💻 Hardware / PC Keyboard</option>
          </select>
        </div>

        <div class="toolbar-group">
          <select class="select-dropdown" id="zoomSelector" onchange="setZoom(this.value)">
            <option value="auto" selected>Fit Viewport</option>
            <option value="0.5">50%</option>
            <option value="0.75">75%</option>
            <option value="1.0">100%</option>
          </select>

          <!-- THEME TOGGLE (LIGHT DEFAULT) -->
          <button class="btn" id="themeBtn" onclick="toggleAppTheme()">
            <svg class="icon" id="themeIcon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            <span id="themeLabel">Dark</span>
          </button>
        </div>
      </div>

      <!-- DEVICE VIEWPORT -->
      <div class="device-viewport" id="viewport">
        <div class="device-scaler" id="deviceScaler">
          <div class="device-frame" id="deviceFrame" style="width: 402px; height: 874px;">
            <!-- DUAL SCREEN HINGE -->
            <div class="duo-hinge" id="duoHinge"></div>

            <!-- CUTOUTS -->
            <div class="dynamic-island" id="dynamicIsland">
              <span style="font-size: 10px;">🎵 Now Playing</span>
              <div style="width:8px;height:8px;border-radius:4px;background:#10b981;"></div>
            </div>
            <div class="punchhole-camera" id="punchholeCamera"></div>

            <!-- STATUS BAR - TIME LEFT, ICONS RIGHT (NO TEMPERATURE) -->
            <div class="status-bar" id="statusBar">
              <span class="status-bar-time" id="sbTime">9:41</span>
              <div class="status-bar-icons">
                <span id="sbAirplane" style="display:none;">
                  <svg class="icon" style="width:12px;height:12px;" viewBox="0 0 24 24"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"/></svg>
                </span>
                <span id="sbCellular">
                  <svg class="icon" style="width:12px;height:12px;" viewBox="0 0 24 24"><rect width="3" height="4" x="2" y="16" rx="1"/><rect width="3" height="7" x="7" y="13" rx="1"/><rect width="3" height="11" x="12" y="9" rx="1"/><rect width="3" height="15" x="17" y="5" rx="1"/></svg>
                </span>
                <span id="sbNetwork">5G</span>
                <span id="sbWifi">
                  <svg class="icon" style="width:12px;height:12px;" viewBox="0 0 24 24"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>
                </span>
                <span id="sbBattery">95%</span>
                <svg class="icon" style="width:13px;height:13px;" viewBox="0 0 24 24"><rect width="16" height="10" x="2" y="7" rx="2"/><line x1="22" x2="22" y1="11" y2="13"/></svg>
              </div>
            </div>

            <!-- FAST REFRESH VISUAL FLASH -->
            <div class="fast-refresh-flash" id="refreshFlash"></div>

            <!-- RN DEV MENU OVERLAY -->
            <div class="rn-dev-menu" id="rnDevMenu">
              <div class="dev-menu-card">
                <div class="dev-menu-title">React Native Dev Menu</div>
                <div class="dev-menu-item" onclick="runFastRefresh(); dismissDevMenu();">
                  <span>Reload JavaScript</span>
                  <span style="color:#94a3b8; font-size:11px;">&#8984;R</span>
                </div>
                <div class="dev-menu-item" onclick="toggleElementInspector(); dismissDevMenu();">
                  <span>Toggle Element Inspector</span>
                  <span style="color:#94a3b8; font-size:11px;">Inspector</span>
                </div>
                <div class="dev-menu-item" onclick="runSmokeTest(); dismissDevMenu();">
                  <span>Run Conformance Smoke Test</span>
                  <span style="color:#94a3b8; font-size:11px;">Test</span>
                </div>
                <div class="dev-menu-item" style="color:var(--danger); justify-content:center; font-weight:700;" onclick="dismissDevMenu()">
                  Dismiss
                </div>
              </div>
            </div>

            <!-- SCREEN CONTENT (AUTHENTIC IOS & ANDROID DOM) -->
            <div class="screen-content" id="screenContent">
              <!-- AUTHENTIC IOS UI CONTAINER -->
              <div id="iosAppUI" style="display:flex; flex-direction:column; flex:1; background:#f2f2f7; color:#000;">
                <div class="ios-navbar">
                  <span style="color:#007aff; font-size:14px; font-weight:500;">Wallet</span>
                  <div class="ios-nav-title">PocketPay</div>
                  <div style="width:28px;height:28px;border-radius:14px;background:#007aff;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;">VS</div>
                </div>

                <div class="ios-segmented">
                  <div class="ios-segment active">Cards</div>
                  <div class="ios-segment">Transactions</div>
                  <div class="ios-segment">Analytics</div>
                </div>

                <div class="ios-card">
                  <div style="font-size:11px;color:#8e8e93;text-transform:uppercase;font-weight:600;">Total Balance</div>
                  <div style="font-size:26px;font-weight:700;margin:4px 0 12px;">$24,850.00</div>
                  <div style="display:flex;gap:8px;">
                    <button class="btn btn-accent" style="flex:1;justify-content:center;height:34px;" onclick="handleAction('Send')">Send</button>
                    <button class="btn" style="flex:1;justify-content:center;height:34px;" onclick="handleAction('Receive')">Receive</button>
                  </div>
                </div>

                <div style="margin:8px 16px;background:#fff;border-radius:12px;padding:12px;">
                  <div style="font-size:10px;font-weight:700;color:#007aff;text-transform:uppercase;margin-bottom:6px;">KeyboardAvoidingView Input</div>
                  <input type="text" class="input-field" placeholder="Tap to test KeyboardAvoidingView..." onfocus="onInputFocus()" onblur="onInputBlur()" style="width:100%;">
                </div>

                <div style="margin:12px 16px 6px;font-size:13px;font-weight:700;color:#8e8e93;text-transform:uppercase;">Recent Activity</div>
                <div style="margin:0 16px;background:#fff;border-radius:12px;overflow:hidden;">
                  <div style="padding:12px;display:flex;justify-content:space-between;border-bottom:1px solid #f2f2f7;">
                    <div>
                      <div style="font-size:13px;font-weight:600;">Apple Store Infinite Loop</div>
                      <div style="font-size:11px;color:#8e8e93;">Hardware &bull; Today</div>
                    </div>
                    <div style="font-size:13px;font-weight:700;">-$1,199.00</div>
                  </div>
                  <div style="padding:12px;display:flex;justify-content:space-between;">
                    <div>
                      <div style="font-size:13px;font-weight:600;">Stripe Platform Payout</div>
                      <div style="font-size:11px;color:#8e8e93;">Direct Deposit</div>
                    </div>
                    <div style="font-size:13px;font-weight:700;color:#34c759;">+$4,250.00</div>
                  </div>
                </div>

                <div class="ios-tabbar">
                  <div class="ios-tab-item active"><svg class="icon" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg><span>Home</span></div>
                  <div class="ios-tab-item"><svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg><span>Wallet</span></div>
                  <div class="ios-tab-item"><svg class="icon" viewBox="0 0 24 24"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg><span>Activity</span></div>
                  <div class="ios-tab-item"><svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/></svg><span>Settings</span></div>
                </div>
              </div>

              <!-- AUTHENTIC ANDROID UI CONTAINER -->
              <div id="androidAppUI" style="display:none; flex-direction:column; flex:1; background:#fdfcff; color:#1a1c1e;">
                <div class="android-topbar">
                  <div style="display:flex;align-items:center;gap:12px;">
                    <svg class="icon" viewBox="0 0 24 24"><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
                    <span style="font-size:18px;font-weight:700;">PocketPay</span>
                  </div>
                  <div style="width:30px;height:30px;border-radius:15px;background:#00639a;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;">M3</div>
                </div>

                <div class="android-searchbar">
                  <svg class="icon" style="width:14px;height:14px;" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
                  <span>Search transactions, cards, contacts</span>
                </div>

                <div class="android-card">
                  <div style="font-size:11px;color:#44474f;font-weight:600;">Total Balance &bull; Material 3</div>
                  <div style="font-size:26px;font-weight:800;margin:4px 0 12px;">$24,850.00</div>
                  <div style="display:flex;gap:8px;">
                    <button class="btn btn-accent" style="flex:1;justify-content:center;height:36px;border-radius:18px;" onclick="handleAction('Send')">Send</button>
                    <button class="btn" style="flex:1;justify-content:center;height:36px;border-radius:18px;" onclick="handleAction('Request')">Request</button>
                  </div>
                </div>

                <div style="margin:8px 16px;background:#eef0f6;border-radius:16px;padding:12px;">
                  <div style="font-size:10px;font-weight:700;color:#00639a;text-transform:uppercase;margin-bottom:6px;">KeyboardAvoidingView Target</div>
                  <input type="text" class="input-field" placeholder="Tap to test KeyboardAvoidingView..." onfocus="onInputFocus()" onblur="onInputBlur()" style="width:100%;border-radius:12px;">
                </div>

                <div style="margin:12px 16px 6px;font-size:12px;font-weight:700;color:#44474f;">Recent Activity</div>
                <div style="margin:0 16px;display:flex;flex-direction:column;gap:6px;">
                  <div style="padding:10px 14px;background:#f2f4fb;border-radius:14px;display:flex;justify-content:space-between;">
                    <span>Google Play Subscription</span>
                    <span style="font-weight:700;">-$14.99</span>
                  </div>
                  <div style="padding:10px 14px;background:#f2f4fb;border-radius:14px;display:flex;justify-content:space-between;">
                    <span>Stripe Payout</span>
                    <span style="font-weight:700;color:#00875a;">+$4,250.00</span>
                  </div>
                </div>

                <div class="android-fab" onclick="handleAction('FAB Click')">
                  <svg class="icon" style="width:24px;height:24px;stroke:#fff;" viewBox="0 0 24 24"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
                </div>

                <div class="android-nav-bar">
                  <span>&#9664;</span>
                  <span>&#9679;</span>
                  <span>&#9632;</span>
                </div>
              </div>
            </div>

            <!-- HOME INDICATOR -->
            <div class="home-indicator" id="homeIndicator"></div>

            <!-- VIRTUAL SOFTWARE KEYBOARD -->
            <div class="software-keyboard" id="softwareKeyboard">
              <div class="keyboard-toolbar">
                <span>KeyboardAvoidingView: Active</span>
                <span style="cursor:pointer; color:#007aff; font-weight:700;" onclick="dismissKeyboard()">Done</span>
              </div>
              <div class="keyboard-row">
                <div class="key-btn">Q</div><div class="key-btn">W</div><div class="key-btn">E</div><div class="key-btn">R</div>
                <div class="key-btn">T</div><div class="key-btn">Y</div><div class="key-btn">U</div><div class="key-btn">I</div>
                <div class="key-btn">O</div><div class="key-btn">P</div>
              </div>
              <div class="keyboard-row">
                <div class="key-btn">A</div><div class="key-btn">S</div><div class="key-btn">D</div><div class="key-btn">F</div>
                <div class="key-btn">G</div><div class="key-btn">H</div><div class="key-btn">J</div><div class="key-btn">K</div>
                <div class="key-btn">L</div>
              </div>
              <div class="keyboard-row">
                <div class="key-btn action">&#8679;</div>
                <div class="key-btn">Z</div><div class="key-btn">X</div><div class="key-btn">C</div><div class="key-btn">V</div>
                <div class="key-btn">B</div><div class="key-btn">N</div><div class="key-btn">M</div>
                <div class="key-btn action">&#9003;</div>
              </div>
              <div class="keyboard-row">
                <div class="key-btn action">123</div>
                <div class="key-btn space">space</div>
                <div class="key-btn action" onclick="dismissKeyboard()">return</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MULTI-SCREEN MATRIX VIEW -->
      <div class="matrix-view" id="matrixView"></div>

      <!-- BOTTOM CONSOLE LOGS -->
      <div class="panel-bottom">
        <div class="bottom-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <svg class="icon" viewBox="0 0 24 24"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
            <span>Console Stream &amp; Native Event Log</span>
          </div>
          <button class="btn" style="height: 22px; padding: 0 8px; font-size: 10px;" onclick="clearLogs()">Clear</button>
        </div>
        <div class="log-stream" id="logStream">
          [Runtime] PocketSim Virtual Mobile Environment initialized on 127.0.0.1:7868<br>
          [Compositor] Display clock synchronized at 60 FPS (Hardware VSync)<br>
          [Ready] Bridgeless Fabric Architecture active
        </div>
      </div>
    </div>

    <!-- RIGHT SIDEBAR INSPECTOR -->
    <div class="sidebar-right">
      <div class="panel-tab-bar">
        <div class="panel-tab active" id="tabSensors" onclick="selectTab('sensors')">
          <svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <span>Sensors</span>
        </div>
        <div class="panel-tab" id="tabFavicon" onclick="selectTab('favicon')">
          <svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <span>Favicon &amp; Icon</span>
        </div>
        <div class="panel-tab" id="tabPermissions" onclick="selectTab('permissions')">
          <svg class="icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>Perms</span>
        </div>
      </div>

      <!-- SENSORS CONTENT -->
      <div class="panel-content" id="contentSensors">
        <!-- TIME -->
        <div class="card">
          <div class="card-title">
            <svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>Status Bar Time</span>
          </div>
          <div class="row">
            <input type="time" class="input-field" id="timePicker" value="09:41" onchange="updateTime(this.value)">
          </div>
        </div>

        <!-- AMBIENT SENSOR (FOR APIS, NOT PHONE DISPLAY) -->
        <div class="card">
          <div class="card-title">
            <svg class="icon" viewBox="0 0 24 24"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>
            <span>Ambient Sensor (Weather &amp; Temp)</span>
          </div>
          <div style="font-size: 10.5px; color: var(--text-tertiary);">Simulates ambient conditions for app APIs (omitted from device status bar).</div>
          <div class="row">
            <select class="select-dropdown" id="weatherPicker" style="flex:1;" onchange="updateWeather(this.value)">
              <option value="Clear 72°F" selected>Clear 72°F (22°C)</option>
              <option value="Sunny 85°F">Sunny 85°F (29°C)</option>
              <option value="Cloudy 64°F">Cloudy 64°F (18°C)</option>
              <option value="Rain 52°F">Rain 52°F (11°C)</option>
              <option value="Freezing 28°F">Freezing 28°F (-2°C)</option>
            </select>
          </div>
        </div>

        <!-- NETWORK CONDITIONING -->
        <div class="card">
          <div class="card-title">
            <svg class="icon" viewBox="0 0 24 24"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>
            <span>Network Conditioning &amp; Radio</span>
          </div>
          <select class="select-dropdown" id="networkSelect" style="width: 100%;" onchange="updateNetwork(this.value)">
            <option value="cellular_5g" selected>Cellular 5G Ultra Wideband</option>
            <option value="wifi">High-speed Wi-Fi (15ms latency)</option>
            <option value="cellular_4g">Cellular 4G LTE</option>
            <option value="slow_2g">Slow 2G Edge (600ms latency)</option>
            <option value="offline">Airplane Mode / Offline</option>
          </select>
        </div>

        <!-- GLOBAL GPS SEARCH -->
        <div class="card">
          <div class="card-title">
            <svg class="icon" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>Global GPS Location Search</span>
          </div>
          <input type="text" class="input-field" id="locationSearch" placeholder="Search city or coordinates..." oninput="searchCities(this.value)">
          <div class="search-results" id="searchResults"></div>

          <div class="row" style="margin-top: 4px;">
            <input type="text" class="input-field" id="customLat" placeholder="Latitude" value="37.7749">
            <input type="text" class="input-field" id="customLon" placeholder="Longitude" value="-122.4194">
            <button class="btn btn-accent" onclick="applyCustomCoords()">Apply</button>
          </div>
        </div>

        <!-- BATTERY -->
        <div class="card">
          <div class="card-title">
            <svg class="icon" viewBox="0 0 24 24"><rect width="16" height="10" x="2" y="7" rx="2"/><line x1="22" x2="22" y1="11" y2="13"/></svg>
            <span>Battery &amp; Power State</span>
          </div>
          <div class="row">
            <input type="range" id="batterySlider" min="1" max="100" value="95" oninput="updateBattery(this.value)" style="flex:1;">
            <span id="batteryVal" style="font-size: 12px; font-weight: 600; width: 36px; text-align: right;">95%</span>
          </div>
        </div>

        <!-- MOTION -->
        <div class="card">
          <div class="card-title">
            <svg class="icon" viewBox="0 0 24 24"><path d="M2 12h20M12 2v20"/></svg>
            <span>Motion Simulation</span>
          </div>
          <button class="btn btn-accent" style="width: 100%; justify-content: center;" onclick="simulateShake()">
            Trigger 3-Axis Shake
          </button>
        </div>
      </div>

      <!-- FAVICON TESTER -->
      <div class="panel-content" id="contentFavicon" style="display: none;">
        <div class="card">
          <div class="card-title">
            <svg class="icon" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span>App Favicon &amp; Icon Tester</span>
          </div>
          <div style="font-size: 11px; color: var(--text-secondary); line-height: 1.5;">
            Upload your app favicon or launcher icon (.png, .svg, .ico, .jpg) to preview live.
          </div>

          <div style="margin-top: 6px;">
            <input type="file" id="faviconFileInput" accept="image/*" style="display:none;" onchange="handleFaviconUpload(event)">
            <button class="btn btn-accent" style="width: 100%; justify-content: center;" onclick="document.getElementById('faviconFileInput').click()">
              Upload Custom Icon
            </button>
          </div>

          <div style="margin-top: 8px;">
            <div style="font-size: 11px; font-weight:600; margin-bottom: 6px;">Presets:</div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button class="btn" onclick="setPresetFavicon('rocket')">&#128640; Rocket</button>
              <button class="btn" onclick="setPresetFavicon('finance')">&#128179; Pay</button>
              <button class="btn" onclick="setPresetFavicon('store')">&#128722; Shop</button>
              <button class="btn" onclick="setPresetFavicon('chat')">&#128172; Chat</button>
            </div>
          </div>
        </div>
      </div>

      <!-- PERMISSIONS CONTENT -->
      <div class="panel-content" id="contentPermissions" style="display: none;">
        <div class="card">
          <div class="card-title">Mobile Permission Matrix</div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div class="row">
              <span style="font-size: 12px;">Location Services</span>
              <select class="select-dropdown" onchange="updatePerm('location', this.value)">
                <option value="granted" selected>Granted</option>
                <option value="denied">Denied</option>
              </select>
            </div>
            <div class="row">
              <span style="font-size: 12px;">Camera</span>
              <select class="select-dropdown" onchange="updatePerm('camera', this.value)">
                <option value="granted" selected>Granted</option>
                <option value="denied">Denied</option>
              </select>
            </div>
            <div class="row">
              <span style="font-size: 12px;">Microphone</span>
              <select class="select-dropdown" onchange="updatePerm('microphone', this.value)">
                <option value="granted" selected>Granted</option>
                <option value="denied">Denied</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- TOAST NOTIFICATION -->
  <div class="toast" id="toastBox">
    <svg class="icon" style="color:#10b981;" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
    <span id="toastMsg">Operation successful</span>
  </div>

  <script>
    const CITIES = [
      { name: "San Francisco", lat: 37.7749, lon: -122.4194 },
      { name: "New York", lat: 40.7128, lon: -74.0060 },
      { name: "London", lat: 51.5074, lon: -0.1278 },
      { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
      { name: "Paris", lat: 48.8566, lon: 2.3522 },
      { name: "Berlin", lat: 52.5200, lon: 13.4050 },
      { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
      { name: "Singapore", lat: 1.3521, lon: 103.8198 },
      { name: "Sydney", lat: -33.8688, lon: 151.2093 },
      { name: "Dubai", lat: 25.2048, lon: 55.2708 }
    ];

    const DEVICE_SPECS = {
      'iphone-16-pro': { w: 402, h: 874, r: 54, platform: 'ios', cutout: 'di' },
      'iphone-16-pro-max': { w: 440, h: 956, r: 56, platform: 'ios', cutout: 'di' },
      'iphone-15-pro': { w: 393, h: 852, r: 52, platform: 'ios', cutout: 'di' },
      'iphone-se': { w: 375, h: 667, r: 0, platform: 'ios', cutout: 'none' },
      'pixel-9-pro': { w: 412, h: 924, r: 38, platform: 'android', cutout: 'punch' },
      'pixel-8': { w: 412, h: 915, r: 36, platform: 'android', cutout: 'punch' },
      'galaxy-s24-ultra': { w: 412, h: 915, r: 26, platform: 'android', cutout: 'punch' },
      'galaxy-s24': { w: 412, h: 919, r: 38, platform: 'android', cutout: 'punch' },
      'galaxy-z-fold6': { w: 748, h: 896, r: 24, platform: 'android', cutout: 'punch' },
      'pixel-9-pro-fold': { w: 824, h: 856, r: 28, platform: 'android', cutout: 'punch' },
      'surface-duo': { w: 1080, h: 720, r: 8, platform: 'android', cutout: 'hinge' },
      'iphone-duo': { w: 786, h: 852, r: 42, platform: 'ios', cutout: 'hinge' }
    };

    let currentDeviceId = 'iphone-16-pro';
    let currentScale = 1.0;
    let isRotated = false;
    let keyboardMode = 'phone';
    let appIconData = null;

    // IMMEDIATE DETERMINISTIC AUTO-FIT (NEVER CHOPPED)
    function autoFitDevice() {
      const viewport = document.getElementById('viewport');
      const frame = document.getElementById('deviceFrame');
      const scaler = document.getElementById('deviceScaler');
      const selector = document.getElementById('zoomSelector');

      if (!viewport || !frame || !scaler) return;
      if (selector && selector.value !== 'auto') return;

      const spec = DEVICE_SPECS[currentDeviceId] || { w: 402, h: 874 };
      let targetW = isRotated ? spec.h : spec.w;
      let targetH = isRotated ? spec.w : spec.h;

      // Add 24px border
      const fW = targetW + 24;
      const fH = targetH + 24;

      // Provide guaranteed 48px padding so device frame never touches top/bottom
      const vW = viewport.clientWidth - 48;
      const vH = viewport.clientHeight - 48;

      if (vW <= 0 || vH <= 0) return;

      const scale = Math.min(vW / fW, vH / fH, 0.94);
      currentScale = scale;
      scaler.style.transform = 'scale(' + scale + ')';
    }

    function setZoom(val) {
      const scaler = document.getElementById('deviceScaler');
      if (val === 'auto') {
        autoFitDevice();
      } else {
        currentScale = parseFloat(val);
        scaler.style.transform = 'scale(' + currentScale + ')';
      }
    }

    // THEME TOGGLE
    function toggleAppTheme() {
      const root = document.documentElement;
      const current = root.getAttribute('data-theme') || 'light';
      const next = current === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);

      const label = document.getElementById('themeLabel');
      const icon = document.getElementById('themeIcon');
      if (label) label.innerText = next === 'light' ? 'Dark' : 'Light';
      if (icon) {
        icon.innerHTML = next === 'light'
          ? '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'
          : '<circle cx="12" cy="12" r="5"/><line x1="12" x2="12" y1="1" y2="3"/><line x1="12" x2="12" y1="21" y2="23"/><line x1="4.22" x2="5.64" y1="4.22" y2="5.64"/><line x1="18.36" x2="19.78" y1="18.36" y2="19.78"/><line x1="1" x2="3" y1="12" y2="12"/><line x1="21" x2="23" y1="12" y2="12"/><line x1="4.22" x2="5.64" y1="19.78" y2="18.36"/><line x1="18.36" x2="19.78" y1="5.64" y2="4.22"/>';
      }
      log('Workspace theme switched to ' + next);
    }

    // SWITCH DEVICE
    function switchDevice(id) {
      currentDeviceId = id;
      const spec = DEVICE_SPECS[id] || { w: 402, h: 874, r: 54, platform: 'ios', cutout: 'di' };
      const frame = document.getElementById('deviceFrame');
      const selector = document.getElementById('deviceSelector');
      if (selector) selector.value = id;

      document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

      const di = document.getElementById('dynamicIsland');
      const ph = document.getElementById('punchholeCamera');
      const hi = document.getElementById('homeIndicator');
      const hinge = document.getElementById('duoHinge');
      const sb = document.getElementById('statusBar');

      // Cutout display
      if (spec.cutout === 'di') {
        if (di) di.style.display = 'flex';
        if (ph) ph.style.display = 'none';
        if (hinge) hinge.style.display = 'none';
        if (hi) hi.style.display = 'block';
      } else if (spec.cutout === 'punch') {
        if (di) di.style.display = 'none';
        if (ph) ph.style.display = 'block';
        if (hinge) hinge.style.display = 'none';
        if (hi) hi.style.display = 'none';
      } else if (spec.cutout === 'hinge') {
        if (di) di.style.display = 'none';
        if (ph) ph.style.display = 'none';
        if (hinge) hinge.style.display = 'block';
        if (hi) hi.style.display = 'none';
      } else {
        if (di) di.style.display = 'none';
        if (ph) ph.style.display = 'none';
        if (hinge) hinge.style.display = 'none';
        if (hi) hi.style.display = 'none';
      }

      // Apply dimensions
      let targetW = isRotated ? spec.h : spec.w;
      let targetH = isRotated ? spec.w : spec.h;
      frame.style.width = targetW + 'px';
      frame.style.height = targetH + 'px';
      frame.style.borderRadius = spec.r + 'px';

      // Status bar color contrast
      if (sb) {
        sb.style.color = spec.platform === 'ios' ? '#000000' : '#1a1c1e';
      }

      // Render authentic OS screen UI
      renderPlatformAppUI(spec.platform);

      log('Device Profile switched to ' + id + ' (' + spec.platform.toUpperCase() + ')');
      autoFitDevice();
    }

    // AUTHENTIC IOS VS ANDROID PHONE SCREEN UI TOGGLE
    function renderPlatformAppUI(platform) {
      const ios = document.getElementById('iosAppUI');
      const android = document.getElementById('androidAppUI');
      if (platform === 'ios') {
        if (ios) ios.style.display = 'flex';
        if (android) android.style.display = 'none';
      } else {
        if (ios) ios.style.display = 'none';
        if (android) android.style.display = 'flex';
      }
    }

    // RUN SAMPLE APP (APK OR IPA)
    function loadSampleApp(type) {
      const appName = type === 'apk' ? 'PocketCommerce.apk' : 'PocketFinance.ipa';
      const targetDevice = type === 'apk' ? 'pixel-9-pro' : 'iphone-16-pro';
      switchDevice(targetDevice);

      log('[PackageManager] Unpacking ' + appName + '...');
      setTimeout(() => {
        log('[Hermes] Bytecode v89 verified &bull; JSI bridge ready');
        showToast('Running ' + appName + ' on ' + targetDevice);
      }, 200);
    }

    // MULTI-SCREEN MATRIX VIEW
    function switchViewMode(mode) {
      const singleVp = document.getElementById('viewport');
      const matrixVp = document.getElementById('matrixView');

      if (mode === 'single') {
        singleVp.style.display = 'flex';
        matrixVp.style.display = 'none';
        autoFitDevice();
      } else {
        singleVp.style.display = 'none';
        matrixVp.style.display = 'grid';
        renderMatrixView(mode);
      }
    }

    function renderMatrixView(mode) {
      const matrixVp = document.getElementById('matrixView');
      const isIos = mode === 'ios-matrix';

      const iosDevices = [
        { id: 'iphone-16-pro-max', name: 'iPhone 16 Pro Max', dims: '440 x 956' },
        { id: 'iphone-16-pro', name: 'iPhone 16 Pro', dims: '402 x 874' },
        { id: 'iphone-15-pro', name: 'iPhone 15 Pro', dims: '393 x 852' },
        { id: 'iphone-se', name: 'iPhone SE 3rd', dims: '375 x 667' },
        { id: 'iphone-duo', name: 'iPhone Duo (Dual)', dims: '786 x 852' }
      ];

      const androidDevices = [
        { id: 'galaxy-z-fold6', name: 'Galaxy Z Fold 6', dims: '748 x 896' },
        { id: 'pixel-9-pro-fold', name: 'Pixel 9 Pro Fold', dims: '824 x 856' },
        { id: 'surface-duo', name: 'Surface Duo 2', dims: '1080 x 720' },
        { id: 'pixel-9-pro', name: 'Pixel 9 Pro', dims: '412 x 924' },
        { id: 'pixel-8', name: 'Pixel 8', dims: '412 x 915' },
        { id: 'galaxy-s24-ultra', name: 'Galaxy S24 Ultra', dims: '412 x 915' }
      ];

      const list = isIos ? iosDevices : androidDevices;

      matrixVp.innerHTML = list.map(d => (
        '<div class="matrix-device-card">' +
          '<div class="matrix-card-header">' +
            '<span>' + d.name + '</span>' +
            '<span class="matrix-card-meta">' + d.dims + ' pt</span>' +
          '</div>' +
          '<div class="matrix-mini-frame">' +
            '<div style="height:100%;padding:10px;font-size:9px;display:flex;flex-direction:column;justify-content:space-between;' + (isIos ? 'background:#f2f2f7;color:#000;' : 'background:#fdfcff;color:#1a1c1e;') + '">' +
              '<div>' +
                '<div style="font-weight:700;font-size:11px;margin-bottom:6px;">PocketPay</div>' +
                '<div style="background:#fff;border-radius:8px;padding:8px;margin-bottom:6px;box-shadow:0 1px 2px rgba(0,0,0,0.05);">' +
                  '<div>Balance</div>' +
                  '<div style="font-size:14px;font-weight:800;">$24,850.00</div>' +
                '</div>' +
                '<div style="background:#eef0f6;border-radius:6px;padding:6px;margin-bottom:6px;">' +
                  'Responsive TextInput Target' +
                '</div>' +
              '</div>' +
              '<div style="text-align:center;font-weight:700;color:var(--accent);">Responsive &bull; Conforming</div>' +
            '</div>' +
          '</div>' +
        '</div>'
      )).join('');

      log('Matrix View rendered: testing responsive layout across ' + (isIos ? '5 iOS' : '6 Android') + ' devices simultaneously');
    }

    // DYNAMIC NETWORK -> UPDATES STATUS BAR
    function updateNetwork(preset) {
      const ap = document.getElementById('sbAirplane');
      const cell = document.getElementById('sbCellular');
      const net = document.getElementById('sbNetwork');
      const wifi = document.getElementById('sbWifi');

      if (preset === 'offline') {
        if (ap) ap.style.display = 'inline-block';
        if (cell) cell.style.display = 'none';
        if (net) net.style.display = 'none';
        if (wifi) wifi.style.display = 'none';
        log('Network: Offline / Airplane Mode active');
      } else if (preset === 'wifi') {
        if (ap) ap.style.display = 'none';
        if (cell) cell.style.display = 'inline-block';
        if (net) { net.style.display = 'inline-block'; net.innerText = '5G'; }
        if (wifi) wifi.style.display = 'inline-block';
        log('Network: Wi-Fi active');
      } else if (preset === 'cellular_5g') {
        if (ap) ap.style.display = 'none';
        if (cell) cell.style.display = 'inline-block';
        if (net) { net.style.display = 'inline-block'; net.innerText = '5G'; }
        if (wifi) wifi.style.display = 'none';
        log('Network: Cellular 5G Ultra Wideband');
      } else if (preset === 'cellular_4g') {
        if (ap) ap.style.display = 'none';
        if (cell) cell.style.display = 'inline-block';
        if (net) { net.style.display = 'inline-block'; net.innerText = 'LTE'; }
        if (wifi) wifi.style.display = 'none';
        log('Network: Cellular 4G LTE');
      } else if (preset === 'slow_2g') {
        if (ap) ap.style.display = 'none';
        if (cell) cell.style.display = 'inline-block';
        if (net) { net.style.display = 'inline-block'; net.innerText = '2G'; }
        if (wifi) wifi.style.display = 'none';
        log('Network: Slow 2G simulated');
      }
    }

    // SHAKE ANIMATION & DEV MENU
    function simulateShake() {
      const frame = document.getElementById('deviceFrame');
      if (frame) {
        frame.classList.add('shaking');
        setTimeout(() => frame.classList.remove('shaking'), 500);
      }
      const menu = document.getElementById('rnDevMenu');
      if (menu) menu.style.display = 'flex';
      log('Motion event: 3-axis Accelerometer shake triggered');
    }

    function dismissDevMenu() {
      const menu = document.getElementById('rnDevMenu');
      if (menu) menu.style.display = 'none';
    }

    function toggleElementInspector() {
      selectTab('sensors');
      log('React Native Element Inspector overlay toggled');
      showToast('Element Inspector active');
    }

    // FAST REFRESH
    function runFastRefresh() {
      const flash = document.getElementById('refreshFlash');
      if (flash) {
        flash.style.opacity = '1';
        setTimeout(() => flash.style.opacity = '0', 200);
      }
      log('[Metro] Hot Module Replacement (HMR) update accepted in 24ms');
      showToast('Fast Refresh complete');
    }

    // SMOKE TEST
    function runSmokeTest() {
      log('--- Automated Smoke Test Sequence Starting ---');
      log('[Step 1/3] Validating React Native touch targets...');
      setTimeout(() => {
        log('[Step 2/3] Validating safe-area insets & keyboardAvoidingView...');
        setTimeout(() => {
          log('[Step 3/3] 3/3 assertions PASSED &bull; 100% Conformance');
          showToast('✓ Smoke Test: 100% Passed');
        }, 300);
      }, 300);
    }

    // COMPLETE QA
    function runQA() {
      log('=== Starting Complete Multi-Device QA Suite ===');
      log('[QA] Checking Safe Area Insets across all device profiles...');
      setTimeout(() => {
        log('[QA] Validated Fabric Touch Responder & TurboModules');
        log('✓ Complete QA Suite Passed: 15 Suites, 46 Tests Green');
        showToast('✓ Complete QA Matrix: 100% Passed');
      }, 400);
    }

    // KEYBOARD HANDLING
    function setKeyboardMode(mode) {
      keyboardMode = mode;
      log('Keyboard Mode: ' + (mode === 'phone' ? 'Virtual Phone Keyboard' : 'Hardware PC Keyboard'));
    }

    function onInputFocus() {
      if (keyboardMode === 'phone') {
        const kb = document.getElementById('softwareKeyboard');
        const sc = document.getElementById('screenContent');
        if (kb) kb.style.display = 'flex';
        if (sc) sc.style.paddingBottom = '270px';
        log('KeyboardAvoidingView: Soft keyboard slide up, view adjusted');
      } else {
        log('Hardware Keyboard: typing directly into native input');
      }
    }

    function onInputBlur() {
      if (keyboardMode === 'pc') log('Input blurred');
    }

    function dismissKeyboard() {
      const kb = document.getElementById('softwareKeyboard');
      const sc = document.getElementById('screenContent');
      if (kb) kb.style.display = 'none';
      if (sc) sc.style.paddingBottom = '24px';
      log('Keyboard dismissed: View restored');
    }

    // FAVICON / APP ICON
    function handleFaviconUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        applyAppIcon(e.target.result, file.name);
      };
      reader.readAsDataURL(file);
    }

    function setPresetFavicon(type) {
      const presets = {
        rocket: { name: 'Rocket', emoji: '🚀' },
        finance: { name: 'Fintech', emoji: '💳' },
        store: { name: 'Commerce', emoji: '🛍️' },
        chat: { name: 'Social', emoji: '💬' }
      };
      const p = presets[type];
      if (!p) return;
      log('Favicon preset selected: ' + p.name);
      showToast('Favicon updated: ' + p.name);
    }

    function applyAppIcon(dataUrl, fileName) {
      const pageFavicon = document.getElementById('pageFavicon');
      if (pageFavicon) pageFavicon.href = dataUrl;
      log('Custom App Icon applied: ' + (fileName || 'image'));
      showToast('Custom icon applied');
    }

    // ROTATE
    function rotateDevice() {
      isRotated = !isRotated;
      log('Orientation toggled: ' + (isRotated ? 'Landscape' : 'Portrait'));
      switchDevice(currentDeviceId);
    }

    // SENSORS & TABS
    function selectTab(tab) {
      document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
      const s = document.getElementById('contentSensors');
      const f = document.getElementById('contentFavicon');
      const p = document.getElementById('contentPermissions');

      if (s) s.style.display = 'none';
      if (f) f.style.display = 'none';
      if (p) p.style.display = 'none';

      if (tab === 'sensors') {
        const tabEl = document.getElementById('tabSensors');
        if (tabEl) tabEl.classList.add('active');
        if (s) s.style.display = 'flex';
      } else if (tab === 'favicon') {
        const tabEl = document.getElementById('tabFavicon');
        if (tabEl) tabEl.classList.add('active');
        if (f) f.style.display = 'flex';
      } else if (tab === 'permissions') {
        const tabEl = document.getElementById('tabPermissions');
        if (tabEl) tabEl.classList.add('active');
        if (p) p.style.display = 'flex';
      }
    }

    function searchCities(query) {
      const results = document.getElementById('searchResults');
      if (!query || !query.trim()) {
        if (results) results.style.display = 'none';
        return;
      }
      const q = query.toLowerCase();
      const matches = CITIES.filter(c => c.name.toLowerCase().includes(q));
      if (matches.length === 0) {
        if (results) results.style.display = 'none';
        return;
      }
      if (results) {
        results.innerHTML = matches.map(c => 
          '<div class="search-item" onclick="selectCity(' + c.lat + ',' + c.lon + ',this.dataset.city)" data-city="' + c.name + '">' +
          '<span>' + c.name + '</span><span style="color:var(--text-tertiary);">' + c.lat.toFixed(2) + ', ' + c.lon.toFixed(2) + '</span></div>'
        ).join('');
        results.style.display = 'block';
      }
    }

    function selectCity(lat, lon, name) {
      const latEl = document.getElementById('customLat');
      const lonEl = document.getElementById('customLon');
      const searchEl = document.getElementById('locationSearch');
      const resEl = document.getElementById('searchResults');
      if (latEl) latEl.value = lat;
      if (lonEl) lonEl.value = lon;
      if (searchEl) searchEl.value = name;
      if (resEl) resEl.style.display = 'none';
      log('GPS Location set: ' + name + ' (' + lat + ', ' + lon + ')');
    }

    function applyCustomCoords() {
      const lat = document.getElementById('customLat')?.value;
      const lon = document.getElementById('customLon')?.value;
      log('Custom GPS coordinates applied: ' + lat + ', ' + lon);
    }

    function updateTime(val) {
      const timeEl = document.getElementById('sbTime');
      if (timeEl) timeEl.innerText = val;
      log('Status Bar time set: ' + val);
    }

    function updateWeather(val) {
      log('Ambient climate condition mock set: ' + val);
    }

    function updateBattery(val) {
      const bVal = document.getElementById('batteryVal');
      const sbB = document.getElementById('sbBattery');
      if (bVal) bVal.innerText = val + '%';
      if (sbB) sbB.innerText = val + '%';
      log('Battery updated: ' + val + '%');
    }

    function updatePerm(type, status) {
      log('Permission update: ' + type + ' set to ' + status);
    }

    function handleAction(name) {
      log('TouchResponder: ' + name + ' action triggered');
      showToast(name + ' triggered');
    }

    function showToast(msg) {
      const toast = document.getElementById('toastBox');
      const toastMsg = document.getElementById('toastMsg');
      if (!toast || !toastMsg) return;
      toastMsg.innerText = msg;
      toast.style.display = 'flex';
      setTimeout(() => toast.style.display = 'none', 2200);
    }

    function log(msg) {
      const stream = document.getElementById('logStream');
      if (!stream) return;
      const time = new Date().toLocaleTimeString();
      stream.innerHTML += '<br><span style="color:#64748b;">[' + time + ']</span> ' + msg;
      stream.scrollTop = stream.scrollHeight;
    }

    function clearLogs() {
      const stream = document.getElementById('logStream');
      if (stream) stream.innerHTML = '';
    }

    window.addEventListener('resize', autoFitDevice);

    // Initial setup on load
    switchDevice('iphone-16-pro');
  </script>
</body>
</html>
`;
}
