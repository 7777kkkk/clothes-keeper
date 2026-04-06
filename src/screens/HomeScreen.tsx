import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const LEFT_PANEL_WIDTH = 80;
const RIGHT_PANEL_WIDTH = SCREEN_WIDTH - LEFT_PANEL_WIDTH;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { clothingItems, categories } = useStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    categories[0]?.id || null
  );

  // 按分类分组
  const groupedItems = categories.map(cat => ({
    category: cat,
    items: clothingItems.filter(item => item.categoryId === cat.id),
  }));

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const selectedItems = clothingItems.filter(item => item.categoryId === selectedCategoryId);

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

      {/* 主内容区：左侧分类 + 右侧图片网格 */}
      <View style={styles.mainContent}>
        {/* 左侧分类列表 */}
        <ScrollView style={styles.leftPanel}>
          {groupedItems.map(({ category, items }) => {
            const isSelected = selectedCategoryId === category.id;
            const isEmpty = items.length === 0;
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  isSelected && styles.categoryItemSelected,
                ]}
                onPress={() => setSelectedCategoryId(category.id)}
                disabled={isEmpty}
              >
                <Text
                  style={[
                    styles.categoryIcon,
                    isEmpty && styles.categoryIconEmpty,
                  ]}
                >
                  {isEmpty ? '📭' : '👔'}
                </Text>
                <Text
                  style={[
                    styles.categoryName,
                    isSelected && styles.categoryNameSelected,
                    isEmpty && styles.categoryNameEmpty,
                  ]}
                  numberOfLines={2}
                >
                  {category.name}
                </Text>
                {!isEmpty && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{items.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 右侧图片网格 */}
        <View style={styles.rightPanel}>
          {/* 分类标题 */}
          <View style={styles.rightHeader}>
            <Text style={styles.rightTitle}>
              {selectedCategory?.name || '全部'}
            </Text>
            <Text style={styles.rightCount}>
              {selectedItems.length} 件
            </Text>
          </View>

          {/* 图片网格 */}
          {selectedItems.length > 0 ? (
            <ScrollView contentContainerStyle={styles.imageGrid}>
              {selectedItems.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.imageCard}
                  onPress={() =>
                    navigation.navigate('ClothingDetail', { itemId: item.id })
                  }
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: item.images[0] }}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                  {item.images.length > 1 && (
                    <View style={styles.imageCountBadge}>
                      <Text style={styles.imageCountText}>
                        {item.images.length}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>👔</Text>
              <Text style={styles.emptyText}>暂无{selectedCategory?.name || '衣物'}</Text>
              <TouchableOpacity
                style={styles.emptyAddButton}
                onPress={() => navigation.navigate('AddClothing')}
              >
                <Text style={styles.emptyAddButtonText}>+ 添加第一件</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
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
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  // 左侧分类
  leftPanel: {
    width: LEFT_PANEL_WIDTH,
    backgroundColor: COLORS.card,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  categoryItem: {
    width: LEFT_PANEL_WIDTH,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryItemSelected: {
    backgroundColor: COLORS.primary + '10',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  categoryIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  categoryIconEmpty: {
    opacity: 0.4,
  },
  categoryName: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  categoryNameSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  categoryNameEmpty: {
    color: COLORS.textSecondary,
    opacity: 0.4,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // 右侧图片网格
  rightPanel: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  rightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rightTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  rightCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  imageCard: {
    width: (RIGHT_PANEL_WIDTH - SPACING.lg * 2 - SPACING.sm * 2) / 3,
    aspectRatio: 0.75,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    backgroundColor: COLORS.secondary,
    ...SHADOWS.card,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  imageCountBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  imageCountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
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
    fontSize: FONT_SIZES.sm,
  },
});

export default HomeScreen;
