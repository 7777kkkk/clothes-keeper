import React from 'react';
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

const CARD_WIDTH = 90;
const CARD_HEIGHT = 120;
const VISIBLE_CARDS = 8;
const CARD_GAP = 8;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { clothingItems, categories } = useStore();

  // 按分类分组
  const groupedData = categories.map(cat => ({
    category: cat,
    items: clothingItems.filter(item => item.categoryId === cat.id),
  })).filter(group => group.items.length > 0);

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
                <TouchableOpacity style={styles.manageButton}>
                  <Text style={styles.manageIcon}>☰</Text>
                </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: SPACING.md,
  },
  // 单个分类模块
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
  manageButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manageIcon: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  // 横向卡片容器
  cardsContainer: {
    paddingHorizontal: SPACING.lg,
    gap: CARD_GAP,
  },
  // 单品卡片
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
});

export default HomeScreen;
