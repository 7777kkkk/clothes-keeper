import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text, ActivityIndicator } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { useStore } from './src/store/useStore';
import { COLORS } from './src/constants/theme';

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 16, color: COLORS.textSecondary, fontSize: 14 }}>
          加载中...
        </Text>
      </View>
    );
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <AppContent />
    </>
  );
}
