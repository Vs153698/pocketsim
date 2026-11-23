import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  FlatList,
  Modal,
  SafeAreaView
} from 'react-native';

interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
}

export default function App() {
  const [items, setItems] = useState<TodoItem[]>([
    { id: '1', title: 'Verify PocketSim runtime', completed: true },
    { id: '2', title: 'Test Flexbox layout', completed: true },
    { id: '3', title: 'Test user touch interactions', completed: false }
  ]);
  const [inputText, setInputText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const addItem = () => {
    if (!inputText.trim()) return;
    setItems(prev => [
      ...prev,
      { id: Date.now().toString(), title: inputText.trim(), completed: false }
    ]);
    setInputText('');
  };

  const toggleItem = (id: string) => {
    setItems(prev =>
      prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item)
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} testID="app-header">Expo Basic Demo</Text>
        <Pressable
          style={styles.infoButton}
          testID="info-modal-button"
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.infoButtonText}>ℹ️ Info</Text>
        </Pressable>
      </View>

      <View style={styles.formRow}>
        <TextInput
          style={styles.input}
          placeholder="New Task..."
          placeholderTextColor="#888"
          testID="task-input"
          value={inputText}
          onChangeText={setInputText}
        />
        <Pressable style={styles.addButton} testID="add-task-btn" onPress={addItem}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.taskItem, item.completed && styles.taskCompleted]}
            testID={`task-item-${item.id}`}
            onPress={() => toggleItem(item.id)}
          >
            <Text style={[styles.taskText, item.completed && styles.taskTextCompleted]}>
              {item.completed ? '✓ ' : '○ '} {item.title}
            </Text>
          </Pressable>
        )}
      />

      {/* Info Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle} testID="modal-title">About PocketSim</Text>
            <Text style={styles.modalBody}>
              PocketSim executes real Expo and React Native applications directly in a lightweight virtual environment without booting Xcode or Android Studio.
            </Text>
            <Pressable
              style={styles.closeModalButton}
              testID="close-modal-btn"
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
    padding: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  infoButton: {
    padding: 8,
    backgroundColor: '#26282E',
    borderRadius: 8
  },
  infoButtonText: {
    color: '#388BFD',
    fontSize: 13,
    fontWeight: '600'
  },
  formRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: '#1C1D22',
    borderWidth: 1,
    borderColor: '#30363D',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#FFF'
  },
  addButton: {
    width: 72,
    height: 44,
    backgroundColor: '#388BFD',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold'
  },
  taskItem: {
    padding: 14,
    backgroundColor: '#1C1D22',
    borderWidth: 1,
    borderColor: '#26282E',
    borderRadius: 8,
    marginBottom: 8
  },
  taskCompleted: {
    opacity: 0.6
  },
  taskText: {
    color: '#FFF',
    fontSize: 15
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#8B949E'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#1C1D22',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#30363D'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10
  },
  modalBody: {
    color: '#8B949E',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20
  },
  closeModalButton: {
    backgroundColor: '#388BFD',
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeModalButtonText: {
    color: '#FFF',
    fontWeight: '600'
  }
});
