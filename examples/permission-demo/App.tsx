import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Pressable } from 'react-native';

export default function App() {
  const [permissions, setPermissions] = useState<Record<string, string>>({
    location: 'not_requested',
    camera: 'not_requested',
    microphone: 'not_requested',
    notifications: 'not_requested'
  });

  const requestPerm = (type: string) => {
    // Simulated permission prompt flow
    setPermissions(prev => ({
      ...prev,
      [type]: 'granted'
    }));
  };

  const denyPerm = (type: string) => {
    setPermissions(prev => ({
      ...prev,
      [type]: 'denied'
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title} testID="screen-title">Permission Manager</Text>
      <Text style={styles.subtitle}>Test native security dialogs in PocketSim</Text>

      {Object.entries(permissions).map(([type, status]) => (
        <View key={type} style={styles.row} testID={`perm-row-${type}`}>
          <View>
            <Text style={styles.permName}>{type.toUpperCase()}</Text>
            <Text style={[styles.permStatus, status === 'granted' ? styles.statusGranted : styles.statusDenied]}>
              Status: {status}
            </Text>
          </View>

          <View style={styles.btnGroup}>
            <Pressable
              style={[styles.btn, styles.grantBtn]}
              testID={`grant-${type}-btn`}
              onPress={() => requestPerm(type)}
            >
              <Text style={styles.btnText}>Grant</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.denyBtn]}
              testID={`deny-${type}-btn`}
              onPress={() => denyPerm(type)}
            >
              <Text style={styles.btnText}>Deny</Text>
            </Pressable>
          </View>
        </View>
      ))}
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
    marginBottom: 24
  },
  row: {
    backgroundColor: '#181B21',
    borderWidth: 1,
    borderColor: '#30363D',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  permName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF'
  },
  permStatus: {
    fontSize: 12,
    marginTop: 4
  },
  statusGranted: {
    color: '#3FB950'
  },
  statusDenied: {
    color: '#F85149'
  },
  btnGroup: {
    flexDirection: 'row',
    gap: 8
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  grantBtn: {
    backgroundColor: '#238636'
  },
  denyBtn: {
    backgroundColor: '#DA3633'
  },
  btnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold'
  }
});
