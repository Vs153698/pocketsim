import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Pressable } from 'react-native';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchSensors = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      const battery = await Battery.getBatteryLevelAsync();
      setBatteryLevel(Math.round(battery * 100));

      const charging = await Battery.isBatteryChargingAsync();
      setIsCharging(charging);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Sensor read error');
    }
  };

  useEffect(() => {
    fetchSensors();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title} testID="screen-title">Hardware Sensor Monitor</Text>
      <Text style={styles.subtitle}>PocketSim Live Sensor Bridge</Text>

      {errorMsg ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText} testID="error-message">{errorMsg}</Text>
        </View>
      ) : null}

      <View style={styles.card} testID="location-card">
        <Text style={styles.cardHeader}>📍 GPS / Location</Text>
        <Text style={styles.cardMetric} testID="gps-lat">
          Lat: {location ? location.coords.latitude.toFixed(4) : 'Loading...'}
        </Text>
        <Text style={styles.cardMetric} testID="gps-lon">
          Lon: {location ? location.coords.longitude.toFixed(4) : 'Loading...'}
        </Text>
        <Text style={styles.cardMetric}>
          Speed: {location?.coords.speed ? `${location.coords.speed} m/s` : '0 m/s'}
        </Text>
      </View>

      <View style={styles.card} testID="battery-card">
        <Text style={styles.cardHeader}>🔋 Battery State</Text>
        <Text style={styles.cardMetric} testID="battery-pct">
          Level: {batteryLevel !== null ? `${batteryLevel}%` : 'Reading...'}
        </Text>
        <Text style={styles.cardMetric} testID="battery-charging">
          Status: {isCharging ? '⚡ Charging' : 'Discharging'}
        </Text>
      </View>

      <Pressable style={styles.refreshButton} testID="refresh-sensors-btn" onPress={fetchSensors}>
        <Text style={styles.refreshButtonText}>Refresh Sensors</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1115',
    padding: 20
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 13,
    color: '#8B949E',
    marginBottom: 20
  },
  card: {
    backgroundColor: '#181B21',
    borderWidth: 1,
    borderColor: '#30363D',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '600',
    color: '#58A6FF',
    marginBottom: 10
  },
  cardMetric: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 4,
    fontFamily: 'Courier'
  },
  errorBox: {
    backgroundColor: 'rgba(248, 81, 73, 0.1)',
    borderWidth: 1,
    borderColor: '#F85149',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  errorText: {
    color: '#F85149',
    fontSize: 13
  },
  refreshButton: {
    backgroundColor: '#388BFD',
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10
  },
  refreshButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15
  }
});
