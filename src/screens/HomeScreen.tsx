/**
 * HomeScreen — 衣橱首页（强制渐变背景 + 白色卡片 + Ionicons）
 */
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Modal, TextInput,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { RootStackParamList, ClothingItem } from '../types';
import { GlassCard, GlassPill, FAB, SectionHeader, EmptyState } from '../components/glass/GlassComponents';
import { LiquidGlassCard } from '../components/glass/LiquidGlassCard';
import { GradientBackground } from '../components/glass/GradientBackground';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

// ============================================================
//  ItemCard
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
          <Icon name="add" size={16} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.75} onPress={() => {}} style={styles.iconBtn}>
          <Icon name="ellipsis-horizontal" size={16} color="rgba(0,0,0,0.35)" />
        </TouchableOpacity>
      </View>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbsRow}>
      {items.map(item => (
        <ItemCard key={item.id} item={item} onPress={() => onItemPress(item.id)} />
      ))}
      <TouchableOpacity activeOpacity={0.75} onPress={onAdd} style={styles.addThumb}>
        <Icon name="add" size={20} color="rgba(0,0,0,0.3)" />
        <Text style={styles.addThumbText}>添加</Text>
      </TouchableOpacity>
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
        <View style={searchStyles.card}>
          <View style={searchStyles.inputRow}>
            <Icon name="search" size={18} color="rgba(0,0,0,0.4)" />
            <TextInput
              style={searchStyles.input}
              placeholder="搜索衣物..."
              placeholderTextColor="rgba(0,0,0,0.35)"
              value={q} onChangeText={setQ} autoFocus
            />
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={18} color="rgba(0,0,0,0.4)" />
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
        </View>
      </View>
    </Modal>
  );
};

// ============================================================
//  HomeScreen
// ============================================================
// ============================================================
//  SelfServiceMode — 自主模式列表（单列卡片+筛选排序）
// ============================================================
const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: '最新添加' },
  { value: 'createdAt_asc', label: '最早添加' },
  { value: 'name_asc', label: '名称 A→Z' },
  { value: 'price_desc', label: '价格 高→低' },
  { value: 'price_asc', label: '价格 低→高' },
] as const;

const SelfServiceMode = ({
  items, categories, onItem, onAdd,
}: {
  items: ClothingItem[];
  categories: { id: string; name: string }[];
  onItem: (id: string) => void;
  onAdd: () => void;
}) => {
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [sortValue, setSortValue] = useState<string>('createdAt_desc');
  const [filterOpen, setFilterOpen] = useState(false);

  const SEASONS = ['春', '夏', '秋', '冬'];

  const toggleCat = (id: string) =>
    setSelectedCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  const toggleSeason = (s: string) =>
    setSelectedSeasons(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const clearFilter = () => { setSelectedCats([]); setSelectedSeasons([]); setSortValue('createdAt_desc'); };

  const filtered = useMemo(() => {
    let result = [...items];
    if (selectedCats.length > 0)
      result = result.filter(i => selectedCats.includes(i.categoryId));
    if (selectedSeasons.length > 0)
      result = result.filter(i => i.seasons.some(s => selectedSeasons.includes(s)));
    const [field, dir] = sortValue.split('_') as [string, 'asc' | 'desc'];
    result.sort((a, b) => {
      let va: any = a[field as keyof ClothingItem];
      let vb: any = b[field as keyof ClothingItem];
      if (field === 'name') { va = String(va || '').toLowerCase(); vb = String(vb || '').toLowerCase(); }
      if (va < vb) return dir === 'asc' ? -1 : 1;
      if (va > vb) return dir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [items, selectedCats, selectedSeasons, sortValue]);

  const hasFilter = selectedCats.length > 0 || selectedSeasons.length > 0;
  const sortLabel = SORT_OPTIONS.find(s => s.value === sortValue)?.label ?? '排序';

  return (
    <View style={selfStyles.container}>
      {/* 筛选排序栏 */}
      <View style={selfStyles.filterBar}>
        <TouchableOpacity
          style={[selfStyles.filterBtn, hasFilter && selfStyles.filterBtnActive]}
          onPress={() => setFilterOpen(!filterOpen)}
        >
          <Icon name="options-outline" size={16} color={hasFilter ? COLORS.primary : COLORS.textSecondary} />
          <Text style={[selfStyles.filterBtnText, hasFilter && selfStyles.filterBtnTextActive]}>
            {hasFilter ? `筛选 (${selectedCats.length + selectedSeasons.length})` : '筛选'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={selfStyles.sortBtn} onPress={() => {
          const idx = SORT_OPTIONS.findIndex(s => s.value === sortValue);
          const next = SORT_OPTIONS[(idx + 1) % SORT_OPTIONS.length];
          setSortValue(next.value);
        }}>
          <Icon name="swap-vertical" size={15} color={COLORS.textSecondary} />
          <Text style={selfStyles.sortBtnText}>{sortLabel}</Text>
        </TouchableOpacity>

        {hasFilter && (
          <TouchableOpacity onPress={clearFilter}>
            <Text style={selfStyles.clearText}>清除</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 展开的筛选面板 */}
      {filterOpen && (
        <View style={selfStyles.filterPanel}>
          <Text style={selfStyles.filterLabel}>按分类</Text>
          <View style={selfStyles.pillsWrap}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[selfStyles.pill, selectedCats.includes(cat.id) && selfStyles.pillActive]}
                onPress={() => toggleCat(cat.id)}
              >
                <Text style={[selfStyles.pillText, selectedCats.includes(cat.id) && selfStyles.pillTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={selfStyles.filterLabel}>按季节</Text>
          <View style={selfStyles.pillsWrap}>
            {SEASONS.map(s => (
              <TouchableOpacity
                key={s}
                style={[selfStyles.pill, selectedSeasons.includes(s) && selfStyles.pillActive]}
                onPress={() => toggleSeason(s)}
              >
                <Text style={[selfStyles.pillText, selectedSeasons.includes(s) && selfStyles.pillTextActive]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* 结果统计 */}
      <View style={selfStyles.resultBar}>
        <Text style={selfStyles.resultText}>共 {filtered.length} 件</Text>
      </View>

      {/* 单列列表 */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.map(item => (
          <TouchableOpacity
            key={item.id}
            style={selfStyles.card}
            activeOpacity={0.85}
            onPress={() => onItem(item.id)}
          >
            <Image source={{ uri: item.images[0] }} style={selfStyles.cardImg} />
            <View style={selfStyles.cardInfo}>
              <Text style={selfStyles.cardName} numberOfLines={1}>{item.name}</Text>
              {item.brand && <Text style={selfStyles.cardBrand}>{item.brand}</Text>}
              <View style={selfStyles.cardMeta}>
                {item.price > 0 && <Text style={selfStyles.cardPrice}>¥{item.price}</Text>}
                {item.seasons.map(s => (
                  <View key={s} style={selfStyles.seasonTag}>
                    <Text style={selfStyles.seasonTagText}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Icon name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        ))}
        {filtered.length === 0 && (
          <View style={selfStyles.empty}>
            <Icon name="search-outline" size={40} color="rgba(0,0,0,0.15)" />
            <Text style={selfStyles.emptyText}>没有符合条件的衣物</Text>
          </View>
        )}
      </ScrollView>
    </View>
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
  const [isSelfMode, setIsSelfMode] = useState(false);

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
    <GradientBackground>
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 顶部导航 */}
      <View style={[styles.topNav, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity activeOpacity={0.75} onPress={() => setSearchVisible(true)} style={styles.topNavBtn}>
          <Icon name="search" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topNavTitle}>我的衣橱</Text>
        {/* 模式切换 */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setIsSelfMode(v => !v)}
          style={[styles.modeBtn, isSelfMode && styles.modeBtnActive]}
        >
          <Icon name={isSelfMode ? 'grid' : 'list'} size={20} color={isSelfMode ? '#fff' : COLORS.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.75} onPress={() => nav.navigate('CategoryManage')} style={styles.topNavBtn}>
          <Icon name="create-outline" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {isSelfMode ? (
        /* 自主模式 */
        <SelfServiceMode
          items={clothingItems}
          categories={categories}
          onItem={id => nav.navigate('ClothingDetail', { itemId: id })}
          onAdd={() => nav.navigate('AddClothing')}
        />
      ) : (
        /* 默认模式（分品类展示） */
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={[styles.mainContent, { paddingBottom: insets.bottom + 90 }]}
          showsVerticalScrollIndicator={false}
        >
          {groups.map(g => (
            <LiquidGlassCard key={g.id} style={styles.catGlassCard} intensity="light">
              <CategorySection
                name={g.name}
                items={g.items}
                onItemPress={id => nav.navigate('ClothingDetail', { itemId: id })}
                onAdd={() => nav.navigate('AddClothing')}
              />
            </LiquidGlassCard>
          ))}
          {groups.length === 0 && (
            <View style={styles.emptyContainer}>
              <Icon name="shirt-outline" size={48} color="rgba(0,0,0,0.2)" />
              <Text style={styles.emptyText}>暂无分类</Text>
              <TouchableOpacity onPress={() => nav.navigate('CategoryManage')}>
                <Text style={styles.emptyAction}>去添加</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* FAB */}
      <FAB
        icon="add"
        onPress={() => nav.navigate('AddClothing')}
        style={{ ...styles.fab, bottom: insets.bottom + 84 }}
      />

      <SearchModal
        visible={searchVisible} onClose={() => setSearchVisible(false)}
        items={clothingItems}
        onItem={id => nav.navigate('ClothingDetail', { itemId: id })}
      />
    </SafeAreaView>
    </GradientBackground>
  );
};

// ============================================================
//  SelfServiceMode Styles
// ============================================================
const selfStyles = StyleSheet.create({
  container: { flex: 1 },
  filterBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(0,0,0,0.07)',
  },
  filterBtnActive: { backgroundColor: 'rgba(162,189,234,0.2)' },
  filterBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
  filterBtnTextActive: { color: COLORS.primary },
  sortBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(0,0,0,0.07)',
  },
  sortBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
  clearText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.primary },
  filterPanel: {
    padding: SPACING.lg, backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)',
    gap: SPACING.sm,
  },
  filterLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textSecondary, marginTop: SPACING.sm },
  pillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: 4 },
  pill: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(0,0,0,0.07)',
  },
  pillActive: { backgroundColor: 'rgba(162,189,234,0.25)', borderWidth: 1, borderColor: COLORS.primary },
  pillText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textSecondary },
  pillTextActive: { color: COLORS.primary },
  resultBar: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xs },
  resultText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '600' },
  card: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: SPACING.lg, marginBottom: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: BORDER_RADIUS.lg, gap: SPACING.md,
  },
  cardImg: { width: 56, height: 56, borderRadius: BORDER_RADIUS.md },
  cardInfo: { flex: 1 },
  cardName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.textPrimary },
  cardBrand: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: 4 },
  cardPrice: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.primary },
  seasonTag: { backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  seasonTagText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  empty: { alignItems: 'center', paddingTop: 80, gap: SPACING.sm },
  emptyText: { fontSize: FONT_SIZES.sm, color: 'rgba(0,0,0,0.25)' },
});

// ============================================================
//  Styles
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1 },

  topNav: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.60)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.4)',
    gap: SPACING.md,
  },
  topNavTitle: {
    flex: 1, textAlign: 'center',
    fontSize: FONT_SIZES.lg, fontWeight: '800',
    color: COLORS.textPrimary,
  },
  topNavBtn: {
    width: 34, height: 34, borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center', alignItems: 'center',
  },
  modeBtn: {
    width: 34, height: 34, borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.07)',
  },
  modeBtnActive: {
    backgroundColor: COLORS.primary,
  },

  mainScroll: { flex: 1 },
  mainContent: { paddingTop: SPACING.sm },

  catGlassCard: { marginBottom: SPACING.lg, padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg },
  catSection: { marginBottom: 0 },
  catHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  catTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  catTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.textPrimary },
  countBadge: {
    backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm, paddingVertical: 1,
  },
  countText: { fontSize: FONT_SIZES.xs, color: 'rgba(0,0,0,0.5)', fontWeight: '600' },
  catActions: { flexDirection: 'row', gap: SPACING.xs },
  iconBtn: {
    width: 28, height: 28, borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center', alignItems: 'center',
  },

  thumbsRow: { gap: SPACING.sm, paddingVertical: 2 },
  thumbCard: {
    width: 65, height: 85,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
    ...SHADOWS.card,
  },
  thumbImg: { width: '100%', height: '100%' },
  multiBadge: {
    position: 'absolute', bottom: 4, right: 4,
    backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 6,
    paddingHorizontal: 4, paddingVertical: 1,
  },
  multiText: { fontSize: 9, color: '#fff', fontWeight: '700' },
  wearBadge: {
    position: 'absolute', top: 4, left: 4,
    backgroundColor: 'rgba(74,144,217,0.25)', borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 5, paddingVertical: 1,
  },
  wearText: { fontSize: 9, color: COLORS.primary, fontWeight: '700' },
  addThumb: {
    width: 65, height: 85, borderRadius: BORDER_RADIUS.md,
    borderWidth: 2, borderColor: 'rgba(0,0,0,0.15)', borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  addThumbText: { fontSize: FONT_SIZES.xs, color: 'rgba(0,0,0,0.35)' },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: FONT_SIZES.lg, color: 'rgba(0,0,0,0.35)', marginTop: 12 },
  emptyAction: { fontSize: FONT_SIZES.md, color: COLORS.primary, marginTop: 8, fontWeight: '600' },

  fab: {
    position: 'absolute', right: 20,
    backgroundColor: COLORS.fab,
    ...SHADOWS.fab,
  },
});

const searchStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-start', paddingTop: 100, alignItems: 'center',
  },
  card: {
    width: '90%', maxHeight: '65%',
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.08)',
    gap: SPACING.sm,
  },
  input: { flex: 1, fontSize: FONT_SIZES.md, color: '#333' },
  results: { maxHeight: 320 },
  resultItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    gap: SPACING.md,
  },
  resultThumb: {
    width: 40, height: 40, borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  resultName: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#333' },
  noResult: {
    textAlign: 'center', paddingVertical: SPACING.xl,
    fontSize: FONT_SIZES.sm, color: 'rgba(0,0,0,0.4)',
  },
});

export default HomeScreen;
