import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, getDocs, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Habit } from '../types/habit';
import { useNavigation } from '@react-navigation/native';

export const HabitListScreen = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(collection(db, 'habits'), (snapshot) => {
        const habitsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Habit));
        setHabits(habitsList);
      }, (error) => {
        console.error('Firebase error:', error);
        setError(error.message);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Setup error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  const toggleHabit = async (habit: Habit) => {
    const today = new Date().toISOString().split('T')[0];
    const habitRef = doc(db, 'habits', habit.id);
    
    const newCompletedDates = habit.completedDates?.includes(today)
      ? habit.completedDates.filter(date => date !== today)
      : [...(habit.completedDates || []), today];
    
    await updateDoc(habitRef, { completedDates: newCompletedDates });
  };

  const getStreak = (completedDates: string[] = []) => {
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    if (completedDates.includes(today)) {
      streak = 1;
      let currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - 1);
      
      while (completedDates.includes(currentDate.toISOString().split('T')[0])) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }
    }
    
    return streak;
  };

  if (habits.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No habits yet!</Text>
        <Text style={styles.emptySubText}>Tap + to add a new habit</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Habit Tracker</Text>
      {error && (
        <Text style={styles.errorText}>Error: {error}</Text>
      )}
      <Text style={styles.text}>Number of habits: {habits.length}</Text>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.habitItem}
            onPress={() => toggleHabit(item)}
          >
            <View style={styles.habitInfo}>
              <Text style={styles.habitName}>{item.name}</Text>
              <Text style={styles.streak}>
                Current streak: {getStreak(item.completedDates)} days
              </Text>
            </View>
            <View style={[
              styles.checkbox,
              item.completedDates?.includes(new Date().toISOString().split('T')[0]) && 
              styles.checked
            ]} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  emptyText: {
    fontSize: 20,
    color: '#666',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: '#999',
  },
  habitItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 18,
    marginBottom: 4,
  },
  streak: {
    fontSize: 14,
    color: '#666',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
    marginLeft: 16,
  },
  checked: {
    backgroundColor: '#000',
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  }
}); 