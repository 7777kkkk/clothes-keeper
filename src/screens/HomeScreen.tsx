import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { RootStackParamList, Season } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CARD_WIDTH = 90;
const CARD_HEIGHT = 120;
const CARD_GAP = 8;
const SEASONS: Season[] = ['春', '夏', '秋', '冬'];

type SortOption = {
  key: 'name' | 'purchaseDate' | 'wearCount' | 'createdAt';
  label: string;
};

const SORT_OPTIONS: SortOption[] = [
  { key: 'name', label: '名称' },
  { key: 'purchaseDate', label: '购买日期' },
  { key: 'wearCount', label: '穿搭次数' },
  { key: 'createdAt', label: '添加时间' },
];

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    clothingItems,
    categories,
    homeMode,
    homeSortBy,
    homeSortOrder,
    homeFilterCategory,
    homeFilterSeason,
    setHomeMode,
    setHomeSort,
    setHomeFilter,
  } = useStore();

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempFilterCategory, setTempFilterCategory] = useState<string | null>(homeFilterCategory);
  const [tempFilterSeason, setTempFilterSeason] = useState<Season | null>(homeFilterSeason);

  // 按分类分组（默认模式）
  const groupedData = useMemo(() => {
    return categories.map(cat => ({
      category: cat,
      items: clothingItems.filter(item => item.categoryId === cat.id),
    })).filter(group => group.items.length > 0);
  }, [categories, clothingItems]);

  // 自主模式：筛选和排序后的数据
  const filteredAndSortedItems = useMemo(() => {
    let items = [...clothingItems];

    // 筛选
    if (homeFilterCategory) {
      items = items.filter(item => item.categoryId === homeFilterCategory);
    }
    if (homeFilterSeason) {
      items = items.filter(item => item.seasons.includes(homeFilterSeason));
    }

    // 排序
    items.sort((a, b) => {
      let comparison = 0;
      switch (homeSortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'purchaseDate':
          const dateA = a.purchaseDate ? new Date(a.purchaseDate).getTime() : 0;
          const dateB = b.purchaseDate ? new Date(b.purchaseDate).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case 'wearCount':
          comparison = (a.wearCount || 0) - (b.wearCount || 0);
          break;
        case 'createdAt':
        default:
          const timeA = new Date(a.createdAt).getTime();
          const timeB = new Date(b.createdAt).getTime();
          comparison = timeA - timeB;
          break;
      }
      return homeSortOrder === 'asc' ? comparison : -comparison;
    });

    return items;
  }, [clothingItems, homeFilterCategory, homeFilterSeason, homeSortBy, homeSortOrder]);

  const handleApplyFilter = () => {
    setHomeFilter(tempFilterCategory, tempFilterSeason);
    setShowFilterModal(false);
  };

  const handleClearFilter = () => {
    setTempFilterCategory(null);
    setTempFilterSeason(null);
  };

  const handleSortPress = (key: 'name' | 'purchaseDate' | 'wearCount' | 'createdAt') => {
    setHomeSort(key);
  };

  const getSortIcon = (key: string) => {
    if (homeSortBy !== key) return '↕';
    return homeSortOrder === 'asc' ? '↑' : '↓';
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || '未分类';
  };

  const hasActiveFilters = homeFilterCategory || homeFilterSeason;
  const isDefaultMode = homeMode === 'default';
  const isCustomMode = homeMode === 'custom';

  // ============ 自主模式 ============
  if (isCustomMode) {
    return (
      <SafeAreaView style={styles.container}>
        {/* 顶部标题栏 */}
        <View style={styles.header}>
          <Text style={styles.title}>我的衣橱</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddClothing')}
          >
            <Text style={styles.addButtonText}>+ 添加</Text>
          </TouchableOpacity>
        </View>

        {/* 模式切换 */}
        <View style={styles.modeSwitchRow}>
          <TouchableOpacity
            style={[styles.modeBtn, isDefaultMode ? styles.modeBtnActive : null]}
            onPress={() => setHomeMode('default')}
          >
            <Text style={[styles.modeBtnText, isDefaultMode ? styles.modeBtnTextActive : null]}>
              默认模式
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, isCustomMode ? styles.modeBtnActive : null]}
            onPress={() => setHomeMode('custom')}
          >
            <Text style={[styles.modeBtnText, isCustomMode ? styles.modeBtnTextActive : null]}>
              自主模式
            </Text>
          </TouchableOpacity>
        </View>

        {/* 筛选和排序工具栏 */}
        <View style={styles.toolbar}>
          <TouchableOpacity
            style={[styles.toolbarBtn, hasActiveFilters && styles.toolbarBtnActive]}
            onPress={() => {
              setTempFilterCategory(homeFilterCategory);
              setTempFilterSeason(homeFilterSeason);
              setShowFilterModal(true);
            }}
          >
            <Text style={[styles.toolbarBtnText, hasActiveFilters && styles.toolbarBtnTextActive]}>
              {hasActiveFilters ? '✓ 筛选' : '筛选'}
            </Text>
          </TouchableOpacity>

          <View style={styles.sortRow}>
            <Text style={styles.sortLabel}>排序：</Text>
            {SORT_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.key}
                style={[styles.sortBtn, homeSortBy === option.key && styles.sortBtnActive]}
                onPress={() => handleSortPress(option.key)}
              >
                <Text style={[styles.sortBtnText, homeSortBy === option.key && styles.sortBtnTextActive]}>
                  {option.label} {getSortIcon(option.key)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 筛选标签 */}
        {hasActiveFilters && (
          <View style={styles.filterTags}>
            {homeFilterCategory && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText}>{getCategoryName(homeFilterCategory)}</Text>
                <TouchableOpacity onPress={() => setHomeFilter(null, homeFilterSeason)}>
                  <Text style={styles.filterTagRemove}>×</Text>
                </TouchableOpacity>
              </View>
            )}
            {homeFilterSeason && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText}>{homeFilterSeason}季</Text>
                <TouchableOpacity onPress={() => setHomeFilter(homeFilterCategory, null)}>
                  <Text style={styles.filterTagRemove}>×</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* 商品列表 */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredAndSortedItems.length > 0 ? (
            <View style={styles.gridContainer}>
              {filteredAndSortedItems.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.gridCard}
                  onPress={() => navigation.navigate('ClothingDetail', { itemId: item.id })}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: item.images[0] }}
                    style={styles.gridCardImage}
                    resizeMode="cover"
                  />
                  {item.images.length > 1 && (
                    <View style={styles.multiImageBadge}>
                      <Text style={styles.multiImageText}>{item.images.length}</Text>
                    </View>
                  )}
                  <View style={styles.gridCardInfo}>
                    <Text style={styles.gridCardName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.gridCardMeta}>
                      {item.wearCount || 0}次 · {getCategoryName(item.categoryId)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>👔</Text>
              <Text style={styles.emptyTitle}>没有找到匹配的衣物</Text>
              <Text style={styles.emptySubtitle}>试试调整筛选条件</Text>
              <TouchableOpacity
                style={styles.clearFilterBtn}
                onPress={() => setHomeFilter(null, null)}
              >
                <Text style={styles.clearFilterBtnText}>清除筛选</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* 筛选弹窗 */}
        <Modal visible={showFilterModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.filterModal}>
              <Text style={styles.filterModalTitle}>筛选条件</Text>

              {/* 分类筛选 */}
              <Text style={styles.filterSectionTitle}>按品类</Text>
              <View style={styles.filterChipGroup}>
                <TouchableOpacity
                  style={[styles.filterChip, !tempFilterCategory && styles.filterChipActive]}
                  onPress={() => setTempFilterCategory(null)}
                >
                  <Text style={[styles.filterChipText, !tempFilterCategory && styles.filterChipTextActive]}>
                    全部
                  </Text>
                </TouchableOpacity>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.filterChip, tempFilterCategory === cat.id && styles.filterChipActive]}
                    onPress={() => setTempFilterCategory(cat.id)}
                  >
                    <Text style={[styles.filterChipText, tempFilterCategory === cat.id && styles.filterChipTextActive]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 季节筛选 */}
              <Text style={styles.filterSectionTitle}>按季节</Text>
              <View style={styles.filterChipGroup}>
                <TouchableOpacity
                  style={[styles.filterChip, !tempFilterSeason && styles.filterChipActive]}
                  onPress={() => setTempFilterSeason(null)}
                >
                  <Text style={[styles.filterChipText, !tempFilterSeason && styles.filterChipTextActive]}>
                    全部
                  </Text>
                </TouchableOpacity>
                {SEASONS.map(season => (
                  <TouchableOpacity
                    key={season}
                    style={[styles.filterChip, tempFilterSeason === season && styles.filterChipActive]}
                    onPress={() => setTempFilterSeason(season)}
                  >
                    <Text style={[styles.filterChipText, tempFilterSeason === season && styles.filterChipTextActive]}>
                      {season}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 操作按钮 */}
              <View style={styles.filterActions}>
                <TouchableOpacity style={styles.filterClearBtn} onPress={handleClearFilter}>
                  <Text style={styles.filterClearBtnText}>清除</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterApplyBtn} onPress={handleApplyFilter}>
                  <Text style={styles.filterApplyBtnText}>应用</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.filterCloseBtn}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.filterCloseBtnText}>取消</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // ============ 默认模式 ============
  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部标题栏 */}
      <View style={styles.header}>
        <Text style={styles.title}>我的衣橱</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddClothing')}
        >
          <Text style={styles.addButtonText}>+ 添加</Text>
        </TouchableOpacity>
      </View>

      {/* 模式切换 */}
      <View style={styles.modeSwitchRow}>
        <TouchableOpacity
          style={[styles.modeBtn, isDefaultMode ? styles.modeBtnActive : null]}
          onPress={() => setHomeMode('default')}
        >
          <Text style={[styles.modeBtnText, isDefaultMode ? styles.modeBtnTextActive : null]}>
            默认模式
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, isCustomMode ? styles.modeBtnActive : null]}
          onPress={() => setHomeMode('custom')}
        >
          <Text style={[styles.modeBtnText, isCustomMode ? styles.modeBtnTextActive : null]}>
            自主模式
          </Text>
        </TouchableOpacity>
      </View>

      {/* 垂直滚动的所有分类模块 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {groupedData.length > 0 ? (
          groupedData.map(({ category, items }) => (
            <View key={category.id} style={styles.categorySection}>
              {/* 模块头部 */}
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionTitle}>{category.name}</Text>
                  <Text style={styles.sectionCount}>
                    {items.length} 个
                  </Text>
                </View>
              </View>

              {/* 横向滚动的单品卡片 */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardsContainer}
              >
                {items.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.card}
                    onPress={() =>
                      navigation.navigate('ClothingDetail', { itemId: item.id })
                    }
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: item.images[0] }}
                      style={styles.cardImage}
                      resizeMode="cover"
                    />
                    {item.images.length > 1 && (
                      <View style={styles.multiImageBadge}>
                        <Text style={styles.multiImageText}>
                          {item.images.length}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👔</Text>
            <Text style={styles.emptyTitle}>衣橱空空如也</Text>
            <Text style={styles.emptySubtitle}>
              添加你的第一件衣物开始管理
            </Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={() => navigation.navigate('AddClothing')}
            >
              <Text style={styles.emptyAddButtonText}>+ 添加衣物</Text>
            </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.card,
    ...SHADOWS.card,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: FONT_SIZES.sm,
  },
  // 模式切换
  modeSwitchRow: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modeBtnText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  modeBtnTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  // 工具栏（自主模式）
  toolbar: {
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  toolbarBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  toolbarBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toolbarBtnText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  toolbarBtnTextActive: {
    color: '#fff',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  sortLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  sortBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  sortBtnActive: {
    backgroundColor: COLORS.secondary,
  },
  sortBtnText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  sortBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  // 筛选标签
  filterTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.card,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  filterTagText: {
    fontSize: FONT_SIZES.xs,
    color: '#fff',
  },
  filterTagRemove: {
    fontSize: FONT_SIZES.sm,
    color: '#fff',
    fontWeight: 'bold',
  },
  // 滚动区域
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: SPACING.md,
  },
  // 默认模式分类模块
  categorySection: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  sectionCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  cardsContainer: {
    paddingHorizontal: SPACING.lg,
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    backgroundColor: COLORS.secondary,
    ...SHADOWS.card,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  multiImageBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  multiImageText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // 自主模式网格
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  gridCard: {
    width: '47%',
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    ...SHADOWS.card,
  },
  gridCardImage: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.secondary,
  },
  gridCardInfo: {
    padding: SPACING.sm,
  },
  gridCardName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  gridCardMeta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  // 空状态
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 120,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  emptyAddButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  emptyAddButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: FONT_SIZES.md,
  },
  clearFilterBtn: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  clearFilterBtnText: {
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: FONT_SIZES.md,
  },
  // 筛选弹窗
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModal: {
    width: 320,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
  },
  filterModalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
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
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  filterActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  filterClearBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  filterClearBtnText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  filterApplyBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  filterApplyBtnText: {
    fontSize: FONT_SIZES.md,
    color: '#fff',
    fontWeight: '600',
  },
  filterCloseBtn: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  filterCloseBtnText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
});

export default HomeScreen;
