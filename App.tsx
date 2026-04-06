import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { useStore } from './src/store/useStore';
import { COLORS } from './src/constants/theme';

// 自定义 Paper 主题（与 App 配色一致）
const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    background: COLORS.background,
    surface: COLORS.card,
    error: COLORS.error,
    onPrimary: '#ffffff',
    outline: COLORS.border,
  },
};

function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const loadData = useStore(state => state.loadData);

  useEffect(() => {
    const init = async () => {
      await loadData();
      setIsReady(true);
    };
    init();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        {/* translucent=false 确保内容不被状态栏遮挡 */}
        <StatusBar
          barStyle="dark-content"
          backgroundColor={Platform.OS === 'android' ? COLORS.card : undefined}
          translucent={false}
        />
        <AppContent />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
