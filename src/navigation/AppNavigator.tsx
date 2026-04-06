import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';
import { RootTabParamList, RootStackParamList } from '../types';
import { COLORS, FONT_SIZES } from '../constants/theme';

// Screens
import HomeScreen from '../screens/HomeScreen';
import OutfitScreen from '../screens/OutfitScreen';
import CalendarScreen from '../screens/CalendarScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddClothingScreen from '../screens/AddClothingScreen';
import ClothingDetailScreen from '../screens/ClothingDetailScreen';
import CreateOutfitScreen from '../screens/CreateOutfitScreen';
import CategoryManageScreen from '../screens/CategoryManageScreen';
import OccasionManageScreen from '../screens/OccasionManageScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Tab Bar Icon
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const icons: Record<string, string> = {
    Home: '👔',
    Outfit: '✨',
    Calendar: '📅',
    Stats: '📊',
    My: '👤',
  };

  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>
        {icons[name] || '📦'}
      </Text>
    </View>
  );
};

// Main Tabs
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: '衣橱' }}
      />
      <Tab.Screen 
        name="Outfit" 
        component={OutfitScreen}
        options={{ title: '搭配' }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen}
        options={{ title: '日历' }}
      />
      <Tab.Screen 
        name="Stats" 
        component={StatsScreen}
        options={{ title: '统计' }}
      />
      <Tab.Screen 
        name="My" 
        component={SettingsScreen}
        options={{ title: '我的' }}
      />
    </Tab.Navigator>
  );
};

// Root Stack Navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.card },
          headerTintColor: COLORS.textPrimary,
          headerTitleStyle: { fontWeight: '600' },
        }}
      >
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AddClothing" 
          component={AddClothingScreen}
          options={{ title: '添加单品' }}
        />
        <Stack.Screen 
          name="ClothingDetail" 
          component={ClothingDetailScreen}
          options={{ title: '单品详情' }}
        />
        <Stack.Screen 
          name="CreateOutfit" 
          component={CreateOutfitScreen}
          options={{ title: '创建搭配' }}
        />
        <Stack.Screen 
          name="CategoryManage" 
          component={CategoryManageScreen}
          options={{ title: '管理品类' }}
        />
        <Stack.Screen 
          name="OccasionManage" 
          component={OccasionManageScreen}
          options={{ title: '管理场合' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    paddingBottom: 8,
    height: 70,
  },
  tabLabel: {
    fontSize: FONT_SIZES.xs,
    marginTop: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
    opacity: 0.6,
  },
  iconFocused: {
    opacity: 1,
  },
});

export default AppNavigator;
