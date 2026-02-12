import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Context
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { Colors } from './src/theme';
import { RevenueCatService } from './src/services/revenuecat';

// Layouts
import { DashboardLayout } from './src/layouts/DashboardLayout';

// Screens
import { OnboardingScreen } from './src/screens/Onboarding';
import { RegisterScreen } from './src/screens/Register';
import { LoginScreen } from './src/screens/Login';
import { DashboardScreen } from './src/screens/Dashboard';
import { DiscoveryScreen } from './src/screens/Discovery';
import { ScheduleScreen } from './src/screens/Schedule';
import { QuotesScreen } from './src/screens/Quotes';
import { SettingsScreen } from './src/screens/Settings';
import { ChatScreen } from './src/screens/Chat';
import { SavedSnippetsScreen } from './src/screens/SavedSnippets';
import { PaywallScreen } from './src/screens/Paywall';
import { LegalScreen } from './src/screens/Legal';
import { AccountScreen } from './src/screens/Account';

const Stack = createStackNavigator();

const linking = {
  prefixes: ['http://localhost:8081', 'shipyard://'],
  config: {
    screens: {
      Onboarding: 'onboarding',
      Register: 'register',
      Login: 'login',
      Dashboard: 'dashboard',
      Discovery: 'discovery',
      Chat: 'chat/:coachId',
      SavedSnippets: 'saved',
      Settings: 'settings',
      Legal: 'legal',
      Schedule: 'schedule',
      Quotes: 'quotes',
      Account: 'account',
      Paywall: 'paywall',
      // Determine default based on auth state ideally, but simpler here
    },
  },
};

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Web-specific global barrier to ensure full-screen scrolling works
  const WebGlobalStyles = Platform.OS === 'web' ? (
    <style type="text/css">{`
      html, body, #root {
        height: 100%;
        width: 100%;
        overflow: hidden; /* Prevent window scroll */
        display: flex;
        flex-direction: column;
      }
      /* Fix flexbox min-height bug on web */
      #root > div {
        display: flex;
        flex: 1;
        min-height: 0;
      }
    `}</style>
  ) : null;

  return (
    <>
      {WebGlobalStyles}
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: 'transparent' },
          // animationEnabled: false // Disable animation for "tab-like" sidebar feel
        }}
      >
        {user ? (
          // Protected Routes (Dashboard Layout)
          <>
            <Stack.Screen name="Dashboard">
              {() => (
                <DashboardLayout>
                  <DashboardScreen />
                </DashboardLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="Schedule">
              {() => (
                <DashboardLayout>
                  <ScheduleScreen />
                </DashboardLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="Quotes">
              {() => (
                <DashboardLayout>
                  <QuotesScreen />
                </DashboardLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="Settings">
              {() => (
                <DashboardLayout>
                  <SettingsScreen />
                </DashboardLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="Account">
              {() => (
                <DashboardLayout>
                  <AccountScreen />
                </DashboardLayout>
              )}
            </Stack.Screen>

            {/* Discovery can be in layout or standalone, sticking to layout for consistency */}
            <Stack.Screen name="Discovery">
              {() => (
                <DashboardLayout>
                  <DiscoveryScreen />
                </DashboardLayout>
              )}
            </Stack.Screen>

            {/* Standalone Screens */}
            <Stack.Screen name="Chat">
              {({ route, navigation }) => (
                <DashboardLayout>
                  <ChatScreen route={route} navigation={navigation} />
                </DashboardLayout>
              )}
            </Stack.Screen>
            <Stack.Screen name="SavedSnippets" component={SavedSnippetsScreen} />
            <Stack.Screen name="Legal">
              {({ route, navigation }: any) => (
                <DashboardLayout>
                  <LegalScreen route={route} navigation={navigation} />
                </DashboardLayout>
              )}
            </Stack.Screen>
            <Stack.Screen
              name="Paywall"
              component={PaywallScreen}
              options={{ presentation: 'modal' }}
            />
          </>
        ) : (
          // Auth Stack
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </>
  );
};

export default function App() {
  useEffect(() => {
    RevenueCatService.setup();
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <NavigationContainer linking={linking}>
          <StatusBar style="dark" />
          <AppContent />
        </NavigationContainer>
      </ThemeProvider>
    </AuthProvider>
  );
}
