/**
 * LiquidGlassDemoScreen — Liquid Glass 效果演示页面
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from '@expo/vector-icons/Ionicons';
import { GradientBackground } from '../components/glass/GradientBackground';
import { LiquidGlassCard, LiquidGlassPill } from '../components/glass/LiquidGlassCard';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

const DEMO_ITEMS = [
  { title: '黑色休闲西装外套', brand: 'UNIQLO', price: '¥599', color: '#4A90D9' },
  { title: '白色纯棉T恤', brand: 'UNIQLO', price: '¥79', color: '#5AC8FA' },
  { title: '深蓝色牛仔裤', brand: "Levi's", price: '¥699', color: '#7B68EE' },
  { title: '灰色卫衣', brand: 'Nike', price: '¥399', color: '#9370DB' },
];

const LiquidGlassDemoScreen = () => {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<any>();

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* 顶部导航 */}
        <View style={[styles.topNav, { paddingTop: insets.top + SPACING.sm }]}>
          <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
            <Icon name="chevron-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Liquid Glass 演示</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* 说明 */}
          <LiquidGlassCard style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Icon name="water" size={28} color={COLORS.primary} />
              <View style={styles.infoRow}>
                <Text style={styles.infoTitle}>WWDC 2025 Liquid Glass</Text>
                <Text style={styles.infoSub}>磨砂玻璃 + 流动高光 + 触控反馈</Text>
              </View>
            </View>
          </LiquidGlassCard>

          {/* 强度对比 */}
          <Text style={styles.sectionTitle}>模糊强度对比</Text>
          <View style={styles.intensityRow}>
            {(['light', 'medium', 'heavy'] as const).map((intensity, i) => (
              <LiquidGlassCard key={intensity} intensity={intensity} style={styles.intensityCard}>
                <Text style={styles.intensityLabel}>
                  {intensity === 'light' ? '轻柔' : intensity === 'medium' ? '适中' : '强烈'}
                </Text>
              </LiquidGlassCard>
            ))}
          </View>

          {/* 触控反馈演示 */}
          <Text style={styles.sectionTitle}>触控反馈（点击卡片）</Text>
          {DEMO_ITEMS.map((item, i) => (
            <LiquidGlassCard
              key={i}
              style={styles.itemCard}
              onPress={() => {}}
            >
              <View style={styles.itemRow}>
                <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemBrand}>{item.brand}</Text>
                </View>
                <Text style={styles.itemPrice}>{item.price}</Text>
              </View>
            </LiquidGlassCard>
          ))}

          {/* 胶囊标签 */}
          <Text style={styles.sectionTitle}>玻璃胶囊标签</Text>
          <View style={styles.pillRow}>
            {['全部', '上衣', '下装', '外套', '配饰'].map((label, i) => (
              <LiquidGlassPill key={i} active={i === 0} style={styles.pill}>
                <Text style={[styles.pillText, i === 0 && styles.pillTextActive]}>
                  {label}
                </Text>
              </LiquidGlassPill>
            ))}
          </View>

          {/* Dock 栏效果 */}
          <Text style={styles.sectionTitle}>Dock 栏效果</Text>
          <LiquidGlassCard style={styles.dockCard} intensity="medium">
            <View style={styles.dock}>
              {['shirt', 'body', 'calendar', 'stats-chart', 'person'].map((icon, i) => (
                <View key={i} style={styles.dockItem}>
                  <View style={styles.dockIconBg}>
                    <Icon name={icon as any} size={22} color={COLORS.primary} />
                  </View>
                </View>
              ))}
            </View>
          </LiquidGlassCard>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topNav: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.5)',
    gap: SPACING.md,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center', alignItems: 'center',
  },
  navTitle: {
    flex: 1, textAlign: 'center',
    fontSize: FONT_SIZES.xl, fontWeight: '800',
    color: COLORS.textPrimary,
  },

  content: { padding: SPACING.lg, paddingTop: SPACING.xl, gap: SPACING.lg },

  infoCard: { padding: SPACING.lg },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  infoTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.textPrimary },
  infoSub: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },

  sectionTitle: {
    fontSize: FONT_SIZES.lg, fontWeight: '700',
    color: COLORS.textPrimary, marginBottom: SPACING.sm, marginTop: SPACING.md,
  },

  intensityRow: { flexDirection: 'row', gap: SPACING.sm },
  intensityCard: { flex: 1, padding: SPACING.lg, alignItems: 'center' },
  intensityLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textPrimary },

  itemCard: { padding: SPACING.lg, marginBottom: SPACING.sm },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  colorDot: { width: 40, height: 40, borderRadius: BORDER_RADIUS.md },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.textPrimary },
  itemBrand: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  itemPrice: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.primary },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  pill: { marginBottom: 4 },
  pillText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
  pillTextActive: { color: COLORS.primary },

  dockCard: { padding: SPACING.lg },
  dock: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  dockItem: { alignItems: 'center' },
  dockIconBg: {
    width: 48, height: 48, borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
});

export default LiquidGlassDemoScreen;
