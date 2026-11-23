import {
  SensorState,
  LocationCoordinates,
  AccelerometerData,
  GyroscopeData,
  MagnetometerData,
  BatteryState,
  NetworkCondition,
  NetworkType
} from '@pocketsim/shared-types';

export interface RoutePoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
}

export type SensorListener = (state: SensorState) => void;

export class SensorEngine {
  private state: SensorState;
  private listeners: Set<SensorListener> = new Set();
  private routeSimulationInterval: NodeJS.Timeout | null = null;
  private activeRoute: RoutePoint[] = [];
  private routeIndex: number = 0;

  constructor(initialState?: Partial<SensorState>) {
    this.state = {
      location: {
        latitude: 37.7749, // San Francisco default
        longitude: -122.4194,
        altitude: 15,
        accuracy: 5.0,
        heading: 0,
        speed: 0,
        timestamp: Date.now(),
        ...(initialState?.location || {})
      },
      accelerometer: {
        x: 0,
        y: 9.81, // Earth gravity default
        z: 0,
        timestamp: Date.now(),
        ...(initialState?.accelerometer || {})
      },
      gyroscope: {
        x: 0,
        y: 0,
        z: 0,
        timestamp: Date.now(),
        ...(initialState?.gyroscope || {})
      },
      magnetometer: {
        x: 20.0,
        y: -10.0,
        z: 45.0,
        timestamp: Date.now(),
        ...(initialState?.magnetometer || {})
      },
      battery: {
        level: 0.95,
        isCharging: false,
        lowPowerMode: false,
        ...(initialState?.battery || {})
      },
      network: {
        type: 'wifi',
        isConnected: true,
        isInternetReachable: true,
        latencyMs: 15,
        packetLossPercent: 0,
        downloadSpeedKbps: 50000,
        ...(initialState?.network || {})
      },
      proximity: false,
      ambientLightLux: 350,
      orientation: 'portrait',
      ...(initialState || {})
    };
  }

  public getState(): Readonly<SensorState> {
    return { ...this.state };
  }

  public subscribe(listener: SensorListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const clone = this.getState();
    for (const listener of this.listeners) {
      listener(clone);
    }
  }

  // --- Location APIs ---

  public setLocation(coords: Partial<LocationCoordinates>): void {
    this.state.location = {
      ...this.state.location,
      ...coords,
      timestamp: Date.now()
    };
    this.notify();
  }

  public loadGpxRoute(gpxXml: string): RoutePoint[] {
    const points: RoutePoint[] = [];
    // Regex-based extraction of <trkpt lat="..." lon="...">
    const trkptRegex = /<trkpt\s+lat=["']([^"']+)["']\s+lon=["']([^"']+)["'][^>]*>(?:[\s\S]*?<ele>([^<]+)<\/ele>)?/g;
    let match: RegExpExecArray | null;
    while ((match = trkptRegex.exec(gpxXml)) !== null) {
      const lat = parseFloat(match[1]);
      const lon = parseFloat(match[2]);
      const ele = match[3] ? parseFloat(match[3]) : undefined;
      if (!isNaN(lat) && !isNaN(lon)) {
        points.push({ latitude: lat, longitude: lon, altitude: ele });
      }
    }
    this.activeRoute = points;
    this.routeIndex = 0;
    return points;
  }

  public setRoute(points: RoutePoint[]): void {
    this.activeRoute = [...points];
    this.routeIndex = 0;
  }

  public startRouteSimulation(intervalMs: number = 1000, loop: boolean = true): void {
    this.stopRouteSimulation();
    if (this.activeRoute.length === 0) return;

    this.routeSimulationInterval = setInterval(() => {
      if (this.routeIndex >= this.activeRoute.length) {
        if (loop) {
          this.routeIndex = 0;
        } else {
          this.stopRouteSimulation();
          return;
        }
      }
      const pt = this.activeRoute[this.routeIndex];
      this.setLocation({
        latitude: pt.latitude,
        longitude: pt.longitude,
        altitude: pt.altitude ?? this.state.location.altitude,
        speed: pt.speed ?? 12.5 // ~45 km/h
      });
      this.routeIndex++;
    }, intervalMs);
  }

  public stopRouteSimulation(): void {
    if (this.routeSimulationInterval) {
      clearInterval(this.routeSimulationInterval);
      this.routeSimulationInterval = null;
    }
  }

  // --- Motion APIs ---

  public setAccelerometer(data: Partial<AccelerometerData>): void {
    this.state.accelerometer = {
      ...this.state.accelerometer,
      ...data,
      timestamp: Date.now()
    };
    this.notify();
  }

  public simulateShake(intensity: number = 25.0): void {
    // Shake causes rapid alternating acceleration
    this.setAccelerometer({ x: intensity, y: -intensity, z: intensity });
    setTimeout(() => {
      this.setAccelerometer({ x: -intensity, y: intensity, z: -intensity });
    }, 100);
    setTimeout(() => {
      this.setAccelerometer({ x: 0, y: 9.81, z: 0 });
    }, 300);
  }

  public setGyroscope(data: Partial<GyroscopeData>): void {
    this.state.gyroscope = {
      ...this.state.gyroscope,
      ...data,
      timestamp: Date.now()
    };
    this.notify();
  }

  public setMagnetometer(data: Partial<MagnetometerData>): void {
    this.state.magnetometer = {
      ...this.state.magnetometer,
      ...data,
      timestamp: Date.now()
    };
    this.notify();
  }

  // --- Battery & Environment ---

  public setBattery(data: Partial<BatteryState>): void {
    this.state.battery = {
      ...this.state.battery,
      ...data
    };
    this.notify();
  }

  public setOrientation(orientation: SensorState['orientation']): void {
    this.state.orientation = orientation;
    this.notify();
  }

  // --- Network Conditioning ---

  public setNetworkCondition(network: Partial<NetworkCondition>): void {
    this.state.network = {
      ...this.state.network,
      ...network
    };
    this.notify();
  }

  public applyNetworkPreset(preset: NetworkType): void {
    switch (preset) {
      case 'wifi':
        this.setNetworkCondition({
          type: 'wifi',
          isConnected: true,
          isInternetReachable: true,
          latencyMs: 15,
          packetLossPercent: 0,
          downloadSpeedKbps: 50000
        });
        break;
      case 'cellular_5g':
        this.setNetworkCondition({
          type: 'cellular_5g',
          isConnected: true,
          isInternetReachable: true,
          latencyMs: 25,
          packetLossPercent: 0,
          downloadSpeedKbps: 100000
        });
        break;
      case 'cellular_4g':
        this.setNetworkCondition({
          type: 'cellular_4g',
          isConnected: true,
          isInternetReachable: true,
          latencyMs: 50,
          packetLossPercent: 0.1,
          downloadSpeedKbps: 20000
        });
        break;
      case 'cellular_3g':
        this.setNetworkCondition({
          type: 'cellular_3g',
          isConnected: true,
          isInternetReachable: true,
          latencyMs: 150,
          packetLossPercent: 2,
          downloadSpeedKbps: 1500
        });
        break;
      case 'slow_2g':
        this.setNetworkCondition({
          type: 'slow_2g',
          isConnected: true,
          isInternetReachable: true,
          latencyMs: 600,
          packetLossPercent: 5,
          downloadSpeedKbps: 100
        });
        break;
      case 'offline':
        this.setNetworkCondition({
          type: 'offline',
          isConnected: false,
          isInternetReachable: false,
          latencyMs: 0,
          packetLossPercent: 100,
          downloadSpeedKbps: 0
        });
        break;
    }
  }

  // --- Scenarios ---

  public applyScenario(scenario: 'low_battery' | 'driving' | 'offline_commute' | 'walking'): void {
    switch (scenario) {
      case 'low_battery':
        this.setBattery({ level: 0.08, isCharging: false, lowPowerMode: true });
        break;
      case 'driving':
        this.setLocation({ speed: 28.0 }); // ~100 km/h
        this.applyNetworkPreset('cellular_5g');
        break;
      case 'offline_commute':
        this.applyNetworkPreset('offline');
        this.setBattery({ level: 0.45, isCharging: false });
        break;
      case 'walking':
        this.setLocation({ speed: 1.4 }); // ~5 km/h
        this.setAccelerometer({ x: 0.5, y: 9.81, z: 0.2 });
        break;
    }
  }

  public reset(): void {
    this.stopRouteSimulation();
    this.activeRoute = [];
    this.routeIndex = 0;
    this.state = {
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        altitude: 15,
        accuracy: 5.0,
        heading: 0,
        speed: 0,
        timestamp: Date.now()
      },
      accelerometer: { x: 0, y: 9.81, z: 0, timestamp: Date.now() },
      gyroscope: { x: 0, y: 0, z: 0, timestamp: Date.now() },
      magnetometer: { x: 20.0, y: -10.0, z: 45.0, timestamp: Date.now() },
      battery: { level: 0.95, isCharging: false, lowPowerMode: false },
      network: {
        type: 'wifi',
        isConnected: true,
        isInternetReachable: true,
        latencyMs: 15,
        packetLossPercent: 0,
        downloadSpeedKbps: 50000
      },
      proximity: false,
      ambientLightLux: 350,
      orientation: 'portrait'
    };
    this.notify();
  }
}
