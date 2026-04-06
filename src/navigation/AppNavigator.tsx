import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootTabParamList, RootStackParamList } from '../types';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

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

// Tab 图标映射
const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Home: { active: 'wardrobe', inactive: 'wardrobe-outline' },
  Outfit: { active: 'tshirt-crew', inactive: 'tshirt-crew-outline' },
  Calendar: { active: 'calendar-month', inactive: 'calendar-month-outline' },
  Stats: { active: 'chart-bar', inactive: 'chart-bar' },
  My: { active: 'account-circle', inactive: 'account-circle-outline' },
};

// 自定义 Tab Bar（已包含 SafeArea.bottom）
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <View style={styles.tabBarOuter}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.title || route.name;
          const isFocused = state.index === index;
          const icon = TAB_ICONS[route.name] || { active: 'circle', inactive: 'circle-outline' };

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <View key={route.key} style={styles.tabItem}>
              <View
                style={[
                  styles.tabButton,
                  isFocused && styles.tabButtonFocused,
                ]}
              >
                <Icon
                  name={isFocused ? icon.active : icon.inactive}
                  size={26}
                  color={isFocused ? COLORS.primary : COLORS.textSecondary}
                  onPress={onPress}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  isFocused && styles.tabLabelFocused,
                ]}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
      {/* iOS home indicator */}
      {Platform.OS === 'ios' && <View style={styles.homeIndicator} />}
    </View>
  );
};

// 主 Tab 页
const MainTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '衣橱' }} />
      <Tab.Screen name="Outfit" component={OutfitScreen} options={{ title: '搭配' }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: '日历' }} />
      <Tab.Screen name="Stats" component={StatsScreen} options={{ title: '统计' }} />
      <Tab.Screen name="My" component={SettingsScreen} options={{ title: '我的' }} />
    </Tab.Navigator>
  );
};

// 通用 Stack 屏幕配置
const screenOptions = {
  headerStyle: {
    backgroundColor: COLORS.card,
  },
  headerTintColor: COLORS.textPrimary,
  headerTitleStyle: {
    fontWeight: '600' as const,
    fontSize: FONT_SIZES.lg,
  },
  headerShadowVisible: true,
  headerBackTitleVisible: false,
};

// 根 Stack
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
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
  tabBarOuter: {
    backgroundColor: COLORS.card,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tabBar: {
    flexDirection: 'row',
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabButton: {
    width: 48,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonFocused: {
    backgroundColor: COLORS.primary + '18',
  },
  tabLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 3,
    fontWeight: '500',
  },
  tabLabelFocused: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  homeIndicator: {
    height: 34,
    backgroundColor: COLORS.card,
  },
});

export default AppNavigator;
