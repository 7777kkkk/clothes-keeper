import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3DarkTheme } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { useStore } from './src/store/useStore';
import { COLORS } from './src/constants/theme';
import { GradientBackground } from './src/components/glass/GradientBackground';

const paperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.accent,
    background: COLORS.background,
    surface: COLORS.glass,
    surfaceVariant: COLORS.glassLight,
    error: COLORS.error,
    onPrimary: '#fff',
    outline: COLORS.glassBorder,
    onSurface: COLORS.textPrimary,
    onSurfaceVariant: COLORS.textSecondary,
  },
};

function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const loadData = useStore(state => state.loadData);

  useEffect(() => {
    loadData().then(() => setIsReady(true));
  }, []);

  if (!isReady) {
    return (
      <GradientBackground>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </GradientBackground>
    );
  }
  return <AppNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <AppContent />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  loadingText: {
    marginTop: 14, color: COLORS.textSecondary, fontSize: 13,
  },
});
