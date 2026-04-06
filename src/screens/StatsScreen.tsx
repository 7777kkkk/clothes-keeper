/**
 * StatsScreen — 统计页面
 * 深色玻璃拟态，白色文字
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { GlassCard, GlassPill } from '../components/glass/GlassComponents';
import { GradientBackground } from '../components/glass/GradientBackground';
import { Season } from '../types';

const SEASONS: Season[] = ['春', '夏', '秋', '冬'];

// ============================================================
//  StatCard
// ============================================================
const StatCard = ({
  v, l, icon, color,
}: {
  v: string | number; l: string; icon: string; color: string;
}) => (
  <View style={statsStyles.statCard}>
    <View style={[statsStyles.statIconBg, { backgroundColor: color + '18' }]}>
      <Icon name={icon} size={20} color={color} />
    </View>
    <Text style={[statsStyles.statVal, { color }]}>{v}</Text>
    <Text style={statsStyles.statLbl}>{l}</Text>
  </View>
);

// ============================================================
//  StatsScreen
// ============================================================
const StatsScreen = () => {
  const insets = useSafeAreaInsets();
  const { clothingItems, outfits, calendarRecords, categories } = useStore();

  const stats = useMemo(() => {
    const totalVal = clothingItems.reduce((s, i) => s + (i.price || 0), 0);
    const seasonStats = SEASONS.map(s => ({
      season: s,
      cnt: clothingItems.filter(i => i.seasons.includes(s)).length,
    })).filter(s => s.cnt > 0);
    const catStats = categories.map(c => ({
      name: c.name,
      cnt: clothingItems.filter(i => i.categoryId === c.id).length,
    })).filter(s => s.cnt > 0);
    const maxCnt = Math.max(...seasonStats.map(s => s.cnt), ...catStats.map(s => s.cnt), 1);
    return { totalVal, seasonStats, catStats, maxCnt };
  }, [clothingItems, categories]);

  return (
    <GradientBackground>
    <SafeAreaView style={[statsStyles.container, { paddingTop: insets.top }]} edges={['top']}>
      <View style={statsStyles.topNav}>
        <Text style={statsStyles.topNavTitle}>穿搭统计</Text>
      </View>

      <ScrollView
        style={statsStyles.mainScroll}
        contentContainerStyle={[statsStyles.mainContent, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 统计卡片网格 */}
        <View style={statsStyles.statsGrid}>
          <StatCard v={clothingItems.length} l="单品" icon="shirt" color={COLORS.primary} />
          <StatCard v={outfits.length} l="搭配" icon="body" color={COLORS.accent} />
          <StatCard v={calendarRecords.length} l="穿搭记录" icon="calendar-check" color="#8B5CF6" />
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
            <Text style={statsStyles.sectionTitle}>季节分布</Text>
            <GlassCard style={statsStyles.distCard} padding="lg">
              {stats.seasonStats.map(({ season, cnt }) => (
                <View key={season} style={statsStyles.distItem}>
                  <View style={statsStyles.distLabelRow}>
                    <GlassPill label={season} size="sm" />
                    <Text style={statsStyles.distCnt}>{cnt}</Text>
                  </View>
                  <View style={statsStyles.distBarBg}>
                    <View
                      style={[
                        statsStyles.distBarFill,
                        { width: `${(cnt / stats.maxCnt) * 100}%`, backgroundColor: COLORS.primary },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </GlassCard>
          </>
        )}

        {/* 品类分布 */}
        {stats.catStats.length > 0 && (
          <>
            <Text style={statsStyles.sectionTitle}>品类分布</Text>
            <GlassCard style={statsStyles.distCard} padding="lg">
              {stats.catStats.map(({ name, cnt }) => (
                <View key={name} style={statsStyles.distItem}>
                  <View style={statsStyles.distLabelRow}>
                    <Text style={statsStyles.distCatName}>{name}</Text>
                    <Text style={statsStyles.distCnt}>{cnt}</Text>
                  </View>
                  <View style={statsStyles.distBarBg}>
                    <View
                      style={[
                        statsStyles.distBarFill,
                        { width: `${(cnt / stats.maxCnt) * 100}%`, backgroundColor: COLORS.accent },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </GlassCard>
          </>
        )}

        {/* 空状态 */}
        {clothingItems.length === 0 && (
          <GlassCard style={statsStyles.emptyCard}>
            <Icon name="stats-chart-outline" size={48} color={'rgba(0,0,0,0.35)'} />
            <Text style={statsStyles.emptyTitle}>暂无数据</Text>
            <Text style={statsStyles.emptySub}>添加衣物后显示统计</Text>
          </GlassCard>
        )}
      </ScrollView>
        </SafeAreaView>
    </GradientBackground>
  );
};

const statsStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.card },
  topNav: {
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  topNavTitle: {
    fontSize: FONT_SIZES.xxl, fontWeight: '800',
    color: COLORS.textPrimary, letterSpacing: -0.5,
  },
  mainScroll: { flex: 1 },
  mainContent: { padding: SPACING.lg },

  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: SPACING.sm, marginBottom: SPACING.xl,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
    padding: SPACING.lg, alignItems: 'center',
    ...SHADOWS.glass,
  },
  statIconBg: {
    width: 40, height: 40, borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm,
  },
  statVal: { fontSize: FONT_SIZES.xxl, fontWeight: '800' },
  statLbl: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2, fontWeight: '500' },

  sectionTitle: {
    fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  distCard: { marginBottom: SPACING.lg },
  distItem: { marginBottom: SPACING.md },
  distLabelRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs,
  },
  distCatName: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textPrimary },
  distCnt: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textPrimary },
  distBarBg: {
    height: 5, backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3, overflow: 'hidden',
  },
  distBarFill: { height: '100%', borderRadius: 3 },

  emptyCard: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyTitle: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.textSecondary, marginTop: SPACING.md },
  emptySub: { fontSize: FONT_SIZES.sm, color: 'rgba(0,0,0,0.35)', marginTop: SPACING.xs },
});

export default StatsScreen;
