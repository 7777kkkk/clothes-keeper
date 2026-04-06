/**
 * SettingsScreen — 个人中心 / 设置页
 * 深色玻璃拟态，白色文字
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { GlassCard, GlassPill, SectionHeader } from '../components/glass/GlassComponents';
import { Season } from '../types';

const SEASONS: Season[] = ['春', '夏', '秋', '冬'];

// ============================================================
//  StatCard
// ============================================================
const StatCard = ({ v, l, icon, color }: { v: string | number; l: string; icon: string; color: string }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconBg, { backgroundColor: color + '18' }]}>
      <Icon name={icon} size={20} color={color} />
    </View>
    <Text style={[styles.statVal, { color }]}>{v}</Text>
    <Text style={styles.statLbl}>{l}</Text>
  </View>
);

// ============================================================
//  SettingRow
// ============================================================
const SettingRow = ({
  icon, title, subtitle, value, onPress, danger = false,
}: {
  icon: string; title: string; subtitle?: string; value?: string;
  onPress?: () => void; danger?: boolean;
}) => (
  <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={styles.settingRow}>
    <View style={[styles.settingIconBg, danger && { backgroundColor: 'rgba(239,83,80,0.15)' }]}>
      <Icon name={icon} size={18} color={danger ? COLORS.error : COLORS.primary} />
    </View>
    <View style={styles.settingText}>
      <Text style={[styles.settingTitle, danger && { color: COLORS.error }]}>{title}</Text>
      {subtitle && <Text style={styles.settingSub}>{subtitle}</Text>}
    </View>
    <View style={styles.settingRight}>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      <Icon name="chevron-right" size={18} color={COLORS.textMuted} />
    </View>
  </TouchableOpacity>
);

// ============================================================
//  SettingsScreen
// ============================================================
const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<any>();
  const { clothingItems, outfits, categories } = useStore();

  const stats = useMemo(() => {
    const totalVal = clothingItems.reduce((s, i) => s + (i.price || 0), 0);
    const seasonStats = SEASONS.map(s => ({
      season: s,
      cnt: clothingItems.filter(i => i.seasons.includes(s)).length,
    })).filter(s => s.cnt > 0);
    const maxCnt = Math.max(...seasonStats.map(s => s.cnt), 1);
    return { totalVal, seasonStats, maxCnt };
  }, [clothingItems]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topNav}>
        <Text style={styles.topNavTitle}>我的</Text>
      </View>

      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={[styles.mainContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 统计 */}
        <SectionHeader title="衣橱统计" />
        <View style={styles.statsGrid}>
          <StatCard v={clothingItems.length} l="单品" icon="wardrobe" color={COLORS.primary} />
          <StatCard v={outfits.length} l="搭配" icon="tshirt-crew" color={COLORS.accent} />
          <StatCard v={categories.length} l="分类" icon="shape-outline" color="#8B5CF6" />
          <StatCard
            v={stats.totalVal > 0 ? `¥${stats.totalVal}` : '—'}
            l="总价值"
            icon="currency-cny"
            color="#FFB74D"
          />
        </View>

        {/* 季节分布 */}
        {stats.seasonStats.length > 0 && (
          <>
            <SectionHeader title="季节分布" />
            <GlassCard style={styles.distCard} padding="lg">
              {stats.seasonStats.map(({ season, cnt }) => (
                <View key={season} style={styles.distItem}>
                  <View style={styles.distLabelRow}>
                    <GlassPill label={season} size="sm" />
                    <Text style={styles.distCnt}>{cnt}</Text>
                  </View>
                  <View style={styles.distBarBg}>
                    <View
                      style={[
                        styles.distBarFill,
                        { width: `${(cnt / stats.maxCnt) * 100}%`, backgroundColor: COLORS.primary },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </GlassCard>
          </>
        )}

        {/* 设置项 */}
        <SectionHeader title="衣橱管理" />
        <GlassCard style={styles.settingsGroup} padding="none">
          <SettingRow icon="shape-rectangle-plus" title="品类管理" subtitle={`${categories.length} 个分类`} onPress={() => nav.navigate('CategoryManage')} />
          <SettingRow icon="calendar-clock" title="场合管理" onPress={() => nav.navigate('OccasionManage')} />
        </GlassCard>

        <SectionHeader title="通用设置" />
        <GlassCard style={styles.settingsGroup} padding="none">
          <SettingRow icon="brightness-6" title="外观模式" value="浅色" />
          <SettingRow icon="umbrella-beach" title="衣橱季节" value="全年" />
          <SettingRow icon="ruler" title="身材数据" />
          <SettingRow icon="currency-usd" title="货币单位" value="CNY" />
        </GlassCard>

        <SectionHeader title="数据" />
        <GlassCard style={styles.settingsGroup} padding="none">
          <SettingRow icon="cloud-upload-outline" title="数据备份" subtitle="备份到云端" />
          <SettingRow icon="cloud-download-outline" title="恢复数据" subtitle="从备份恢复" />
          <SettingRow icon="trash-can-outline" title="回收站" subtitle="已删除衣物" danger />
        </GlassCard>

        <SectionHeader title="其他" />
        <GlassCard style={styles.settingsGroup} padding="none">
          <SettingRow icon="information-outline" title="关于衣橱" subtitle="版本 1.0.0" />
          <SettingRow icon="star-outline" title="给 App 评分" />
          <SettingRow icon="share-variant" title="分享给好友" />
        </GlassCard>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Clothes Keeper v1.0</Text>
          <Text style={styles.footerSub}>Made with ❤️</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================================
//  Styles
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topNav: {
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm,
    backgroundColor: COLORS.glass,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  topNavTitle: {
    fontSize: FONT_SIZES.xxl, fontWeight: '800',
    color: COLORS.textPrimary, letterSpacing: -0.5,
  },

  mainScroll: { flex: 1 },
  mainContent: { paddingTop: SPACING.lg },

  // Stats
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg, gap: SPACING.sm, marginBottom: SPACING.lg,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.glass,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.glassBorder,
    padding: SPACING.lg, alignItems: 'center',
    ...SHADOWS.glass,
  },
  statIconBg: {
    width: 40, height: 40, borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm,
  },
  statVal: { fontSize: FONT_SIZES.xxl, fontWeight: '800' },
  statLbl: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2, fontWeight: '500' },

  // Distribution
  distCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  distItem: { marginBottom: SPACING.md },
  distLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
  distCnt: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textPrimary },
  distBarBg: { height: 5, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' },
  distBarFill: { height: '100%', borderRadius: 3 },

  // Settings
  settingsGroup: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, overflow: 'hidden' },
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  settingIconBg: {
    width: 34, height: 34, borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primarySoft, justifyContent: 'center', alignItems: 'center',
  },
  settingText: { flex: 1 },
  settingTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.textPrimary },
  settingSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 1 },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  settingValue: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },

  // Footer
  footer: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.xs },
  footerText: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, fontWeight: '600' },
  footerSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
});

export default SettingsScreen;
