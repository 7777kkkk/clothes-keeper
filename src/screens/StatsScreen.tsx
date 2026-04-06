import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const StatsScreen = () => {
  const { clothingItems, outfits, calendarRecords, categories } = useStore();

  // 统计数据
  const totalItems = clothingItems.length;
  const totalOutfits = outfits.length;
  const totalRecords = calendarRecords.length;

  // 品类分布
  const categoryStats = categories.map(cat => ({
    name: cat.name,
    count: clothingItems.filter(item => item.categoryId === cat.id).length,
  })).filter(s => s.count > 0);

  // 季节分布
  const seasonStats = ['春', '夏', '秋', '冬'].map(season => ({
    season,
    count: clothingItems.filter(item => item.seasons.includes(season)).length,
  })).filter(s => s.count > 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>穿搭统计</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 总体概览 */}
        <View style={styles.overviewRow}>
          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <Text style={styles.statNumber}>{totalItems}</Text>
            <Text style={styles.statLabel}>衣物总数</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <Text style={styles.statNumber}>{totalOutfits}</Text>
            <Text style={styles.statLabel}>搭配数量</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
            <Text style={styles.statNumber}>{totalRecords}</Text>
            <Text style={styles.statLabel}>穿搭记录</Text>
          </View>
        </View>

        {/* 品类分布 */}
        {categoryStats.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👔 品类分布</Text>
            {categoryStats.map((stat, i) => (
              <View key={i} style={styles.statRow}>
                <Text style={styles.statName}>{stat.name}</Text>
                <View style={styles.statBarContainer}>
                  <View
                    style={[
                      styles.statBar,
                      { width: `${(stat.count / totalItems) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.statCount}>{stat.count}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 季节分布 */}
        {seasonStats.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌤️ 季节分布</Text>
            <View style={styles.seasonGrid}>
              {seasonStats.map((stat, i) => {
                const colors: Record<string, string> = {
                  '春': '#81C784',
                  '夏': '#FFD54F',
                  '秋': '#FFB74D',
                  '冬': '#90CAF9',
                };
                return (
                  <View key={i} style={[styles.seasonCard, { backgroundColor: colors[stat.season] + '30' }]}>
                    <Text style={styles.seasonEmoji}>
                      {{ '春': '🌸', '夏': '☀️', '秋': '🍂', '冬': '❄️' }[stat.season]}
                    </Text>
                    <Text style={styles.seasonName}>{stat.season}</Text>
                    <Text style={styles.seasonCount}>{stat.count}件</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {totalItems === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>还没有任何数据</Text>
            <Text style={styles.emptySubtext}>添加衣物后这里会显示统计信息</Text>
          </View>
        )}
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
  overviewRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  statNumber: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  section: {
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statName: {
    width: 60,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  statBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    marginHorizontal: SPACING.sm,
    overflow: 'hidden',
  },
  statBar: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 4,
  },
  statCount: {
    width: 30,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
  seasonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  seasonCard: {
    width: '47%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  seasonEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  seasonName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  seasonCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});

export default StatsScreen;
