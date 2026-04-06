/**
 * HomeScreen — 衣橱首页（分类管理模式）
 * 深色玻璃拟态，白色文字，更紧凑尺寸
 */
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Modal, TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { RootStackParamList, ClothingItem } from '../types';
import { GlassCard, GlassPill, FAB, SectionHeader, EmptyState } from '../components/glass/GlassComponents';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

// ============================================================
//  CategoryItemCard — 缩略图卡片
// ============================================================
const ItemCard = ({ item, onPress }: { item: ClothingItem; onPress: () => void }) => (
  <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.thumbCard}>
    <Image source={{ uri: item.images[0] }} style={styles.thumbImg} resizeMode="cover" />
    {item.images.length > 1 && (
      <View style={styles.multiBadge}>
        <Text style={styles.multiText}>{item.images.length}</Text>
      </View>
    )}
    {item.wearCount > 0 && (
      <View style={styles.wearBadge}>
        <Text style={styles.wearText}>{item.wearCount}次</Text>
      </View>
    )}
  </TouchableOpacity>
);

// ============================================================
//  CategorySection
// ============================================================
const CategorySection = ({
  name, items, onItemPress, onAdd,
}: {
  name: string; items: ClothingItem[]; onItemPress: (id: string) => void; onAdd: () => void;
}) => (
  <View style={styles.catSection}>
    <View style={styles.catHeader}>
      <View style={styles.catTitleRow}>
        <Text style={styles.catTitle}>{name}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{items.length}</Text>
        </View>
      </View>
      <View style={styles.catActions}>
        <TouchableOpacity activeOpacity={0.75} onPress={onAdd} style={styles.iconBtn}>
          <Icon name="plus" size={16} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.75} onPress={() => {}} style={styles.iconBtn}>
          <Icon name="dots-horizontal" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbsRow}>
      {items.length === 0 ? (
        <TouchableOpacity activeOpacity={0.75} onPress={onAdd} style={styles.emptyThumb}>
          <Icon name="plus" size={22} color={COLORS.textMuted} />
          <Text style={styles.emptyThumbText}>添加</Text>
        </TouchableOpacity>
      ) : (
        items.map(item => (
          <ItemCard key={item.id} item={item} onPress={() => onItemPress(item.id)} />
        ))
      )}
    </ScrollView>
  </View>
);

// ============================================================
//  SearchModal
// ============================================================
const SearchModal = ({ visible, onClose, items, onItem }: {
  visible: boolean; onClose: () => void; items: ClothingItem[];
  onItem: (id: string) => void;
}) => {
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    if (!q.trim()) return [];
    return items.filter(i => i.name.toLowerCase().includes(q.toLowerCase()));
  }, [q, items]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={searchStyles.overlay}>
        <GlassCard style={searchStyles.card} padding="none">
          <View style={searchStyles.inputRow}>
            <Icon name="magnify" size={18} color={COLORS.textMuted} />
            <TextInput
              style={searchStyles.input}
              placeholder="搜索衣物..."
              placeholderTextColor={COLORS.textMuted}
              value={q} onChangeText={setQ} autoFocus
            />
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          <ScrollView style={searchStyles.results} showsVerticalScrollIndicator={false}>
            {results.map(item => (
              <TouchableOpacity
                key={item.id} style={searchStyles.resultItem}
                onPress={() => { onItem(item.id); onClose(); }}
              >
                <Image source={{ uri: item.images[0] }} style={searchStyles.resultThumb} />
                <Text style={searchStyles.resultName}>{item.name}</Text>
              </TouchableOpacity>
            ))}
            {q && results.length === 0 && (
              <Text style={searchStyles.noResult}>没有找到</Text>
            )}
          </ScrollView>
        </GlassCard>
      </View>
    </Modal>
  );
};

// ============================================================
//  HomeScreen
// ============================================================
const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<NavProp>();
  const { clothingItems, categories } = useStore();
  const [searchVisible, setSearchVisible] = useState(false);

  const groups = useMemo(() =>
    categories.map(cat => ({
      ...cat,
      items: clothingItems.filter(i => i.categoryId === cat.id),
    })).sort((a, b) => {
      if (a.items.length === 0 && b.items.length > 0) return 1;
      if (a.items.length > 0 && b.items.length === 0) return -1;
      return 0;
    }),
    [categories, clothingItems]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 顶部导航 */}
      <View style={styles.topNav}>
        <TouchableOpacity activeOpacity={0.75} onPress={() => setSearchVisible(true)} style={styles.topNavBtn}>
          <Icon name="magnify" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topNavTitle}>我的衣橱</Text>
        <TouchableOpacity activeOpacity={0.75} onPress={() => nav.navigate('CategoryManage')} style={styles.topNavBtn}>
          <Icon name="playlist-edit" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* 概览统计 */}
      <View style={styles.overviewRow}>
        {[
          { n: clothingItems.length, l: '单品', c: COLORS.primary },
          { n: categories.length, l: '分类', c: COLORS.accent },
          { n: clothingItems.reduce((s, i) => s + (i.price || 0), 0), l: '总价值', c: '#FFB74D' },
        ].map((item, i) => (
          <GlassCard key={i} style={styles.overviewCard} padding="sm">
            <Text style={[styles.overviewNum, { color: item.c }]}>
              {typeof item.n === 'number' && item.n > 1000 ? `¥${item.n}` : item.n}
            </Text>
            <Text style={styles.overviewLbl}>{item.l}</Text>
          </GlassCard>
        ))}
      </View>

      {/* 分类列表 */}
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={[styles.mainContent, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {groups.map(g => (
          <CategorySection
            key={g.id}
            name={g.name}
            items={g.items}
            onItemPress={id => nav.navigate('ClothingDetail', { itemId: id })}
            onAdd={() => nav.navigate('AddClothing')}
          />
        ))}
        {groups.length === 0 && (
          <EmptyState
            icon="wardrobe-outline" title="暂无分类"
            actionLabel="去添加" onAction={() => nav.navigate('CategoryManage')}
          />
        )}
      </ScrollView>

      {/* FAB */}
      <FAB
        icon="plus" onPress={() => nav.navigate('AddClothing')}
        style={{ bottom: insets.bottom + 84 }}
      />

      <SearchModal
        visible={searchVisible} onClose={() => setSearchVisible(false)}
        items={clothingItems}
        onItem={id => nav.navigate('ClothingDetail', { itemId: id })}
      />
    </SafeAreaView>
  );
};

// ============================================================
//  Styles — 深色玻璃 + 紧凑尺寸
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Top Nav
  topNav: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm,
    backgroundColor: COLORS.glass,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  topNavTitle: {
    flex: 1, textAlign: 'center',
    fontSize: FONT_SIZES.xxl, fontWeight: '800',
    color: COLORS.textPrimary, letterSpacing: -0.5,
  },
  topNavBtn: {
    width: 38, height: 38, borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center', alignItems: 'center',
  },

  // Overview
  overviewRow: {
    flexDirection: 'row', padding: SPACING.lg, gap: SPACING.sm,
  },
  overviewCard: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md },
  overviewNum: { fontSize: FONT_SIZES.xl, fontWeight: '800' },
  overviewLbl: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2, fontWeight: '500' },

  // Main
  mainScroll: { flex: 1 },
  mainContent: { paddingTop: SPACING.sm },

  // Category
  catSection: { marginBottom: SPACING.xxl },
  catHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.xl, marginBottom: SPACING.md,
  },
  catTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  catTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.textPrimary },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm, paddingVertical: 1,
    borderWidth: 1, borderColor: COLORS.border,
  },
  countText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '600' },
  catActions: { flexDirection: 'row', gap: SPACING.xs },
  iconBtn: {
    width: 32, height: 32, borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center', alignItems: 'center',
  },

  // Thumbs
  thumbsRow: { paddingHorizontal: SPACING.xl, gap: SPACING.sm },
  thumbCard: {
    width: 80, height: 104,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.glassLight,
    borderWidth: 1, borderColor: COLORS.glassBorder,
    ...SHADOWS.glass,
  },
  thumbImg: { width: '100%', height: '100%' },
  multiBadge: {
    position: 'absolute', bottom: 4, right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 6,
    paddingHorizontal: 4, paddingVertical: 1,
  },
  multiText: { fontSize: 9, color: '#fff', fontWeight: '700' },
  wearBadge: {
    position: 'absolute', top: 4, left: 4,
    backgroundColor: COLORS.primarySoft, borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 5, paddingVertical: 1,
    borderWidth: 1, borderColor: 'rgba(100,181,246,0.20)',
  },
  wearText: { fontSize: 9, color: COLORS.primary, fontWeight: '700' },
  emptyThumb: {
    width: 80, height: 104, borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', gap: 4,
  },
  emptyThumbText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
});

// Search Modal Styles
const searchStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: COLORS.overlay,
    justifyContent: 'flex-start', paddingTop: 100, alignItems: 'center',
  },
  card: { width: '90%', maxHeight: '65%', overflow: 'hidden' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  input: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.textPrimary },
  results: { maxHeight: 320 },
  resultItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    gap: SPACING.md,
  },
  resultThumb: { width: 40, height: 40, borderRadius: BORDER_RADIUS.sm, backgroundColor: COLORS.glassLight },
  resultName: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textPrimary },
  noResult: {
    textAlign: 'center', paddingVertical: SPACING.xl,
    fontSize: FONT_SIZES.sm, color: COLORS.textMuted,
  },
});

export default HomeScreen;
