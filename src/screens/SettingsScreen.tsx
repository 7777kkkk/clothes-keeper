/**
 * SettingsScreen — 个人中心 / 设置页
 *
 * 设计规范（遵循 impeccable Skill）:
 * - 玻璃拟态：亚克力毛玻璃卡片 + 柔和蓝调阴影
 * - 布局节奏：信息密度适中，统计卡片突出，设置项清晰
 * - 交互反馈：列表项有 hover/press 反馈
 * - 数据联动：统计数据实时更新
 */
import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { RootStackParamList, Season } from '../types';
import { GlassCard, GlassPill, SectionHeader } from '../components/glass/GlassComponents';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SEASONS: Season[] = ['春', '夏', '秋', '冬'];

// ============================================================
//  StatCard — 统计大卡片
// ============================================================
const StatCard = ({
  value,
  label,
  icon,
  color = COLORS.primary,
  onPress,
}: {
  value: string | number;
  label: string;
  icon: string;
  color?: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.statCard}>
    <View style={[styles.statIconBg, { backgroundColor: color + '15' }]}>
      <Icon name={icon} size={22} color={color} />
    </View>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </TouchableOpacity>
);

// ============================================================
//  SettingRow — 设置项行
// ============================================================
const SettingRow = ({
  icon,
  title,
  subtitle,
  value,
  onPress,
  danger = false,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}) => (
  <TouchableOpacity
    activeOpacity={0.75}
    onPress={onPress}
    style={styles.settingRow}
  >
    <View style={[styles.settingIconBg, danger && styles.settingIconDanger]}>
      <Icon
        name={icon}
        size={20}
        color={danger ? COLORS.error : COLORS.primary}
      />
    </View>
    <View style={styles.settingText}>
      <Text style={[styles.settingTitle, danger && { color: COLORS.error }]}>{title}</Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    <View style={styles.settingRight}>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      <Icon name="chevron-right" size={20} color={COLORS.textMuted} />
    </View>
  </TouchableOpacity>
);

// ============================================================
//  SettingsScreen — 主页面
// ============================================================
const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { clothingItems, outfits, categories } = useStore();

  // 统计数据
  const stats = useMemo(() => {
    const totalValue = clothingItems.reduce((sum, i) => sum + (i.price || 0), 0);
    const seasonStats = SEASONS.map(s => ({
      season: s,
      count: clothingItems.filter(i => i.seasons.includes(s)).length,
    }));
    const topCategory = categories
      .map(cat => ({
        name: cat.name,
        count: clothingItems.filter(i => i.categoryId === cat.id).length,
      }))
      .sort((a, b) => b.count - a.count)[0];

    return { totalValue, seasonStats, topCategory };
  }, [clothingItems, categories]);

  // 按季节分布
  const seasonDistribution = useMemo(() => {
    return SEASONS.map(s => ({
      season: s,
      count: clothingItems.filter(i => i.seasons.includes(s)).length,
    })).filter(s => s.count > 0);
  }, [clothingItems]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ===== 顶部标题栏 ===== */}
      <View style={styles.topNav}>
        <Text style={styles.topNavTitle}>我的</Text>
      </View>

      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={[styles.mainContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== 统计数据区 ===== */}
        <SectionHeader title="衣橱统计" />
        <View style={styles.statsGrid}>
          <StatCard
            value={clothingItems.length}
            label="单品总数"
            icon="wardrobe"
            color={COLORS.primary}
            onPress={() => {}}
          />
          <StatCard
            value={outfits.length}
            label="搭配方案"
            icon="tshirt-crew"
            color={COLORS.accent}
            onPress={() => {}}
          />
          <StatCard
            value={categories.length}
            label="分类数量"
            icon="shape-outline"
            color="#8B5CF6"
            onPress={() => navigation.navigate('CategoryManage')}
          />
          <StatCard
            value={stats.totalValue > 0 ? `¥${stats.totalValue}` : '—'}
            label="衣橱总价值"
            icon="currency-cny"
            color="#F59E0B"
            onPress={() => {}}
          />
        </View>

        {/* ===== 季节分布 ===== */}
        {seasonDistribution.length > 0 && (
          <>
            <SectionHeader title="季节分布" />
            <GlassCard style={styles.distributionCard}>
              <View style={styles.distributionList}>
                {seasonDistribution.map(({ season, count }) => {
                  const maxCount = Math.max(...seasonDistribution.map(s => s.count));
                  const width = maxCount > 0 ? `${(count / maxCount) * 100}%` : '0%';
                  return (
                    <View key={season} style={styles.distributionItem}>
                      <View style={styles.distributionLabelRow}>
                        <GlassPill label={season} size="sm" />
                        <Text style={styles.distributionCount}>{count}</Text>
                      </View>
                      <View style={styles.distributionBarBg}>
                        <View
                          style={[
                            styles.distributionBarFill,
                            { width: width as any, backgroundColor: COLORS.primary },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </GlassCard>
          </>
        )}

        {/* ===== 设置项列表 ===== */}
        <SectionHeader title="衣橱管理" />
        <GlassCard style={styles.settingsGroup} padding="none">
          <SettingRow
            icon="shape-rectangle-plus"
            title="品类管理"
            subtitle={`${categories.length} 个分类`}
            onPress={() => navigation.navigate('CategoryManage')}
          />
          <SettingRow
            icon="calendar-clock"
            title="场合管理"
            onPress={() => navigation.navigate('OccasionManage')}
          />
        </GlassCard>

        <SectionHeader title="通用设置" />
        <GlassCard style={styles.settingsGroup} padding="none">
          <SettingRow
            icon="brightness-6"
            title="外观模式"
            value="浅色"
            onPress={() => {}}
          />
          <SettingRow
            icon="umbrella-beach"
            title="衣橱季节"
            value="全年"
            onPress={() => {}}
          />
          <SettingRow
            icon="ruler"
            title="身材数据"
            onPress={() => {}}
          />
          <SettingRow
            icon="currency-usd"
            title="货币单位"
            value="CNY"
            onPress={() => {}}
          />
        </GlassCard>

        <SectionHeader title="数据" />
        <GlassCard style={styles.settingsGroup} padding="none">
          <SettingRow
            icon="cloud-upload-outline"
            title="数据备份"
            subtitle="将衣橱数据备份到云端"
            onPress={() => {}}
          />
          <SettingRow
            icon="cloud-download-outline"
            title="恢复数据"
            subtitle="从备份恢复衣橱数据"
            onPress={() => {}}
          />
          <SettingRow
            icon="trash-can-outline"
            title="回收站"
            subtitle="已删除的衣物"
            onPress={() => {}}
          />
        </GlassCard>

        <SectionHeader title="其他" />
        <GlassCard style={styles.settingsGroup} padding="none">
          <SettingRow
            icon="information-outline"
            title="关于衣橱"
            subtitle="版本 1.0.0"
            onPress={() => {}}
          />
          <SettingRow
            icon="star-outline"
            title="给 App 评分"
            onPress={() => {}}
          />
          <SettingRow
            icon="share-variant"
            title="分享给好友"
            onPress={() => {}}
          />
        </GlassCard>

        {/* 底部版权 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Clothes Keeper v1.0</Text>
          <Text style={styles.footerSubtext}>Made with ❤️</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================================
//  Styles — 玻璃拟态设置页
// ============================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ---- 顶部标题栏 ----
  topNav: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.glass,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topNavTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },

  // ---- 主体 ----
  mainScroll: { flex: 1 },
  mainContent: {
    paddingTop: SPACING.lg,
  },

  // ---- 统计网格 ----
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.glass,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.glass,
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },

  // ---- 季节分布 ----
  distributionCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
  },
  distributionList: {
    gap: SPACING.md,
  },
  distributionItem: {},
  distributionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  distributionCount: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  distributionBarBg: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  distributionBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // ---- 设置项卡片 ----
  settingsGroup: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  settingIconBg: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingIconDanger: {
    backgroundColor: 'rgba(255,100,110,0.12)',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  settingSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  settingValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },

  // ---- 底部 ----
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.xs,
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
});

export default SettingsScreen;
