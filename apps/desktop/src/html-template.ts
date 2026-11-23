export function renderDesktopHtml(initialData: {
  bridgePort: number;
  devices: Array<{ id: string; name: string; platform: string; width: number; height: number }>;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PocketSim — Virtual Mobile Development Environment</title>
  <style>
    :root {
      --bg-dark: #0f1115;
      --bg-card: #181b21;
      --bg-elevated: #21262d;
      --border-color: #30363d;
      --text-main: #f0f6fc;
      --text-muted: #8b949e;
      --accent: #388bfd;
      --accent-hover: #58a6ff;
      --success: #3fb950;
      --warning: #d29922;
      --danger: #f85149;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg-dark);
      color: var(--text-main);
      display: flex;
      height: 100vh;
      overflow: hidden;
      user-select: none;
    }
    /* LEFT SIDEBAR */
    .sidebar-left {
      width: 250px;
      background: var(--bg-card);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
    }
    .brand-header {
      padding: 16px;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid var(--border-color);
    }
    .brand-badge {
      background: var(--accent);
      color: #fff;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .section-title {
      font-size: 11px;
      text-transform: uppercase;
      color: var(--text-muted);
      padding: 12px 16px 6px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .sidebar-item {
      padding: 8px 16px;
      font-size: 13px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .sidebar-item:hover, .sidebar-item.active {
      background: var(--bg-elevated);
      color: var(--text-main);
    }
    /* CENTER WORKSPACE */
    .workspace-center {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: var(--bg-dark);
      position: relative;
    }
    .top-toolbar {
      height: 48px;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
    }
    .toolbar-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    button, select {
      background: var(--bg-elevated);
      color: var(--text-main);
      border: 1px solid var(--border-color);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s;
    }
    button:hover { background: #2d333b; border-color: #8b949e; }
    .btn-primary { background: var(--accent); border-color: var(--accent); color: #fff; font-weight: 600; }
    .btn-primary:hover { background: var(--accent-hover); }
    
    /* DEVICE CONTAINER & FRAME */
    .device-viewport {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      overflow: auto;
      background: radial-gradient(circle at center, #1b2028 0%, #0f1115 100%);
    }
    .device-frame {
      background: #000;
      border: 12px solid #28282b;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 0 4px rgba(255, 255, 255, 0.2);
      border-radius: 55px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    /* SYSTEM UI CHROME */
    .status-bar {
      height: 48px;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      z-index: 10;
      position: absolute;
      top: 0; left: 0; right: 0;
    }
    .dynamic-island {
      width: 120px;
      height: 35px;
      background: #000;
      border-radius: 20px;
      position: absolute;
      top: 11px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 20;
      box-shadow: 0 0 2px rgba(255,255,255,0.2);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 11px;
      transition: all 0.25s ease;
    }
    .screen-content {
      flex: 1;
      background: #121212;
      position: relative;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      padding-top: 50px;
      padding-bottom: 30px;
    }
    .home-indicator {
      width: 134px;
      height: 5px;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 3px;
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
    }
    /* RIGHT PANEL */
    .sidebar-right {
      width: 320px;
      background: var(--bg-card);
      border-left: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }
    .panel-tab-bar {
      display: flex;
      border-bottom: 1px solid var(--border-color);
    }
    .panel-tab {
      flex: 1;
      padding: 10px;
      text-align: center;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
    }
    .panel-tab.active {
      color: var(--text-main);
      border-bottom: 2px solid var(--accent);
      background: var(--bg-elevated);
    }
    .panel-content { padding: 16px; display: flex; flex-direction: column; gap: 16px; }
    .control-card {
      background: var(--bg-dark);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 12px;
    }
    .control-label {
      font-size: 11px;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .slider-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    input[type="range"] { flex: 1; }
    /* BOTTOM PANEL */
    .panel-bottom {
      height: 160px;
      background: var(--bg-card);
      border-top: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
    }
    .bottom-header {
      height: 32px;
      padding: 0 16px;
      background: var(--bg-elevated);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 600;
    }
    .log-stream {
      flex: 1;
      padding: 8px 16px;
      font-family: ui-monospace, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      overflow-y: auto;
      color: #7ee787;
      background: #0d1117;
    }
  </style>
</head>
<body>
  <!-- LEFT SIDEBAR -->
  <div class="sidebar-left">
    <div class="brand-header">
      <span>📱 PocketSim</span>
      <span class="brand-badge">AI Native</span>
    </div>
    <div class="section-title">Devices</div>
    <div class="sidebar-item active" onclick="switchDevice('iphone-15-pro')">🍎 iPhone 15 Pro</div>
    <div class="sidebar-item" onclick="switchDevice('pixel-8')">🤖 Pixel 8</div>
    <div class="sidebar-item" onclick="switchDevice('iphone-16-pro-max')">🍎 iPhone 16 Pro Max</div>
    <div class="sidebar-item" onclick="switchDevice('iphone-se')">🍎 iPhone SE</div>

    <div class="section-title">Workflows</div>
    <div class="sidebar-item" onclick="triggerFastRefresh()">⚡ Fast Refresh</div>
    <div class="sidebar-item" onclick="runSmokeTest()">🧪 Run Smoke Test</div>
    <div class="sidebar-item" onclick="captureSnapshot()">📸 Capture Snapshot</div>
    <div class="sidebar-item" onclick="runQA()">🔬 Complete QA</div>
  </div>

  <!-- CENTER WORKSPACE -->
  <div class="workspace-center">
    <div class="top-toolbar">
      <div class="toolbar-group">
        <select id="deviceSelector" onchange="switchDevice(this.value)">
          <option value="iphone-15-pro">iPhone 15 Pro (393x852)</option>
          <option value="pixel-8">Pixel 8 (412x915)</option>
          <option value="iphone-16-pro-max">iPhone 16 Pro Max (440x956)</option>
          <option value="iphone-se">iPhone SE (375x667)</option>
        </select>
        <button onclick="rotateDevice()">🔄 Rotate</button>
        <button onclick="triggerFastRefresh()">⚡ Reload</button>
      </div>
      <div class="toolbar-group">
        <button onclick="toggleKeyboard()">⌨️ Toggle Keyboard</button>
        <button class="btn-primary" onclick="runQA()">Run QA Suite</button>
      </div>
    </div>

    <!-- DEVICE VIEWPORT -->
    <div class="device-viewport">
      <div class="device-frame" id="deviceFrame" style="width: 393px; height: 852px;">
        <!-- Dynamic Island -->
        <div class="dynamic-island" id="dynamicIsland"></div>
        <!-- Status Bar -->
        <div class="status-bar">
          <span id="sbTime">9:41</span>
          <span id="sbIcons">5G 📶 🔋 <span id="sbBattery">95%</span></span>
        </div>
        <!-- Screen Content Container -->
        <div class="screen-content" id="screenContent">
          <div style="padding: 24px; color: #fff;">
            <h2 style="font-size: 22px; margin-bottom: 8px;">Welcome to PocketSim</h2>
            <p style="color: #8b949e; font-size: 14px; margin-bottom: 24px;">Lightweight virtual React Native mobile runtime.</p>
            <div style="background: #1c2128; border: 1px solid #30363d; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
              <div style="font-size: 12px; color: #58a6ff; font-weight: 600; margin-bottom: 4px;">FAST REFRESH READY</div>
              <div style="font-size: 13px;">Connected to Metro dev server on port 8081.</div>
            </div>
            <button class="btn-primary" style="width: 100%; height: 44px; justify-content: center; font-size: 14px;" onclick="handleAppClick()">Interactive React Native Button</button>
          </div>
        </div>
        <!-- Home Indicator -->
        <div class="home-indicator"></div>
      </div>
    </div>

    <!-- BOTTOM CONSOLE -->
    <div class="panel-bottom">
      <div class="bottom-header">
        <span>Console & Event Timeline</span>
        <button style="padding: 2px 8px; font-size: 11px;" onclick="clearLogs()">Clear</button>
      </div>
      <div class="log-stream" id="logStream">
        [Runtime] PocketSim Virtual Environment initialized on 127.0.0.1:7868<br>
        [Compositor] Display clock synchronized at 60 FPS<br>
        [SensorEngine] Core sensors mounted (GPS: 37.7749, -122.4194)
      </div>
    </div>
  </div>

  <!-- RIGHT PANEL -->
  <div class="sidebar-right">
    <div class="panel-tab-bar">
      <div class="panel-tab active" onclick="selectTab('sensors')">Sensors</div>
      <div class="panel-tab" onclick="selectTab('permissions')">Permissions</div>
      <div class="panel-tab" onclick="selectTab('inspector')">Inspector</div>
    </div>

    <div class="panel-content" id="panelContent">
      <!-- SENSORS -->
      <div class="control-card">
        <div class="control-label">Battery Level</div>
        <div class="slider-row">
          <input type="range" id="batterySlider" min="1" max="100" value="95" oninput="updateBattery(this.value)">
          <span id="batteryVal">95%</span>
        </div>
      </div>

      <div class="control-card">
        <div class="control-label">Network Conditioning</div>
        <select style="width: 100%;" onchange="updateNetwork(this.value)">
          <option value="wifi">Fast Wi-Fi (15ms latency)</option>
          <option value="cellular_5g">Cellular 5G</option>
          <option value="cellular_4g">Cellular 4G LTE</option>
          <option value="slow_2g">Slow 2G (600ms latency)</option>
          <option value="offline">Airplane Mode / Offline</option>
        </select>
      </div>

      <div class="control-card">
        <div class="control-label">Location (GPS)</div>
        <div style="font-size: 12px; margin-bottom: 6px;">Preset Scenarios:</div>
        <button style="width: 100%; margin-bottom: 6px;" onclick="setGps(37.7749, -122.4194, 'San Francisco')">📍 San Francisco</button>
        <button style="width: 100%; margin-bottom: 6px;" onclick="setGps(40.7128, -74.0060, 'New York')">📍 New York City</button>
        <button style="width: 100%;" onclick="setGps(51.5074, -0.1278, 'London')">📍 London</button>
      </div>

      <div class="control-card">
        <div class="control-label">Accelerometer / Motion</div>
        <button style="width: 100%;" onclick="simulateShake()">📳 Simulate Shake</button>
      </div>
    </div>
  </div>

  <script>
    const BRIDGE_URL = 'http://127.0.0.1:${initialData.bridgePort}';
    let currentSessionId = null;

    async function init() {
      try {
        const res = await fetch(BRIDGE_URL + '/sessions');
        const data = await res.json();
        if (data.sessions && data.sessions.length > 0) {
          currentSessionId = data.sessions[0].id;
          log('Connected to existing session: ' + currentSessionId);
        } else {
          const createRes = await fetch(BRIDGE_URL + '/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceProfileId: 'iphone-15-pro' })
          });
          const createData = await createRes.json();
          currentSessionId = createData.session.id;
          log('Created new virtual device session: ' + currentSessionId);
        }
      } catch (err) {
        log('Bridge connection note: ' + err.message);
      }
    }

    function log(msg) {
      const stream = document.getElementById('logStream');
      const time = new Date().toLocaleTimeString();
      stream.innerHTML += '<br>[' + time + '] ' + msg;
      stream.scrollTop = stream.scrollHeight;
    }

    function clearLogs() {
      document.getElementById('logStream').innerHTML = '';
    }

    function switchDevice(id) {
      const frame = document.getElementById('deviceFrame');
      const selector = document.getElementById('deviceSelector');
      selector.value = id;
      if (id === 'pixel-8') {
        frame.style.width = '412px';
        frame.style.height = '915px';
        frame.style.borderRadius = '36px';
        document.getElementById('dynamicIsland').style.display = 'none';
        log('Switched to Google Pixel 8 (Android)');
      } else if (id === 'iphone-16-pro-max') {
        frame.style.width = '440px';
        frame.style.height = '956px';
        frame.style.borderRadius = '58px';
        document.getElementById('dynamicIsland').style.display = 'flex';
        log('Switched to iPhone 16 Pro Max');
      } else if (id === 'iphone-se') {
        frame.style.width = '375px';
        frame.style.height = '667px';
        frame.style.borderRadius = '0px';
        document.getElementById('dynamicIsland').style.display = 'none';
        log('Switched to iPhone SE');
      } else {
        frame.style.width = '393px';
        frame.style.height = '852px';
        frame.style.borderRadius = '55px';
        document.getElementById('dynamicIsland').style.display = 'flex';
        log('Switched to iPhone 15 Pro');
      }
    }

    function updateBattery(val) {
      document.getElementById('batteryVal').innerText = val + '%';
      document.getElementById('sbBattery').innerText = val + '%';
      log('Updated Battery: ' + val + '%');
    }

    function updateNetwork(preset) {
      log('Applied Network Conditioning: ' + preset);
    }

    function setGps(lat, lon, label) {
      log('Simulated GPS coordinates: ' + label + ' (' + lat + ', ' + lon + ')');
    }

    function simulateShake() {
      log('Dispatched accelerometer shake event (intensity 25.0)');
    }

    function triggerFastRefresh() {
      log('Triggered React Native Fast Refresh');
    }

    function handleAppClick() {
      log('Application Event: Interactive Button Pressed');
    }

    function runSmokeTest() {
      log('Running Smoke Test... All components responsive');
    }

    function runQA() {
      log('Triggered Full QA Runner via Local Bridge');
    }

    init();
  </script>
</body>
</html>
`;
}
