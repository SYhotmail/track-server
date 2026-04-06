import React, { useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';

import AccountScreen from './src/screens/AccountScreen';
import SigninScreen from './src/screens/SigninScreen';
import SignupScreen from './src/screens/SignupScreen';
import TrackCreateScreen from './src/screens/TrackCreateScreen';
import TrackDetailScreen from './src/screens/TrackDetailScreen';
import TrackListScreen from './src/screens/TrackListScreen';
import ResolveAuthScreen from './src/screens/ResolveAuthScreen';

import { Provider as AuthProvider } from './src/context/AuthContext';
import { Provider as LocationProvider } from './src/context/LocationContext';
import { Provider as TrackProvider } from './src/context/TrackContext';
import { setNavigator } from './src/navigationRef';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TrackListStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="TrackList" component={TrackListScreen} options={{ title: 'Tracks' }} />
      <Stack.Screen name="TrackDetail" component={TrackDetailScreen} options={{ title: 'Track Detail' }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e0e0e0' },
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tab.Screen
        name="trackListFlow"
        component={TrackListStack}
        options={{ title: 'Tracks', tabBarIcon: ({ color, size }) => <FontAwesome name="th-list" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="TrackCreate"
        component={TrackCreateScreen}
        options={{ title: 'Add Track', headerShown: true, tabBarIcon: ({ color, size }) => <FontAwesome name="plus" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{ title: 'Account', headerShown: true, tabBarIcon: ({ color, size }) => <FontAwesome name="gear" size={size} color={color} /> }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const navigationRef = useRef(null);
  return (
    <TrackProvider>
      <LocationProvider>
        <AuthProvider>
          <NavigationContainer ref={navigationRef} onReady={() => setNavigator(navigationRef.current)}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="ResolveAuth" component={ResolveAuthScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
              <Stack.Screen name="Signin" component={SigninScreen} />
              <Stack.Screen name="mainFlow" component={MainTabs} />
            </Stack.Navigator>
          </NavigationContainer>
        </AuthProvider>
      </LocationProvider>
    </TrackProvider>
  );
}