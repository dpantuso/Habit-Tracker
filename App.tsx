import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HabitListScreen } from './src/screens/HabitListScreen';
import { AddHabitScreen } from './src/screens/AddHabitScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Habits" 
          component={HabitListScreen}
          options={({ navigation }) => ({
            headerRight: () => (
              <TouchableOpacity onPress={() => navigation.navigate('AddHabit')}>
                <Text style={{ fontSize: 24, marginRight: 15 }}>+</Text>
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen name="AddHabit" component={AddHabitScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 