import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const menuItems = [
    {
      title: '管理选项',
      items: [
        {
          icon: '📂',
          label: '品类分类',
          sub: '管理衣物分类',
          screen: 'CategoryManage' as const,
        },
        {
          icon: '✨',
          label: '场合管理',
          sub: '自定义穿搭场合',
          screen: 'OccasionManage' as const,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom + 80 }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>我的</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {menuItems.map((group, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionTitle}>{group.title}</Text>
            {group.items.map((item, j) => (
              <TouchableOpacity
                key={j}
                style={styles.menuItem}
                onPress={() => navigation.navigate(item.screen)}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <View style={styles.menuText}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuSub}>{item.sub}</Text>
                </View>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* App 信息 */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>ClothesKeeper</Text>
          <Text style={styles.appVersion}>v0.1.0</Text>
          <Text style={styles.appDesc}>你的私人电子衣柜</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.card,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  content: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.card,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  menuText: {
    flex: 1,
  },
  menuLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  menuSub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  menuArrow: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  appName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  appVersion: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  appDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});

export default SettingsScreen;
