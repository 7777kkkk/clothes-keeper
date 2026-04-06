import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useStore } from '../store/useStore';
import {
  COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS,
} from '../constants/theme';
import { RootStackParamList, Season } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const SEASONS: Season[] = ['春', '夏', '秋', '冬'];

type SortKey = 'name' | 'purchaseDate' | 'wearCount' | 'createdAt';
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'name', label: '名称' },
  { key: 'purchaseDate', label: '日期' },
  { key: 'wearCount', label: '次数' },
  { key: 'createdAt', label: '添加' },
];

// ============================================================
//  iOS 风格滑动开关
// ============================================================
const ModeToggle = ({
  value,
  onToggle,
}: {
  value: 'default' | 'custom';
  onToggle: () => void;
}) => {
  const isOn = value === 'custom';
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onToggle}
      style={[styles.toggleOuter, isOn ? styles.toggleOuterOn : styles.toggleOuterOff]}
    >
      <View style={[styles.toggleThumb, isOn ? styles.toggleThumbOn : styles.toggleThumbOff]}>
        <Icon
          name={isOn ? 'view-dashboard' : 'view-grid'}
          size={11}
          color={isOn ? '#fff' : COLORS.textMuted}
        />
      </View>
    </TouchableOpacity>
  );
};

// ============================================================
//  玻璃拟态卡片（浅色亚克力版）
// ============================================================
const GlassCard = ({ children, style }: { children: React.ReactNode; style?: any }) => (
  <View style={[styles.glassCard, style]}>{children}</View>
);

// ============================================================
//  胶囊标签
// ============================================================
const PillTag = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.75}
    onPress={onPress}
    style={[styles.pillTag, active && styles.pillTagActive]}
  >
    <Text style={[styles.pillTagText, active && styles.pillTagTextActive]}>{label}</Text>
  </TouchableOpacity>
);

// ============================================================
//  主屏幕
// ============================================================
const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const {
    clothingItems, categories,
    homeMode, homeSortBy, homeSortOrder,
    homeFilterCategory, homeFilterSeason,
    setHomeMode, setHomeSort, setHomeFilter,
  } = useStore();

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempFilterCategory, setTempFilterCategory] = useState<string | null>(homeFilterCategory);
  const [tempFilterSeason, setTempFilterSeason] = useState<Season | null>(homeFilterSeason);

  // 按分类分组（默认模式）
  const groupedData = useMemo(() =>
    categories.map(cat => ({
      category: cat,
      items: clothingItems.filter(item => item.categoryId === cat.id),
    })).filter(g => g.items.length > 0),
    [categories, clothingItems]
  );

  // 自主模式：筛选 + 排序
  const filteredItems = useMemo(() => {
    let items = [...clothingItems];
    if (homeFilterCategory) items = items.filter(i => i.categoryId === homeFilterCategory);
    if (homeFilterSeason) items = items.filter(i => i.seasons.includes(homeFilterSeason));
    items.sort((a, b) => {
      let cmp = 0;
      switch (homeSortBy) {
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'purchaseDate':
          cmp = (a.purchaseDate?.getTime() || 0) - (b.purchaseDate?.getTime() || 0); break;
        case 'wearCount': cmp = (a.wearCount || 0) - (b.wearCount || 0); break;
        default:
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return homeSortOrder === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [clothingItems, homeFilterCategory, homeFilterSeason, homeSortBy, homeSortOrder]);

  const hasFilters = homeFilterCategory || homeFilterSeason;
  const isCustom = homeMode === 'custom';
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || '未分类';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ========== 顶部标题栏 ========== */}
      <View style={styles.header}>
        <ModeToggle
          value={homeMode}
          onToggle={() => setHomeMode(isCustom ? 'default' : 'custom')}
        />
        <Text style={styles.title}>我的衣橱</Text>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => navigation.navigate('AddClothing')}
          style={styles.addBtn}
        >
          <Icon name="plus" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* ========== 默认模式：横向滚动分类 ========== */}
      {!isCustom && (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
          showsVerticalScrollIndicator={false}
        >
          {groupedData.length > 0 ? (
            groupedData.map(({ category, items }) => (
              <View key={category.id} style={styles.categorySection}>
                {/* 分类标题 */}
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryTitle}>{category.name}</Text>
                  <View style={styles.categoryCountBadge}>
                    <Text style={styles.categoryCount}>{items.length}</Text>
                  </View>
                </View>

                {/* 横向滚动卡片 */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.cardsRow}
                >
                  {items.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.85}
                      onPress={() => navigation.navigate('ClothingDetail', { itemId: item.id })}
                      style={styles.clothingCard}
                    >
                      <Image
                        source={{ uri: item.images[0] }}
                        style={styles.clothingImage}
                        resizeMode="cover"
                      />
                      {item.images.length > 1 && (
                        <View style={styles.imageCountBadge}>
                          <Icon name="image-multiple" size={10} color="#fff" />
                          <Text style={styles.imageCountText}>{item.images.length}</Text>
                        </View>
                      )}
                      {(item.wearCount || 0) > 0 && (
                        <View style={styles.wearCountBadge}>
                          <Text style={styles.wearCountText}>{item.wearCount}次</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="wardrobe-outline" size={72} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>衣橱空空如也</Text>
              <Text style={styles.emptySubtitle}>添加你的第一件衣物</Text>
              <TouchableOpacity
                style={styles.emptyAddBtn}
                onPress={() => navigation.navigate('AddClothing')}
              >
                <Icon name="plus" size={18} color="#fff" />
                <Text style={styles.emptyAddBtnText}>添加衣物</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* ========== 自主模式：网格 + 工具栏 ========== */}
      {isCustom && (
        <>
          {/* 工具栏 */}
          <View style={styles.toolbar}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setTempFilterCategory(homeFilterCategory);
                setTempFilterSeason(homeFilterSeason);
                setShowFilterModal(true);
              }}
              style={[styles.toolbarBtn, hasFilters && styles.toolbarBtnActive]}
            >
              <Icon
                name="filter-variant"
                size={15}
                color={hasFilters ? '#fff' : COLORS.textSecondary}
              />
              <Text style={[styles.toolbarBtnText, hasFilters && styles.toolbarBtnTextActive]}>
                {hasFilters ? '已筛选' : '筛选'}
              </Text>
            </TouchableOpacity>

            <View style={styles.sortRow}>
              {SORT_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  activeOpacity={0.75}
                  onPress={() => setHomeSort(opt.key)}
                  style={[styles.sortBtn, homeSortBy === opt.key && styles.sortBtnActive]}
                >
                  <Text style={[styles.sortBtnText, homeSortBy === opt.key && styles.sortBtnTextActive]}>
                    {opt.label}
                  </Text>
                  {homeSortBy === opt.key && (
                    <Icon
                      name={homeSortOrder === 'asc' ? 'chevron-up' : 'chevron-down'}
                      size={13}
                      color={COLORS.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 筛选标签 */}
          {hasFilters && (
            <View style={styles.filterTagsRow}>
              {homeFilterCategory && (
                <View style={styles.filterTag}>
                  <Text style={styles.filterTagText}>{getCategoryName(homeFilterCategory)}</Text>
                  <TouchableOpacity onPress={() => setHomeFilter(null, homeFilterSeason)}>
                    <Icon name="close-circle" size={14} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
              )}
              {homeFilterSeason && (
                <View style={styles.filterTag}>
                  <Text style={styles.filterTagText}>{homeFilterSeason}季</Text>
                  <TouchableOpacity onPress={() => setHomeFilter(homeFilterCategory, null)}>
                    <Icon name="close-circle" size={14} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* 网格内容 */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.gridContainer, { paddingBottom: insets.bottom + 90 }]}
            showsVerticalScrollIndicator={false}
          >
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('ClothingDetail', { itemId: item.id })}
                  style={styles.gridCard}
                >
                  <Image
                    source={{ uri: item.images[0] }}
                    style={styles.gridCardImage}
                    resizeMode="cover"
                  />
                  <View style={styles.gridCardBody}>
                    <Text style={styles.gridCardName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.gridCardMeta}>
                      {getCategoryName(item.categoryId)} · {item.wearCount || 0}次
                    </Text>
                  </View>
                  {item.images.length > 1 && (
                    <View style={styles.gridImageBadge}>
                      <Icon name="image-multiple" size={10} color="#fff" />
                      <Text style={styles.gridImageCount}>{item.images.length}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Icon name="filter-outline" size={64} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>没有找到</Text>
                <TouchableOpacity
                  style={styles.clearFilterBtn}
                  onPress={() => setHomeFilter(null, null)}
                >
                  <Text style={styles.clearFilterBtnText}>清除筛选</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </>
      )}

      {/* ========== 筛选弹窗 ========== */}
      <Modal visible={showFilterModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.filterModal}>
            <Text style={styles.filterModalTitle}>筛选条件</Text>

            <Text style={styles.filterSectionTitle}>按品类</Text>
            <View style={styles.filterChipGroup}>
              <PillTag
                label="全部"
                active={!tempFilterCategory}
                onPress={() => setTempFilterCategory(null)}
              />
              {categories.map(cat => (
                <PillTag
                  key={cat.id}
                  label={cat.name}
                  active={tempFilterCategory === cat.id}
                  onPress={() => setTempFilterCategory(cat.id)}
                />
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>按季节</Text>
            <View style={styles.filterChipGroup}>
              <PillTag
                label="全部"
                active={!tempFilterSeason}
                onPress={() => setTempFilterSeason(null)}
              />
              {SEASONS.map(s => (
                <PillTag
                  key={s}
                  label={s}
                  active={tempFilterSeason === s}
                  onPress={() => setTempFilterSeason(s)}
                />
              ))}
            </View>

            <View style={styles.filterActions}>
              <TouchableOpacity
                style={styles.filterClearBtn}
                onPress={() => { setTempFilterCategory(null); setTempFilterSeason(null); }}
              >
                <Text style={styles.filterClearBtnText}>清除</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterApplyBtn}
                onPress={() => { setHomeFilter(tempFilterCategory, tempFilterSeason); setShowFilterModal(false); }}
              >
                <Text style={styles.filterApplyBtnText}>应用</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.filterCloseBtn}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.filterCloseBtnText}>取消</Text>
            </TouchableOpacity>
          </GlassCard>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ============================================================
//  Styles — Light Glass UI
// ============================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ---- 顶部标题栏 ----
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },

  // iOS 滑动开关
  toggleOuter: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    padding: 3,
  },
  toggleOuterOn: {
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.25)',
  },
  toggleOuterOff: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleThumbOn: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
  },
  toggleThumbOff: {
    backgroundColor: COLORS.textMuted,
    alignSelf: 'flex-start',
  },

  title: {
    flex: 1,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.20)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ---- 滚动区域 ----
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: SPACING.md },

  // ---- 默认模式：分类模块 ----
  categorySection: {
    marginBottom: SPACING.xxl,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  categoryTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  categoryCountBadge: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  cardsRow: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  clothingCard: {
    width: 110,
    height: 148,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.glass,
  },
  clothingImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  imageCountBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
    gap: 2,
  },
  imageCountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  wearCountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: COLORS.primarySoft,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.20)',
  },
  wearCountText: {
    fontSize: 9,
    color: COLORS.primary,
    fontWeight: '700',
  },

  // ---- 自主模式：工具栏 ----
  toolbar: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  toolbarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  toolbarBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toolbarBtnText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  toolbarBtnTextActive: {
    color: '#fff',
  },
  sortRow: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    gap: 2,
  },
  sortBtnActive: {
    backgroundColor: COLORS.primarySoft,
  },
  sortBtnText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  sortBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // 筛选标签行
  filterTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    borderRadius: BORDER_RADIUS.full,
    paddingLeft: SPACING.sm,
    paddingRight: SPACING.xs,
    paddingVertical: 3,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.20)',
  },
  filterTagText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // ---- 自主模式：网格 ----
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    gap: SPACING.md,
  },
  gridCard: {
    width: '47%',
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.glass,
  },
  gridCardImage: {
    width: '100%',
    height: 160,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  gridCardBody: {
    padding: SPACING.md,
  },
  gridCardName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  gridCardMeta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  gridImageBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
    gap: 2,
  },
  gridImageCount: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },

  // ---- 胶囊标签 ----
  pillTag: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillTagActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillTagText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  pillTagTextActive: {
    color: '#fff',
    fontWeight: '700',
  },

  // ---- 空状态 ----
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 120,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginBottom: SPACING.xl,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    gap: 6,
    ...SHADOWS.subtle,
  },
  emptyAddBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FONT_SIZES.md,
  },
  clearFilterBtn: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clearFilterBtnText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: FONT_SIZES.md,
  },

  // ---- 玻璃卡片 ----
  glassCard: {
    backgroundColor: '#fff',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },

  // ---- 筛选弹窗 ----
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModal: {
    width: 320,
    padding: SPACING.xl,
  },
  filterModalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  filterSectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  filterChipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  filterActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  filterClearBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  filterClearBtnText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  filterApplyBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    ...SHADOWS.subtle,
  },
  filterApplyBtnText: {
    fontSize: FONT_SIZES.md,
    color: '#fff',
    fontWeight: '700',
  },
  filterCloseBtn: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  filterCloseBtnText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
  },
});

export default HomeScreen;
