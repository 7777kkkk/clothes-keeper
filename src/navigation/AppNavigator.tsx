import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons as Icon } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';

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
import LiquidGlassDemoScreen from '../screens/LiquidGlassDemoScreen';
import AttributeManageScreen from '../screens/AttributeManageScreen';
import BodyDataScreen from '../screens/BodyDataScreen';
import RecycleBinScreen from '../screens/RecycleBinScreen';
import { RootTabParamList, RootStackParamList } from '../types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Ionicons icon names for tabs
const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Home: { active: 'shirt', inactive: 'shirt-outline' },
  Outfit: { active: 'layers', inactive: 'layers-outline' },
  Calendar: { active: 'calendar', inactive: 'calendar-outline' },
  Stats: { active: 'stats-chart', inactive: 'stats-chart-outline' },
  My: { active: 'person', inactive: 'person-outline' },
};

const LightTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    background: 'transparent',
    card: 'rgba(255,255,255,0.85)',
    text: COLORS.textPrimary,
    border: 'rgba(255,255,255,0.5)',
    notification: COLORS.primary,
  },
};

const CustomTabBar = ({ state, descriptors, navigation }: any) => (
  <View style={tabStyles.tabBarOuter}>
    <View style={tabStyles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.title || route.name;
        const isFocused = state.index === index;
        const icon = TAB_ICONS[route.name] || { active: 'ellipse', inactive: 'ellipse-outline' };

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <View key={route.key} style={tabStyles.tabItem}>
            <View style={[tabStyles.tabButton, isFocused && tabStyles.tabButtonFocused]}>
              <Icon
                name={(isFocused ? icon.active : icon.inactive) as any}
                size={24}
                color={isFocused ? COLORS.primary : 'rgba(0,0,0,0.35)'}
                onPress={onPress}
              />
            </View>
            <Text style={[tabStyles.tabLabel, isFocused && tabStyles.tabLabelFocused]}>{label}</Text>
          </View>
        );
      })}
    </View>
    {Platform.OS === 'ios' && <View style={tabStyles.homeIndicator} />}
  </View>
);

const MainTabs = () => (
  <Tab.Navigator
    tabBar={(props: any) => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ title: '衣橱' }} />
    <Tab.Screen name="Outfit" component={OutfitScreen} options={{ title: '搭配' }} />
    <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: '日历' }} />
    <Tab.Screen name="Stats" component={StatsScreen} options={{ title: '统计' }} />
    <Tab.Screen name="My" component={SettingsScreen} options={{ title: '我的' }} />
  </Tab.Navigator>
);

const AppNavigator = () => (
  <NavigationContainer theme={LightTheme}>
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: 'rgba(255,255,255,0.85)' },
        headerTintColor: '#333',
        headerTitleStyle: { fontWeight: '600' as const, fontSize: FONT_SIZES.lg },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="AddClothing" component={AddClothingScreen} options={{ title: '添加单品' }} />
      <Stack.Screen name="ClothingDetail" component={ClothingDetailScreen} options={{ title: '单品详情' }} />
      <Stack.Screen name="CreateOutfit" component={CreateOutfitScreen} options={{ title: '创建搭配' }} />
      <Stack.Screen name="CategoryManage" component={CategoryManageScreen} options={{ title: '管理品类' }} />
      <Stack.Screen name="OccasionManage" component={OccasionManageScreen} options={{ title: '管理场合' }} />
      <Stack.Screen name="LiquidGlassDemo" component={LiquidGlassDemoScreen} options={{ title: 'Liquid Glass 演示' }} />
      <Stack.Screen name="AttributeManage" component={AttributeManageScreen} options={{ title: '属性管理' }} />
      <Stack.Screen name="BodyData" component={BodyDataScreen} options={{ title: '身材数据' }} />
      <Stack.Screen name="RecycleBin" component={RecycleBinScreen} options={{ title: '回收站', headerShown: false }} />
    </Stack.Navigator>
  </NavigationContainer>
);

const tabStyles = StyleSheet.create({
  tabBarOuter: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.6)',
    ...Platform.select({
      ios: { shadowColor: 'rgba(0,0,0,0.12)', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 1, shadowRadius: 8 },
      android: { elevation: 8 },
    }),
  },
  tabBar: { flexDirection: 'row', paddingTop: SPACING.sm, paddingBottom: SPACING.sm, paddingHorizontal: SPACING.lg },
  tabItem: { flex: 1, alignItems: 'center' },
  tabButton: {
    width: 44, height: 30, borderRadius: BORDER_RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  tabButtonFocused: { backgroundColor: 'rgba(74,144,217,0.15)' },
  tabLabel: { fontSize: 9, color: 'rgba(0,0,0,0.35)', marginTop: 2, fontWeight: '500' },
  tabLabelFocused: { color: COLORS.primary, fontWeight: '700' },
  homeIndicator: { height: 34, backgroundColor: 'rgba(255,255,255,0.92)' },
});

export default AppNavigator;
