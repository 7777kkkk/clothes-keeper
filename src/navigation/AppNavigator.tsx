import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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
import { RootTabParamList, RootStackParamList } from '../types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Home: { active: 'wardrobe', inactive: 'wardrobe-outline' },
  Outfit: { active: 'tshirt-crew', inactive: 'tshirt-crew-outline' },
  Calendar: { active: 'calendar-month', inactive: 'calendar-month-outline' },
  Stats: { active: 'chart-bar', inactive: 'chart-bar' },
  My: { active: 'account-circle', inactive: 'account-circle-outline' },
};

const DarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.tabBar,
    text: COLORS.textPrimary,
    border: COLORS.glassBorder,
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
        const icon = TAB_ICONS[route.name] || { active: 'circle', inactive: 'circle-outline' };

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <View key={route.key} style={tabStyles.tabItem}>
            <View style={[tabStyles.tabButton, isFocused && tabStyles.tabButtonFocused]}>
              <Icon
                name={isFocused ? icon.active : icon.inactive}
                size={24}
                color={isFocused ? COLORS.primary : COLORS.textMuted}
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
  <NavigationContainer theme={DarkTheme}>
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.tabBar },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: { fontWeight: '600' as const, fontSize: FONT_SIZES.lg },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="AddClothing" component={AddClothingScreen} options={{ title: '添加单品' }} />
      <Stack.Screen name="ClothingDetail" component={ClothingDetailScreen} options={{ title: '单品详情' }} />
      <Stack.Screen name="CreateOutfit" component={CreateOutfitScreen} options={{ title: '创建搭配' }} />
      <Stack.Screen name="CategoryManage" component={CategoryManageScreen} options={{ title: '管理品类' }} />
      <Stack.Screen name="OccasionManage" component={OccasionManageScreen} options={{ title: '管理场合' }} />
    </Stack.Navigator>
  </NavigationContainer>
);

const tabStyles = StyleSheet.create({
  tabBarOuter: {
    backgroundColor: COLORS.tabBar,
    borderTopWidth: 1,
    borderTopColor: COLORS.tabBarBorder,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.35, shadowRadius: 12 },
      android: { elevation: 12 },
    }),
  },
  tabBar: { flexDirection: 'row', paddingTop: SPACING.sm, paddingBottom: SPACING.sm, paddingHorizontal: SPACING.lg },
  tabItem: { flex: 1, alignItems: 'center' },
  tabButton: {
    width: 44, height: 30, borderRadius: BORDER_RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  tabButtonFocused: { backgroundColor: COLORS.primarySoft },
  tabLabel: { fontSize: 9, color: COLORS.textMuted, marginTop: 2, fontWeight: '500' },
  tabLabelFocused: { color: COLORS.primary, fontWeight: '700' },
  homeIndicator: { height: 34, backgroundColor: COLORS.tabBar },
});

export default AppNavigator;
