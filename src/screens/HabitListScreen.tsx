import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Habit } from '../types/habit';

export const HabitListScreen = () => {
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    const querySnapshot = await getDocs(collection(db, 'habits'));
    const habitsList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Habit));
    setHabits(habitsList);
  };

  const toggleHabit = async (habit: Habit) => {
    const today = new Date().toISOString().split('T')[0];
    const habitRef = doc(db, 'habits', habit.id);
    
    const newCompletedDates = habit.completedDates.includes(today)
      ? habit.completedDates.filter(date => date !== today)
      : [...habit.completedDates, today];
    
    await updateDoc(habitRef, { completedDates: newCompletedDates });
    loadHabits();
  };

  const getStreak = (completedDates: string[]) => {
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

  return (
    <View style={styles.container}>
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
              <Text style={styles.streak}>Streak: {getStreak(item.completedDates)}</Text>
            </View>
            <View style={[
              styles.checkbox,
              item.completedDates.includes(new Date().toISOString().split('T')[0]) && styles.checked
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
    padding: 20,
  },
  habitItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 18,
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
  },
  checked: {
    backgroundColor: '#000',
  },
}); 