/**
 * HomeScreen — 衣橱首页（分类管理模式）
 *
 * 设计规范（遵循 impeccable Skill）:
 * - 玻璃拟态：亚克力半透明卡片 + 柔和蓝调阴影
 * - 布局节奏：大间距，分类模块间宽松，内容紧凑
 * - 交互反馈：所有可点击元素有 activeOpacity
 * - 空状态：友好引导，非空白
 */
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Modal, TextInput, FlatList,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { RootStackParamList, ClothingItem } from '../types';
import { GlassCard, GlassPill, FAB, SectionHeader, EmptyState, Badge } from '../components/glass/GlassComponents';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ============================================================
//  Types
// ============================================================
interface CategoryGroup {
  id: string;
  name: string;
  items: ClothingItem[];
  isEmpty: boolean;
}

// ============================================================
//  CategoryItemCard — 衣物缩略图卡片
// ============================================================
const CategoryItemCard = ({
  item,
  onPress,
}: {
  item: ClothingItem;
  onPress: () => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    style={styles.thumbCard}
  >
    <Image
      source={{ uri: item.images[0] }}
      style={styles.thumbImage}
      resizeMode="cover"
    />
    {item.images.length > 1 && (
      <View style={styles.thumbMultiBadge}>
        <Icon name="image-multiple" size={8} color="#fff" />
      </View>
    )}
    {item.wearCount > 0 && (
      <View style={styles.thumbWearBadge}>
        <Text style={styles.thumbWearText}>{item.wearCount}次</Text>
      </View>
    )}
  </TouchableOpacity>
);

// ============================================================
//  EmptyCategoryCard — 空分类引导卡片
// ============================================================
const EmptyCategoryCard = ({ onAdd }: { onAdd: () => void }) => (
  <TouchableOpacity activeOpacity={0.75} onPress={onAdd} style={styles.emptyThumb}>
    <Icon name="plus" size={28} color={COLORS.textMuted} />
    <Text style={styles.emptyThumbText}>添加</Text>
  </TouchableOpacity>
);

// ============================================================
//  CategorySection — 单个分类模块
// ============================================================
const CategorySection = ({
  group,
  onItemPress,
  onAddItem,
  onCategoryOptions,
}: {
  group: CategoryGroup;
  onItemPress: (id: string) => void;
  onAddItem: () => void;
  onCategoryOptions: () => void;
}) => (
  <View style={styles.categorySection}>
    {/* 分类标题行 */}
    <View style={styles.catHeaderRow}>
      <View style={styles.catTitleRow}>
        <Text style={styles.catTitle}>{group.name}</Text>
        {!group.isEmpty && (
          <View style={styles.catCountBadge}>
            <Text style={styles.catCountText}>{group.items.length}</Text>
          </View>
        )}
      </View>
      <View style={styles.catActions}>
        {/* 添加按钮 */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onAddItem}
          style={styles.catActionBtn}
        >
          <Icon name="plus" size={18} color={COLORS.primary} />
        </TouchableOpacity>
        {/* 操作菜单按钮 */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onCategoryOptions}
          style={styles.catActionBtn}
        >
          <Icon name="dots-horizontal" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>

    {/* 横向滚动衣物 */}
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.thumbsRow}
    >
      {group.isEmpty ? (
        <EmptyCategoryCard onAdd={onAddItem} />
      ) : (
        group.items.map(item => (
          <CategoryItemCard
            key={item.id}
            item={item}
            onPress={() => onItemPress(item.id)}
          />
        ))
      )}
    </ScrollView>
  </View>
);

// ============================================================
//  CategoryOptionsModal — 分类操作弹窗
// ============================================================
const CategoryOptionsModal = ({
  visible,
  categoryName,
  onClose,
  onEdit,
  onHide,
}: {
  visible: boolean;
  categoryName: string;
  onClose: () => void;
  onEdit: () => void;
  onHide: () => void;
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <TouchableOpacity
      style={styles.modalOverlay}
      activeOpacity={1}
      onPress={onClose}
    >
      <GlassCard style={styles.optionsModal} padding="lg">
        <Text style={styles.optionsTitle}>{categoryName}</Text>
        <TouchableOpacity style={styles.optionRow} onPress={onEdit}>
          <Icon name="pencil-outline" size={20} color={COLORS.textPrimary} />
          <Text style={styles.optionText}>编辑分类名称</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionRow} onPress={onHide}>
          <Icon name="eye-off-outline" size={20} color={COLORS.textPrimary} />
          <Text style={styles.optionText}>隐藏该分类</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.optionRow, styles.optionRowDestructive]} onPress={onClose}>
          <Icon name="close" size={20} color={COLORS.error} />
          <Text style={[styles.optionText, { color: COLORS.error }]}>取消</Text>
        </TouchableOpacity>
      </GlassCard>
    </TouchableOpacity>
  </Modal>
);

// ============================================================
//  SearchModal — 搜索弹窗
// ============================================================
const SearchModal = ({
  visible,
  onClose,
  items,
  onItemPress,
}: {
  visible: boolean;
  onClose: () => void;
  items: ClothingItem[];
  onItemPress: (id: string) => void;
}) => {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    return items.filter(i => i.name.toLowerCase().includes(query.toLowerCase()));
  }, [items, query]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.searchOverlay}>
        <GlassCard style={styles.searchCard} padding="none">
          <View style={styles.searchInputRow}>
            <Icon name="magnify" size={20} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="搜索衣物..."
              placeholderTextColor={COLORS.textMuted}
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.searchResults} showsVerticalScrollIndicator={false}>
            {filtered.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.searchResultItem}
                onPress={() => { onItemPress(item.id); onClose(); }}
              >
                <Image source={{ uri: item.images[0] }} style={styles.searchResultThumb} />
                <View style={styles.searchResultInfo}>
                  <Text style={styles.searchResultName}>{item.name}</Text>
                  <Text style={styles.searchResultMeta}>{item.wearCount}次</Text>
                </View>
              </TouchableOpacity>
            ))}
            {query && filtered.length === 0 && (
              <Text style={styles.searchEmpty}>没有找到匹配的衣物</Text>
            )}
          </ScrollView>
        </GlassCard>
      </View>
    </Modal>
  );
};

// ============================================================
//  HomeScreen — 主页面
// ============================================================
const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { clothingItems, categories, addClothingItem } = useStore();

  // 分类操作弹窗
  const [optionsModalCat, setOptionsModalCat] = useState<CategoryGroup | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);

  // 按分类分组
  const categoryGroups: CategoryGroup[] = useMemo(() =>
    categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      items: clothingItems.filter(i => i.categoryId === cat.id),
      isEmpty: clothingItems.filter(i => i.categoryId === cat.id).length === 0,
    })),
    [categories, clothingItems]
  );

  // 全部有衣物的分类（排在前面）
  const nonEmptyFirst = useMemo(() =>
    [...categoryGroups].sort((a, b) => {
      if (a.isEmpty && !b.isEmpty) return 1;
      if (!a.isEmpty && b.isEmpty) return -1;
      return 0;
    }),
    [categoryGroups]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ===== 顶部导航栏 ===== */}
      <View style={styles.topNav}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => setSearchVisible(true)}
          style={styles.topNavBtn}
        >
          <Icon name="magnify" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topNavTitle}>我的衣橱</Text>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => navigation.navigate('CategoryManage')}
          style={styles.topNavBtn}
        >
          <Icon name="playlist-edit" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* ===== 衣橱概览标签 ===== */}
      <View style={styles.overviewRow}>
        <GlassCard style={styles.overviewCard} padding="md">
          <Text style={styles.overviewNumber}>{clothingItems.length}</Text>
          <Text style={styles.overviewLabel}>单品总数</Text>
        </GlassCard>
        <GlassCard style={styles.overviewCard} padding="md">
          <Text style={styles.overviewNumber}>{categories.length}</Text>
          <Text style={styles.overviewLabel}>分类</Text>
        </GlassCard>
        <GlassCard style={styles.overviewCard} padding="md">
          <Text style={styles.overviewNumber}>
            {clothingItems.reduce((sum, i) => sum + (i.price || 0), 0) > 0
              ? `¥${clothingItems.reduce((sum, i) => sum + (i.price || 0), 0)}`
              : '—'}
          </Text>
          <Text style={styles.overviewLabel}>总价值</Text>
        </GlassCard>
      </View>

      {/* ===== 分类列表 ===== */}
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={[styles.mainContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {nonEmptyFirst.map(group => (
          <CategorySection
            key={group.id}
            group={group}
            onItemPress={id => navigation.navigate('ClothingDetail', { itemId: id })}
            onAddItem={() => navigation.navigate('AddClothing')}
            onCategoryOptions={() => setOptionsModalCat(group)}
          />
        ))}

        {categoryGroups.length === 0 && (
          <EmptyState
            icon="wardrobe-outline"
            title="还没有分类"
            subtitle="去设置中添加分类"
            actionLabel="管理分类"
            onAction={() => navigation.navigate('CategoryManage')}
          />
        )}
      </ScrollView>

      {/* ===== 右下角悬浮 FAB ===== */}
      <FAB
        icon="plus"
        onPress={() => navigation.navigate('AddClothing')}
        style={{ bottom: insets.bottom + 90 }}
      />

      {/* ===== 分类操作弹窗 ===== */}
      <CategoryOptionsModal
        visible={!!optionsModalCat}
        categoryName={optionsModalCat?.name || ''}
        onClose={() => setOptionsModalCat(null)}
        onEdit={() => {
          setOptionsModalCat(null);
          navigation.navigate('CategoryManage');
        }}
        onHide={() => setOptionsModalCat(null)}
      />

      {/* ===== 搜索弹窗 ===== */}
      <SearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        items={clothingItems}
        onItemPress={id => navigation.navigate('ClothingDetail', { itemId: id })}
      />
    </SafeAreaView>
  );
};

// ============================================================
//  Styles — 玻璃拟态 + 大圆角
// ============================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ---- 顶部导航 ----
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.glass,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  topNavTitle: {
    flex: 1,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  topNavBtn: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ---- 概览标签 ----
  overviewRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  overviewCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  overviewNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.primary,
  },
  overviewLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },

  // ---- 主滚动区 ----
  mainScroll: { flex: 1 },
  mainContent: { paddingTop: SPACING.md },

  // ---- 分类模块 ----
  categorySection: {
    marginBottom: SPACING.xxl,
  },
  catHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  catTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  catTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  catCountBadge: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catCountText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  catActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  catActionBtn: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(0,0,0,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ---- 缩略图 ----
  thumbsRow: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  thumbCard: {
    width: 88,
    height: 112,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.glass,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  thumbMultiBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  thumbWearBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: COLORS.primarySoft,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  thumbWearText: {
    fontSize: 9,
    color: COLORS.primary,
    fontWeight: '700',
  },

  // ---- 空缩略图 ----
  emptyThumb: {
    width: 88,
    height: 112,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  emptyThumbText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },

  // ---- 分类操作弹窗 ----
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsModal: {
    width: 280,
  },
  optionsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  optionRowDestructive: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.sm,
    paddingTop: SPACING.lg,
  },
  optionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },

  // ---- 搜索弹窗 ----
  searchOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-start',
    paddingTop: 120,
    alignItems: 'center',
  },
  searchCard: {
    width: '90%',
    maxHeight: '70%',
    overflow: 'hidden',
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  searchResults: {
    maxHeight: 360,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
  },
  searchResultThumb: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  searchResultMeta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  searchEmpty: {
    textAlign: 'center',
    paddingVertical: SPACING.xl,
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
  },
});

export default HomeScreen;
