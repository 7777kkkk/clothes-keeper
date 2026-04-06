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
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { RootStackParamList, Season } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CARD_WIDTH = 90;
const CARD_HEIGHT = 120;
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
  const insets = useSafeAreaInsets();
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
    if (homeFilterCategory) {
      items = items.filter(item => item.categoryId === homeFilterCategory);
    }
    if (homeFilterSeason) {
      items = items.filter(item => item.seasons.includes(homeFilterSeason));
    }
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
    if (homeSortBy !== key) return 'sort';
    return homeSortOrder === 'asc' ? 'sort-ascending' : 'sort-descending';
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || '未分类';
  };

  const hasActiveFilters = homeFilterCategory || homeFilterSeason;
  const isDefaultMode = homeMode === 'default';
  const isCustomMode = homeMode === 'custom';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 顶部标题栏 */}
      <View style={styles.header}>
        <Text style={styles.title}>我的衣橱</Text>
        {/* 渐变添加按钮 */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('AddClothing')}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primary + 'DD']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addButton}
          >
            <Icon name="plus" size={18} color="#fff" />
            <Text style={styles.addButtonText}>添加</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* 模式切换 */}
      <View style={styles.modeSwitchRow}>
        <TouchableOpacity
          style={[styles.modeBtn, isDefaultMode && styles.modeBtnActive]}
          onPress={() => setHomeMode('default')}
        >
          <Icon
            name="view-grid"
            size={16}
            color={isDefaultMode ? '#fff' : COLORS.textSecondary}
          />
          <Text style={[styles.modeBtnText, isDefaultMode && styles.modeBtnTextActive]}>
            默认
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, isCustomMode && styles.modeBtnActive]}
          onPress={() => setHomeMode('custom')}
        >
          <Icon
            name="filter-variant"
            size={16}
            color={isCustomMode ? '#fff' : COLORS.textSecondary}
          />
          <Text style={[styles.modeBtnText, isCustomMode && styles.modeBtnTextActive]}>
            自主
          </Text>
        </TouchableOpacity>
      </View>

      {/* 自主模式工具栏 */}
      {isCustomMode && (
        <View style={styles.toolbar}>
          <TouchableOpacity
            style={[styles.toolbarBtn, hasActiveFilters && styles.toolbarBtnActive]}
            onPress={() => {
              setTempFilterCategory(homeFilterCategory);
              setTempFilterSeason(homeFilterSeason);
              setShowFilterModal(true);
            }}
          >
            <Icon
              name="filter-variant"
              size={16}
              color={hasActiveFilters ? '#fff' : COLORS.textSecondary}
            />
            <Text style={[styles.toolbarBtnText, hasActiveFilters && styles.toolbarBtnTextActive]}>
              {hasActiveFilters ? '已筛选' : '筛选'}
            </Text>
          </TouchableOpacity>

          <View style={styles.sortRow}>
            {SORT_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.key}
                style={[styles.sortBtn, homeSortBy === option.key && styles.sortBtnActive]}
                onPress={() => handleSortPress(option.key)}
              >
                <Text style={[styles.sortBtnText, homeSortBy === option.key && styles.sortBtnTextActive]}>
                  {option.label}
                </Text>
                <Icon
                  name={getSortIcon(option.key)}
                  size={14}
                  color={homeSortBy === option.key ? COLORS.primary : COLORS.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* 筛选标签 */}
      {hasActiveFilters && (
        <View style={styles.filterTags}>
          {homeFilterCategory && (
            <View style={styles.filterTag}>
              <Text style={styles.filterTagText}>{getCategoryName(homeFilterCategory)}</Text>
              <TouchableOpacity onPress={() => setHomeFilter(null, homeFilterSeason)}>
                <Icon name="close-circle" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          {homeFilterSeason && (
            <View style={styles.filterTag}>
              <Text style={styles.filterTagText}>{homeFilterSeason}季</Text>
              <TouchableOpacity onPress={() => setHomeFilter(homeFilterCategory, null)}>
                <Icon name="close-circle" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* ========== 默认模式 ========== */}
      {isDefaultMode && (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
          showsVerticalScrollIndicator={false}
        >
          {groupedData.length > 0 ? (
            groupedData.map(({ category, items }) => (
              <View key={category.id} style={styles.categorySection}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionTitle}>{category.name}</Text>
                    <View style={styles.sectionCountBadge}>
                      <Text style={styles.sectionCount}>{items.length}</Text>
                    </View>
                  </View>
                </View>
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
                          <Text style={styles.multiImageText}>{item.images.length}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="wardrobe-outline" size={72} color={COLORS.border} />
              <Text style={styles.emptyTitle}>衣橱空空如也</Text>
              <Text style={styles.emptySubtitle}>添加你的第一件衣物</Text>
              <TouchableOpacity
                style={styles.emptyAddButton}
                onPress={() => navigation.navigate('AddClothing')}
              >
                <Text style={styles.emptyAddButtonText}>+ 添加衣物</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* ========== 自主模式 ========== */}
      {isCustomMode && (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
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
              <Icon name="filter-outline" size={72} color={COLORS.border} />
              <Text style={styles.emptyTitle}>没有找到</Text>
              <Text style={styles.emptySubtitle}>试试调整筛选条件</Text>
              <TouchableOpacity
                style={styles.emptyAddButton}
                onPress={() => setHomeFilter(null, null)}
              >
                <Text style={styles.emptyAddButtonText}>清除筛选</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* 筛选弹窗 */}
      <Modal visible={showFilterModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <Text style={styles.filterModalTitle}>筛选条件</Text>

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

            <View style={styles.filterActions}>
              <TouchableOpacity style={styles.filterClearBtn} onPress={handleClearFilter}>
                <Text style={styles.filterClearBtnText}>清除</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterApplyBtn} onPress={handleApplyFilter}>
                <Text style={styles.filterApplyBtnText}>应用</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.filterCloseBtn} onPress={() => setShowFilterModal(false)}>
              <Text style={styles.filterCloseBtnText}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
    ...SHADOWS.card,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FONT_SIZES.sm,
  },
  // 模式切换
  modeSwitchRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: 4,
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.md,
    gap: 4,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    gap: 6,
  },
  modeBtnActive: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.card,
  },
  modeBtnText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  modeBtnTextActive: {
    color: '#fff',
  },
  // 工具栏（自主模式）
  toolbar: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  toolbarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignSelf: 'flex-start',
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
    backgroundColor: COLORS.primary + '12',
  },
  sortBtnText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  sortBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  // 筛选标签
  filterTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.card,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingLeft: SPACING.md,
    paddingRight: SPACING.xs,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  filterTagText: {
    fontSize: FONT_SIZES.xs,
    color: '#fff',
    fontWeight: '600',
  },
  // 滚动区域
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SPACING.md,
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
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionCountBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  sectionCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  cardsContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BORDER_RADIUS.md,
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
    backgroundColor: 'rgba(0,0,0,0.55)',
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
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  gridCard: {
    width: '47%',
    borderRadius: BORDER_RADIUS.md,
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
    marginBottom: 2,
  },
  gridCardMeta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  // 空状态
  emptyState: {
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
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
    ...SHADOWS.card,
  },
  emptyAddButtonText: {
    color: '#fff',
    fontWeight: '700',
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
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
  },
  filterModalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
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
    backgroundColor: COLORS.secondary,
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
    fontWeight: '500',
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
    fontWeight: '600',
  },
  filterApplyBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    ...SHADOWS.card,
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
    color: COLORS.textSecondary,
  },
});

export default HomeScreen;
